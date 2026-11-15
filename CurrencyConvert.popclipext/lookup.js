const axios = require("axios");

const MAX_ITEMS = 6;
const TIMEOUT_MS = 6000;

const PREFIX_SYMBOL_MAP = {
  "us$": "USD",
  "$": "USD",
  "hk$": "HKD",
  "nt$": "TWD",
  "ca$": "CAD",
  "a$": "AUD",
  "s$": "SGD",
  "nz$": "NZD",
  "chf": "CHF",
  "rm": "MYR",
  "€": "EUR",
  "£": "GBP",
  "¥": "CNY",
  "￥": "CNY",
  "₩": "KRW",
  "₹": "INR",
  "₽": "RUB",
  "฿": "THB",
  "₫": "VND",
  "₱": "PHP",
};

const SUFFIX_WORD_MAP = {
  "美元": "USD", "美金": "USD",
  "人民币": "CNY", "元": "CNY", "rmb": "CNY",
  "港币": "HKD", "港元": "HKD",
  "台币": "TWD", "新台币": "TWD",
  "日元": "JPY", "日圆": "JPY", "円": "JPY",
  "欧元": "EUR",
  "英镑": "GBP",
  "新币": "SGD", "新加坡元": "SGD",
  "韩元": "KRW", "韩币": "KRW",
  "澳元": "AUD", "澳币": "AUD",
  "加元": "CAD", "加币": "CAD",
  "瑞士法郎": "CHF", "瑞郎": "CHF",
  "马币": "MYR", "林吉特": "MYR",
  "泰铢": "THB",
  "越南盾": "VND",
  "卢布": "RUB",
  "卢比": "INR",
  "迪拉姆": "AED",
};

const CURRENCY_PATTERN =
  /(?:(?<![A-Za-z0-9])(US\$|HK\$|NT\$|CA\$|A\$|S\$|NZ\$|CHF|RM|[\$€£¥￥₩₹₽฿₫₱])\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(万|亿|[kKmMbB])?(?:\s*(USD|CNY|RMB|HKD|TWD|JPY|EUR|GBP|SGD|KRW|AUD|CAD|CHF|NZD|MYR|THB|VND|PHP|IDR|INR|RUB|AED|SAR|TRY|BRL|MXN|美元|美金|人民币|港币|港元|台币|新台币|日元|日圆|円|欧元|英镑|新币|韩元|韩币|澳元|加元|瑞郎|泰铢))?|(?<!\d)(\d+(?:,\d{3})*(?:\.\d+)?)\s*(万|亿|[kKmMbB])?\s*(?:(USD|CNY|RMB|HKD|TWD|JPY|EUR|GBP|SGD|KRW|AUD|CAD|CHF|NZD|MYR|THB|VND|PHP|IDR|INR|RUB|AED|SAR|TRY|BRL|MXN|BTC|ETH|SOL|BNB|XRP|DOGE|ADA|TON|TRX|AVAX|DOT|LINK|LTC|BCH|SHIB|SUI|PEPE|USDT|USDC)\b|(美元|美金|人民币|元|港币|港元|台币|新台币|日元|日圆|円|欧元|英镑|新币|新加坡元|韩元|韩币|澳元|澳币|加元|加币|瑞士法郎|瑞郎|马币|林吉特|泰铢|越南盾|卢布|卢比|迪拉姆)))/gi;

function parseMultiplier(unit) {
  if (!unit) return 1;
  const u = unit.toLowerCase();
  if (u === "万") return 1e4;
  if (u === "亿") return 1e8;
  if (u === "k") return 1e3;
  if (u === "m") return 1e6;
  if (u === "b") return 1e9;
  return 1;
}

function resolveCurrencyCode(prefix, suffixToken) {
  if (suffixToken) {
    const lower = suffixToken.toLowerCase();
    if (SUFFIX_WORD_MAP[lower]) return SUFFIX_WORD_MAP[lower];
    return suffixToken.toUpperCase();
  }
  if (prefix) {
    return PREFIX_SYMBOL_MAP[prefix.toLowerCase()] || "USD";
  }
  return "USD";
}

function extractAmounts(text) {
  const out = [];
  CURRENCY_PATTERN.lastIndex = 0;
  let m;
  while ((m = CURRENCY_PATTERN.exec(String(text || ""))) !== null) {
    const isPrefixed = Boolean(m[1]);
    const rawNum = isPrefixed ? m[2] : m[5];
    const multUnit = isPrefixed ? m[3] : m[6];
    const suffix = isPrefixed ? m[4] : m[7] || m[8];
    const baseVal = parseFloat(String(rawNum).replace(/,/g, ""));
    if (!Number.isFinite(baseVal) || baseVal <= 0) continue;

    const amount = baseVal * parseMultiplier(multUnit);
    const code = resolveCurrencyCode(m[1], suffix);
    out.push({ amount, code });
    if (out.length >= MAX_ITEMS) break;
  }
  return out;
}

function formatMoney(val, digits = 2) {
  if (!Number.isFinite(val)) return "-";
  const abs = Math.abs(val);
  let d = digits;
  if (abs >= 1000 && d > 2) d = 2;
  else if (abs > 0 && abs < 0.01) d = 6;
  else if (abs > 0 && abs < 1) d = 4;
  return val.toLocaleString("en-US", {
    minimumFractionDigits: d === 0 ? 0 : Math.min(2, d),
    maximumFractionDigits: d,
  });
}

async function fetchUsdRates() {
  // 主源：Coinbase V2 汇率接口（单次返回全球法币 + 主流加密货币实时汇率）
  try {
    const res = await axios.get("https://api.coinbase.com/v2/exchange-rates?currency=USD", {
      timeout: TIMEOUT_MS,
    });
    const rates = res.data && res.data.data && res.data.data.rates;
    if (rates && rates.CNY) {
      const out = { USD: 1 };
      for (const [k, v] of Object.entries(rates)) {
        const num = Number(v);
        if (num > 0) out[k.toUpperCase()] = num;
      }
      return out;
    }
  } catch {}

  // 备源：ExchangeRate-API
  try {
    const res = await axios.get("https://open.er-api.com/v6/latest/USD", {
      timeout: TIMEOUT_MS,
    });
    if (res.data && res.data.rates && res.data.rates.CNY) {
      return res.data.rates;
    }
  } catch {}

  return null;
}

function formatSourceAmount(val) {
  if (Number.isInteger(val)) {
    return val.toLocaleString("en-US");
  }
  return formatMoney(val, 4);
}

function formatSingleConversion(item, rates, isSingle) {
  const rateFromUsd = rates[item.code];
  if (!rateFromUsd) {
    return `${formatSourceAmount(item.amount)} ${item.code} · 暂不支持该币种`;
  }

  const usdVal = item.amount / rateFromUsd;
  const cnyRate = rates.CNY || 7.2;
  const hkdRate = rates.HKD || 7.8;
  const jpyRate = rates.JPY || 155;

  const cnyVal = usdVal * cnyRate;
  const hkdVal = usdVal * hkdRate;
  const jpyVal = usdVal * jpyRate;

  const srcText = `${formatSourceAmount(item.amount)} ${item.code}`;

  if (item.code === "CNY") {
    if (isSingle) {
      return `${srcText} ≈ $${formatMoney(usdVal)} USD · HK$${formatMoney(hkdVal)} HKD · ¥${formatMoney(jpyVal, 0)} JPY`;
    }
    return `${srcText} ≈ $${formatMoney(usdVal)} USD`;
  }

  if (item.code === "USD" || item.code === "USDT" || item.code === "USDC") {
    if (isSingle) {
      return `${srcText} ≈ ¥${formatMoney(cnyVal)} CNY · HK$${formatMoney(hkdVal)} HKD · 汇率 ${(cnyRate / rateFromUsd).toFixed(4)}`;
    }
    return `${srcText} ≈ ¥${formatMoney(cnyVal)} CNY`;
  }

  if (isSingle) {
    return `${srcText} ≈ ¥${formatMoney(cnyVal)} CNY · $${formatMoney(usdVal)} USD`;
  }
  return `${srcText} ≈ ¥${formatMoney(cnyVal)} CNY ($${formatMoney(usdVal)})`;
}

const rawInput = popclip.input.text || popclip.input.matchedText || "";
const items = extractAmounts(rawInput);

if (items.length === 0) {
  return "汇率换算: 未识别到有效的金额与币种。";
}

const rates = await fetchUsdRates();
if (!rates) {
  return "汇率换算: 无法获取实时汇率，请检查网络连接。";
}

const isSingle = items.length === 1;
const parts = items.map((item) => formatSingleConversion(item, rates, isSingle));

if (items.length > 1) {
  let totalUsd = 0;
  let validCount = 0;
  for (const item of items) {
    const r = rates[item.code];
    if (r) {
      totalUsd += item.amount / r;
      validCount += 1;
    }
  }
  if (validCount > 1) {
    const totalCny = totalUsd * (rates.CNY || 7.2);
    parts.push(`合计 ≈ ¥${formatMoney(totalCny)} CNY · $${formatMoney(totalUsd)} USD`);
  }
}

return parts.join("  |  ");
