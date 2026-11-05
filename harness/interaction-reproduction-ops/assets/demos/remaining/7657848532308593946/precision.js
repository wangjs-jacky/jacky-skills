(()=>{'use strict';
const $=s=>document.querySelector(s),ns='http://www.w3.org/2000/svg',movement=$('#movement'),svg=$('#gears'),dialog=$('#movement-dialog'),info=$('#information'),wheelData=[{x:366,y:310,r:160,n:38,ratio:1},{x:225,y:202,r:69,n:28,ratio:-1.92},{x:535,y:202,r:67,n:28,ratio:-2},{x:219,y:432,r:60,n:24,ratio:-2.25},{x:544,y:430,r:74,n:30,ratio:-1.8}];
let angle=0,speed=1,direction=1,playing=true,raf=0,last=0,drag=null,origin=null,infoOrigin=null;
const node=(tag,attrs,parent)=>{const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));parent.append(n);return n};
const wheels=wheelData.map((d,i)=>{const g=node('g',{class:'wheel','data-wheel':i,transform:`translate(${d.x} ${d.y})`},$('#gear-assembly')),rotor=node('g',{'data-rotor':i},g);const contour=phase=>{let p='';for(let n=0;n<=d.n*24;n++){const t=n/(d.n*24)*Math.PI*2,q=d.n*t+phase,a=t+.022*Math.cos(q),r=d.r*(.87+.23*Math.pow((1+Math.sin(q))/2,3));p+=(n?'L':'M')+(Math.cos(a)*r).toFixed(3)+' '+(Math.sin(a)*r).toFixed(3)}return p+'Z'};node('path',{d:contour(0)},rotor);node('path',{d:contour(.20),opacity:.34},rotor);node('path',{d:contour(.40),opacity:.14},rotor);node('circle',{r:d.r*.91,class:'rim'},rotor);node('circle',{r:i?1.2:1.6,class:'hub'},rotor);return rotor});
function render(){wheels.forEach((n,i)=>n.setAttribute('transform',`rotate(${angle*wheelData[i].ratio+i*11})`));$('#speed-value').textContent=speed.toFixed(1)+'×';$('#play').setAttribute('aria-pressed',String(playing));$('#play').textContent=playing?'暂停齿轮':'播放齿轮';$('#direction').setAttribute('aria-pressed',String(direction<0));$('#direction').textContent='方向 · '+(direction>0?'正向':'反向')}
function stopFrame(){if(raf)cancelAnimationFrame(raf);raf=0;last=0}
function frame(now){raf=0;if(!playing||room.reduced()||document.hidden||drag)return;const dt=last?Math.min(.05,(now-last)/1000):0;last=now;angle+=dt*9*speed*direction;render();raf=requestAnimationFrame(frame)}
function animate(){stopFrame();if(playing&&!room.reduced()&&!document.hidden&&!drag)raf=requestAnimationFrame(frame)}
function announce(s){room.announce(s)}
$('#play').onclick=()=>{playing=!playing;render();animate();announce(playing?(room.reduced()?'减少动态已启用，保留播放意图并保持静止':'五个齿轮连续转动'):'运动已暂停')};
$('#direction').onclick=()=>{direction*=-1;render();announce('方向已切换；当前角度保持')};
$('#speed').oninput=e=>{speed=Number(e.currentTarget.value);render();announce('本地转速 '+speed.toFixed(1)+'×')};
movement.tabIndex=0;movement.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home',' '].includes(e.key))return;e.preventDefault();if(e.key===' '){$('#play').click();return}angle=e.key==='Home'?0:angle+(e.key==='ArrowRight'?5:-5);render();announce('键盘转动同一组齿轮')});
movement.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;const r=movement.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,angle};movement.setPointerCapture(e.pointerId);movement.classList.add('dragging');stopFrame()});
movement.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;angle=drag.angle+(e.clientX-drag.x)*.36-(e.clientY-drag.y)*.13;render()});
function endDrag(e,cancel=false){if(drag?.id!==e.pointerId)return;if(cancel)angle=drag.angle;drag=null;movement.classList.remove('dragging');if(movement.hasPointerCapture(e.pointerId))movement.releasePointerCapture(e.pointerId);render();animate();announce(cancel?'拖动取消，角度已返回':'同一组几何已停在当前角度')}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag){e.preventDefault();e.stopPropagation();endDrag({pointerId:drag.id},true)}},true);
movement.addEventListener('pointerup',e=>endDrag(e));movement.addEventListener('pointercancel',e=>endDrag(e,true));movement.addEventListener('lostpointercapture',e=>{if(drag?.id===e.pointerId)endDrag(e,true)});
function restore(focus=true){if(movement.parentElement!==$('#movement-home'))$('#movement-home').append(movement);if(focus)origin?.focus({preventScroll:true});origin=null}
function closeMovement(){if(dialog.open)dialog.close();restore()}
$('#inspect').onclick=e=>{if(dialog.open)return;origin=e.currentTarget;$('#movement-detail').append(movement);dialog.showModal();announce('放大查看同一SVG和五个原齿轮')};$('#close-movement').onclick=closeMovement;dialog.addEventListener('cancel',e=>{e.preventDefault();closeMovement()});dialog.addEventListener('close',()=>{if(!dialog.open)restore()});
function closeInfo(){if(info.open)info.close();infoOrigin?.focus({preventScroll:true});infoOrigin=null}$('#about').onclick=e=>{infoOrigin=e.currentTarget;info.showModal()};$('#close-info').onclick=closeInfo;info.addEventListener('cancel',e=>{e.preventDefault();closeInfo()});
function reset(){stopFrame();if(drag){if(movement.hasPointerCapture(drag.id))movement.releasePointerCapture(drag.id);drag=null}movement.classList.remove('dragging');closeMovement();closeInfo();angle=0;speed=1;direction=1;playing=false;$('#speed').value='1';render();announce('齿轮、方向、速度和放大视图已复位')}
room.onPreference(()=>{animate();render()});addEventListener('visibilitychange',animate);addEventListener('room-reset',reset);
window.precisionStudy={state:()=>({angle,speed,direction,playing,dragging:!!drag,opened:dialog.open,reduced:room.reduced(),wheels:wheels.length,geometry:svg.querySelectorAll('path,circle').length}),reset};render();animate();document.body.dataset.ready='true';
})();
