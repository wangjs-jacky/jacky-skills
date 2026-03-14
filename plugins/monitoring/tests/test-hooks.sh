#!/usr/bin/env bash
# Integration Tests for hooks/

set -euo pipefail

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 加载测试工具
source "${SCRIPT_DIR}/test-utils.sh"

# ============================================================================
# 测试用例
# ============================================================================

echo "Running hooks integration tests..."
echo ""

# 测试 1: pre-tool-use 在监控禁用时静默退出
test_pre_hook_disabled() {
    setup_test_env
    # 不启用监控

    local tool_input='{"toolName":"Read","file_path":"/test/file.txt"}'
    local output=$(echo "$tool_input" | bash "${PLUGIN_ROOT}/hooks/pre-tool-use" 2>&1 || true)

    if [[ -z "$output" ]]; then
        echo "PASS: pre-tool-use exits silently when monitor disabled"
    else
        echo "FAIL: pre-tool-use should exit silently, got: '$output'"
        return 1
    fi
}

# 测试 2: pre-tool-use 创建 pre 事件文件
test_pre_hook_creates_file() {
    setup_test_env

    # 启用监控
    (
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        export SESSIONS_DIR="${TEST_SESSIONS_DIR}"
        enable_monitor > /dev/null
    )

    local tool_input='{"toolName":"Read","file_path":"/test/file.txt"}'
    echo "$tool_input" | bash "${PLUGIN_ROOT}/hooks/pre-tool-use" 2>&1 || true

    local pre_files=$(ls "${TEST_MONITOR_DIR}"/.pre_* 2>/dev/null | wc -l | tr -d ' ')

    if [[ "$pre_files" -gt 0 ]]; then
        echo "PASS: pre-tool-use creates pre event file"
    else
        echo "FAIL: pre-tool-use should create pre event file"
        return 1
    fi
}

# 测试 3: post-tool-use 在监控禁用时静默退出
test_post_hook_disabled() {
    setup_test_env
    # 不启用监控

    local tool_result='{"toolName":"Read","result":"success"}'
    local output=$(echo "$tool_result" | bash "${PLUGIN_ROOT}/hooks/post-tool-use" 2>&1 || true)

    if [[ -z "$output" ]]; then
        echo "PASS: post-tool-use exits silently when monitor disabled"
    else
        echo "FAIL: post-tool-use should exit silently, got: '$output'"
        return 1
    fi
}

# 测试 4: post-tool-use 写入会话文件
test_post_hook_writes_session() {
    setup_test_env

    # 启用监控并获取 session ID
    local session_id=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        export SESSIONS_DIR="${TEST_SESSIONS_DIR}"
        enable_monitor > /dev/null
        get_session_id
    )

    # 创建 pre 事件
    local tool_input='{"toolName":"Read","file_path":"/test/file.txt"}'
    echo "$tool_input" | bash "${PLUGIN_ROOT}/hooks/pre-tool-use" 2>&1 || true

    # 创建 post 事件
    local tool_result='{"toolName":"Read","result":"success"}'
    echo "$tool_result" | bash "${PLUGIN_ROOT}/hooks/post-tool-use" 2>&1 || true

    local session_file="${TEST_SESSIONS_DIR}/${session_id}.jsonl"

    if [[ -f "$session_file" ]] && [[ -s "$session_file" ]]; then
        echo "PASS: post-tool-use writes to session file"
    else
        echo "FAIL: post-tool-use should write to session file"
        return 1
    fi
}

# 测试 5: post-tool-use 记录有效 JSON
test_post_hook_valid_json() {
    setup_test_env

    local session_id=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        export SESSIONS_DIR="${TEST_SESSIONS_DIR}"
        enable_monitor > /dev/null
        get_session_id
    )

    # 创建 pre 事件
    echo '{"toolName":"Bash","command":"ls"}' | bash "${PLUGIN_ROOT}/hooks/pre-tool-use" 2>&1 || true

    # 创建 post 事件
    echo '{"toolName":"Bash","result":"success"}' | bash "${PLUGIN_ROOT}/hooks/post-tool-use" 2>&1 || true

    local session_file="${TEST_SESSIONS_DIR}/${session_id}.jsonl"
    local last_line=$(tail -1 "$session_file")

    # 简单验证 JSON 结构
    if [[ "$last_line" =~ ^\{.*\}$ ]] && echo "$last_line" | grep -q '"id"'; then
        echo "PASS: post-tool-use records valid JSON"
    else
        echo "FAIL: post-tool-use should record valid JSON, got: '$last_line'"
        return 1
    fi
}

# 测试 6: 完整工作流（pre -> post）
test_full_workflow() {
    setup_test_env

    local session_id=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        export SESSIONS_DIR="${TEST_SESSIONS_DIR}"
        enable_monitor > /dev/null
        get_session_id
    )

    # 模拟完整的工具调用流程
    echo '{"toolName":"Read","file_path":"/test/workflow.txt"}' | bash "${PLUGIN_ROOT}/hooks/pre-tool-use" 2>&1 || true
    sleep 0.05  # 模拟工具执行时间
    echo '{"toolName":"Read","content":"test"}' | bash "${PLUGIN_ROOT}/hooks/post-tool-use" 2>&1 || true

    local session_file="${TEST_SESSIONS_DIR}/${session_id}.jsonl"
    local event_count=$(wc -l < "$session_file" | tr -d ' ')

    if [[ "$event_count" -eq 1 ]]; then
        echo "PASS: full workflow records one event"
    else
        echo "FAIL: should have 1 event, got: $event_count"
        return 1
    fi
}

# 测试 7: 多次工具调用
test_multiple_calls() {
    setup_test_env

    local session_id=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        export SESSIONS_DIR="${TEST_SESSIONS_DIR}"
        enable_monitor > /dev/null
        get_session_id
    )

    # 模拟多次工具调用
    for i in 1 2 3; do
        echo "{\"toolName\":\"Read\",\"file_path\":\"/test/file${i}.txt\"}" | bash "${PLUGIN_ROOT}/hooks/pre-tool-use" 2>&1 || true
        echo "{\"toolName\":\"Read\",\"content\":\"content${i}\"}" | bash "${PLUGIN_ROOT}/hooks/post-tool-use" 2>&1 || true
    done

    local session_file="${TEST_SESSIONS_DIR}/${session_id}.jsonl"
    local event_count=$(wc -l < "$session_file" | tr -d ' ')

    if [[ "$event_count" -eq 3 ]]; then
        echo "PASS: multiple calls recorded correctly"
    else
        echo "FAIL: should have 3 events, got: $event_count"
        return 1
    fi
}

# ============================================================================
# 运行所有测试
# ============================================================================

test_pre_hook_disabled
test_pre_hook_creates_file
test_post_hook_disabled
test_post_hook_writes_session
test_post_hook_valid_json
test_full_workflow
test_multiple_calls

echo ""
echo "All hooks tests completed!"
