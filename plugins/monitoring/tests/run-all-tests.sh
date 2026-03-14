#!/usr/bin/env bash
# Test Runner for Claude Code Monitor
# 运行所有测试用例

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 测试统计
TESTS_PASSED=0
TESTS_FAILED=0

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Claude Code Monitor - Test Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 运行测试文件的函数
run_test_file() {
    local test_file="$1"
    local test_name=$(basename "$test_file")

    echo -e "${YELLOW}▶ Running: $test_name${NC}"
    echo ""

    if bash "$test_file" 2>&1; then
        echo ""
        echo -e "${GREEN}✓ $test_name passed${NC}"
        ((TESTS_PASSED++))
    else
        echo ""
        echo -e "${RED}✗ $test_name failed${NC}"
        ((TESTS_FAILED++))
    fi

    echo ""
    echo "----------------------------------------"
    echo ""
}

# 运行所有测试
run_all_tests() {
    # 运行 core.sh 测试
    run_test_file "${SCRIPT_DIR}/test-core.sh"

    # 运行 hooks 测试
    run_test_file "${SCRIPT_DIR}/test-hooks.sh"

    # 打印摘要
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Test Summary${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${GREEN}Passed:  ${TESTS_PASSED}${NC}"
    echo -e "  ${RED}Failed:  ${TESTS_FAILED}${NC}"
    echo ""

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}All tests passed! ✓${NC}"
        return 0
    else
        echo -e "${RED}Some tests failed! ✗${NC}"
        return 1
    fi
}

# 运行
run_all_tests
