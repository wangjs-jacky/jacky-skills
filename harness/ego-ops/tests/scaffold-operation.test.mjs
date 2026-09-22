import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const SCRIPT = join(process.cwd(), 'harness/ego-ops/scripts/scaffold-operation.mjs');

async function makeRoot() {
    const temp = await mkdtemp(join(tmpdir(), 'ego-ops-scaffold-'));
    const root = join(temp, 'skill');
    await stat(temp);
    return { temp, root };
}

function runScaffold(root, overrides = {}) {
    const values = {
        site: 'Example Product',
        domain: 'example.test',
        aliases: ['示例产品', 'Example'],
        operation: 'publish-report',
        title: '发布报告',
        intent: '验证报告已经生成',
        risk: 'medium',
        date: '2026-09-22',
        ...overrides,
    };
    const args = [SCRIPT, '--root', root, '--site', values.site, '--domain', values.domain];
    for (const alias of values.aliases ?? []) args.push('--alias', alias);
    args.push(
        '--operation', values.operation,
        '--title', values.title,
        '--intent', values.intent,
        '--risk', values.risk,
        '--date', values.date,
    );
    return spawnSync(process.execPath, args, { encoding: 'utf8' });
}

test('首次运行会创建根索引、站点索引和 operation 骨架', async () => {
    const { root } = await makeRoot();
    const result = runScaffold(root);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /已创建|已创建并索引/);

    const rootIndex = await readFile(join(root, 'references/sites/index.md'), 'utf8');
    const siteIndex = await readFile(join(root, 'references/sites/example-product/index.md'), 'utf8');
    const operation = await readFile(
        join(root, 'references/sites/example-product/operations/publish-report.md'),
        'utf8',
    );

    assert.match(rootIndex, /updated: 2026-09-22/);
    assert.match(rootIndex, /\[example-product\]\(example-product\/index\.md\)/);
    assert.match(siteIndex, /site: example-product/);
    assert.match(siteIndex, /domains:\n\s*- example\.test/);
    assert.match(siteIndex, /\[publish-report\]\(operations\/publish-report\.md\)/);
    assert.match(operation, /operation: publish-report/);
    assert.match(operation, /title: 发布报告/);
    assert.match(operation, /last_verified: 2026-09-22/);
    assert.match(operation, /## 目标/);
    assert.match(operation, /必填/);
});

test('重复运行不产生重复索引行，只刷新日期并保留既有 operation 正文', async () => {
    const { root } = await makeRoot();
    assert.equal(runScaffold(root).status, 0);

    const operationPath = join(root, 'references/sites/example-product/operations/publish-report.md');
    const original = await readFile(operationPath, 'utf8');
    await writeFile(operationPath, `${original}\n已验证正文保留。\n`, 'utf8');

    const result = runScaffold(root, {
        title: '不应覆盖的标题',
        intent: '不应覆盖的目标',
        date: '2026-09-23',
    });

    assert.equal(result.status, 0, result.stderr);
    const rootIndex = await readFile(join(root, 'references/sites/index.md'), 'utf8');
    const siteIndex = await readFile(join(root, 'references/sites/example-product/index.md'), 'utf8');
    const operation = await readFile(operationPath, 'utf8');

    assert.equal(rootIndex.match(/\[example-product\]\(example-product\/index\.md\)/g)?.length, 1);
    assert.equal(siteIndex.match(/\[publish-report\]\(operations\/publish-report\.md\)/g)?.length, 1);
    assert.match(rootIndex, /updated: 2026-09-23/);
    assert.match(siteIndex, /updated: 2026-09-23/);
    assert.match(operation, /last_verified: 2026-09-23/);
    assert.match(operation, /title: 发布报告/);
    assert.match(operation, /已验证正文保留。/);
    assert.doesNotMatch(operation, /不应覆盖的标题/);
});

test('拒绝路径穿越和非法 slug，不在 root 外写入', async () => {
    const { temp, root } = await makeRoot();
    const traversal = runScaffold(root, { site: '../outside' });

    assert.notEqual(traversal.status, 0);
    assert.match(`${traversal.stdout}${traversal.stderr}`, /site|slug|路径/i);

    const illegal = runScaffold(root, { operation: '../../outside' });
    assert.notEqual(illegal.status, 0);
    assert.match(`${illegal.stdout}${illegal.stderr}`, /operation|slug|路径/i);

    await assert.rejects(stat(join(temp, 'outside')));
});

test('拒绝不支持的风险级别、日期和未知参数', async () => {
    const { root } = await makeRoot();
    for (const overrides of [
        { risk: 'critical' },
        { date: '2026-02-30' },
    ]) {
        const result = runScaffold(root, overrides);
        assert.notEqual(result.status, 0);
        assert.match(`${result.stdout}${result.stderr}`, /参数|risk|风险|日期/i);
    }

    const unknown = spawnSync(process.execPath, [SCRIPT, '--root', root, '--unknown', 'x'], {
        encoding: 'utf8',
    });
    assert.notEqual(unknown.status, 0);
    assert.match(`${unknown.stdout}${unknown.stderr}`, /未知|参数/);
});

test('既有 operation 缺少 frontmatter 时失败且不修改正文', async () => {
    const { root } = await makeRoot();
    assert.equal(runScaffold(root).status, 0);
    const operationPath = join(root, 'references/sites/example-product/operations/publish-report.md');
    const original = await readFile(operationPath, 'utf8');
    const body = original.replace(/^---\n[\s\S]*?\n---\n/, '') + '\nlast_verified: 1999-01-01\n';
    await writeFile(operationPath, body, 'utf8');

    const result = runScaffold(root, { date: '2026-09-23' });

    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /frontmatter|字段/);
    assert.equal(await readFile(operationPath, 'utf8'), body);
});
