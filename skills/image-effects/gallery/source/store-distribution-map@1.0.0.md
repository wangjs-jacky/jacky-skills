---
id: store-distribution-map
version: 1.0.0
title_en: Store Distribution Map
title_zh: 门店分布地图
summary_en: Turn place information into an illustrated map with a legible route or spatial hierarchy and no invented geographic claims.
summary_zh: 把地点信息转为插画地图，路线或空间层级清楚，并避免虚构地理事实。
category: maps
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/store-distribution-map.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/maps/store-distribution-map.md,LICENSE
source_sha256s: bb05d08f79ab0e4c4fceebf779da95f8b3d077559d3506a522f6565396b78f53,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: a8c342bda1d2b28c11c14e71490b9508fc3bc012a1152c7f173f6a0465b6c79b
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“品牌 / 餐饮 / 零售门店在某区域内分布”的可视化地图：

- 连锁品牌门店分布
- 加盟商招商地图
- 城市 / 商圈门店覆盖
- 节日活动可达门店标记
- 银行 / 充电桩 / 共享设施分布

### 适用范围

- 全国 / 全省 / 全市级别的门店分布
- 单一商圈门店分布
- 加盟招商展示图
- 区域服务覆盖图

### 何时使用

- 用户提到“门店分布 / 网点分布 / 覆盖图 / 门店地图 / 加盟招商”
- 用户希望一张图能讲清楚“在哪有门店”
- 用户希望突出门店密度与品牌覆盖

不要使用：

- 美食探店地图（用 `food-map.md`）
- 路线图（用 `travel-route-map.md`）
- 城市风貌图（用 `illustrated-city-map.md`）

### 缺失信息优先提问顺序

1. 区域：全国 / 全省 / 全市 / 商圈
2. 品牌名 + logo 描述
3. 门店类型：旗舰店 / 标准店 / 快闪店 / 加盟店
4. 门店数量与具体名称（或允许我列）
5. 是否需要图例区分门店类型
6. 风格：品牌色现代扁平 / 拟真地图 / 信息图风

### 主模板：现代扁平品牌门店分布图

📖 描述

底图为简化的区域轮廓，门店以品牌色图钉 / 图标点位标注，配品牌信息卡 + 图例。

📝 提示词

```json
{
  "type": "品牌门店分布图",
  "goal": "生成一张能直接用于品牌官网 / 招商手册 / 节日活动的门店分布可视化地图",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"AURA Coffee\"}",
    "logo_description": "{argument name=\"brand logo\" default=\"金色咖啡豆 + 品牌字\"}",
    "brand_color": "{argument name=\"brand color\" default=\"暖棕 + 奶油白\"}"
  },
  "scope": {
    "region": "{argument name=\"region scope\" default=\"全国\"}",
    "base_map_style": "{argument name=\"base map style\" default=\"简化省份轮廓 + 浅色填色\"}"
  },
  "stores": {
    "total_count": "{argument name=\"total stores\" default=\"168\"}",
    "by_type": [
      "{argument name=\"flagship\" default=\"旗舰店 8 家\"}",
      "{argument name=\"standard\" default=\"标准店 120 家\"}",
      "{argument name=\"pop_up\" default=\"快闪店 12 家\"}",
      "{argument name=\"franchise\" default=\"加盟店 28 家\"}"
    ],
    "highlight_cities": "{argument name=\"highlight cities\" default=\"北京、上海、广州、深圳、成都、杭州\"}"
  },
  "marker_design": {
    "shapes": "圆形品牌色图钉 + 不同尺寸代表不同类型",
    "rule": "尺寸排序：旗舰 > 标准 > 快闪 > 加盟"
  },
  "info_panel": {
    "enabled": "{argument name=\"info panel enabled\" default=\"true\"}",
    "position": "{argument name=\"info panel position\" default=\"右侧\"}",
    "content": [
      "总门店数",
      "覆盖城市数",
      "近一年新开",
      "重点城市 Top 5"
    ]
  },
  "legend": {
    "items": [
      "大圆点：旗舰店",
      "中圆点：标准店",
      "三角：快闪店",
      "方块：加盟店"
    ]
  },
  "extras": ["品牌 logo 角标", "招商联系方式区"],
  "constraints": {
    "must_keep": [
      "门店密度真实合理（不要全国都是密点）",
      "品牌色严格统一",
      "图例与门店类型对应",
      "重点城市清晰可读"
    ],
    "avoid": [
      "底图细节过多盖过门店",
      "出现非品牌色",
      "标记过密导致看不清",
      "图例缺失"
    ]
  }
}
```

#### 参数策略

- 必问：品牌、区域、门店数量、品牌色
- 可默认：图例样式、信息卡内容
- 可随机：城市排序、次要装饰

#### 自动补全策略

- 用户只给品牌名时：自动设定 100-200 家门店级别，重点城市选 Top 5-10
- 品牌色未指定时根据行业常用色（咖啡棕、奶茶粉、零售蓝、医疗绿）
- 图例最少 2 项最多 5 项

### 变体 1：单商圈密度图

📝 提示词

```json
{
  "type": "商圈门店密度图",
  "scope": {
    "region": "{argument name=\"district\" default=\"上海·静安寺商圈\"}"
  },
  "stores": {
    "total_count": "{argument name=\"store count\" default=\"24\"}",
    "highlight_cities": "门店具体名称 + 编号"
  },
  "constraints": {
    "must_feel": "本地化、密度感、街区级"
  }
}
```

### 变体 2：服务覆盖图（充电桩 / 网点 / 服务点）

📝 提示词

```json
{
  "type": "服务覆盖分布图",
  "service": {
    "name": "{argument name=\"service name\" default=\"NEX 充电网络\"}",
    "color": "{argument name=\"service color\" default=\"科技蓝 + 高亮黄\"}"
  },
  "stations_count": "{argument name=\"station count\" default=\"800+\"}",
  "marker_design": {
    "shapes": "闪电图标 + 不同颜色代表充电速度等级"
  },
  "legend": {
    "items": ["黄色：超充", "蓝色：快充", "灰色：慢充"]
  },
  "constraints": {
    "must_feel": "科技、专业、可靠"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "门店分布图自动补全模板",
  "mode": "auto-fill",
  "rule": "用户给品牌 + 行业，自动估计门店规模、品牌色、图例",
  "constraints": {
    "must_feel": "招商手册级"
  }
}
```

### 避免事项

- 不要让点位密度脱离真实（小品牌不要画成全国满屏点）
- 不要让品牌 logo 淹没在地图细节里
- 不要把多个不同行业品牌混在一张图
- 不要让信息卡占据超过 1/3 画面
- 不要使用真实地图截图风（这是品牌图，不是 GIS 截图）

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
