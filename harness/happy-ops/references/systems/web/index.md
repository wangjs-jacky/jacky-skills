# Web 前端

- system: web
- aliases: PC Web、浏览器、页面、静态资源、反向代理

## 系统共识

Web 前端、静态存储、API 与执行端是不同部署目标。正式发布入口由当前工程契约决定；页面与版本检查遵循 Ego 浏览器规则。

## 操作目录

只读当前目标命中的一条 operation。verified 也只覆盖该条 scope；historical/pending 不作为今日成功保证。

| 目标／症状 | 操作 | 状态 | 最近验证 |
| --- | --- | --- | --- |
| 发布 Web | [deploy](operations/deploy.md) | verified | 2026-10-03 |
| 核验 Web 上线 | [verify-deployment](operations/verify-deployment.md) | verified | 2026-10-03 |
| 定位 Web 发布耗时 | [diagnose-deploy-delay](operations/diagnose-deploy-delay.md) | verified | 2026-10-03 |
| 排查页面加载与反向代理 | [diagnose-loading](operations/diagnose-loading.md) | historical | none |
| 排查 Web 历史分页与同步 | [diagnose-history-sync](operations/diagnose-history-sync.md) | historical | none |
| 排查图片与附件传输 | [diagnose-attachments](operations/diagnose-attachments.md) | historical | none |
| 排查输入框排队与插话 | [diagnose-composer](operations/diagnose-composer.md) | historical | none |
| 核对浏览器步骤证据归属 | [verify-browser-evidence](operations/verify-browser-evidence.md) | historical | none |
| 排查与交付临时预览 | [manage-previews](operations/manage-previews.md) | historical | none |

## 共性陷阱

绿色 workflow 可能跳过激活；上线 revision 与浏览器缓存需分开。受控组件 fixture 不能替代完整会话链路。

## 本机环境

需要真实入口、版本或机器时读取[私有系统索引](../../../local/systems/web/index.md)，共享安装可无此文件。从当前工程 Web 发布契约、workflow、部署 summary、线上 HTML revision 与资源响应核实环境；只在需要实际页面交互时使用 Ego。

跨系统目标回到[发布路由](../../release-routing.md)；只继续受影响系统。
