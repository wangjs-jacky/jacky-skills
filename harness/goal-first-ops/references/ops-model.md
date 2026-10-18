# 项目与目标的组织模型

## 已确认分类

- 用户于 2026-10-18 明确纠正：`experience.local.md` 这个经验层不要；原本想要的是 **project → features**，feature 就是一个目标文件夹，全部内容和过程都放在该目标中。该指令取代此前 project → operations 与独立本机实例的存储约定。
- `project` 是持续维护的项目、产品或研究对象；设备、分支、版本和会话不另建项目。
- `feature` 是用户要完成的一个目标，可包含多个 task。它承载核心报告、目标确认、过程、产物、证据及可复用方法，不是单纯的经验摘要。
- 唯一默认位置是本 Skill 实际目录下 `projects/<project>/features/<feature>/`。feature 目录本身就是目标工作区，不再增加 workspace 层。
- 项目与目标沿用明确名称或稳定 key；旧名称不为统一格式而强制改写。所有本机项目内容都由 Git 忽略。

## 真实目标示例

- project = kami；feature = create-and-verify-demo-gallery：用真实材料查看 Kami 效果、形成核心报告，既有五个任务属于该目标的分任务。
- project = mac-ops；feature = compare-control-plane-topologies：比较实际控制路径，保留选择依据及条件。
- project = relationship-advisor；feature = publish-api-default：记录该目标的前置、实施、结果和证据。

示例引用当前真实内容，不自动授权新增执行。

## 唯一归属

| 内容 | 位置 |
| --- | --- |
| 项目导航 | projects/index.md |
| 项目共用背景、约束、目标导航 | projects/<project>/index.md |
| 一个目标的所有内容和过程 | projects/<project>/features/<feature>/ |
| 核心报告及成果入口 | 目标 index.md 直接链接实际报告与产物 |
| 该目标的机器路径、环境、来源和失败记录 | 同一 feature 的相关文档 |

原始档案与复用方法在目标内按用途组织，不再维护平行的 local、instance 或 experience 索引。同一事实只保留一个当前权威来源；其他目标用链接引用。

## 演进和授权

用户已经确认的项目、目标和执行选择直接复用。按既有目标补充真实内容、修正结论和链接不重复确认；分类轴实质变化、合并不明归属或扩大业务范围时才再次核对。

知识记录不授予新增业务执行、全局安装、发布、付费、删除或服务中断权限。改变存储结构不重写历史成功日期，不将迁移当作业务验证。

2026-10-16 的 project → operations 是历史约定；其已存在内容在本次迁移中保留来源与证据，按当前目标归位，不能据此恢复旧分类为默认。
