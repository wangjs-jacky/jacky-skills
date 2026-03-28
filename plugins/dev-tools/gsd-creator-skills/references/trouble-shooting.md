# Throuble Shooting

用于排查 `gsd-creator-skills` 在安装、链接、加载时的常见异常。

## 1) 修改后不生效

### 现象
- 更新了 `SKILL.md`，但会话内表现没有变化。

### 排查
1. 确认是软链接安装，而不是复制安装：
```bash
j-skills list -g
```
2. 重新执行链接：
```bash
j-skills link <skill-name>
```
3. 重启当前会话，重新触发对应关键词。

## 2) 卸载后仍能触发

### 现象
- 执行卸载后，skill 仍然在列表里或仍被触发。

### 排查
1. 先卸载全局安装：
```bash
j-skills uninstall <skill-name> -g
```
2. 再解除链接：
```bash
j-skills link --unlink <skill-name>
```
3. 再次检查：
```bash
j-skills list -g
```

## 3) 不确定是全局还是项目级生效

### 现象
- 在某个项目可用，换项目不可用，或反过来。

### 排查
1. 当前项目内检查本地配置（若有）：
```bash
j-skills list
```
2. 检查全局安装：
```bash
j-skills list -g
```
3. 需要跨项目复用时使用全局安装；仅当前仓库使用时保留项目级安装。

## 4) SKILL.md 缺少 YAML frontmatter

### 现象
- 启动或加载时提示：
  - `Skipped loading 1 skill(s) due to invalid SKILL.md files.`
  - `<path>/SKILL.md: missing YAML frontmatter delimited by ---`

### 排查
1. 检查 `SKILL.md` 文件开头是否为标准 frontmatter：
```markdown
---
name: your-skill-name
description: "简短描述，说明触发条件"
---
```
2. 确认 `---` 成对出现，且位于文件最顶部。
3. `name` 使用 kebab-case，`description` 使用双引号包裹。

### 快速修复
在文件顶部补齐上述 frontmatter 后，重启会话并重新触发验证。

## 5) 快速恢复建议

若状态混乱，按以下顺序做一次“最小重置”：

```bash
j-skills uninstall <skill-name> -g
j-skills link --unlink <skill-name>
j-skills link <skill-name>
j-skills list -g
```

完成后重启会话再验证触发行为。
