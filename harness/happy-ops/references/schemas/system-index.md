# 系统索引约定

路径：references/systems/<system>/index.md。一个稳定对象只有一个 system，环境/机器作为私有事实，不复制操作。

必需 Markdown 字段：system（与目录同名）、aliases（用于路由）。必需章节：系统共识、操作目录、共性陷阱、本机环境。

操作目录每行包含：目标／症状、operations/<slug>.md 链接、status、last_verified。必须与操作正文一致，不能把历史整理日期填作成功日期。系统共识只保存跨操作事实；操作独有异常留在 operation。

local/systems/<system>/index.md 保存本机环境、核实方式与操作证据目录；真实值必须附核实日期和来源，不从历史“最新”推断。
