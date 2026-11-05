(() => {
  'use strict';
  const $=s=>document.querySelector(s),shell=$('#gallery-shell'),scroll=$('#ring-scroll'),surface=$('#ring-surface'),deck=$('#ring-cards');
  const files=['violet-loop','reused-iridescent-petal','reused-pink-glass','violet-prism','reused-purple-roll','reused-cyan-ribbons','reused-gray-vessel','reused-red-metal','violet-loop','violet-prism','reused-pink-fold','reused-cyan-ribbons','reused-iridescent-petal','violet-loop','reused-red-metal','violet-prism','reused-gray-vessel','reused-pink-glass','reused-purple-roll','violet-loop'];
  const names=['Loop','Vermilion','Glass','Prism','Fold','Current','Vessel','Red','Orbit','Passage','Paper','Flow','Petal','Turn','Metal','Angles','Study','Bloom','Ribbon','Night'];
  const cards=[],images=[];let angle=-18,selected=1,velocity=0,frame=0,last=0,gesture=null,motion=null,entering=true,entryStart=performance.now(),blockClick=false;
  let pan=[0,0],facing=Array(20).fill(90),width=1180,height=680,radius=340,perspective=1000,trace=[],inputs=[],poses=[];
  const REF=1000/60,FRICTION=.92,GAIN=.18,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  files.forEach((file,i)=>{const n=document.createElement('button'),img=document.createElement('img');n.className='ring-card';n.dataset.index=String(i);n.setAttribute('aria-label','将第'+(i+1)+'幅'+names[i]+'转到正前');img.src='assets/'+file+'.png';img.alt=names[i]+'独立自制艺术图';img.draggable=false;n.append(img);deck.append(n);cards.push(n);images.push(img);n.addEventListener('focus',()=>{const p=poses[i];if(p?.q>.8){selected=i;const left=width/2+p.x-p.w/2,right=left+p.w;if(left<20)pan[p.row]+=20-left;else if(right>width-20)pan[p.row]-=right-width+20;scroll.scrollLeft=0;render();}});n.onclick=e=>{if(blockClick&&e.detail!==0)return;input('select',e,{index:i});select(i)};});
  function input(kind,e,extra={}){inputs.push({kind,trusted:e?.isTrusted??false,pointerType:e?.pointerType,at:e?.timeStamp??performance.now(),...extra});if(inputs.length>250)inputs.shift()}
  function unfold(i){return clamp((scroll.scrollTop-(140+i*7))/280,0,1)}
  function render(now=performance.now()){
    const mobile=width<600,scale=width/1180,cw=mobile?48:118*scale,ch=mobile?80:190*scale,ww=mobile?84:138*scale,wh=mobile?114:185*scale,gap=mobile?10:12*scale,step=ww+gap,rowWidth=10*step-gap,overflow=Math.max(0,rowWidth-width+44);
    const elapsed=(now-entryStart)/1000;poses=[];
    for(let i=0;i<20;i++){
      const q=room.reduced()?(scroll.scrollTop>=300?1:0):unfold(i),theta=(angle+i*18)*Math.PI/180;
      const t=Math.max(0,elapsed-i*.028),p=entering&&!room.reduced()?clamp(1-(1+8*t)*Math.exp(-8*t),0,1):1;
      const row=i<10?0:1,j=i%10,parallax=Math.max(0,scroll.scrollTop-350)*(row===0?-.3:.6);
      const offset=clamp((row===1?-overflow:0)+pan[row]+parallax,-overflow,0),wallX=22+j*step+offset+ww/2-width/2;
      const baseY=height*.49,wallY=height+140+row*(wh+12);
      const x=radius*Math.sin(theta)*(1-q)+wallX*q,y=baseY*(1-q)+(wallY+wh/2)*q+(1-p)*Math.sin(i*1.8)*70;
      const z=radius*Math.cos(theta)*(1-q)-(1-p)*(650+i*6),yaw=(angle+i*18+facing[i])*(1-q);
      const w=cw+(ww-cw)*q,h=ch+(wh-ch)*q;
      const n=cards[i];n.style.width=w+'px';n.style.height=h+'px';n.style.marginLeft=(-w/2)+'px';n.style.marginTop=(-h/2)+'px';n.style.transform=`translate3d(${x}px,${y}px,${z}px) rotateY(${yaw}deg)`;n.style.opacity=String(p);n.style.zIndex=String(Math.round(1000+z));n.tabIndex=q>.8||i===selected?0:-1;
      poses.push({index:i,q,p,x,y,z,yaw,w,h,row,offset});
    }
    $('.ring-label').style.top=Math.max(height-80-scroll.scrollTop,140)+'px';$('#plate-label').textContent='PLATE '+String(selected+1).padStart(2,'0');$('#plate-title').textContent=names[selected];
    if(trace.length<700)trace.push({at:now,angle,velocity,scrollTop:scroll.scrollTop,entering,moving:!!motion,positions:poses.map(p=>({q:p.q,p:p.p,z:p.z}))});
  }
  function halt(){cancelAnimationFrame(frame);frame=0;last=0}
  function request(){if(!frame)frame=requestAnimationFrame(tick)}
  function tick(now){frame=0;const dt=last?Math.max(.01,now-last):REF;last=now;
    if(entering&&now-entryStart>1900)entering=false;
    if(motion){const t=clamp((now-motion.start)/650,0,1),q=1-(1-t)**3;angle=motion.from+(motion.to-motion.from)*q;facing=motion.faceFrom.map((n,i)=>n+((i===selected?0:90)-n)*q);if(t===1)motion=null;}
    else if(!gesture&&Math.abs(velocity)>.001){const k=-Math.log(FRICTION)/REF,decay=Math.exp(-k*dt);angle+=velocity*(1-decay)/k;velocity*=decay;if(Math.abs(velocity)<.001)velocity=0;}
    render(now);if(entering||motion||Math.abs(velocity)>.001&&!gesture)request();else last=0;
  }
  function select(i){if(gesture)cancel();halt();velocity=0;selected=(i+20)%20;const target=-selected*18,delta=((target-angle+180)%360+360)%360-180;
    motion={from:angle,to:angle+delta,delta,faceFrom:[...facing],start:performance.now()};if(room.reduced()){angle=motion.to;facing=facing.map((n,j)=>j===selected?0:90);motion=null;entering=false;render();}else request();room.announce('第'+(selected+1)+'幅 · '+names[selected]+'转正，补角'+delta.toFixed(1)+'°');}
  function release(id){if(scroll.hasPointerCapture(id))scroll.releasePointerCapture(id)}
  function cancel(){if(!gesture)return;const g=gesture;gesture=null;release(g.id);angle=g.angle;pan=[...g.pan];velocity=0;blockClick=true;render();if(entering)request();room.announce('已取消，回到拿起状态')}
  scroll.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;halt();motion=null;velocity=0;blockClick=false;const q=unfold(10),r=scroll.getBoundingClientRect();gesture={id:e.pointerId,x:e.clientX,angle,pan:[...pan],row:q>.8?(e.clientY-r.top>(height+140+(width<600?114:185*width/1180)+6-scroll.scrollTop)?1:0):null,points:[{x:e.clientX,t:e.timeStamp}],lastAt:e.timeStamp,moved:false};scroll.setPointerCapture(e.pointerId);input('down',e,{x:e.clientX});if(entering)request();});
  scroll.addEventListener('pointermove',e=>{const g=gesture;if(g?.id!==e.pointerId)return;const dx=e.clientX-g.x;if(Math.abs(dx)>5)g.moved=true;if(!g.moved)return;e.preventDefault();if(g.row!==null){const ww=width<600?84:138*width/1180,gap=width<600?10:12*width/1180,over=Math.max(0,10*(ww+gap)-gap-width+44),para=Math.max(0,scroll.scrollTop-350)*(g.row===0?-.3:.6),base=g.row===1?-over:0;pan[g.row]=clamp(g.pan[g.row]+dx,-over-base-para,-base-para);velocity=0;}else{angle=g.angle+dx*GAIN;g.points.push({x:e.clientX,t:e.timeStamp});const recent=g.points.filter(p=>p.t>=e.timeStamp-80);g.points=recent.length>=2?recent:g.points.slice(-2);const a=g.points[0],b=g.points.at(-1);velocity=b.t>a.t?clamp((b.x-a.x)/(b.t-a.t)*GAIN,-.36,.36):0;}g.lastAt=e.timeStamp;input('move',e,{x:e.clientX,velocity,row:g.row});render();});
  scroll.addEventListener('pointerup',e=>{const g=gesture;if(g?.id!==e.pointerId)return;gesture=null;release(g.id);input('up',e,{moved:g.moved});if(!g.moved){const n=document.elementFromPoint(e.clientX,e.clientY)?.closest('.ring-card');if(n){blockClick=true;input('select',e,{index:Number(n.dataset.index)});select(Number(n.dataset.index));}return;}blockClick=true;if(room.reduced()||e.timeStamp-g.lastAt>100)velocity=0;if(Math.abs(velocity)>.001||entering)request();render();});
  scroll.addEventListener('pointercancel',e=>{if(gesture?.id===e.pointerId)cancel()});scroll.addEventListener('lostpointercapture',e=>{if(e.target===scroll&&gesture?.id===e.pointerId)cancel()});scroll.addEventListener('click',e=>{if(blockClick&&e.detail!==0){e.preventDefault();e.stopPropagation()}},true);
  scroll.addEventListener('scroll',()=>render(),{passive:true});scroll.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End','Escape'].includes(e.key))return;e.preventDefault();if(e.key==='Home'||e.key==='End'){scroll.scrollTop=e.key==='Home'?0:600;return;}if(e.key==='Escape'){if(gesture)cancel();else{halt();motion=null;velocity=0;render();if(entering)request();}return;}input('key-select',e,{key:e.key});select(selected+(e.key==='ArrowRight'?1:-1));if(unfold(selected)>.8)cards[selected].focus({preventScroll:true});});
  function measure(){width=scroll.clientWidth;height=scroll.clientHeight;const mobile=width<600;radius=mobile?width*.35:340*width/1180;perspective=mobile?width*1.25:1000*width/1180;surface.style.height=(height+600)+'px';surface.style.perspective=perspective+'px';surface.style.perspectiveOrigin='50% '+height*.49+'px';render();}
  function replay(){halt();scroll.scrollTop=0;entryStart=performance.now();entering=!room.reduced();motion=null;velocity=0;render();if(entering)request();room.announce('口述入场的本地补写，原片时序未实测')}
  $('#replay-entry').onclick=replay;room.onPreference(()=>{if(gesture)cancel();halt();velocity=0;if(motion){angle=motion.to;facing=facing.map((n,i)=>i===selected?0:90);}motion=null;entering=false;render();});
  addEventListener('room-reset',()=>{if(gesture)cancel();halt();angle=-18;selected=1;velocity=0;motion=null;pan=[0,0];facing=Array(20).fill(90);scroll.scrollTop=0;trace=[];inputs=[];entryStart=performance.now();entering=!room.reduced();render();if(entering)request();room.announce('二十张原图，回到环形开始')});
  new ResizeObserver(measure).observe(scroll);Object.defineProperty(window,'paradeRingState',{get:()=>({angle,selected,velocity,frame,dragging:!!gesture,motion:motion?{...motion}:null,entering,scrollTop:scroll.scrollTop,max:scroll.scrollHeight-scroll.clientHeight,pan:[...pan],radius,perspective,count:cards.length,imageCount:images.length,reduced:room.reduced(),poses:poses.map(p=>({...p})),inputs:[...inputs],trace:[...trace]})});measure();if(room.reduced())entering=false;render();if(entering)request();document.body.dataset.ready='true';room.announce('环外拖动与补角转正，下滚为同二十图归档墙');
})();
