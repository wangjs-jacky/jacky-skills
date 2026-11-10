/** Local source preferences. Task documents remain authoritative and read-only. */
import { homedir } from 'node:os';
import { dirname, isAbsolute, join } from 'node:path';
import { copyFile, mkdir, readFile, realpath, rename, rm, stat, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { discoverRoots } from './lib/records.js';

const settingsPath = config => config.sourcesFile || join(process.env.DSH_HOME || join(homedir(), '.dsh'), 'goal-first', 'sources.json');
function validate(value) {
  if (!value || typeof value.autoDiscover !== 'boolean' || !Array.isArray(value.extraRoots) || value.extraRoots.length > 16) {
    throw new Error('资料来源格式不正确，最多可配置 16 个额外目录。');
  }
  const defaultRoot = value.defaultRoot || null;
  if (value.defaultRoot !== undefined && value.defaultRoot !== null && typeof value.defaultRoot !== 'string') throw new Error('默认保存目录必须是路径。');
  for (const path of [...value.extraRoots, ...(defaultRoot ? [defaultRoot] : [])]) {
    if (typeof path !== 'string' || !path.trim() || path.length > 4096 || path.includes('\0') || (!isAbsolute(path.trim()) && !path.trim().startsWith('~/'))) {
      throw new Error('请输入完整的绝对目录，或以 ~/ 开头的目录。');
    }
  }
  return { autoDiscover: value.autoDiscover, extraRoots: value.extraRoots.map(path => path.trim()), defaultRoot: defaultRoot?.trim() || null };
}

async function preferences(config) {
  try {
    const path = settingsPath(config);
    if ((await stat(path)).size > 70000) throw new Error('资料来源配置过大。');
    return { ...validate(JSON.parse(await readFile(path, 'utf8'))), saved: true };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { ...validate({ autoDiscover: config.roots === undefined, extraRoots: config.roots || [] }), saved: false };
  }
}

async function normalizeRoot(path) {
  const expanded = path.startsWith('~/') ? join(homedir(), path.slice(2)) : path;
  let actual = await realpath(expanded);
  if (!(await stat(actual)).isDirectory()) throw new Error(`不是目录：${path}`);
  // Accept either the library's projects directory or its immediate parent.
  const nested = join(actual, 'projects');
  if (await stat(nested).then(info => info.isDirectory(), () => false)) actual = await realpath(nested);
  if (await stat(join(actual, 'features')).then(info => info.isDirectory(), () => false)) {
    throw new Error(`这是单个项目，请选择包含各项目的父目录：${path}`);
  }
  return actual;
}

export async function readSources(config = {}) {
  const { saved, ...value } = await preferences(config);
  return { ...value, discoveredRoots: await discoverRoots(config.workingDirectory || homedir()), settingsPath: settingsPath(config) };
}

export async function sourceRoots(config = {}) {
  const value = await preferences(config);
  const roots = new Set(value.autoDiscover ? await discoverRoots(config.workingDirectory || homedir()) : []);
  const warnings = [];
  for (const path of [...value.extraRoots, ...(value.defaultRoot ? [value.defaultRoot] : [])]) {
    try { roots.add(await normalizeRoot(path)); }
    catch (error) {
      // Legacy explicit config errors stay visible. A temporarily disconnected
      // saved source must not hide the user's other accessible libraries.
      if (!value.saved) throw error;
      warnings.push(`无法读取资料来源 ${path}：${error.message}`);
    }
  }
  return { roots: [...roots], warnings };
}

export async function saveSources(config, input) {
  const value = validate({ ...input, defaultRoot: input.defaultRoot === undefined ? (await preferences(config)).defaultRoot : input.defaultRoot });
  const roots = new Set();
  for (const path of value.extraRoots) roots.add(await normalizeRoot(path));
  const next = { autoDiscover: value.autoDiscover, extraRoots: [...roots], ...(value.defaultRoot ? { defaultRoot: await normalizeRoot(value.defaultRoot) } : {}) };
  const path = settingsPath(config);
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(next, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
    try { await copyFile(path, `${path}.bak`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await rename(temporary, path);
  } finally { await rm(temporary, { force: true }); }
  return readSources(config);
}
