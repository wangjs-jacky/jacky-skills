(()=>{
 const M=Motion,scroller=document.querySelector('.film-scroll'),player=document.querySelector('.player'),video=document.querySelector('video'),restore=document.querySelector('.restore-player'),toggle=document.querySelector('.film-toggle'),status=document.querySelector('.film-status');
 let returning=false,stream=null,drawFrame=0,ready=false,progress=0;
 for(let i=0;i<12;i++){const row=document.createElement('div');row.className='comment';row.innerHTML=`<span class="avatar"></span><span class="comment-copy"><i style="width:${90+i%3*19}px"></i><i style="width:${70+i%4*7}%"></i></span>`;document.querySelector('.comments').append(row);}
 function update(){const g=Kinetics.mini(scroller.scrollTop);progress=g.p;player.style.left=g.x+'px';player.style.top=g.y+'px';player.style.width=g.w+'px';player.style.height=g.h+'px';player.style.borderRadius=(18-8*g.p)+'px';player.classList.toggle('mini',g.p===1);restore.setAttribute('aria-label',g.p>.05?'点击小窗回到顶部':'播放或暂停影片');M.read('scroll',Math.round(scroller.scrollTop)+' px');M.read('width',Math.round(g.w)+' px');M.state(g.p===0?'FULL':g.p===1?'MINI':'SHRINK');}
 const motion=M.spring({s:0},v=>{if(returning){scroller.scrollTop=Math.max(0,v.s);update();if(v.s===0)returning=false;}},{s:{k:230,c:29}});
 scroller.addEventListener('scroll',update,{passive:true});
 function interrupt(){if(returning){returning=false;motion.stop();}}
 for(const event of ['wheel','touchstart','pointerdown','keydown'])scroller.addEventListener(event,interrupt,{passive:true});
 function back(){motion.stop();motion.jump({s:scroller.scrollTop});returning=true;motion.to({s:0});}
 async function playPause(){if(!ready)return;if(video.paused){try{await video.play();}catch{status.textContent='请再次点击播放';}}else video.pause();}
 restore.addEventListener('click',()=>{if(progress>.05)back();else playPause();});toggle.addEventListener('click',playPause);
 // 自制素材源与交互分离：Canvas仅产生影片画面；小窗位置由真实滚动控制。
 // 照片使用data URL，保证file入口下Canvas仍保持origin-clean。
 const canvas=document.createElement('canvas');canvas.width=940;canvas.height=528;const ctx=canvas.getContext('2d'),image=new Image();image.src=window.FILM_PHOTO;
 function draw(now=0){const iw=image.naturalWidth,ih=image.naturalHeight;if(!iw)return;const sw=iw*.92,sh=sw*528/940,sx=(iw-sw)/2+Math.sin(now/8500)*iw*.018,sy=Math.max(0,Math.min(ih-sh,ih*.5-sh/2+Math.cos(now/10500)*ih*.025));ctx.drawImage(image,sx,sy,sw,sh,0,0,940,528);for(let i=0;i<28;i++){const x=(i*137.7+now*.006)%940,y=(i*73.1+now*(.014+i%3*.004))%528;ctx.beginPath();ctx.fillStyle='rgba(255,255,255,.55)';ctx.arc(x,y,1.2+i%3*.5,0,Math.PI*2);ctx.fill();}if(!video.paused)drawFrame=requestAnimationFrame(draw);}
 image.onload=()=>{try{draw();if(!canvas.captureStream)throw Error('captureStream');stream=canvas.captureStream(30);video.srcObject=stream;ready=true;toggle.disabled=false;toggle.textContent='播放影片';status.textContent='自制示意片 · 可离线';}catch{status.textContent='此浏览器不支持示意影片源，交互可看但播放未验证';}};
 image.onerror=()=>{status.textContent='自制照片未能载入';};
 video.addEventListener('play',()=>{toggle.textContent='暂停影片';cancelAnimationFrame(drawFrame);drawFrame=requestAnimationFrame(draw);});
 video.addEventListener('pause',()=>{toggle.textContent='播放影片';cancelAnimationFrame(drawFrame);drawFrame=0;});
 video.addEventListener('timeupdate',()=>{M.read('time',video.currentTime.toFixed(2)+' s');document.querySelector('.film-progress i').style.width=(video.currentTime%12)/12*100+'%';});
 addEventListener('beforeunload',()=>{cancelAnimationFrame(drawFrame);stream?.getTracks().forEach(t=>t.stop());});
 M.attach({motion,get video(){return video},get progress(){return progress},get returning(){return returning},reset(){returning=false;motion.stop();scroller.scrollTop=0;video.pause();if(ready){stream?.getTracks().forEach(t=>t.stop());draw(0);stream=canvas.captureStream(30);video.srcObject=stream;}M.read('time','0.00 s');document.querySelector('.film-progress i').style.width='0%';update();status.textContent='自制示意片 · 已复位并暂停';}});update();
})();
