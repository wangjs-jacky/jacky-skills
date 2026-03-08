# 搜索模板

## 常用搜索查询

### 按 Stars 排序

```
GitHub [技能名称] Claude Code Skills stars ranking popular 2026
```

### 按时间排序

```
GitHub [技能名称] skills trending recent updated 2026
```

### 官方资源

```
site:github.com/anthropics [技能名称] skills
```

### 社区资源

```
awesome-claude-skills [技能名称] OR superpowers [技能名称]
```

## 仓库读取模板

### 查看结构

```
mcp__zread__get_repo_structure
repo_name: [owner]/[repo]
dir_path: /skills/[skill-name]
```

### 读取主文件

```
mcp__zread__read_file
repo_name: [owner]/[repo]
file_path: skills/[skill-name]/SKILL.md
```

### 读取参考文件

```
mcp__zread__read_file
repo_name: [owner]/[repo]
file_path: skills/[skill-name]/references/[file].md
```
