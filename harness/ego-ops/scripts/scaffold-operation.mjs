#!/usr/bin/env node

import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(SCRIPT_DIR, '..');
const VALID_RISKS = new Set(['low', 'medium', 'high']);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALUE_OPTIONS = new Set([
    'root', 'site', 'domain', 'alias', 'operation', 'title', 'intent', 'risk', 'date',
    'entry', 'step', 'checkpoint', 'success', 'evidence',
]);
const REPEATABLE_OPTIONS = new Set(['alias', 'step', 'checkpoint', 'evidence']);

function fail(message) {
    throw new Error(message);
}

function isValidDate(value) {
    if (!DATE_PATTERN.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
}

function normalizeSlug(value, label) {
    const raw = String(value ?? '').trim();
    if (!raw || raw === '.' || raw === '..' || raw.includes('..') || /[\\/]/u.test(raw)) {
        fail(`${label} 必须是安全 slug，不能包含路径穿越或路径分隔符：${raw || '空值'}`);
    }
    if (/[\u0000-\u001f\u007f]/u.test(raw)) fail(`${label} 含有非法控制字符`);
    const slug = raw.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-+|-+$/gu, '');
    if (!slug || slug.length > 80) fail(`${label} 无法规范化为安全 slug：${raw}`);
    return slug;
}

function normalizeDomain(value) {
    const raw = String(value ?? '').trim();
    if (!raw || /[\u0000-\u001f\u007f]/u.test(raw)) fail('domain 必须是非空域名');
    const candidate = raw.includes('://') ? raw : `https://${raw}`;
    let parsed;
    try {
        parsed = new URL(candidate);
    } catch {
        fail(`domain 不是有效域名：${raw}`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol)
        || parsed.username
        || parsed.password
        || parsed.pathname !== '/'
        || parsed.search
        || parsed.hash) {
        fail(`domain 只能包含规范域名，不能包含凭证、路径、查询或片段：${raw}`);
    }
    return parsed.host.toLowerCase();
}

function parseArgs(argv) {
    const parsed = { alias: [], step: [], checkpoint: [], evidence: [] };
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === '--help' || argument === '-h') {
            console.log('用法：node scaffold-operation.mjs [--root <skill-root>] --site <site> --domain <domain> --alias <alias> --operation <operation> --title <title> --intent <intent> --risk <low|medium|high> --date <YYYY-MM-DD> [--entry <entry>] [--step <step>] [--checkpoint <checkpoint>] [--success <success>] [--evidence <evidence>]');
            process.exit(0);
        }
        if (!argument.startsWith('--')) fail(`未知参数格式：${argument}`);
        const key = argument.slice(2);
        if (!VALUE_OPTIONS.has(key)) fail(`未知参数：--${key}`);
        const value = argv[index + 1];
        if (value === undefined || value.startsWith('--')) fail(`参数 --${key} 缺少值`);
        index += 1;
        if (REPEATABLE_OPTIONS.has(key)) parsed[key].push(value);
        else if (parsed[key] !== undefined) fail(`参数 --${key} 不可重复`);
        else parsed[key] = value;
    }

    for (const key of ['site', 'domain', 'operation', 'title', 'intent', 'risk', 'date']) {
        if (!parsed[key]?.trim()) fail(`缺少必需参数：--${key}`);
    }
    if (!VALID_RISKS.has(parsed.risk)) fail(`risk 只能是 low、medium 或 high：${parsed.risk}`);
    if (!isValidDate(parsed.date)) fail(`date 不是有效的 YYYY-MM-DD 日期：${parsed.date}`);
    const textValues = [parsed.title, parsed.intent, parsed.entry, parsed.success, ...parsed.alias, ...parsed.step, ...parsed.checkpoint, ...parsed.evidence];
    if (textValues.some((value) => value !== undefined && (/\r|\n/u.test(value) || /\b(?:TODO|TBD|PLACEHOLDER|REQUIRED)\b/iu.test(value)))) {
        fail('文本参数不能包含换行或未完成占位符');
    }

    return {
        root: resolve(parsed.root || DEFAULT_ROOT),
        site: normalizeSlug(parsed.site, 'site'),
        domain: normalizeDomain(parsed.domain),
        aliases: [...new Set(parsed.alias.map((alias) => alias.trim()).filter(Boolean))],
        operation: normalizeSlug(parsed.operation, 'operation'),
        title: parsed.title.trim(),
        intent: parsed.intent.trim(),
        risk: parsed.risk,
        date: parsed.date,
        entry: parsed.entry?.trim(),
        step: parsed.step.map((value) => value.trim()),
        checkpoint: parsed.checkpoint.map((value) => value.trim()),
        success: parsed.success?.trim(),
        evidence: parsed.evidence.map((value) => value.trim()),
    };
}

async function assertSafeRoot(root) {
    try {
        const rootStat = await lstat(root);
        if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) fail(`root 必须是目录且不能是符号链接：${root}`);
    } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
        await mkdir(root, { recursive: true });
    }
}

async function assertSafeWritePath(root, target) {
    const rootPath = resolve(root);
    const targetPath = resolve(target);
    const pathFromRoot = relative(rootPath, targetPath);
    if (!pathFromRoot || pathFromRoot.startsWith('../') || pathFromRoot.startsWith('..\\') || isAbsolute(pathFromRoot)) {
        fail(`拒绝写入 root 之外的路径：${targetPath}`);
    }
    let current = rootPath;
    for (const segment of pathFromRoot.split(/[\\/]+/u)) {
        current = join(current, segment);
        try {
            const currentStat = await lstat(current);
            if (currentStat.isSymbolicLink()) fail(`拒绝经过符号链接写入：${current}`);
        } catch (error) {
            if (error?.code !== 'ENOENT') throw error;
            break;
        }
    }
}

async function safeWrite(root, target, content) {
    await assertSafeWritePath(root, target);
    await mkdir(dirname(target), { recursive: true });
    await assertSafeWritePath(root, target);
    await writeFile(target, content, 'utf8');
}

function yamlScalar(value) {
    const text = String(value);
    return /^[\p{L}\p{N} _.,!?()\-]+$/u.test(text) ? text : JSON.stringify(text);
}

function updateFrontmatterField(content, field, value) {
    const block = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)(\r?\n?)/u);
    if (!block) fail(`已有文档缺少可更新的 YAML frontmatter：${field}`);
    const expression = new RegExp(`^${field}:.*$`, 'mu');
    if (!expression.test(block[2])) fail(`已有文档缺少可更新的 frontmatter 字段：${field}`);
    const updated = block[2].replace(expression, `${field}: ${yamlScalar(value)}`);
    return `${block[1]}${updated}${block[3]}${block[4]}${content.slice(block[0].length)}`;
}

function tableCell(value) {
    return String(value).replaceAll('|', '\\|').replace(/[\r\n]+/gu, ' ');
}

function upsertTableRow(content, link, row, date) {
    const lines = content.split('\n');
    const matchingLine = lines.findIndex((line) => line.includes(`](${link})`));
    if (matchingLine >= 0) {
        lines[matchingLine] = lines[matchingLine].replace(/\d{4}-\d{2}-\d{2}/u, date);
        return lines.join('\n');
    }
    const separatorIndex = lines.findIndex((line, index) => index > 0 && /^\|\s*:?-{3,}/u.test(line));
    if (separatorIndex >= 0) {
        lines.splice(separatorIndex + 1, 0, row);
        return lines.join('\n');
    }
    fail(`缺少可更新的索引表格：${link}`);
}

function rootIndexTemplate(date) {
    return `---\nformat: ego-site-index\nupdated: ${date}\n---\n\n# 站点索引\n\n| 站点 | 域名 | 别名 | 最近验证 | 参考文档 |\n|---|---|---|---|---|\n`;
}

function siteIndexTemplate({ site, domain, aliases, date }) {
    const aliasLines = aliases.length ? aliases.map((alias) => `  - ${yamlScalar(alias)}`).join('\n') : '  - 无';
    const complete = completeOperation(arguments[0]);
    const platformFacts = complete ? '仅记录跨 operation、且已经由当前页面验证的登录、导航、加载或页面架构事实。' : '必填：只记录跨 operation、且已经由当前页面验证的登录、导航、加载或页面架构事实。';
    const traps = complete ? '仅记录跨 operation 且已经复现并验证过的失败模式。' : '必填：只记录跨 operation 且已经复现并验证过的失败模式。';
    return `---\nsite: ${site}\ndomains:\n  - ${domain}\naliases:\n${aliasLines}\nupdated: ${date}\n---\n\n# ${site}\n\n## 平台特征\n\n${platformFacts}\n\n## 操作目录\n\n| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |\n|---|---|---|---|---|\n\n## 站点级陷阱\n\n${traps}\n`;
}

function completeOperation({ entry, step, checkpoint, success, evidence }) {
    return Boolean(entry && step.length && checkpoint.length && success && evidence.length);
}

function operationTemplate(options) {
    const complete = completeOperation(options);
    const entry = options.entry || '必填：记录已验证的产品入口和稳定控件语义。';
    const steps = options.step.length ? options.step.map((value, index) => `${index + 1}. ${value}`).join('\n') : '必填：仅记录由当前页面证据验证过的观察、行动和重新观察步骤。';
    const checkpoints = options.checkpoint.length ? options.checkpoint.map((value) => `- ${value}`).join('\n') : '必填：记录每个关键点击或写操作后的可观察检查点。';
    const success = options.success || '必填：记录与目标匹配的成功提示、读回结果、状态变化、列表变化或导出结果。';
    const evidence = options.evidence.length ? options.evidence.map((value) => `- ${value}`).join('\n') : '必填：记录脱敏的验证日期和页面证据类型。';
    const title = yamlScalar(options.title);
    return `---\nsite: ${options.site}\noperation: ${options.operation}\ntitle: ${title}\nrisk: ${options.risk}\nlast_verified: ${options.date}\n---\n\n# ${title}\n\n## 目标\n\n${complete ? options.intent : `必填：${options.intent}`}\n\n## 前置条件与授权\n\n${complete ? '仅在本次明确授权范围内执行；对象不唯一、影响范围扩大或不可逆时停止并确认。' : '必填：记录必要的前置状态和本次明确授权范围。'}\n\n## 入口\n\n${entry}\n\n## 已验证步骤\n\n${steps}\n\n## 检查点\n\n${checkpoints}\n\n## 成功标准\n\n${success}\n\n## 失败模式与恢复\n\n${complete ? '尚未记录经证实且可复现的失败模式；结果不明时回到检查点，不更新验证日期。' : '必填：只记录已验证且未来可能复现的失败现象、根因和恢复方式。'}\n\n## 验证证据\n\n${evidence}\n`;
}

async function readIfExists(path) {
    try {
        return await readFile(path, 'utf8');
    } catch (error) {
        if (error?.code === 'ENOENT') return null;
        throw error;
    }
}

async function scaffold(options) {
    const root = options.root;
    await assertSafeRoot(root);
    const sitesRoot = join(root, 'references', 'sites');
    const rootIndexPath = join(sitesRoot, 'index.md');
    const siteRoot = join(sitesRoot, options.site);
    const siteIndexPath = join(siteRoot, 'index.md');
    const operationPath = join(siteRoot, 'operations', `${options.operation}.md`);
    for (const path of [sitesRoot, rootIndexPath, siteRoot, siteIndexPath, operationPath]) await assertSafeWritePath(root, path);

    let rootIndex = await readIfExists(rootIndexPath);
    rootIndex = rootIndex === null ? rootIndexTemplate(options.date) : updateFrontmatterField(rootIndex, 'updated', options.date);
    rootIndex = upsertTableRow(rootIndex, `${options.site}/index.md`, `| [${options.site}](${options.site}/index.md) | ${tableCell(options.domain)} | ${tableCell(options.aliases.join('、') || '无')} | ${options.date} | [站点索引](${options.site}/index.md) |`, options.date);
    await safeWrite(root, rootIndexPath, rootIndex);

    let siteIndex = await readIfExists(siteIndexPath);
    siteIndex = siteIndex === null ? siteIndexTemplate(options) : updateFrontmatterField(siteIndex, 'updated', options.date);
    siteIndex = upsertTableRow(siteIndex, `operations/${options.operation}.md`, `| [${options.operation}](operations/${options.operation}.md) | ${tableCell(options.intent)} | ${options.risk} | ${options.date} | [操作](operations/${options.operation}.md) |`, options.date);
    await safeWrite(root, siteIndexPath, siteIndex);

    const existingOperation = await readIfExists(operationPath);
    const created = existingOperation === null;
    const operation = created ? operationTemplate(options) : updateFrontmatterField(existingOperation, 'last_verified', options.date);
    await safeWrite(root, operationPath, operation);
    console.log(`${created ? '已创建' : '已刷新'}站点 ${options.site} 的 operation ${options.operation}；验证日期 ${options.date}。`);
}

export { isValidDate, normalizeSlug, parseArgs, scaffold };

if (resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
    try {
        await scaffold(parseArgs(process.argv.slice(2)));
    } catch (error) {
        console.error(`脚手架失败：${error.message}`);
        process.exitCode = 1;
    }
}
