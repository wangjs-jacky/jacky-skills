#!/usr/bin/env node
// No raw CLI output is printed: whoami or OSS errors may contain account data.
import { readFile, realpath } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createPlan } from './resources.mjs';
import { planSite } from './site.mjs';

function run(binary, args) {
  return /\.(?:mjs|cjs|js)$/.test(binary)
    ? spawnSync(process.execPath, [binary, ...args], { encoding: 'utf8', timeout: 60_000, maxBuffer: 1024 * 1024 })
    : spawnSync(binary, args, { encoding: 'utf8', timeout: 60_000, maxBuffer: 1024 * 1024 });
}

export async function diagnose(configPath, { wrangler, auth = false, images = false } = {}) {
  const input = JSON.parse(await readFile(configPath, 'utf8'));
  const checks = [{ name: 'node', ok: Number(process.versions.node.split('.')[0]) >= 22, detail: '需要 Node.js 22+。' }];
  let plan;
  if (input.storage) plan = await createPlan(configPath);
  else plan = await planSite(configPath);
  checks.push({ name: 'config', ok: true, detail: '显式公开文件、类型和目标配置可用；不证明云权限。' });
  if (input.worker) {
    const local = join(dirname(resolve(configPath)), 'node_modules/.bin/wrangler');
    const binary = wrangler || (existsSync(local) ? local : 'wrangler');
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
      const args = ['oss', 'stat', `oss://${s.bucket}/${plan.manifest.files[0].key}`, '-e', `https://oss-${s.region}.aliyuncs.com`, '--region', s.region];
      if (s.profile) args.push('--profile', s.profile);
      const r = run('aliyun', args);
      const text = `${r.stdout || ''}\n${r.stderr || ''}`;
      const accessible = !r.error && (r.status === 0 || /ErrorCode=NoSuchKey\b/.test(text));
      checks.push({ name: 'oss-target-read', ok: accessible, detail: accessible ? '精确对象读请求可执行；未查询 ListBuckets，写入/公开性留给本次 publish 验证。' : '检查已知桶的地域 Endpoint、profile 与此前缀权限；没有改权限或建桶。' });
    }
  }
  if (images) {
    const r = run('cwebp', ['-version']);
    checks.push({ name: 'cwebp', ok: !r.error && r.status === 0, detail: '仅图片派生分支需要 WebP 官方编码器。' });
  }
  const authChecks = checks.filter(x => ['cloudflare-auth', 'oss-target-read'].includes(x.name));
  return { ready: checks.every(x => x.ok), authenticationRequested: auth, authenticationChecked: authChecks.length > 0 && authChecks.every(x => x.ok), cloudWriteChecked: false, checks };
}

export async function main(args) {
  if (!args.length || args[0] === '--help') { console.log('用法：node doctor.mjs CONFIG [--wrangler CLI] [--auth] [--images]\n默认本地检查；--auth 各做一次官方只读身份/目标请求，不打印认证内容，不轮询。'); return; }
  const [config, ...rest] = args;
  const options = {}, seen = new Set();
  for (let i = 0; i < rest.length; i++) {
    const flag = rest[i];
    if (seen.has(flag)) throw new Error('重复选项。');
    seen.add(flag);
    if (flag === '--auth') options.auth = true;
    else if (flag === '--images') options.images = true;
    else if (flag === '--wrangler' && rest[i + 1]) options.wrangler = rest[++i];
    else throw new Error('不支持的选项。');
  }
  const result = await diagnose(resolve(config), options);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ready) process.exitCode = 1;
}
if (process.argv[1] && await realpath(resolve(process.argv[1])).catch(() => '') === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(() => { console.error('失败：配置/公开文件不可读或参数无效；未执行云写入，不输出认证内容。'); process.exitCode = 1; });
}
