---
id: qualitative-comparison-grid
version: 1.0.0
title_en: Qualitative Comparison Grid
title_zh: 定性对比网格
summary_en: Compile research content into a publication-ready academic figure with explicit hierarchy, restrained color, and honest labels.
summary_zh: 将研究内容编译为可发表的学术图示，强调明确层级、克制配色和诚实标注。
category: academic-figures
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/qualitative-comparison-grid.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/academic-figures/qualitative-comparison-grid.md,LICENSE
source_sha256s: d60f7de2e3cf458aa263be12a779d40d464f0ef767a864957f14788e4f01d632,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: d8f7ede8a4ee00b2498a96c0d4fdd7aa4e87a52e169e2087423923ff80c62756
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成"论文 qualitative results 对比网格"：

- CV 论文：多方法分割 / 检测 / 生成结果对比
- NLP 论文：多方法生成文本对比（截图式）
- 3D / 重建论文：多方法重建结果对比
- Diffusion / 图像生成论文：不同 prompt × 不同方法的网格
- Ablation study 的视觉对比

特征：

- 严格的网格：行 = 样本 / 输入，列 = 方法（含 GT 和 Ours）
- 列首行有方法名（带 citation）
- Ours 列通常加边框 / 高亮
- 单元格内容统一（图片 / 文本片段 / heatmap）
- 网格之间留细 gap，整体白底
- 可附 caption 解释

### 适用范围

- 论文 qualitative results section
- Ablation study 的视觉对比
- 顶会 supplementary 大网格图
- 综述论文 method gallery
- 答辩 PPT 对比页

### 何时使用

- 用户提到 "qualitative / 对比图 / comparison grid / methods comparison / ablation visual"
- 用户希望「行=样本、列=方法的标准论文对比网格」

不要使用：

- 用户要的是「双产品消费对比」 → 用 `infographics/comparison-infographic.md`
- 用户要的是「多人头像网格」 → 用 `avatars-and-profile/character-grid-portrait.md`
- 用户要的是「数据图表」 → 用 `academic-figures/publication-chart.md`
- 用户要的是「视频帧序列」 → 用 `storyboards-and-sequences/`

### 缺失信息优先提问顺序

1. 行数（样本数，建议 3-6 行）
2. 列数（方法数，建议 3-6 列，含 Input/GT 和 Ours）
3. 每列的方法名（含 citation 引用，如 "Method A [12]"）
4. 单元格内容类型（RGB 图 / mask / heatmap / 文本片段 / 3D 渲染）
5. 是否要 row labels（左侧标"Sample 1 / 2 / ..."或"Easy / Medium / Hard"）
6. 是否要在某些位置加红框 zoom-in（focus area）
7. 是否要 caption 注释

### 主模板：Qualitative comparison grid (M rows × N cols)

📖 描述

整张图是严格的 M×N 网格：每一行是一个样本，每一列是一个方法。最左可加 row labels，最上一行是列首（方法名 + citation）。Ours 列加边框高亮，可在某些 cell 内画红色 zoom-in 框。

📝 提示词

```json
{
  "type": "Qualitative Comparison Grid（论文级多方法多样本对比网格）",
  "goal": "生成一张可直接放进论文 qualitative results 章节的网格对比图，要求严格对齐、清晰列首、Ours 高亮、可单色印刷可读",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"4:3\"}",
    "background": "white #FFFFFF",
    "outer_padding": "40px"
  },
  "grid": {
    "rows": "{argument name=\"rows\" default=\"4\"}",
    "cols": "{argument name=\"cols\" default=\"5\"}",
    "cell_size_rule": "all cells identical size; gap between cells 4-6px",
    "cell_aspect": "{argument name=\"cell_aspect\" default=\"square\"}"
  },
  "headers": {
    "column_headers": {
      "enabled": true,
      "items": [
        { "id": "C1", "label": "{argument name=\"col1_name\" default=\"Input\"}" },
        { "id": "C2", "label": "{argument name=\"col2_name\" default=\"Method A [12]\"}" },
        { "id": "C3", "label": "{argument name=\"col3_name\" default=\"Method B [34]\"}" },
        { "id": "C4", "label": "{argument name=\"col4_name\" default=\"Method C [56]\"}" },
        { "id": "C5", "label": "{argument name=\"col5_name\" default=\"Ours\"}", "highlight": true }
      ],
      "style": "centered above each column, sans-serif bold 11pt, citations in smaller superscript or in [brackets]"
    },
    "row_labels": {
      "enabled": "{argument name=\"row_labels_enabled\" default=\"true\"}",
      "items": [
        "{argument name=\"row1_label\" default=\"Sample 1\"}",
        "{argument name=\"row2_label\" default=\"Sample 2\"}",
        "{argument name=\"row3_label\" default=\"Sample 3\"}",
        "{argument name=\"row4_label\" default=\"Sample 4\"}"
      ],
      "style": "rotated 90° on the left margin OR placed above each row in italic 10pt"
    }
  },
  "cell_content": {
    "type": "{argument name=\"content_type\" default=\"rgb_image\"}",
    "options_explained": {
      "rgb_image": "natural images / photos",
      "segmentation_mask": "color-coded mask overlays",
      "heatmap": "viridis / jet style heatmap",
      "depth_map": "grayscale or turbo colormap",
      "text_snippet": "rendered text block in a code-like box",
      "3d_render": "rendered 3D mesh from a fixed viewpoint",
      "side_by_side": "two halves: input | result"
    },
    "consistency_rule": "all cells in the same row should depict the SAME underlying sample so the comparison is fair"
  },
  "highlights": {
    "ours_column": {
      "enabled": true,
      "style": "thicker border 1.5px in deep red / accent color (e.g. #DC2626) around each Ours cell"
    },
    "zoom_in_boxes": {
      "enabled": "{argument name=\"zoom_in_enabled\" default=\"false\"}",
      "rule": "if true, draw small red rectangles inside cells highlighting interesting regions; same red box appears at the same coordinate across the row to make comparison fair",
      "callout_style": "optional zoomed crop placed below the row, connected by thin lines"
    }
  },
  "caption": {
    "enabled": "{argument name=\"caption_enabled\" default=\"true\"}",
    "label": "{argument name=\"figure_label\" default=\"Figure 4.\"}",
    "text": "{argument name=\"caption_text\" default=\"Qualitative comparison with state-of-the-art methods. Our method (last column) preserves fine details and reduces artifacts.\"}",
    "style": "below the grid, italic serif or compact sans-serif, justified, smaller font"
  },
  "constraints": {
    "must_keep": [
      "all cells identical size and tightly aligned",
      "white or near-white background, no gradient",
      "column headers clearly above each column with citation",
      "Ours column visually distinguished (border / shaded header)",
      "row content depicts the same sample across all methods",
      "if zoom-in boxes used, position is identical across the row",
      "labels in English by default, no mixing with Chinese unless requested",
      "must remain interpretable in grayscale print"
    ],
    "avoid": [
      "different cell sizes between rows / columns",
      "random colors as cell backgrounds (cells are content, not decoration)",
      "missing citations on baseline methods",
      "ours column hidden or unmarked",
      "rotated cells / tilted layouts (must be axis-aligned)",
      "decorative emoji / cartoon icons inside cells",
      "varying content type per row (e.g. one row mask, next row RGB) without explicit row label",
      "more than 6 cols (becomes unreadable in two-column paper format)"
    ]
  }
}
```

#### 参数策略

- **必问**：`rows`、`cols`、每列方法名（含 citation）、`content_type`
- **可默认**：`aspect_ratio`（4:3）、`row_labels_enabled`（true）、`caption_enabled`（true）
- **可随机**：列间 gap 精确像素、字体大小（在合理范围内）

#### 自动补全策略

- 用户给 "我有 4 个方法 + ours" → 自动加上 Input 列（成为 5 列：Input / M1 / M2 / M3 / M4 / Ours，共 6 列）
- 用户没给 row labels → 默认用 "Sample 1, 2, 3, ..." 或反问是否要分难易度
- 用户没给 citation → 提示 "建议加 [n] 引用占位" 而不是擅自编造
- 用户说 "ablation study" → 列名改为 "w/o A", "w/o B", "Full" 等消融变体
- 用户说 "需要 zoom-in" → 启用 `zoom_in_enabled` 并提示需要标 region 坐标

### 变体 1：纯文本 NLP qualitative 对比

```json
{
  "type": "NLP qualitative comparison grid",
  "modify": {
    "content_type": "text_snippet",
    "cell_aspect": "tall rectangle (e.g. 2:3 portrait)",
    "cell_styling": "monospace font in cell, black text on white, with key tokens highlighted in colored boxes",
    "row_labels": "input prompt / question 显示在每一行最左",
    "use_case": "对比多个 LLM / 翻译 / summarization 输出"
  }
}
```

适用：NLP 论文生成结果对比、机器翻译质量对比。

### 变体 2：分割 mask 多列对比（含彩色 overlay）

```json
{
  "type": "Segmentation mask comparison grid",
  "modify": {
    "content_type": "segmentation_mask",
    "cell_styling": "RGB image base + 半透明 mask 叠加；每类颜色一致；GT 列与 Ours 列容易对比",
    "extras": "在 cells 下方可加 'mIoU: 0.78' 等定量指标小字",
    "color_legend": "图右下角附小图例：颜色 → 类别名"
  }
}
```

适用：语义分割、实例分割、医学影像分割论文。

### 变体 3：Diffusion / 生成模型 prompt × method 矩阵

```json
{
  "type": "Generation prompt × method matrix",
  "modify": {
    "rows": "different text prompts (left labels show prompt text)",
    "cols": "different generation methods or different sampling steps",
    "cell_content": "generated images, all from same prompt across the row",
    "extras": "可在 ours 列加 '↑ +0.3 CLIP score' 小标"
  }
}
```

适用：扩散模型、文本到图像生成、图像编辑方法对比。

### 避免事项

- 单元格大小不一致 → 完全失去对比意义
- 缺 citation → 同行评审会扣分
- Ours 列没有标记 → 读者不知道哪个是你的
- 同一行的样本不一致（这一行第一列是猫，第二列是狗）→ 对比不成立
- 添加渐变 / 阴影 / 圆角过大 → 不像论文
- 用 emoji 或 cartoon 装饰 → 严重不专业
- 列数 > 6 → 论文双栏排版下看不清
- 没有 caption → 读者不知道这张图想说什么
- zoom-in 框位置在不同 cell 不一致 → 对比不公平

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
