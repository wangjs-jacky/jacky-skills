---
id: live-commerce-ui
version: 1.0.0
title_en: Live Commerce UI
title_zh: 直播电商界面
summary_en: Create a convincing interface scene with a clear product state, stable component hierarchy, and legible interaction focus.
summary_zh: 生成可信的界面场景，保持产品状态、组件层级和交互焦点清楚。
category: ui-mockups
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/live-commerce-ui.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/ui-mockups/live-commerce-ui.md,LICENSE
source_sha256s: bb0d9e4239c5c4f424c98c00c763aa9d81d1253912027146855cbab53c67571b,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 32004e9e21d739098ba84c05d9aa891040bf3eed9de5a3b33be699bed796cf73
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“人物肖像 + 直播平台叠加界面”的复杂视觉结果。

适用于：

- 电商直播界面
- 社交媒体直播截图
- 主播带货样机
- 聊天气泡 + 礼物弹窗 + 商品卡片的直播 UI 合成图

### 使用规则

这个模板的关键点不是固定某一个主播，而是把画面拆成一套稳定结构，让用户可以：

- 指定真人照片
- 指定名人名字
- 指定人物描述
- 完全随机生成一个主播人设

同理，商品卡、聊天消息、背景品牌、礼物内容都可以：

- 用户指定
- 用默认值
- 在合理范围内随机生成

### 缺失信息优先提问顺序

当用户只说“做一张电商直播 UI 样机”时，优先问：

1. 主播来源：真人照片 / 名人名字 / 人物描述 / 随机生成
2. 商品信息：卖什么
3. 平台风格：更像抖音 / 小红书 / 淘宝直播 / 通用直播样机
4. 语言：中文界面还是英文界面

如果用户不想逐项回答，可以明确提供一个“自动补全模式”：

- 你来随机补齐次要信息
- 仅保留用户指定的核心部分

### 模板 1：通用电商直播 UI 样机

📖 描述

生成逼真的社交媒体直播界面，叠加在人物肖像之上，包含可自定义的聊天消息、礼物弹窗和商品购买卡片。

📝 提示词

```json
{
  "type": "电商直播 UI 样机",
  "goal": "生成一张高仿真的直播带货截图风格视觉图，主体是主播肖像，叠加完整直播界面元素，适合做社交传播、概念样机或带货视觉方案演示",
  "subject": {
    "source_mode": "{argument name=\"host source mode\" default=\"celebrity-name\"}",
    "reference_photo": "{argument name=\"host reference photo\" default=\"none\"}",
    "celebrity_name": "{argument name=\"host name\" default=\"Elon Musk\"}",
    "description": "{argument name=\"host portrait description\" default=\"面带微笑，半身肖像，身穿印有白色科技示意图的黑色 T 恤\"}",
    "pose": "{argument name=\"host pose\" default=\"正对镜头，轻微前倾，像在直播间讲话\"}",
    "expression": "{argument name=\"host expression\" default=\"轻松、自信、具有交流感\"}"
  },
  "scene": {
    "background_style": "{argument name=\"background style\" default=\"科技公司发布会后台 + 直播间布景\"}",
    "left_background": "左侧显示带有 '{argument name=\"left background logo\" default=\"SPACEX\"}' 文字的屏幕",
    "right_background": "右侧显示红色的 '{argument name=\"right background logo\" default=\"Tesla T logo\"}' 和一辆深色汽车",
    "lighting": "{argument name=\"lighting\" default=\"明亮、商业感、影棚级补光，同时保留直播截图感\"}"
  },
  "ui_overlay": {
    "platform_style": "{argument name=\"platform style\" default=\"通用中文直播带货平台 UI\"}",
    "top_header": {
      "host_info": "头像，名称 '{argument name=\"host name\" default=\"Elon Musk\"}'，副标题 '55.6万本场点赞'，红色 '关注' 按钮",
      "rank_badge": "带有 '全站第1名' 的金币图标",
      "viewer_stats": "3 个顶部观众头像，显示 '12.3w'、'8.6w'、'5.7w'，总计 '68.7万'，'X' 关闭按钮",
      "right_links": "'更多直播 >'，'礼物展馆 0/24'（带有蓝色 '经典' 标签）"
    },
    "mid_left_gifts": {
      "count": 2,
      "items": [
        "头像 '科技爱好者'，'送小心心'，爱心图标 x 1314",
        "头像 '星辰大海'，'送火箭'，火箭图标 x 666"
      ]
    },
    "bottom_left_chat": {
      "system_message": "37 级勋章 '宇宙漫游者 加入了直播间'",
      "message_count": 7,
      "messages": [
        "小火箭: 马斯克！未来可期！🚀",
        "future: 特斯拉Model 2什么时候出？",
        "星空梦想家: SpaceX今年能上火星吗？",
        "AI探索者: Neuralink进展如何？",
        "帅气的网友: 马总好！",
        "Mars: 第一次来你的直播，超激动！",
        "用户123: 讲讲AI吧，会取代人类吗？"
      ]
    },
    "bottom_right_product_card": {
      "hot_tag": "橙色 '热卖 x 1888'",
      "image": "{argument name=\"product image subject\" default=\"Tesla Cybertruck\"}",
      "title": "{argument name=\"product name\" default=\"特斯拉Cybertruck 电动皮卡\"}",
      "price": "{argument name=\"product price\" default=\"¥ 1,618,000\"}",
      "button": "红色 '抢' 按钮",
      "floating_animation": "半透明爱心沿右侧边缘向上浮动"
    },
    "bottom_bar": {
      "input_field": "'说点什么...'",
      "icons": ["笑脸", "三个点", "购物车", "礼物盒", "分享"]
    }
  },
  "style": {
    "visual_target": "逼真的直播截图样机，不是纯 UI 设计稿，也不是纯摄影海报，而是主播真人画面与平台界面高自然融合",
    "rendering": "真实人像摄影 + 平台叠加 UI + 商业广告级清晰度",
    "color_tone": "科技感、商业感、平台直播氛围并存",
    "composition": "竖版直播截图构图，人物占据视觉中心，UI 清晰可读，商品卡位于右下角，聊天区位于左下角"
  },
  "constraints": {
    "must_keep": [
      "主播是视觉中心",
      "直播 UI 分层清晰",
      "商品卡、聊天区、礼物区都必须出现",
      "整体像真实直播截图，而不是简单拼贴"
    ],
    "avoid": [
      "UI 文字完全不可读",
      "界面过度拥挤",
      "人物脸部畸形",
      "商品卡透视错误",
      "聊天框与背景融在一起"
    ]
  }
}
```

### 模板 2：品牌创始人带货直播样机

📖 描述

适合“品牌创始人 / 科技企业家 / 明星主理人”本人出镜的高可信直播带货场景。

📝 提示词

```json
{
  "type": "品牌创始人直播带货样机",
  "subject": {
    "identity": "{argument name=\"host identity\" default=\"科技公司创始人\"}",
    "name": "{argument name=\"host name\" default=\"Elon Musk\"}",
    "description": "{argument name=\"host portrait description\" default=\"高可信度真人半身肖像，轻微微笑，像正在解释产品亮点\"}"
  },
  "product": {
    "name": "{argument name=\"product name\" default=\"旗舰智能电动车\"}",
    "category": "{argument name=\"product category\" default=\"科技硬件\"}",
    "price": "{argument name=\"product price\" default=\"¥ 399,999\"}",
    "selling_points": [
      "{argument name=\"selling point 1\" default=\"自动驾驶辅助\"}",
      "{argument name=\"selling point 2\" default=\"极简智能座舱\"}",
      "{argument name=\"selling point 3\" default=\"长续航\"}"
    ]
  },
  "ui": {
    "product_card": "高可信带货卡片，展示主图、标题、价格、强购买按钮",
    "chat_style": "观众围绕价格、发布时间、功能提问",
    "gift_style": "科技圈、粉丝向礼物文案"
  },
  "constraints": {
    "goal": "让整张图看起来像品牌本人真的在直播带货，而不是简单概念海报"
  }
}
```

### 模板 3：随机主播 + 随机商品自动补全模式

📖 描述

适用于用户只说“帮我做一张直播带货界面图”，但不给具体人物和商品。

📝 提示词

```json
{
  "type": "直播带货自动补全模板",
  "mode": "auto-fill",
  "subject": {
    "host_generation_mode": "random-but-plausible",
    "description": "自动生成一个适合直播出镜的主播形象，具备明确的人设、职业感和镜头表现力"
  },
  "product": {
    "generation_mode": "random-but-coherent",
    "rule": "自动生成与主播人设和场景一致的商品，不要出现明显不协调的搭配"
  },
  "ui": {
    "chat_messages": "自动生成与商品相关、看起来像真实直播观众会说的话",
    "gift_messages": "自动生成少量礼物弹窗，增强直播氛围",
    "product_card": "自动生成合理的商品名、价格与热卖标签"
  },
  "constraints": {
    "must_feel": [
      "真实",
      "平台感明确",
      "信息丰富但不杂乱",
      "适合作为案例样机"
    ]
  }
}
```

### 如何从这个模板生成变体

#### 变体 1：用户给照片

- 把 `subject.source_mode` 改为 `reference-photo`
- 用用户图片作为主体参考
- 其他 UI 字段保留模板结构

#### 变体 2：用户给名人名字

- 用 `celebrity-name`
- 保留描述字段作为辅助形象说明

#### 变体 3：用户只给人物描述

- 用 `text-description`
- 让模板中的 `description` 成为主导字段

#### 变体 4：用户什么都没给

- 用 `auto-fill`
- 只对核心字段发起少量必要提问
- 其余字段可以随机补全

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
