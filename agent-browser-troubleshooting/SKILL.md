---
name: agent-browser-troubleshooting
description: 使用 agent-browser 遇到问题时的故障排查指南。当 agent-browser 命令失败、浏览器无法启动、连接超时、或页面操作异常时触发此 skill。
---

# agent-browser 故障排查指南

> 本 skill 帮助快速诊断和解决 agent-browser 使用中的常见问题。

## ⚠️ 首次使用必读（重要！）

> **经验总结**：90% 的失败都发生在首次安装浏览器阶段。请按以下步骤操作。

### 第一步：检查系统代理端口

```bash
networksetup -getwebproxy Wi-Fi
```

输出示例：
```
Enabled: Yes
Server: 127.0.0.1
Port: 10802    <-- 记住这个端口号
```

### 第二步：使用正确的安装命令

**❌ 错误方式**（会失败或安装错误版本）：
```bash
npx playwright install chromium        # 可能因代理问题失败
```

**✅ 正确方式**（使用 playwright-core + 正确代理）：
```bash
export HTTP_PROXY=http://127.0.0.1:10802
export HTTPS_PROXY=http://127.0.0.1:10802
npx playwright-core install chromium
```

> **为什么用 playwright-core？**
> - agent-browser 依赖的是 `playwright-core`，不是 `playwright`
> - 直接用 `npx playwright-core` 会下载最新匹配版本
> - 代理端口必须与系统代理一致（不是 7890，而是实际端口如 10802）

### 第三步：验证安装成功

```bash
ls ~/Library/Caches/ms-playwright/ | grep chromium_headless_shell
```

应该看到类似 `chromium_headless_shell-1208` 的目录。

### 第四步：首次测试

```bash
agent-browser open 'https://example.com' && agent-browser snapshot -i
```

### 🌟 替代方案：使用系统 Chrome（无需下载 Playwright 浏览器）

> **推荐**：如果你不想下载 Playwright 浏览器，可以直接使用系统已安装的 Chrome。

```bash
# 1. 启动带调试端口的 Chrome
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile &

# 2. 连接到 Chrome
agent-browser connect 9222

# 3. 正常使用
agent-browser open 'https://example.com'
agent-browser snapshot -i
```

**优势对比**：

| 方案 | 是否需要下载 | 版本兼容问题 | 推荐度 |
|------|-------------|-------------|--------|
| Playwright 浏览器 | 一次性下载 (~160MB) | 可能需要更新 | ⭐⭐⭐ |
| 系统 Chrome + connect | **无需下载** | 无版本问题 | ⭐⭐⭐⭐⭐ |

---

## 快速诊断流程

```
问题出现
    ↓
1. 检查环境（浏览器版本、代理设置）
    ↓
2. 选择正确的连接方式
    ↓
3. 干净环境运行
    ↓
4. 验证连接成功
```

## 一、环境检查（必做第一步）

### 1.1 检查 agent-browser 版本

```bash
agent-browser --version
```

### 1.2 检查 Playwright 浏览器版本

```bash
ls ~/Library/Caches/ms-playwright/
```

**常见问题**：版本号不匹配
- agent-browser 0.13.0 需要 `chromium_headless_shell-1208`
- 如果只有 `chromium_headless_shell-1200`，需要更新

### 1.3 安装/更新浏览器

```bash
# 无代理环境
npx playwright install chromium

# 有代理环境（需要代理运行时）
export https_proxy=http://127.0.0.1:7890
npx playwright install chromium
```

## 二、代理问题排查

### 2.1 症状识别

| 症状 | 可能原因 |
|------|----------|
| `ECONNREFUSED 127.0.0.1:7890` | 代理端口未运行 |
| CDP 连接失败但端口正常 | 代理环境变量干扰 |
| curl 能访问但 agent-browser 不能 | 代理设置冲突 |

### 2.2 解决方案：干净环境运行

**方法 A：临时清除代理变量**

```bash
unset http_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY
export NO_PROXY=localhost,127.0.0.1
agent-browser <command>
```

**方法 B：使用 env -i（手动指定 PATH）**

```bash
env -i HOME="$HOME" USER="$USER" \
  PATH="$PATH" \
  agent-browser <command>
```

> **注意**：`$PATH` 会自动继承系统的 PATH 变量，无需手动指定 Node 路径。

**方法 B：临时清除代理变量**

```bash
unset http_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY
export NO_PROXY=localhost,127.0.0.1
agent-browser <command>
```

## 三、CDP 连接问题

### 3.1 启动带调试端口的 Chrome

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile \
  "https://example.com" &
```

### 3.2 验证端口可用

```bash
# 注意：必须绕过代理
curl --noproxy "*" http://localhost:9222/json/version
```

### 3.3 正确的连接方式

```bash
# ❌ 错误：--cdp 选项可能失败
agent-browser --cdp 9222 snapshot -i

# ✅ 正确：使用 connect 命令
agent-browser connect 9222
agent-browser snapshot -i
```

## 四、页面操作问题

### 4.1 快照为空或缺少元素

**可能原因**：
- 页面未完全加载
- 使用了 `-i` 参数（只显示可交互元素）

**解决方案**：

```bash
# 等待页面加载
agent-browser wait --load networkidle

# 使用完整快照（不是 -i）
agent-browser snapshot
```

### 4.2 点击无效

**可能原因**：
- 元素被遮挡
- React/Vue 动态渲染，链接不在 href 中
- 需要滚动到可见区域

**解决方案**：

```bash
# 使用 find 命令（Playwright 定位器）
agent-browser find text "按钮文字" click

# 滚动到元素
agent-browser scrollintoview @e1

# 使用 JavaScript 点击
agent-browser eval 'document.querySelector("selector").click()'
```

### 4.3 动态内容无法提取

**策略优先级**：

1. **优先：调用 API**
   ```bash
   agent-browser network requests  # 查看网络请求
   agent-browser eval 'fetch(...)'  # 直接调用 API
   ```

2. **次选：使用 JavaScript**
   ```bash
   agent-browser eval --stdin <<'EOF'
   JSON.stringify(
     Array.from(document.querySelectorAll('selector')).map(el => ({
       text: el.innerText
     }))
   )
   EOF
   ```

3. **最后：UI 操作**
   ```bash
   agent-browser find text "xxx" click
   agent-browser get url
   ```

## 五、高效使用技巧

### 5.1 批量操作优化

**❌ 低效方式**（每次都重新打开页面）：
```bash
for item in items; do
  agent-browser open "$LIST_URL"
  agent-browser find text "$item" click
  agent-browser get url
done
```

**✅ 高效方式**（保持连接，减少页面加载）：
```bash
agent-browser connect 9222
agent-browser open "$LIST_URL"

for item in items; do
  agent-browser find text "$item" click
  agent-browser get url
  agent-browser back
done
```

### 5.2 并行处理

```bash
# 多个独立会话
agent-browser --session a open "url1" &
agent-browser --session b open "url2" &
wait
```

### 5.3 会话持久化

```bash
# 保存登录状态
agent-browser --session-name myapp open "https://login-page.com"
# ... 登录操作 ...
agent-browser close

# 后续使用（自动恢复登录状态）
agent-browser --session-name myapp open "https://dashboard.com"
```

## 六、故障排查清单

遇到问题时，按顺序检查：

```bash
# 1. 版本检查
agent-browser --version
ls ~/Library/Caches/ms-playwright/

# 2. 端口检查
lsof -i :9222
curl --noproxy "*" http://localhost:9222/json/version

# 3. 干净环境测试
env -i HOME="$HOME" PATH="$PATH" agent-browser connect 9222

# 4. 简单操作验证
agent-browser snapshot -i
```

## 七、血的教训：常见错误案例

### 案例 1：代理端口错误导致无限重试

**症状**：
```
Error: Proxy connection ended before receiving CONNECT response
Error: connect ECONNREFUSED 127.0.0.1:7890
```

**原因**：使用了错误的代理端口（7890），但实际系统代理是 10802

**解决方案**：
```bash
# 先检查实际端口！
networksetup -getwebproxy Wi-Fi

# 然后使用正确的端口
export HTTP_PROXY=http://127.0.0.1:10802
export HTTPS_PROXY=http://127.0.0.1:10802
npx playwright-core install chromium
```

### 案例 2：安装了错误版本的浏览器

**症状**：
```
Executable doesn't exist at .../chromium_headless_shell-1208/...
```

**原因**：用 `npx playwright install` 安装的是 playwright 包的版本，但 agent-browser 需要 playwright-core 的版本

**解决方案**：
```bash
# 必须用 playwright-core
npx playwright-core install chromium
```

### 案例 3：refs 失效导致点击失败

**症状**：
```
locator.evaluate: Unsupported token "@e83" while parsing css selector
```

**原因**：refs（@e1, @e2...）在页面变化后失效，需要重新 snapshot

**解决方案**：
```bash
# 方案 A：重新获取快照
agent-browser snapshot -i
agent-browser click @e1

# 方案 B：使用 find text（更稳定）
agent-browser find text "产品名称" click
```

### 案例 4：后台命令超时无响应

**症状**：
```
Failed to read: Resource temporarily unavailable (os error 35)
```

**原因**：daemon 忙碌或无响应

**解决方案**：
```bash
# 重启 daemon
agent-browser close
sleep 2
agent-browser open 'https://example.com'
```

---

## 八、常见错误速查

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `Executable doesn't exist` | 浏览器版本不匹配 | `npx playwright install chromium` |
| `ECONNREFUSED 127.0.0.1:7890` | 代理未运行但设置了变量 | `unset all_proxy` 或关闭代理 |
| `Failed to connect via CDP` | 代理干扰或端口错误 | 用 `connect` 命令，确保干净环境 |
| `Target page has been closed` | 浏览器意外关闭 | 重启 Chrome 调试端口 |
| `strict mode violation` | 多个元素匹配 | 用更精确的选择器或 `find first` |
| `Timeout 10000ms exceeded` | 页面加载慢 | 增加等待时间 `wait 20000` |

## 九、推荐工作流

```bash
# 步骤 1：启动 Chrome（一次性）
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile &

# 步骤 2：干净环境连接
env -i HOME="$HOME" PATH="$PATH" agent-browser connect 9222

# 步骤 3：导航和操作
agent-browser open "https://target-site.com"
agent-browser wait --load networkidle
agent-browser snapshot -i

# 步骤 4：提取数据
agent-browser eval '...'  # 优先用 JS/API
```

## 参考资料

- [agent-browser 官方文档](https://github.com/nick1udwig/agent-browser)
- [Playwright 文档](https://playwright.dev/python/docs/api/class-playwright)
