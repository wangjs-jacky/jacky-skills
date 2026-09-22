import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const SCRIPT = join(process.cwd(), 'harness/ego-ops/scripts/validate-knowledge.mjs');

const OPERATION_SECTIONS = [
    ['目标', '验证一个脱敏的操作目标。'],
    ['前置条件与授权', '用户已经明确授权本次可执行范围。'],
    ['入口', '从产品导航进入目标功能。'],
    ['已验证步骤', '观察页面后执行稳定的语义操作。'],
    ['检查点', '确认页面状态发生预期变化。'],
    ['成功标准', '成功提示或读回结果与目标一致。'],
    ['失败模式与恢复', '已验证的失败现象及恢复方式。'],
    ['验证证据', '记录脱敏的页面结果和验证日期。'],
];

async function makeValidKnowledge() {
    const root = await mkdtemp(join(tmpdir(), 'ego-ops-knowledge-'));
    const siteRoot = join(root, 'references/sites/example-product');
    const operationsRoot = join(siteRoot, 'operations');
    await mkdir(operationsRoot, { recursive: true });

    await writeFile(
        join(root, 'references/sites/index.md'),
        `---\nformat: ego-site-index\nupdated: 2026-09-22\n---\n\n# 站点索引\n\n| 站点 | 域名 | 别名 | 最近验证 | 参考文档 |\n|---|---|---|---|---|\n| [example-product](example-product/index.md) | example.test | 示例产品 | 2026-09-22 | [站点索引](example-product/index.md) |\n`,
        'utf8',
    );
    await writeFile(
        join(siteRoot, 'index.md'),
        `---\nsite: example-product\ndomains:\n  - example.test\naliases:\n  - 示例产品\nupdated: 2026-09-22\n---\n\n# example-product\n\n## 平台特征\n\n页面使用稳定的语义导航，加载完成后显示明确的状态区域。\n\n## 操作目录\n\n| 操作 | 标题 | 风险 | 最近验证 | 参考文档 |\n|---|---|---|---|---|\n| [publish-report](operations/publish-report.md) | 发布报告 | medium | 2026-09-22 | [操作](operations/publish-report.md) |\n\n## 站点级陷阱\n\n动态内容必须在每次关键点击后重新观察。\n`,
        'utf8',
    );
    const sections = OPERATION_SECTIONS.map(([title, body]) => `## ${title}\n\n${body}`).join('\n\n');
    await writeFile(
        join(operationsRoot, 'publish-report.md'),
        `---\nsite: example-product\noperation: publish-report\ntitle: 发布报告\nrisk: medium\nlast_verified: 2026-09-22\n---\n\n# 发布报告\n\n${sections}\n`,
        'utf8',
    );
    return root;
}

function runValidator(root) {
    return spawnSync(process.execPath, [SCRIPT, '--root', root], { encoding: 'utf8' });
}

test('完整知识库通过校验并报告站点与 operation 数量', async () => {
    const root = await makeValidKnowledge();
    const result = runValidator(root);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /已校验 1 个站点、1 个 operation/);
});

test('根索引、站点索引和 operation 缺少 frontmatter 时失败', async () => {
    for (const target of ['root', 'site', 'operation']) {
        const root = await makeValidKnowledge();
        const path = target === 'root'
            ? join(root, 'references/sites/index.md')
            : target === 'site'
                ? join(root, 'references/sites/example-product/index.md')
                : join(root, 'references/sites/example-product/operations/publish-report.md');
        const content = await readFile(path, 'utf8');
        await writeFile(path, content.replace(/^---\n[\s\S]*?\n---\n/, ''), 'utf8');

        const result = runValidator(root);
        assert.notEqual(result.status, 0, target);
        assert.match(`${result.stdout}${result.stderr}`, /frontmatter|YAML/i, target);
    }
});

test('断链、未登记 operation 和缺少章节会一次列出错误', async () => {
    const root = await makeValidKnowledge();
    const rootIndexPath = join(root, 'references/sites/index.md');
    const siteIndexPath = join(root, 'references/sites/example-product/index.md');
    const operationPath = join(root, 'references/sites/example-product/operations/publish-report.md');

    const rootIndex = await readFile(rootIndexPath, 'utf8');
    await writeFile(rootIndexPath, rootIndex.replaceAll('example-product/index.md', 'missing-site/index.md'), 'utf8');
    const siteIndex = await readFile(siteIndexPath, 'utf8');
    await writeFile(siteIndexPath, siteIndex.replaceAll('operations/publish-report.md', 'operations/missing.md'), 'utf8');
    const operation = await readFile(operationPath, 'utf8');
    await writeFile(operationPath, operation.replace('## 检查点', '## 检查点缺失'), 'utf8');

    const result = runValidator(root);
    const output = `${result.stdout}${result.stderr}`;
    assert.notEqual(result.status, 0);
    assert.match(output, /断链|不存在/);
    assert.match(output, /未登记/);
    assert.match(output, /章节|检查点/);
});

test('占位内容和敏感认证材料会失败', async () => {
    const root = await makeValidKnowledge();
    const operationPath = join(root, 'references/sites/example-product/operations/publish-report.md');
    const operation = await readFile(operationPath, 'utf8');
    await writeFile(
        operationPath,
        `${operation}\n本步骤仍为必填。\nAuthorization: Bearer redacted-example\n`,
        'utf8',
    );

    const result = runValidator(root);
    const output = `${result.stdout}${result.stderr}`;
    assert.notEqual(result.status, 0);
    assert.match(output, /占位|必填/);
    assert.match(output, /敏感|Authorization/);
});

test('站点与 operation 的目录名、frontmatter 和索引登记必须一致', async () => {
    const root = await makeValidKnowledge();
    const siteIndexPath = join(root, 'references/sites/example-product/index.md');
    const operationPath = join(root, 'references/sites/example-product/operations/publish-report.md');
    const siteIndex = await readFile(siteIndexPath, 'utf8');
    const operation = await readFile(operationPath, 'utf8');
    await writeFile(siteIndexPath, siteIndex.replace('site: example-product', 'site: another-site'), 'utf8');
    await writeFile(operationPath, operation.replace('operation: publish-report', 'operation: another-operation'), 'utf8');

    const result = runValidator(root);
    const output = `${result.stdout}${result.stderr}`;
    assert.notEqual(result.status, 0);
    assert.match(output, /目录|frontmatter|不一致/);
});

test('站点索引缺少必需章节时失败', async () => {
    const root = await makeValidKnowledge();
    const siteIndexPath = join(root, 'references/sites/example-product/index.md');
    const siteIndex = await readFile(siteIndexPath, 'utf8');
    await writeFile(siteIndexPath, siteIndex.replace('## 站点级陷阱', '## 站点级事实'), 'utf8');

    const result = runValidator(root);
    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}${result.stderr}`, /站点索引|章节|站点级陷阱/);
});
