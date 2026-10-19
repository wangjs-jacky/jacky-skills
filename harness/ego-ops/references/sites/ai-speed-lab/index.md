---
site: ai-speed-lab
domains:
  - chatbox-demo.paws.rodeo
aliases:
  - Chatbox 技术笔记
updated: 2026-10-18
---

# ai-speed-lab

## 平台特征

学习笔记是同源独立HTML，文章目录使用本页锚点；已有有效登录态可直接阅读。正文不需要加载聊天应用或执行工具。托管层可能注入统计脚本，本次被笔记CSP阻止，不能把托管资源条目数误称为零。

静态展厅可经宿主管理的临时快照访问；该入口与固定域学习笔记不是同次发布。Glass渠道为嵌入助手预演，真实模型与工具不在此执行。

2026-10-18的独立Agent参考采用当前Mac Ops导出组件，20状态卡、静态架构与结论、结构化下载与旧逐场景展厅分开。数据全部合成；不能把来源Demo旧renderer直接当当前正式版。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [verify-chatbox-agent-reference](operations/verify-chatbox-agent-reference.md) | 验证真实组件合成展台、静态Agent上下文和结构化下载 | low | 2026-10-18 | [操作](operations/verify-chatbox-agent-reference.md) |
| [verify-embedded-assistant-expansion](operations/verify-embedded-assistant-expansion.md) | 在合成DEMO中验证窄侧栏、内部历史、平滑展开收回及状态保留 | low | 2026-10-17 | [操作](operations/verify-embedded-assistant-expansion.md) |
| [verify-glass-multi-session-demo](operations/verify-glass-multi-session-demo.md) | 验证首版Glass多面板与独立模拟会话 | low | 2026-10-17 | [操作](operations/verify-glass-multi-session-demo.md) |

## 站点级陷阱

暂无已定位且跨操作适用的站点缺陷；加载超时后的页面状态需实际读取，不因超时另建任务空间。
