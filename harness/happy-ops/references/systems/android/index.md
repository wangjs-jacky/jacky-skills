# Android App

- system: android
- aliases: 手机、App、APK、OTA、更新、推送、扫码

## 系统共识

package、channel、runtime 是同一发布契约，从工程机器可读配置获取；JS 更新与原生能力边界分开。

## 操作目录

只读当前目标命中的一条 operation。verified 也只覆盖该条 scope；historical/pending 不作为今日成功保证。

| 目标／症状 | 操作 | 状态 | 最近验证 |
| --- | --- | --- | --- |
| 发布并核对 OTA | [publish-ota](operations/publish-ota.md) | verified | 2026-10-03 |
| 核对原生包构建与安装契约 | [build-apk](operations/build-apk.md) | historical | none |
| 排查 OTA 与 APK 更新 | [diagnose-update](operations/diagnose-update.md) | historical | none |
| 排查推送注册与提醒 | [diagnose-notifications](operations/diagnose-notifications.md) | pending | none |
| 排查扫码与账号绑定 | [diagnose-account-link](operations/diagnose-account-link.md) | historical | none |
| 排查 App 历史与重连 | [diagnose-history-sync](operations/diagnose-history-sync.md) | historical | none |

## 共性陷阱

manifest 可达不等于设备加载；通知中继接受请求不等于手机收到。旧记录中的 runtime 数字不能直接使用。

## 本机环境

需要真实入口、版本或机器时读取[私有系统索引](../../../local/systems/android/index.md)，共享安装可无此文件。核实当前 OTA 契约文件、设备 package/channel/runtime/Update ID；设备不可达时明确缺少真机证据。

跨系统目标回到[发布路由](../../release-routing.md)；只继续受影响系统。
