const axios = require("axios");

function normalizeInput(text) {
  const trimmed = (text || "").trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function isHexGroup(part) {
  return /^[0-9A-Fa-f]{1,4}$/.test(part);
}

function isValidIPv4(input) {
  const parts = input.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => /^(0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255);
}

function validateIpv6Side(parts, allowIpv4Tail) {
  if (parts.length === 1 && parts[0] === "") {
    return { valid: true, groups: 0 };
  }

  let groups = 0;
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (part === "") {
      return { valid: false, groups: 0 };
    }
    const isLast = i === parts.length - 1;
    if (allowIpv4Tail && isLast && part.includes(".")) {
      if (!isValidIPv4(part)) {
        return { valid: false, groups: 0 };
      }
      groups += 2;
      continue;
    }
    if (!isHexGroup(part)) {
      return { valid: false, groups: 0 };
    }
    groups += 1;
  }

  return { valid: true, groups };
}

function isValidIPv6(input) {
  if (!input.includes(":")) return false;
  if (input.includes(":::")) return false;

  const doubleColonParts = input.split("::");
  if (doubleColonParts.length > 2) return false;

  if (doubleColonParts.length === 1) {
    const parts = input.split(":");
    const parsed = validateIpv6Side(parts, true);
    return parsed.valid && parsed.groups === 8;
  }

  const [leftRaw, rightRaw] = doubleColonParts;
  const leftParts = leftRaw === "" ? [""] : leftRaw.split(":");
  const rightParts = rightRaw === "" ? [""] : rightRaw.split(":");

  const leftParsed = validateIpv6Side(leftParts, false);
  if (!leftParsed.valid) return false;

  const rightParsed = validateIpv6Side(rightParts, true);
  if (!rightParsed.valid) return false;

  return leftParsed.groups + rightParsed.groups < 8;
}

function requireValidIp(input) {
  if (isValidIPv4(input) || isValidIPv6(input)) {
    return input;
  }
  throw new Error("Selected text is not a valid IPv4 or IPv6 address.");
}

function formatField(label, value) {
  return value ? `${label}: ${value}` : null;
}

const selected = popclip.input.matchedText || popclip.input.text;
const ip = requireValidIp(normalizeInput(selected));

const response = await axios.get(`https://api.ip.sb/geoip/${encodeURIComponent(ip)}`, {
  timeout: 8000,
});
const data = response.data || {};

const location = [data.country, data.region, data.city].filter(Boolean).join(" / ");
const lines = [
  formatField("IP", data.ip || ip),
  formatField("位置", location),
  formatField("ASN", data.asn),
  formatField("组织", data.organization),
].filter(Boolean);

if (lines.length === 0) {
  throw new Error("查询接口没有返回可显示的 IP 信息。");
}

return lines.join(" | ");
