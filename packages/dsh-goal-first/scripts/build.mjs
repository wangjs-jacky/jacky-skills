import { readFile, writeFile, mkdir, realpath, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

// Versioned modules give Cordis a fresh Host module graph on local bundle upgrades.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (await realpath(root) !== root) throw new Error('插件源码目录位置已变化');
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(manifest.version)) throw new Error('需要明确的 bundle 版本');
const output = join(root, 'runtime', manifest.version);
if (relative(root, output).startsWith('..') || isAbsolute(relative(root, output))) throw new Error('构建目录越界');
await mkdir(output, { recursive: true });
if (await realpath(output) !== output) throw new Error('构建目录不能是符号链接');
const files = ['index.js', 'client.js', 'project-store.js', 'dialogue-runtime.js', 'dialogue-tools.js', 'task-files.js', 'task-sessions.js', 'task-workflow.js', 'sources.js', 'client-state.js', 'lib/records.js'];
const shared = await readFile(join(root, 'client-state.js'), 'utf8');
const clientHelperImport = "const {taskMatchesSearch,cachedTaskFile,deliveryApprovalRevision,sessionFileAddress,workbenchAlignmentActive,taskIsRunning,taskMatchesStatus,taskResumeTarget,deliveryReviewState,imagePreviewResult,detailTabForKey}=require('@jacky/dsh-goal-first/client-state');";
const hashes = {};
for (const file of files) {
  let source = await readFile(join(root, file), 'utf8');
  if (file === 'index.js') source = source.replace('./assets/covers/', '../../assets/covers/');
  if (file === 'client.js') {
    if (source.split(clientHelperImport).length !== 2) throw new Error('Client 共享逻辑入口需要精确匹配');
    source = source.replace(clientHelperImport, shared.replaceAll('export function ', 'function '));
  }
  const target = join(output, file);
  await mkdir(dirname(target), { recursive: true });
  try { if ((await lstat(target)).isSymbolicLink()) throw new Error('生成文件不能替换符号链接'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(target, source);
  hashes[file] = createHash('sha256').update(source).digest('hex');
}
await writeFile(join(output, 'integrity.json'), JSON.stringify({ version: manifest.version, files: hashes }, null, 2) + '\n');
console.log(`已构建 ${manifest.version} 的 ${files.length} 个版本化模块。`);
