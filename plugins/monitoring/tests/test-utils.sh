#!/usr/bin/env bash
# Test Utilities for Claude Code Monitor
# 提供测试辅助函数和断言

set -euo pipefail

# 测试环境目录
export TEST_ENV_DIR="${TMPDIR:-/tmp}/claude-monitor-test-$$"
export TEST_MONITOR_DIR="${TEST_ENV_DIR}/.claude/monitor"
export TEST_SESSIONS_DIR="${TEST_MONITOR_DIR}/sessions"

# ============================================================================
# 测试环境管理
# ============================================================================

# 设置测试环境
setup_test_env() {
    # 先清理可能存在的旧环境
    teardown_test_env

    # 创建测试目录
    mkdir -p "${TEST_MONITOR_DIR}"
    mkdir -p "${TEST_SESSIONS_DIR}"

    # 导出环境变量
    export MONITOR_DIR="${TEST_MONITOR_DIR}"
    export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
    export SESSIONS_DIR="${TEST_SESSIONS_DIR}"
}

# 清理测试环境
teardown_test_env() {
    if [[ -d "${TEST_ENV_DIR}" ]]; then
        rm -rf "${TEST_ENV_DIR}"
    fi
}

# ============================================================================
# 断言函数
# ============================================================================

# 断言相等
assert_equals() {
    local expected="$1"
    local actual="$2"
    local message="${3:-Values should be equal}"

    if [[ "$expected" == "$actual" ]]; then
        return 0
    else
        echo "FAIL: $message"
        echo "  Expected: '$expected'"
        echo "  Actual:   '$actual'"
        return 1
    fi
}

# 断言包含
assert_contains() {
    local haystack="$1"
    local needle="$2"
    local message="${3:-String should contain substring}"

    if [[ "$haystack" == *"$needle"* ]]; then
        return 0
    else
        echo "FAIL: $message"
        echo "  Haystack: '$haystack'"
        echo "  Needle:   '$needle'"
        return 1
    fi
}

# 断言文件存在
assert_file_exists() {
    local file="$1"
    local message="${2:-File should exist}"

    if [[ -f "$file" ]]; then
        return 0
    else
        echo "FAIL: $message"
        echo "  File: $file"
        return 1
    fi
}

# ============================================================================
# 测试辅助函数
# ============================================================================

# 创建模拟状态文件
create_mock_status() {
    local enabled="${1:-true}"
    local session_id="${2:-sess_test_123}"
    local start_time="${3:-$(date -Iseconds)}"

    cat > "${STATUS_FILE}" << EOF
{
  "enabled": ${enabled},
  "sessionId": "${session_id}",
  "startTime": "${start_time}",
  "outputModes": ["terminal", "file"],
  "webPort": 3777
}
EOF
}

# 创建模拟会话文件
create_mock_session() {
    local session_id="$1"
    local event_count="${2:-5}"

    local session_file="${SESSIONS_DIR}/${session_id}.jsonl"
    touch "$session_file"

    for i in $(seq 1 "$event_count"); do
        echo "{\"id\":\"evt_${i}\",\"sessionId\":\"${session_id}\",\"tool\":{\"name\":\"Read\"},\"timing\":{\"duration_ms\":100}}" >> "$session_file"
    done
}
