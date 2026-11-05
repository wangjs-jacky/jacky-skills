(() => {
  'use strict';
  const $=s=>document.querySelector(s),stage=$('#splay-stage'),camera=$('#reel-camera'),core=$('#reel-core'),viewer=$('#art-viewer');
  const art=['quorum-yellow-grid','quorum-blue-orange','rose-scraps','chorus-color-field','cyan-gesture','quorum-deep-blue','sun-yellow','umber-study'];
  const cards=[],images=[],glyphs=[],title='All of it, in one turn';
  for(const [i,c] of [...title].entries()){const n=document.createElement('span');n.textContent=c;n.setAttribute('aria-hidden','true');if(i>10)n.className='italic';$('#reel-title').append(n);glyphs.push(n)}
  for(let i=0;i<18;i++){const n=document.createElement('button'),img=document.createElement('img');n.className='reel-frame';n.dataset.frame=String(i);n.setAttribute('aria-label','打开图版'+(i+1));img.src='assets/'+art[i%art.length]+'.png';img.alt='独立画作图版'+(i+1);img.draggable=false;n.append(img);core.append(n);cards.push(n);images.push(img);n.onclick=e=>{if(blockClick&&e.detail!==0)return;input('open',e,{index:i});open(i)};}
  let slots=Array.from({length:18},(_,i)=>i),angle=0,velocity=0,frame=0,last=0,gesture=null,phase='idle',mode='ring',shuffleCount=0,blockClick=false;
  let perspective=486,radius=360,cameraOffset=288,tracking=0,scatter=0,trace=[],inputs=[],layoutToken=0,layoutPhase='idle',selected=null;
  const GAIN=.15,REF=1000/60,FRICTION=.92;
  function input(kind,e,extra={}){inputs.push({kind,trusted:e?.isTrusted??false,pointerType:e?.pointerType,at:e?.timeStamp??performance.now(),...extra});if(inputs.length>300)inputs.shift()}
  function record(){trace.push({angle,velocity,tracking,scatter,phase,mode,at:performance.now()});if(trace.length>400)trace.shift()}
  function render(){
    core.style.setProperty('--spin',angle+'deg');core.style.setProperty('--core-z',(perspective-cameraOffset)+'px');
    const mobile=camera.clientWidth<600, strength=room.reduced()?0:Math.min(1,Math.abs(velocity)/1.1);
    tracking=strength*(mobile?2.2:10);scatter=strength*(mobile?7:24);
    glyphs.forEach((n,i)=>{n.style.marginRight=(n.textContent===' '?0:tracking)+'px';n.style.transform=`translateY(${Math.sin(i*1.23)*scatter}px) rotate(${Math.sin(i*1.71)*strength*27}deg)`});
    record();
  }
  function halt(){cancelAnimationFrame(frame);frame=0;last=0;}
  function request(){if(!frame)frame=requestAnimationFrame(tick)}
  function tick(now){frame=0;if(phase!=='inertia')return;const dt=Math.max(.01,now-last);last=now;const k=-Math.log(FRICTION)/REF,decay=Math.exp(-k*dt);angle-=GAIN*velocity*(1-decay)/k;velocity*=decay;if(Math.abs(velocity)<.002){velocity=0;phase='idle';render();return}render();request()}
  function inertia(){if(room.reduced()||Math.abs(velocity)<.002){velocity=0;phase='idle';render();return}phase='inertia';last=performance.now();request();}
  function release(id){if(camera.hasPointerCapture(id))camera.releasePointerCapture(id)}
  function cancel(){if(!gesture)return;const g=gesture;gesture=null;release(g.id);halt();angle=g.angle;velocity=0;phase='idle';blockClick=true;render();room.announce('已取消拖动，回到拿起位置')}
  camera.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0||mode!=='ring'||selected!==null)return;
    halt();blockClick=false;velocity=0;gesture={id:e.pointerId,x:e.clientX,angle,moved:false,points:[{x:e.clientX,t:e.timeStamp}],lastAt:e.timeStamp};phase='dragging';camera.setPointerCapture(e.pointerId);input('down',e,{x:e.clientX});render();
  });
  camera.addEventListener('pointermove',e=>{
    const g=gesture;if(g?.id!==e.pointerId)return;e.preventDefault();const dx=e.clientX-g.x;if(Math.abs(dx)>5)g.moved=true;
    angle=g.angle-dx*GAIN;g.points.push({x:e.clientX,t:e.timeStamp});const recent=g.points.filter(p=>p.t>=e.timeStamp-80);g.points=recent.length>=2?recent:g.points.slice(-2);
    const first=g.points[0],p=g.points.at(-1);velocity=p.t>first.t?Math.max(-2,Math.min(2,(p.x-first.x)/(p.t-first.t))):0;g.lastAt=e.timeStamp;input('move',e,{x:e.clientX,velocity});render();
  });
  camera.addEventListener('pointerup',e=>{
    const g=gesture;if(g?.id!==e.pointerId)return;gesture=null;release(g.id);input('up',e,{x:e.clientX,moved:g.moved});
    if(!g.moved){velocity=0;phase='idle';render();const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('.reel-frame');if(hit){blockClick=true;input('open-pointer',e,{index:Number(hit.dataset.frame)});open(Number(hit.dataset.frame));}return;}
    blockClick=true;if(e.timeStamp-g.lastAt>100)velocity=0;inertia();
  });
  camera.addEventListener('pointercancel',e=>{if(gesture?.id===e.pointerId)cancel()});camera.addEventListener('lostpointercapture',e=>{if(e.target===camera&&gesture?.id===e.pointerId)cancel()});
  camera.addEventListener('click',e=>{if(blockClick&&e.detail!==0){e.preventDefault();e.stopPropagation()}},true);
  camera.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','Escape','Enter'].includes(e.key))return;
    if(e.key==='Enter'&&mode==='ring'&&e.target===camera){e.preventDefault();const norm=x=>((x+180)%360+360)%360-180;const i=slots.map((slot,index)=>({index,d:Math.abs(norm(slot*20+angle))})).sort((a,b)=>a.d-b.d)[0].index;input('open-key',e,{index:i});open(i);return;}
    if(e.key==='Enter')return;
    if(e.key==='Escape'){e.preventDefault();if(gesture)cancel();else{halt();velocity=0;phase='idle';render();if(mode==='wall')setMode('ring',e)}return;}e.preventDefault();if(gesture)cancel();halt();velocity=0;phase='idle';angle=e.key==='Home'?0:angle+(e.key==='ArrowRight'?-20:20);render();input('key',e);
  });
  function layout(instant=false){
    const local=++layoutToken,width=camera.clientWidth,mobile=width<600,scale=width/1180;
    radius=mobile?width*.36:360*scale;cameraOffset=radius*.98;perspective=radius*1.485;camera.style.perspective=perspective+'px';
    layoutPhase='moving';if(instant)stage.classList.add('no-motion');
    const rw=mobile?60:130*scale,rh=rw*1.38,cols=mobile?4:9,rows=Math.ceil(18/cols),gap=mobile?8:10*scale,area=mobile?width-24:width*.89;
    const gw=(area-(cols-1)*gap)/cols,gh=gw*(mobile?1.1:1.3);
    for(const[key,value]of Object.entries({'--ring-w':rw,'--ring-h':rh,'--grid-w':gw,'--grid-h':gh,'--radius':radius}))core.style.setProperty(key,value+'px');
    cards.forEach((n,i)=>{const slot=slots[i];n.tabIndex=mode==='ring'?-1:0;n.style.setProperty('--slot',String(slot*20));n.style.setProperty('--grid-x',((slot%cols-(cols-1)/2)*(gw+gap))+'px');n.style.setProperty('--grid-y',((Math.floor(slot/cols)-(rows-1)/2)*(gh+gap))+'px');});
    $('#spread').setAttribute('aria-pressed',String(mode==='wall'));$('#close-layout').disabled=mode==='ring'&&selected===null;stage.classList.toggle('spread',mode==='wall');
    stage.style.setProperty('--spread',mode==='wall'?'1':'0');render();void core.offsetWidth;if(instant)stage.classList.remove('no-motion');
    const animations=[...stage.getAnimations(),...cards.flatMap(n=>n.getAnimations())];
    if(instant||room.reduced()||!animations.length){layoutPhase='idle';return;}
    Promise.allSettled(animations.map(a=>a.finished)).then(()=>{if(local===layoutToken)layoutPhase='idle'});
  }
  function setMode(next,e){if(gesture)cancel();halt();velocity=0;phase='idle';mode=next;blockClick=false;input('layout-'+mode,e);layout();room.announce(mode==='ring'?'已收回筒内卡带':'本地补写：同一批画摊为图墙')}
  $('#spread').onclick=e=>setMode('wall',e);$('#close-layout').onclick=e=>{if(selected!==null)closeImage();else setMode('ring',e)};
  $('#order').onclick=e=>{if(gesture)cancel();halt();velocity=0;phase='idle';slots=Array.from({length:18},(_,i)=>i);$('#order').setAttribute('aria-pressed','true');$('#shuffle').setAttribute('aria-pressed','false');input('order',e);layout();room.announce('原图版顺序')};
  $('#shuffle').onclick=e=>{
    if(gesture)cancel();halt();shuffleCount++;let seed=shuffleCount*9173+31;const list=Array.from({length:18},(_,i)=>i);for(let i=17;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[list[i],list[j]]=[list[j],list[i]]}slots=list;
    $('#order').setAttribute('aria-pressed','false');$('#shuffle').setAttribute('aria-pressed','true');input('shuffle',e);layout();velocity=room.reduced()?0:1.1;inertia();room.announce('同节点重新排序；标题脉冲为本地补写');
  };
  function open(i){if(selected!==null||gesture)return;halt();velocity=0;phase='idle';render();selected=i;$('#viewer-image').append(images[i]);$('#viewer-label').textContent='PLATE '+String(i+1).padStart(2,'0')+' · 独立自制画作';viewer.showModal();$('#close-layout').disabled=false;room.announce('本地大图查看，关闭后回到同一图版')}
  function closeImage(){if(selected===null)return;const i=selected;selected=null;cards[i].append(images[i]);if(viewer.open)viewer.close();cards[i].focus({preventScroll:true});$('#close-layout').disabled=mode==='ring';room.announce('已回到原图版')}
  $('#close-image').onclick=closeImage;viewer.addEventListener('cancel',e=>{e.preventDefault();closeImage()});
  room.onPreference(()=>{if(gesture)cancel();halt();velocity=0;phase='idle';layout(true)});
  addEventListener('room-reset',()=>{if(gesture)cancel();halt();if(selected!==null)closeImage();angle=velocity=tracking=scatter=0;mode='ring';phase='idle';slots=Array.from({length:18},(_,i)=>i);shuffleCount=0;blockClick=false;trace=[];inputs=[];$('#order').setAttribute('aria-pressed','true');$('#shuffle').setAttribute('aria-pressed','false');layout(true);room.announce('原十八图版，筒内静止')});
  new ResizeObserver(()=>{halt();velocity=0;phase='idle';layout(true)}).observe(camera);
  Object.defineProperty(window,'cylinderReelState',{get:()=>({angle,velocity,tracking,scatter,frame,phase,mode,layoutPhase,spreadProgress:parseFloat(getComputedStyle(stage).getPropertyValue('--spread')),dragging:!!gesture,selected,slots:[...slots],perspective,radius,cameraOffset,reduced:room.reduced(),count:cards.length,images:images.length,trace:[...trace],inputs:[...inputs]})});
  layout(true);document.body.dataset.ready='true';room.announce('横向拖动，速度同时驱动旋转、字距与字符散动');
})();
