---
id: beverage-label-design
version: 1.0.0
title_en: Beverage Label Design
title_zh: 饮品标签设计
summary_en: Turn a product or concept into a coherent branding presentation with disciplined hierarchy, materials, and identity cues.
summary_zh: 将产品或概念转为统一的品牌展示，严格控制层级、材质和识别线索。
category: branding-and-packaging
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/beverage-label-design.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/branding-and-packaging/beverage-label-design.md,LICENSE
source_sha256s: c880bba1457d58764f880c61d2a52291ce0ffadac6abd494dc5529fef53d57ea,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 38829dbcfe7e97e741d3ece750a9d0594a194e964f69d932d09df53ad719e0df
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于"饮料瓶 / 食品罐 / 调料瓶等的标签 + 包装设计"视觉：

- 饮料瓶标签设计
- 食品罐头标签
- 调味品瓶标签
- 中式 / 日式 / 西式 各种风格
- 单品摄影 + 标签设计混合

特征：

- 强调标签信息（品牌名 + 品名 + 容量 + 营养标）
- 标签字体 / 排版讲究
- 通常含插画 / 图形元素
- 包装结合环境拍摄
- 强调产品调性（健康 / 高奢 / 复古 / 国潮）

### 适用范围

- 饮料 / 食品标签设计
- 调味品包装
- 国潮 / 复古风饮料

### 何时使用

- 用户提到"饮料 / 食品 / 标签设计 / 罐装 / 瓶装"
- 用户希望出"包装 + 标签"完整设计

不要使用：

- 化妆品包装（用 `cosmetic-packaging.md`）
- 礼盒摄影（用 `product-visuals/packaging-showcase.md`）
- 通用 brand board（用 `brand-identity-board.md`）

### 缺失信息优先提问顺序

1. 品牌名 + 品类（茶 / 咖啡 / 果汁 / 调味）
2. 风格调性（国潮 / 日式 / 西式现代 / 复古）
3. 瓶 / 罐形态
4. 主色 1-2 个
5. 是否需要插画 / 图形
6. 是否需要营养标 / 警示

### 主模板：国潮风饮料标签设计

📖 描述

整体一张图，主体为一瓶饮料 + 标签设计，背景为东方风场景。

📝 提示词

```json
{
  "type": "国潮风饮料瓶标签设计",
  "goal": "生成一张可作为产品发布 / 电商主图的饮料瓶 + 标签视觉",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"东风茶事\"}",
    "positioning": "{argument name=\"positioning\" default=\"国潮 + 现代\"}",
    "product_name": "{argument name=\"product name\" default=\"清晨乌龙\"}",
    "product_subtitle": "{argument name=\"product subtitle\" default=\"OOLONG MORNING\"}",
    "volume": "{argument name=\"volume\" default=\"330ml\"}"
  },
  "bottle": {
    "form": "{argument name=\"bottle form\" default=\"短粗玻璃瓶 + 金属盖\"}",
    "material": "{argument name=\"material\" default=\"透明玻璃 + 茶汤可见\"}"
  },
  "label_design": {
    "style": "{argument name=\"label style\" default=\"水墨 + 工笔 + 留白\"}",
    "primary_color": "{argument name=\"primary color\" default=\"墨绿 + 金\"}",
    "background_color": "{argument name=\"label bg\" default=\"米白\"}",
    "illustration": "{argument name=\"illustration\" default=\"工笔 茶山 + 远山\"}",
    "typography": "{argument name=\"typography\" default=\"标题宋体 + 英文 sans\"}",
    "info_strip_bottom": "营养成分 + 容量 + 配料表（小字）"
  },
  "scene": {
    "background": "{argument name=\"background\" default=\"竹席 + 茶碗 + 一片绿叶\"}",
    "lighting": "{argument name=\"lighting\" default=\"自然柔光\"}"
  },
  "format": {
    "aspect_ratio": "{argument name=\"aspect ratio\" default=\"4:5\"}",
    "composition": "瓶身居中 + 微微倾斜 + 标签清晰朝镜头"
  },
  "constraints": {
    "must_keep": [
      "标签风格统一（不混搭水墨 + 美漫）",
      "标签字体 ≤ 2 种",
      "营养标 / 配料表小字可读但不喧宾夺主",
      "瓶身材质真实"
    ],
    "avoid": [
      "标签设计过满",
      "插画风格与文字风格冲突",
      "底色过亮压过插画",
      "出现错别字"
    ]
  }
}
```

#### 参数策略

- 必问：品牌名、品类、风格
- 可默认：瓶身、标签、场景
- 可随机：道具细节

#### 自动补全策略

- 用户给"国潮 / 日式 / 西式现代 / 复古"风格时：自动决定标签插画 + 配色 + 字体
- 默认 4:5 竖版
- 默认含小字营养标

### 变体 1：日式工艺风调味料瓶

📝 提示词

```json
{
  "type": "日式工艺风调味料瓶",
  "brand": {
    "product_name": "{argument name=\"product\" default=\"丸大豆酱油\"}"
  },
  "bottle": {
    "form": "复古短瓶 + 木塞"
  },
  "label_design": {
    "style": "日式工艺 + 手工书法 + 米色和纸",
    "primary_color": "深棕 + 朱红印章"
  },
  "scene": {
    "background": "原木桌面 + 竹笸箩"
  },
  "constraints": {
    "must_feel": "传统工艺感"
  }
}
```

### 变体 2：西式现代果汁

📝 提示词

```json
{
  "type": "西式现代果汁瓶",
  "brand": {
    "product_name": "COLD-PRESS ORANGE",
    "volume": "350ml"
  },
  "bottle": {
    "form": "高瘦透明 PET 瓶"
  },
  "label_design": {
    "style": "现代 minimal + 大字色块 + 清晰营养标",
    "primary_color": "亮橙 + 白"
  },
  "scene": {
    "background": "白色亚克力台 + 切半橙子"
  },
  "constraints": {
    "must_feel": "健康 + 现代 + 商超友好"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "饮料 / 食品标签自动补全",
  "mode": "auto-fill",
  "rule": "用户给品牌 + 品类 + 风格，自动决定瓶身 / 标签 / 插画 / 场景",
  "constraints": {
    "must_feel": "可直接送印刷厂"
  }
}
```

### 避免事项

- 不要混搭风格（国潮 + 美漫 同框）
- 不要让标签字体 > 2 种
- 不要漏掉营养标 / 配料表（除非是 mockup）
- 不要让瓶身比例失真
- 不要让插画喧宾夺主到品牌名认不出
- 不要让背景颜色高饱和压过产品

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
