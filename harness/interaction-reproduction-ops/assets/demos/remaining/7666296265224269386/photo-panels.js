(() => {
 'use strict';
 const $=s=>document.querySelector(s),scene=$('#scene'),assembly=$('#assembly');
 const materialBase=new URL('../7670420512304123136/assets/',document.currentScript.src).href;
 const materials=['cube-city.png','cube-lattice.png','cube-tower.png'].map(n=>materialBase+n);
 materials.push(new URL('../7667090938933628201/assets/monolith-museum.png',document.currentScript.src).href);
 const faces=[
  {normal:[0,0,1],u:[1,0,0],v:[0,1,0],rx:0,ry:0},
  {normal:[1,0,0],u:[0,0,-1],v:[0,1,0],rx:0,ry:90},
  {normal:[0,0,-1],u:[-1,0,0],v:[0,1,0],rx:0,ry:180},
  {normal:[-1,0,0],u:[0,0,1],v:[0,1,0],rx:0,ry:-90},
  {normal:[0,-1,0],u:[1,0,0],v:[0,0,1],rx:90,ry:0},
  {normal:[0,1,0],u:[1,0,0],v:[0,0,-1],rx:-90,ry:0}
 ];
 const state={progress:0,velocity:0,target:0,time:0,mode:null,paused:false,x:-24,y:-2,dragging:false,selected:-1,info:null,cycles:0};
 const panels=[];let raf=0,last=0,drag=null,opener=null,infoOpener=null;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
 for(const [face,f]of faces.entries())for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  const i=panels.length,node=document.createElement('button'),img=document.createElement('img');
  node.className='photo-panel';node.dataset.panel=i;node.setAttribute('aria-label','View photograph panel '+(i+1));
  img.src=materials[(i+face*2)%materials.length];img.alt='Independent supporting photograph or coded material '+(i+1);node.append(img);assembly.append(node);
  const pos=f.normal.map((v,k)=>v*153+f.u[k]*(col-1)*102+f.v[k]*(row-1)*102);
  panels.push({node,img,face,row,col,pos,rx:f.rx,ry:f.ry,dx:Math.sin(i*1.77)*225+f.normal[0]*70,dy:(i%9-4)*78+Math.cos(i*2.1)*55,dz:Math.sin(i*2.37)*235,drx:Math.sin(i*1.3)*150,dry:Math.cos(i*2.7)*150,drz:Math.sin(i*3.1)*90});
  node.addEventListener('click',e=>{if(e.detail===0)openPhoto(i)});
 }
 function render(){
  const p=state.progress;assembly.style.transform=`rotateX(${state.x}deg) rotateY(${state.y}deg)`;
  for(const b of panels)b.node.style.transform=`translate3d(${b.pos[0]+b.dx*p}px,${b.pos[1]+b.dy*p}px,${b.pos[2]+b.dz*p}px) rotateX(${b.rx+b.drx*p}deg) rotateY(${b.ry+b.dry*p}deg) rotateZ(${b.drz*p}deg)`;
  $('#toggle').textContent=state.target?'Bring photo panels back':'Scatter photo panels';$('#toggle').setAttribute('aria-pressed',String(state.target===1));
  $('#pause').textContent=state.paused?'Resume':'Pause';$('#pause').disabled=!state.mode;
  scene.classList.toggle('dragging',state.dragging);scene.setAttribute('aria-valuenow',Math.round(state.y));
  scene.setAttribute('aria-valuetext',`54 independent photo planes, scattered ${Math.round(p*100)}%, view ${Math.round(state.y)} degrees`);
 }
 function stop(){cancelAnimationFrame(raf);raf=0;last=0}
 function start(){if(!raf&&state.mode&&!state.paused){last=performance.now();raf=requestAnimationFrame(tick)}}
 function tick(now){
  raf=0;if(!state.mode||state.paused)return;const dt=Math.min(.035,(now-last)/1000);last=now;
  if(state.mode==='demo'){
   state.time=Math.min(8,state.time+dt);const t=state.time;
   state.progress=t<1.7?0:t<2.8?smooth((t-1.7)/1.1):t<3.15?1:t<4.3?1-smooth((t-3.15)/1.15):0;
   state.x=-24+Math.sin(t*.6)*6;state.y=-2-(t<1.7?t*6:10+(t-1.7)*7);
   state.target=t>=1.7&&t<3.15?1:0;
   if(t===8){state.mode=null;state.cycles++;room.announce('一轮薄照片面板散开/回拢完成，同54面板保持。')}
  }else{
   state.velocity+=(110*(state.target-state.progress)-16*state.velocity)*dt;
   state.progress+=state.velocity*dt;
   if(Math.abs(state.progress-state.target)<.001&&Math.abs(state.velocity)<.006){state.progress=state.target;state.velocity=0;state.mode=null}
  }
  render();if(state.mode)raf=requestAnimationFrame(tick);
 }
 function to(target){stop();state.target=target;state.mode='spring';state.paused=false;if(room.reduced()){state.progress=target;state.velocity=0;state.mode=null}render();start()}
 $('#toggle').onclick=()=>to(1-state.target);
 $('#play').onclick=()=>{stop();Object.assign(state,{progress:0,velocity:0,target:0,time:0,mode:room.reduced()?null:'demo',paused:false,x:-24,y:-2});if(room.reduced())state.cycles++;render();start()};
 $('#pause').onclick=()=>{if(!state.mode)return;state.paused=!state.paused;stop();render();start()};
 scene.addEventListener('pointerdown',e=>{if(e.button!==0||$('#photo-dialog').open)return;stop();if(state.mode)state.paused=true;drag={id:e.pointerId,px:e.clientX,py:e.clientY,x:state.x,y:state.y,moved:0,panel:e.target.closest('.photo-panel')?.dataset.panel};state.dragging=true;scene.setPointerCapture(e.pointerId);render()});
 scene.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.px,dy=e.clientY-drag.py;drag.moved=Math.max(drag.moved,Math.hypot(dx,dy));state.x=clamp(drag.x-dy*.25,-65,65);state.y=clamp(drag.y+dx*.35,-180,180);render()});
 function end(cancel){if(!drag)return;const d=drag;drag=null;state.dragging=false;if(cancel){state.x=d.x;state.y=d.y}if(scene.hasPointerCapture(d.id))scene.releasePointerCapture(d.id);render();if(!cancel&&d.moved<6&&d.panel!==undefined)openPhoto(+d.panel)}
 scene.addEventListener('pointerup',()=>end(false));scene.addEventListener('pointercancel',()=>end(true));scene.addEventListener('lostpointercapture',()=>{if(drag)end(true)});
 scene.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag){end(true);return}if(e.target!==scene&&!e.key.startsWith('Arrow'))return;if(e.key==='ArrowRight')state.y=clamp(state.y+10,-180,180);else if(e.key==='ArrowLeft')state.y=clamp(state.y-10,-180,180);else if(e.key==='ArrowUp')state.x=clamp(state.x-10,-65,65);else if(e.key==='ArrowDown')state.x=clamp(state.x+10,-65,65);else if(e.key==='Home'){state.x=-24;state.y=-2}else if(e.key==='Enter'||e.key===' '){e.preventDefault();to(1-state.target);return}else return;e.preventDefault();render()});
 function openPhoto(i){if(state.selected>=0)return;stop();if(state.mode)state.paused=true;opener=panels[i].node;state.selected=i;$('#photo-holder').append(panels[i].img);$('#photo-name').textContent=`Panel ${i+1} / 54 · Independent supporting material`;$('#photo-dialog').showModal();$('#photo-return').focus();render()}
 $('#photo-return').onclick=()=>$('#photo-dialog').close();
 $('#photo-dialog').addEventListener('close',()=>{if(state.selected<0)return;panels[state.selected].node.append(panels[state.selected].img);state.selected=-1;opener?.focus({preventScroll:true});render()});
 function info(kind){infoOpener=document.activeElement;state.info=kind;$('#info-title').textContent=kind==='archive'?'Four photographs. Fifty-four planes.':'Photographs form the surface.';const body=$('#info-body');body.replaceChildren();if(kind==='archive'){const grid=document.createElement('div');grid.className='archive-grid';for(const src of materials){const item=document.createElement('div');item.style.backgroundImage=`url("${src}")`;grid.append(item)}body.append(grid)}else{const p=document.createElement('p');p.textContent='This study assembles 54 thin photo panels, fitted as nine on each of six surfaces. Materials come from earlier independent studies. Counts, trajectories, controls and spring settings are fitted additions; no original source code or authoring Skill was obtained.';body.append(p)}$('#info').showModal();render()}
 $('#archive').onclick=()=>info('archive');$('#about').onclick=()=>info('about');$('#featured').onclick=()=>{scene.focus({preventScroll:true});room.announce('可拖动空隙或照片面转向；点按照片面打开同一图片。')};
 $('#info').addEventListener('close',()=>{state.info=null;infoOpener?.focus({preventScroll:true})});
 function reset(){stop();if(drag)end(true);if($('#photo-dialog').open){const i=state.selected;if(i>=0)panels[i].node.append(panels[i].img);state.selected=-1;$('#photo-dialog').close()}if($('#info').open)$('#info').close();Object.assign(state,{progress:0,velocity:0,target:0,time:0,mode:null,paused:false,x:-24,y:-2,dragging:false,info:null,cycles:0});render();room.announce('同54张薄照片面板与初始视角已复位。')}
 addEventListener('room-reset',reset);room.onPreference(reduced=>{if(reduced){stop();if(state.mode==='demo')state.target=0;state.progress=state.target;state.velocity=0;state.mode=null;state.paused=false;render()}});
 window.panelStudy={state:()=>({...state,activeRAF:!!raf,panelCount:panels.length,imageCount:document.querySelectorAll('.photo-panel img,#photo-holder img').length}),panels,materials,reset};
 render();Promise.all(panels.map(p=>p.img.decode().catch(()=>{}))).then(()=>{document.body.dataset.ready='true'});
})();
