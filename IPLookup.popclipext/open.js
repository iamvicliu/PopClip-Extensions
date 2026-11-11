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

const selected = popclip.input.matchedText || popclip.input.text;
for (const token of extractTokens(selected)) {
  if (isValidIPv4(token) || isValidIPv6(token)) {
    popclip.openUrl(`https://ipinfo.io/${token}`);
    break;
  }
}
