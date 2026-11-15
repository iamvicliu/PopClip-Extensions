const PHONE_PATTERN =
  /(?:(?<![\d+])(\+[1-9]\d{0,2}(?: ?[\-—–()] ?| )?\d(?:(?: ?[\-—–()] ?| )?\d){5,13})|(?<!\d)(?:(00[1-9]\d{0,2}(?: ?[\-—–()] ?| )?\d(?:(?: ?[\-—–()] ?| )?\d){5,13})|(?:86[ \-—–]+)?(1[3-9]\d(?:[ \-—–]*\d){8})|\(?(0(?:10|2\d|[3-9]\d{2}))\)?[ \-—–]*(\d{3,4}[ \-—–]*\d{4})|([48]00[ \-—–]*\d{3}[ \-—–]*\d{4})))(?!\d)/g;

function onlyDigits(str) {
  return String(str || "").replace(/\D+/g, "");
}

function normalizeText(text) {
  return String(text || "").replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ");
}

function normalizeIntlForSearch(body) {
  if (body.startsWith("86")) {
    const sub = body.slice(2);
    if (/^1[3-9]\d{9}$/.test(sub)) return sub;
    const withZero = sub.startsWith("0") ? sub : "0" + sub;
    if (/^0(?:10|2\d|[3-9]\d{2})\d{7,8}$/.test(withZero)) return withZero;
  }
  return "+" + body;
}

const text = normalizeText(popclip.input.text || popclip.input.matchedText || "");
const match = PHONE_PATTERN.exec(text);
if (match) {
  let clean = "";
  if (match[1]) {
    clean = normalizeIntlForSearch(onlyDigits(match[1]));
  } else if (match[2]) {
    clean = normalizeIntlForSearch(onlyDigits(match[2]).slice(2));
  } else {
    const raw = match[3] || (match[4] ? match[4] + match[5] : match[6]);
    clean = onlyDigits(raw);
  }
  if (clean) {
    popclip.openUrl(`https://www.baidu.com/s?wd=${encodeURIComponent(clean)}`);
  }
}
