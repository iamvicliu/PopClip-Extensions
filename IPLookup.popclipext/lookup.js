const axios = require("axios");

const MAX_TARGETS = 8;
const TIMEOUT_MS = 6000;
const RDAP_TIMEOUT_MS = 3500;

// 常见文件扩展名黑名单（当未带 http/https 协议头时排除纯文件名误触）
const FILE_EXT_BLACKLIST = new Set([
  "js", "ts", "jsx", "tsx", "py", "sh", "zsh", "bash", "rb", "php", "java", "kt", "swift",
  "c", "cpp", "h", "hpp", "cs", "rs", "lua", "sql", "json", "yaml", "yml", "toml", "xml",
  "html", "htm", "css", "scss", "less", "md", "txt", "log", "csv", "tsv", "ini", "conf",
  "cfg", "env", "lock", "png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "pdf", "doc",
  "docx", "xls", "xlsx", "ppt", "pptx", "zip", "tar", "gz", "tgz", "7z", "rar", "dmg",
  "pkg", "mp3", "mp4", "mov", "avi", "mkv", "wav", "flac", "wasm", "map", "vue", "svelte",
]);

const SECOND_LEVEL_TLDS = new Set([
  "com.cn", "net.cn", "org.cn", "gov.cn", "edu.cn", "ac.cn",
  "co.uk", "org.uk", "me.uk", "ac.uk", "gov.uk",
  "co.jp", "ne.jp", "or.jp", "ac.jp", "go.jp",
  "com.hk", "edu.hk", "gov.hk", "net.hk", "org.hk",
  "com.tw", "org.tw", "edu.tw", "gov.tw", "net.tw",
  "com.au", "net.au", "org.au", "edu.au", "gov.au",
  "com.sg", "edu.sg", "gov.sg", "net.sg", "org.sg",
  "co.kr", "ne.kr", "or.kr", "ac.kr", "go.kr",
  "com.br", "com.mx", "com.tr", "co.in", "co.nz", "co.za",
]);

function extractRawTokens(text) {
  return String(text || "")
    .replace(/[,;]/g, " ")
    .split(/\s+/)
    .map((chunk) => chunk.trim().replace(/^[("'«‹<]+|[)"'»›>。，、！？；：]+$/g, ""))
    .filter(Boolean);
}

function stripUrlAndPort(rawToken) {
  let t = rawToken;
  let hasScheme = false;
  if (/^https?:\/\//i.test(t)) {
    hasScheme = true;
    t = t.replace(/^https?:\/\//i, "");
  }
  const slashIdx = t.search(/[/?#]/);
  if (slashIdx !== -1) {
    t = t.slice(0, slashIdx);
  }
  if (t.includes("@")) {
    t = t.slice(t.lastIndexOf("@") + 1);
  }
  if (t.startsWith("[") && t.includes("]")) {
    t = t.slice(1, t.indexOf("]"));
  } else if (t.includes(":") && t.indexOf(":") === t.lastIndexOf(":")) {
    const idx = t.lastIndexOf(":");
    const host = t.slice(0, idx);
    const port = t.slice(idx + 1);
    if (/^\d+$/.test(port)) {
      t = host;
    }
  }
  return { host: t.replace(/\.$/, ""), hasScheme };
}

function parseIPv4Octets(input) {
  const parts = input.split(".");
  if (parts.length !== 4) return null;
  const octets = [];
  for (let i = 0; i < 4; i += 1) {
    const part = parts[i];
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    octets.push(n);
  }
  return octets;
}

function expandIPv6Groups(input) {
  if (!input.includes(":") || input.includes(":::")) return null;
  const doubleColonParts = input.split("::");
  if (doubleColonParts.length > 2) return null;

  function parseSide(raw, allowIpv4Tail) {
    if (raw === "") return [];
    const parts = raw.split(":");
    const groups = [];
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (!part) return null;
      const isLast = i === parts.length - 1;
      if (allowIpv4Tail && isLast && part.includes(".")) {
        const octets = parseIPv4Octets(part);
        if (!octets) return null;
        groups.push((octets[0] << 8) | octets[1]);
        groups.push((octets[2] << 8) | octets[3]);
      } else {
        if (!/^[0-9A-Fa-f]{1,4}$/.test(part)) return null;
        groups.push(parseInt(part, 16));
      }
    }
    return groups;
  }

  if (doubleColonParts.length === 1) {
    const groups = parseSide(input, true);
    return groups && groups.length === 8 ? groups : null;
  }

  const left = parseSide(doubleColonParts[0], false);
  const right = parseSide(doubleColonParts[1], true);
  if (!left || !right) return null;
  const missing = 8 - (left.length + right.length);
  if (missing < 1) return null;
  return [...left, ...new Array(missing).fill(0), ...right];
}

function isValidDomain(host, hasScheme) {
  if (!host || host.length > 253 || !host.includes(".")) return false;
  const labels = host.toLowerCase().split(".");
  if (labels.length < 2) return false;
  for (const label of labels) {
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) return false;
  }
  const tld = labels[labels.length - 1];
  if (!/^(?:xn--[a-z0-9]+|[a-z]{2,24})$/.test(tld)) return false;
  if (!hasScheme && FILE_EXT_BLACKLIST.has(tld)) return false;
  return true;
}

function getRegistrableDomain(domain) {
  const labels = domain.toLowerCase().split(".");
  if (labels.length <= 2) return domain.toLowerCase();
  const lastTwo = `${labels[labels.length - 2]}.${labels[labels.length - 1]}`;
  if (SECOND_LEVEL_TLDS.has(lastTwo) && labels.length >= 3) {
    return `${labels[labels.length - 3]}.${lastTwo}`;
  }
  return lastTwo;
}

function parseTargets(text) {
  const out = [];
  const seen = new Set();
  for (const raw of extractRawTokens(text)) {
    const { host, hasScheme } = stripUrlAndPort(raw);
    if (!host) continue;

    const v4 = parseIPv4Octets(host);
    if (v4) {
      const canonical = v4.join(".");
      if (!seen.has(canonical)) {
        seen.add(canonical);
        out.push({ kind: "ip", version: 4, text: canonical, octets: v4 });
      }
    } else {
      const v6 = expandIPv6Groups(host);
      if (v6) {
        const canonical = v6.map((g) => g.toString(16)).join(":");
        if (!seen.has(canonical)) {
          seen.add(canonical);
          out.push({ kind: "ip", version: 6, text: host.toLowerCase(), groups: v6 });
        }
      } else if (isValidDomain(host, hasScheme)) {
        const lower = host.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          out.push({ kind: "domain", text: lower, rootDomain: getRegistrableDomain(lower) });
        }
      }
    }
    if (out.length >= MAX_TARGETS) break;
  }
  return out;
}

function classifyIPv4(o) {
  const [a, b, c] = o;
  if (a === 10) return "私有地址 (10/8)";
  if (a === 172 && b >= 16 && b <= 31) return "私有地址 (172.16/12)";
  if (a === 192 && b === 168) return "私有地址 (192.168/16)";
  if (a === 127) return "本机回环 (127/8)";
  if (a === 169 && b === 254) return "链路本地 (169.254/16)";
  if (a === 100 && b >= 64 && b <= 127) return "CGNAT / Tailscale (100.64/10)";
  if (a === 192 && b === 0 && c === 2) return "文档示例地址 (192.0.2/24)";
  if (a === 198 && b === 51 && c === 100) return "文档示例地址 (198.51.100/24)";
  if (a === 203 && b === 0 && c === 113) return "文档示例地址 (203.0.113/24)";
  if (a === 198 && (b === 18 || b === 19)) return "基准测试地址 (198.18/15)";
  if (a === 0) return "保留段 (0/8)";
  if (a >= 224 && a <= 239) return "组播 (224/4)";
  if (a >= 240) return "保留段 (240/4)";
  return null;
}

function classifyIPv6(g) {
  const isZeroPrefix5 = g[0] === 0 && g[1] === 0 && g[2] === 0 && g[3] === 0 && g[4] === 0;
  if (isZeroPrefix5 && g[5] === 0xffff) {
    const octets = [g[6] >> 8, g[6] & 0xff, g[7] >> 8, g[7] & 0xff];
    const mappedLabel = classifyIPv4(octets);
    if (mappedLabel) return mappedLabel;
  }
  if (isZeroPrefix5 && g[5] === 0 && g[6] === 0 && g[7] === 1) {
    return "本机回环 (::1)";
  }
  if (isZeroPrefix5 && g[5] === 0 && g[6] === 0 && g[7] === 0) {
    return "未指定地址 (::)";
  }
  if ((g[0] & 0xffc0) === 0xfe80) {
    return "链路本地 (fe80::/10)";
  }
  if ((g[0] & 0xfe00) === 0xfc00) {
    return "唯一本地地址 (fc00::/7)";
  }
  if (g[0] === 0x2001 && g[1] === 0x0db8) {
    return "文档示例地址 (2001:db8::/32)";
  }
  if ((g[0] & 0xff00) === 0xff00) {
    return "组播 (ff00::/8)";
  }
  return null;
}

async function fetchGeoIp(ipText) {
  try {
    const res = await axios.get(`https://api.ip.sb/geoip/${ipText}`, {
      timeout: TIMEOUT_MS,
    });
    if (res.data && (res.data.country || res.data.asn || res.data.organization)) {
      return res.data;
    }
  } catch {}
  return null;
}

function formatGeoSummary(d, isSingle) {
  if (!d) return "";
  const locParts = [d.country, isSingle ? d.region : "", d.city].filter(Boolean);
  const dedupLoc = locParts.filter((v, idx) => idx === 0 || v !== locParts[idx - 1]);
  const loc = dedupLoc.join(" ");
  const asnOrg = [d.asn ? `AS${d.asn}` : "", d.organization].filter(Boolean).join(" ");
  return [loc, asnOrg].filter(Boolean).join(" · ");
}

async function resolveDnsViaAliDoh(domain) {
  for (const qtype of [1, 28]) {
    try {
      const res = await axios.get(
        `https://dns.alidns.com/resolve?name=${encodeURIComponent(domain)}&type=${qtype}`,
        { timeout: TIMEOUT_MS }
      );
      const answers = (res.data && Array.isArray(res.data.Answer) && res.data.Answer) || [];
      let ip = "";
      let cname = "";
      for (const ans of answers) {
        if (ans.type === 5 && !cname && ans.data) {
          cname = String(ans.data).replace(/\.$/, "");
        } else if ((ans.type === 1 || ans.type === 28) && !ip && ans.data) {
          ip = String(ans.data).trim();
        }
      }
      if (ip) return { ip, cname };
    } catch {}
  }
  return { ip: "", cname: "" };
}

async function fetchRdapExpiry(rootDomain) {
  try {
    const res = await axios.get(`https://rdap.org/domain/${encodeURIComponent(rootDomain)}`, {
      timeout: RDAP_TIMEOUT_MS,
    });
    const events = (res.data && Array.isArray(res.data.events) && res.data.events) || [];
    for (const ev of events) {
      if (ev && ev.eventAction === "expiration" && ev.eventDate) {
        return String(ev.eventDate).slice(0, 10);
      }
    }
  } catch {}
  return "";
}

async function lookupTarget(item, isSingle) {
  if (item.kind === "ip") {
    const privateLabel = item.version === 4 ? classifyIPv4(item.octets) : classifyIPv6(item.groups);
    if (privateLabel) {
      return `${item.text} · ${privateLabel}`;
    }
    const geo = await fetchGeoIp(item.text);
    const summary = formatGeoSummary(geo, isSingle);
    return summary ? `${item.text} · ${summary}` : `${item.text} · 未查到公网记录`;
  }

  // Domain lookup
  const tld = item.text.split(".").pop();
  if (["local", "lan", "internal", "localhost", "home", "arpa"].includes(tld)) {
    return `${item.text} · 本地/内网域名`;
  }

  const [dnsInfo, expiry] = await Promise.all([
    resolveDnsViaAliDoh(item.text),
    fetchRdapExpiry(item.rootDomain),
  ]);

  const parts = [item.text];
  if (dnsInfo.ip) {
    parts.push(dnsInfo.ip);
    const v4 = parseIPv4Octets(dnsInfo.ip);
    const v6 = v4 ? null : expandIPv6Groups(dnsInfo.ip);
    const privateLabel = v4 ? classifyIPv4(v4) : v6 ? classifyIPv6(v6) : null;
    if (privateLabel) {
      parts.push(privateLabel);
    } else {
      const geo = await fetchGeoIp(dnsInfo.ip);
      const summary = formatGeoSummary(geo, isSingle);
      if (summary) parts.push(summary);
    }
  } else {
    parts.push("未解析到 A/AAAA 记录");
  }

  if (isSingle && dnsInfo.cname && dnsInfo.cname.toLowerCase() !== item.text) {
    parts.push(`CNAME ${dnsInfo.cname}`);
  }
  if (expiry) {
    parts.push(`到期 ${expiry}`);
  }

  return parts.join(" · ");
}

const selected = popclip.input.matchedText || popclip.input.text || "";
const targets = parseTargets(selected);

if (targets.length === 0) {
  return "IP / 域名查询: 未在选中内容中识别到有效的 IPv4、IPv6 或域名。";
}

const isSingle = targets.length === 1;
const results = await Promise.all(targets.map((item) => lookupTarget(item, isSingle)));

return results.join("  |  ");
