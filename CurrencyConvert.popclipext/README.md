# Currency & Crypto Converter

## English

Convert fiat and cryptocurrency amounts in selected text with real-time exchange rates, Chinese/English unit multipliers (`万`, `亿`, `k`, `m`, `b`), and automatic multi-amount summation.

### Features

- Supports major world fiat currencies (`USD`, `CNY`, `HKD`, `TWD`, `JPY`, `EUR`, `GBP`, `SGD`, `KRW`, `AUD`, `CAD`, `CHF`, `NZD`, `MYR`, `THB`, `VND`, `PHP`, `IDR`, `INR`, `RUB`, `AED`, etc.) and top cryptocurrencies (`BTC`, `ETH`, `SOL`, `BNB`, `XRP`, `DOGE`, `ADA`, `TON`, `TRX`, `AVAX`, `DOT`, `LINK`, `LTC`, `USDT`, `USDC`, etc.)
- Recognizes currency symbols (`$`, `US$`, `HK$`, `NT$`, `€`, `£`, `¥`, `₩`, `₹`, `₽`, `฿`, `RM`, etc.), ISO codes, and Chinese currency names (`美元`, `港币`, `台币`, `日元`, `欧元`, `英镑`, `人民币`/`元`, `韩元`, etc.)
- Supports magnitude suffixes in both Chinese (`万` = 10,000, `亿` = 100,000,000) and English (`k`, `m`, `b`), e.g. `1.5万日元` or `$12.5k`
- Smart target conversion: non-CNY amounts convert to `CNY` + `USD`; `CNY` amounts convert to `USD` + `HKD` + `JPY`
- Automatically sums multiple amounts across different currencies in your selection and displays the grand total in `CNY` and `USD`

### Download

- Latest release: <https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- Direct package: <https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.2.0/CurrencyConvert.popclipextz>

### Data Sources

- Primary fiat & crypto rates: [Coinbase Exchange Rates API](https://api.coinbase.com/v2/exchange-rates?currency=USD)
- Fallback fiat rates: [ExchangeRate-API](https://www.exchangerate-api.com/)
- Rate chart page: [Google Finance](https://www.google.com/finance/)

### Privacy

When you trigger this extension, it fetches the current public USD exchange-rate table over HTTPS and performs all amount parsing and conversion calculations locally on your Mac.

### Notes

- Up to 6 currency amounts are converted and summed in a single selection.
- The "Open Rate Chart" action opens Google Finance for the first currency detected in your selection.

### Author

Vic Liu

### Changelog

- 2026-11-15: Initial release with real-time fiat & cryptocurrency conversion, Chinese/English unit multipliers, and multi-amount summation.

## 中文

实时换算选中文本中的多国法币与主流加密货币金额，支持中英文货币单位、`万`/`亿`/`k`/`m` 数量级以及多笔金额跨币种自动求和。

### 功能

- 同时支持全球主流法币（`USD`、`CNY`、`HKD`、`TWD`、`JPY`、`EUR`、`GBP`、`SGD`、`KRW`、`AUD`、`CAD`、`CHF`、`MYR`、`THB` 等）与主流加密货币（`BTC`、`ETH`、`SOL`、`BNB`、`XRP`、`DOGE`、`USDT`、`USDC` 等）
- 支持前置货币符号（`$`、`US$`、`HK$`、`NT$`、`€`、`£`、`¥`、`₩` 等）、ISO 货币代码以及中文名称（`美元`/`美金`、`港币`、`台币`、`日元`/`円`、`欧元`、`英镑`、`人民币`/`元`、`韩元`、`泰铢` 等）
- 支持中文数量级（`万`、`亿`，如 `1.5万日元`、`3.5万美元`）与英文缩写（`k`、`m`、`b`，如 `$12.5k`）
- 智能双向折算：外币与加密货币自动折算为 **人民币（CNY）+ 美元（USD）**；人民币金额自动折算为 **美元（USD）+ 港币（HKD）+ 日元（JPY）**
- 选中包含多笔不同币种的账单文本时，逐笔换算并在末尾自动计算 **跨币种合计总额（CNY / USD）**

### 下载

- 最新版本：<https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- 直接下载：<https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.2.0/CurrencyConvert.popclipextz>

### 数据来源

- 主汇率接口（法币 + 加密货币）：[Coinbase Exchange Rates API](https://api.coinbase.com/v2/exchange-rates?currency=USD)
- 备用汇率接口：[ExchangeRate-API](https://www.exchangerate-api.com/)
- 走势详情页：[Google 财经](https://www.google.com/finance/)

### 隐私

触发本插件时，仅通过 HTTPS 拉取公开的实时基准汇率表，所有金额提取、换算与求和均在你的 Mac 本地完成。

### 说明

- 单次最多提取并汇总选中文本中的前 6 笔金额。
- “汇率走势”动作会在浏览器中打开所选第一个币种的 Google 财经汇率走势图。

### 作者

Vic Liu

### 更新记录

- 2026-11-15：首次发布，支持多国法币与加密货币实时折算、中英文数量级单位及多笔金额跨币种自动求和。
