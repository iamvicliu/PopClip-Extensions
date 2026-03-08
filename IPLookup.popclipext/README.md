# IP Lookup

Look up basic information about an IPv4 or IPv6 address from selected text.  
从选中文本中查询 IPv4 或 IPv6 地址的基本信息。

## Features / 功能

- Supports both IPv4 and IPv6 / 同时支持 IPv4 和 IPv6
- Shows a compact result in PopClip / 在 PopClip 中显示精简查询结果
- Opens a full details page in the browser / 在浏览器中打开完整详情页

## Data Sources / 数据来源

- Query API / 查询接口: [IP.SB](https://ip.sb/)
- Details page / 详情页: [IPinfo](https://ipinfo.io/)

## Privacy / 隐私

When you trigger this extension, the selected IP address is sent to the lookup service over HTTPS in order to fetch public IP metadata.  
触发本插件时，所选 IP 地址会通过 HTTPS 发送到查询服务，以获取公开的 IP 元数据。

## Notes / 说明

- The compact PopClip result is intentionally short because PopClip truncates long result text. / PopClip 会截断较长结果，所以这里刻意保持结果简短。
- The details page action opens `https://ipinfo.io/<ip>` in your browser. / “详情页”动作会在浏览器中打开 `https://ipinfo.io/<ip>`。

## Author / 作者

Created by Vic Liu. / 作者：Vic Liu

## Changelog / 更新记录

- 2026-03-08: Added English and Chinese localizations, publish-ready metadata, and README. / 添加中英文本地化、可发布元数据和 README。
- 2026-03-08: Initial release. / 首次发布。
