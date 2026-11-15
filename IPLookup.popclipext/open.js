const FILE_EXT_BLACKLIST = new Set([
  "js", "ts", "jsx", "tsx", "py", "sh", "zsh", "bash", "rb", "php", "java", "kt", "swift",
  "c", "cpp", "h", "hpp", "cs", "rs", "lua", "sql", "json", "yaml", "yml", "toml", "xml",
  "html", "htm", "css", "scss", "less", "md", "txt", "log", "csv", "tsv", "ini", "conf",
  "cfg", "env", "lock", "png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "pdf", "doc",
  "docx", "xls", "xlsx", "ppt", "pptx", "zip", "tar", "gz", "tgz", "7z", "rar", "dmg",
  "pkg", "mp3", "mp4", "mov", "avi", "mkv", "wav", "flac", "wasm", "map", "vue", "svelte",
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

function isValidIPv4(input) {
  const parts = input.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => /^(0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255);
}

function isValidIPv6(input) {
  if (!input.includes(":") || input.includes(":::")) return false;
  const doubleColonParts = input.split("::");
  if (doubleColonParts.length > 2) return false;

  function countSide(raw, allowIpv4Tail) {
    if (raw === "") return 0;
    const parts = raw.split(":");
    let groups = 0;
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (!part) return -1;
      const isLast = i === parts.length - 1;
      if (allowIpv4Tail && isLast && part.includes(".")) {
        if (!isValidIPv4(part)) return -1;
        groups += 2;
      } else {
        if (!/^[0-9A-Fa-f]{1,4}$/.test(part)) return -1;
        groups += 1;
      }
    }
    return groups;
  }

  if (doubleColonParts.length === 1) {
    return countSide(input, true) === 8;
  }
  const left = countSide(doubleColonParts[0], false);
  const right = countSide(doubleColonParts[1], true);
  return left >= 0 && right >= 0 && left + right < 8;
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

const selected = popclip.input.matchedText || popclip.input.text || "";
for (const raw of extractRawTokens(selected)) {
  const { host, hasScheme } = stripUrlAndPort(raw);
  if (!host) continue;
  if (isValidIPv4(host) || isValidIPv6(host)) {
    popclip.openUrl(`https://ipinfo.io/${host}`);
    break;
  }
  if (isValidDomain(host, hasScheme)) {
    popclip.openUrl(`https://ipinfo.io/${host.toLowerCase()}`);
    break;
  }
}
