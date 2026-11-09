---
capability: connectivity
---
# 访问通道

接入方式按外部设备需求、网络条件、身份和现有入口选择；公网反向代理、主动隧道及私网均是候选，实现细节交给对应平台OPS。

单次curl的路径与浏览器代理控制者可能不同。系统bypass、扩展PAC和源站Tunnel是不同段；节点地理位置只是路径线索，不单独证明某请求失败原因。

| operation | status | last_verified | 文档 |
| --- | --- | --- | --- |
| diagnose-access-path | verified | 2026-11-08 | [比较并定位访问路径](operations/diagnose-access-path.md) |

来源：真实外部客户端的有限直连/代理与私网传输样本；未宣称已有适用于所有应用的私网HTTPS入口。
