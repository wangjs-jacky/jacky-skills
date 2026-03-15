#!/bin/bash
# init-study-repo.sh - 初始化学习仓库的辅助脚本
# 用法: ./init-study-repo.sh <repo_url> <target_dir>

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

# 检查目标目录是否存在
if [ -d "$TARGET_DIR" ]; then
    error "目标目录已存在: $TARGET_DIR"
fi

# 克隆仓库
info "克隆仓库..."
if ! git clone "$REPO_URL" "$TARGET_DIR"; then
    error "克隆失败，请检查 URL 或网络连接"
fi

# 进入目标目录
cd "$TARGET_DIR"

# 删除 .git 目录
info "删除 .git 目录..."
rm -rf .git

# 创建 .notes 目录
info "创建 .notes 目录..."
mkdir -p .notes

# 创建初始 .gitignore
info "创建 .gitignore..."
cat > .gitignore << 'EOF'
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

# 初始化新 Git 仓库
info "初始化新 Git 仓库..."
git init
git add .
git commit -m "Initial commit: setup study project for $REPO_NAME"

info "完成！学习项目已初始化: $TARGET_DIR"
echo "$TARGET_DIR"
