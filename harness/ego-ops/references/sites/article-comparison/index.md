---
site: article-comparison
domains:
  - trycloudflare.com
  - acp-report.paws.rodeo
aliases:
  - 文章全文左右对照
  - ACP教程写作实验
updated: 2026-10-18
---

# article-comparison

## 平台特征

静态单文件阅读页，支持原文/改写全文，或三个独立条件的成对阅读。宽屏并排，窄屏可切换单栏；可提供材料类型、源码、匿名编码与下载。交互不依赖登录和业务后端。长期域名与临时预览共用同一静态成品；长期域名桌面和窄屏读回已验证。

## 操作目录

| operation | 目标 | 风险 | 最近验证 | 参考 |
| --- | --- | --- | --- | --- |
| [compare-tutorial-conditions](operations/compare-tutorial-conditions.md) | 核对三条件完整文章、材料切换与真实下载 | low | 2026-10-18 | [操作](operations/compare-tutorial-conditions.md) |
| [read-and-export-comparison](operations/read-and-export-comparison.md) | 阅读双栏全文、切换阅读方式并导出 HTML | low | 2026-10-18 | [操作](operations/read-and-export-comparison.md) |

## 站点级陷阱

原字节HTML下载可能受托管方自动注入脚本影响，应核对浏览器实际下载文件；此次仅针对本站设置no-transform后复验哈希一致。临时托管链接的有效期受发布工具契约限制。下载可保留静态内容，不能把页面加载成功视作原文技术结论已复验。
