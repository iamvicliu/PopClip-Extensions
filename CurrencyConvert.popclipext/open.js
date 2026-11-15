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
  /(?:(?<![A-Za-z0-9])(US\$|HK\$|NT\$|CA\$|A\$|S\$|NZ\$|CHF|RM|[\$€£¥￥₩₹₽฿₫₱])\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(万|亿|[kKmMbB])?(?:\s*(USD|CNY|RMB|HKD|TWD|JPY|EUR|GBP|SGD|KRW|AUD|CAD|CHF|NZD|MYR|THB|VND|PHP|IDR|INR|RUB|AED|SAR|TRY|BRL|MXN|美元|美金|人民币|港币|港元|台币|新台币|日元|日圆|円|欧元|英镑|新币|韩元|韩币|澳元|加元|瑞郎|泰铢))?|(?<!\d)(\d+(?:,\d{3})*(?:\.\d+)?)\s*(万|亿|[kKmMbB])?\s*(?:(USD|CNY|RMB|HKD|TWD|JPY|EUR|GBP|SGD|KRW|AUD|CAD|CHF|NZD|MYR|THB|VND|PHP|IDR|INR|RUB|AED|SAR|TRY|BRL|MXN|BTC|ETH|SOL|BNB|XRP|DOGE|ADA|TON|TRX|AVAX|DOT|LINK|LTC|BCH|SHIB|SUI|PEPE|USDT|USDC)\b|(美元|美金|人民币|元|港币|港元|台币|新台币|日元|日圆|円|欧元|英镑|新币|新加坡元|韩元|韩币|澳元|澳币|加元|加币|瑞士法郎|瑞郎|马币|林吉特|泰铢|越南盾|卢布|卢比|迪拉姆)))/i;

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

const rawInput = popclip.input.text || popclip.input.matchedText || "";
const m = CURRENCY_PATTERN.exec(rawInput);
const code = m ? resolveCurrencyCode(m[1], m[1] ? m[4] : m[7] || m[8]) : "USD";
const target = code === "CNY" ? "USD" : "CNY";
popclip.openUrl(`https://www.google.com/finance/quote/${encodeURIComponent(code)}-${encodeURIComponent(target)}`);
