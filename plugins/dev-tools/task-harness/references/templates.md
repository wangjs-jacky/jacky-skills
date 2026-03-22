# Harness 模板库

> 此文件包含各类任务的 Harness 模板，供主 SKILL.md 引用。

## 函数 TDD 模板

```markdown
## Harness: 函数 <函数名>

### 输入/输出契约
- 输入: `<类型>`
- 输出: `<类型>`

### 测试用例

| 输入 | 预期输出 | 说明 |
|------|----------|------|
| `<case1>` | `<expected1>` | 正常情况 |
| `<case2>` | `<expected2>` | 边界情况 |
| `<case3>` | `<expected3>` | 错误处理 |

### 验证命令

```bash
npm test -- <test-file>
```
```

---

## 网页快照模板

```markdown
## Harness: 网页 <页面名>

### 元素检查
- [ ] <元素1> 存在
- [ ] <元素2> 存在
- [ ] <元素3> 可见

### 交互检查
- [ ] 点击 <按钮> 触发 <动作>
- [ ] 输入 <值> 显示 <结果>

### 视觉回归
- [ ] 桌面端快照匹配
- [ ] 移动端快照匹配

### 验证命令

```bash
npm run test:e2e -- --spec <spec-file>
npm run test:visual
```
```

---

## CLI 工具模板

```markdown
## Harness: CLI <工具名>

### 命令检查

| 命令 | 预期输出包含 | 预期退出码 |
|------|-------------|-----------|
| `<cmd> --help` | `Usage:` | 0 |
| `<cmd> --version` | `v1.0.0` | 0 |
| `<cmd> <valid>` | `<success>` | 0 |
| `<cmd> <invalid>` | `Error:` | 1 |

### 验证命令

```bash
# 自动化测试脚本
./test-cli.sh
```
```

---

## 文件操作脚本模板

```markdown
## Harness: 脚本 <脚本名>

### 前置条件
- [ ] <条件1>
- [ ] <条件2>

### 执行结果
- [ ] 文件 `<path>` 被创建
- [ ] 文件内容包含 `<content>`

### 验证命令

```bash
# 检查文件存在
test -f <path> && echo "PASS" || echo "FAIL"

# 检查文件内容
grep -q "<pattern>" <path> && echo "PASS" || echo "FAIL"
```
```

---

## API/服务模板

```markdown
## Harness: API <接口名>

### 端点检查

| 方法 | 路径 | 预期状态码 | 预期响应 |
|------|------|-----------|---------|
| GET | `/api/users` | 200 | 用户列表 |
| POST | `/api/users` | 201 | 创建的用户 |
| GET | `/api/users/999` | 404 | 错误信息 |

### 验证命令

```bash
# 使用 curl 测试
curl -X GET http://localhost:3000/api/users

# 或使用专用测试
npm run test:api
```
```

---

## 配置文件模板

```markdown
## Harness: 配置 <配置名>

### 语法检查
- [ ] 配置文件语法正确
- [ ] 必需字段存在

### 效果验证
- [ ] 配置生效后 <行为1>
- [ ] 配置生效后 <行为2>

### 验证命令

```bash
# 语法检查
npx prettier --check <config-file>

# 效果验证
<启动命令> && <验证行为>
```
```
