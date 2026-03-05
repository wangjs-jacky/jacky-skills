# Multi-Agent 使用示例

## 示例 1：代码审查

**输入：**
```
/multi-agent "请审查这段代码的安全性问题：
function login(username, password) {
  const query = `SELECT * FROM users WHERE username='${username}'`;
  return db.query(query);
}"
```

**预期输出：**
- Agent 1 识别 SQL 注入问题
- Agent 2 可能补充其他安全问题（如密码明文传输）
- 裁判综合两者的发现

## 示例 2：技术选型

**输入：**
```
/multi-agent "React 项目状态管理选型：Redux vs Zustand vs Jotai"
```

**预期输出：**
- 多角度对比分析
- 场景化推荐
- 综合最佳实践

## 示例 3：问题诊断

**输入：**
```
/multi-agent "我的 Node.js 应用内存持续增长，可能的原因？"
```

**预期输出：**
- 常见内存泄漏模式
- 诊断步骤
- 工具推荐
