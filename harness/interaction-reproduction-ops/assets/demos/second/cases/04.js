(()=>{
 const M=Motion,start=document.querySelector('.timer-start'),pause=document.querySelector('.timer-pause'),end=document.querySelector('.timer-end'),time=document.querySelector('.timer-time'),label=document.querySelector('.timer-label'),ring=document.querySelector('.elapsed-ring');
 let active=false,mode='READY',saved=0,clockStart=0,clockFrame=0,resetTimer=0,focusPause=false,focusStart=false;
 const elapsed=()=>saved+(active&&mode==='RUNNING'?performance.now()-clockStart:0);
 function drawTime(){const ms=elapsed(),s=Math.floor(ms/1000);time.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');ring.style.strokeDashoffset=917.346*(1-(ms%60000)/60000);label.textContent=mode;}
 function tick(){drawTime();if(active&&mode==='RUNNING')clockFrame=requestAnimationFrame(tick);else clockFrame=0;}
 const motion=M.spring({p:0},v=>{
  const p=M.clamp(v.p,0,1.08),gap=16*p,r=Math.min(38,38*p),w=(470-gap)/2;
  pause.style.width=w+'px';pause.style.borderRadius=`38px ${r}px ${r}px 38px`;
  pause.style.background=`rgb(${Math.round(255-213*M.clamp(p,0,1))},${Math.round(204-157*M.clamp(p,0,1))},${Math.round(50*M.clamp(p,0,1))})`;
  pause.style.color=p>.4?'#f5f5f5':'#17252a';end.style.left=(w+gap)+'px';end.style.width=w+'px';end.style.borderRadius=`${r}px 38px 38px ${r}px`;
  for(const b of [pause,end])b.querySelector('span').style.opacity=M.clamp((p-.2)/.6,0,1);
  start.style.opacity=M.clamp(1-p*3,0,1);start.style.pointerEvents=!active&&p<.2?'auto':'none';start.tabIndex=!active&&p<.2?0:-1;M.read('gap',Math.round(gap)+' px');M.read('radius',Math.round(r)+' px');
  if(v.p===1&&active){M.state(mode);if(focusPause){focusPause=false;pause.focus({preventScroll:true});}}
  if(v.p===0&&!active){M.state('READY');if(focusStart){focusStart=false;start.focus({preventScroll:true});}}
 },{p:{k:300,c:23}});
 function begin(){if(active)return;clearTimeout(resetTimer);saved=0;clockStart=performance.now();active=true;mode='RUNNING';start.disabled=true;pause.disabled=false;end.disabled=false;pause.querySelector('span').textContent='Pause';focusPause=true;focusStart=false;M.state('SPLIT');motion.to({p:1});if(!clockFrame)tick();}
 function toggle(){if(!active)return;if(mode==='RUNNING'){saved=elapsed();mode='PAUSED';cancelAnimationFrame(clockFrame);clockFrame=0;pause.querySelector('span').textContent='Resume';}else{mode='RUNNING';clockStart=performance.now();pause.querySelector('span').textContent='Pause';tick();}drawTime();M.state(mode);}
 function finish(){if(!active)return;saved=elapsed();active=false;mode='READY';cancelAnimationFrame(clockFrame);clockFrame=0;focusPause=false;focusStart=true;start.disabled=false;pause.disabled=true;end.disabled=true;M.state('RETURN');drawTime();motion.to({p:0});clearTimeout(resetTimer);resetTimer=setTimeout(()=>{if(!active){saved=0;drawTime();}},220);}
 start.addEventListener('click',begin);pause.addEventListener('click',toggle);end.addEventListener('click',finish);
 M.attach({motion,get elapsed(){return elapsed()},get active(){return active},get mode(){return mode},reset(){clearTimeout(resetTimer);cancelAnimationFrame(clockFrame);clockFrame=0;active=false;mode='READY';saved=0;focusPause=false;focusStart=false;start.disabled=false;pause.disabled=true;end.disabled=true;motion.stop();motion.jump({p:0});drawTime();M.state('READY');}});drawTime();
})();
