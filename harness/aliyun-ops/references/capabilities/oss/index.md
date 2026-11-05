---
capability: oss
updated: 2026-11-04
docs_checked: 2026-11-03
---

# OSS 静态内容与 CDN 分发

## 能力与边界

OSS 负责对象存储，CDN 提供边缘缓存和就近分发。文件存入 OSS 不等于启用 CDN；地域、域名、实际路由分别核对。2026-11-03 官方文档明确：加速区域含中国内地时需要备案；仅境外加速不要求这一条件，但不能由此承诺内地更快。CDN 的 CNAME、HTTPS、回源 HOST/SNI 与对象路径需要匹配。

备案条件需区分存储开通、默认资源域名访问、绑定自有域名和内地 CDN 加速。官方自定义域名文档要求内地 Bucket 绑定的自有域名备案；这不是按 HTML/图片扩展名划分。OSS 默认域名的数据类 API 有账号/地域相关策略，须按当前实际访问核对，不能把自有域名条件笼统套给全部资源存储，也不能保证任意新账号默认域名都能沿用历史用法。

## 限制与额度

已在一个既有账号下验证新桶及选定小图片访问；具体账号/地域证据归目标，不推广为全部用户默认可用。未核对账号配额、存储/请求/流量价格或免费额度。估算时分别统计存储、请求、CDN 下行和回源，不把某一套餐余额当作全部环节免费。

## 操作目录

| operation | 目标 | status | last_verified | reference |
|---|---|---|---|---|
| design-static-delivery | 选择页面入口、资源 CDN 与 OSS 职责 | documented | — | [操作](operations/design-static-delivery.md) |
| provision-public-assets-bucket | 创建可复用资源桶并验证选定公开图片 | verified | 2026-11-03 | [操作](operations/provision-public-assets-bucket.md) |
| publish-versioned-assets | 发布内容寻址资源并核验重复复用 | verified | 2026-11-04 | [操作](operations/publish-versioned-assets.md) |

## 已知坑

- 新桶的 BlockPublicAccess 可能阻断公开对象 ACL；桶 ACL、对象 ACL 与账号/桶级阻断分开检查。公开资源授权不扩大为改旧桶或账号级配置。
- 默认域名响应含强制下载头不等于普通 img 一定不能加载；以真实页面解码验证，勿将 img 成功推广为 fetch/canvas 的 CORS 授权。

- CDN 命中可不回源；仅调整存储位置不证明访客入口已变化。
- 私有 Bucket 授权 CDN 回源后，CDN 可成为公开入口；源站私有与访客鉴权分别设计。
- 旧托管商的响应头和重定向规则不随文件上传自动迁入新平台。
- CLI 默认地域不代表全部 Bucket 的地域。列举服务成功或 stat 显示地域后，ls/CNAME 请求仍应明确相应 endpoint；AccessDenied 同时提示指定 endpoint 时先纠正地址，不直接判断密钥或权限失效。

## 资料来源

2026-11-03 核对官方资料，仅为 documented 指引，未配置或迁移账号资源：

- [CDN 加速 OSS](https://help.aliyun.com/zh/oss/user-guide/cdn-acceleration)
- [添加加速域名](https://help.aliyun.com/zh/cdn/add-a-domain-name)
- [OSS 自定义域名](https://help.aliyun.com/zh/oss/user-guide/access-buckets-via-custom-domain-names)

2026-11-03补核：[默认域名强制下载](https://help.aliyun.com/zh/oss/user-guide/0048-00000114)、[阻断公共访问](https://help.aliyun.com/en/oss/user-guide/block-public-access)与[访问域名](https://help.aliyun.com/zh/oss/user-guide/access-oss-via-bucket-domain-name)。新账号内地默认公网 API 条件和具体 img 能力应分别验证；创建/访问实证范围见对应 operation。
