(()=>{
 const M=Motion,deck=document.querySelector('.swipe-deck'),screen=document.querySelector('.screen'),cards=[...document.querySelectorAll('.travel-card')];
 let order=[0,1,2],phase='IDLE',pointer=null,startX=0,originX=0;
 const fit=()=>screen.getBoundingClientRect().width/screen.offsetWidth;
 const motion=M.spring({x:0,p:0},v=>{
  order.forEach((id,rank)=>{
   const p=M.clamp(v.p,0,1),x=rank===0?v.x:0,y=rank===0?0:rank*12-12*p,scale=rank===0?1:1-rank*.06+.06*p;
   cards[id].style.transform=`translate(${x}px,${y}px) rotate(${rank===0?v.x*.06:0}deg) scale(${scale})`;
   cards[id].style.zIndex=String(10-rank);cards[id].querySelector('.pick').style.opacity=rank===0?M.clamp(Math.abs(v.x)/80,0,1):0;
  });
  M.read('x',Math.round(v.x)+' px');M.read('rotate',(v.x*.06).toFixed(1)+'°');M.read('scale',(.94+.06*M.clamp(v.p,0,1)).toFixed(2));document.querySelector('[data-index]').textContent=String(order[0]+1).padStart(2,'0')+' / 03';
  if(phase==='FLY'&&Math.abs(v.x)>720&&v.p===1){order.push(order.shift());phase='IDLE';motion.jump({x:0,p:0});M.state('IDLE');}
  if(phase==='RETURN'&&v.x===0){phase='IDLE';M.state('IDLE');}
 },{x:{k:240,c:27},p:{k:230,c:26}});
 const back=()=>{pointer=null;phase='RETURN';M.state('RETURN');motion.to({x:0,p:0});};
 function fly(sign){pointer=null;phase='FLY';M.state('FLY');motion.to({x:sign*800,p:1});}
 deck.addEventListener('pointerdown',e=>{if(e.button!==0||phase==='FLY'||pointer!==null)return;const card=e.target.closest('[data-card]');if(!card||Number(card.dataset.card)!==order[0])return;motion.stop();originX=motion.values.x;startX=e.clientX;pointer=e.pointerId;phase='DRAG';M.state('DRAG');deck.setPointerCapture(pointer);});
 deck.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;motion.jump({x:originX+(e.clientX-startX)/fit(),p:0});});
 deck.addEventListener('pointerup',e=>{if(pointer!==e.pointerId)return;const sign=Kinetics.swipeSign(motion.values.x,400);if(sign)fly(sign);else back();});
 for(const type of ['pointercancel','lostpointercapture'])deck.addEventListener(type,()=>{if(pointer!==null)back();});
 deck.addEventListener('keydown',e=>{if(e.key==='Escape'){back();return;}if(!['ArrowLeft','ArrowRight'].includes(e.key)||phase==='FLY')return;e.preventDefault();fly(e.key==='ArrowLeft'?-1:1);});
 M.attach({motion,get order(){return [...order]},get phase(){return phase},reset(){pointer=null;phase='IDLE';order=[0,1,2];motion.stop();motion.jump({x:0,p:0});M.state('IDLE');}});
})();
