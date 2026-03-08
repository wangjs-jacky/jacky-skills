# 上游参考

此 skill 基于 [daymade/claude-code-skills](https://github.com/daymade/claude-code-skills) 的 skill-creator 封装。

## 上游仓库

- **地址**: https://github.com/daymade/claude-code-skills
- **核心参考**: `skill-creator/SKILL.md`

## 上游 Skill Creation Process

上游的 skill 创建流程包含以下步骤：

### Step 1: Understanding the Skill with Concrete Examples

理解 skill 的具体使用场景，通过用户示例或生成示例来明确功能需求。

### Step 2: Planning the Reusable Skill Contents

分析示例，确定需要包含的可复用资源：
- `scripts/` - 可执行脚本
- `references/` - 参考文档
- `assets/` - 输出资源文件

**自由度匹配任务风险：**
- **高自由度**（文本指令）：多种有效方法存在
- **中等自由度**（伪代码）：有首选模式但可接受变化
- **低自由度**（精确脚本）：操作脆弱、一致性关键

### Step 3: Initializing the Skill

使用 init_skill.py 脚本初始化 skill 目录结构。

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

### Step 4: Edit the Skill

编辑 SKILL.md，使用祈使句/不定式形式编写。

**文件命名规范：**
- 模式：`<content-type>_<specificity>.md`
- 示例：`script_parameters.md`, `api_endpoints.md`, `database_schema.md`

### Step 5: Security Review

运行安全扫描，检测硬编码的敏感信息：

```bash
python scripts/security_scan.py <path/to/skill-folder>
```

### Step 6: Packaging a Skill

打包 skill 为可分发的 zip 文件：

```bash
scripts/package_skill.py <path/to/skill-folder>
```

### Step 7: Iterate

迭代改进 skill。

## 本 skill 的扩展功能

在 upstream 基础上，此 skill 添加了：

1. **j-skills 集成** - 使用 j-skills 工具管理 skill 的链接和安装
2. **软链接工作流** - 通过软链接实现热更新开发
3. **多环境支持** - 一键安装到多个 AI 编码助手环境

## 关键差异

| 方面 | upstream | 本 skill |
|------|----------|----------|
| 初始化 | init_skill.py 脚本 | 手动创建或使用模板 |
| 分发 | zip 打包 | j-skills link/install |
| 更新 | 重新打包 | 软链接自动生效 |
| 环境 | 单一环境 | 35+ AI 编码助手 |
