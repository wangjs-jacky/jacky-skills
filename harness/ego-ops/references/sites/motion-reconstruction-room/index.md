---
site: motion-reconstruction-room
domains:
  - 127.0.0.1
  - trycloudflare.com
  - motion.paws.rodeo
aliases:
  - 动效复现室
  - 效果走廊
  - Motion Atlas
updated: 2026-11-04
---

# motion-reconstruction-room

## 平台特征

本地、授权临时静态快照与正式独立域名的同一自制展厅。主入口用案例导航切换独立iframe，工具栏可复位当前案例和传递减少动态偏好；单项页面也能独立打开。无需登录，页面操作无业务后端。

Motion Atlas 效果库提供场景目录、搜索、卡片预览与选集入口；目录初始化期间显示加载状态，成功后填充计数和卡片。当前卡片列表使用构建时生成的压缩封面，初始没有 demo iframe；打开详情后才创建单个同源交互文档，关闭后销毁。主文档 load、目录出现、图片解码和真实交互就绪仍分别核验。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
| --- | --- | --- | --- | --- |
| [verify-external-cover-image](operations/verify-external-cover-image.md) | 区分资源上传成功、浏览器图片解码与跨域脚本读取 | low | 2026-11-04 | [操作](operations/verify-external-cover-image.md) |
| [inspect-atlas-library](operations/inspect-atlas-library.md) | 只读确认效果库、首屏预览与当前资源样本 | low | 2026-11-04 | [操作](operations/inspect-atlas-library.md) |
| [verify-research-report](operations/verify-research-report.md) | 核对截图标注、对照、放大及来源链接 | low | 2026-10-20 | [操作](operations/verify-research-report.md) |
| [verify-local-studies](operations/verify-local-studies.md) | 验证本地静态动效展厅 | low | 2026-10-30 | [操作](operations/verify-local-studies.md) |

## 站点级陷阱

本地与授权正式域名沿同一操作验证，没有已确认的跨操作站点缺陷。旧临时域名的解析失败保留在项目私有记录，不登记为全站或平台缺陷。
