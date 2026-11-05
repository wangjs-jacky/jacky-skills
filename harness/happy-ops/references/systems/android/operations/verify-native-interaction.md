# 验证 Android 原生交互

- system: android
- operation: verify-native-interaction
- status: verified
- last_verified: 2026-10-22
- risk: low
- scope: 已安装开发客户端加载分支 JS，Android 模拟器真实触摸、导航和状态；不代表 APK、OTA 或实体手机发布验收。

## 目标
用实际原生客户端验证共享 React Native 功能，并交付可播放的交互证据。

## 前置条件与授权
已有功能测试授权，明确目标设备与测试账户；保持原账户和已有后台服务。

## 入口
项目开发指南、目标 ADB serial、现有开发客户端与分支 Metro。

## 步骤与检查点
1. 核对客户端包名、设备和服务，临时映射仅限必要端口。
2. 使用独立测试账户加载分支 JS，保留原选择；不得清空用户 App 数据。
3. 按需求通过真实触摸进入不同目标，验证实际内容及返回行为。组件测试不能替代此路径。
4. 采集无凭据截图与实际录屏；规范化录屏时间戳后完整解码，使用聊天媒体工具交付。
5. 恢复原账户、删除新增测试账户，清理本任务创建的服务和设备资源。

## 成功标准
原生用户操作到达正确真实内容，状态与导航满足需求；证据可播放且测试环境恢复。明确模拟器与实体手机、开发 JS 与发布包的边界。

## 失败模式与恢复
Hermes Runtime.evaluate 不保证支持异步语法或 awaitPromise；必要时使用普通 Promise 回调保存无敏感结果，再单次读取。Expo 生成的路由声明异常时核对路由上下文是否误纳入测试文件；不能放宽类型以绕过检查。ADB screenrecord 时间戳异常可转为恒定帧率并完整解码复核。

## 验证证据
[本机证据](../../../../local/systems/android/operations/verify-native-interaction.md)；验证范围仅限开发客户端模拟器交互。
