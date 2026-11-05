// The photograph and petals are separate layers. Timing and all local inputs are fitted supplements.
(async()=>{'use strict';
const $=s=>document.querySelector(s),photo=$('#roses'),home=$('#image-home'),canvas=$('#petals'),ctx=canvas.getContext('2d'),hero=$('.hero'),detail=$('#detail'),noteDialog=$('#note-dialog');
let paused=false,phase=0,raf=0,last=0,draws=0,width=1,height=1,onscreen=true,note='',opener=null,pan={x:0,y:0};
const seeds=Array.from({length:24},(_,i)=>({x:(i*.61803398875+.13)%1,y:(i*.41421356237+.07)%1,r:1.2+(i%5)*.45,s:.019+(i%4)*.008,spin:i*.7}));
function draw(){ctx.clearRect(0,0,width,height);seeds.forEach((p,i)=>{const y=((p.y+phase*p.s)%1)*height,x=(p.x+Math.sin(phase*.23+p.spin)*.035)*width;ctx.save();ctx.translate(x,y);ctx.rotate(p.spin+phase*.12);ctx.fillStyle='rgba(231,235,222,'+(.15+(i%4)*.065)+')';ctx.beginPath();ctx.ellipse(0,0,p.r*.57,p.r,0,0,Math.PI*2);ctx.fill();ctx.restore()});draws++}
function fit(){const r=hero.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);width=r.width;height=r.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
function stop(){cancelAnimationFrame(raf);raf=0;last=0}
function frame(now){raf=0;if(paused||room.reduced()||document.hidden||!onscreen||detail.open)return;phase+=last?Math.min(.05,(now-last)/1000):0;last=now;draw();raf=requestAnimationFrame(frame)}
function sync(){stop();if(!paused&&!room.reduced()&&!document.hidden&&onscreen&&!detail.open)raf=requestAnimationFrame(frame);$('#pause').setAttribute('aria-pressed',String(paused));$('#pause').innerHTML=paused?'Continue the petals <i>▷</i>':'Pause the petals <i>Ⅱ</i>';if(room.reduced())panTo(0,0)}
function panTo(x,y){pan={x,y};home.style.setProperty('--photo-x',x+'px');home.style.setProperty('--photo-y',y+'px')}
hero.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||room.reduced()||detail.open)return;const r=hero.getBoundingClientRect();panTo((e.clientX/r.width-.5)*-10,((e.clientY-r.top)/r.height-.5)*-7)});hero.addEventListener('pointerleave',()=>panTo(0,0));
function openPhoto(from){if(detail.open)return;opener=from;detail.showModal();$('#photo-slot').moveBefore(photo,null);sync()}
for(const id of ['view-arrangement','open-arrangement'])$('#'+id).onclick=e=>openPhoto(e.currentTarget);
$('#close-detail').onclick=()=>detail.close();detail.addEventListener('close',()=>{home.moveBefore(photo,canvas);(opener?.isConnected?opener:$('#view-arrangement')).focus({preventScroll:true});sync()});
$('#open-note').onclick=e=>{opener=e.currentTarget;$('#note').value=note;$('#note').setCustomValidity('');noteDialog.showModal();$('#note').focus({preventScroll:true})};for(const id of ['close-note','cancel-note'])$('#'+id).onclick=()=>noteDialog.close();noteDialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
$('#note').oninput=()=>$('#note').setCustomValidity('');$('#note-form').onsubmit=e=>{e.preventDefault();const input=$('#note'),value=input.value.trim();if(!value){input.setCustomValidity('Write a note to keep.');input.reportValidity();return}note=value;$('#saved-note').textContent=note;$('#saved-note').hidden=false;noteDialog.close();room.announce('笔记保存在此页，未发送到任何服务。')};
$('#pause').onclick=()=>{paused=!paused;sync();room.announce(paused?'微粒已暂停；照片和笔记仍可操作。':'微粒继续；参数为本地拟合。')};
$('#show-story').onclick=()=>$('#story').scrollIntoView({block:'start',behavior:room.reduced()?'instant':'smooth'});for(const id of ['home','back-home'])$('#'+id).onclick=()=>scrollTo({top:0,behavior:room.reduced()?'instant':'smooth'});
$('#about').onclick=e=>{opener=e.currentTarget;$('#info').showModal()};$('#close-info').onclick=()=>$('#info').close();$('#info').addEventListener('close',()=>opener?.focus({preventScroll:true}));
function reset(){[detail,noteDialog,$('#info')].filter(d=>d.open).forEach(d=>d.close());if(photo.parentElement!==home)home.moveBefore(photo,canvas);note='';$('#note-form').reset();$('#note').setCustomValidity('');$('#saved-note').hidden=true;$('#saved-note').textContent='';phase=0;paused=false;panTo(0,0);fit();sync();scrollTo({top:0,behavior:'instant'});room.announce('照片、微粒和本页笔记已复位。')}
room.onPreference(sync);addEventListener('room-reset',reset);addEventListener('resize',fit);document.addEventListener('visibilitychange',sync);new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;sync()}).observe(hero);
window.natureStudy={state:()=>({phase,paused,reduced:room.reduced(),draws,raf:!!raf,pan:{...pan},note,points:seeds.length,photoHome:photo.parentElement===home,detail:detail.open,noteOpen:noteDialog.open,onscreen}),reset};
await photo.decode();fit();sync();document.body.dataset.ready='true';
})();
