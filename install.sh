#!/usr/bin/env bash
# install.sh — 链接并安装 jacky-skills 中的活跃 Skill
#
# 用法：
#   curl -fsSL https://raw.githubusercontent.com/wangjs-jacky/jacky-skills/main/install.sh | bash
#   ./install.sh --all
#   ./install.sh --skill youtube-study-note
#   ./install.sh --plugin dev-tools
#   J_SKILLS_ENVS=claude-code,codex,cursor ./install.sh --all

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REPO_URL="${JACKY_SKILLS_REPO_URL:-https://github.com/wangjs-jacky/jacky-skills.git}"
INSTALL_ENVS="${J_SKILLS_ENVS:-claude-code,codex}"
REQUIRED_J_SKILLS_VERSION="${J_SKILLS_VERSION:-0.1.0}"
DEFAULT_REPO_DIR="$HOME/jacky-github/jacky-skills"
SCRIPT_DIR=""
USE_CURRENT_CHECKOUT=false
SELECTOR_TYPE="all"
SELECTOR_VALUE=""
SELECTOR_SET=false
PLUGIN_SKILL_LIST_FILE=""

if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
fi

if [ -n "${JACKY_SKILLS_REPO_DIR:-}" ]; then
    REPO_DIR="$JACKY_SKILLS_REPO_DIR"
elif [ -n "$SCRIPT_DIR" ] && [ -e "$SCRIPT_DIR/.git" ]; then
    REPO_DIR="$SCRIPT_DIR"
    USE_CURRENT_CHECKOUT=true
else
    REPO_DIR="$DEFAULT_REPO_DIR"
fi

info() {
    echo -e "${BLUE}$*${NC}"
}

success() {
    echo -e "${GREEN}$*${NC}"
}

fail() {
    echo -e "${RED}错误: $*${NC}" >&2
    exit 1
}

cleanup() {
    if [ -n "$PLUGIN_SKILL_LIST_FILE" ] && [ -f "$PLUGIN_SKILL_LIST_FILE" ]; then
        rm -f -- "$PLUGIN_SKILL_LIST_FILE"
    fi
}

usage() {
    cat <<'EOF'
用法：
  ./install.sh [--all]
  ./install.sh --skill <skill-name>
  ./install.sh --plugin <plugin-name>

选项：
  --all              安装 plugins/、skills/、harness/ 下的全部活跃 Skill（默认）
  --skill <name>     只安装指定 Skill
  --plugin <name>    只安装指定 Plugin 中的 Skill
  -h, --help         显示帮助

环境变量：
  J_SKILLS_ENVS               目标环境，默认 claude-code,codex
  J_SKILLS_VERSION            要求的 j-skills 版本，默认 0.1.0
  JACKY_SKILLS_REPO_DIR       显式指定仓库目录
  JACKY_SKILLS_REPO_URL       curl 管道安装时使用的仓库地址
EOF
}

set_selector() {
    local type="$1"
    local value="${2:-}"
    if [ "$SELECTOR_SET" = true ]; then
        fail "--all、--skill、--plugin 只能选择一个"
    fi
    SELECTOR_TYPE="$type"
    SELECTOR_VALUE="$value"
    SELECTOR_SET=true
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        --all)
            set_selector all
            shift
            ;;
        --skill)
            [ "$#" -ge 2 ] || fail "--skill 缺少名称"
            set_selector skill "$2"
            shift 2
            ;;
        --plugin)
            [ "$#" -ge 2 ] || fail "--plugin 缺少名称"
            set_selector plugin "$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            fail "未知参数：$1（使用 --help 查看帮助）"
            ;;
    esac
done

validate_plugin_selector_name() {
    [[ "$SELECTOR_VALUE" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || \
        fail "Plugin 名称必须使用 kebab-case：$SELECTOR_VALUE"
}

validate_plugin_selector_path() {
    local plugins_dir="$REPO_DIR/plugins"
    local plugin_dir="$plugins_dir/$SELECTOR_VALUE"
    local canonical_repo
    local canonical_plugins
    local canonical_plugin

    [ -d "$plugins_dir" ] && [ ! -L "$plugins_dir" ] || \
        fail "plugins/ 必须是仓库内的真实目录"
    [ -d "$plugin_dir" ] && [ ! -L "$plugin_dir" ] || \
        fail "Plugin 必须是 plugins/ 下的真实直接子目录：$SELECTOR_VALUE"

    canonical_repo="$(cd "$REPO_DIR" && pwd -P)"
    canonical_plugins="$(cd "$plugins_dir" && pwd -P)"
    canonical_plugin="$(cd "$plugin_dir" && pwd -P)"
    [ "$(dirname "$canonical_plugins")" = "$canonical_repo" ] && \
        [ "$(basename "$canonical_plugins")" = "plugins" ] && \
        [ "$(dirname "$canonical_plugin")" = "$canonical_plugins" ] || \
        fail "Plugin 必须是 plugins/ 下的真实直接子目录：$SELECTOR_VALUE"
}

if [ "$SELECTOR_TYPE" = "plugin" ]; then
    validate_plugin_selector_name
fi

read_skill_name() {
    awk '
        BEGIN { in_frontmatter = 0 }
        /^---[[:space:]]*$/ {
            if (in_frontmatter == 0) {
                in_frontmatter = 1
                next
            }
            exit
        }
        in_frontmatter && /^name:[[:space:]]*/ {
            sub(/^name:[[:space:]]*/, "", $0)
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", $0)
            gsub(/^"|"$/, "", $0)
            print $0
            exit
        }
    ' "$1"
}

linked_path_for() {
    local skill_name="$1"

    printf '%s' "$LINKED_SKILLS_JSON" | node -e '
        let input = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => { input += chunk; });
        process.stdin.on("end", () => {
            const data = JSON.parse(input);
            const match = (data.skills || []).find((skill) => skill.name === process.argv[1]);
            if (match && match.path) process.stdout.write(match.path);
        });
    ' "$skill_name"
}

canonical_path() {
    if [ -d "$1" ]; then
        (cd "$1" && pwd -P)
    else
        printf '%s' "$1"
    fi
}

link_skill_dir() {
    local skill_dir="$1"
    local compatibility_link="$skill_dir/skill.md"
    local compatibility_link_created=false
    local link_status=0

    # j-skills 0.1.0 在大小写敏感文件系统上检查小写 skill.md。
    # 临时链接只用于兼容该版本，不会留在 Skill 目录。
    if [ ! -e "$compatibility_link" ]; then
        ln -s SKILL.md "$compatibility_link"
        compatibility_link_created=true
    fi

    if j-skills link "$skill_dir"; then
        link_status=0
    else
        link_status=$?
    fi

    if [ "$compatibility_link_created" = true ]; then
        rm -f "$compatibility_link"
    fi
    return "$link_status"
}

find_all_skill_files() {
    node - "$REPO_DIR" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const repo = process.argv[2];
const skills = [];
function visit(directory, stopAtSkill) {
    if (!fs.existsSync(directory)) return;
    const metadata = fs.lstatSync(directory);
    if (metadata.isSymbolicLink() || !metadata.isDirectory()) return;
    const skill = path.join(directory, "SKILL.md");
    if (fs.existsSync(skill) && fs.statSync(skill).isFile()) {
        skills.push(skill);
        // Goal records and source snapshots belong to their enclosing Skill.
        if (stopAtSkill) return;
    }
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
        if (entry.name === "archived" || !entry.isDirectory()) continue;
        visit(path.join(directory, entry.name), stopAtSkill);
    }
}
visit(path.join(repo, "plugins"), false);
visit(path.join(repo, "skills"), true);
visit(path.join(repo, "harness"), true);
for (const skill of skills.sort()) process.stdout.write(skill + "\n");
NODE
}

find_declared_plugin_skills() {
    local plugin_dir="$1"

    node - "$REPO_DIR" "$plugin_dir" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = fs.realpathSync(process.argv[2]);
const pluginRoot = fs.realpathSync(process.argv[3]);
const pluginsRoot = fs.realpathSync(path.join(repoRoot, "plugins"));
const manifestDirectory = path.join(pluginRoot, ".claude-plugin");
const manifestPath = path.join(manifestDirectory, "plugin.json");

const isStrictChild = (candidate, parent) => {
    const relative = path.relative(parent, candidate);
    return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};

const isSafeManifestEntry = (entry) => {
    if (typeof entry !== "string" || entry.trim() === "") return false;
    if (/[\u0000-\u001f\u007f\\]/u.test(entry)) return false;
    if (!entry.startsWith("./") || path.posix.isAbsolute(entry) || path.win32.isAbsolute(entry)) {
        return false;
    }
    const segments = entry.slice(2).split("/");
    if (segments.at(-1) === "") segments.pop();
    if (segments.length === 0) return false;
    const windowsDevice = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu;
    return segments.every((segment) =>
        segment !== "" &&
        segment !== "." &&
        segment !== ".." &&
        !/[<>:"|?*]/u.test(segment) &&
        !/[. ]$/u.test(segment) &&
        !windowsDevice.test(segment)
    );
};

try {
    if (path.dirname(pluginRoot) !== pluginsRoot) {
        throw new Error("Plugin 必须是 plugins/ 下的真实直接子目录");
    }
    const manifestDirectoryMetadata = fs.lstatSync(manifestDirectory);
    if (
        manifestDirectoryMetadata.isSymbolicLink() ||
        !manifestDirectoryMetadata.isDirectory() ||
        fs.realpathSync(manifestDirectory) !== manifestDirectory
    ) {
        throw new Error("Plugin manifest 的父目录必须是 Plugin 内的真实目录");
    }
    const manifestMetadata = fs.lstatSync(manifestPath);
    if (!manifestMetadata.isFile() || manifestMetadata.isSymbolicLink()) {
        throw new Error("Plugin manifest 必须是普通文件");
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (!Array.isArray(manifest.skills)) {
        throw new Error(`${manifestPath} 的 skills 必须是数组`);
    }

    let sharedSkillsRoot;
    const requireSharedSkillsRoot = () => {
        if (sharedSkillsRoot) return sharedSkillsRoot;
        const sharedSkillsPath = path.join(repoRoot, "skills");
        let metadata;
        try {
            metadata = fs.lstatSync(sharedSkillsPath);
        } catch {
            throw new Error("仓库根 skills/ 必须是真实目录");
        }
        if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
            throw new Error("仓库根 skills/ 必须是真实目录");
        }
        sharedSkillsRoot = fs.realpathSync(sharedSkillsPath);
        if (
            path.dirname(sharedSkillsRoot) !== repoRoot ||
            path.basename(sharedSkillsRoot) !== "skills"
        ) {
            throw new Error("仓库根 skills/ 必须是真实目录");
        }
        return sharedSkillsRoot;
    };

    const declaredPaths = new Set();
    const targetOwners = new Map();
    const skillFiles = [];
    requireSharedSkillsRoot();
    for (const entry of manifest.skills) {
        if (!isSafeManifestEntry(entry)) {
            throw new Error(`${manifestPath} 包含不安全字符或路径片段`);
        }

        const declaredPath = path.resolve(pluginRoot, entry);
        if (!isStrictChild(declaredPath, pluginRoot)) {
            throw new Error(`Plugin Skill 声明超出 Plugin 目录：${entry}`);
        }
        if (declaredPaths.has(declaredPath)) {
            throw new Error(`manifest.skills 包含重复入口：${entry}`);
        }
        declaredPaths.add(declaredPath);

        const metadata = fs.lstatSync(declaredPath);
        let target;
        if (metadata.isSymbolicLink()) {
            if (path.dirname(declaredPath) !== path.join(pluginRoot, "skills")) {
                throw new Error(`共享 Skill 链接必须位于 Plugin 的 skills/：${entry}`);
            }
            target = fs.realpathSync(declaredPath);
            const allowedRoot = requireSharedSkillsRoot();
            if (!fs.statSync(target).isDirectory()) {
                throw new Error(`共享 Skill 链接目标必须是目录：${entry}`);
            }
            if (path.dirname(target) !== allowedRoot) {
                throw new Error(`共享 Skill 链接最终必须指向仓库根 skills/ 的直接 Skill 目录：${entry}`);
            }
        } else {
            if (!metadata.isDirectory()) {
                throw new Error(`Plugin Skill 入口必须是目录：${entry}`);
            }
            target = fs.realpathSync(declaredPath);
            if (!isStrictChild(target, pluginRoot)) {
                throw new Error(`Plugin Skill 入口最终必须位于 Plugin 目录：${entry}`);
            }
        }

        const skillFile = path.join(target, "SKILL.md");
        const skillMetadata = fs.lstatSync(skillFile);
        if (skillMetadata.isSymbolicLink() || !skillMetadata.isFile()) {
            throw new Error(`Skill 的 SKILL.md 必须是普通文件：${entry}`);
        }
        if (targetOwners.has(target)) {
            throw new Error(`manifest.skills 中 ${entry} 与 ${targetOwners.get(target)} 重复指向同一 Skill`);
        }
        targetOwners.set(target, entry);
        skillFiles.push(skillFile);
    }

    const actualPaths = new Set();
    const walk = (directory) => {
        for (const item of fs.readdirSync(directory, {withFileTypes: true})) {
            if (item.name === "archived" || item.name === ".claude-plugin") continue;
            const candidate = path.join(directory, item.name);
            if (item.isSymbolicLink()) {
                if (directory === path.join(pluginRoot, "skills")) {
                    actualPaths.add(candidate);
                }
                continue;
            }
            if (!item.isDirectory()) continue;
            if (directory === path.join(pluginRoot, "skills")) {
                actualPaths.add(candidate);
            } else {
                const possibleSkill = path.join(candidate, "SKILL.md");
                if (fs.existsSync(possibleSkill)) actualPaths.add(candidate);
            }
            walk(candidate);
        }
    };
    walk(pluginRoot);

    for (const declaredPath of declaredPaths) {
        if (!actualPaths.has(declaredPath)) {
            throw new Error(`manifest.skills 声明的入口不在 Plugin 活跃内容中：${path.relative(pluginRoot, declaredPath)}`);
        }
    }
    for (const actualPath of actualPaths) {
        if (!declaredPaths.has(actualPath)) {
            throw new Error(`Plugin Skill 入口未在 manifest.skills 声明：${path.relative(pluginRoot, actualPath)}`);
        }
    }

    for (const skillFile of skillFiles) {
        process.stdout.write(skillFile);
        process.stdout.write("\0");
    }
} catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
}
NODE
}

discover_skill_files() {
    local skill_file
    case "$SELECTOR_TYPE" in
        all)
            find_all_skill_files
            ;;
        skill)
            while IFS= read -r skill_file; do
                if [ "$(read_skill_name "$skill_file")" = "$SELECTOR_VALUE" ]; then
                    printf '%s\n' "$skill_file"
                fi
            done < <(find_all_skill_files)
            ;;
        plugin)
            fail "Plugin Skill 列表必须通过预检文件读取"
            ;;
    esac
}

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         jacky-skills 一键安装（Claude Code + Codex）       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "${YELLOW}[1/5] 检查 Node.js...${NC}"
command -v node >/dev/null 2>&1 || fail "未安装 Node.js 18+"

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
[ "$NODE_MAJOR" -ge 18 ] || fail "Node.js 版本过低，需要 18+，当前为 $(node -v)"

if [ "$(uname -s)" = "Darwin" ] && [ "$(uname -m)" = "arm64" ]; then
    NODE_ARCH="$(node -p 'process.arch')"
    [ "$NODE_ARCH" = "arm64" ] || fail "Apple Silicon Mac 必须使用原生 ARM64 Node.js，当前架构为 $NODE_ARCH"
fi
success "✓ Node.js $(node -v) ($(node -p 'process.arch'))"

echo -e "${YELLOW}[2/5] 克隆或更新仓库...${NC}"
if [ "$USE_CURRENT_CHECKOUT" = true ]; then
    success "✓ 使用当前 checkout：$REPO_DIR"
elif [ -e "$REPO_DIR/.git" ]; then
    git -C "$REPO_DIR" pull --ff-only origin main
elif [ -e "$REPO_DIR" ]; then
    fail "$REPO_DIR 已存在，但不是 Git 仓库"
else
    mkdir -p "$(dirname "$REPO_DIR")"
    git clone "$REPO_URL" "$REPO_DIR"
fi
success "✓ 仓库已就绪：$REPO_DIR"

if [ "$SELECTOR_TYPE" = "plugin" ]; then
    validate_plugin_selector_path
    PLUGIN_SKILL_LIST_FILE="$(mktemp "${TMPDIR:-/tmp}/jacky-skills-plugin.XXXXXX")" || \
        fail "无法创建 Plugin Skill 预检文件"
    trap cleanup EXIT
    if ! find_declared_plugin_skills "$REPO_DIR/plugins/$SELECTOR_VALUE" > "$PLUGIN_SKILL_LIST_FILE"; then
        fail "Plugin manifest 预检失败：$SELECTOR_VALUE"
    fi
fi

echo -e "${YELLOW}[3/5] 检查 j-skills CLI...${NC}"
if ! command -v j-skills >/dev/null 2>&1; then
    info "正在安装 j-skills CLI ${REQUIRED_J_SKILLS_VERSION}..."
    npm install -g "j-skills@$REQUIRED_J_SKILLS_VERSION" --no-audit --no-fund
fi

J_SKILLS_VERSION_OUTPUT="$(j-skills --version 2>&1)"
CURRENT_J_SKILLS_VERSION="$(printf '%s\n' "$J_SKILLS_VERSION_OUTPUT" | sed -nE 's/.*j-skills[/ ]([0-9]+\.[0-9]+\.[0-9]+).*/\1/p' | head -1)"
[ -n "$CURRENT_J_SKILLS_VERSION" ] || fail "无法识别 j-skills 版本：$J_SKILLS_VERSION_OUTPUT"
[ "$CURRENT_J_SKILLS_VERSION" = "$REQUIRED_J_SKILLS_VERSION" ] || \
    fail "需要 j-skills ${REQUIRED_J_SKILLS_VERSION}，当前为 ${CURRENT_J_SKILLS_VERSION}；请安装匹配版本或设置 J_SKILLS_VERSION"
success "✓ j-skills $CURRENT_J_SKILLS_VERSION"

SKILL_FILES=()
if [ "$SELECTOR_TYPE" = "plugin" ]; then
    while IFS= read -r -d '' skill_file; do
        [ -n "$skill_file" ] && SKILL_FILES+=("$skill_file")
    done < "$PLUGIN_SKILL_LIST_FILE"
else
    while IFS= read -r skill_file; do
        [ -n "$skill_file" ] && SKILL_FILES+=("$skill_file")
    done < <(discover_skill_files)
fi
[ "${#SKILL_FILES[@]}" -gt 0 ] || fail "没有找到匹配的 Skill：${SELECTOR_VALUE:-all}"

echo -e "${YELLOW}[4/5] 链接活跃 Skills...${NC}"
LINKED_SKILLS_JSON="$(j-skills link --list --json)"
SKILL_COUNT=0

for skill_file in "${SKILL_FILES[@]}"; do
    skill_dir="$(canonical_path "$(dirname "$skill_file")")"
    skill_name="$(read_skill_name "$skill_file")"
    [ -n "$skill_name" ] || fail "$skill_file 缺少有效的 frontmatter name"

    filesystem_link="$HOME/.j-skills/linked/$skill_name"
    linked_path="$(linked_path_for "$skill_name")"
    if [ -n "$linked_path" ]; then
        canonical_linked_path="$(canonical_path "$linked_path")"
        if [ ! -L "$filesystem_link" ]; then
            fail "链接冲突：$skill_name 已在注册表中，但 $filesystem_link 不是有效软链接"
        fi
        canonical_filesystem_link="$(canonical_path "$filesystem_link")"
        if [ "$canonical_linked_path" = "$skill_dir" ] && [ "$canonical_filesystem_link" = "$skill_dir" ]; then
            info "  跳过 ${skill_name}：已正确链接"
        else
            fail "链接冲突：$skill_name 的注册表或软链接目标不是 $skill_dir"
        fi
    else
        if [ -e "$filesystem_link" ] || [ -L "$filesystem_link" ]; then
            fail "链接冲突：$filesystem_link 已存在，但未出现在 j-skills 注册表中"
        fi
        info "  链接：$skill_name"
        link_skill_dir "$skill_dir"
        LINKED_SKILLS_JSON="$(j-skills link --list --json)"
    fi

    SKILL_COUNT=$((SKILL_COUNT + 1))
done
success "✓ 已核对 $SKILL_COUNT 个 Skills 的链接"

echo -e "${YELLOW}[5/5] 安装到 $INSTALL_ENVS...${NC}"
for skill_file in "${SKILL_FILES[@]}"; do
    skill_name="$(read_skill_name "$skill_file")"
    [ -n "$skill_name" ] || fail "$skill_file 缺少有效的 frontmatter name"
    info "  安装：$skill_name"
    CI=1 j-skills install "$skill_name" -g --env "$INSTALL_ENVS"
done

success "✓ 安装完成：$SKILL_COUNT 个 Skills → $INSTALL_ENVS"
echo "仓库位置：$REPO_DIR"
echo "查看链接：j-skills link --list"
echo "查看安装：j-skills list --all"
