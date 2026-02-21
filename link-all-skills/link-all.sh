#!/bin/bash

# link-all.sh - 批量链接当前项目下所有 skills 到全局
# 用法: ./link-all.sh [项目路径]
# 如果不传路径，默认使用脚本所在目录的父目录

set -e

# 颜色定义
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
NC='\033[0m' # No Color

# 确定项目根目录
if [ -n "$1" ]; then
    PROJECT_DIR="$1"
else
    # 脚本在 skill 子目录中，需要回到项目根目录
    PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
fi

echo -e "${BLUE}扫描目录: ${PROJECT_DIR}${NC}"
echo ""

# 查找所有包含 SKILL.md 的目录
SKILL_DIRS=$(find "$PROJECT_DIR" -maxdepth 2 -name "SKILL.md" -type f 2>/dev/null | xargs -I {} dirname {} | sort)

if [ -z "$SKILL_DIRS" ]; then
    echo -e "${YELLOW}未找到任何 skill 目录${NC}"
    exit 0
fi

# 统计
LINKED=0
SKIPPED=0

# 遍历并链接
for DIR in $SKILL_DIRS; do
    SKILL_NAME=$(basename "$DIR")

    # 跳过自身（link-all-skills 本身可能还没被链接）
    if [ "$SKILL_NAME" = "link-all-skills" ]; then
        echo -e "${YELLOW}⊗ ${SKILL_NAME}${NC} (跳过自身)"
        ((SKIPPED++))
        continue
    fi

    # 先 unlink（静默处理，可能不存在）
    j-skills link --unlink "$SKILL_NAME" 2>/dev/null || true

    # 再 link
    if j-skills link "$SKILL_NAME" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ ${SKILL_NAME}${NC}"
        ((LINKED++))
    else
        echo -e "${YELLOW}✗ ${SKILL_NAME}${NC} (链接失败)"
        ((SKIPPED++))
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "已链接: ${GREEN}${LINKED}${NC}  跳过: ${YELLOW}${SKIPPED}${NC}"
echo ""

# 显示最终列表
echo -e "${BLUE}当前已链接的 Skills:${NC}"
j-skills link --list
