(()=>{
 const M=Motion,button=document.querySelector('.press-surface'),group=document.querySelector('.exploded'),layers=[...document.querySelectorAll('.layer')];
 let timer=0,holding=false,armed=false,pointer=null;
 const motion=M.spring({tilt:0,z1:0,z2:0,z3:0},v=>{
  group.style.transform=`rotateX(${52*v.tilt}deg) rotateZ(${-28*v.tilt}deg)`;
  layers.forEach((layer,i)=>{const p=i?v['z'+i]:0;layer.style.transform=`translateZ(${i*70*p}px)`;layer.style.setProperty('--plane',.025*M.clamp(v.tilt,0,1));});
  const gap=(v.z1+v.z2+v.z3)/3*70,count=1+[v.z1,v.z2,v.z3].filter(x=>x>.7).length;
  M.read('tilt',(52*v.tilt).toFixed(1)+'°');M.read('gap',Math.round(gap)+' px');M.read('layers',count+' / 4');document.querySelector('[data-layers]').textContent=count+' / 4';
  if(holding&&v.tilt===1&&v.z3===1)M.state('EXPLODED');
  if(!holding&&v.tilt===0&&v.z1===0&&v.z2===0&&v.z3===0)M.state('FLAT');
 },{tilt:{k:220,c:29},z1:{k:260,c:23},z2:{k:260,c:23},z3:{k:260,c:23}});
 function open(){if(!armed)return;holding=true;M.state('EXPAND');motion.to({tilt:1,z1:1,z2:1,z3:1},{z1:{delay:100},z2:{delay:200},z3:{delay:300}});}
 function release(){clearTimeout(timer);armed=false;pointer=null;holding=false;M.state('RETURN');motion.to({tilt:0,z1:0,z2:0,z3:0});}
 button.addEventListener('pointerdown',e=>{if(e.button!==0||pointer!==null)return;pointer=e.pointerId;armed=true;button.setPointerCapture(pointer);M.state('HOLD');timer=setTimeout(open,350);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>{if(pointer!==null||holding)release();});
 button.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)&&!e.repeat){e.preventDefault();armed=true;open();}if(e.key==='Escape')release();});
 button.addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();release();}});addEventListener('blur',release);
 M.attach({motion,get holding(){return holding},reset(){release();motion.jump({tilt:0,z1:0,z2:0,z3:0});M.state('FLAT');}});
})();
