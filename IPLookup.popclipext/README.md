# IP & Domain Lookup

## English

Look up location, ASN, DNS records, and RDAP expiration date for one or more IPv4/IPv6 addresses, domains, or URLs from selected text.

### Features

- Supports IPv4 and IPv6 addresses (including `ip:port` and `[ipv6]:port`), domain names (e.g. `popclip.app`), and full URLs (automatically strips scheme, port, and path)
- Supports batch lookup of multiple IPs, domains, or URLs separated by spaces, commas, or semicolons
- Resolves domain A/AAAA and CNAME records via DNS-over-HTTPS (DoH), fetches the resolved IP's geolocation and ASN, and queries RDAP for domain expiration dates
- Classifies private, loopback, link-local, CGNAT/Tailscale, and reserved IP ranges locally without network requests
- Clean formatting: fields within an item are joined by `·`, and multiple items are separated by ` | `

### Download

- Latest release: <https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- Direct package: <https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.2.0/IPLookup.popclipextz>

### Data Sources

- GeoIP & ASN API: [IP.SB](https://ip.sb/)
- DNS-over-HTTPS (DoH): [AliDNS Public DoH](https://dns.alidns.com/)
- Domain RDAP: [RDAP.org](https://rdap.org/)
- Details page: [IPinfo](https://ipinfo.io/)

### Privacy

When you trigger this extension on a public IP address or domain, the selected IP or domain is sent over HTTPS to the query services to fetch DNS, RDAP, and public IP metadata. Private and reserved IP addresses and local domains (`.local`, `.lan`, `localhost`) are classified locally on your Mac without network requests.

### Notes

- Common source/document file extensions (e.g. `lookup.js`, `README.md`) without an `http://` or `https://` scheme are automatically ignored to avoid false triggers.
- The "Open Details" action opens `https://ipinfo.io/<ip-or-domain>` for the first valid IP or domain in your selection.

### Author

Vic Liu

### Changelog

- 2026-11-15: Added domain and URL lookup support (DoH DNS resolution + RDAP domain expiration date) and unified `·` / ` | ` compact formatting.
- 2026-11-12: Added multi-IP batch lookup, `ip:port` / `[ipv6]:port` parsing, and local classification for private/reserved ranges.
- 2026-03-08: Added English and Chinese localizations, publish-ready metadata, and README.
- 2026-03-08: Initial release.

## 中文

从选中文本中查询一个或多个 IPv4 / IPv6 地址、域名或 URL 的归属地、ASN、DNS 解析记录及域名到期时间。

### 功能

- 同时支持 IPv4、IPv6（兼容 `ip:port` 与 `[ipv6]:port`）、纯域名（如 `popclip.app`）及完整 URL（自动剥离 `http(s)://`、端口与路径）
- 支持空格、逗号、分号分隔的多个 IP 或域名批量混合查询
- 对域名自动执行 DoH（DNS over HTTPS）解析获取 A/AAAA 与 CNAME 记录，继续查询目标 IP 的地理位置与 ASN 组织，并通过 RDAP 查询域名注册到期日
- 私有地址、本机回环、链路本地、CGNAT / Tailscale 及保留地址直接在本地判断，不发起联网请求
- 单个条目内部信息用 `·` 连接，多个条目之间用 ` | ` 分隔，层次清晰

### 下载

- 最新版本：<https://github.com/iamvicliu/PopClip-Extensions/releases/latest>
- 直接下载：<https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.2.0/IPLookup.popclipextz>

### 数据来源

- IP 归属地与 ASN 接口：[IP.SB](https://ip.sb/)
- DoH 域名解析接口：[阿里公共 DNS DoH](https://dns.alidns.com/)
- 域名 RDAP 注册信息：[RDAP.org](https://rdap.org/)
- 详情页：[IPinfo](https://ipinfo.io/)

### 隐私

触发本插件查询公网 IP 或域名时，所选 IP 或域名会通过 HTTPS 发送到上述公共查询服务以获取公开的 DNS、RDAP 与 IP 元数据；私有段、保留地址及内网域名均在本机直接判断，不会联网发送。

### 说明

- 为避免选中代码或文档文件名（如 `lookup.js`、`README.md`）时误触发，未带 `http(s)://` 协议头的常见文件后缀会被自动过滤。
- “打开详情页”动作会在浏览器中打开所选内容里第一个合法 IP 或域名的 `https://ipinfo.io/<ip或域名>` 页面。

### 作者

Vic Liu

### 更新记录

- 2026-11-15：新增域名与 URL 解析支持（DoH A/AAAA/CNAME 解析 + RDAP 域名到期日查询），并统一为 `·` 与 ` | ` 分隔排版。
- 2026-11-12：支持多 IP 批量查询、`ip:port` / `[ipv6]:port` 自动剥离端口，以及私有/保留地址段本地离线识别。
- 2026-03-08：添加中英文本地化、可发布元数据和 README。
- 2026-03-08：首次发布。
