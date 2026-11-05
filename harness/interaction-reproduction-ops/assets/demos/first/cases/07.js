(()=>{
  const M=Motion;
  const files=['alpine-blue','alpine-rock','alpine-rose','alpine-granite','alpine-glacier','alpine-forest','alpine-dusk','alpine-sunrise','aurora-bowl','nordkette'];
  const heights=[236,220,220,202,242,226,214,230,220,234];
  const descriptions=['蓝天下的雪峰','岩壁雪谷','粉色暮光雪山','暖色岩塔','冰川裂隙','雪林小径','深蓝暮色山脉','日出山脊','雪坡滑行者','青色雪服滑雪者'];
  const cards=[],bars=[],columns=document.querySelectorAll('.spot-column');
  const button=document.querySelector('.cascade-play');
  let started=0,run=0,ready=false,pendingPlay=false;
  files.forEach((file,i)=>{
    const card=document.createElement('figure');
    card.className='spot-card';card.dataset.photo=i;card.style.height=heights[i]+'px';
    const img=new Image();img.src='../assets/'+file+'.jpg';img.alt=descriptions[i];
    card.append(img);columns[i%2].append(card);cards.push(card);
    const bar=document.createElement('div');bar.className='cascade-bar';
    bar.style.cssText=`left:${i*12}px;top:${i*17}px`;
    const fill=document.createElement('i');bar.append(fill);
    document.querySelector('.cascade-bars').append(bar);bars.push(fill);
  });
  const zeros=Object.fromEntries(files.map((_,i)=>['p'+i,0]));
  const config=Object.fromEntries(files.map((_,i)=>['p'+i,{k:210,c:21}]));
  const motion=M.spring(zeros,v=>{
    let count=0;
    files.forEach((_,i)=>{
      const p=v['p'+i];
      cards[i].style.transform=`translateY(${(1-p)*58}px)`;
      cards[i].style.opacity=M.clamp(p,0,1);
      bars[i].style.width=M.clamp(p,0,1)*100+'%';
      if(p===1)count++;
    });
    M.read('count',String(count).padStart(2,'0')+' / 10');
    if(count===10)M.state(M.reduced()?'REDUCED':'COMPLETE');
  },config);
  function clear(){
    run++;pendingPlay=false;motion.stop();motion.jump(zeros);
    document.querySelector('.phone-content').scrollTop=0;
    button.textContent=ready?'播放入场':'图片准备中';
    M.state('EMPTY');
  }
  function play(){
    if(!ready){pendingPlay=true;return;}
    clear();started=performance.now();button.textContent='重放入场';
    const values=Object.fromEntries(files.map((_,i)=>['p'+i,1]));
    const options=Object.fromEntries(files.map((_,i)=>['p'+i,{delay:i*100,k:210,c:21}]));
    M.state('ENTER');motion.to(values,options);
  }
  button.disabled=true;button.textContent='图片准备中';
  button.addEventListener('click',play);
  document.querySelector('[data-clear]').addEventListener('click',clear);
  // 统一入口的“重新开始”必须重播；单项“清空”仍是独立操作。
  M.attach({motion,play,clear,get started(){return started},get run(){return run},reset:play});
  Promise.all(cards.map(c=>c.querySelector('img').decode().catch(()=>{}))).then(()=>{
    ready=true;button.disabled=false;button.textContent='播放入场';
    // 等用户触发，避免图片刚加载完、演示区仍在屏幕外时就播完。
    if(pendingPlay)play();else M.state('READY');
  });
})();
