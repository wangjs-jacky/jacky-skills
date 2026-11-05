// 原文约束对应的少量纯函数；视口布局和动画系数仍由各案例负责。
((root)=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const K={
  swipeSign(x,width){return Math.abs(x)>width*.35?Math.sign(x):0;},
  mini(scroll){const t=clamp((scroll-50)/130,0,1),p=t*t*(3-2*t);return{p,w:470-270*p,h:(470-270*p)*9/16,x:30+280*p,y:20+(600-20-200*9/16-20)*p};},
  active(tops,scroll,max){if(scroll>=max-.5&&scroll>0)return tops.length-1;let i=0;for(let j=1;j<tops.length;j++)if(tops[j]<=scroll+6)i=j;return i;}
 };
 if(typeof module!=='undefined'&&module.exports)module.exports=K;else root.Kinetics=K;
})(typeof window==='undefined'?globalThis:window);
