---
id: food-map
version: 1.0.0
title_en: Food Map
title_zh: 手绘食物地图
summary_en: Reframe one food theme or image as a navigable illustrated world with a central dish, distinct ingredient landmarks, and a compact legend.
summary_zh: 将一个食物主题或图片重构为可游览的插画世界，以中央主食、清晰食材地标和紧凑图例组成。
category: maps
execution_kind: host-image-generation
input_mode: text-or-image
input_min: 0
input_max: 1
input_formats: jpeg,png
output_count: 1
preview: assets/previews/food-map.png
source_repository: wangjs-jacky/happy
source_revision: 9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f
source_paths: packages/happy-app/sources/components/agents/imageStyleCatalog.ts,LICENSE
source_sha256s: 301a744429efc49379e6ae363dc1e9b7fa401087bde21897c83d9c44ee727d40,e251d0448ef3ce023c20ebac9b90a7d8642b1434825838247d6e457668eb3e00
source_license_spdx: MIT
source_license_url: https://github.com/wangjs-jacky/happy/blob/9fe4b5d0fc893b9dfe2713dd43e3cd324fb6744f/LICENSE
source_license_notice: references/licenses/happy-coder-contributors-mit.txt
adaptation_notice: Adapts the Happy catalog entry generated from ConardLi/gpt-image-2-101 into a subject-neutral self-contained illustrated map effect with explicit privacy quality and delivery rules.
preview_origin: Text-only image generation of a fictional scene; not based on a real person, place, brand, or third-party image.
preview_author: wangjs-jacky
preview_license_spdx: CC-BY-4.0
preview_sha256: a729bbfccc9c3a0de8683f333ca7b677b7bbb6c971e290b211be4312c633a897
---

## 适用场景

把一道食物、一组食材、饮食记忆或餐桌主题编译成手绘食物地图。适合用地标、路径、岛屿和图例表达味觉关系、制作过程或场景组成；这是概念地图，不用于真实导航、餐馆推荐、产区认证或地理事实展示。

## 输入契约

接受非空文字主题且零图片，或一张当前请求明确附带的 JPEG 或 PNG 并可附方向。输入缺失、超过一张图片或格式不支持时停止。图片仅用于本次任务的主食轮廓、食材、器具、桌面材质与色彩，不扫描历史或本地目录，不公开路径或保留副本。

编译一个中央主食或主题地标、四至七个关联食材或器具地标、连接逻辑和一个小型图例。真实配方、产地、店名和营养信息只使用用户提供的内容；缺失时做虚构概念世界并避免任何真实地理主张。

## 视觉编译规则

- 使用方形或 4:5 平面俯视地图，中央主地标占约 25–40%，四至七个周边地标均匀分布并由点线、河道、桥或路径连接。
- 将食物形态转译为岛屿、山丘、港口、灯塔或道路等地图隐喻，但保留食物本身可识别的轮廓、层次与主色。
- 采用统一的水彩加细墨线、彩铅或版画地图语言，使用暖纸底、克制边框、指南针和一个简洁图例。
- 输入图片存在时，中央食物与可见食材必须忠实；不可凭空添加关键原料或改变数量。文字输入可以使用原创虚构地点名，但不得暗示真实存在。
- 只渲染用户给出的标题或一个明确虚构的短标题；其余地标用图标和编号，不生成密集伪标签。

## 硬性禁止项

禁止真实导航暗示、虚构餐馆推荐、产地认证、营养数据或地理事实；禁止复制真实地图、真实品牌餐饮、无关地标、密集伪文字、现代导航 UI、二维码、水印、照片拼贴、私有路径或重复同一食物填充所有区域。

## 质量检查

确认中央主地标与四至七个周边地标清晰；路径和图例可读；每个地标轮廓不同且与主题相关；食物结构和输入事实准确；地图隐喻统一；标题准确或明确虚构；不存在真实地理误导、虚构数据、品牌、二维码或水印。

若地标数量、路径、食物真实性或文字发生硬失败，最多定向重试一次，固定地图清单并只修复失败项。

## 交付要求

通过宿主原生图片交付路径返回一张最终食物地图，并简述中央地标、周边地标和路径隐喻。除非用户要求，不公开私有路径或完整提示词。
