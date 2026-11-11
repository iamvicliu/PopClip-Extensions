const axios = require("axios");

const MAX_IPS = 10;
const TIMEOUT_MS = 8000;

function extractTokens(text) {
  return String(text || "")
    .replace(/[,;]/g, " ")
    .split(/\s+/)
    .map((chunk) => {
      let t = chunk.trim();
      if (!t) return "";
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
      return t;
    })
    .filter(Boolean);
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

function parseUniqueIps(text) {
  const out = [];
  const seen = new Set();
  for (const token of extractTokens(text)) {
    const v4 = parseIPv4Octets(token);
    if (v4) {
      const canonical = v4.join(".");
      if (!seen.has(canonical)) {
        seen.add(canonical);
        out.push({ version: 4, text: canonical, octets: v4 });
      }
    } else {
      const v6 = expandIPv6Groups(token);
      if (v6) {
        const canonical = v6.map((g) => g.toString(16)).join(":");
        if (!seen.has(canonical)) {
          seen.add(canonical);
          out.push({ version: 6, text: token.toLowerCase(), groups: v6 });
        }
      }
    }
    if (out.length >= MAX_IPS) break;
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

const selected = popclip.input.matchedText || popclip.input.text;
const ips = parseUniqueIps(selected);

if (ips.length === 0) {
  return "IP Lookup: 选中的内容里没有合法的 IPv4 / IPv6 地址。";
}

const lines = [];
for (const item of ips) {
  const label = item.version === 4 ? classifyIPv4(item.octets) : classifyIPv6(item.groups);
  if (label) {
    lines.push(`${item.text} | ${label} | 本地判断，未联网`);
    continue;
  }
  try {
    const response = await axios.get(`https://api.ip.sb/geoip/${item.text}`, {
      timeout: TIMEOUT_MS,
      headers: { "User-Agent": "PopClip-IPLookup/3" },
    });
    const d = response.data || {};
    const loc = [d.country, d.region, d.city].filter(Boolean).join(" / ");
    const parts = [];
    if (loc) parts.push(`位置: ${loc}`);
    if (d.asn) parts.push(`ASN: ${d.asn}`);
    if (d.organization) parts.push(`组织: ${d.organization}`);
    if (d.ip && String(d.ip).toLowerCase() !== item.text.toLowerCase()) {
      parts.push(`IP: ${d.ip}`);
    }
    lines.push(`${item.text} | ${parts.length > 0 ? parts.join(" | ") : "接口未返回信息"}`);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    lines.push(`${item.text} | 查询失败: ${msg}`);
  }
}

return lines.join("\n");
