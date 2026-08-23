---
id: cosmetic-packaging
version: 1.0.0
title_en: Cosmetic Packaging
title_zh: 美妆包装设计
summary_en: Turn a product or concept into a coherent branding presentation with disciplined hierarchy, materials, and identity cues.
summary_zh: 将产品或概念转为统一的品牌展示，严格控制层级、材质和识别线索。
category: branding-and-packaging
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/cosmetic-packaging.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/branding-and-packaging/cosmetic-packaging.md,LICENSE
source_sha256s: 9eecdcd4f91d2d589a42fb9ad3612390f00f62289529616bf89149d337fd88fc,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 845c55564ef44ae9079d750702e2b2020566705122e7d46228f582db327fd9b9
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于"化妆品 / 护肤品瓶身、盒装、套装"包装设计视觉：

- 单瓶护肤品包装设计
- 化妆品系列套装包装
- 礼盒装包装
- 美妆电商主图（含包装）

特征：

- 强调瓶身形态 + 标签 + 材质
- 强调材质质感（玻璃 / 磨砂 / 金属盖）
- 通常含品牌名 + 产品名 + 容量
- 配色克制，高级感
- 单瓶或系列展示

### 适用范围

- 护肤品 / 化妆品包装设计
- 美妆礼盒
- 美妆电商主图

### 何时使用

- 用户提到"护肤品 / 化妆品 / 包装设计 / 瓶子"
- 用户希望产品包装的视觉

不要使用：

- 食品 / 饮料标签（用 `beverage-label-design.md`）
- 礼盒摄影（用 `product-visuals/packaging-showcase.md`）
- 单品白底图（用 `product-visuals/white-background-product.md`）

### 缺失信息优先提问顺序

1. 品牌名 + 风格定位（高奢 / 极简 / 文艺 / Y2K）
2. 产品类型（精华 / 面霜 / 洁面 / 香水）
3. 瓶身材质（玻璃 / 磨砂玻璃 / PETG / 陶瓷）
4. 主色 1-2 个
5. 单品 / 套装
6. 容量

### 主模板：单瓶护肤精华包装设计

📖 描述

整体一张图，主体为一支护肤精华瓶 + 外盒，背景为简洁场景。

📝 提示词

```json
{
  "type": "护肤精华单瓶包装设计",
  "goal": "生成一张可作为产品发布主图 / 包装提案 / 电商主图的化妆品包装视觉",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"LUMEN\"}",
    "positioning": "{argument name=\"positioning\" default=\"科学护肤 + 极简\"}"
  },
  "product": {
    "name": "{argument name=\"product name\" default=\"光子修护精华\"}",
    "subtitle": "{argument name=\"product subtitle\" default=\"PHOTON REPAIR SERUM\"}",
    "volume": "{argument name=\"volume\" default=\"30ml\"}",
    "form": "{argument name=\"bottle form\" default=\"圆柱形玻璃瓶 + 滴管\"}",
    "key_ingredient": "{argument name=\"ingredient\" default=\"5% 烟酰胺\"}"
  },
  "design": {
    "bottle_material": "{argument name=\"bottle material\" default=\"磨砂透明玻璃\"}",
    "label_material": "{argument name=\"label material\" default=\"哑光不干胶 + 烫银字\"}",
    "primary_color": "{argument name=\"primary color\" default=\"#0F4C81 深蓝\"}",
    "accent_color": "{argument name=\"accent color\" default=\"哑银\"}",
    "typography": "{argument name=\"typography\" default=\"现代 sans + 中文小字号\"}"
  },
  "outer_box": {
    "enabled": "{argument name=\"outer box\" default=\"true\"}",
    "shape": "{argument name=\"box shape\" default=\"立方体硬纸盒\"}",
    "finish": "{argument name=\"box finish\" default=\"哑光纸 + 烫银 logo\"}"
  },
  "scene": {
    "background": "{argument name=\"background\" default=\"米白色丝绸 + 柔光\"}",
    "props": "{argument name=\"props\" default=\"一片透明亚克力板 + 几滴水珠\"}",
    "lighting": "{argument name=\"lighting\" default=\"高级感软光 + 顶部主光\"}"
  },
  "format": {
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"4:5\"}",
    "composition": "瓶子主体居中偏右 + 外盒在后侧"
  },
  "constraints": {
    "must_keep": [
      "瓶身材质质感真实（玻璃应有反光与折射）",
      "标签字体清晰可读",
      "整体配色 ≤ 3 种",
      "高级感、克制"
    ],
    "avoid": [
      "标签字体 > 2 种",
      "背景过亮压过产品",
      "瓶身比例失真",
      "出现廉价塑料感（如果不是有意）"
    ]
  }
}
```

#### 参数策略

- 必问：品牌名、产品类型、瓶身形态
- 可默认：材质、配色、外盒、场景
- 可随机：道具细节

#### 自动补全策略

- 用户给品牌定位 + 产品类型时：自动展开瓶身 / 标签 / 配色 / 场景
- 高奢 = 黑金 / 极简 = 白蓝 / 文艺 = 米色木质 / Y2K = 高饱和
- 默认 4:5 竖版

### 变体 1：化妆品系列套装

📝 提示词

```json
{
  "type": "化妆品系列套装",
  "product": {
    "form": "5 件套（洁面 + 化妆水 + 精华 + 面霜 + 防晒）"
  },
  "design": {
    "consistency_rule": "5 件包装严格统一系统：相同瓶身比例 + 相同字体 + 相同配色"
  },
  "scene": {
    "composition": "5 件按高度排开 + 居中"
  },
  "constraints": {
    "must_feel": "套装级 + 系列识别度"
  }
}
```

### 变体 2：礼盒装

📝 提示词

```json
{
  "type": "化妆品礼盒装",
  "outer_box": {
    "enabled": true,
    "shape": "扁长方形礼盒（半开）",
    "finish": "丝绒包面 + 烫金 logo + 缎带"
  },
  "scene": {
    "background": "深色背景 + 聚光"
  },
  "constraints": {
    "must_feel": "节日 / 礼物级"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "化妆品包装自动补全",
  "mode": "auto-fill",
  "rule": "用户给品牌 + 产品类型 + 风格定位，自动决定瓶身 / 标签 / 外盒 / 场景",
  "constraints": {
    "must_feel": "可发产品发布会"
  }
}
```

### 避免事项

- 不要让产品名 + 容量字号差异过大
- 不要让标签字体超过 2 种
- 不要让瓶身比例失真
- 不要让背景过亮压过产品
- 不要让品牌 logo 出现在不显眼位置
- 不要让"高奢定位"的产品出现廉价材质

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
