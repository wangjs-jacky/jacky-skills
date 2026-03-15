---
name: link-all-skills
description: 将当前项目下所有 skills 链接到全局注册表并安装到默认环境。触发于 "链接所有 skills"、"link all skills"、"批量链接" 等请求。
---

# 批量链接并安装 Skills

将当前项目目录下所有包含 `SKILL.md` 的子目录链接到全局注册表，**并自动安装到默认环境**。

## 使用场景

- 项目中有多个 skills 需要一次性链接和安装
- 刚克隆了一个 skills 仓库，需要初始化
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

### 3. 自动安装到默认环境

对每个已链接的 skill 执行：

```bash
# 安装到 claude-code 环境（默认环境）
j-skills install <skill-name> -g -e claude-code -y
```

**说明**：
- `-g` 全局安装
- `-e claude-code` 指定目标环境
- `-y` 跳过确认

### 4. 验证结果

```bash
# 查看已链接的 skills
j-skills link --list

# 查看已安装的 skills
j-skills list -g
```

## 一键脚本

项目内包含 `link-all.sh` 脚本，可一键完成所有操作：

```bash
./link-all.sh
```

## 注意事项

- 链接是软链接，修改源文件立即生效
- 如果 skill 已链接到其他位置，会被覆盖指向当前项目
- **新增**：链接后自动安装到 `claude-code` 环境
- 需要 `j-skills` 已全局安装 (`npm install -g j-skills`)
