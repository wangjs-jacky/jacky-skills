---
name: link-all-skills
description: 将当前项目下所有 skills 链接到全局注册表。触发于 "链接所有 skills"、"link all skills"、"批量链接" 等请求。
---

# 批量链接 Skills

将当前项目目录下所有包含 `SKILL.md` 子目录链接到全局注册表。

## 使用场景

- 项目中有多个 skills 需要一次性链接
- 刚克隆了一个 skills 仓库，需要初始化链接
- 需要更新所有 skills 的链接指向

## 执行流程

### 1. 扫描 Skills

```bash
# 查找所有包含 SKILL.md 的目录
find . -maxdepth 2 -name "SKILL.md" -type f | xargs -I {} dirname {}
```

### 2. 执行链接

对每个 skill 目录执行：

```bash
# 先 unlink（避免交互式确认阻塞）
j-skills link --unlink <skill-name> 2>/dev/null

# 再 link
j-skills link <skill-name>
```

### 3. 验证结果

```bash
j-skills link --list
```

## 一键脚本

项目内包含 `link-all.sh` 脚本，可一键完成所有操作：

```bash
./link-all.sh
```

## 注意事项

- 链接是软链接，修改源文件立即生效
- 如果 skill 已链接到其他位置，会被覆盖指向当前项目
- 需要 `j-skills` 已全局安装 (`npm install -g j-skills`)
