---
platform: github
operation: rename-repository
status: verified
last_verified: 2026-10-21
---

# 重命名仓库

## 目标
将用户指定的GitHub仓库改为明确的新名称。

## 前置条件与授权
用户明确指定旧仓库与新名称。使用已认证的gh；先核对旧仓库身份。

## 流程与检查点
1. 用 `gh repo view OWNER/OLD --json id,nameWithOwner,url,visibility` 核对实际仓库身份与可见性；旧地址可能已跳转到不同名称，不能仅凭本地remote推断当前名称。
2. 用 `gh repo rename NEW -R OWNER/OLD --yes` 执行明确授权的改名。
3. 用 `gh repo view OWNER/NEW --json id,nameWithOwner,url,visibility` 读回结果，确认仓库ID与原值一致、名称正确、可见性保持用户要求。
4. 将本地目录、remote、文档和已安装Skill标识分别处理；不可假定远端改名自动完成这些变更。

## 成功标准
新地址读回正确仓库名称与URL、相同仓库ID及要求的可见性。本地同步与网站部署另行验收。

## 坑与恢复
本地目录不可读时保留原入口和未知改动；使用临时检出完成明确授权的源码工作，记录后续同步缺口，不覆盖原工作树。

## 证据与边界
2026-10-18：当前gh帮助核对命令签名；执行明确旧仓库到新名称的改名，新地址读回name与url成功。另一次普通源码推送读回远端SHA与提交一致。本地外盘入口不可读，因此未声称本地目录或remote更新完成。具体身份与路径存ignored项目实例。

2026-10-21：既有私有仓库旧remote实际已解析到另一名称；先读回身份，再执行本轮明确授权的改名。新地址的ID与改名前一致、名称正确且保持PRIVATE。本地实际目录、兼容入口和remote分别完成核对，后续常规推送读回main与本机一致；未执行网站部署。具体仓库、路径与回执保存在既有Goal First目标。
