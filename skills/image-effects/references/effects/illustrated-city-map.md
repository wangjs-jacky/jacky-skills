---
id: illustrated-city-map
version: 1.0.0
title_en: Illustrated City Map
title_zh: 城市插画地图
summary_en: Turn place information into an illustrated map with a legible route or spatial hierarchy and no invented geographic claims.
summary_zh: 把地点信息转为插画地图，路线或空间层级清楚，并避免虚构地理事实。
category: maps
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/illustrated-city-map.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/maps/illustrated-city-map.md,LICENSE
source_sha256s: 076ee40e4cd1606d286096584fe001fefd23da8a376ff45907d6d18ae5f471b8,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: eaba06f64a4488fd33983435672a1e15a88140e5a860b2ad9de85c329093ff52
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“一座城市的整体风貌地图”，不专注美食 / 路线 / 门店，而是城市本身：

- 城市旅游推广图
- 城市文化主视觉
- 城市 IP 形象
- 节日活动主视觉
- 教育 / 公共宣传图

特征：

- 城市级覆盖
- 多个标志性地标分布
- 风格化插画
- 中心可有城市象征 / 江河 / 山脉

### 适用范围

- 整体城市风貌图
- 城市文化主视觉
- 城市 IP 形象图
- 区 / 街道级别风貌图

### 何时使用

- 用户提到“城市地图 / 城市插画地图 / 城市风貌图 / 城市主视觉地图”
- 用户希望突出城市文化与地标，而不是美食 / 路线

不要使用：

- 美食主题（用 `food-map.md`）
- 路线主题（用 `travel-route-map.md`）
- 门店分布主题（用 `store-distribution-map.md`）

### 缺失信息优先提问顺序

1. 城市 / 区域名
2. 风格：复古水彩 / 现代扁平 / Q 萌 / 等距 3D / 国潮
3. 想突出哪几个地标（5-12 处）
4. 是否要包含江 / 河 / 山 / 湖
5. 是否要中心吉祥物
6. 语种：中文 / 双语

### 主模板：复古水彩城市风貌图

📖 描述

整体俯视视角的手绘城市插画，标志性建筑分布在画面中，地形元素（江、山、桥）作为视觉骨架，边角点缀文化元素。

📝 提示词

```json
{
  "type": "城市风貌插画地图",
  "goal": "生成一张代表整座城市风貌的插画地图，可作为城市文化主视觉、旅游主图、城市 IP 主视觉",
  "style": "{argument name=\"art style\" default=\"复古水彩 + 米色羊皮纸\"}",
  "title_section": {
    "city": "{argument name=\"city\" default=\"杭州\"}",
    "title_text": "{argument name=\"title\" default=\"千年杭城风貌图\"}",
    "subtitle": "{argument name=\"subtitle\" default=\"江南诗意 · 山水之间\"}"
  },
  "geography_skeleton": {
    "rivers_or_lakes": "{argument name=\"water elements\" default=\"西湖、钱塘江\"}",
    "mountains": "{argument name=\"mountains\" default=\"宝石山、雷峰山\"}",
    "main_streets": "{argument name=\"streets\" default=\"南山路、湖滨路\"}"
  },
  "landmarks": {
    "count": "{argument name=\"landmark count\" default=\"10\"}",
    "items": "{argument name=\"landmarks\" default=\"雷峰塔、断桥、苏堤、灵隐寺、城隍阁、清河坊、龙井村、河坊街、京杭大运河、西溪湿地\"}"
  },
  "centerpiece": "{argument name=\"centerpiece\" default=\"画面中央保留西湖与雷峰塔作为视觉核心\"}",
  "edge_decorations": [
    "{argument name=\"deco 1\" default=\"江南屋檐剪影\"}",
    "{argument name=\"deco 2\" default=\"飞舞的桂花\"}",
    "{argument name=\"deco 3\" default=\"诗意题字小印章\"}"
  ],
  "extras": ["复古罗盘", "细线边框", "城市文化短句"],
  "constraints": {
    "must_keep": [
      "标志性地标必须可识别",
      "江 / 湖 / 山的相对位置不能严重错乱",
      "整体保持手绘水彩感"
    ],
    "avoid": [
      "现代汽车 / 高速公路 / 摩天大楼喧宾夺主",
      "标签字体多种风格",
      "颜色饱和度过高"
    ]
  }
}
```

#### 参数策略

- 必问：城市名、风格、地标列表（或允许我列）
- 可默认：边角装饰、罗盘、副标题
- 可随机：题字小印章、装饰花卉

#### 自动补全策略

- 用户只给城市名时：自动选 8-12 个经典地标 + 该城市最具识别度的地形
- 风格默认水彩
- 题字默认与城市文化相关短句

### 变体 1：现代扁平等距视角

📝 提示词

```json
{
  "type": "现代扁平等距城市插画地图",
  "city": "{argument name=\"city\" default=\"深圳\"}",
  "style": "扁平矢量 + 等距 3D + 鲜亮蓝绿色调",
  "highlights": [
    "{argument name=\"highlight 1\" default=\"深圳湾\"}",
    "{argument name=\"highlight 2\" default=\"平安金融中心\"}",
    "{argument name=\"highlight 3\" default=\"OCT 创意园\"}"
  ],
  "constraints": {
    "must_feel": "现代、科技、年轻"
  }
}
```

### 变体 2：国潮 Q 萌城市图

📝 提示词

```json
{
  "type": "Q 萌国潮城市插画地图",
  "city": "{argument name=\"city\" default=\"成都\"}",
  "style": "Q 萌国潮 + 暖橙 + 米色，所有元素拟人化",
  "centerpiece": "{argument name=\"centerpiece\" default=\"卡通熊猫坐在地图中央\"}",
  "constraints": {
    "must_feel": "可爱、年轻、文创周边可用"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "城市风貌图自动补全模板",
  "mode": "auto-fill",
  "rule": "用户给城市名即可，自动决定风格、地标、装饰",
  "constraints": {
    "must_feel": "可以直接当作旅游 / 文创主视觉"
  }
}
```

### 避免事项

- 不要把城市地图压成真实精确比例
- 不要把整座城市的高楼都画上去（视觉上会崩）
- 不要让江 / 河方向出现明显错误
- 不要让边框装饰盖过主图
- 不要塞超过 15 个地标

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
