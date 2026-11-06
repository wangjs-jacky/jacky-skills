#!/usr/bin/env node
// Local project setup/history only. This module never calls a cloud CLI or API.
import { mkdir, lstat, readFile, realpath, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashFile, keys, resourcePath, sourceFile } from './resources.mjs';
import { checkSite, planSite } from './site.mjs';
import { diagnostic, problem, readJSON } from './diagnostics.mjs';

const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value);
const inside = (root, path) => { const rel = relative(root, path); return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + sep)); };
async function destination(path) {
  const parts = []; let current = resolve(path);
  for (;;) {
    try { return join(await realpath(current), ...parts.reverse()); }
    catch (error) { if (error.code !== 'ENOENT') throw error; parts.push(basename(current)); current = dirname(current); }
  }
}
export async function initProject(output, { publicDir, name, files, accountId, plan } = {}) {
  if (!publicDir || !name || !files?.length) throw problem('INIT_INPUT_REQUIRED', '初始化需要公开目录、Worker 名称和显式文件清单。', '使用 project.mjs init NEW_DIR --public-dir DIR --name NAME --file index.html；每个必要文件重复 --file。');
  const root = await realpath(resolve(publicDir)); const target = await destination(output);
  if (inside(root, target)) throw problem('PRIVATE_PROJECT_LOCATION', '项目管理目录不能放进公开根目录。', '将项目目录放在 public/dist 旁边，例如 .publish；其中的配置、证据和回执不上传。');
  await mkdir(dirname(target), { recursive: true });
  await mkdir(target); // Existing project/data must never be replaced.
  try {
    const config = { version: 1, publicDir: relative(target, root), files, worker: { name, compatibilityDate: new Date().toISOString().slice(0, 10), ...(accountId && { accountId }), ...(plan && { plan }) } };
    await writeFile(join(target, 'site.json'), JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
    await planSite(join(target, 'site.json'));
    await writeFile(join(target, 'index.md'), `# ${name} 发布项目\n\n唯一页面配置：[site.json](site.json)。首次与日常发布按 Skill 的 references/release.md。\n\n- releases/：site prepare 生成的新快照，旧快照保留。\n- evidence/：官方 CLI 活动版本和字节核验的原始非敏感结果。\n- receipts/：project record 保存的不可覆盖本地回执。\n- resources.json：仅需要 OSS/内容寻址资源时创建，清单由构建消费；账号和资源归本人。\n\n查看本地历史：node "$SKILL_DIR/scripts/project.mjs" status PROJECT_DIR。该命令不查询当前云状态。\n\n以上目录按实际使用创建；管理目录、原件及凭据都不加入公开 files。\n`, { flag: 'wx' });
    return { project: target, config: join(target, 'site.json'), pagePublished: false, cloudQueried: false };
  } catch (error) { await rm(target, { recursive: true, force: true }); throw error; }
}
async function projectFile(root, path) { resourcePath(path, '项目证据'); return sourceFile(root, path); }
async function privateReceipts(root) {
  const path = join(root, 'receipts'); await mkdir(path, { recursive: true });
  const stat = await lstat(path);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw problem('UNSAFE_RECEIPTS', '回执目录不是独立普通目录。', '选择项目内没有符号链接的 receipts 目录。');
  return path;
}
function originURL(value) {
  let url; try { url = new URL(value); } catch { throw problem('INVALID_ORIGIN', '字节证据缺少正式 HTTPS origin。', '保存真实 site verify 的 JSON 结果。'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw problem('INVALID_ORIGIN', '回执 origin 必须为无凭据的 HTTPS 站点根地址。', '不要保存签名 URL 或认证参数。');
  return url.origin;
}
export async function recordPublication(project, evidencePath, name) {
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(name)) throw problem('INVALID_RECEIPT_NAME', '回执名只用小写字母、数字和连字符。', '选择新的名称，例如 release-001 或 rollback-002。');
  const root = await realpath(project), spec = await readJSON(evidencePath, '发布证据说明');
  keys(spec, ['version', 'release', 'deployment', 'verification', 'resourcesManifest', 'previousReceipt'], '发布证据说明');
  if (spec.version !== 1) throw problem('EVIDENCE_VERSION', '证据说明需要 version=1。', '按发布流程生成本地证据说明。');
  resourcePath(spec.release, '快照');
  const releaseManifestPath = await projectFile(root, spec.release + '/release-manifest.json');
  const release = join(root, spec.release), manifest = await checkSite(release);
  const current = await readJSON(await projectFile(root, 'site.json'), '页面配置');
  if (manifest.worker.name !== current.worker?.name) throw problem('WORKER_MISMATCH', '快照 Worker 与项目不一致。', '选择此项目的真实快照，跨项目不能混用发布记录。');
  const deploymentPath = await projectFile(root, spec.deployment), verificationPath = await projectFile(root, spec.verification);
  const deployment = await readJSON(deploymentPath, '活动版本证据'), verification = await readJSON(verificationPath, '字节证据');
  const versions = deployment.versions;
  if (!Array.isArray(versions) || versions.length !== 1 || versions[0].percentage !== 100 || !uuid(versions[0].version_id)) throw problem('INCOMPLETE_DEPLOYMENT', '活动版本证据需要一个真实 UUID 且流量100%。', '保存对精确快照配置执行 deployments status --json 的真实结果，候选上传日志不够。');
  const origin = originURL(verification.origin);
  const releaseManifestSHA256 = (await hashFile(releaseManifestPath)).sha256;
  const checked = new Map((verification.files || []).map(e => [e.key, e]));
  if (verification.bytesVerified !== true || verification.releaseManifestSHA256 !== releaseManifestSHA256 || verification.complete === false || verification.failed?.length || verification.notAttempted?.length || verification.files?.length !== manifest.files.length || checked.size !== manifest.files.length || manifest.files.some(e => {
    const v = checked.get(e.source); return !v || v.verified !== true || v.bytes !== e.bytes || v.sha256 !== e.sha256 || (v.contentType !== e.contentType && !(e.contentType === 'application/javascript' && v.contentType === 'text/javascript'));
  })) throw problem('INCOMPLETE_BYTES', '字节证据未以 SHA 绑定此快照的全部文件。', '对该完整 release 用当前 site verify 重新核验并保存成功 JSON；旧无摘要记录、失败与未尝试项不能算通过。');
  let resources = null, previous = null;
  if (spec.resourcesManifest) {
    const path = await projectFile(root, spec.resourcesManifest); const m = await readJSON(path, '资源清单');
    keys(m, ['version', 'files'], '资源清单');
    if (m.version !== 1 || !Array.isArray(m.files)) throw problem('INVALID_MANIFEST', '资源清单无效。', '选择此版实际构建消费的清单。');
    resources = { path: spec.resourcesManifest, sha256: (await hashFile(path)).sha256, files: m.files.length, cloudVerified: false };
  }
  if (spec.previousReceipt) {
    const path = await projectFile(root, spec.previousReceipt), receipt = await readJSON(path, '旧回执');
    if (!uuid(receipt.activeVersion) || receipt.worker !== manifest.worker.name || receipt.origin !== origin) throw problem('PREVIOUS_TARGET_MISMATCH', '旧回执不属于相同 Worker 和站点。', '选择此目标的实际旧回执；首次发布可以不填。');
    previous = { receipt: spec.previousReceipt, version: receipt.activeVersion, release: receipt.release, sha256: (await hashFile(path)).sha256 };
  }
  const receipt = { version: 1, recordedAt: new Date().toISOString(), worker: manifest.worker.name, origin, activeVersion: versions[0].version_id,
    release: spec.release, releaseManifestSHA256,
    deploymentEvidence: { path: spec.deployment, sha256: (await hashFile(deploymentPath)).sha256 },
    bytesEvidence: { path: spec.verification, sha256: (await hashFile(verificationPath)).sha256, files: checked.size },
    resources, previous, evidenceRecorded: true, cloudQueried: false, browserVerified: false };
  const path = join(await privateReceipts(root), name + '.json'); await writeFile(path, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  return { receipt: path, activeVersion: receipt.activeVersion, evidenceRecorded: true, cloudQueried: false, browserVerified: false };
}
export async function projectStatus(project) {
  const root = await realpath(project), site = await readJSON(await projectFile(root, 'site.json'), '页面配置');
  let entries;
  try {
    const stat = await lstat(join(root, 'receipts'));
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw problem('UNSAFE_RECEIPTS', 'receipts 不允许是符号链接或其他文件。', '使用此项目内独立的普通目录，不读取其他目录。');
    entries = await readdir(join(root, 'receipts'), { withFileTypes: true });
  }
  catch (error) { if (error.code !== 'ENOENT') throw error; entries = []; }
  const receipts = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.name.endsWith('.json')) continue;
    const r = await readJSON(await projectFile(root, 'receipts/' + entry.name), '回执');
    receipts.push({ receipt: 'receipts/' + entry.name, recordedAt: r.recordedAt, activeVersion: r.activeVersion, release: r.release, origin: r.origin, previous: r.previous });
  }
  return { worker: site.worker?.name, cloudQueried: false, currentCloudStateVerified: false, receipts,
    nextStep: receipts.length ? '这些是本地历史；上线或回退前通过官方 CLI 单次读取精确目标，核对基线。' : '尚无本地发布回执；先按 release.md 准备、发布和验收，不表示云目标不存在。' };
}
const usage = '用法：node project.mjs init NEW_DIR --public-dir DIR --name WORKER --file index.html [--file FILE ...] [--account-id ID] [--plan free|paid]\nnode project.mjs record PROJECT EVIDENCE_JSON NEW_NAME\nnode project.mjs status PROJECT\n全部为本地操作，不安装工具、不登录、不部署、不建桶。';
export async function main(args) {
  const [command, path, ...rest] = args;
  if (!command || command === '--help') { console.log(usage); return; }
  let result;
  if (command === 'init' && path) {
    const options = { files: [] }, fields = { '--public-dir': 'publicDir', '--name': 'name', '--account-id': 'accountId', '--plan': 'plan' };
    for (let i = 0; i < rest.length; i += 2) {
      const flag = rest[i], value = rest[i + 1];
      if (!value || value.startsWith('--')) throw problem('INIT_OPTIONS', '初始化选项缺少值。', usage);
      if (flag === '--file') options.files.push(value);
      else if (fields[flag] && options[fields[flag]] === undefined) options[fields[flag]] = value;
      else throw problem('INIT_OPTIONS', '初始化选项不支持或重复。', usage);
    }
    result = await initProject(resolve(path), options);
  } else if (command === 'record' && path && rest.length === 2) result = await recordPublication(resolve(path), resolve(rest[0]), rest[1]);
  else if (command === 'status' && path && !rest.length) result = await projectStatus(resolve(path));
  else throw problem('INVALID_OPTIONS', '命令参数不匹配。', usage);
  console.log(JSON.stringify(result, null, 2));
}
if (process.argv[1] && await realpath(resolve(process.argv[1])).catch(() => '') === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { const d = diagnostic(error); console.error(`失败 [${d.code}]：${d.message} 下一步：${d.nextStep}`); process.exitCode = 1; });
}
