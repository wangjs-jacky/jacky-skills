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

## 4) 快速恢复建议

若状态混乱，按以下顺序做一次“最小重置”：

```bash
j-skills uninstall <skill-name> -g
j-skills link --unlink <skill-name>
j-skills link <skill-name>
j-skills list -g
```

完成后重启会话再验证触发行为。
