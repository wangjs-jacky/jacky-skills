import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { validateKnowledge } from '../scripts/validate-knowledge.mjs';

async function fixture(t) {
    const root = await mkdtemp(path.join(tmpdir(), 'happy-ops-knowledge-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    execFileSync('git', ['init', '--quiet', root]);
    await mkdir(path.join(root, 'references'));
    await writeFile(path.join(root, 'SKILL.md'), '[索引](index.md)\n[可选本机入口](experience.local.md)');
    await writeFile(path.join(root, 'index.md'), '[发布](references/release.md)');
    await writeFile(path.join(root, 'references/release.md'), '# 发布\n无私有值。');
    await write(root, 'index.md', '[发布](references/release.md)\n[系统](references/systems/index.md)');
    await write(root, 'references/systems/index.md', '[Web](web/index.md)');
    await write(root, 'references/systems/web/index.md', systemText);
    await write(root, 'references/systems/web/operations/deploy.md', operationText);
    return root;
}

const row = '| 发布 | [deploy](operations/deploy.md) | historical | none |';
const systemText = '# Web\n\n- system: web\n- aliases: browser\n\n## 系统共识\n\n浏览器入口。\n\n## 操作目录\n\n' + row + '\n\n## 共性陷阱\n\n版本需核实。\n\n## 本机环境\n\n[环境](../../../local/systems/web/index.md)';
const operationText = '# 发布\n\n- system: web\n- operation: deploy\n- status: historical\n- last_verified: none\n- risk: high\n- scope: 仅历史整理。\n\n'
    + ['目标', '前置条件与授权', '入口', '步骤与检查点', '成功标准', '失败模式与恢复'].map(name => '## ' + name + '\n\n具体约定。\n\n').join('')
    + '## 验证证据\n\n[证据](../../../../local/systems/web/operations/deploy.md)';

async function write(root, relative, text) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), text);
}

async function privateFixture(root) {
    await write(root, 'experience.local.md', '[私有](local/index.md)');
    await write(root, 'local/index.md', '[Web](systems/web/index.md)');
    await write(root, 'local/systems/web/index.md', row);
    await write(root, 'local/systems/web/operations/deploy.md', '[公共操作](../../../../references/systems/web/operations/deploy.md)');
}


test('可分享安装没有私有经验也能通过', async t => {
    const root = await fixture(t);
    assert.deepEqual((await validateKnowledge(root)).errors, []);
});

test('拒绝断链、孤立文档与越界链接', async t => {
    const root = await fixture(t);
    await writeFile(path.join(root, 'references/release.md'), '[缺失](missing.md)\n[越界](../../outside.md)');
    await writeFile(path.join(root, 'references/orphan.md'), '# 未路由');
    const errors = (await validateKnowledge(root)).errors.join('\n');
    assert.match(errors, /断链/);
    assert.match(errors, /未从入口可达/);
    assert.match(errors, /无效文件链接/);
});

test('拒绝公共文档中的本机路径', async t => {
    const root = await fixture(t);
    await writeFile(path.join(root, 'references/release.md'), ['/', 'Users', '/', 'private-example', '/release'].join(''));
    assert.match((await validateKnowledge(root)).errors.join('\n'), /疑似私有值/);
});

test('私有文件须被 Git 忽略', async t => {
    const root = await fixture(t);
    await privateFixture(root);
    assert.match((await validateKnowledge(root)).errors.join('\n'), /未被 Git 忽略/);
    await writeFile(path.join(root, '.gitignore'), 'local/\nexperience.local.md\n');
    assert.deepEqual((await validateKnowledge(root)).errors, []);
});


test('拒绝操作身份错配、无效日期和缺失验证范围', async t => {
    const root = await fixture(t);
    await write(root, 'references/systems/web/operations/deploy.md', operationText
        .replace('operation: deploy', 'operation: wrong')
        .replace('last_verified: none', 'last_verified: 2026-02-30')
        .replace('- scope: 仅历史整理。', ''));
    const errors = (await validateKnowledge(root)).errors.join('\n');
    assert.match(errors, /操作身份不匹配/);
    assert.match(errors, /无效验证日期/);
    assert.match(errors, /缺失风险或验证范围/);
});

test('已验证操作需要成功日期，索引必须同步状态', async t => {
    const root = await fixture(t);
    await write(root, 'references/systems/web/operations/deploy.md', operationText.replace('status: historical', 'status: verified'));
    let errors = (await validateKnowledge(root)).errors.join('\n');
    assert.match(errors, /已验证操作缺少成功日期/);
    assert.match(errors, /操作索引状态\/日期不一致/);
    await write(root, 'references/systems/web/operations/deploy.md', operationText.replace('status: historical', 'status: verified').replace('last_verified: none', 'last_verified: 2026-10-03'));
    await write(root, 'references/systems/web/index.md', systemText.replace('| historical | none |', '| verified | 2026-10-03 |'));
    assert.deepEqual((await validateKnowledge(root)).errors, []);
});

test('拒绝空成功标准或缺少证据链接', async t => {
    const root = await fixture(t);
    await write(root, 'references/systems/web/operations/deploy.md', operationText.replace('## 成功标准\n\n具体约定。', '## 成功标准\n').replace(/\[证据\]\([^)]+\)/, '尚无证据'));
    const errors = (await validateKnowledge(root)).errors.join('\n');
    assert.match(errors, /空章节/);
    assert.match(errors, /操作缺少证据链接/);
});

test('已有私有知识库不能静默跳过丢失的操作证据', async t => {
    const root = await fixture(t);
    await privateFixture(root);
    await write(root, '.gitignore', 'local/\nexperience.local.md\n');
    await rm(path.join(root, 'local/systems/web/operations/deploy.md'));
    const errors = (await validateKnowledge(root)).errors.join('\n');
    assert.match(errors, /断链/);
    assert.match(errors, /操作缺少私有证据入口/);
});

test('替代操作不能指向自身', async t => {
    const root = await fixture(t);
    await write(root, 'references/systems/web/operations/deploy.md', operationText.replace('status: historical', 'status: superseded\n- replacement: [替代](deploy.md)'));
    assert.match((await validateKnowledge(root)).errors.join('\n'), /替代操作无效/);
});

test('历史覆盖、来源哈希和 operation 证据关联都必须通过', async t => {
    const root = await fixture(t);
    await privateFixture(root);
    await write(root, '.gitignore', 'local/\nexperience.local.md\n');
    const source = '# 原始历史\n内容保持不变。\n';
    const digest = createHash('sha256').update(source).digest('hex');
    await write(root, 'local/history/case-one.md', source);
    await write(root, 'local/archive/original.md', source);
    await write(root, 'local/systems/web/operations/deploy.md', '[公共操作](../../../../references/systems/web/operations/deploy.md)\n[原文](../../../history/case-one.md)');
    await write(root, 'local/migration.json', JSON.stringify({sourceSha256:digest,archive:'archive/original.md',entries:[{order:1,file:'history/case-one.md',headerBytes:0,sha256:digest}]}));
    const migration = {version:1,historicalCount:1,entries:[{source:'local/history/case-one.md',sha256:digest,operations:['web/deploy']}]};
    await write(root, 'local/operation-migration.json', JSON.stringify(migration));
    assert.deepEqual((await validateKnowledge(root)).errors, []);
    migration.entries[0].operations=[];
    await write(root, 'local/operation-migration.json', JSON.stringify(migration));
    assert.match((await validateKnowledge(root)).errors.join('\n'), /来源缺少唯一 operation 映射/);
    migration.entries=[];
    await write(root, 'local/operation-migration.json', JSON.stringify(migration));
    assert.match((await validateKnowledge(root)).errors.join('\n'), /历史案例未迁入 operation/);
    await write(root, 'local/history/case-one.md', source+'篡改');
    assert.match((await validateKnowledge(root)).errors.join('\n'), /历史原文分片已变化/);
});
