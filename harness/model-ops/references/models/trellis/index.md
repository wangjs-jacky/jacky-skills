---
id: model.trellis
title: TRELLIS 三维生成
summary: 通过已登记供应商从单张图片生成三维网格。
---

# TRELLIS

BBLABU 当前路由为 `trellis`，供应商标注 Microsoft TRELLIS。这里是云端 API 接入，不代表本机部署权重。

- [3D 目录与鉴权](../../operations/check-bblabu-threed.md)。
- [生成三维网格并保存](../../operations/generate-bblabu-threed.md)。
- 只支持图生，`image_url` 必填；可选 prompt 不能替代图片。贴图尺寸和采样参数按该型号读取，不发送 Tripo 的 mode、texture 档位或四边面参数。
- 公开说明按次计费并输出 GLB／预览图。格式、几何完整性和观感仍须对真实产物核验，不能由目录声明替代。
- 当前 Key 引用及快照从 `experience.local.md` 的本机 3D 接入记录进入。

2026-11-26 只读鉴权与目录通过；实际生成和文件下载尚未验证。
