(() => {
 'use strict';
 const $=s=>document.querySelector(s),stage=$('#stage'),world=$('#world'),dialog=$('#photo-dialog');
 const root=new URL('./',document.currentScript.src);
 const materialPaths=[
  '../7690439130081655474/assets/belem-tower.png',
  '../7667090938933628201/assets/monolith-museum.png',
  '../7670420512304123136/assets/cube-lattice.png',
  '../7668903548205157682/assets/mouseshi-street.png',
  '../7683471762872372507/assets/city-roofs.png',
  '../7670420512304123136/assets/cube-city.png',
  '../7670420512304123136/assets/cube-tower.png',
  '../7687076173093129138/assets/belem.png'
 ];
 const materials=materialPaths.map(p=>new URL(p,root).href),nodes=[],images=[];
 const state={position:0,target:1,mode:null,paused:false,rotation:0,dragging:false,selected:-1,cycles:0,phase:'ring'};
 const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v)},mix=(a,b,t)=>a+(b-a)*t;
 let raf=0,last=0,drag=null,opener=null;
 for(let i=0;i<16;i++){
  const n=document.createElement('button'),img=document.createElement('img');n.className='photograph';n.dataset.photo=i;n.setAttribute('aria-label','View supporting photograph '+(i+1));img.src=materials[i%8];img.alt='Independent architectural photograph '+(i%8+1);n.append(img);world.append(n);nodes.push(n);images.push(img);
  n.addEventListener('click',e=>{if(e.detail===0)openPhoto(i)});
 }
 function blend(a,b,t){const out={};for(const k of Object.keys(a))out[k]=mix(a[k],b[k],t);return out}
 function pose(i,t,w,h){
  const mobile=innerWidth<=720,ph=Math.min(mobile?150:245,h*.47),pw=ph*.68,angle=i/16*Math.PI*2+Math.min(t,.32)*7.3,radius=Math.min(mobile?180:520,w*.36);
  const ring={x:Math.sin(angle)*radius,y:Math.sin(angle*.5)*7,z:Math.cos(angle)*(mobile?100:210),ry:angle*180/Math.PI,rz:0,width:pw,height:ph,opacity:Math.cos(angle)>-.08?1:0};
  let short=ring.ry;while(short>180)short-=360;while(short< -180)short+=360;ring.ry=short;
  const stack={x:(i%4-1.5)*3,y:(Math.floor(i/4)-1.5)*2,z:i*.35,ry:0,rz:(i%3-1)*.7,width:pw*1.1,height:ph*1.1,opacity:1};
  const cloud={x:Math.sin(i*2.399)*Math.sqrt((i+.5)/16)*Math.min(mobile?155:370,w*.37),y:Math.cos(i*2.399)*Math.sqrt((i+.5)/16)*h*.46,z:Math.sin(i*1.71)*110,ry:(i*53)%150-75,rz:0,width:mobile?58:100,height:mobile?83:145,opacity:1};
  const rw=Math.min(108,Math.max(42,w*.08)),gap=mobile?4:12,row={x:(i%8-3.5)*(rw+gap),y:-35,z:0,ry:0,rz:0,width:rw,height:rw*1.38,opacity:i<8?1:0};
  if(t<.32)return ring;if(t<.42)return blend(ring,stack,ease((t-.32)/.10));if(t<.50)return stack;if(t<.62)return blend(stack,cloud,ease((t-.50)/.12));if(t<.76)return cloud;return blend(cloud,row,ease((t-.76)/.24));
 }
 function render(){
  const t=state.position,w=stage.clientWidth,h=stage.clientHeight;
  state.phase=t<.32?'ring':t<.50?'stack':t<.76?'cloud':'row';
  const turn=t>.46&&t<.76?Math.sin((t-.46)/.3*Math.PI)*14:0;world.style.transform=`rotateY(${state.rotation+turn}deg)`;
  for(const [i,n]of nodes.entries()){
   const p=pose(i,t,w,h),visible=p.opacity>.05;n.style.width=p.width+'px';n.style.height=p.height+'px';n.style.transform=`translate3d(${p.x-p.width/2}px,${p.y-p.height/2}px,${p.z}px) rotateY(${p.ry}deg) rotateZ(${p.rz}deg)`;n.style.opacity=p.opacity;n.style.pointerEvents=visible?'auto':'none';n.tabIndex=visible?0:-1;n.setAttribute('aria-hidden',String(!visible));n.dataset.visible=String(visible);
  }
  const title=ease((t-.83)/.13);$('.end-title').style.opacity=title;$('.end-title').style.transform=`translateY(${16*(1-title)}px)`;
  $('#caption').style.opacity=1-title;$('#caption').textContent=t<.32?'Snapshots from wherever I wandered.':t<.46?'The whole year was worth every frame.':'A whole year, all kept right here.';
  $('#phase').textContent=({ring:'A PHOTOGRAPHIC RING',stack:'A COMPACT COLLECTION',cloud:'A FIELD OF MOMENTS',row:'EIGHT PHOTOGRAPHS / ONE ALBUM'})[state.phase];
  $('#pause').disabled=!state.mode;$('#pause').textContent=state.paused?'继续':'暂停';$('#progress').value=Math.round(t*1000);stage.classList.toggle('dragging',state.dragging);
  room.announce('环带→收叠→空间散列→八图横排 · '+Math.round(t*100)+'%'+(state.paused?' · 已暂停':''));
 }
 function stop(){cancelAnimationFrame(raf);raf=0;last=0}
 function start(){if(!raf&&state.mode&&!state.paused){last=performance.now();raf=requestAnimationFrame(tick)}}
 function tick(now){raf=0;if(!state.mode||state.paused)return;const dt=Math.min(50,now-last);last=now;state.position=clamp(state.position+(state.target?1:-1)*dt/16000);render();if(state.position===state.target){state.mode=null;state.cycles++;render();return}raf=requestAnimationFrame(tick)}
 function go(target){stop();state.target=target;state.paused=false;if(room.reduced()){state.position=target;state.mode=null}else state.mode=state.position===target?null:'film';render();start()}
 function seek(p){stop();state.position=clamp(p);state.mode=null;state.paused=false;render()}
 $('#play').onclick=()=>{if(state.position===1)state.position=0;go(1)};$('#reverse').onclick=()=>go(state.mode&&state.target===0?1:0);$('#pause').onclick=()=>{if(!state.mode)return;state.paused=!state.paused;stop();render();start()};$('#progress').oninput=e=>seek(+e.target.value/1000);
 for(const b of document.querySelectorAll('[data-position]'))b.onclick=()=>seek(+b.dataset.position);
 stage.addEventListener('pointerdown',e=>{if(e.button!==0||dialog.open)return;stop();state.mode=null;state.paused=false;drag={id:e.pointerId,x:e.clientX,rotation:state.rotation,moved:0,photo:e.target.closest('.photograph')?.dataset.photo};state.dragging=true;stage.setPointerCapture(e.pointerId);render()});
 stage.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x;drag.moved=Math.max(drag.moved,Math.abs(dx));state.rotation=Math.max(-80,Math.min(80,drag.rotation+dx*.25));render()});
 function end(cancel){if(!drag)return;const d=drag;drag=null;state.dragging=false;if(cancel)state.rotation=d.rotation;if(stage.hasPointerCapture(d.id))stage.releasePointerCapture(d.id);render();if(!cancel&&d.moved<6&&d.photo!==undefined)openPhoto(+d.photo)}
 stage.addEventListener('pointerup',()=>end(false));stage.addEventListener('pointercancel',()=>end(true));stage.addEventListener('lostpointercapture',()=>{if(drag)end(true)});
 stage.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag){end(true);return}if(e.target!==stage)return;if(e.key==='ArrowRight')state.rotation=Math.min(80,state.rotation+10);else if(e.key==='ArrowLeft')state.rotation=Math.max(-80,state.rotation-10);else if(e.key==='Home')state.rotation=0;else return;e.preventDefault();render()});
 function returnImage(){if(state.selected>=0)nodes[state.selected].append(images[state.selected])}
 function showPhoto(i){returnImage();state.selected=i;$('#detail-image').append(images[i]);$('#photo-title').textContent='Photograph '+String(i+1).padStart(2,'0')+' / 16 · supporting material'}
 function openPhoto(i){if(i<0||!nodes[i]||nodes[i].dataset.visible!=='true')return;stop();if(state.mode)state.paused=true;opener=nodes[i];showPhoto(i);if(!dialog.open)dialog.showModal();$('#return-photo').focus();render()}
 function adjacent(delta){const available=nodes.map((n,i)=>n.dataset.visible==='true'?i:-1).filter(i=>i>=0),at=available.indexOf(state.selected);showPhoto(available[(at+delta+available.length)%available.length])}
 $('#previous-photo').onclick=()=>adjacent(-1);$('#next-photo').onclick=()=>adjacent(1);$('#close-photo').onclick=$('#return-photo').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{returnImage();state.selected=-1;(opener?.dataset.visible==='true'?opener:stage).focus({preventScroll:true});opener=null;render()});$('#about').onclick=()=>$('#about-dialog').showModal();
 function reset(){stop();if(drag)end(true);returnImage();state.selected=-1;if(dialog.open)dialog.close();if($('#about-dialog').open)$('#about-dialog').close();Object.assign(state,{position:0,target:1,mode:null,paused:false,rotation:0,dragging:false,cycles:0});render()}
 addEventListener('room-reset',reset);addEventListener('resize',render);room.onPreference(reduced=>{if(reduced){stop();if(state.mode)state.position=state.target;state.mode=null;state.paused=false;render()}});
 window.memoriesStudy={state:()=>({...state,activeRAF:!!raf,photoCount:nodes.length,imageCount:images.length,originalImages:images.every((img,i)=>nodes[i].contains(img)||$('#detail-image').contains(img))}),nodes,images,materials,reset};
 render();Promise.all(images.map(n=>n.decode().catch(()=>{}))).then(()=>{document.body.dataset.ready='true'});
})();
