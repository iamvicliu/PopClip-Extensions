#!/usr/bin/env python3
"""IP Lookup（PopClip 动作实现）—— 单个/多个 IP 查询，私有段本地判断。"""
import ipaddress
import json
import os
import sys
import urllib.parse
import urllib.request

TIMEOUT = 8
MAX_IPS = 10

PRIVATE_NETS_V4 = [
    ("10.0.0.0/8", "私有地址 (10/8)"),
    ("172.16.0.0/12", "私有地址 (172.16/12)"),
    ("192.168.0.0/16", "私有地址 (192.168/16)"),
    ("127.0.0.0/8", "本机回环 (127/8)"),
    ("169.254.0.0/16", "链路本地 (169.254/16)"),
    ("100.64.0.0/10", "CGNAT / Tailscale (100.64/10)"),
    ("192.0.2.0/24", "文档示例地址 (192.0.2/24)"),
    ("198.51.100.0/24", "文档示例地址 (198.51.100/24)"),
    ("203.0.113.0/24", "文档示例地址 (203.0.113/24)"),
    ("198.18.0.0/15", "基准测试地址 (198.18/15)"),
    ("0.0.0.0/8", "保留段 (0/8)"),
    ("224.0.0.0/4", "组播 (224/4)"),
    ("240.0.0.0/4", "保留段 (240/4)"),
]
PRIVATE_NETS_V4 = [(ipaddress.ip_network(n), label) for n, label in PRIVATE_NETS_V4]

ULA_NET_V6 = ipaddress.ip_network("fc00::/7")
DOC_NET_V6 = ipaddress.ip_network("2001:db8::/32")


def tokens(text):
    for chunk in text.replace(",", " ").replace(";", " ").split():
        t = chunk.strip()
        if t.startswith("[") and "]" in t:
            t = t[1:t.index("]")]
        elif ":" in t and t.count(":") == 1:
            host, _, port = t.rpartition(":")
            if port.isdigit():
                t = host
        yield t


def parse_ips(text):
    out, seen = [], set()
    for t in tokens(text):
        try:
            ip = ipaddress.ip_address(t)
        except ValueError:
            continue
        key = str(ip)
        if key in seen:
            continue
        seen.add(key)
        out.append(ip)
        if len(out) >= MAX_IPS:
            break
    return out


def classify(ip):
    if ip.version == 6:
        if ip.ipv4_mapped is not None:
            mapped_label = classify(ip.ipv4_mapped)
            if mapped_label:
                return mapped_label
        if ip.is_loopback:
            return "本机回环 (::1)"
        if ip.is_unspecified:
            return "未指定地址 (::)"
        if ip.is_link_local:
            return "链路本地 (fe80::/10)"
        if ip in ULA_NET_V6:
            return "唯一本地地址 (fc00::/7)"
        if ip in DOC_NET_V6:
            return "文档示例地址 (2001:db8::/32)"
        if ip.is_multicast:
            return "组播 (ff00::/8)"
        if ip.is_private or ip.is_reserved:
            return "保留地址"
        return None
    for net, label in PRIVATE_NETS_V4:
        if ip in net:
            return label
    if ip.is_private or ip.is_reserved:
        return "保留地址"
    return None


def lookup(ip):
    encoded_ip = urllib.parse.quote(str(ip), safe=":")
    url = "https://api.ip.sb/geoip/%s" % encoded_ip
    req = urllib.request.Request(url, headers={"User-Agent": "PopClip-IPLookup/3"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8", "replace"))


def main():
    args = sys.argv[1:]
    first_only = False
    if args and args[0] == "--first-ip":
        first_only = True
        args = args[1:]
    text = args[0] if args else os.environ.get("POPCLIP_TEXT", "")
    ips = parse_ips(text)
    if first_only:
        if ips:
            print(ips[0])
        return
    if not ips:
        print("IP Lookup: 选中的内容里没有合法的 IPv4 / IPv6 地址。")
        return

    lines = []
    for ip in ips:
        label = classify(ip)
        if label:
            lines.append("%s | %s | 本地判断，未联网" % (ip, label))
            continue
        try:
            d = lookup(ip)
        except Exception as exc:  # noqa: BLE001
            lines.append("%s | 查询失败: %s" % (ip, exc))
            continue
        loc = " / ".join(x for x in [d.get("country"), d.get("region"), d.get("city")] if x)
        parts = []
        if loc:
            parts.append("位置: " + loc)
        if d.get("asn"):
            parts.append("ASN: %s" % d["asn"])
        if d.get("organization"):
            parts.append("组织: %s" % d["organization"])
        if d.get("ip") and str(d["ip"]) != str(ip):
            parts.append("IP: %s" % d["ip"])
        lines.append("%s | %s" % (ip, " | ".join(parts) if parts else "接口未返回信息"))

    print("\n".join(lines))


if __name__ == "__main__":
    main()
