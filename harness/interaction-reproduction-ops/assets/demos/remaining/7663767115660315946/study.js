(()=>{
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],stage=$('.stage'),key=document.body.dataset.study,duration=+document.body.dataset.duration||8;
 let t=0,raf=0,running=false,direction=1,last=0,revision=0,selection=null,resumeOnVisible=false;const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-x)**3;
 const typed=$$('[data-type]'),animated=$$('[data-at]'),original=new Map(typed.map(n=>[n,n.textContent]));window.studyRenderers=[];window.studyResetters=[];
 const dots=$('.bokeh');if(dots)for(let i=0;i<9;i++){const n=document.createElement('i');n.style.cssText=`left:${(i*37)%105}%;top:${(i*23+17)%100}%;width:${70+i*8}px;height:${45+i*7}px`;dots.append(n)}
 function fit(){const width=document.documentElement.clientWidth,height=visualViewport?.height||innerHeight;const s=new URLSearchParams(location.search).has('compare')?1:Math.min(1,(width-16)/1080,(height>600?Math.max(520,height-220):600)/1920);$('.viewport').style.width=1080*s+'px';$('.viewport').style.height=1920*s+'px';stage.style.transform=`scale(${s})`;document.body.style.setProperty('--scale',s)}
 function render(){for(const n of animated){const at=+n.dataset.at,end=n.dataset.until?+n.dataset.until:Infinity,span=+n.dataset.fade||.55;const a=clamp((t-at)/span),z=clamp((end-t)/span),p=ease(Math.min(a,z));n.style.opacity=p;n.style.transform=`translateY(${(1-p)*(+(n.dataset.lift??22))}px) scale(${1-(1-p)*+(n.dataset.shrink||0)})`;n.inert=p<.97;n.setAttribute('aria-hidden',p<.01?'true':'false')}
 for(const n of typed){const v=original.get(n),a=+n.dataset.type,span=+n.dataset.typeDuration||1;const count=Math.floor(clamp((t-a)/span)*[...v].length);n.textContent=[...v].slice(0,count).join('')}
 if(dots)$$('.bokeh i').forEach((n,i)=>n.style.transform=`translate(${Math.sin(t*.22+i)*40}px,${Math.cos(t*.17+i)*35}px) rotate(${t*3+i*20}deg)`);
 if(key==='ppt'){const seq=t<4?0:t<6?1:t<7.5?0:1;$$('.slide').forEach((n,i)=>{n.style.opacity=i===seq?1:0;n.setAttribute('aria-hidden',i===seq?'false':'true');n.inert=i!==seq});$$('[data-slide]').forEach((n,i)=>n.setAttribute('aria-pressed',String(i===seq)));$('.slide-progress').style.transform=`scaleX(${t/duration})`}
 if(key==='closing')$$('.six-bars i').forEach((n,i)=>{const p=clamp((t-i*.15)/.4);n.style.transform=`scaleX(${ease(p)})`;n.style.opacity=clamp(p*4)});
 if(key==='opening'){const n=$('.robot');n.style.transform=`translate(${Math.min(1,t/2)*-12}px,${Math.sin(t)*6}px)`}
 window.studyRenderers.forEach(fn=>fn(t));$('#timeline').value=Math.round(t/duration*1000);$('#percent').textContent=Math.round(t/duration*100)+'%';$('#pause').disabled=!running;$('#back').disabled=t<=0&&!running;$('#state').textContent=`${document.body.dataset.label} · ${t.toFixed(2)} / ${duration.toFixed(1)}s${running?' · 播放中':t===0?' · 初态':t===duration?' · 完成':' · 暂停'}`;stage.dataset.progress=(t/duration).toFixed(4)
 }
 function stop(){cancelAnimationFrame(raf);raf=0;running=false;last=0;resumeOnVisible=false}
 function seek(value){stop();t=Math.max(0,Math.min(duration,value));revision++;render()}
 function play(dir=1,restart=false){stop();if(restart||(dir===1&&t>=duration))t=0;direction=dir;if(room.reduced()){seek(dir>0?duration:0);return}running=true;last=performance.now();render();const step=now=>{if(!running)return;t=Math.max(0,Math.min(duration,t+(now-last)/1000*direction));last=now;if(t===0&&direction<0||t===duration&&direction>0){stop();render();return}render();raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}
 const info=$('#info'),infoTitle=$('#info-title'),infoText=$('#info-text'),initialTitle=infoTitle.textContent,initialText=infoText.textContent;let opener=null;
 function explain(title,text,from){stop();render();opener=from||document.activeElement;if($('#edit-panel'))$('#edit-panel').hidden=true;infoTitle.textContent=title;infoText.textContent=text;info.showModal();$('#close-info').focus()}
 function close(){info.close();if(opener?.isConnected)opener.focus()}
 $('#play').onclick=()=>play(1);$('#pause').onclick=()=>{stop();render()};$('#back').onclick=()=>play(-1);$('#timeline').oninput=e=>seek(+e.target.value/1000*duration);$('#timeline').onpointerdown=()=>{stop();render()};$('#timeline').onpointercancel=()=>{stop();render()};$('#about').onclick=e=>explain(initialTitle,initialText,e.currentTarget);$('#close-info').onclick=close;
 info.addEventListener('close',()=>opener?.isConnected&&opener.focus());
 $$('.rule-grid button').forEach((n,i)=>n.onclick=()=>{selection=i;explain(n.textContent,['先说明假设和已知输入，再决定需要改什么。','把当前问题限定在必要改动；不把小修改扩成新框架。','未触及的内容保留原样，明确每个变化的用途。','验证实际输入与结果；本页没有运行作者代码或Skill。'][i],n)});
 $$('.play-symbol').forEach(n=>n.onclick=()=>play(1,true));
 $$('[data-skill]').forEach((n,i)=>n.onclick=()=>{selection=i;$$('[data-skill]').forEach(x=>x.setAttribute('aria-pressed',String(x===n)));explain('能力格 '+(i+1),'这是教学矩阵中的第 '+(i+1)+' 格。原片未标出每格对应的独立能力，本页不编造21个Skill的名称，也不运行外部工具。',n)});
 $$('[data-slide]').forEach((n,i)=>n.onclick=()=>seek(i===0?3.8:5.8));
 $$('.paper-hit').forEach((n,i)=>n.onclick=()=>{selection=i;$$('.paper-hit').forEach(x=>x.setAttribute('aria-pressed',String(x===n)));explain(i?'写完之后：没有承接':'写之前：素材枯竭',i?'内容离开生产线，却没有进入后续使用。画面中的掉落是一个静态比喻，不是来源已演示的持续物理运动。':'生产线在输入处断开，小人举起空箱。先明确输入材料，再决定怎样表达。插画为自编SVG重画。',n)});
 let editing=null;
 if(key==='ppt'){
  $$('.slide-photo').forEach((n,i)=>{n.onclick=()=>explain('独立建筑照片 '+(i+1),'这是一张独立生成的局部建筑照片。标题、引文和页码由HTML排版；本地选择照片不能证明作者PPT对象可编辑。',n);n.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();n.click()}}});
  $$('.slide-copy h2').forEach(n=>{n.dataset.initial=n.innerHTML;n.tabIndex=0;n.setAttribute('role','button');n.setAttribute('aria-label','修改本页HTML标题');function edit(){editing=n;explain('独立标题对象','只修改当前HTML标题，不修改照片和另一页，不是PPT编辑。',n);$('#edit-panel').hidden=false;$('#edit-value').value=n.textContent;$('#edit-value').focus()}n.onclick=edit;n.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();edit()}}});
  $('#edit-panel').onsubmit=e=>{e.preventDefault();if(!editing)return;editing.textContent=$('#edit-value').value;editing=null;close()};$('#cancel-title').onclick=()=>{editing=null;close()};
 }

 function reset(){stop();if(info.open)info.close();t=0;selection=null;$$('[data-skill],.paper-hit').forEach(n=>n.setAttribute('aria-pressed','false'));$$('.slide-copy h2').forEach(n=>n.innerHTML=n.dataset.initial);window.studyResetters.forEach(fn=>fn());revision++;render()}
 addEventListener('room-reset',reset);addEventListener('resize',fit);document.addEventListener('visibilitychange',()=>{if(document.hidden){const resume=running;stop();resumeOnVisible=resume;render()}else if(resumeOnVisible){resumeOnVisible=false;play(direction)}});room.onPreference(v=>{if(v&&running)seek(direction>0?duration:0);else render()});
 window.study={key,duration,play,pause:()=>{stop();render()},seek,reset,render,explain,state:()=>({key,t,duration,running,direction,reduced:room.reduced(),revision,selection,progress:t/duration})};fit();render();document.body.dataset.ready='true';
})();
