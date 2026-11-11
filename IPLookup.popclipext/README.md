# IP Lookup

## English

Look up basic information about one or more IPv4 or IPv6 addresses from selected text.

### Features

- Supports both IPv4 and IPv6 (including `ip:port` and `[ipv6]:port` formats)
- Supports batch lookup of multiple IP addresses separated by spaces, commas, or semicolons
- Classifies private, loopback, link-local, CGNAT/Tailscale, and reserved ranges locally without network requests
- Shows a compact result in PopClip and opens a full details page in the browser

### Download

- Latest release: <https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- Direct package: <https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.0.3/IPLookup.popclipextz>

### Data Sources

- Query API: [IP.SB](https://ip.sb/)
- Details page: [IPinfo](https://ipinfo.io/)

### Privacy

When you trigger this extension on a public IP address, the selected IP is sent to the lookup service over HTTPS in order to fetch public IP metadata. Private and reserved addresses are classified locally on your Mac and are never sent over the network.

### Notes

- The compact PopClip result is intentionally short because PopClip truncates long result text.
- The details page action opens `https://ipinfo.io/<ip>` for the first valid IP in your selection.

### Author

Vic Liu

### Changelog

- 2026-11-12: Added multi-IP batch lookup, `ip:port` / `[ipv6]:port` parsing, and local classification for private/reserved ranges.
- 2026-03-08: Added English and Chinese localizations, publish-ready metadata, and README.
- 2026-03-08: Initial release.

## 中文

从选中文本中查询一个或多个 IPv4 / IPv6 地址的基本信息。

### 功能

- 同时支持 IPv4 和 IPv6（兼容 `ip:port` 与 `[ipv6]:port` 格式）
- 支持空格、逗号、分号分隔的多个 IP 批量查询
- 私有地址、本机回环、链路本地、CGNAT / Tailscale 及保留地址直接在本地判断，不发起联网请求
- 在 PopClip 中显示精简查询结果，并支持在浏览器中打开完整详情页

### 下载

- 最新版本：<https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- 直接下载：<https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.0.3/IPLookup.popclipextz>

### 数据来源

- 查询接口：[IP.SB](https://ip.sb/)
- 详情页：[IPinfo](https://ipinfo.io/)

### 隐私

触发本插件查询公网 IP 时，所选 IP 地址会通过 HTTPS 发送到查询服务以获取公开的 IP 元数据；私有段与保留地址均在本机直接判断，不会联网发送。

### 说明

- PopClip 会截断较长结果，所以这里刻意保持结果简短。
- “打开详情页”动作会在浏览器中打开所选内容里第一个合法 IP 的 `https://ipinfo.io/<ip>` 页面。

### 作者

Vic Liu

### 更新记录

- 2026-11-12：支持多 IP 批量查询、`ip:port` / `[ipv6]:port` 自动剥离端口，以及私有/保留地址段本地离线识别。
- 2026-03-08：添加中英文本地化、可发布元数据和 README。
- 2026-03-08：首次发布。
