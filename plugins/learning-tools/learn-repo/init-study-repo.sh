#!/bin/bash
# init-study-repo.sh - 初始化学习仓库的辅助脚本
# 用法: ./init-study-repo.sh <repo_url> <target_dir>
#
# 目录结构:
# {repo}-study/           # 学习项目根目录
# ├── CLAUDE.md           # 学习配置（由 AI 生成）
# ├── README.md           # 学习项目说明（由 AI 生成）
# ├── notes/              # 学习笔记
# └── {repo}/             # 原始仓库（子目录）

set -e

REPO_URL="$1"
TARGET_DIR="$2"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 参数检查
if [ -z "$REPO_URL" ] || [ -z "$TARGET_DIR" ]; then
    error "用法: $0 <repo_url> <target_dir>"
fi

# 提取仓库名
extract_repo_name() {
    local url="$1"
    # 处理多种格式:
    # https://github.com/owner/repo.git -> repo
    # https://github.com/owner/repo -> repo
    # owner/repo -> repo
    local name
    if [[ "$url" =~ ^https?:// ]]; then
        name=$(echo "$url" | sed 's/\.git$//' | sed 's/.*\///')
    else
        name=$(echo "$url" | sed 's/.*\///')
    fi
    echo "$name"
}

REPO_NAME=$(extract_repo_name "$REPO_URL")

info "仓库名: $REPO_NAME"
info "目标目录: $TARGET_DIR"
info "原始仓库将放置在: $TARGET_DIR/$REPO_NAME/"

# 检查目标目录是否存在
if [ -d "$TARGET_DIR" ]; then
    error "目标目录已存在: $TARGET_DIR"
fi

# 创建目标目录结构
info "创建目录结构..."
mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_DIR/notes"
mkdir -p "$TARGET_DIR/$REPO_NAME"

# 克隆仓库到子目录
info "克隆仓库到 $REPO_NAME/ 子目录..."
if ! git clone "$REPO_URL" "$TARGET_DIR/$REPO_NAME"; then
    error "克隆失败，请检查 URL 或网络连接"
fi

# 进入仓库子目录删除 .git
info "删除 .git 目录..."
rm -rf "$TARGET_DIR/$REPO_NAME/.git"

# 创建初始 .gitignore（在根目录）
info "创建 .gitignore..."
cat > "$TARGET_DIR/.gitignore" << 'EOF'
# macOS
.DS_Store

# 编辑器
.idea/
.vscode/
*.swp
*.swo

# 依赖目录
node_modules/

# 构建产物
dist/
build/

# 日志
*.log
EOF

# 初始化新 Git 仓库（在根目录）
info "初始化新 Git 仓库..."
cd "$TARGET_DIR"
git init
git add .
git commit -m "Initial commit: setup study project for $REPO_NAME"

info "完成！学习项目已初始化: $TARGET_DIR"
echo ""
echo "目录结构:"
echo "  $TARGET_DIR/"
echo "  ├── notes/          # 学习笔记"
echo "  └── $REPO_NAME/     # 原始仓库"
echo ""
echo "$TARGET_DIR"
