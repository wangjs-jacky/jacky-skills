# Image Effects Catalog

这是 `image-effects` 语义效果目录的长期设计入口。目录由最初 8 个效果扩展为 43 个：保留原有 8 个独立效果，并把 Happy 中按“狗狗/提拉米苏”素材分组的 42 个案例去重为 35 个可复用语义效果。合并后的源仓库提交仍是公开导出与 Pages 发布的唯一事实源。

本主题覆盖来源与许可证、效果卡和 Gallery 契约、独立预览策略、验收门以及发布边界。每个语义效果只有一个稳定 ID，不再以案例主体创建分类；旧 Happy ID 只保留为兼容别名。需要了解首版架构基线时，读取 [`references/design.md`](references/design.md)；当前完整目录以 `skills/image-effects/references/INDEX.md` 和效果卡为准。

当前发布范围继续明确排除 `grade-images`、远程目录、OSS/CDN 与 OTA。本次仅同步调整 Happy Gallery 的语义分类与旧 ID 兼容，不改变图片运行时和发布通道。
