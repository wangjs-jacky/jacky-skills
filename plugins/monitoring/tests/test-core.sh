#!/usr/bin/env bash
# Unit Tests for lib/core.sh

set -euo pipefail

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 加载测试工具
source "${SCRIPT_DIR}/test-utils.sh"

# ============================================================================
# 测试用例
# ============================================================================

echo "Running core.sh unit tests..."
echo ""

# 测试 1: is_monitor_enabled - 无状态文件时返回 false
test_is_monitor_enabled_no_file() {
    setup_test_env

    # 直接在子 shell 中测试函数
    local result=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        if is_monitor_enabled; then echo "true"; else echo "false"; fi
    )

    if [[ "$result" == "false" ]]; then
        echo "PASS: is_monitor_enabled returns false when no status file"
    else
        echo "FAIL: is_monitor_enabled should return false when no status file"
        return 1
    fi
}

# 测试 2: is_monitor_enabled - 启用时返回 true
test_is_monitor_enabled_true() {
    setup_test_env
    create_mock_status "true"

    local result=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        if is_monitor_enabled; then echo "true"; else echo "false"; fi
    )

    if [[ "$result" == "true" ]]; then
        echo "PASS: is_monitor_enabled returns true when enabled"
    else
        echo "FAIL: is_monitor_enabled should return true when enabled"
        return 1
    fi
}

# 测试 3: is_monitor_enabled - 禁用时返回 false
test_is_monitor_enabled_false() {
    setup_test_env
    create_mock_status "false"

    local result=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        if is_monitor_enabled; then echo "true"; else echo "false"; fi
    )

    if [[ "$result" == "false" ]]; then
        echo "PASS: is_monitor_enabled returns false when disabled"
    else
        echo "FAIL: is_monitor_enabled should return false when disabled"
        return 1
    fi
}

# 测试 4: get_session_id - 无状态文件时返回空
test_get_session_id_empty() {
    setup_test_env

    local result=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        get_session_id
    )

    if [[ -z "$result" ]]; then
        echo "PASS: get_session_id returns empty when no status file"
    else
        echo "FAIL: get_session_id should return empty, got: '$result'"
        return 1
    fi
}

# 测试 5: get_session_id - 返回正确的 session ID
test_get_session_id_correct() {
    setup_test_env
    create_mock_status "true" "sess_test_12345"

    local result=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        get_session_id
    )

    if [[ "$result" == "sess_test_12345" ]]; then
        echo "PASS: get_session_id returns correct session id"
    else
        echo "FAIL: get_session_id should return 'sess_test_12345', got: '$result'"
        return 1
    fi
}

# 测试 6: get_timestamp_ms - 返回数字
test_get_timestamp_ms() {
    local result=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        get_timestamp_ms
    )

    if [[ "$result" =~ ^[0-9]+$ ]]; then
        echo "PASS: get_timestamp_ms returns a number"
    else
        echo "FAIL: get_timestamp_ms should return a number, got: '$result'"
        return 1
    fi
}

# 测试 7: get_iso_timestamp - 返回有效 ISO 8601 格式
test_get_iso_timestamp() {
    local result=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        get_iso_timestamp
    )

    if [[ "$result" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2} ]]; then
        echo "PASS: get_iso_timestamp returns valid ISO 8601 format"
    else
        echo "FAIL: get_iso_timestamp should return ISO 8601 format, got: '$result'"
        return 1
    fi
}

# 测试 8: generate_event_id - 返回正确格式
test_generate_event_id() {
    local result=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        generate_event_id
    )

    if [[ "$result" =~ ^evt_[0-9]+_[0-9]{3}$ ]]; then
        echo "PASS: generate_event_id returns valid format"
    else
        echo "FAIL: generate_event_id should match evt_<ts>_<seq>, got: '$result'"
        return 1
    fi
}

# 测试 9: get_tool_icon - 返回正确的图标
test_get_tool_icon() {
    local read_icon=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        get_tool_icon "Read"
    )

    local bash_icon=$(
        source "${PLUGIN_ROOT}/lib/core.sh"
        get_tool_icon "Bash"
    )

    if [[ "$read_icon" == "📖" && "$bash_icon" == "⚡" ]]; then
        echo "PASS: get_tool_icon returns correct icons"
    else
        echo "FAIL: get_tool_icon returned incorrect icons"
        return 1
    fi
}

# 测试 10: enable_monitor - 创建状态文件
test_enable_monitor() {
    setup_test_env

    (
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        export SESSIONS_DIR="${TEST_SESSIONS_DIR}"
        enable_monitor > /dev/null
    )

    if [[ -f "${TEST_MONITOR_DIR}/status.json" ]]; then
        echo "PASS: enable_monitor creates status file"
    else
        echo "FAIL: enable_monitor should create status file"
        return 1
    fi
}

# 测试 11: disable_monitor - 更新状态文件
test_disable_monitor() {
    setup_test_env
    create_mock_status "true"

    (
        source "${PLUGIN_ROOT}/lib/core.sh"
        export MONITOR_DIR="${TEST_MONITOR_DIR}"
        export STATUS_FILE="${TEST_MONITOR_DIR}/status.json"
        disable_monitor > /dev/null
    )

    if grep -q '"enabled"[[:space:]]*:[[:space:]]*false' "${TEST_MONITOR_DIR}/status.json"; then
        echo "PASS: disable_monitor sets enabled to false"
    else
        echo "FAIL: disable_monitor should set enabled to false"
        return 1
    fi
}

# ============================================================================
# 运行所有测试
# ============================================================================

test_is_monitor_enabled_no_file
test_is_monitor_enabled_true
test_is_monitor_enabled_false
test_get_session_id_empty
test_get_session_id_correct
test_get_timestamp_ms
test_get_iso_timestamp
test_generate_event_id
test_get_tool_icon
test_enable_monitor
test_disable_monitor

echo ""
echo "All core.sh tests completed!"
