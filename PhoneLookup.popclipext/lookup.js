const axios = require("axios");

const MAX_NUMBERS = 8;
const TIMEOUT_MS = 6000;

// 匹配：1) +或00开头的国际号码  2) 中国大陆11位手机号  3) 中国大陆带区号固话  4) 400/800热线
const PHONE_PATTERN =
  /(?:(?<![\d+])(\+[1-9]\d{0,2}(?: ?[\-—–()] ?| )?\d(?:(?: ?[\-—–()] ?| )?\d){5,13})|(?<!\d)(?:(00[1-9]\d{0,2}(?: ?[\-—–()] ?| )?\d(?:(?: ?[\-—–()] ?| )?\d){5,13})|(?:86[ \-—–]+)?(1[3-9]\d(?:[ \-—–]*\d){8})|\(?(0(?:10|2\d|[3-9]\d{2}))\)?[ \-—–]*(\d{3,4}[ \-—–]*\d{4})|([48]00[ \-—–]*\d{3}[ \-—–]*\d{4})))(?!\d)/g;

// 常见国际与地区电话区号表 (ITU-T E.164)
const COUNTRY_CODES = {
  "1": "美国/加拿大",
  "7": "俄罗斯/哈萨克斯坦",
  "20": "埃及", "27": "南非",
  "30": "希腊", "31": "荷兰", "32": "比利时", "33": "法国", "34": "西班牙",
  "36": "匈牙利", "39": "意大利", "40": "罗马尼亚", "41": "瑞士", "43": "奥地利",
  "44": "英国", "45": "丹麦", "46": "瑞典", "47": "挪威", "48": "波兰", "49": "德国",
  "51": "秘鲁", "52": "墨西哥", "53": "古巴", "54": "阿根廷", "55": "巴西",
  "56": "智利", "57": "哥伦比亚", "58": "委内瑞拉",
  "60": "马来西亚", "61": "澳大利亚", "62": "印度尼西亚", "63": "菲律宾",
  "64": "新西兰", "65": "新加坡", "66": "泰国",
  "81": "日本", "82": "韩国", "84": "越南", "86": "中国大陆",
  "90": "土耳其", "91": "印度", "92": "巴基斯坦", "93": "阿富汗", "94": "斯里兰卡",
  "95": "缅甸", "98": "伊朗",
  "212": "摩洛哥", "213": "阿尔及利亚", "216": "突尼斯", "218": "利比亚",
  "234": "尼日利亚", "254": "肯尼亚", "255": "坦桑尼亚", "256": "乌干达",
  "351": "葡萄牙", "352": "卢森堡", "353": "爱尔兰", "354": "冰岛",
  "358": "芬兰", "359": "保加利亚", "370": "立陶宛", "371": "拉脱维亚",
  "372": "爱沙尼亚", "374": "亚美尼亚", "375": "白俄罗斯", "380": "乌克兰",
  "381": "塞尔维亚", "385": "克罗地亚", "386": "斯洛文尼亚", "420": "捷克", "421": "斯洛伐克",
  "506": "哥斯达黎加", "507": "巴拿马", "591": "玻利维亚", "593": "厄瓜多尔",
  "595": "巴拉圭", "598": "乌拉圭",
  "673": "文莱", "675": "巴布亚新几内亚", "679": "斐济",
  "850": "朝鲜", "852": "中国香港", "853": "中国澳门", "855": "柬埔寨", "856": "老挝",
  "880": "孟加拉国", "886": "中国台湾",
  "960": "马尔代夫", "961": "黎巴嫩", "962": "约旦", "964": "伊拉克",
  "965": "科威特", "966": "沙特阿拉伯", "968": "阿曼", "971": "阿联酋",
  "972": "以色列", "973": "巴林", "974": "卡塔尔", "975": "不丹",
  "976": "蒙古", "977": "尼泊尔", "992": "塔吉克斯坦", "993": "土库曼斯坦",
  "994": "阿塞拜疆", "995": "格鲁吉亚", "996": "吉尔吉斯斯坦", "998": "乌兹别克斯坦",
};

const CANADA_AREA_CODES = new Set([
  "204", "226", "236", "249", "250", "263", "289", "306", "343", "354",
  "365", "367", "368", "382", "403", "416", "418", "428", "431", "437",
  "438", "450", "468", "474", "506", "514", "519", "548", "579", "581",
  "584", "587", "604", "613", "639", "647", "672", "683", "705", "709",
  "742", "753", "778", "780", "782", "807", "819", "825", "867", "873",
  "902", "905",
]);

function onlyDigits(str) {
  return String(str || "").replace(/\D+/g, "");
}

function normalizeText(text) {
  return String(text || "").replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ");
}

function splitCountryCode(digitsAfterPlus) {
  for (const len of [3, 2, 1]) {
    const cc = digitsAfterPlus.slice(0, len);
    if (COUNTRY_CODES[cc]) {
      return { cc, country: COUNTRY_CODES[cc], subscriber: digitsAfterPlus.slice(len) };
    }
  }
  return { cc: "", country: "国际号码", subscriber: digitsAfterPlus };
}

function classifyIntlSubscriber(cc, sub) {
  if (cc === "1" && sub.length === 10) {
    const npa = sub.slice(0, 3);
    if (["800", "888", "877", "866", "855", "844", "833"].includes(npa)) {
      return { country: "北美", type: "免费热线" };
    }
    const region = CANADA_AREA_CODES.has(npa) ? "加拿大" : "美国";
    return { country: region, type: `区号 ${npa}` };
  }
  if (cc === "7" && sub.length === 10) {
    const region = sub.startsWith("6") || sub.startsWith("7") ? "哈萨克斯坦" : "俄罗斯";
    const type = sub.startsWith("9") || sub.startsWith("7") ? "手机" : "固话";
    return { country: region, type };
  }
  if (cc === "852") {
    const first = sub[0];
    const type = ["4", "5", "6", "7", "8", "9"].includes(first) ? "手机" : ["2", "3"].includes(first) ? "固话" : "";
    return { country: "中国香港", type };
  }
  if (cc === "853") {
    const type = sub.startsWith("6") ? "手机" : sub.startsWith("28") ? "固话" : "";
    return { country: "中国澳门", type };
  }
  if (cc === "886") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = s.startsWith("9") ? "手机" : "固话";
    return { country: "中国台湾", type };
  }
  if (cc === "44") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = s.startsWith("7") ? "手机" : s.startsWith("1") || s.startsWith("2") ? "固话" : "";
    return { country: "英国", type };
  }
  if (cc === "81") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = /^(70|80|90)/.test(s) ? "手机" : "固话";
    return { country: "日本", type };
  }
  if (cc === "82") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = s.startsWith("10") ? "手机" : "固话";
    return { country: "韩国", type };
  }
  if (cc === "65") {
    const type = sub.startsWith("8") || sub.startsWith("9") ? "手机" : sub.startsWith("6") ? "固话" : "";
    return { country: "新加坡", type };
  }
  if (cc === "60") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = s.startsWith("1") ? "手机" : "固话";
    return { country: "马来西亚", type };
  }
  if (cc === "61") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = s.startsWith("4") ? "手机" : "固话";
    return { country: "澳大利亚", type };
  }
  if (cc === "63") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = s.startsWith("9") ? "手机" : "固话";
    return { country: "菲律宾", type };
  }
  if (cc === "66") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = /^[689]/.test(s) ? "手机" : "固话";
    return { country: "泰国", type };
  }
  if (cc === "84") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = /^[35789]/.test(s) ? "手机" : "固话";
    return { country: "越南", type };
  }
  if (cc === "49") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = /^1[567]/.test(s) ? "手机" : "固话";
    return { country: "德国", type };
  }
  if (cc === "33") {
    const s = sub.startsWith("0") ? sub.slice(1) : sub;
    const type = /^[67]/.test(s) ? "手机" : "固话";
    return { country: "法国", type };
  }
  return { country: COUNTRY_CODES[cc] || "国际号码", type: cc ? `+${cc}` : "" };
}

function parseIntlItem(rawIntl) {
  const digits = onlyDigits(rawIntl);
  const body = rawIntl.trim().startsWith("00") ? digits.slice(2) : digits;
  if (body.length < 7 || body.length > 15) return null;

  const { cc, subscriber } = splitCountryCode(body);
  if (cc === "86") {
    if (/^1[3-9]\d{9}$/.test(subscriber)) {
      return { kind: "mobile", number: subscriber, display: subscriber };
    }
    const withZero = subscriber.startsWith("0") ? subscriber : "0" + subscriber;
    const m = withZero.match(/^(0(?:10|2\d|[3-9]\d{2}))(\d{7,8})$/);
    if (m) {
      return {
        kind: "landline",
        number: withZero,
        display: withZero,
        areaCode: m[1],
        localNum: m[2],
      };
    }
  }

  return {
    kind: "intl",
    number: "+" + body,
    display: "+" + body,
    cc,
    subscriber,
  };
}

function extractNumbers(rawText) {
  const text = normalizeText(rawText);
  const out = [];
  const seen = new Set();

  PHONE_PATTERN.lastIndex = 0;
  let match;
  while ((match = PHONE_PATTERN.exec(text)) !== null) {
    let item = null;
    if (match[1] || match[2]) {
      item = parseIntlItem(match[1] || match[2]);
    } else if (match[3]) {
      const clean = onlyDigits(match[3]);
      if (clean.length === 11) {
        item = { kind: "mobile", number: clean, display: clean };
      }
    } else if (match[4] && match[5]) {
      const areaCode = onlyDigits(match[4]);
      const localNum = onlyDigits(match[5]);
      const clean = areaCode + localNum;
      if (localNum.length >= 7 && localNum.length <= 8) {
        item = { kind: "landline", number: clean, display: clean, areaCode, localNum };
      }
    } else if (match[6]) {
      const clean = onlyDigits(match[6]);
      if (clean.length === 10) {
        item = { kind: "hotline", number: clean, display: clean };
      }
    }

    if (item && !seen.has(item.number)) {
      seen.add(item.number);
      out.push(item);
      if (out.length >= MAX_NUMBERS) break;
    }
  }
  return out;
}

function fallbackCarrierByPrefix(num) {
  const p3 = num.slice(0, 3);
  const p4 = num.slice(0, 4);
  if (p4 === "1349") return "卫通";
  if (["1700", "1701", "1702", "162"].includes(p4) || p3 === "162") return "电信虚商";
  if (["1703", "1705", "1706", "165"].includes(p4) || p3 === "165") return "移动虚商";
  if (["1704", "1707", "1708", "1709", "171", "167"].includes(p4) || p3 === "171" || p3 === "167") {
    return "联通虚商";
  }
  const cmcc = [
    "134", "135", "136", "137", "138", "139", "147", "148",
    "150", "151", "152", "157", "158", "159", "172", "178",
    "182", "183", "184", "187", "188", "195", "197", "198",
  ];
  const cucc = [
    "130", "131", "132", "145", "146", "155", "156", "166",
    "175", "176", "185", "186", "196",
  ];
  const ctcc = [
    "133", "149", "153", "173", "174", "177", "180", "181",
    "189", "190", "191", "193", "199",
  ];
  if (p3 === "192") return "广电";
  if (cmcc.includes(p3)) return "移动";
  if (cucc.includes(p3)) return "联通";
  if (ctcc.includes(p3)) return "电信";
  return "";
}

function classifyHotline(num) {
  if (num.startsWith("800")) return "800免费热线";
  const p4 = num.slice(0, 4);
  if (p4 === "4001" || p4 === "4007") return "400热线(移动)";
  if (p4 === "4000" || p4 === "4006") return "400热线(联通)";
  if (p4 === "4008" || p4 === "4009") return "400热线(电信)";
  return "400热线";
}

function extractBalancedJsonObject(str, startBraceIdx) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = startBraceIdx; i < str.length; i += 1) {
    const ch = str[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return str.slice(startBraceIdx, i + 1);
      }
    }
  }
  return "";
}

async function fetch360Area(number) {
  try {
    const res = await axios.get(`https://cx.shouji.360.cn/phonearea.php?number=${encodeURIComponent(number)}`, {
      timeout: TIMEOUT_MS,
    });
    let payload = res.data;
    if (typeof payload === "string") {
      payload = JSON.parse(payload.trim());
    }
    if (payload && payload.code === 0 && payload.data) {
      return payload.data;
    }
  } catch {}
  return null;
}

const HTML_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh-Hans;q=0.9",
};

// 使用头条搜索内嵌的 tel_info 结构化 JSON（对 PopClip 原生 CFNetwork UA + HTML Accept 头 100% 放行无验证码）
async function fetchToutiaoTelInfo(number) {
  try {
    const res = await axios.get(`https://so.toutiao.com/search?keyword=${encodeURIComponent(number)}`, {
      timeout: TIMEOUT_MS,
      responseType: "text",
      headers: HTML_HEADERS,
    });
    const html = typeof res.data === "string" ? res.data : "";
    const marker = '"tel_info":{';
    const idx = html.indexOf(marker);
    if (idx !== -1) {
      const rawJson = extractBalancedJsonObject(html, idx + '"tel_info":'.length);
      if (rawJson) {
        return JSON.parse(rawJson);
      }
    }
  } catch {}
  return null;
}

function formatTagFromTelInfo(telInfo, isSingle) {
  if (!telInfo) return "";
  const parts = [];
  if (telInfo.name && telInfo.name !== telInfo.telnum) {
    parts.push(String(telInfo.name).trim());
  }
  if (telInfo.flag && telInfo.flag.type) {
    const type = String(telInfo.flag.type).trim();
    const num = Number(telInfo.flag.num) || 0;
    if (num > 0) {
      parts.push(isSingle ? `⚠️${type}(${num}人标记)` : `⚠️${type}(${num}人)`);
    } else {
      parts.push(`⚠️${type}`);
    }
  }
  return parts.join(" · ");
}

async function lookupOne(item, isSingle) {
  if (item.kind === "hotline") {
    const telInfo = await fetchToutiaoTelInfo(item.number);
    const parts = [item.display, classifyHotline(item.number)];
    const tagStr = formatTagFromTelInfo(telInfo, isSingle);
    if (tagStr) parts.push(tagStr);
    return parts.join(" · ");
  }

  if (item.kind === "intl") {
    const info = classifyIntlSubscriber(item.cc, item.subscriber);
    const parts = [item.display, info.country];
    if (info.type) parts.push(info.type);
    return parts.join(" · ");
  }

  const [areaData, telInfo] = await Promise.all([
    fetch360Area(item.number),
    fetchToutiaoTelInfo(item.number),
  ]);

  const province = areaData && areaData.province ? String(areaData.province).trim() : "";
  const city = areaData && areaData.city ? String(areaData.city).trim() : "";
  const sp = areaData && areaData.sp ? String(areaData.sp).trim() : "";

  let loc = "";
  if (province && city && province !== city) {
    loc = isSingle ? `${province} ${city}` : `${province}${city}`;
  } else if (province || city) {
    loc = province || city;
  } else if (telInfo && telInfo.telloc) {
    loc = String(telInfo.telloc).replace(/中国(移动|联通|电信|广电)/g, "").trim() || "未知归属地";
  } else {
    loc = "未知归属地";
  }

  let typeOrCarrier = "";
  if (item.kind === "landline") {
    typeOrCarrier = isSingle ? `固话(区号 ${item.areaCode})` : `固话(${item.areaCode})`;
  } else {
    typeOrCarrier = sp || fallbackCarrierByPrefix(item.number) || "手机";
  }

  const parts = [item.display, loc, typeOrCarrier];
  const tagStr = formatTagFromTelInfo(telInfo, isSingle);
  if (tagStr) parts.push(tagStr);

  return parts.join(" · ");
}

const rawInput = popclip.input.text || popclip.input.matchedText || "";
const items = extractNumbers(rawInput);

if (items.length === 0) {
  return "号码查询: 未在选中内容中识别到有效的电话号码。";
}

const isSingle = items.length === 1;
const results = await Promise.all(items.map((item) => lookupOne(item, isSingle)));

return results.join("  |  ");
