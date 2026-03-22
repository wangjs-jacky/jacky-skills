#!/bin/bash

# link-all.sh - 批量链接当前项目下所有 skills 到全局并安装到所有环境
# 用法: ./link-all.sh [项目路径]
# 如果不传路径，默认使用脚本所在目录的父目录

set -e

# 颜色定义
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'
NC='\033[0m' # No Color

# 确定项目路径
PROJECT_DIR="${1:-$(cd "$(dirname "$0")/.." && pwd)}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  批量链接并安装 Skills${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "项目路径: ${PROJECT_DIR}"
echo ""

# 计数器
LINKED=0
INSTALLED=0
SKIPPED=0

# 查找所有包含 SKILL.md 的目录
# 支持两种结构:
#   - skills/<skill-name>/SKILL.md
#   - plugins/<plugin>/<skill-name>/SKILL.md
SKILL_DIRS=$(find "$PROJECT_DIR" -name "SKILL.md" -type f 2>/dev/null | xargs -I {} dirname {})

if [ -z "$SKILL_DIRS" ]; then
  echo -e "${YELLOW}未找到任何 skills${NC}"
  exit 0
fi

echo -e "${BLUE}找到以下 Skills:${NC}"
echo "$SKILL_DIRS" | while read dir; do
  echo "  - $(basename "$dir")"
done
echo ""

# 链接每个 skill
for dir in $SKILL_DIRS; do
  skill_name=$(basename "$dir")

  echo -e "${BLUE}处理: ${skill_name}${NC}"

  # 先尝试 unlink（避免交互式确认）
  j-skills link --unlink "$skill_name" 2>/dev/null || true

  # 执行 link（使用 -y 跳过确认）
  if j-skills link "$dir" -y 2>/dev/null; then
    echo -e "${GREEN}✓ ${skill_name}${NC} (链接成功)"
    ((LINKED++))

    # 安装到所有环境（使用 --all-env 非交互式）
    if j-skills install "$skill_name" -g --all-env 2>/dev/null; then
      echo -e "${GREEN}  → 已安装到所有环境${NC}"
      ((INSTALLED++))
    else
      echo -e "${YELLOW}  → 安装失败${NC}"
    fi
  else
    echo -e "${YELLOW}✗ ${skill_name}${NC} (链接失败)"
    ((SKIPPED++))
  fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "已链接: ${GREEN}${LINKED}${NC}  已安装: ${GREEN}${INSTALLED}${NC}  跳过: ${YELLOW}${SKIPPED}${NC}"
echo ""

# 显示最终列表
echo -e "${BLUE}当前已链接的 Skills:${NC}"
j-skills link --list
