#!/usr/bin/env node
// 仅检查本 Skill 的公共知识结构；不联网、不扫描应用、不读取本机实例。
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const today = new Date().toISOString().slice(0, 10);
const errors = [];
const docs = new Map();
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fail = (file, message) => errors.push(`${relative(root, file)}：${message}`);
const inside = (file) => {
  const rel = relative(root, file);
  return rel !== '..' && !rel.startsWith('../') && !isAbsolute(rel);
};

function collect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isSymbolicLink()) { fail(file, '公共引用目录不允许符号链接'); continue; }
    if (entry.isDirectory()) collect(file);
    else if (extname(file) === '.md') docs.set(file, readFileSync(file, 'utf8'));
  }
}

// 能力和 operation 的 frontmatter 仅支持 schema 规定的平坦标量字段。
function metadata(file, fields) {
  const body = docs.get(file);
  const block = body?.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!block) { fail(file, '缺少元数据'); return {}; }
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([a-z_]+):\s*(\S.*?)\s*$/);
    if (!match) { fail(file, '元数据必须为单行标量'); continue; }
    const [, key, value] = match;
    if (Object.hasOwn(data, key) || !fields.includes(key)) fail(file, `重复或未知字段 ${key}`);
    data[key] = value === 'null' ? null : value;
  }
  for (const key of fields) if (!Object.hasOwn(data, key)) fail(file, `缺少字段 ${key}`);
  return data;
}

function date(file, key, value, nullable = false) {
  if (nullable && value === null) return;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(file, `${key} 日期格式不正确`); return;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(+parsed) || parsed.toISOString().slice(0, 10) !== value || value > today) {
    fail(file, `${key} 必须为真实且不晚于今天的日期`);
  }
}

function sections(file, names) {
  const headings = [...(docs.get(file) ?? '').matchAll(/^## (.+)$/gm)].map(m => m[1].trim());
  for (const name of names) if (!headings.includes(name)) fail(file, `缺少章节 ${name}`);
}

function table(file, firstColumn) {
  const lines = (docs.get(file) ?? '').split('\n');
  const cells = line => line.split('|').slice(1, -1).map(cell => cell.trim());
  const start = lines.findIndex(line => line.startsWith('|') && cells(line)[0] === firstColumn);
  if (start < 0) { fail(file, `缺少 ${firstColumn} 索引表`); return []; }
  const header = cells(lines[start]);
  const rows = [];
  for (let i = start + 1; i < lines.length && lines[i].startsWith('|'); i++) rows.push(cells(lines[i]));
  return rows.filter(row => !/^:?-+:?$/.test(row[0]))
    .map(row => Object.fromEntries(header.map((name, i) => [name, row[i]])));
}

function linkCheck(file, body) {
  for (const match of body.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)) {
    const href = match[1];
    if (/^https?:\/\//.test(href)) continue;
    try {
      const [path, fragment] = href.split('#');
      if (/^[a-z]+:/i.test(path) || isAbsolute(path)) throw new Error('非相对文件链接');
      const target = path ? resolve(dirname(file), decodeURIComponent(path)) : file;
      if (!inside(target) || !inside(realpathSync(target))) throw new Error('链接越出 Skill');
      const rel = relative(root, target);
      if (rel.startsWith('local/') || /(?:^|\/)experience\.local\.md$|\.local\./.test(rel)) {
        throw new Error('公共知识不能链接私有实例');
      }
      if (fragment && extname(target) === '.md') {
        const headings = [...readFileSync(target, 'utf8').matchAll(/^#{1,6} (.+)$/gm)]
          .map(m => m[1].toLowerCase().replace(/[^\p{L}\p{N}\p{M}_\-\s]/gu, '').replace(/\s/g, '-'));
        if (!headings.includes(decodeURIComponent(fragment))) throw new Error('锚点不存在');
      }
    } catch (error) { fail(file, `无效链接 ${href}（${error.message}）`); }
  }
}

try {
  docs.set(join(root, 'SKILL.md'), readFileSync(join(root, 'SKILL.md'), 'utf8'));
  collect(join(root, 'references'));
  const capabilityRoot = join(root, 'references/capabilities');
  const routingFile = join(capabilityRoot, 'index.md');
  const routes = table(routingFile, 'capability');
  const capabilities = readdirSync(capabilityRoot, { withFileTypes: true }).filter(e => e.isDirectory());
  let operationCount = 0;
  for (const entry of capabilities) {
    const cap = entry.name;
    const capFile = join(capabilityRoot, cap, 'index.md');
    if (!slug.test(cap)) fail(capFile, '能力 key 不是 kebab-case');
    const meta = metadata(capFile, ['capability', 'updated', 'docs_checked']);
    if (meta.capability !== cap) fail(capFile, '能力 key 与目录不一致');
    date(capFile, 'updated', meta.updated);
    date(capFile, 'docs_checked', meta.docs_checked, true);
    sections(capFile, ['能力与边界', '限制与额度', '操作目录', '已知坑', '资料来源']);
    if (!/https:\/\/developers\.cloudflare\.com\//.test(docs.get(capFile) ?? '')) {
      fail(capFile, '缺少 Cloudflare 官方来源');
    }
    const matchedRoutes = routes.filter(row => row.capability === cap);
    if (matchedRoutes.length !== 1 || !matchedRoutes[0]['档案']?.includes(`](${cap}/index.md)`)) {
      fail(routingFile, `${cap} 路由缺失、重复或路径不一致`);
    }
    const indexRows = table(capFile, 'operation');
    const opsDir = join(capabilityRoot, cap, 'operations');
    const opFiles = readdirSync(opsDir).filter(name => name.endsWith('.md'));
    for (const name of opFiles) {
      const op = name.slice(0, -3);
      const file = join(opsDir, name);
      operationCount++;
      if (!slug.test(op)) fail(file, 'operation key 不是 kebab-case');
      const data = metadata(file, ['capability', 'operation', 'status', 'last_verified']);
      if (data.capability !== cap || data.operation !== op) fail(file, 'operation 归属与路径不一致');
      if (!['documented', 'partial', 'verified'].includes(data.status)) fail(file, '未知验证状态');
      if (data.status === 'verified') date(file, 'last_verified', data.last_verified);
      else if (data.last_verified !== null) fail(file, '非 verified 不得填写成功验证日期');
      sections(file, ['目标', '适用状态与前置条件', '设计与执行', '坑与恢复', '成功标准', '验证证据与边界']);
      const rows = indexRows.filter(row => row.operation === op);
      const row = rows[0];
      if (rows.length !== 1 || row.status !== data.status ||
          row.last_verified !== (data.last_verified ?? '—') ||
          !row.reference?.includes(`](operations/${name})`)) {
        fail(capFile, `${op} 索引与文件不一致`);
      }
    }
    for (const row of indexRows) if (!opFiles.includes(`${row.operation}.md`)) fail(capFile, '索引含不存在的 operation');
  }
  for (const row of routes) if (!capabilities.some(entry => entry.name === row.capability)) fail(routingFile, '路由含不存在的能力');
  const privateMarkers = /\/(?:Users|home)\/[^\s/]+|\b[0-9a-f]{32}\b|\b[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b|Authorization:\s*Bearer\s+\S+|-----BEGIN [A-Z ]*PRIVATE KEY-----/i;
  for (const [file, body] of docs) {
    linkCheck(file, body);
    if (privateMarkers.test(body)) fail(file, '发现疑似私有路径、标识或凭据，需人工核对');
    if (/\[TODO:/.test(body)) fail(file, '存在未完成脚手架');
  }
  const agentFile = join(root, 'agents/openai.yaml');
  if (privateMarkers.test(readFileSync(agentFile, 'utf8'))) fail(agentFile, '发现疑似私有信息');
  const ignoreFile = join(root, '.gitignore');
  const ignored = readFileSync(ignoreFile, 'utf8').split(/\r?\n/);
  for (const pattern of ['experience.local.md', '*.local.*', 'local/']) {
    if (!ignored.includes(pattern)) fail(ignoreFile, `缺少 ${pattern}`);
  }
  if (errors.length) {
    process.stderr.write(`${errors.join('\n')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`知识结构校验通过：${capabilities.length} 个能力、${operationCount} 个操作、${docs.size} 份公共文档。未访问 Cloudflare 或私有实例。\n`);
  }
} catch (error) {
  process.stderr.write(`知识结构校验失败：${error.message}\n`);
  process.exitCode = 1;
}
