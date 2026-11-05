---
site: aliyun
domains:
  - bailian.console.aliyun.com
  - bailian-cs.console.aliyun.com
  - smartservice.console.aliyun.com
aliases:
  - 阿里云百炼
  - 百炼
  - 阿里云服务支持
updated: 2026-10-22
---

# aliyun

## 平台特征

新版百炼控制台将模型功能放在顶部“模型”入口；进入后可从左侧导航选择“费用用量”或“运维管理”。产品面板按钮打开的是阿里云全局产品目录，不是百炼自身的功能导航。

本次在北京地域验证了模型用量与审计日志。地域、业务空间和时间范围均会影响结果，应先确认当前选择。页面与控制台数据接口可处于不同域名；接口读取需要沿用浏览器当前登录会话。

服务支持控制台提供“提交工单”“我的工单”和详情，提交、附件上传与联系信息均在该控制台处理，结果可通过详情中的编号、产品和状态核对。

## 操作目录

| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |
|---|---|---|---|---|
| [submit-support-ticket](operations/submit-support-ticket.md) | 在用户明确授权后提交问题与附件并核对工单编号和状态 | medium | 2026-10-22 | [操作](operations/submit-support-ticket.md) |
| [trace-model-api-usage](operations/trace-model-api-usage.md) | 通过模型用量和审计日志核对调用时间、来源IP和请求用量 | low | 2026-10-22 | [操作](operations/trace-model-api-usage.md) |

## 站点级陷阱

首次进入部分功能会出现欢迎或升级说明弹窗，弹窗可拦截侧栏点击。遇到目标可见但无法接收输入时，先重新观察并关闭说明弹窗，再使用当前页面的导航控件。
