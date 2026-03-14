# Translation Tools Plugin

低成本翻译工具集，使用 haiku 模型进行高效翻译。

## 特性

- 🚀 **并行处理**: 多文件自动分组并行翻译
- 💰 **成本优化**: 使用 haiku 模型，节省 60x 成本
- 🎯 **智能调度**: 自动判断单文件/多文件场景
- 📝 **格式保留**: 保持 markdown、代码块、frontmatter 结构

## 结构

```
translation-tools/
├── .claude-plugin/
│   ├── plugin.json        # 插件配置
│   └── marketplace.json   # 市场配置
├── agents/
│   └── translation-worker.md  # 翻译工作 agent (haiku)
├── skills/
│   └── parallel-translation/
│       └── SKILL.md       # 入口 skill
└── README.md
```

## 使用方法

### 翻译单个文件

```
翻译 README.md 为中文
```

### 翻译目录

```
把 docs/ 目录下的所有 md 文件翻译成中文
```

### 翻译整个仓库

```
翻译这个仓库的所有文档
```

## 成本对比

| 方案 | 模型 | 成本/1M tokens |
|------|------|----------------|
| opus | opus | ~$15 |
| sonnet | sonnet | ~$3 |
| **本方案** | **haiku** | **~$0.25** |

## 工作原理

```
用户请求
    │
    ▼
┌─────────────────────────┐
│  parallel-translation   │  (入口 skill)
│  - 分析文件数量         │
│  - 选择策略             │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
 单文件           多文件
    │               │
    ▼               ▼
┌────────┐    ┌─────┴─────┐
│ worker │    │ worker 1  │  (并行)
│ (haiku)│    │ worker 2  │
└────────┘    │ worker 3  │
              └───────────┘
```

## 安装

```bash
# 在 jacky-skills 目录下
j-skills link plugins/translation-tools/skills/parallel-translation
j-skills install parallel-translation -g
```
