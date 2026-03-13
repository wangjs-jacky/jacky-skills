#!/bin/bash

# Parallel Translation Skill - 测试脚本

echo "🧪 Testing Parallel Translation Skill"
echo "======================================"

# 测试 1: 创建测试文件
echo ""
echo "📝 Test 1: Creating test file..."
cat > /tmp/test-translation.md << 'EOF'
# Introduction to React Hooks

React Hooks are functions that let you use state and other React features in functional components. Before Hooks, you had to use class components for state management and lifecycle methods.

## useState Hook

The useState hook is the most basic hook. It allows you to add state to functional components. Here's an example:

```javascript
const [count, setCount] = useState(0);
```

This creates a state variable called `count` with an initial value of 0, and a function `setCount` to update it.

## useEffect Hook

The useEffect hook lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined.

## Custom Hooks

Custom hooks allow you to extract component logic into reusable functions. A custom hook is a JavaScript function whose name starts with "use" and that may call other hooks.

## Conclusion

React Hooks have simplified state management and side effects in React applications. They make code more readable, testable, and reusable.
EOF

echo "✓ Test file created: /tmp/test-translation.md"

# 测试 2: 验证 skill 已安装
echo ""
echo "📦 Test 2: Verifying skill installation..."
if j-skills list -g | grep -q "parallel-translation"; then
    echo "✓ Skill is installed globally"
else
    echo "✗ Skill not found. Installing..."
    j-skills install parallel-translation -g --env claude-code
fi

# 测试 3: 显示 skill 信息
echo ""
echo "ℹ️  Test 3: Skill information..."
j-skills list -g | grep -A 5 "parallel-translation" || echo "Skill info not available"

# 测试 4: 验证文件内容
echo ""
echo "📄 Test 4: Test file preview..."
echo "First 10 lines:"
head -n 10 /tmp/test-translation.md

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Open Claude Code"
echo "2. Run: '使用 parallel-translation skill 翻译 /tmp/test-translation.md'"
echo "3. Check the translated file"
echo ""
echo "💡 Or try translating this README:"
echo "   使用 parallel-translation skill 翻译 README.zh-CN.md"
echo ""

# 清理函数
cleanup() {
    echo ""
    echo "🧹 Cleaning up test files..."
    rm -f /tmp/test-translation.md /tmp/test-translation.zh-CN.md
    echo "✓ Cleanup complete"
}

# 设置退出时清理
trap cleanup EXIT
