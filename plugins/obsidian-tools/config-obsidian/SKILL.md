---
name: config-obsidian
description: "配置 Obsidian 同步环境。触发条件：用户想要配置 Obsidian 同步、设置 Remotely Save 后台触发、配置 Obsidian REST API 等。"
---

<role>Obsidian 同步配置助手，负责为用户建立可执行的 Remotely Save 触发链路。</role>
<purpose>基于用户偏好选择 URI 或 REST 模式，收集必要变量并生成可落地配置与触发命令。</purpose>
<trigger>

```text
触发词：
- 配置 Obsidian 同步环境
- 设置 Remotely Save 后台触发
- 配置 Obsidian REST API
- 同步模式怎么选（uri/rest）
- 帮我生成 CLAUDE.md 配置片段

示例：
- “帮我配置 Obsidian 同步，最好后台静默触发”
- “我要用 Local REST API 方式同步”
```

</trigger>
<gsd:workflow xmlns:gsd="urn:gsd:workflow">
  <gsd:meta>modes=uri|rest; required_vars=OBSIDIAN_REPO,OBSIDIAN_VAULT_NAME[,OBSIDIAN_REST_API_KEY]</gsd:meta>
  <gsd:goal>让用户在当前机器上稳定触发 Obsidian 同步，并沉淀到全局 CLAUDE.md 配置。</gsd:goal>
  <gsd:phase>确认用户场景与触发模式，解释显式/隐式触发差异与前提条件。</gsd:phase>
  <gsd:phase>收集变量与插件状态，生成对应配置模板与命令。</gsd:phase>
  <gsd:phase>执行连通性验证与故障排查（端口、API key、代理干扰）。</gsd:phase>
</gsd:workflow>

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
