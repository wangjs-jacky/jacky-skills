---
capability: bailian
updated: 2026-10-24
docs_checked: 2026-10-24
---

# 百炼模型服务

## 能力与边界

模型服务支持文本生成与向量化。RAM AccessKey 是云管理凭据，模型 API Key 是推理凭据。地域、业务空间、Key、模型和端点必须对应，不能把一个地域的成功推广到其他地域。

OpenAI 兼容文本向量接口使用 `/compatible-mode/v1/embeddings`。北京旧域名 `dashscope.aliyuncs.com` 仍可用；当前官方推荐业务空间专属域名 `https://{WorkspaceId}.cn-beijing.maas.aliyuncs.com/compatible-mode/v1`，调用时再追加 `/embeddings`。应用可能要求完整端点，也可能让 SDK 追加路径，须看实际实现。

文本 `text-embedding-v4` 与 `qwen3-vl-embedding` 等多模态模型的接口不同；后者不支持这套 OpenAI 兼容文本接口。使用 DeepTutor 的原生 aliyun 适配器时，应检查安装版是否已按模型选择文本/多模态原生端点，不能仅凭 provider 名判断请求格式。

## 限制与额度

2026-10-24 核对官方文本向量文档：`text-embedding-v4` 默认 1024 维，可选 64–2048 维；单批最多 10 条，每条最多 8192 tokens。北京公开原价为输入 0.5 元/百万 tokens；这是公开价格，账号免费额度与有效配额须另外读回，不能保证免费。

不需要为一次文本向量调用购买 ECS、Coding Plan 或 Token Plan。若需开通新服务或购买资源，以本次用户授权和当前页面条款为准。

## 操作目录

| operation | 目标 | status | last_verified | reference |
|---|---|---|---|---|
| configure-text-embedding | 配置并验证文本向量化及应用消费 | verified | 2026-10-24 | [操作](operations/configure-text-embedding.md) |
| manage-model-api-key | 为应用创建并读回限定模型的 Key | verified | 2026-10-24 | [操作](operations/manage-model-api-key.md) |

## 已知坑

- 老版 aliyun CLI 的 `bailian` 产品元数据可能不包含新版管理接口；`invalid api` 不证明账号没有百炼权限。核对官方 ModelStudio API/SDK 版本后使用对应接口。
- 本次官方 SDK `alibabacloud_modelstudio20260210` 可管理模型 Key；北京管理端点是 `modelstudio.cn-beijing.aliyuncs.com`，与推理端点分工不同。
- 模型目录返回 200 不证明真实推理；配置已保存不证明应用正在使用该配置。
- 更换已有知识库的向量模型或维度可能需要重建索引，不能静默覆盖旧绑定。

## 资料来源

2026-10-24 读取官方资料：

- [获取 API Key](https://help.aliyun.com/zh/model-studio/get-api-key/)
- [OpenAI 兼容文本向量接口](https://help.aliyun.com/zh/model-studio/embedding-interfaces-compatible-with-openai)
- [text-embedding-v4](https://help.aliyun.com/zh/model-studio/text-embedding-v4)
