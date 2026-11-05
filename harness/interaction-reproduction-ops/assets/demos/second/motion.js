/* 仅共享本页所需的弹簧、坐标与输入辅助；无依赖、无业务轮询。 */
(()=>{
  let forced=false;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const controllers=new Set();
  const reduced=()=>forced||media.matches;
  const prefs=()=>{document.documentElement.dataset.reduced=String(reduced());for(const c of controllers)if(reduced())c.finish();window.dispatchEvent(new CustomEvent('motion-preference',{detail:reduced()}));};
  media.addEventListener('change',prefs);
  addEventListener('message',e=>{if(e.source!==parent)return;if(e.data?.type==='motion-prefs'){forced=!!e.data.reduced;prefs()}if(e.data?.type==='reset-demo')window.demo?.reset()});
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function response(t,k=210,c=18){if(t<=0)return 0;const a=c/2,w=Math.sqrt(Math.max(.0001,k-a*a));return 1-Math.exp(-a*t)*(Math.cos(w*t)+a/w*Math.sin(w*t));}
  function chartAt(x,data,threshold=.14){x=clamp(x,0,data.length-1);const near=Math.round(x);if(Math.abs(x-near)<=threshold)return{x:near,value:data[near],snap:near};const i=Math.floor(x);return{x,value:data[i]+(data[Math.min(i+1,data.length-1)]-data[i])*(x-i),snap:-1};}
  function rubber(y,min,max){const d=y<min?y-min:y>max?y-max:0;return d?(d<0?min:max)+Math.sign(d)*130*(1-Math.exp(-Math.abs(d)/330)):y;}
  function anchor(y,velocity,anchors){const projected=y+clamp(velocity,-2200,2200)*.18;return anchors.reduce((a,b)=>Math.abs(b-projected)<Math.abs(a-projected)?b:a);}
  function spring(initial,update,config={}){
    const fields=Object.fromEntries(Object.entries(initial).map(([key,x])=>[key,{x,v:0,target:x,k:config[key]?.k||210,c:config[key]?.c||20,at:0,last:performance.now()}]));
    let raf=0,last=0;
    const values=()=>Object.fromEntries(Object.entries(fields).map(([k,f])=>[k,f.x]));
    const draw=()=>update(values());
    function advance(f,now){
      if(now<f.at)return;const dt=Math.max(0,(now-f.last)/1000);f.last=now;if(!dt)return;
      const y=f.x-f.target,a=f.c/2,d=f.k-a*a,e=Math.exp(-a*dt);let nx,nv;
      if(d>.000001){const w=Math.sqrt(d),co=Math.cos(w*dt),si=Math.sin(w*dt);nx=e*(y*co+(f.v+a*y)/w*si);nv=e*(f.v*co-(a*f.v+f.k*y)/w*si)}
      else if(d<-.000001){const z=Math.sqrt(-d),r1=-a+z,r2=-a-z,A=(f.v-r2*y)/(r1-r2),B=y-A;nx=A*Math.exp(r1*dt)+B*Math.exp(r2*dt);nv=A*r1*Math.exp(r1*dt)+B*r2*Math.exp(r2*dt)}
      else{const b=f.v+a*y;nx=e*(y+b*dt);nv=e*(f.v-a*b*dt)}
      f.x=f.target+nx;f.v=nv;
    }
    function frame(now){let busy=false;
      for(const f of Object.values(fields)){if(now<f.at){busy=true;continue}advance(f,now);if(Math.abs(f.x-f.target)>.0005||Math.abs(f.v)>.002)busy=true;else{f.x=f.target;f.v=0}}
      draw();if(busy&&!reduced())raf=requestAnimationFrame(frame);else raf=0;
    }
    const api={get values(){return values()},get settled(){return !raf},to(target,options={}){for(const [key,value]of Object.entries(target)){const f=fields[key];if(!f)continue;advance(f,performance.now());f.target=value;f.at=performance.now()+(options[key]?.delay||0);f.last=f.at;if(options[key]?.k)f.k=options[key].k;if(options[key]?.c)f.c=options[key].c;}if(reduced())api.finish();else if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}return api;},jump(target){for(const [k,x]of Object.entries(target)){const f=fields[k];if(f){f.x=f.target=x;f.v=0;f.at=0;f.last=performance.now()}}draw();return api},finish(){if(raf)cancelAnimationFrame(raf);raf=0;for(const f of Object.values(fields)){f.x=f.target;f.v=0;f.at=0;f.last=performance.now()}draw()},stop(){if(raf)cancelAnimationFrame(raf);raf=0},destroy(){api.stop();controllers.delete(api)}};
    controllers.add(api);draw();return api;
  }
  function fit(){const world=document.querySelector('.world');if(!world)return;const w=world.offsetWidth,h=world.offsetHeight;world.style.setProperty('--fit',Math.min(innerWidth/w,innerHeight/h,1));}
  function read(key,text){const el=document.querySelector('[data-read="'+key+'"]');if(el)el.textContent=text;}
  function state(value){document.body.dataset.state=value;read('state',value);if(parent!==window)parent.postMessage({type:'demo-state',state:value,case:document.body.dataset.case},'*');}
  function attach(demo){window.demo=demo;document.querySelector('[data-reset]')?.addEventListener('click',()=>demo.reset());fit();}
  window.Motion={spring,response,chartAt,rubber,anchor,clamp,reduced,read,state,attach,fit};
  addEventListener('resize',fit);addEventListener('DOMContentLoaded',fit);prefs();
})();
