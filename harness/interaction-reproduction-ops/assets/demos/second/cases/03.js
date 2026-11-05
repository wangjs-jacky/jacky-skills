(()=>{
 const M=Motion,grid=document.querySelector('.photo-grid'),screen=document.querySelector('.screen'),album=document.querySelector('.album'),badge=document.querySelector('.stack-badge'),storeButton=document.querySelector('[data-store]'),message=document.querySelector('.photo-message');
 const files=['alpine-blue','aurora-bowl','alpine-rose','alpine-granite','nordkette','alpine-rock','alpine-glacier','alpine-dusk','alpine-forest'],cards=[],selected=new Set(),stored=new Set();
 const initial={},origin=files.map((_,i)=>({x:i%3*165,y:Math.floor(i/3)*165}));
 let mode=false,phase='IDLE',pointerId=null,downIndex=-1,down=null,point=null,timer=0,suppressClick=false,pendingRelease=false,targets={};
 files.forEach((file,i)=>{
  const slot=document.createElement('span');slot.className='photo-slot';slot.style.cssText=`left:${origin[i].x}px;top:${origin[i].y}px;background-image:url(../assets/${file}.jpg)`;grid.append(slot);
  const b=document.createElement('button');b.className='photo-tile';b.dataset.photo=i;b.setAttribute('aria-label','照片 '+(i+1)+'，长按或键盘选择');b.setAttribute('aria-pressed','false');b.innerHTML=`<img src="../assets/${file}.jpg" alt="雪山旅行照片 ${i+1}"><span class="check" aria-hidden="true"></span>`;grid.append(b);cards.push(b);
  Object.assign(initial,{['x'+i]:origin[i].x,['y'+i]:origin[i].y,['s'+i]:1,['r'+i]:0,['o'+i]:1});
  b.addEventListener('click',e=>{if(suppressClick){suppressClick=false;return;}if(stored.has(i)||['GATHER','DRAG','DROP','RETURN'].includes(phase))return;if(!mode&&e.detail!==0)return;mode=true;toggle(i);});
 });
 const pos=e=>{const r=grid.getBoundingClientRect(),s=r.width/482;return{x:(e.clientX-r.x)/s,y:(e.clientY-r.y)/s}};
 const albumPoint=()=>({x:425,y:-56});
 const inAlbum=p=>p&&p.x>=340&&p.x<=495&&p.y>=-98&&p.y<=-24;
 function controls(){screen.classList.toggle('select-mode',mode);cards.forEach((b,i)=>{b.classList.toggle('selected',selected.has(i));b.setAttribute('aria-pressed',String(selected.has(i)));b.querySelector('.check').textContent=selected.has(i)?'✓':'';});storeButton.disabled=!selected.size||['GATHER','DRAG','DROP'].includes(phase);M.read('count',selected.size+' / 9');album.textContent='▣ Album'+(stored.size?' · '+stored.size:'');}
 function toggle(i){if(selected.has(i))selected.delete(i);else selected.add(i);phase='SELECT';M.state('SELECT');controls();message.textContent='已选 '+selected.size+' 张，拖任一选中图到Album';}
 const config=Object.fromEntries(Object.keys(initial).map(k=>[k,{k:380,c:32}]));
 const motion=M.spring(initial,v=>{
  cards.forEach((b,i)=>{b.style.transform=`translate(${v['x'+i]}px,${v['y'+i]}px) rotate(${v['r'+i]}deg) scale(${v['s'+i]})`;b.style.opacity=v['o'+i]*(!selected.has(i)&&['GATHER','DRAG','DROP'].includes(phase)?.42:1);b.style.zIndex=selected.has(i)?String(30+[...selected].indexOf(i)):String(i+1);});
  const ids=[...selected],progress=ids.length?ids.reduce((a,i)=>a+(1-v['s'+i])/.2,0)/ids.length:0;
  M.read('gather',Math.round(M.clamp(phase==='DROP'?1-progress:progress,0,1)*100)+'%');
  if(ids.length&&['GATHER','DRAG'].includes(phase)){const i=ids.at(-1),s=v['s'+i],appear=M.clamp((progress-.7)/.3,0,1);badge.textContent=ids.length;badge.style.opacity=appear;badge.style.transform=`translate(${v['x'+i]+151*(1+s)/2-10}px,${v['y'+i]+151*(1-s)/2-12}px) scale(${appear})`;}else badge.style.opacity=0;
  if(phase==='GATHER'&&ids.every(i=>Math.abs(v['x'+i]-targets['x'+i])<.5&&Math.abs(v['y'+i]-targets['y'+i])<.5&&Math.abs(v['s'+i]-.8)<.002)){
   phase='DRAG';M.state('DRAG');controls();if(pendingRelease){pendingRelease=false;finish(point);}else if(point)follow(point);
  }
  if(phase==='RETURN'&&ids.every(i=>v['x'+i]===origin[i].x&&v['y'+i]===origin[i].y&&v['s'+i]===1)){phase='SELECT';M.state('SELECT');controls();}
  if(phase==='DROP'&&ids.every(i=>v['o'+i]===0)){
   ids.forEach(i=>{stored.add(i);cards[i].style.visibility='hidden';});selected.clear();phase='STORED';M.state('STORED');controls();album.classList.remove('hot');message.textContent='已移入 '+stored.size+' 张；复位可还原全部照片';
  }
 },config);
 function targetAt(p){const target={};[...selected].forEach((i,rank)=>Object.assign(target,{['x'+i]:p.x-75.5+rank*4,['y'+i]:p.y-75.5+rank*3,['s'+i]:.8,['r'+i]:rank%2?8:-8}));return target;}
 function gather(p){phase='GATHER';point=p;targets=targetAt(p);const delays={};[...selected].forEach((i,rank)=>{for(const field of ['x','y','s','r'])delays[field+i]={delay:rank*50};});M.state('GATHER');controls();motion.to(targets,delays);}
 function follow(p){point=p;targets=targetAt(p);album.classList.toggle('hot',inAlbum(p));motion.to(targets);}
 function restore(){pendingRelease=false;pointerId=null;clearTimeout(timer);phase='RETURN';M.state('RETURN');const target={};selected.forEach(i=>Object.assign(target,{['x'+i]:origin[i].x,['y'+i]:origin[i].y,['s'+i]:1,['r'+i]:0,['o'+i]:1}));album.classList.remove('hot');motion.to(target);}
 function finish(p){if(!inAlbum(p)){restore();return;}phase='DROP';M.state('DROP');controls();const a=albumPoint(),target={};selected.forEach(i=>Object.assign(target,{['x'+i]:a.x-75.5,['y'+i]:a.y-75.5,['s'+i]:.03,['r'+i]:0,['o'+i]:0}));album.classList.add('hot');motion.to(target);}
 grid.addEventListener('pointerdown',e=>{
  const b=e.target.closest('[data-photo]');if(!b||e.button!==0||pointerId!==null||['GATHER','DRAG','DROP','RETURN'].includes(phase))return;
  const i=Number(b.dataset.photo);if(stored.has(i))return;pointerId=e.pointerId;downIndex=i;down=point=pos(e);b.setPointerCapture(pointerId);
  if(!mode)timer=setTimeout(()=>{mode=true;toggle(i);suppressClick=true;},350);
 });
 grid.addEventListener('pointermove',e=>{
  if(e.pointerId!==pointerId)return;const p=pos(e);point=p;const d=Math.hypot(p.x-down.x,p.y-down.y);
  if(d>7){clearTimeout(timer);if(mode&&selected.has(downIndex)&&phase==='SELECT'){suppressClick=true;gather(p);}}
  if(phase==='DRAG')follow(p);
 });
 grid.addEventListener('pointerup',e=>{if(pointerId!==e.pointerId)return;clearTimeout(timer);point=pos(e);pointerId=null;if(phase==='GATHER')pendingRelease=true;else if(phase==='DRAG')finish(point);});
 for(const type of ['pointercancel','lostpointercapture'])grid.addEventListener(type,()=>{if(pointerId!==null){clearTimeout(timer);pointerId=null;if(['GATHER','DRAG'].includes(phase))restore();}});
 storeButton.addEventListener('click',()=>{if(!selected.size)return;pendingRelease=true;gather(albumPoint());});
 album.addEventListener('click',()=>{message.textContent=stored.size?'Album已有 '+stored.size+' 张，复位可还原':'把选中照片拖到这里';});
 addEventListener('keydown',e=>{if(e.key==='Escape'){if(['GATHER','DRAG','DROP'].includes(phase))restore();else{selected.clear();mode=false;phase='IDLE';controls();M.state('IDLE');}}});
 M.attach({motion,get selected(){return [...selected]},get stored(){return [...stored]},get phase(){return phase},reset(){clearTimeout(timer);pointerId=null;pendingRelease=false;suppressClick=false;mode=false;phase='IDLE';selected.clear();stored.clear();motion.stop();cards.forEach(b=>b.style.visibility='');motion.jump(initial);controls();M.state('IDLE');message.textContent='长按一张照片进入多选';}});controls();
})();
