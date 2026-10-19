# 排查原生流程图空白

- system: android
- operation: diagnose-diagram-rendering
- status: pending
- last_verified: none
- risk: low
- scope: Hermes源码序列化缺陷已复现并修复，引擎及预览/正式制品验证通过，用户确认更新后流程图恢复；未独立读取设备新版本或分项验收全屏/失败路径，完整标准仍未全项覆盖。

## 目标

区分消息未加载与 Mermaid/WebView 局部空白，定位生成 HTML、依赖加载、渲染和展示中的失败环节。

## 前置条件与授权

先只读诊断。修复、预览或正式发布分别沿有效授权与项目约定处理；不自动重建安装包、覆盖 latest 或回滚共享频道。

## 入口

先读[系统索引](../index.md)。本机复现和版本来源见[私有证据](../../../../local/systems/android/operations/diagnose-diagram-rendering.md)。

## 步骤与检查点

1. 对照截图，确认正文、内联流程图和全屏各自状态；核对设备 package/channel/runtime/Update ID。
2. 比较 Web 与 Native 真实实现。若函数源码通过 toString 嵌入 HTML，在目标 Hermes 上复现，不仅在 Node/JSDOM 或浏览器中生成 HTML。
3. 区分脚本解析、工厂执行和依赖下载；同步远程脚本可能在错误桥接建立前阻塞。核对错误消息是否能到达 React 错误态。
4. 获取设备日志或等价实际引擎证据后，才把代码缺陷归因到用户截图。依赖 stub 的测试必须明确边界。

## 成功标准

匹配设备版本的内联及全屏均可显示，失败路径有可见反馈；实际手机结果与代码/构建测试分别记录。

## 失败模式与恢复

构建时生成的静态文本bundle已通过引擎及交付包核对，用户确认更新后流程图恢复，但未分项验收全屏或失败路径。不把 Function.toString 返回的 `[bytecode]` 误称为语法错误：该数组表达式语法合法，但执行通常产生 ReferenceError。此错误会被 bootstrap 捕获，因此另需核对为何截图没有错误态。CDN 从工程机器可达不证明设备可达；不凭这一观察认定或排除网络故障。后缀.js可能实际是Hermes字节码；修复时核对共享源码与生成物parity，再核对发布主包hash和完整脚本文本保留，不能只在V8中生成HTML。

## 验证证据

复现记录见[私有证据](../../../../local/systems/android/operations/diagnose-diagram-rendering.md)。2026-10-17已取得源码、Hermes CLI、模拟DOM及正式OTA制品证据，用户明确确认更新后流程图正常；本次故障已恢复。通用operation要求的内联/全屏及失败反馈尚未逐项真机覆盖，保留pending/none，不把用户的一般恢复确认扩大为完整回归。后续按[维护协议](../../../knowledge-maintenance.md)更新。
