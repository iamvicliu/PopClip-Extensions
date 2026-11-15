# Phone Lookup

## English

Extract and clean domestic or international phone numbers from selected text—automatically stripping leading/trailing spaces, hyphens, parentheses, and surrounding text—and look up their location, carrier, and caller-ID / spam tags.

### Features

- Supports 11-digit Chinese mobile numbers (including `192` China Broadnet and virtual carriers), domestic landlines with area codes (e.g. `0755-83765566`), `400`/`800` service hotlines, and international E.164 phone numbers (`+1`, `+44`, `+852`, `+853`, `+886`, `+81`, `+82`, `+65`, `00852`, etc.)
- Automatically strips spaces, hyphens (`-`, `—`, `–`), parentheses, and surrounding noise (e.g. `Tel: 138-0013-8000` or full call-log lines)
- Shows detailed caller-ID / spam tags (e.g. telemarketing, harassment, fraud, or verified enterprise names) alongside region and carrier
- Clean formatting: fields within a number are joined by `·`, and multiple numbers are separated by ` | `

### Download

- Latest release: <https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- Direct package: <https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.1.0/PhoneLookup.popclipextz>

### Data Sources

- Carrier & region API: [360 Phone Area](https://cx.shouji.360.cn/)
- Caller-ID & spam tags: [Toutiao Search](https://so.toutiao.com/) (Dianhuabang caller-ID database)
- Details page: [Baidu Search](https://www.baidu.com/)

### Privacy

When you trigger this extension on a domestic phone number or hotline, the cleaned phone number is sent over HTTPS to the query services to fetch region, carrier, and public caller-ID / spam tags. International phone numbers (non-`+86`) are classified locally on your Mac without network requests.

### Notes

- Up to 8 phone numbers are queried at once to keep PopClip responsive.
- The "Open in Baidu" action opens Baidu search for the first recognized phone number in your selection.

### Author

Vic Liu

### Changelog

- 2026-11-15: Initial release with domestic mobile/landline/hotline lookup, international E.164 recognition, noise stripping, and caller-ID / spam tag display.

## 中文

从选中文本中自动提取并清洗国内外手机号、座机号或 400/800 电话，自动过滤前后空格、中间的 `-` 与空格以及周围的多余文字，查询归属地、运营商及骚扰/黄页标记。

### 功能

- 支持 11 位中国大陆手机号（含 `192` 中国广电及虚拟运营商号段）、带区号国内座机/固话（如 `0755-83765566`）、`400`/`800` 热线，以及 **`+` 或 `00` 开头的国际号码**（如 `+1` 美国/加拿大、`+44` 英国、`+852` 香港、`+853` 澳门、`+886` 台湾、`+81` 日本、`+82` 韩国、`+65` 新加坡等全球区号与号段类型识别）
- 自动过滤前后空格、中间的连字符（`-`、`—`、`–`）、括号与空格以及周围多余字符（如选中 `电话：138-0013-8000` 或整行通话记录均可直接识别）
- 同时查询省市/国家归属地、运营商/固话区号，以及骚扰/营销标记（如 `⚠️营销推广(37人标记)`）和企业黄页名称
- 单个号码内部信息用 `·` 连接，多个号码之间用 ` | ` 分隔，层次清晰
- 提供两个动作按钮：
  1. **查询号码**：弹窗显示归属地、运营商与骚扰/黄页标记
  2. **百度详情**：在浏览器打开百度搜索查看完整号码认证卡片

### 下载

- 最新版本：<https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- 直接下载：<https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.1.0/PhoneLookup.popclipextz>

### 数据来源

- 归属地与运营商接口：[360 手机归属地](https://cx.shouji.360.cn/)
- 号码标记与黄页认证：[头条搜索](https://so.toutiao.com/)（内置电话邦号码标记库）
- 详情页：[百度搜索](https://www.baidu.com/)

### 隐私

触发本插件查询国内手机号、固话或热线时，清洗后的纯号码会通过 HTTPS 发送到上述查询服务以获取公开的归属地、运营商及号码标记信息；非 `+86` 的国际号码均在本机离线解析国家与号段类型，不会联网发送。

### 说明

- 单次最多同时查询选中内容中的前 8 个不重复号码，保证弹窗响应速度。
- “百度详情”动作会在浏览器中打开所选内容里第一个有效号码的百度搜索结果页。

### 作者

Vic Liu

### 更新记录

- 2026-11-15：首次发布，支持国内外手机号、座机、400/800 热线提取清洗、归属地与运营商查询及骚扰/黄页标记展示。
