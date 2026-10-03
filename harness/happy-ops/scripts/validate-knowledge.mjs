import { readFile, readdir, lstat, realpath } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('..', import.meta.url));
const hash = value => createHash('sha256').update(value).digest('hex');
const operationSections = ['目标', '前置条件与授权', '入口', '步骤与检查点', '成功标准', '失败模式与恢复', '验证证据'];
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value;

function fields(text, label, errors) {
    const result = {};
    for (const match of text.split(/^## /m)[0].matchAll(/^- ([a-z_]+): (.+)$/gm)) {
        if (Object.hasOwn(result, match[1])) errors.push(`重复字段：${label} ${match[1]}`);
        result[match[1]] = match[2].trim();
    }
    return result;
}

function checkSections(text, names, label, errors) {
    let previous = -1;
    for (const name of names) {
        const marker = `## ${name}\n`;
        const offset = text.indexOf(marker);
        if (offset < 0 || offset <= previous) errors.push(`缺失或乱序章节：${label} ${name}`);
        else {
            const body = text.slice(offset + marker.length).split(/^## /m)[0].trim();
            if (!body) errors.push(`空章节：${label} ${name}`);
        }
        previous = offset;
    }
}

export async function validateKnowledge(directory = defaultRoot) {
    const root = await realpath(directory);
    const errors = [];
    const contents = new Map();
    const exists = async file => lstat(file).then(() => true, e => {
        if (e.code === 'ENOENT') return false;
        throw e;
    });
    const inside = file => file === root || file.startsWith(root + path.sep);
    const resolveInside = (base, relative) => {
        const target = path.resolve(base, relative);
        if (!inside(target)) throw new Error('知识路径越出 Skill 目录');
        return target;
    };
    const walk = async dir => {
        if (!await exists(dir)) return [];
        const files = [];
        for (const item of await readdir(dir, { withFileTypes: true })) {
            const file = path.join(dir, item.name);
            if (item.isSymbolicLink()) errors.push(`知识目录不使用符号链接：${path.relative(root, file)}`);
            else if (item.isDirectory()) files.push(...await walk(file));
            else files.push(file);
        }
        return files;
    };
    const shared = [path.join(root, 'SKILL.md'), path.join(root, 'index.md'),
        ...(await walk(path.join(root, 'references'))).filter(f => f.endsWith('.md'))];
    const localRoot = path.join(root, 'local');
    const hasLocal = await exists(localRoot);
    const privateFiles = await walk(localRoot);
    const compatibility = path.join(root, 'experience.local.md');
    if (await exists(compatibility)) privateFiles.push(compatibility);
    const routes = privateFiles.filter(f => path.basename(f) === 'index.md'
        || f === compatibility || /\/(?:records|operations)\//.test(f) && f.endsWith('.md'));
    const graph = new Map();
    for (const file of [...shared, ...routes]) {
        const label = path.relative(root, file);
        if (!await exists(file)) { errors.push(`缺失入口：${label}`); continue; }
        if (!inside(await realpath(file))) { errors.push(`链接逃逸：${label}`); continue; }
        const text = await readFile(file, 'utf8');
        contents.set(file, text);
        if (shared.includes(file) && /\/Users\/[^\s/]+|\/home\/[^\s/]+|\b(?:\d{1,3}\.){3}\d{1,3}\b|-----BEGIN [A-Z ]*PRIVATE KEY-----|\bAKIA[0-9A-Z]{16}\b/.test(text)) {
            errors.push(`公开文档含疑似私有值：${label}`);
        }
        const edges = [];
        for (const match of text.matchAll(/\[[^\]\n]*\]\(([^)]+)\)/g)) {
            const href = match[1].trim().replace(/^<|>$/g, '');
            if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('#')) continue;
            let target;
            try { target = resolveInside(path.dirname(file), decodeURIComponent(href.split('#')[0])); }
            catch { errors.push(`无效文件链接：${label}`); continue; }
            // 共享安装可完全没有 local；已有本机知识库则必须检查其断链。
            if (target === compatibility && !await exists(target)) continue;
            if (!hasLocal && target.startsWith(localRoot + path.sep)) continue;
            if (!await exists(target)) errors.push(`断链：${label} → ${path.relative(root, target)}`);
            else if (!inside(await realpath(target))) errors.push(`链接逃逸：${label}`);
            else edges.push(target);
        }
        graph.set(file, edges);
    }
    const reachable = new Set();
    const visit = file => { if (reachable.has(file)) return; reachable.add(file); for (const next of graph.get(file) ?? []) visit(next); };
    visit(path.join(root, 'SKILL.md'));
    for (const file of shared) if (!reachable.has(file)) errors.push(`公开文档未从入口可达：${path.relative(root, file)}`);
    const systemRoot = path.join(root, 'references', 'systems');
    const catalog = path.join(systemRoot, 'index.md');
    if (!contents.has(catalog)) errors.push('缺失系统目录：references/systems/index.md');
    const operations = new Map();
    const systems = new Map();
    for (const file of shared) {
        const relative = path.relative(systemRoot, file);
        const systemMatch = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/index\.md$/.exec(relative);
        const opMatch = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/operations\/([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/.exec(relative);
        const text = contents.get(file) ?? '';
        const label = path.relative(root, file);
        if (systemMatch) {
            const data = fields(text, label, errors);
            if (data.system !== systemMatch[1] || !data.aliases) errors.push(`系统身份或别名缺失：${label}`);
            checkSections(text, ['系统共识', '操作目录', '共性陷阱', '本机环境'], label, errors);
            if (!graph.get(catalog)?.includes(file)) errors.push(`系统未登记：${label}`);
            systems.set(systemMatch[1], file);
        } else if (opMatch) {
            const data = fields(text, label, errors);
            if (data.system !== opMatch[1] || data.operation !== opMatch[2]) errors.push(`操作身份不匹配：${label}`);
            if (!['verified', 'historical', 'pending', 'superseded'].includes(data.status)) errors.push(`无效操作状态：${label}`);
            if (!['low', 'medium', 'high'].includes(data.risk) || !data.scope) errors.push(`缺失风险或验证范围：${label}`);
            if (data.last_verified !== 'none' && !validDate(data.last_verified ?? '')) errors.push(`无效验证日期：${label}`);
            if (data.status === 'verified' && !validDate(data.last_verified ?? '')) errors.push(`已验证操作缺少成功日期：${label}`);
            checkSections(text, operationSections, label, errors);
            const evidence = text.split('## 验证证据\n')[1] ?? '';
            if (!/\[[^\]]+\]\([^)]+\)/.test(evidence)) errors.push(`操作缺少证据链接：${label}`);
            operations.set(`${opMatch[1]}/${opMatch[2]}`, { file, data });
        } else if (relative.startsWith('..') === false && relative !== 'index.md') {
            errors.push(`系统目录中存在不符合约定的文档：${label}`);
        }
    }
    const replacements = new Map();
    for (const [key, { file, data }] of operations) {
        const label = path.relative(root, file);
        const system = systems.get(key.split('/')[0]);
        if (!system) errors.push(`操作无所属系统：${label}`);
        const indexes = [system];
        const privateIndex = path.join(localRoot, 'systems', key.split('/')[0], 'index.md');
        const [systemSlug, operationSlug] = key.split('/');
        const privateEvidence = path.join(localRoot, 'systems', systemSlug, 'operations', operationSlug + '.md');
        if (hasLocal) {
            indexes.push(privateIndex);
            if (!contents.has(privateEvidence) || !graph.get(file)?.includes(privateEvidence)) errors.push(`操作缺少私有证据入口：${label}`);
            if (contents.has(privateEvidence) && !graph.get(privateEvidence)?.includes(file)) errors.push(`私有证据未引用所属操作：${label}`);
        }
        for (const index of indexes.filter(Boolean)) {
            const expected = `operations/${data.operation}.md`;
            const rows = (contents.get(index) ?? '').split('\n').filter(line => line.includes(`](${expected})`));
            const cells = rows[0]?.split('|').map(x => x.trim()) ?? [];
            if (rows.length !== 1 || cells[3] !== data.status || cells[4] !== data.last_verified) {
                errors.push(`操作索引状态/日期不一致或登记缺失：${path.relative(root, index)} ${key}`);
            }
        }
        if (data.status === 'superseded') {
            const link = /\[[^\]]+\]\(([^)]+)\)/.exec(data.replacement ?? '');
            const replacement = link && path.resolve(path.dirname(file), link[1]);
            if (!replacement || replacement === file || ![...operations.values()].some(o => o.file === replacement)) errors.push(`替代操作无效：${label}`);
            else replacements.set(file, replacement);
        }
    }
    for (const start of replacements.keys()) {
        const seen = new Set();
        let file = start;
        while (replacements.has(file)) {
            if (seen.has(file)) { errors.push(`操作替代关系成环：${path.relative(root, start)}`); break; }
            seen.add(file);
            file = replacements.get(file);
        }
    }
    for (const file of routes) if (!reachable.has(file)) errors.push(`私有操作/记录未从入口可达：${path.relative(root, file)}`);
    for (const file of privateFiles) {
        try { execFileSync('git', ['check-ignore', '--quiet', '--', path.relative(root, file)], { cwd: root, stdio: 'pipe' }); }
        catch { errors.push(`私有文件未被 Git 忽略：${path.relative(root, file)}`); }
    }
    const migrationPath = path.join(localRoot, 'migration.json');
    let historicalFiles = [];
    if (await exists(migrationPath)) {
        try {
            const migration = JSON.parse(await readFile(migrationPath, 'utf8'));
            const base = path.join(root, 'local');
            historicalFiles = migration.entries.map(e => resolveInside(base, e.file));
            const archive = await readFile(resolveInside(base, migration.archive));
            if (hash(archive) !== migration.sourceSha256) throw new Error('原始快照哈希不匹配');
            const parts = [];
            for (const [index, entry] of migration.entries.entries()) {
                if (entry.order !== index + 1) throw new Error('迁移来源顺序不连续');
                const file = resolveInside(base, entry.file);
                const bytes = await readFile(file);
                const original = bytes.subarray(entry.headerBytes);
                if (hash(original) !== entry.sha256) throw new Error('历史原文分片已变化；保留原文，在新案例写更正');
                if (!reachable.has(file)) throw new Error('历史分片未从索引可达');
                parts.push(original);
            }
            if (hash(Buffer.concat(parts)) !== migration.sourceSha256) throw new Error('分片无法完整重建迁移原文');
        } catch (e) { errors.push(`迁移完整性：${e.message}`); }
    }
    const operationMigration = path.join(localRoot, 'operation-migration.json');
    let mappedSources = 0;
    if (historicalFiles.length && !await exists(operationMigration)) errors.push('缺失历史 operation 迁移清单');
    if (await exists(operationMigration)) {
        try {
            const migration = JSON.parse(await readFile(operationMigration, 'utf8'));
            if (migration.version !== 1 || migration.historicalCount !== historicalFiles.length) throw new Error('历史条目数量不一致');
            const seen = new Set();
            for (const entry of migration.entries) {
                const file = resolveInside(root, entry.source);
                if (!file.startsWith(localRoot + path.sep) || seen.has(file)) throw new Error('迁移来源重复或越界');
                seen.add(file);
                if (hash(await readFile(file)) !== entry.sha256) throw new Error('来源已变化；迁移证据保持不变，更正使用新记录');
                if (!entry.operations?.length || new Set(entry.operations).size !== entry.operations.length) throw new Error('来源缺少唯一 operation 映射');
                for (const key of entry.operations) {
                    const op = operations.get(key);
                    if (!op) throw new Error('来源映射到不存在的 operation');
                    const evidence = path.join(localRoot, 'systems', key.split('/')[0], 'operations', key.split('/')[1] + '.md');
                    if (!graph.get(op.file)?.includes(evidence) || !graph.get(evidence)?.includes(file)) throw new Error('来源未由所登记 operation 的证据入口引用');
                }
            }
            for (const file of historicalFiles) if (!seen.has(file)) throw new Error('历史案例未迁入 operation');
            mappedSources = seen.size;
        } catch (e) { errors.push(`操作迁移覆盖：${e.message}`); }
    }
    return { errors, sharedFiles: shared.length, privateFiles: privateFiles.length, systems: systems.size, operations: operations.size, mappedSources };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const result = await validateKnowledge(process.argv[2] ?? defaultRoot);
        if (result.errors.length) {
            for (const error of result.errors) console.error(error);
            process.exitCode = 1;
        } else console.log(`知识校验通过：${result.systems} 个系统，${result.operations} 个操作，${result.mappedSources} 个迁移来源；${result.sharedFiles} 份公开文档，${result.privateFiles} 份私有文件；状态、索引、链接与迁移完整性通过。`);
    } catch (e) { console.error(`知识校验失败：${e.message}`); process.exitCode = 1; }
}
