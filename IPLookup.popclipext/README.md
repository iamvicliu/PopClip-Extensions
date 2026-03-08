# IP Lookup

## English

Look up basic information about an IPv4 or IPv6 address from selected text.

### Features

- Supports both IPv4 and IPv6
- Shows a compact result in PopClip
- Opens a full details page in the browser

### Data Sources

- Query API: [IP.SB](https://ip.sb/)
- Details page: [IPinfo](https://ipinfo.io/)

### Privacy

When you trigger this extension, the selected IP address is sent to the lookup service over HTTPS in order to fetch public IP metadata.

### Notes

- The compact PopClip result is intentionally short because PopClip truncates long result text.
- The details page action opens `https://ipinfo.io/<ip>` in your browser.

### Author

Vic Liu

### Changelog

- 2026-03-08: Added English and Chinese localizations, publish-ready metadata, and README.
- 2026-03-08: Initial release.

## 中文

从选中文本中查询 IPv4 或 IPv6 地址的基本信息。

### 功能

- 同时支持 IPv4 和 IPv6
- 在 PopClip 中显示精简查询结果
- 在浏览器中打开完整详情页

### 数据来源

- 查询接口：[IP.SB](https://ip.sb/)
- 详情页：[IPinfo](https://ipinfo.io/)

### 隐私

触发本插件时，所选 IP 地址会通过 HTTPS 发送到查询服务，以获取公开的 IP 元数据。

### 说明

- PopClip 会截断较长结果，所以这里刻意保持结果简短。
- “详情页”动作会在浏览器中打开 `https://ipinfo.io/<ip>`。

### 作者

Vic Liu

### 更新记录

- 2026-03-08：添加中英文本地化、可发布元数据和 README。
- 2026-03-08：首次发布。
