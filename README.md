# PopClip Extensions

我自己写的 [PopClip](https://www.popclip.app/) 扩展合集。PopClip 是 macOS 上的划词工具：选中一段文字，旁边会弹出一排按钮，扩展就是往这排按钮里加新功能。

## 扩展列表

| 扩展 | 在 PopClip 里的名字 | 做什么 | 下载 |
| --- | --- | --- | --- |
| [IPLookup](./IPLookup.popclipext) | IP 查询 | 选中一个 IPv4 或 IPv6 地址，直接显示它的位置（国家、地区、城市）、ASN 和所属组织；也可以一键打开详情页 | [IPLookup.popclipextz](https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.0.1/IPLookup.popclipextz) |

每个扩展的详细说明，点进它的目录看 README。

## 怎么安装

1. 先安装 [PopClip](https://www.popclip.app/)。
2. 在上面的表格里点「下载」，得到一个 `.popclipextz` 文件。
3. 双击这个文件，PopClip 会弹窗问你是否安装，点「Install」。
4. 之后选中符合条件的文字（比如一个 IP 地址），PopClip 的按钮里就会出现这个扩展。

所有版本都在 [Releases](https://github.com/iamvicliu/PopClip-Extensions/releases) 页面。

## 隐私

有些扩展需要联网，比如 IP 查询会把你选中的 IP 地址发给查询服务。具体发到哪里，每个扩展的 README 里都写清楚了。

## 许可证

MIT。本仓库与 PopClip 官方无关联。

---

以下是维护说明，普通使用可以跳过。

## 发布新版本

```bash
./scripts/release-popclip.sh IPLookup.popclipext v1.0.2
```

脚本会依次：把 README 里的下载链接改成新版本号、打包成 `.popclipextz`、打 tag、推送、创建或更新 GitHub Release 并上传安装包。运行前工作区必须是干净的。

新增扩展时，先在上面的「扩展列表」表格里加一行（链接写成 `./扩展目录名`），再运行脚本；表格里没有的扩展，脚本会拒绝发布。

## 仓库结构

- 每个扩展是一个 `.popclipext` 源码目录，提交到 Git。
- 打包出来的 `.popclipextz` 不提交，只作为 Release 附件上传。
- 仓库结构支持 PopClip 官方扩展目录从个人 GitHub 仓库收录，当前 `include` 路径为 `include=IPLookup.popclipext`。

---

## English

My collection of [PopClip](https://www.popclip.app/) extensions for macOS.

| Extension | Name in PopClip | What it does | Download |
| --- | --- | --- | --- |
| [IPLookup](./IPLookup.popclipext) | IP Lookup | Select an IPv4 or IPv6 address to see its location (country, region, city), ASN, and organization, or open a full details page | [IPLookup.popclipextz](https://github.com/iamvicliu/PopClip-Extensions/releases/download/v1.0.1/IPLookup.popclipextz) |

To install, download the `.popclipextz` file and double-click it. All versions are on the [Releases](https://github.com/iamvicliu/PopClip-Extensions/releases) page. MIT licensed; not affiliated with PopClip.
