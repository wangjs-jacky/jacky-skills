---
name: remote-web-ops
description: "Use when deploying or exposing a Web service on a remote host, or diagnosing remote-only loading, proxy, authentication, WebSocket or SSE failures. 适用于远端网页服务部署、访问接入、外网慢和实时连接故障；普通页面开发或单独查询云产品资料不触发。"
---

# 远端 Web 服务部署与优化

以 **capability → operations** 组织可复用经验：服务在远端主机运行，其他设备通过受控入口使用。不限机器、应用或供应商。

## 安装与配置

安装 Agent 读取[全局前置提示词](references/global-agents-prompt.md)，按已有授权处理；普通任务直接进入下文。创建/安装本 Skill 不自动授权修改全局规则、服务配置或对外发布。

## 按目标读取

1. 从当前 Skill 的实际目录读取[能力索引](references/capabilities/index.md)，命中本次能力，再读其档案和目标 operation。首次分类或遇到归属问题时读[模型](references/ops-model.md)，不扫描整库。
2. 需要定位已有服务时读取可选的 experience.local.md 小型入口；项目过程和证据仍在原 Goal First 目标，不复制当前状态。
3. 核对服务版本、实际运行入口、客户端和授权。缺少经验时按当前事实探索；同一任务可以涉及多个能力，整体过程只记在目标中。

| 目标 | capability | 优先操作 |
| --- | --- | --- |
| 远端启动、部署或重启恢复 | runtime | deploy-and-verify |
| 选通道、查代理/隧道路径 | connectivity | diagnose-access-path |
| 登录/回调/Cookie或退出权限异常 | identity | verify-session-boundaries |
| 首次/刷新慢、资源重复下载 | resource-delivery | diagnose-loading，再按证据 optimize-browser-cache |
| WS/SSE无法连接或退出后仍存活 | realtime | verify-ws-session-lifecycle；SSE按当前事实补证据 |

## 执行能力与判断边界

- 部署拓扑、职责和恢复协议沿 architecture-deploy-ops；本 Skill 聚焦外部 Web 实际接入，不复制拓扑目录。
- 涉及 Cloudflare 先读 cloudflare-ops，包括用户禁止业务状态轮询的约束；其他平台按实际工具处理。需要浏览器时先读 ego-ops，再用 ego-browser，遵循控制权和截图收尾规则。远端命令用现有 SSH 能力；推送/发布才进入 release-ops。
- 依赖 Skill 不可用时说明具体缺口，继续已有工具能够完成的独立部分，不声称执行过缺失能力。
- 分别记录源站、网关、外部路径、浏览器资源与应用就绪。CLI 200/101不替代登录后的实际页面和业务；缓存改善不代表冷加载或模型执行已加速。
- 单点路径快慢会反转；具体缓存TTL、资源正则、端口及供应商选择由当前服务事实决定。只在已有授权范围内改配置，知识写回不扩大业务权限。

## 持续沉淀

完成、失败或中断都按[写回协议](references/knowledge-schema.md)核对：**读旧经验 → 复核当前环境 → 执行/验证 → 更新唯一归属 → 同步索引 → 报告**。

- 共享机制归能力档案，独立用户目标的方法归operation；私有环境与原始证据引用既有Goal First目标。相同事实不按机器/域名复制。
- 只给达到本operation成功标准的证据更新成功日期；源码推断、局部执行和完整验证分开。历史迁入保留真实验证日。
- 同类新经验与失效修正沿模型自动维护；改变主键、拆并归属或扩大职责再对齐。新能力或候选操作尚无证据时如实标注。
- 校验相对链接、状态/日期、私密信息和索引一致性；报告实际写回位置及未完成项。没有新增可复用事实时说明原因，不凭空制造文件。

自动沉淀依赖 Agent 执行本协议，不是后台监控或宿主钩子。本 Skill 不包含自动轮询服务。
