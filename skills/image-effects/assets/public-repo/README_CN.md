# Image Effects

为 AI 编程 Agent 提供按视觉语义组织、可复用且带版本的图片效果卡，并附带一个可浏览全部配方的静态 Gallery。

[English](./README.md) · [Gallery](https://wangjs-jacky.github.io/image-effects/)

## 安装

```bash
npx skills add wangjs-jacky/image-effects
```

一次安装即可获得每张效果卡的完整行为，不需要额外安装任何 Skill 依赖。本目录不包含 `grade-images`，也不包含确定性调色配方。

## 代表效果

- `healing-anime-scribble-v3@1.0.0` — 图片输入
- `minimal-zine-poster@1.0.0` — 文字或图片输入
- `photo-illustration-diptych@1.0.0` — 图片输入
- `photo-illustration-diptych-lakeside@1.0.0` — 图片输入
- `photo-illustration-editorial-echo@1.0.0` — 图片输入，并要求确定性排版
- `scene-distillation-zine@1.0.0` — 图片输入
- `scenes-gathered-zine@1.0.0` — 图片输入
- `scenes-gathered-zine-sea@1.0.0` — 图片输入

每个引用都包含精确版本号。Skill 不会悄悄替换未知版本，因此已有调用可以保持稳定，后续配方也能独立演进。
完整生成目录请查看 [`references/INDEX.md`](./references/INDEX.md) 或 Gallery，其中按产品、海报营销、信息图、氛围插画、人物、网格、分镜、素材、地图、编辑影像、人像和纸刊等语义分组。

## 使用

图片效果要求在当前请求中明确附加恰好一张 JPEG 或 PNG，然后告诉 Agent：

```text
Use $image-effects effect healing-anime-scribble-v3@1.0.0 on my uploaded image.
```

Minimal Zine 支持二选一：输入非空文字主题且不附图片；或明确附加一张 JPEG/PNG，并可补充美术方向：

```text
Use $image-effects effect minimal-zine-poster@1.0.0 with this idea or my uploaded image.
```

Skill 只使用当前请求中的输入，不会扫描附件目录或历史消息来猜测图片。

## 生成方式

Skill 会解析所选效果卡、验证输入契约，再把完整配方交给宿主原生的图片生成或编辑能力。图片数据由宿主处理；本仓库不会把图片上传到额外服务，也不提供在线生成后端。处理敏感图片前，请确认宿主的隐私政策。传输或排版所需的临时文件会在成功或失败后清理。

Editorial Echo 固定采用两个阶段。创建任何中间资产前，Skill 会预检宿主是否同时具备图片生成能力，以及本地 HTML/CSS（或等价确定性方式）的排版与栅格化能力。Stage A 只生成插画 motif；Stage B 把 motif、未经重绘的原图和真实文字组合成最终页面。缺少任一能力时，降级流程会在生成前停止，并返回完整 motif 提示词、画布尺寸、Copy Map、排版计划和缺失能力说明；它不会把仅有 motif 的结果冒充成完成的海报。

对于单阶段效果，如果宿主没有兼容的图片工具，Skill 会返回可直接复制的完整提示词，并明确说明没有生成图片。

## Gallery、预览与许可

[Gallery](https://wangjs-jacky.github.io/image-effects/) 是纯静态页面，只负责浏览效果和复制带版本的调用语句，不会生成图片，也不会接收用户上传。迁移预览均以彼此独立的虚构文字主题生成；Editorial Echo 使用虚构生成资产在本地完成合成。预览作者为 `wangjs-jacky`，采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可。

根目录 [LICENSE](./LICENSE) 仅覆盖本仓库的原创代码与适配内容，不会重新许可第三方材料。固定的上游作者、源码提交、逐文件哈希、许可证链接、适配说明和完整 MIT notice 均保留在 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。

## 贡献效果

1. 在 `references/effects/` 中新增一张带版本的效果卡，完整填写来源与许可证字段。
2. 在 `assets/previews/` 中加入一张已清除元数据的 JPEG 或 PNG 预览图。
3. 运行 Skill 包中记录的 Gallery 构建和效果验证命令。
4. 提交前检查生成的索引、Gallery 数据、预览、来源副本和第三方声明。

不要手工修改生成的 Gallery 文件或 `THIRD_PARTY_NOTICES.md`。
公开仓库会把 `THIRD_PARTY_NOTICES.header.md` 保留在根目录，因此干净检出无需依赖源仓库专用文件即可重新构建并测试 notice 输出。
