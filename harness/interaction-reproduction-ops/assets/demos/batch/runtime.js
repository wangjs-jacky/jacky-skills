// 仅复用输入/运动小工具；各视频的构图和行为由各自案例实现。
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function icon(name,size=22){const paths={mountain:'M3 19 8 5l4 6 4-4 5 12H3Z',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',sliders:'M5 3v7m0 5v6m7-18v3m0 5v10m7-18v11m0 5v2M2 12h6m1-4h6m1 8h6',compass:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM16 8l-2.5 5.5L8 16l2.5-5.5L16 8Z',route:'M7 4h10a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h10a3 3 0 0 1 0 6H7M4 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z'};return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="pointer-events:none"><path d="${paths[name]||paths.mountain}"/></svg>`}
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;try{const p=localStorage.getItem('task24-reduced');if(p!==null)reduced=p==='1'}catch{}
const jobs=new Map();
function animate(key,from,to,paint,ms=520,spring=false){
 jobs.get(key)?.();let id,st=performance.now(),off=false;
 const stop=()=>{off=true;cancelAnimationFrame(id)};jobs.set(key,stop);
 function frame(now){if(off)return;const t=clamp((now-st)/ms);let p=spring?1-Math.exp(-8*t)*Math.cos(11*t):1-(1-t)**3;if(t===1||reduced)p=1;paint(from+(to-from)*p);if(t<1&&!reduced)id=requestAnimationFrame(frame);else jobs.delete(key)}
 id=requestAnimationFrame(frame);return stop;
}
function digit(el,n){if(!el.querySelector('.digits')){el.innerHTML='<span class="digits"><span></span></span>';el.dataset.value=''}if(el.dataset.value===String(n))return;const old=el.dataset.value;el.dataset.value=String(n);const reel=$('.digits',el);reel.innerHTML='<span>'+old+'</span><span>'+n+'</span>';reel.getAnimations().forEach(a=>a.cancel());const a=reel.animate([{transform:'translateY(-50%)'},{transform:'translateY(0)'}],{duration:reduced?1:230,easing:'cubic-bezier(.2,.8,.2,1)'});reel.style.flexDirection='column-reverse';a.onfinish=()=>{reel.innerHTML='<span>'+n+'</span>';reel.style.transform='none'};}
function setup({title,hint,dark=false,brand='ROUE',html,kind='',width=920}){
 document.title=title+' · Motion studies';document.body.innerHTML=`<div class="case-tools"><a href="../index.html">← 全部示例</a><span>${title}</span><label><input id="reduce" type="checkbox"> 减少动态</label><button id="reset">复位</button></div><main><div class="viewport" style="max-width:${width}px"><section class="scene ${dark?'dark':''} ${kind}"><header class="brandbar"><strong>${brand}<i>•</i></strong><nav><span>车型</span><span>配件</span><b>骑行路线</b><span>门店</span><span>关于我们</span></nav><div class="utilities">⌕　▣　☼</div></header>${html}</section></div><p class="hint">${hint}</p><p class="feedback" aria-live="polite"></p></main>`;
 if(new URLSearchParams(location.search).has('embed'))document.body.classList.add('embedded');$('#reduce').checked=reduced;const fit=()=>{const v=$('.viewport'),s=$('.scene');const z=Math.min(1,v.clientWidth/width);s.style.width=width+'px';s.style.zoom=z;v.style.height=s.offsetHeight*z+'px'};new ResizeObserver(fit).observe($('.viewport'));requestAnimationFrame(fit);
 $('#reduce').onchange=e=>{reduced=e.target.checked;try{localStorage.setItem('task24-reduced',reduced?'1':'0')}catch{}document.documentElement.classList.toggle('reduced',reduced);document.dispatchEvent(new CustomEvent('motionchange'))};
 $('#reset').onclick=()=>location.reload();
 window.addEventListener('message',e=>{if(e.data?.type==='motion-preference'){reduced=!!e.data.reduced;$('#reduce').checked=reduced;document.documentElement.classList.toggle('reduced',reduced);document.dispatchEvent(new CustomEvent('motionchange'))}if(e.data?.type==='reset')location.reload()});
 document.documentElement.classList.toggle('reduced',reduced);window.study={title,ready:true};
}
function feedback(text){$('.feedback').textContent=text}
function point(e,el){const r=el.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}}
function bindDrag(el,{start=()=>{},move,end=()=>{},cancel=end}){let id=null;el.addEventListener('pointerdown',e=>{if(e.button!==0)return;id=e.pointerId;el.setPointerCapture(id);start(e);move(e)});el.addEventListener('pointermove',e=>{if(e.pointerId===id)move(e)});el.addEventListener('pointerup',e=>{if(e.pointerId===id){id=null;end(e)}});el.addEventListener('pointercancel',e=>{if(e.pointerId===id){id=null;cancel(e)}});el.addEventListener('lostpointercapture',e=>{if(e.pointerId===id){id=null;cancel(e)}})}
