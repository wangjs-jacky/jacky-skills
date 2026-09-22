#!/usr/bin/env node

import { lstat, readdir, readFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(SCRIPT_DIR, '..');
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_RISKS = new Set(['low', 'medium', 'high']);
const OPERATION_SECTIONS = ['目标', '前置条件与授权', '入口', '已验证步骤', '检查点', '成功标准', '失败模式与恢复', '验证证据'];
const SITE_SECTIONS = ['平台特征', '操作目录', '站点级陷阱'];
const PLACEHOLDER_PATTERNS = [
    [/\bTODO\b/i, 'TODO'],
    [/\bTBD\b/i, 'TBD'],
    [/\bPLACEHOLDER\b/i, 'PLACEHOLDER'],
    [/\bREQUIRED\b/i, 'REQUIRED'],
    [/必填/u, '必填'],
];
const SENSITIVE_PATTERNS = [
    [/\bAuthorization\b/i, 'Authorization'],
    [/\bBearer\b/i, 'Bearer'],
    [/\bCookie\b/i, 'Cookie'],
    [/密码/u, '密码'],
    [/\bToken\b/i, 'Token'],
    [/\bAPI[\s_-]?Key\b/i, 'API Key'],
    [/\bClient[\s_-]?Secret\b/i, 'Client Secret'],
    [/\bprivate[\s_-]?key\b/i, 'Private Key'],
    [/\b(?:signed|signature)\s+URL\b/i, '签名 URL'],
    [/[?&](?:token|sig|signature|x-amz-signature|x-amz-credential)=[^\s)]+/i, '签名 URL'],
];

function isValidDate(value) {
    if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseScalar(value) {
    const text = value.trim();
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1).replaceAll('\\"', '"').replaceAll("''", "'");
    return text;
}

function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/u);
    if (!match) throw new Error('缺少或无法解析 YAML frontmatter');
    const lines = match[1].split(/\r?\n/u);
    const data = {};
    for (let index = 0; index < lines.length; index += 1) {
        if (!lines[index].trim()) continue;
        const field = lines[index].match(/^([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*))?$/u);
        if (!field) throw new Error(`frontmatter 行格式无效：${lines[index]}`);
        const [, key, inlineValue = ''] = field;
        if (Object.hasOwn(data, key)) throw new Error(`frontmatter 字段重复：${key}`);
        if (inlineValue.trim()) {
            data[key] = parseScalar(inlineValue);
            continue;
        }
        const items = [];
        while (index + 1 < lines.length && /^\s*-\s*(.*)$/u.test(lines[index + 1])) {
            index += 1;
            items.push(parseScalar(lines[index].match(/^\s*-\s*(.*)$/u)[1]));
        }
        data[key] = items;
    }
    return { data, body: match[2] };
}

function addIssue(issues, filePath, message) {
    issues.push(`${filePath}：${message}`);
}

async function readDocument(root, path, kind, issues) {
    let content;
    try {
        content = await readFile(path, 'utf8');
    } catch (error) {
        if (error?.code === 'ENOENT') addIssue(issues, relative(root, path), `${kind}文件不存在`);
        else addIssue(issues, relative(root, path), `读取失败：${error.message}`);
        return null;
    }
    try {
        const parsed = parseFrontmatter(content);
        return { ...parsed, content };
    } catch (error) {
        addIssue(issues, relative(root, path), error.message);
        return { data: null, body: content, content };
    }
}

function requireString(data, key, filePath, issues) {
    if (typeof data?.[key] !== 'string' || !data[key].trim()) {
        addIssue(issues, filePath, `frontmatter 缺少非空字段：${key}`);
        return null;
    }
    return data[key].trim();
}

function requireDate(data, key, filePath, issues) {
    const value = requireString(data, key, filePath, issues);
    if (value && !isValidDate(value)) addIssue(issues, filePath, `${key} 不是有效的 YYYY-MM-DD 日期：${value}`);
    return value;
}

function requireList(data, key, filePath, issues, allowEmpty = true) {
    const value = data?.[key];
    if (!Array.isArray(value) || (!allowEmpty && value.length === 0) || value.some((item) => typeof item !== 'string' || !item.trim())) {
        addIssue(issues, filePath, `frontmatter 字段 ${key} 必须是${allowEmpty ? '' : '非空'}字符串列表`);
        return [];
    }
    return value.map((item) => item.trim());
}

function validateMetadata(document, kind, expected, filePath, issues) {
    if (!document?.data) return;
    const { data } = document;
    if (kind === '根索引') {
        requireDate(data, 'updated', filePath, issues);
        if (data.format && data.format !== 'ego-site-index') addIssue(issues, filePath, `format 无效：${data.format}`);
        return;
    }
    const site = requireString(data, 'site', filePath, issues);
    if (site && site !== expected.site) addIssue(issues, filePath, `site 与目录不一致：${site} !== ${expected.site}`);
    if (kind === '站点索引') {
        requireList(data, 'domains', filePath, issues, false);
        requireList(data, 'aliases', filePath, issues);
        requireDate(data, 'updated', filePath, issues);
        return;
    }
    const operation = requireString(data, 'operation', filePath, issues);
    if (operation && operation !== expected.operation) addIssue(issues, filePath, `operation 与文件名不一致：${operation} !== ${expected.operation}`);
    requireString(data, 'title', filePath, issues);
    const risk = requireString(data, 'risk', filePath, issues);
    if (risk && !VALID_RISKS.has(risk)) addIssue(issues, filePath, `risk 只能是 low、medium 或 high：${risk}`);
    requireDate(data, 'last_verified', filePath, issues);
}

function routeRowCount(content, link) {
    return content?.split('\n').filter((line) => line.includes(`](${link})`)).length ?? 0;
}

function checkRegistration(content, label, link, filePath, issues) {
    const count = routeRowCount(content, link);
    if (count === 0) addIssue(issues, filePath, `未登记 operation 或站点：${label} -> ${link}`);
    if (count > 1) addIssue(issues, filePath, `索引存在重复登记：${label} -> ${link}`);
}

function validateSections(body, requiredSections, filePath, issues) {
    const headings = [...body.matchAll(/^##\s+([^\n]+?)\s*$/gmu)].map((match) => ({ title: match[1].trim(), index: match.index, contentStart: match.index + match[0].length }));
    let cursor = 0;
    for (const section of requiredSections) {
        const heading = headings.find((candidate) => candidate.title === section && candidate.index >= cursor);
        if (!heading) {
            addIssue(issues, filePath, `缺少章节或章节顺序错误：## ${section}`);
            continue;
        }
        const nextHeading = headings.find((candidate) => candidate.index > heading.index);
        if (!body.slice(heading.contentStart, nextHeading?.index).trim()) addIssue(issues, filePath, `章节不能为空：## ${section}`);
        cursor = heading.index;
    }
}

function scanUnsafeContent(content, filePath, issues) {
    for (const [pattern, label] of PLACEHOLDER_PATTERNS) if (pattern.test(content)) addIssue(issues, filePath, `包含未完成占位内容：${label}`);
    for (const [pattern, label] of SENSITIVE_PATTERNS) if (pattern.test(content)) addIssue(issues, filePath, `包含敏感认证材料：${label}`);
}

function isExternalLink(link) {
    return /^(?:[a-z][a-z0-9+.-]*:|\/)/iu.test(link);
}

async function validateRelativeLinks(root, files, issues) {
    for (const { path, content } of files) {
        if (!content) continue;
        const links = [...content.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu)].map((match) => match[1]);
        for (const rawLink of links) {
            const link = rawLink.replace(/^<|>$/gu, '').split('#', 1)[0].split('?', 1)[0];
            if (!link || isExternalLink(link)) continue;
            const target = resolve(dirname(path), link);
            const pathFromRoot = relative(root, target);
            if (!pathFromRoot || pathFromRoot.startsWith('..') || isAbsolute(pathFromRoot)) {
                addIssue(issues, relative(root, path), `相对链接指向 root 外：${rawLink}`);
                continue;
            }
            try {
                await lstat(target);
            } catch (error) {
                if (error?.code === 'ENOENT') addIssue(issues, relative(root, path), `相对链接不存在：${rawLink}`);
                else addIssue(issues, relative(root, path), `相对链接无法读取：${rawLink}`);
            }
        }
    }
}

async function getDirectories(path) {
    try {
        return (await readdir(path, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    } catch (error) {
        if (error?.code === 'ENOENT') return [];
        throw error;
    }
}

async function getMarkdownFiles(path) {
    try {
        return (await readdir(path, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.endsWith('.md')).map((entry) => entry.name).sort();
    } catch (error) {
        if (error?.code === 'ENOENT') return [];
        throw error;
    }
}

async function validateKnowledge(rootInput = DEFAULT_ROOT) {
    const root = resolve(rootInput);
    const issues = [];
    const files = [];
    const knowledgeRoot = join(root, 'references', 'sites');
    const rootIndexPath = join(knowledgeRoot, 'index.md');
    const rootDocument = await readDocument(root, rootIndexPath, '根索引', issues);
    if (rootDocument) {
        validateMetadata(rootDocument, '根索引', {}, relative(root, rootIndexPath), issues);
        if (!/^\|\s*(?:站点|site)\s*\|/mu.test(rootDocument.content)) addIssue(issues, relative(root, rootIndexPath), '缺少站点表格');
        scanUnsafeContent(rootDocument.content, relative(root, rootIndexPath), issues);
        files.push({ path: rootIndexPath, content: rootDocument.content });
    }

    const siteNames = await getDirectories(knowledgeRoot);
    let operationCount = 0;
    for (const siteName of siteNames) {
        const siteRoot = join(knowledgeRoot, siteName);
        const siteIndexPath = join(siteRoot, 'index.md');
        const siteIndexDocument = await readDocument(root, siteIndexPath, '站点索引', issues);
        const siteIndexRelative = relative(root, siteIndexPath);
        if (siteIndexDocument) {
            validateMetadata(siteIndexDocument, '站点索引', { site: siteName }, siteIndexRelative, issues);
            validateSections(siteIndexDocument.body, SITE_SECTIONS, siteIndexRelative, issues);
            checkRegistration(rootDocument?.content, siteName, `${siteName}/index.md`, relative(root, rootIndexPath), issues);
            if (!/\|\s*(?:操作|operation)\s*\|/mu.test(siteIndexDocument.content)) addIssue(issues, siteIndexRelative, '缺少 operation 表格');
            scanUnsafeContent(siteIndexDocument.content, siteIndexRelative, issues);
            files.push({ path: siteIndexPath, content: siteIndexDocument.content });
        }

        const operationsRoot = join(siteRoot, 'operations');
        for (const fileName of await getMarkdownFiles(operationsRoot)) {
            operationCount += 1;
            const operationName = fileName.slice(0, -3);
            const operationPath = join(operationsRoot, fileName);
            const operationDocument = await readDocument(root, operationPath, 'operation', issues);
            const operationRelative = relative(root, operationPath);
            if (!operationDocument) continue;
            validateMetadata(operationDocument, 'operation', { site: siteName, operation: operationName }, operationRelative, issues);
            validateSections(operationDocument.body, OPERATION_SECTIONS, operationRelative, issues);
            checkRegistration(siteIndexDocument?.content, operationName, `operations/${fileName}`, siteIndexRelative, issues);
            scanUnsafeContent(operationDocument.content, operationRelative, issues);
            files.push({ path: operationPath, content: operationDocument.content });
        }
    }

    await validateRelativeLinks(root, files, issues);
    return { root, issues, siteCount: siteNames.length, operationCount };
}

function parseArgs(argv) {
    if (argv.length === 0) return DEFAULT_ROOT;
    if (argv.length === 2 && argv[0] === '--root' && argv[1] && !argv[1].startsWith('--')) return resolve(argv[1]);
    throw new Error('用法：node validate-knowledge.mjs [--root <skill-root>]');
}

export { isValidDate, parseFrontmatter, validateKnowledge };

if (resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
    try {
        const result = await validateKnowledge(parseArgs(process.argv.slice(2)));
        if (result.issues.length > 0) {
            console.error(`知识库校验失败，共 ${result.issues.length} 个错误：`);
            for (const issue of result.issues) console.error(`- ${issue}`);
            process.exitCode = 1;
        } else {
            console.log(`知识库校验通过：已校验 ${result.siteCount} 个站点、${result.operationCount} 个 operation。`);
        }
    } catch (error) {
        console.error(`知识库校验失败：${error.message}`);
        process.exitCode = 1;
    }
}
