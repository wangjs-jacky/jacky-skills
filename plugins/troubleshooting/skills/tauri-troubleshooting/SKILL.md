---
name: tauri-troubleshooting
description: "Tauri v2 开发中常见问题的故障排查指南。当遇到 Tauri 插件权限、命令调用、配置错误等问题时触发此 skill。"
---

<role>Tauri v2 故障排查助手，负责识别插件权限、命令调用和配置兼容性问题。</role>
<purpose>把“现象描述”映射为可执行修复步骤，覆盖前端调用、Rust 端实现与权限配置联调。</purpose>
<trigger>

```text
触发词：
- Tauri 插件权限报错
- Command.create 无反应
- Dialog 无法打开
- tauri.conf.json 配置错误
- Tauri v2 故障排查

示例：
- “Tauri 报 unknown field scope，怎么修”
- “点击按钮后 shell 命令不执行，帮我排查”
```

</trigger>
<gsd:workflow xmlns:gsd="urn:gsd:workflow">
  <gsd:meta>stack=tauri-v2; key_files=tauri.conf.json,capabilities/*.json,src-tauri/src/main.rs</gsd:meta>
  <gsd:goal>快速确认根因并给出最小变更修复，保证前后端与权限配置一致。</gsd:goal>
  <gsd:phase>按错误症状归类问题，优先比对配置字段与插件注册状态。</gsd:phase>
  <gsd:phase>实施修复：更新配置、补齐依赖/权限、或迁移到 Rust 端命令。</gsd:phase>
  <gsd:phase>通过终端日志与 DevTools 复测关键路径，确认行为恢复。</gsd:phase>
</gsd:workflow>

# Tauri v2 故障排查指南

本文档总结了 Tauri v2 开发中常见的问题和解决方案。

## 问题索引

| 问题类型 | 症状 | 解决方案 |
|---------|------|---------|
| [插件权限配置错误](#1-插件权限配置错误) | `PluginInitialization` 错误 | 检查配置字段是否正确 |
| [Shell 命令执行失败](#2-shell-命令执行失败) | 点击按钮无反应 | 使用 Rust 端命令替代 |
| [Dialog 插件未安装](#3-dialog-插件未安装) | 文件对话框无法打开 | 安装并配置 dialog 插件 |
| [图标显示问题](#4-图标显示问题) | Emoji 图标不专业 | 使用 Lucide React 图标库 |

---

## 1. 插件权限配置错误

### 症状

```
error while running tauri application: PluginInitialization("shell", "Error deserializing 'plugins.shell' within your Tauri configuration: unknown field `scope`, expected `open`")
```

### 原因

Tauri v2 的 `tauri.conf.json` 中 `plugins.shell` 配置格式错误，使用了 v1 的 `scope` 字段。

### 解决方案

**错误配置**：
```json
{
  "plugins": {
    "shell": {
      "open": true,
      "scope": [
        {
          "name": "open",
          "cmd": "open",
          "args": true
        }
      ]
    }
  }
}
```

**正确配置**：
```json
{
  "plugins": {
    "shell": {
      "open": true
    }
  }
}
```

### 注意事项

- Tauri v2 的 shell 插件配置简化了很多
- 复杂的命令执行应该通过 Rust 端的自定义命令实现
- 权限控制在 `capabilities/*.json` 中配置

---

## 2. Shell 命令执行失败

### 症状

- 点击按钮调用 `Command.create()` 无反应
- 前端调用 shell 插件命令没有任何效果
- Console 中没有错误输出

### 原因

Tauri v2 的 shell 插件对系统命令执行有严格限制，直接通过前端调用 `Command.create()` 可能因为权限或配置问题失败。

### 解决方案

**推荐方案：在 Rust 端实现命令**

1. 在 `src-tauri/src/main.rs` 中添加自定义命令：

```rust
use std::process::Command as OsCommand;

#[tauri::command]
fn reveal_in_finder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        OsCommand::new("open")
            .args(["-R", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        OsCommand::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        OsCommand::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

2. 注册命令：

```rust
fn main() {
    tauri::Builder::default()
        // ... 其他插件
        .invoke_handler(tauri::generate_handler![reveal_in_finder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

3. 前端调用：

```typescript
import { invoke } from '@tauri-apps/api/core'

async function revealInFinder(path: string) {
  try {
    await invoke('reveal_in_finder', { path })
  } catch (error) {
    console.error('Failed to reveal file:', error)
  }
}
```

### 调试技巧

在 Rust 端添加日志：

```rust
#[tauri::command]
fn reveal_in_finder(path: String) -> Result<(), String> {
    println!("reveal_in_finder called with path: {}", path);
    // ... 执行命令
}
```

日志会输出到运行 `npm run tauri:dev` 的终端中。

---

## 3. Dialog 插件未安装

### 症状

- 点击"浏览"按钮无反应
- 文件/文件夹选择对话框无法打开

### 解决方案

1. **安装前端依赖**：

```bash
npm install @tauri-apps/plugin-dialog
```

2. **添加 Rust 依赖**（`src-tauri/Cargo.toml`）：

```toml
[dependencies]
tauri-plugin-dialog = "2"
```

3. **注册插件**（`src-tauri/src/main.rs`）：

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        // ...
}
```

4. **配置权限**（`src-tauri/capabilities/default.json`）：

```json
{
  "permissions": [
    "dialog:default"
  ]
}
```

5. **前端使用**：

```typescript
import { open } from '@tauri-apps/plugin-dialog'

const handleBrowse = async () => {
  const selected = await open({
    directory: true,  // 选择文件夹
    multiple: false,  // 单选
    defaultPath: '/Users/xxx/Downloads',
  })
  if (selected) {
    console.log('Selected:', selected)
  }
}
```

---

## 4. 图标显示问题

### 症状

- Emoji 图标在不同系统显示不一致
- 图标看起来不专业

### 解决方案

使用 Lucide React 图标库：

1. **安装依赖**：

```bash
npm install lucide-react
```

2. **使用图标**：

```tsx
import { FolderOpen, Play, Pause, Trash2, Settings } from 'lucide-react'

function Toolbar() {
  return (
    <>
      <button><Play size={18} /></button>
      <button><Pause size={18} /></button>
      <button><Trash2 size={18} /></button>
      <button><Settings size={18} /></button>
    </>
  )
}
```

3. **常用图标对照**：

| Emoji | Lucide 图标 |
|-------|------------|
| ▶️ | `<Play size={18} />` |
| ⏸️ | `<Pause size={18} />` |
| 🗑️ | `<Trash2 size={18} />` |
| ⚙️ | `<Settings size={18} />` |
| 📂 | `<FolderOpen size={18} />` |
| ➕ | `<Plus size={18} />` |
| ☀️ | `<Sun size={24} />` |
| 🌙 | `<Moon size={24} />` |

---

## 调试检查清单

遇到问题时，按以下顺序检查：

1. **终端输出**：查看运行 `npm run tauri:dev` 的终端是否有 Rust 端错误
2. **DevTools Console**：按 `Cmd+Option+I` 打开开发者工具，查看前端错误
3. **权限配置**：检查 `capabilities/default.json` 是否包含所需权限
4. **插件注册**：检查 `main.rs` 中是否正确初始化插件
5. **依赖安装**：检查 `Cargo.toml` 和 `package.json` 是否包含所需依赖

## 快速启动命令

```bash
# 启动开发模式
npm run tauri:dev

# 构建生产版本
npm run tauri:build

# 仅启动前端预览
npm run dev
```

## 相关文档

- [Tauri v2 官方文档](https://v2.tauri.app/)
- [Shell 插件文档](https://v2.tauri.app/plugin/shell/)
- [Dialog 插件文档](https://v2.tauri.app/plugin/dialog/)
- [Lucide React 图标库](https://lucide.dev/icons/)
