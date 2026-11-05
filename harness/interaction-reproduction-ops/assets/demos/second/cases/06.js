(()=>{
 const M=Motion,list=document.querySelector('.menu-list'),nav=document.querySelector('.categories'),highlight=document.querySelector('.category-highlight');
 const data=[['Rice',['Salmon bowl','Egg rice'],['alpine-blue','alpine-rock']],['Noodles',['Cold soba','Udon'],['alpine-rose','nordkette']],['Soup',['Miso','Corn soup'],['alpine-rock','alpine-dusk']],['Tea',['Barley tea','Oolong'],['nordkette','alpine-blue']],['Snacks',['Rice cake','Sesame bar'],['alpine-dusk','alpine-rose']]];
 const buttons=[],groups=[];let active=0,locked=null,target=0;
 data.forEach(([name,items,photos],i)=>{
  const button=document.createElement('button');button.className='category';button.textContent=name;button.dataset.category=i;button.setAttribute('aria-pressed',String(i===0));button.addEventListener('click',()=>go(i));button.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?4:(i+(e.key==='ArrowDown'?1:4))%5;buttons[n].focus();go(n);});nav.append(button);buttons.push(button);
  const group=document.createElement('section');group.className='menu-group';group.dataset.group=i;group.innerHTML='<h2>'+name.toUpperCase()+'</h2>'+items.map((item,j)=>`<div class="menu-item"><img src="../assets/${photos[j]}.jpg" alt="雪山缩略图"><div><strong>${item}</strong><i></i></div></div>`).join('');list.append(group);groups.push(group);
 });
 function setActive(i){active=i;highlight.style.transform=`translateY(${i*58}px)`;buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===i)));M.read('active',data[i][0]);M.read('index',(i+1)+' / 5');}
 const tops=()=>groups.map(g=>g.offsetTop);
 function spy(){M.read('scroll',Math.round(list.scrollTop)+' px');if(locked===null)setActive(Kinetics.active(tops(),list.scrollTop,list.scrollHeight-list.clientHeight));}
 const motion=M.spring({s:0},v=>{if(locked!==null){list.scrollTop=v.s;M.read('scroll',Math.round(list.scrollTop)+' px');if(Math.abs(v.s-target)<.35){list.scrollTop=target;locked=null;M.state('MANUAL');}}},{s:{k:260,c:34}});
 function go(i){target=Math.min(groups[i].offsetTop,list.scrollHeight-list.clientHeight);locked=i;setActive(i);M.state('PROGRAM');motion.stop();motion.jump({s:list.scrollTop});motion.to({s:target});}
 function interrupt(){if(locked!==null){locked=null;motion.stop();spy();M.state('MANUAL');}}
 list.addEventListener('scroll',spy,{passive:true});for(const event of ['wheel','touchstart','pointerdown','keydown'])list.addEventListener(event,interrupt,{passive:true});
 addEventListener('resize',()=>{if(locked!==null){target=Math.min(groups[locked].offsetTop,list.scrollHeight-list.clientHeight);motion.to({s:target});}else spy();});
 M.attach({motion,get active(){return active},get locked(){return locked},get list(){return list},get offsets(){return tops()},reset(){locked=null;motion.stop();motion.jump({s:0});list.scrollTop=0;setActive(0);M.state('MANUAL');}});setActive(0);spy();
})();
