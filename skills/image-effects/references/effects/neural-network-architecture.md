---
id: neural-network-architecture
version: 1.0.0
title_en: Neural Network Architecture
title_zh: 神经网络架构图
summary_en: Compile research content into a publication-ready academic figure with explicit hierarchy, restrained color, and honest labels.
summary_zh: 将研究内容编译为可发表的学术图示，强调明确层级、克制配色和诚实标注。
category: academic-figures
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/neural-network-architecture.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/academic-figures/neural-network-architecture.md,LICENSE
source_sha256s: 26b52cd628e82567658f071b44ba0bcaa6045b985e42beeb731564a27e1f8719,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 461b3024ac407781c1859814585252c196b5512597482cc011a8dd7b841ecdd0
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成"论文中那种神经网络架构图"：

- Transformer / Encoder-Decoder 架构图
- U-Net / FPN / 多尺度网络架构
- GAN / Diffusion / VAE 架构
- Attention 机制示意
- 自定义模型架构图

特征：

- 多个 layer 块按数据流方向排布（横向或竖向）
- 每个 layer 块有：层名 + tensor shape 标注（H × W × C）
- 跳连 / residual / attention 连线清晰
- 颜色编码不同 layer 类型（Conv / Attention / FC / Norm）
- 出版物级，白底克制

### 适用范围

- 论文中的 model architecture figure
- 综述论文 framework
- 答辩 PPT 模型介绍页
- 教学 slide 中的网络示意

### 何时使用

- 用户提到 "网络架构 / network architecture / model architecture / Transformer / U-Net / GAN / Diffusion / VAE"
- 用户希望「层级清晰、tensor shape 标准、跳连一目了然」
- 用户希望视觉「论文风、白底、彩色编码 layer 类型」

不要使用：

- 用户要的是「方法 pipeline 总览」（多 stage 业务流）→ 用 `academic-figures/method-pipeline-overview.md`
- 用户要的是「系统架构图」（前端 + 后端 + DB）→ 用 `technical-diagrams/system-architecture.md`
- 用户要的是「数据流向 / ER 图」 → 用 `technical-diagrams/er-diagram.md`
- 用户要的是「概念示意 / 注意力可视化」（自由度高）→ 用 `academic-figures/scientific-schematic.md`

### 缺失信息优先提问顺序

1. 模型类型（Encoder-Decoder / U-Net / Transformer / GAN / Diffusion / 自定义）
2. 主干网络层数 / 每层类型（如「6 层 Transformer encoder + 6 层 decoder + 8 头 attention」）
3. Tensor shape（输入分辨率 / 通道数 / 序列长度）
4. 是否有跳连 / residual / cross-attention
5. 是否有 multi-task / multi-head 输出
6. 是否要中文标签（论文图通常英文）
7. 比例（横向 16:9 / 2:1，符合论文双栏）

### 主模板：Transformer / Encoder-Decoder 架构图

📖 描述

整张图横向流动：左输入 embedding → 多层 encoder 块 → cross-attention → 多层 decoder 块 → 右输出 head。每个 layer 块标注层类型与 tensor shape，跳连用弧形虚线。

📝 提示词

```json
{
  "type": "神经网络架构图（neural network architecture diagram）",
  "goal": "生成论文级别的网络架构图：层级清晰、tensor shape 标注、跳连分明、可单色印刷可读",
  "canvas": {
    "aspect_ratio": "{argument name=\"aspect_ratio\" default=\"16:9\"}",
    "background": "white #FFFFFF",
    "outer_padding": "60px"
  },
  "model_meta": {
    "name": "{argument name=\"model_name\" default=\"Our Transformer\"}",
    "input_spec": "{argument name=\"input_spec\" default=\"Input Image: 224×224×3\"}",
    "output_spec": "{argument name=\"output_spec\" default=\"Class Logits: 1000\"}"
  },
  "layer_groups": {
    "rule": "use color-coded blocks per layer type — keep palette ≤ 5 muted academic colors",
    "color_legend": [
      { "type": "Embedding / PatchEmbed", "fill": "#E0E7FF", "border": "#6366F1" },
      { "type": "Self-Attention", "fill": "#FEE2E2", "border": "#DC2626" },
      { "type": "Cross-Attention", "fill": "#FEF3C7", "border": "#D97706" },
      { "type": "Feed Forward / MLP", "fill": "#D1FAE5", "border": "#059669" },
      { "type": "Norm / Residual", "fill": "#F3F4F6", "border": "#6B7280" }
    ]
  },
  "layers": {
    "count": "{argument name=\"layer_count\" default=\"8\"}",
    "items": [
      { "id": "L1", "type": "Embedding / PatchEmbed", "name": "Patch Embed", "shape": "196×768" },
      { "id": "L2", "type": "Norm / Residual", "name": "LayerNorm", "shape": "196×768" },
      { "id": "L3", "type": "Self-Attention", "name": "Multi-head Self-Attn (×8)", "shape": "196×768", "annotation": "× N=6 (encoder)" },
      { "id": "L4", "type": "Feed Forward / MLP", "name": "FFN", "shape": "196×768" },
      { "id": "L5", "type": "Cross-Attention", "name": "Cross-Attn", "shape": "K×768" },
      { "id": "L6", "type": "Self-Attention", "name": "Decoder Self-Attn", "shape": "K×768", "annotation": "× N=6 (decoder)" },
      { "id": "L7", "type": "Feed Forward / MLP", "name": "FFN", "shape": "K×768" },
      { "id": "L8", "type": "Norm / Residual", "name": "Output Head (Linear)", "shape": "K×C" }
    ]
  },
  "block_style": {
    "shape": "rounded rectangle (corner radius 4-6px)",
    "size_rule": "blocks of same layer type share identical width and height; visually grouped",
    "border": "1.2px solid (use the type's border color)",
    "fill": "use the type's fill color (very light tint)",
    "label_text": "layer name on first line (sans-serif bold 10-11pt) + tensor shape on second line (monospace italic 9pt)",
    "annotation_text": "if 'annotation' present (e.g. '× N=6'), draw it as a curly brace with label on the right side of the repeated block"
  },
  "connections": {
    "main_flow": {
      "style": "thin black solid arrows (1.2px), horizontal left → right",
      "arrowhead": "small filled triangle"
    },
    "residual": {
      "enabled": "{argument name=\"residual_enabled\" default=\"true\"}",
      "style": "curved dashed arrow arcing above the main flow, label '+' near join",
      "rule": "draw residual from input of attention block to its output"
    },
    "cross_attention": {
      "enabled": "{argument name=\"cross_attention_enabled\" default=\"true\"}",
      "style": "horizontal arrow from encoder side feeding into decoder cross-attn, label 'K, V'",
      "rule": "encoder output is shown as K, V input to decoder cross-attn"
    }
  },
  "extras": {
    "show_param_count": {
      "enabled": "{argument name=\"show_params\" default=\"false\"}",
      "rule": "if true, add parameter count below each major group (e.g. '85M params')"
    },
    "highlight_novelty": {
      "enabled": "{argument name=\"highlight_novelty\" default=\"true\"}",
      "rule": "if true, surround the user's contributed module with a thicker dashed orange border + label 'Ours' / 'Novel'"
    }
  },
  "constraints": {
    "must_keep": [
      "tensor shapes are accurate and labeled in monospace font",
      "color encodes layer type consistently across the figure",
      "all layers of the same type have identical block size",
      "white background, no gradient, no decoration",
      "all labels in English by default (or all Chinese if explicitly requested), no mixing",
      "must remain readable when printed in grayscale (rely on shape and label, not color alone)",
      "novel contribution (if any) is clearly marked"
    ],
    "avoid": [
      "3D extruded blocks, drop shadows, glossy fills",
      "rainbow palette (>5 colors)",
      "cartoon icons, emoji",
      "freeform 'art-style' blobs instead of crisp rectangles",
      "tensor shapes typeset in proportional font",
      "arrows crossing through blocks",
      "missing tensor shape labels (the figure is then useless for paper review)",
      "unlabeled cross-attention (must say K, V)"
    ]
  }
}
```

#### 参数策略

- **必问**：`layer_count`、每层的 `type` 和 `shape`
- **可默认**：`aspect_ratio`（16:9）、`background`（白）、`color_legend`（默认 5 类配色）、`block_style`
- **可随机**：blocks 内每行的精确字号 / padding，annotation 摆放位置

#### 自动补全策略

- 用户给「我用 Transformer」但没给细节 → 反问关键参数（层数、头数、隐藏维度、序列长度）；不要瞎编模型规模
- 用户给「U-Net」 → 自动用 contracting + expansive 双臂布局变体（见变体 2）
- 用户没说有没有 residual → 默认 `residual_enabled: true`（绝大多数现代网络都有）
- 用户没说有没有 novelty → 默认 `highlight_novelty: true`（论文图一般要标自己的贡献）
- 用户没说参数量 → 默认 `show_params: false`（除非用户提到模型规模对比）

### 变体 1：U-Net / FPN 双臂架构

```json
{
  "type": "U-Net / FPN 双臂架构图",
  "modify": {
    "layout": "U 形：左臂下采样（contracting path）+ 中央 bottleneck + 右臂上采样（expansive path），每层之间有水平 skip connection",
    "annotation": "skip 用横向虚线箭头标注，特征图用渐窄 / 渐宽的矩形示意 spatial 维度变化"
  }
}
```

适用：U-Net、FPN、HRNet、所有 encoder-decoder 分割网络。

### 变体 2：GAN / Diffusion 双网络对抗 / 多步推理

```json
{
  "type": "GAN / Diffusion 架构图",
  "modify": {
    "layout_gan": "上方 Generator（noise → image）+ 下方 Discriminator（image → real/fake），中间共享生成图像作为 D 的输入",
    "layout_diffusion": "横向 timestep 序列 t=T → t=0，每个 timestep 是同一个 U-Net 实例，标 't' 嵌入条件"
  }
}
```

适用：GAN 系列、扩散模型、Score-based 模型。

### 变体 3：Multi-task / Multi-head 输出

```json
{
  "type": "多任务 / 多头输出架构图",
  "modify": {
    "layout": "共享 backbone 在中央 → 右侧分叉成 2-4 个 task head（如 classification head / regression head / segmentation head）",
    "annotation": "每个 head 旁边标对应 loss 函数和权重 λ"
  }
}
```

适用：多任务学习、检测 + 分割、辅助监督。

### 避免事项

- tensor shape 缺失或随便写 → 论文图核心信息没了
- 用渐变 / 3D 立方体堆叠 → 像 PPT 不像论文
- 颜色 ≥ 6 种 → 失去 layer 类型语义
- 没有 residual / cross-attention 标注（如果架构里有）→ 误导读者
- 用 Comic Sans / 手写字体
- 跳连箭头穿过 layer 块
- 同一类 layer 块大小不一致
- 中英文标签混用
- 把"训练 loss"画进结构图（应该单独一张 training figure 或 caption 里说明）
- 在结构图里塞具体超参数表（应该走 table，不进 figure）

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
