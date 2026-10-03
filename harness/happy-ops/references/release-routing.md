# 发布路由

适用：用户要求发布、合并并部署，或判断一项改动如何交付。

读当前工程 `CLAUDE.md`、PR diff 和 workflow 路径过滤。`happy-app` 同时包含 Web 和 App，不能仅凭目录名默认发 OTA；CLI 与 Server 不因 Web/OTA 成功就已更新。

| 目标 | 下一步 |
| --- | --- |
| PC/Web | [Web](systems/web/index.md) |
| App JS/资源；共享 UI | [OTA](systems/android/index.md)；共享 UI 同时按授权处理 Web |
| 原生依赖、权限、runtime、包名 | [原生包契约](systems/android/index.md)，先解决匹配二进制 |
| CLI runtime/npm | [CLI](systems/execution/index.md) |
| 后端接口、同步协议、数据库 | [Server](systems/server/index.md) |

## 服务端修复是否需要 OTA

只改 Server 运行逻辑及测试，App 既有请求/响应契约保持兼容时，部署 Server 即可生效，不需要 App OTA 或重建 APK。判断依据是实际 diff 与运行契约，不能因报错出现在手机上就默认发布 OTA。自动 Web/OTA workflow 是否触发，仍按仓库路径过滤分别核对。

服务端访问发布数据源超时、或重启后尚无已验证缓存时，App OTA 不能修复这条出站链路。按 [Server 部署](systems/server/index.md) 的受影响接口探针区分：旧数据失败是否错误影响已验证的新数据，还是最新数据本身也不可用；后者保持“无法确认”，不能写成“已是最新”。

## 最短路径

1. 明确已授权目标，复用本轮有效的评审、测试和构建证据。
2. 按仓库门禁核对确切 head、CI 与合并方式。需要合并文案时沿用已批准内容，实质变化再澄清；不重复确认同一已授权动作。
3. 合并后记录 merge SHA，按该 SHA 找应触发的 workflow。独立发布可以并行等待，持续时间不能简单相加。
4. 分别判断：已发布、未触发、兼容性跳过、后续提交取代、失败。处理授权内的真实失败，不盲目重发。
5. 完成目标对应的最小验证，交付来源、版本和限制；只清理本轮资源。

## 完成与依据

每个约定目标都有可核实结果。合并不等于上线，页面加载不等于真机使用；小改动不自动扩展全站 E2E/视频。项目指令和源码是动态权威；手册依据历史本机记录与本轮 Web/OTA 成功发布整理，具体证据进入对应私有 system/operation 索引。
