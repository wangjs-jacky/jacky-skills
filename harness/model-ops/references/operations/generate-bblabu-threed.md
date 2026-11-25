---
id: model-ops.generate-bblabu-threed
title: BBLABU 三维网格生成与下载
status: documented
last_verified: null
---

# 三维网格生成与下载

本方法按供应商公开 catalog 和教程核对，尚未执行真实生成。先读[目录与鉴权](check-bblabu-threed.md)，按本次内容、素材与费用授权提交；保存 Key 不构成持续付费授权。

## 型号和输入

| 精确型号 | 输入方式与差异 |
| --- | --- |
| tripo3d | 文本或单图，不支持多视图；prompt 始终必填，texture 为 no／standard／HD 字符串 |
| tripo3d-p1 | 文本、单图或多视图；texture 为布尔值，面数 50–20000，不支持四边面、几何质量或部件拆分 |
| tripo3d-p2 | 文本、单图或多视图；texture 为布尔值；四边面改变面数上限，逐型号核对 |
| tripo3d-v3.1 | 文本、单图或多视图；支持几何质量和部件拆分；generate_parts=true 要求 texture、pbr、quad 均为 false |
| trellis | 仅单图，image_url 必填；prompt 可选，不接 Tripo 的 mode／贴图档位参数 |

Tripo 默认 mode 是 `image-to-3d`，需 `image_url`；文生必须明确 `text-to-3d` 并填 prompt。P1／P2／v3.1 的 `multiview-to-3d` 需 inputs：至少两张、包含正面，每项为 `{"front":"https://…"}` 等视图对象，键为 front／back／left／right。不要把本机路径或网页分享地址当公网 HTTPS 图片输入。

只发送精确型号参数表支持的字段；n 省略或为 1。面数、贴图、PBR、quad、几何质量和材质版本逐项核对，不将同系列能力混用。素材上传或对外公开继续按原任务授权，不为接入自动发布私有图片。

## 计费与任务

trellis 按次计费；基础 tripo3d 按 texture 档位按次计费；P1／P2／v3.1 按实际消耗点数结算，并先预扣默认点数。预扣不等于最终成本，任务查询未必显示点数，实际扣费及退款以使用日志单独核实。平台刀不等于美元，执行前按当时价格和充值汇率核对。

Base URL 为 `https://api.bblabu.ai/v1`，从账号池内存取 Key，使用 JSON 和 Bearer 鉴权。

| 操作 | 接口 |
| --- | --- |
| 创建，付费动作 | `POST /v1/3d/generations` |
| 当前任务单次查询 | `GET /v1/3d/generations/{task_id}` |
| 第 index 个结果文件 | `GET /v1/3d/generations/{task_id}/content/{index}` |

文生请求体示例，仅说明已核对协议，未提交：

```json
{"model":"tripo3d-p1","mode":"text-to-3d","prompt":"一只木制小船"}
```

创建后立即保存不含凭据的请求、HTTP 状态和真实返回的 id。HTTP 200、queued 或进度百分比都不是模型已生成。响应未知时核对原任务与使用日志，不盲目重提；已有 id 继续处理同一任务。failed 的 error.message、实际扣费与退款分别保留证据。

状态采用按需单次查询，不部署供应商示例的定时轮询。若任务要求自动完成通知，先核实实际事件支持，不虚构回调。总耗时和客户端单次请求超时分开处理，不把关闭客户端当作任务取消。

## 文件与验收

completed 后读取真实 `data[].url`。供应商声明输出 GLB 网格和 WebP 预览，部分支持 quad 的型号输出 FBX；按实际内容、响应类型和文件签名识别，不把数组序号或扩展名当格式验证。

本站代理下载需要同一个 Key，先验证 HTTPS、精确主机及当前任务 content 路径；不把 Bearer 随跨域重定向转发。公开外域资源不带本站凭据。供应商声明文件存档 7 天，完成后及时保存至原业务任务。

核对文件哈希、网格可解析、材质和贴图引用，再在合适的查看器检查形状、背面、部件及外观。文件下载不等于几何完整或适合打印／实时引擎；按任务的具体用途验收。预览图、网格原件和技术检查分别交付，真实成功后才更新本 operation 验证日期。

官方入口：[音频／音乐／3D 教程](https://api.bblabu.ai/docs?category=audio)、[当前价格](https://api.bblabu.ai/api/pricing)。从当前前端解析模型 catalog 和教程资源地址，静态文件名及本机快照只作为当次证据。
