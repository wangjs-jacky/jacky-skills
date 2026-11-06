#!/usr/bin/env node
// No raw CLI output is printed: whoami or OSS errors may contain account data.
import { realpath } from 'node:fs/promises';
import { dirname, join, resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createPlan } from './resources.mjs';
import { planSite } from './site.mjs';
import { ossCommand } from './resources.mjs';
import { diagnostic, problem, readJSON } from './diagnostics.mjs';

function run(binary, args) {
  return /\.(?:mjs|cjs|js)$/.test(binary)
    ? spawnSync(process.execPath, [binary, ...args], { encoding: 'utf8', timeout: 60_000, maxBuffer: 1024 * 1024 })
    : spawnSync(binary, args, { encoding: 'utf8', timeout: 60_000, maxBuffer: 1024 * 1024 });
}
function localWrangler(start, publicRoot) {
  let boundary = start;
  if (publicRoot) {
    while (true) {
      const rel = relative(boundary, publicRoot);
      if (!isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + sep)) break;
      if (dirname(boundary) === boundary) { boundary = start; break; }
      boundary = dirname(boundary);
    }
    if (dirname(boundary) === boundary) boundary = start;
  }
  for (let dir = start; ; dir = dirname(dir)) {
    const found = [join(dir, 'node_modules/wrangler/bin/wrangler.js'), join(dir, 'node_modules/.bin/wrangler')].find(existsSync);
    if (found) return found;
    if (dir === boundary || existsSync(join(dir, '.git')) || existsSync(join(dir, 'package.json'))) return 'wrangler';
  }
}

export async function diagnose(configPath, { wrangler, auth = false, images = false, preflight = false, oss = false } = {}) {
  if (preflight && auth) throw problem('AUTH_NEEDS_CONFIG', '无配置预检不执行认证。', '先用 project.mjs init 生成配置，再对精确目标运行 doctor CONFIG --auth。');
  const checks = [{ name: 'node', ok: Number(process.versions.node.split('.')[0]) >= 22, detail: '需要 Node.js 22+。' }];
  let plan, input;
  const result = () => {
    const authChecks = checks.filter(x => ['cloudflare-auth', 'oss-target-read'].includes(x.name));
    return { ready: checks.every(x => x.ok), configChecked: !preflight && !!plan, authenticationRequested: auth,
      authenticationChecked: authChecks.length > 0 && authChecks.every(x => x.ok), cloudWriteChecked: false,
      nextStep: checks.find(x => !x.ok)?.nextStep || checks.find(x => !x.ok)?.detail || (preflight ? '按公开文件范围运行 project.mjs init；尚未检查身份或部署。' : '本地条件通过；按发布流程分别验证实际身份、权限和公开结果。'), checks };
  };
  if (preflight) input = { worker: {}, ...(oss && { storage: { provider: 'oss' } }) };
  else {
    try {
      input = await readJSON(configPath);
      plan = input.storage ? await createPlan(configPath) : await planSite(configPath);
      checks.push({ name: 'config', ok: true, detail: '显式公开文件、类型和目标配置可用；不证明云权限。' });
    } catch (error) {
      const d = diagnostic(error); checks.push({ name: 'config', ok: false, detail: d.message, code: d.code, nextStep: d.nextStep }); return result();
    }
  }
  if (input.worker) {
    const project = await realpath(configPath ? dirname(resolve(configPath)) : process.cwd());
    const binary = wrangler || localWrangler(project, plan?.root);
    const version = run(binary, ['--version']);
    const ok = !version.error && version.status === 0;
    checks.push({ name: 'wrangler', ok, detail: ok ? '官方 CLI 可执行。' : '安装项目本地 wrangler，或用 --wrangler 指定已有入口；未自动安装。' });
    if (auth && ok) {
      const r = run(binary, ['whoami']);
      const text = `${r.stdout || ''}\n${r.stderr || ''}`;
      const identityOK = !r.error && r.status === 0 && !/not (?:authenticated|logged in)|authentication (?:failed|required)/i.test(text) &&
        /account id|account_id/i.test(text);
      const targetOK = identityOK && (!input.worker.accountId || text.includes(input.worker.accountId));
      checks.push({ name: 'cloudflare-auth', ok: targetOK, detail: targetOK ? 'CLI 身份可读且目标账号匹配（如有指定）；部署权限仍由 dry-run/上传验证。' : '在本机运行 wrangler login / whoami，核对目标账号；不要把 Token 发到聊天。' });
    }
  }
  if (input.storage?.provider === 'oss') {
    const version = run('aliyun', ['version']);
    const ok = !version.error && version.status === 0;
    checks.push({ name: 'aliyun', ok, detail: ok ? '官方 CLI 可执行。' : '安装阿里云 CLI，使用自己的官方配置。' });
    if (auth && ok) {
      const s = plan.config.storage;
      const r = ossCommand(s, 'stat', [`oss://${s.bucket}/${plan.manifest.files[0].key}`]);
      const accessible = r.ok || r.missing;
      checks.push({ name: 'oss-target-read', ok: accessible, code: r.ok ? 'OBJECT_READABLE' : r.failure.code,
        detail: accessible ? '精确对象读请求可执行；未查询 ListBuckets，写入/公开性留给本次 publish 验证。' : r.failure.message, nextStep: accessible ? '继续核对实际写入与匿名公开性。' : r.failure.nextStep });
    }
  }
  if (images) {
    const r = run('cwebp', ['-version']);
    checks.push({ name: 'cwebp', ok: !r.error && r.status === 0, detail: '仅图片派生分支需要 WebP 官方编码器。' });
  }
  return result();
}

export async function main(args) {
  if (!args.length || args[0] === '--help') { console.log('用法：node doctor.mjs CONFIG [--wrangler CLI] [--auth] [--images]\n或：node doctor.mjs --preflight [--oss] [--images] [--wrangler CLI]\n预检不需要配置、只检查本地工具版本；--auth 需配置，各做一次官方只读身份/目标请求，不打印认证内容，不轮询。'); return; }
  const config = args[0].startsWith('--') ? undefined : args[0];
  const rest = config ? args.slice(1) : args;
  const options = {}, seen = new Set();
  for (let i = 0; i < rest.length; i++) {
    const flag = rest[i];
    if (seen.has(flag)) throw new Error('重复选项。');
    seen.add(flag);
    if (flag === '--auth') options.auth = true;
    else if (flag === '--preflight') options.preflight = true;
    else if (flag === '--oss') options.oss = true;
    else if (flag === '--images') options.images = true;
    else if (flag === '--wrangler' && rest[i + 1]) options.wrangler = rest[++i];
    else throw new Error('不支持的选项。');
  }
  if ((!config && !options.preflight) || (config && options.preflight) || (options.oss && !options.preflight)) throw problem('INVALID_OPTIONS', '预检/配置选项不匹配。', '先运行 doctor.mjs --help 选择一种模式。');
  const result = await diagnose(config && resolve(config), options);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ready) process.exitCode = 1;
}
if (process.argv[1] && await realpath(resolve(process.argv[1])).catch(() => '') === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { const d = diagnostic(error); console.error(`失败 [${d.code}]：${d.message} 下一步：${d.nextStep} 未执行云写入。`); process.exitCode = 1; });
}
