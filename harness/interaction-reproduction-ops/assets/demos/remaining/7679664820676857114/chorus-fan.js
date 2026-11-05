(() => {
  'use strict';
  const $ = s => document.querySelector(s), stage = $('#chorus-stage'), board = $('#card-board');
  const files = ['chorus-color-field','sun-yellow','quorum-yellow-grid','quorum-deep-blue','rose-scraps','cyan-gesture','quorum-blue-orange','cyan-gesture','chorus-color-field','rose-scraps','quorum-deep-blue','quorum-blue-orange','quorum-yellow-grid','sun-yellow','umber-study','rose-scraps'];
  const titles = ['Passage','Lumen','Ochre','Blue Hour','Rose','Current','Interval','Estuary','Bore','Paper','Night','Measure','Gold','Solar','Study','Afterglow'];
  const cards = [], indices = [], flipped = new Set();
  let mode = 'fan', teaching = false, active = 8, hovered = -1, focused = -1;
  let phase = 'idle', token = 0, poses = [], history = [], inputs = [];
  files.forEach((file,i) => {
    const n = document.createElement('button');
    n.className = 'plate'; n.dataset.plate = String(i); n.setAttribute('aria-label',titles[i]+' · 第'+(i+1)+'张画，点击翻面');n.setAttribute('aria-pressed','false');
    const lift = document.createElement('div');lift.className='lift';
    const flipper = document.createElement('div');flipper.className='flipper';
    const front = document.createElement('div');front.className='front';front.setAttribute('aria-hidden','false');
    const image = document.createElement('img');image.src='assets/'+file+'.png';image.alt=titles[i]+'独立生成画作';image.draggable=false;front.append(image);
    const caption = document.createElement('span');caption.className='caption';
    const title = document.createElement('b');title.textContent=titles[i];
    const number = document.createElement('small');number.textContent='PLATE '+String(i+1).padStart(2,'0');caption.append(title,number);front.append(caption);
    const back = document.createElement('div');back.className='back';back.setAttribute('aria-hidden','true');
    const label = document.createElement('small');label.textContent='PLATE '+String(i+1).padStart(2,'0');
    const heading = document.createElement('b');heading.textContent=titles[i];
    const description = document.createElement('span');description.textContent='An independent study in colour, texture and rhythm. One plate in a collection, seen from another side.';
    back.append(label,heading,description);flipper.append(front,back);lift.append(flipper);n.append(lift);board.append(n);cards.push(n);
    const nav = document.createElement('button');nav.textContent=String(i+1).padStart(2,'0');nav.setAttribute('aria-label','选择第'+(i+1)+'张画');nav.onclick=e=>{log('index',e,i);active=i;cards[i].focus({preventScroll:true});paintLift()};$('#plate-index').append(nav);indices.push(nav);
    n.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=i;paintLift()}});
    n.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hovered=-1;paintLift()}});
    n.addEventListener('focus',()=>{focused=i;active=i;paintLift()});
    n.addEventListener('blur',()=>{if(focused===i)focused=-1;paintLift()});
    n.addEventListener('click',e=>{log('flip',e,i);active=i;toggle(i)});
    n.addEventListener('keydown',e=>{
      if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
        e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?15:(i+(e.key==='ArrowRight'?1:15))%16;cards[next].focus({preventScroll:true});
      }
    });
  });
  function log(kind,e,index=null){inputs.push({kind,index,trusted:e?.isTrusted??false,at:e?.timeStamp??performance.now()});if(inputs.length>150)inputs.shift()}
  function paintLift(){cards.forEach((n,i)=>{const lift=i===hovered||i===focused;n.classList.toggle('lifted',lift);n.style.zIndex=String(lift?100+i:Math.round(20-Math.abs(i-7.5)));indices[i].setAttribute('aria-current',String(i===active))});}
  function toggle(i){if(flipped.has(i))flipped.delete(i);else flipped.add(i);cards[i].classList.toggle('flipped',flipped.has(i));cards[i].setAttribute('aria-pressed',String(flipped.has(i)));cards[i].querySelector('.front').setAttribute('aria-hidden',String(flipped.has(i)));cards[i].querySelector('.back').setAttribute('aria-hidden',String(!flipped.has(i)));room.announce('第'+(i+1)+'张 · '+(flipped.has(i)?'文字背面':'画作正面'));}
  function apply(instant=false){
    const local=++token, width=board.clientWidth, mobile=width<600, scale=width/1180;
    phase='moving';if(instant)stage.classList.add('no-motion');
    const w=mobile?58:140*scale, h=w*1.38;
    poses=[];
    if(mode==='fan'){
      const radius=mobile?width*.54:500*scale;
      cards.forEach((n,i)=>{const angle=(i-7.5)*(teaching?4.5:3.8),rad=angle*Math.PI/180;
        poses.push({x:radius*Math.sin(rad)-w/2,y:80+radius*(1-Math.cos(rad)),angle,w,h});
      });
    }else{
      const cols=teaching?5:mobile?4:8;
      const gap=mobile?8:11*scale, area=mobile?width-24:width*.89;
      const cw=(area-(cols-1)*gap)/cols, heights=Array(cols).fill(12), origin=-area/2;
      cards.forEach((n,i)=>{const col=i%cols,row=Math.floor(i/cols),ch=teaching?cw*([.95,1.18,1.05,1.4,.86][i%5]):mobile?cw*1.14:cw*1.08;
        const y=teaching?heights[col]:12+row*(ch+gap);poses.push({x:origin+col*(cw+gap),y,angle:0,w:cw,h:ch});if(teaching)heights[col]+=ch+gap;
      });
    }
    cards.forEach((n,i)=>{const p=poses[i];n.style.width=p.w+'px';n.style.height=p.h+'px';n.style.transform=`translate(${p.x}px,${p.y}px) rotate(${p.angle}deg)`});
    stage.classList.toggle('wall',mode==='wall');stage.classList.toggle('teaching',teaching);
    $('#layout-fan').setAttribute('aria-pressed',String(mode==='fan'));$('#layout-wall').setAttribute('aria-pressed',String(mode==='wall'));
    $('#layout-note').textContent=teaching?'教学对照：五列不等高图墙与棕色人脸示意单独标注；原片产品是16卡双行墙。当前几何/文字是本地拟合，不是作者源码。':'产品是16张同节点画卡，在扇形和双行图墙之间连续重排。4.5°教学/180°沿旁注；产品3.8°步距、尺寸/曲线拟合，背面文字和手机四列布局补写；素材为独立画作。';
    void board.offsetWidth;
    if(instant)stage.classList.remove('no-motion');
    const animations=cards.flatMap(n=>n.getAnimations({subtree:true}));
    if(instant||room.reduced()||!animations.length){phase='idle';return;}
    Promise.allSettled(animations.map(a=>a.finished)).then(()=>{if(local!==token)return;phase='idle';history.push({mode,teaching,kind:'settled',at:performance.now()})});
  }
  function setMode(next,e){mode=next;log('layout-'+mode,e);hovered=focused=-1;paintLift();history.push({mode,teaching,kind:'begin',at:performance.now()});apply();room.announce((teaching?'教学':'产品')+' · '+(mode==='fan'?'扇形手牌':'图墙'));}
  $('#layout-fan').onclick=e=>setMode('fan',e);$('#layout-wall').onclick=e=>setMode('wall',e);
  $('#teaching').onchange=e=>{teaching=e.target.checked;cards[7].querySelector('img').src='assets/'+(teaching?'umber-study':files[7])+'.png';active=7;log('teaching',e);apply();};
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;e.preventDefault();if(flipped.size){for(const i of flipped){cards[i].classList.remove('flipped');cards[i].setAttribute('aria-pressed','false');cards[i].querySelector('.front').setAttribute('aria-hidden','false');cards[i].querySelector('.back').setAttribute('aria-hidden','true')}flipped.clear();room.announce('已回到全部画作正面')}else if(mode==='wall')setMode('fan',e);});
  room.onPreference(()=>apply(true));
  addEventListener('room-reset',()=>{mode='fan';teaching=false;active=8;hovered=focused=-1;$('#teaching').checked=false;cards[7].querySelector('img').src='assets/'+files[7]+'.png';flipped.clear();cards.forEach(n=>{n.classList.remove('flipped');n.setAttribute('aria-pressed','false');n.querySelector('.front').setAttribute('aria-hidden','false');n.querySelector('.back').setAttribute('aria-hidden','true')});history=[];inputs=[];paintLift();apply(true);room.announce('十六张原画卡，扇形正面')});
  new ResizeObserver(()=>apply(true)).observe(board);
  Object.defineProperty(window,'chorusFanState',{get:()=>({mode,teaching,active,hovered,focused,phase,token,flipped:[...flipped],poses:poses.map(p=>({...p})),count:cards.length,imageCount:board.querySelectorAll('img').length,reduced:room.reduced(),history:[...history],inputs:[...inputs]})});
  paintLift();apply(true);document.body.dataset.ready='true';room.announce('十六张画卡，悬停抬升、点击翻面');
})();
