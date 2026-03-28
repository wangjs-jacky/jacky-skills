#!/usr/bin/env bash
# install.sh — 一键安装 Jacky's Claude Code Skills
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/wangjs-jacky/jacky-skills/main/install.sh | bash
#   或
#   ./install.sh
#
# 功能：
#   1. 检测并安装 j-skills CLI（如果未安装）
#   2. 克隆/更新 jacky-skills 仓库
#   3. 链接所有 skills 到全局注册表
#   4. 全局安装所有 skills

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
REPO_URL="https://github.com/wangjs-jacky/jacky-skills.git"
REPO_DIR="$HOME/jacky-github/jacky-skills"
SKILLS_DIR="$HOME/.claude/skills"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Jacky's Claude Code Skills - 一键安装脚本              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 步骤 1：检查 Node.js
echo -e "${YELLOW}[1/5] 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未安装 Node.js，请先安装 Node.js 18+${NC}"
    echo "推荐使用 nvm 安装: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) 已安装${NC}"

# 步骤 2：安装 j-skills CLI
echo -e "${YELLOW}[2/5] 检查 j-skills CLI...${NC}"
if ! command -v j-skills &> /dev/null; then
    echo -e "${BLUE}正在安装 j-skills CLI...${NC}"
    npm install -g j-skills
    echo -e "${GREEN}✓ j-skills CLI 安装完成${NC}"
else
    echo -e "${GREEN}✓ j-skills CLI 已安装 ($(j-skills --version 2>/dev/null || echo 'unknown'))${NC}"
fi

# 步骤 3：克隆/更新仓库
echo -e "${YELLOW}[3/5] 克隆/更新 jacky-skills 仓库...${NC}"
if [ -d "$REPO_DIR" ]; then
    echo -e "${BLUE}仓库已存在，正在更新...${NC}"
    cd "$REPO_DIR"
    git pull origin main
    echo -e "${GREEN}✓ 仓库已更新${NC}"
else
    echo -e "${BLUE}正在克隆仓库到 $REPO_DIR...${NC}"
    mkdir -p "$(dirname "$REPO_DIR")"
    git clone "$REPO_URL" "$REPO_DIR"
    cd "$REPO_DIR"
    echo -e "${GREEN}✓ 仓库克隆完成${NC}"
fi

# 步骤 4：链接所有 skills
echo -e "${YELLOW}[4/5] 链接所有 skills 到全局注册表...${NC}"
cd "$REPO_DIR"
j-skills link --all
echo -e "${GREEN}✓ Skills 链接完成${NC}"

# 步骤 5：全局安装所有 skills
echo -e "${YELLOW}[5/5] 全局安装所有 skills...${NC}"

# 扫描仓库中所有 SKILL.md，按 frontmatter name 安装
while IFS= read -r skill_file; do
    skill_name=$(awk '
        BEGIN { in_fm=0 }
        /^---$/ { in_fm = !in_fm; next }
        in_fm && /^name:[[:space:]]*/ {
            sub(/^name:[[:space:]]*/, "", $0)
            print $0
            exit
        }
    ' "$skill_file")

    if [ -n "$skill_name" ]; then
        echo -e "${BLUE}  安装: $skill_name${NC}"
        j-skills install "$skill_name" -g --env claude-code 2>/dev/null || true
    fi
done < <(find "$REPO_DIR/plugins" -type f -name "SKILL.md" | sort)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    安装完成！                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "已安装的 Skills："
j-skills list --global
echo ""
echo -e "常用命令："
echo -e "  ${BLUE}j-skills list --all${NC}      # 查看所有已安装的 skills"
echo -e "  ${BLUE}j-skills link --list${NC}     # 查看已链接的 skills"
echo -e "  ${BLUE}j-skills config${NC}          # 查看配置"
echo ""
echo -e "仓库位置: ${BLUE}$REPO_DIR${NC}"
echo ""
