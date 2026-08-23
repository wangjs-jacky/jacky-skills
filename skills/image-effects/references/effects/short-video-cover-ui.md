---
id: short-video-cover-ui
version: 1.0.0
title_en: Short Video Cover UI
title_zh: 短视频封面界面
summary_en: Create a convincing interface scene with a clear product state, stable component hierarchy, and legible interaction focus.
summary_zh: 生成可信的界面场景，保持产品状态、组件层级和交互焦点清楚。
category: ui-mockups
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/short-video-cover-ui.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/ui-mockups/short-video-cover-ui.md,LICENSE
source_sha256s: f0a80b72a29f357ba034f5cf3c0af4432ba661f11830c100d99ba6971baa3729,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 64fdbdf527ae211279dd389aa7b8fa3cceea65b1f03ce03162546042af789b5e
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“短视频封面 + UI 元素”样机，例如：

- 抖音 / 快手 / B 站 / 小红书 视频封面
- YouTube / Twitch 缩略图
- VTuber / 主播 stream 封面
- 自媒体节目封面
- 社交平台短视频封面

特点：

- 主体大、文字大、信息层级高
- 必须有可视化“点击诱因”
- 文字与人物 / 主体画面强叠加

它跟 `live-commerce-ui.md` 的区别：

- 直播 UI：仿真整个直播间界面（聊天 / 礼物 / 商品）
- 本模板：只是封面图层，重点在抓眼球的标题 + 主视觉

### 适用范围

- 短视频平台封面图
- YouTube / Bilibili / Twitch 缩略图
- 节目主视觉
- 直播预告图
- 课程 / 知识类视频封面

### 何时使用

- 用户提到“封面 / 缩略图 / 短视频封面 / 视频首图”
- 用户希望生成一张点击率高的视觉
- 用户给出节目名 / 标题 / 主播 / 主题

不要使用：

- 用户要的是真实直播间截图（用 `live-commerce-ui.md`）
- 用户要的是社交动态详情页（用 `social-interface-mockup.md`）

### 缺失信息优先提问顺序

1. 平台：抖音 / 快手 / 小红书 / B 站 / YouTube / Twitch
2. 内容类型：知识科普 / 生活 vlog / 游戏 / 直播预告 / 商业广告 / 萌系内容
3. 主标题文案
4. 主体（真人 / 卡通 / 物品 / 抽象主视觉）
5. 风格：高对比醒目 / 软萌少女 / 冷静极简 / 暗黑神秘
6. 是否需要副标题、bullet、徽章

### 主模板：知识类高对比短视频封面

📖 描述

仿真“讲清楚一件事的科普 / 解读类视频封面”，主体偏右，左侧为大字标题，附副标题与点状要点。

📝 提示词

```json
{
  "type": "短视频科普类封面样机",
  "goal": "生成一张高点击率的视频封面图，包含主标题、副标题、主视觉、平台风格小标识",
  "platform": "{argument name=\"platform\" default=\"通用短视频封面\"}",
  "aspect_ratio": "{argument name=\"aspect ratio\" default=\"16:9\"}",
  "background": {
    "color_palette": "{argument name=\"color palette\" default=\"深蓝渐变 + 高亮黄\"}",
    "texture": "{argument name=\"texture\" default=\"细微噪点 + 柔光\"}"
  },
  "main_visual": {
    "subject": "{argument name=\"main subject\" default=\"一位看向镜头并指向左侧标题的中年男性\"}",
    "position": "{argument name=\"subject position\" default=\"画面右侧 1/3\"}",
    "expression": "{argument name=\"expression\" default=\"有信服感、略带惊讶\"}"
  },
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"99% 的人都不知道的 ChatGPT 用法\"}",
    "title_style": "{argument name=\"title style\" default=\"白底黑字粗黑体 + 局部高亮黄色描边\"}",
    "sub_title": "{argument name=\"sub title\" default=\"一招提升 10 倍效率\"}",
    "bullet_points": {
      "count": "{argument name=\"bullet count\" default=\"3\"}",
      "items": [
        "{argument name=\"bullet 1\" default=\"自动整理会议纪要\"}",
        "{argument name=\"bullet 2\" default=\"批量生成 PPT 大纲\"}",
        "{argument name=\"bullet 3\" default=\"一键写邮件模板\"}"
      ]
    }
  },
  "platform_marks": {
    "logo_or_handle": "{argument name=\"creator handle\" default=\"@效率怪人\"}",
    "duration_label": "{argument name=\"duration\" default=\"06:24\"}"
  },
  "style": {
    "rendering": "封面图必须像真实视频封面，而不是普通海报",
    "contrast": "标题必须在 1 米外都能看清",
    "consistency": "整体风格一致，不出现风格冲突"
  },
  "constraints": {
    "must_keep": [
      "主标题视觉权重最高",
      "主视觉与标题不相互遮挡",
      "颜色对比度足够高"
    ],
    "avoid": [
      "标题过长导致换行混乱",
      "主体表情夸张到掉档次",
      "边角小字过多"
    ]
  }
}
```

#### 参数策略

- 必问：主标题、主体、平台、风格
- 可默认：副标题、徽章、小字标签
- 可随机：bullet points 的次序与具体措辞，但与主题强相关

#### 自动补全策略

- 主标题为空时不要自动编造，必须问
- 副标题缺失可自动补一个“数字 + 动词”句式
- bullet points 必须 ≤ 4 条
- 主体表情默认“信服 + 略带惊讶”

### 变体 1：可爱风 VTuber / 主播预告封面

📝 提示词

```json
{
  "type": "VTuber / 主播预告封面",
  "style": "anime, 高对比可爱粉系，闪光、爱心、星星装饰",
  "character": {
    "description": "{argument name=\"character description\" default=\"棕发双丸子头动漫女孩，琥珀色眼眸，温柔微笑\"}",
    "outfit": "{argument name=\"outfit\" default=\"粉色和服 + 白色女仆围裙，樱花发饰\"}",
    "pose": "{argument name=\"pose\" default=\"手持装饰花朵的粉色麦克风\"}"
  },
  "layout": {
    "background": "{argument name=\"background\" default=\"粉色渐变 + 闪光 + 心形 + 蝴蝶结\"}",
    "text_sections": [
      {
        "type": "顶部丝带",
        "text": "{argument name=\"top ribbon\" default=\"今晚开播一起聊聊吧～\"}"
      },
      {
        "type": "主标题",
        "text": "{argument name=\"main title\" default=\"杂谈直播\"}",
        "decorations": "周围 3 个大桃子插画"
      },
      {
        "type": "中间丝带",
        "text": "{argument name=\"middle ribbon\" default=\"想和大家度过开心的时光♡\"}"
      },
      {
        "type": "底部要点",
        "items": [
          "新人友好",
          "礼物回收",
          "ROMO"
        ]
      },
      {
        "type": "底部说话框",
        "text": "评论大欢迎♪ 一起多聊聊吧"
      }
    ]
  },
  "constraints": {
    "must_feel": "像真实主播预告封面，不是同人插画"
  }
}
```

### 变体 2：开箱 / 评测视频封面

📝 提示词

```json
{
  "type": "开箱评测视频封面",
  "platform": "{argument name=\"platform\" default=\"YouTube\"}",
  "aspect_ratio": "16:9",
  "main_visual": {
    "subject": "{argument name=\"main product\" default=\"一台尚未拆封的科技产品包装盒\"}",
    "host": "{argument name=\"host description\" default=\"画面左侧主播半身，表情夸张惊喜\"}",
    "extras": ["盒子周围环绕的发光线条", "局部撕开包装的悬念感"]
  },
  "title_block": {
    "main_title": "{argument name=\"main title\" default=\"全网首发！我把它拆了\"}",
    "sub_title": "{argument name=\"sub title\" default=\"真的值这个价吗？\"}",
    "label_badge": "{argument name=\"badge\" default=\"独家\"}"
  },
  "constraints": {
    "must_feel": "强诱因 + 强好奇感"
  }
}
```

### 变体 3：自动补全模式

📝 提示词

```json
{
  "type": "短视频封面自动补全模板",
  "mode": "auto-fill",
  "rule": "用户只给出主题时，自动补主标题、副标题、主体、风格、配色，但必须保持封面三要素：主标题、主视觉、强对比",
  "constraints": {
    "must_feel": "像真实视频平台上抓人封面"
  }
}
```

### 避免事项

- 不要让标题占满整个画面（必须留出主视觉）
- 不要让标题颜色与背景过于接近，必须高对比
- 不要在一张封面塞超过 2 行的副标题
- 不要让主体面部被标题文字大块遮挡
- 不要混合多个平台的 UI 元素（比如 YouTube 红色播放按钮 + 抖音水印）
- 不要在“知识科普”封面里出现 emoji 表情堆叠

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
