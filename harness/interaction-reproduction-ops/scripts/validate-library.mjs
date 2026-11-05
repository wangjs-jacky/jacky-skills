import {readFile, readdir, access} from 'node:fs/promises';
import {resolve, dirname, extname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const errors=[], counts={effects:0,scenes:0,files:0,links:0};
const exists=async p=>{try{await access(p);return true}catch{return false}};
const check=async(from,url)=>{
  if(!url||/^(?:https?:|data:|mailto:|#|javascript:|blob:)/.test(url))return;
  const clean=decodeURIComponent(url.split(/[?#]/)[0]);if(!clean)return;
  const path=resolve(dirname(from),clean);counts.links++;
  if(!path.startsWith(root+'/'))errors.push('越出Skill: '+relative(root,from)+' → '+url);
  else if(!await exists(path))errors.push('缺少链接: '+relative(root,from)+' → '+url);
};
const catalogue=JSON.parse(await readFile(root+'/assets/catalogue.json','utf8'));
const scenes=new Set(catalogue.scenes.map(s=>s.id)),ids=new Set();counts.scenes=scenes.size;
for(const e of catalogue.effects){counts.effects++;
  if(ids.has(e.id))errors.push('重复effect: '+e.id);ids.add(e.id);
  if(!scenes.has(e.scene)||e.scenes.some(s=>!scenes.has(s)))errors.push('未知场景: '+e.id);
  for(const key of ['method','demo','code'])await check(root+'/catalogue-route',e[key]);
  const method=await readFile(resolve(root,e.method),'utf8');
  for(const field of ['scene','effect','status','last_verified','verification_scope'])if(!new RegExp('^'+field+':','m').test(method))errors.push(e.id+' 缺少 '+field);
  if(!method.includes('effect: '+e.id+'\n'))errors.push('方法身份不符: '+e.id);
  if(!await exists(root+'/references/scenes/'+e.scene+'/operations/'+e.operation+'.md'))errors.push('缺少operation: '+e.id);
}
async function walk(dir){for(const d of await readdir(dir,{withFileTypes:true})){
  if(d.name.startsWith('.')||d.name==='experience.local.md')continue;
  const p=resolve(dir,d.name);if(d.isDirectory()){await walk(p);continue}counts.files++;
  const type=extname(p);if(!['.md','.html','.css','.js','.mjs'].includes(type))continue;
  const t=await readFile(p,'utf8');let links=[];
  if(type==='.md')links=[...t.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(m=>m[1]);
  if(type==='.html')links=[...t.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]);
  if(type==='.css')links=[...t.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)].map(m=>m[1]);
  if(type==='.js')links=[...t.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)].map(m=>m[1]);
  for(const u of links)await check(p,u);
}}
await walk(root);
console.log(JSON.stringify({pass:errors.length===0,...counts,errors},null,2));
if(errors.length)process.exitCode=1;
