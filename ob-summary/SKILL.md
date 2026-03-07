---
name: ob-summary
description: Obsidian 知识库概览总结。当用户想了解 Obsidian 仓库的内容结构、查找特定主题的笔记、或需要知识库概览时触发此 skill。
context: fork
agent: Explore
---

# Obsidian 知识库总结

此 skill 提供 Obsidian 知识库概览，作为本地记忆帮助快速定位和了解笔记内容。

## 配置检查

> **执行前必读**：本 skill 需要使用 Obsidian 仓库路径。

**执行以下检查步骤**：

1. 首先检查全局 CLAUDE.md 中是否定义了 `OBSIDIAN_REPO` 配置变量
2. 如果未定义，使用 `AskUserQuestion` 工具询问用户：
   ```
   请提供您的 Obsidian 仓库路径：
   ```
3. 将用户提供的路径保存为 `$OBSIDIAN_REPO` 变量供后续使用

**配置变量**：
- `$OBSIDIAN_REPO`: Obsidian 仓库根目录（如 `/Users/xxx/Documents/ObsidianVault`）

## 仓库信息

- **路径**: `$OBSIDIAN_REPO`（从全局配置或用户输入获取）
- **总笔记数**: 运行时统计
- **更新日期**: 运行时获取

## 目录结构

| 目录 | 笔记数 | 说明 |
|------|--------|------|
| 00-Inbox | 25 | 收件箱，待整理内容 |
| 10-工作 | 16 | 工作相关记录 |
| 20-学习 | 15 | 学习笔记 |
| 22-计划 | 199 | 计划与题库（最大目录） |
| 30-项目 | 24 | 项目资料 |
| 40-资料 | 11 | 参考资料 |
| 50-卡片记忆 | 1 | 卡片笔记 |
| 99-模板 | 3 | 模板文件 |
| 前端刷题 | 10 | 前端刷题记录 |
| 抖音笔记 | 3 | 抖音内容笔记 |
| 提取视频文案 | 1 | 视频文案提取 |

## 主要内容分类

### 前端开发（核心内容）

主要集中在 `22-计划/题库` 和 `前端刷题` 目录：

- **算法类**: 二分查找、动态规划、图论、回溯、链表、二叉树、排序
- **JavaScript**: Promise、异步编程、特性详解
- **手写题**: Promise.all/race/allSettled、bind、curry、once、debounce 等

### 工作相关（10-工作）

- 携程业务模块数据分析
- 点评模块优化 PRD
- activity-product-detail 性能优化
- RTL 国际化方案

### 技术学习（20-学习 + 00-Inbox/技术文档）

- Cursor 高阶技巧
- Skills vs MCP 对比
- VSCode 插件发布
- React Fiber 架构
- OIDC、NextAuth、Drizzle 等技术文档

### 资料收藏（40-资料）

- 中国互联网大厂职级体系
- 纳瓦尔对话系列

## 使用方式

查找详细笔记索引时，参考 `references/notes-index.md` 获取完整笔记列表。

### 常用查询示例

1. **查找算法题**: 在 `22-计划/题库` 目录下搜索
2. **查找错题**: 在 `22-计划/错题本` 目录下搜索
3. **查找技术文档**: 在 `00-Inbox/技术文档` 目录下搜索
4. **查找工作记录**: 在 `10-工作` 目录下搜索
