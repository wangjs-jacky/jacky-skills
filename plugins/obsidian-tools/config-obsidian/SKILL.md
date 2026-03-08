---
name: config-obsidian
description: 配置 Obsidian 同步环境。触发条件：用户想要配置 Obsidian 同步、设置 Remotely Save 后台触发、配置 Obsidian REST API 等。
---

# Obsidian 同步环境配置

帮助用户配置 Obsidian Remotely Save 的触发环境，配置完成后可将设置保存到 `CLAUDE.md` 中。

## 使用场景

- 用户说"配置 Obsidian 同步环境"
- 用户说"我想后台触发 Obsidian 同步"
- 用户说"帮我设置 Obsidian REST API"

## 配置流程

### 第一步：询问触发方式

| 方式 | 说明 | 特点 |
|------|------|------|
| **显式触发** | 使用 Advanced URI 插件 | 会激活 Obsidian 窗口 |
| **隐式触发** | 使用 Local REST API 插件 | 后台静默执行，不激活窗口 |

### 第二步：引导安装插件

#### 方案一：显式触发（Advanced URI）

**安装步骤：**

1. 打开 Obsidian → 设置 → 第三方插件 → 浏览
2. 搜索 `Advanced URI` 并安装启用

**需要的配置变量：**

| 变量 | 说明 | 如何获取 |
|------|------|----------|
| `OBSIDIAN_REPO` | Obsidian 仓库路径 | 询问用户 |
| `OBSIDIAN_VAULT_NAME` | 仓库名称 | `basename $OBSIDIAN_REPO` |

#### 方案二：隐式触发（Local REST API）

**安装步骤：**

1. 打开 Obsidian → 设置 → 第三方插件 → 浏览
2. 搜索 `Local REST API` 并安装启用
3. 在插件设置中找到 **API Key**，复制密钥

**需要的配置变量：**

| 变量 | 说明 | 如何获取 |
|------|------|----------|
| `OBSIDIAN_REPO` | Obsidian 仓库路径 | 询问用户 |
| `OBSIDIAN_VAULT_NAME` | 仓库名称 | `basename $OBSIDIAN_REPO` |
| `OBSIDIAN_REST_API_KEY` | REST API 密钥 | 插件设置页面 |

### 第三步：生成配置

根据用户选择，生成配置片段，引导用户添加到 `~/.claude/CLAUDE.md`：

#### 显式触发配置模板

```markdown
## Obsidian 同步配置

| 配置变量 | 说明 | 当前值 |
|----------|------|--------|
| `OBSIDIAN_REPO` | Obsidian 仓库路径 | `<用户仓库路径>` |
| `OBSIDIAN_VAULT_NAME` | 仓库名称 | `<仓库名称>` |
| `OBSIDIAN_SYNC_MODE` | 同步模式 | `uri` |

### 触发同步命令

```bash
open "obsidian://advanced-uri?vault=<仓库名>&commandid=remotely-save%3Astart-sync"
```
```

#### 隐式触发配置模板

```markdown
## Obsidian 同步配置

| 配置变量 | 说明 | 当前值 |
|----------|------|--------|
| `OBSIDIAN_REPO` | Obsidian 仓库路径 | `<用户仓库路径>` |
| `OBSIDIAN_VAULT_NAME` | 仓库名称 | `<仓库名称>` |
| `OBSIDIAN_REST_API_KEY` | REST API 密钥 | `<API_KEY>` |
| `OBSIDIAN_SYNC_MODE` | 同步模式 | `rest` |

### 触发同步命令

```bash
curl --noproxy "*" -k -s -X POST "https://localhost:27124/commands/remotely-save:start-sync" \
  -H "Authorization: Bearer <API_KEY>"
```
```

## 执行同步

配置完成后，用户可以说"同步 Obsidian"，Claude 会：

1. 读取 `OBSIDIAN_SYNC_MODE` 判断同步模式
2. 根据模式执行对应的触发命令

### 显式触发（uri 模式）

```bash
open "obsidian://advanced-uri?vault=${OBSIDIAN_VAULT_NAME}&commandid=remotely-save%3Astart-sync"
```

### 隐式触发（rest 模式）

```bash
curl --noproxy "*" -k -s -X POST "https://localhost:27124/commands/remotely-save:start-sync" \
  -H "Authorization: Bearer ${OBSIDIAN_REST_API_KEY}"
```

## 前提条件

无论哪种方式，都需要：

1. **Obsidian 正在运行**
2. **Remotely Save 插件已安装并配置好云同步**
3. **对应的触发插件已安装启用**

## 相关插件

| 插件 | 说明 | 必需 |
|------|------|------|
| Remotely Save | 云同步插件 | ✅ 必需 |
| Advanced URI | URI 控制（显式触发） | 二选一 |
| Local REST API | REST API（隐式触发） | 二选一 |

## 故障排查

### REST API 连接失败

```bash
# 检查端口是否监听
lsof -i :27124

# 测试 API 连接
curl -k "https://localhost:27124/vault/" \
  -H "Authorization: Bearer <API_KEY>"
```

### 代理干扰

确保使用 `--noproxy "*"` 参数。
