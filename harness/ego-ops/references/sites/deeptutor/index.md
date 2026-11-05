---
site: deeptutor
domains:
  - 127.0.0.1
  - localhost
aliases:
  - DeepTutor
updated: 2026-10-27
---

# deeptutor

## 平台特征

DeepTutor 本地 Web 应用的根入口可进入 /chat。首页侧栏提供 Home、Partners、Personalized Learning、Learning Space、Task Board 和 Settings；主区提供聊天输入。页面能显示但模型未配置的情况真实存在，页面验收与模型连通性必须分开记录。

聊天输入区域的Resources → Knowledge提供知识库选择，选中后显示Selected resources和Every turn；Select model可核对当前聊天模型。发送新问题可导航至新会话，完成时显示Done并恢复Send控件，回答可注明知识库及源文件。

阅读集合、课程与Notebook有工作区域上下文；应按资源创建范围打开，默认域链接可以显式留空dt_workspace。学习能力的生成完成与内容质量分开验收，课程覆盖和掌握状态只记录真实学习。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [verify-chat-recovery](operations/verify-chat-recovery.md) | 验证带图长回答完成、页面恢复及后续发送，保留草稿和真实失败 | low | 2026-10-27 | [操作](operations/verify-chat-recovery.md) |
| [verify-learning-workflow](operations/verify-learning-workflow.md) | 在已有模型与教学材料下验证主要学习产物可见、可接续，并区分生成完成和内容质量 | low | 2026-10-25 | [操作](operations/verify-learning-workflow.md) |
| [chat-with-knowledge-base](operations/chat-with-knowledge-base.md) | 验证网页聊天能消费已配置的模型和知识库，回答独有事实并注明来源 | low | 2026-10-24 | [操作](operations/chat-with-knowledge-base.md) |
| [verify-local-web](operations/verify-local-web.md) | 确认启动后的 DeepTutor 首页真实渲染，并区分页面可用与模型可用 | low | 2026-10-27 | [操作](operations/verify-local-web.md) |

## 站点级陷阱

同一资源在错误工作区域中可能显示not found；先核对创建范围和当前上下文，再判断资料是否存在。不要通过更改全局默认工作区或重复建库掩盖范围不匹配。按当前实例核对端口，不把本地默认端口当作固定入口。
