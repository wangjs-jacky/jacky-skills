---
site: cloudflare
operation: protect-one-worker-with-owner-policy
title: 为单个Worker配置本人访问
risk: high
last_verified: 2026-10-25
---

# 为单个Worker配置本人访问

## 目标

以精确邮箱允许策略保护单个Worker全部流量，核对真实身份参数并完成合法本人登录。

## 前置条件与授权

Zero Trust已开通，目标Worker和允许邮箱明确，用户授权仅修改该应用的访问控制。不得把单应用授权扩展为Protect all Workers、整个邮箱域或其他应用。

## 入口

Zero Trust → Access controls → Policies；Workers & Pages → 目标Worker → Access。

## 已验证步骤

1. 在Policies选择Add a policy，设置唯一应用策略名，Action为Allow，Include的Selector为Emails，值仅为本人完整邮箱；选择已确定的会话有效期，保存并确认Policy saved successfully。
2. 回到精确目标Worker的Access页，选择Protect this Worker behind Access，Scope选All traffic。
3. Authentication policy选择刚保存的精确邮箱策略。尚无自建策略时，下拉只显示Cloudflare account和Email domain预设；不能为了继续而误选更宽范围。
4. 设置应用Session duration并单次Apply Access。等待Worker policies显示All traffic、Require login on every URL以及精确策略和邮箱。
5. 读取Application values中的AUD tag和JWKS团队域。用只读接口核对单个worker destination、策略include、session_duration及组织auth_domain；不输出认证头或完整业务响应。
6. 将真实issuer/audience用于应用服务端验签后发布，进入应用，通过已配置的身份提供方完成本人登录。认证回调只观察origin/path，不输出含认证参数的完整snapshot或URL；在干净应用地址验证实际业务身份与入口。

## 检查点

保护范围是当前Worker的全部流量；不是所有Worker。邮箱规则使用Emails而非Emails ending in。确认策略和应用有效期一致，JWT参数取实际读回值。浏览器端登录成功须看到应用数据或实际接口成功，不能只看认证页消失。

## 成功标准

Worker页面和接口一致显示单Worker保护及本人邮箱规则；应用代码使用真实issuer/audience；合法本人登录成功，匿名或伪造邮箱头的请求进入Access登录流程且不返回私有数据。业务注销、下载、长期连接等验收仍由应用任务单独记录。

## 失败模式与恢复

本次未验证通用失败恢复方法。保存后控制台可短暂保留旧列表，使用本次写入触发的加载完成或明确读回结果，不盲目重复创建。用户接管立即停止，不能换空间继续。

## 验证证据

2026-10-25：精确邮箱Allow策略与6小时会话已保存；目标Worker显示All traffic，接口读回仅一个worker destination。真实应用登录、私有原件读取及事件连接通过；匿名首页、bootstrap、文件请求均302到Access，伪造邮箱头不能放行。关键验证帧已上报；应用原件下载自动化和退出登录仍有未完成项，不能把本operation成功外推为完整业务验收。
