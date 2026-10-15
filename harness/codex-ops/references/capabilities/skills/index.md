# 技能管理

能力：`skills`。管理安装、依赖、跨设备同步、发现与触发。

## 共用事实

- 优先按当前会话目录表、宿主注册表和真实路径定位 Skill；`plugin:skill` 是标识符，不能把冒号换成路径分隔符。`rN` 别名须先展开。
- 2026-10-15 官方本地技能说明列出 `.agents/skills` 的项目与用户目录、管理员目录与系统内置技能，并支持目录软链接。部分宿主或安装器还维护 `CODEX_HOME/skills` 等入口；不能将一种目录视为所有宿主的唯一事实。
- `SKILL.md` 的 name/description 用于发现与匹配；文件存在、被发现、被选择、实际遵循是不同层次。相同名称不会自动合并成一份知识。
- 当前官方说明技能变化可自动检测，未出现时可重启；修改 config 中的启用设置需按宿主加载方式处理。隔离宿主的实际加载需另核对。
- 全局前置提示词只有获得授权并被宿主加载才成为全局指令；普通复制、链接安装不会执行交互。

## Operations

- [安装与同步](operations/install-sync.md)
- [发现与触发排障](operations/diagnose-discovery.md)

## 来源

2026-10-15 阅读 [Build skills](https://learn.chatgpt.com/docs/build-skills)。本机旧环境中曾有将目录别名误写成固定路径的案例，具体路径留私有实例。
