---
id: chat-interface-scene
version: 1.0.0
title_en: Chat Interface Scene
title_zh: 聊天界面场景
summary_en: Create a convincing interface scene with a clear product state, stable component hierarchy, and legible interaction focus.
summary_zh: 生成可信的界面场景，保持产品状态、组件层级和交互焦点清楚。
category: ui-mockups
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/chat-interface-scene.png
source_repository: ConardLi/garden-skills
source_revision: aaf9a82f5efd73e87cc0998edc398e75bfc35901
source_paths: skills/gpt-image-2/references/ui-mockups/chat-interface-scene.md,LICENSE
source_sha256s: 9a08934a9127ea3b48150bbd65e24f24d2f64eba2ad3a1a1653433cc3a1281fc,1126322e2cc8d165adc4c792eeb195717de2bcc7b39be1ce77959d78e87ef685
source_license_spdx: MIT
source_license_url: https://github.com/ConardLi/garden-skills/blob/aaf9a82f5efd73e87cc0998edc398e75bfc35901/LICENSE
source_license_notice: references/licenses/conardli-garden-skills-mit.txt
adaptation_notice: Adapts the pinned GPT Image 2 template into a host-neutral self-contained effect card with explicit input and delivery contracts.
preview_origin: Original procedural vector preview created for this catalog and not derived from an upstream case image or third-party artwork.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: 7e19654988850df36f89d020802eb071649703c827fca134a7ecdee0f9037713
---

## 适用场景

使用本效果把用户的主题或输入图编译成一个边界清楚、可独立交付的视觉结果。先确认核心对象、用途和比例；只有缺失信息会显著改变结果时才追问。

## 输入契约

接受文字主题，也可提供一张 JPEG 或 PNG 作为主体、内容或构图参考。文字模式不得调用公众人物、受保护角色或真实品牌；图片模式只把输入用于当前任务，不推断真实身份。

## 视觉编译规则

这是一个宿主中立的图片效果卡。使用宿主原生图片生成或编辑能力完成任务，不运行下述来源模板中提及的仓库脚本。把占位参数替换为用户信息，缺失但不关键的信息使用安全默认值。

本文件用于生成“聊天 App 界面 + 对话气泡 + 角色头像”的样机，可用于：

- 微信 / iMessage / WhatsApp / Discord 风格聊天截图
- 对话流式表情包
- 角色之间的“假聊天”剧本视觉
- 客服对话样机
- 心理咨询 / 教学场景对话演示
- AI 助手对话界面演示

它跟 `live-commerce-ui.md` 的区别：

- 直播 UI：以人物画面为主，UI 叠加在上面
- 聊天界面：以聊天气泡 + 头像为主，画面就是 App 内的对话流

### 适用范围

- 一对一聊天截图样机
- 群聊截图样机
- AI 与人聊天的对话流截图
- 双角色 / 多角色互动剧本
- 故事化截图（比如“甲乙两人的对话推进剧情”）

### 何时使用

- 用户提到“聊天截图 / 对话样机 / 微信聊天 / iMessage / 群聊样机”
- 用户希望让两个或多个角色“聊一段话”
- 用户希望生成具备表情包属性的对话流
- 用户希望生成 AI 助手 / 客服的对话演示

不要使用：

- 用户要的是社交平台帖子（用 `social-interface-mockup.md`）
- 用户要的是直播间界面（用 `live-commerce-ui.md`）

### 缺失信息优先提问顺序

1. 平台风格：iMessage、微信、WhatsApp、Discord、通用 IM、AI 助手
2. 颜色模式：浅色 / 深色
3. 对话角色：几人，每人是谁
4. 对话主题：具体场景（吵架 / 表白 / 谈业务 / 角色扮演 / AI 答疑）
5. 是否需要表情、贴纸、转账卡片、语音条等富媒体
6. 是否允许我自动补全对话内容

### 主模板：双人聊天截图

📖 描述

仿真两人在某个 IM App 里的聊天页面，包含顶部头部、滚动对话流、底部输入栏。

📝 提示词

```json
{
  "type": "移动端双人聊天截图样机",
  "goal": "生成一张高仿真的聊天截图，可用于内容创意、剧本演示、角色对话视觉",
  "platform": {
    "name": "{argument name=\"platform\" default=\"iMessage\"}",
    "color_mode": "{argument name=\"color mode\" default=\"light\"}",
    "language": "{argument name=\"interface language\" default=\"中文\"}"
  },
  "header": {
    "status_bar": "顶部状态栏，时间 '{argument name=\"status time\" default=\"21:42\"}'，信号、Wi-Fi、电量",
    "navigation": {
      "back": "返回箭头",
      "contact_avatar": "{argument name=\"contact avatar\" default=\"对话方头像\"}",
      "contact_name": "{argument name=\"contact name\" default=\"林深\"}",
      "online_status": "{argument name=\"online status\" default=\"在线\"}",
      "right_actions": ["语音通话图标", "视频通话图标"]
    }
  },
  "conversation": {
    "self_alignment": "right",
    "other_alignment": "left",
    "message_count": "{argument name=\"message count\" default=\"8\"}",
    "messages": [
      {
        "role": "other",
        "type": "text",
        "text": "{argument name=\"msg 1\" default=\"在吗？刚刚那个事我想了想\"}",
        "timestamp": "21:38"
      },
      {
        "role": "self",
        "type": "text",
        "text": "{argument name=\"msg 2\" default=\"在的，你说\"}",
        "timestamp": "21:39"
      },
      {
        "role": "other",
        "type": "text",
        "text": "{argument name=\"msg 3\" default=\"我决定明天就把方案交出去\"}",
        "timestamp": "21:39"
      },
      {
        "role": "self",
        "type": "voice",
        "duration": "00:08",
        "timestamp": "21:40"
      },
      {
        "role": "other",
        "type": "sticker",
        "description": "可爱猫咪 OK 贴纸",
        "timestamp": "21:40"
      },
      {
        "role": "self",
        "type": "image",
        "description": "白板上写着思维导图",
        "timestamp": "21:41"
      },
      {
        "role": "other",
        "type": "text",
        "text": "{argument name=\"msg 7\" default=\"这个方向我也认同，明天九点见\"}",
        "timestamp": "21:41"
      },
      {
        "role": "self",
        "type": "text",
        "text": "{argument name=\"msg 8\" default=\"好，明早咖啡我请\"}",
        "timestamp": "21:42"
      }
    ]
  },
  "footer": {
    "input_bar": {
      "left_icons": ["相机", "图片", "语音"],
      "placeholder": "{argument name=\"input placeholder\" default=\"输入消息\"}",
      "right_icons": ["表情", "+"]
    },
    "home_indicator": "底部 home 指示条"
  },
  "style": {
    "rendering": "高保真移动端聊天界面截图，纵向比例，看起来像真实手机截屏",
    "consistency": "气泡颜色、头像位置、时间样式严格遵循平台风格"
  },
  "constraints": {
    "must_keep": [
      "气泡左右对齐与角色一致",
      "时间戳合理推进，不能乱序",
      "中文文字清晰可读",
      "头像与昵称一致"
    ],
    "avoid": [
      "气泡背景与文字颜色对比度过低",
      "时间显示不符合一天内的逻辑",
      "图片与语音条出现错位"
    ]
  }
}
```

#### 参数策略

- 必问：平台、对话双方身份、对话主题
- 可默认：状态栏时间、底部输入栏图标、在线状态
- 可随机：少量氛围消息（贴纸、表情、emoji），但不能盖过主对话

#### 自动补全策略

当用户说“你帮我编一段对话”：

- 控制在 6-10 条消息内
- 内容要有起承转合，不要全是“嗯嗯好的”
- 每条消息字数控制在合理 IM 长度（≤ 35 字最佳）
- 时间戳必须连续合理

### 变体 1：群聊样机

📝 提示词

```json
{
  "type": "群聊样机",
  "platform": {
    "name": "{argument name=\"platform\" default=\"微信\"}",
    "color_mode": "light"
  },
  "group": {
    "name": "{argument name=\"group name\" default=\"产品组日常\"}",
    "member_count": "{argument name=\"member count\" default=\"12\"}"
  },
  "conversation": {
    "messages": [
      {"role": "member", "name": "Lily", "text": "今天的需求评审定 4 点对吗？"},
      {"role": "member", "name": "陈工", "text": "对，会议室 A"},
      {"role": "self", "text": "我把文档更新到群里了"},
      {"role": "system", "text": "撤回了一条消息"},
      {"role": "member", "name": "PM 老王", "text": "@all 提前 5 分钟到位"}
    ]
  },
  "constraints": {
    "must_feel": "像真实工作群"
  }
}
```

### 变体 2：AI 助手对话界面

适合：AI 产品的功能演示截图、宣传图、教学图。

📝 提示词

```json
{
  "type": "AI 助手对话界面样机",
  "platform": {
    "name": "{argument name=\"product name\" default=\"通用 AI 助手\"}",
    "color_mode": "{argument name=\"color mode\" default=\"light\"}"
  },
  "header": {
    "title": "{argument name=\"chat title\" default=\"新对话\"}",
    "model_label": "{argument name=\"model label\" default=\"Claude Opus 4.7\"}",
    "right_actions": ["新建对话", "历史"]
  },
  "conversation": {
    "messages": [
      {
        "role": "user",
        "text": "{argument name=\"user question\" default=\"帮我把下面这段会议纪要整理成行动项\"}"
      },
      {
        "role": "assistant",
        "type": "structured",
        "content": [
          "1. 行动项一：负责人 / 截止日",
          "2. 行动项二：负责人 / 截止日",
          "3. 行动项三：负责人 / 截止日"
        ]
      },
      {
        "role": "user",
        "text": "{argument name=\"follow up\" default=\"再生成一份发给团队的邮件\"}"
      },
      {
        "role": "assistant",
        "type": "code-block",
        "language": "markdown",
        "preview": "邮件正文预览，开头致敬，中间结构化要点，结尾签名"
      }
    ]
  },
  "footer": {
    "input_bar": {
      "placeholder": "{argument name=\"input placeholder\" default=\"问点什么...\"}",
      "right_button": "发送"
    },
    "tools_row": ["上传文件", "网页", "代码", "图像"]
  },
  "constraints": {
    "must_feel": "像真实 AI 产品截图，而不是纯设计稿"
  }
}
```

### 变体 3：自动补全模式

适用于用户只说“做一段聊天截图”。

📝 提示词

```json
{
  "type": "聊天界面自动补全模板",
  "mode": "auto-fill",
  "platform_default": "iMessage 浅色模式",
  "scene_generation": "默认生成生活感对话，不强加故事走向",
  "rule": "如果用户没指定双方身份，默认两个朋友之间的轻松对话",
  "constraints": {
    "must_feel": "自然、像真实手机截图"
  }
}
```

### 避免事项

- 不要让对话双方全部用一边对齐，必须区分发送者与接收者
- 不要让头像出现在用户自己消息那一侧（除部分平台特例）
- 不要混合两种平台的 UI 元素（比如 iMessage 蓝色气泡 + 微信底栏）
- 不要让消息之间时间戳出现倒退、不连贯
- 不要在“客服 / AI 助手”场景中加入私人化情绪表达
- 不要把所有消息都做成纯文字，会显得不真实，可适当夹杂图片 / 贴纸 / 语音条

## 硬性禁止项

禁止伪造事实、数据、引用、品牌或身份；禁止引入未请求的公众人物、受保护角色、真实商标、水印、二维码和不可读伪文字；禁止改变输入中未被明确授权编辑的关键结构。不得模仿在世艺术家的可识别个人风格。

## 质量检查

确认核心对象第一眼可读，构图符合目标比例，层级与阅读路径明确，文字区域可用，颜色和材质一致；图片编辑需逐项核对主体身份、轮廓、数量与未编辑区域。发现结构错误时只允许一次定向重试。

## 交付要求

只输出一张最终图片。通过宿主原生图片通道交付，并用用户当前语言简述本次采用的构图、信息层级与关键保真点。不公开完整提示词、私有输入路径或内部参数。
