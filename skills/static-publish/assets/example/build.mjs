// Runnable same-origin example, not a general website builder. Node 22+ only.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlan, preparePlan, renderHTML } from '../../scripts/resources.mjs';
import { initProject } from '../../scripts/project.mjs';
import { planSite, prepareSite, checkSite } from '../../scripts/site.mjs';
import { diagnostic } from '../../scripts/diagnostics.mjs';

const here = dirname(fileURLToPath(import.meta.url));
async function build(output) {
  await mkdir(output); // The example cannot overwrite an existing project.
  try {
    await cp(join(here, 'public'), join(output, 'source'), { recursive: true });
    const config = { version: 1, publicDir: './source', files: ['cover.svg'], storage: { provider: 'same-origin', prefix: 'example-demo', publicBaseURL: '/assets' } };
    const path = join(output, 'resources.json'); await writeFile(path, JSON.stringify(config, null, 2) + '\n');
    const plan = await createPlan(path), staged = await preparePlan(plan, join(output, 'dist/assets'));
    for (const file of ['style.css', 'detail.html']) await cp(join(output, 'source', file), join(output, 'dist', file));
    await renderHTML(staged.manifestPath, join(here, 'index.template.html'), join(output, 'dist/index.html'));
    const immutable = plan.manifest.files.map(f => 'assets/' + f.key);
    const project = join(output, '.publish');
    await initProject(project, { publicDir: join(output, 'dist'), name: 'example-static-page', files: ['index.html', 'style.css', 'detail.html', ...immutable] });
    const sitePath = join(project, 'site.json'), site = JSON.parse(await readFile(sitePath)); site.immutable = immutable;
    await writeFile(sitePath, JSON.stringify(site, null, 2) + '\n');
    const release = join(project, 'releases/release-001'); await prepareSite(await planSite(sitePath), release); await checkSite(release);
    return { output, project, resourcesConfig: path, resourcesManifest: staged.manifestPath, release, pagePublished: false, cloudQueried: false };
  } catch (error) { await rm(output, { recursive: true, force: true }); throw error; }
}
if (process.argv.length !== 3 || process.argv[2] === '--help') console.log('用法：node assets/example/build.mjs NEW_DEMO_DIR\n只生成全新的本地示例，包含资源清单接入和完整快照；不安装工具、不登录、不发布。');
else build(resolve(process.argv[2])).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { const d = diagnostic(error); console.error(`失败 [${d.code}]：${d.message} 下一步：${d.nextStep}`); process.exitCode = 1; });
