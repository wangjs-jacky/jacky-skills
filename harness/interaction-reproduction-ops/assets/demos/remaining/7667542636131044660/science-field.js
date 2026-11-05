// Self-drawn visual approximation of iron-filings field lines. This is not
// recovered author code, a physical simulation, or a pointer interaction.
(()=>{'use strict';
 function paint(canvas){const ctx=canvas.getContext('2d');let seed=88421;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 ctx.clearRect(0,0,720,900);ctx.lineCap='round';
 // Three separate bundles on each side keep the surrounding paper quiet.
 // Cubic curves and radial clusters are fitted visual marks, not field data.
 function point(t,w,side,offset){const u=1-t;return{x:360+side*3*u*t*w*1.32+offset,y:u*u*u*333+3*u*u*t*(220-w*.7)+3*u*t*t*(650+w*.25)+t*t*t*535}}
 function stroke(x,y,dx,dy,alpha){ctx.strokeStyle=`rgba(58,66,76,${alpha})`;ctx.lineWidth=.35+random()*.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke()}
 for(const side of [-1,1])for(const width of [180,270,345])for(let stream=0;stream<40;stream++){const w=width+(random()-.5)*12,offset=(random()-.5)*7;
  for(let step=0;step<190;step++){if(random()<.25)continue;const t=step/190,a=point(t,w,side,offset),z=point(Math.min(1,t+.003+random()*.005),w,side,offset);stroke(a.x+(random()-.5)*3,a.y+(random()-.5)*3,z.x-a.x,z.y-a.y,.08+random()*.16)}
 }
 for(const side of [-1,1])for(let ray=0;ray<520;ray++){const dx=(random()-.5)*370,dy=(55+random()*155)*side,base=side<0?333:535;
  for(let j=0;j<26;j++){const t=j/26;if(random()>.74-t*.4)continue;const curve=1-t*.27,x=360+dx*t*curve+(random()-.5)*5,y=base+dy*t;stroke(x,y,dx/65*curve,dy/65,.12+random()*.22)}
 }
 for(let i=0;i<220;i++){const x=random()*720,y=80+random()*720;ctx.fillStyle=`rgba(75,88,96,${.06+random()*.12})`;ctx.beginPath();ctx.arc(x,y,.25+random()*.8,0,Math.PI*2);ctx.fill()}
 canvas.dataset.drawn='true';
 }
 document.querySelectorAll('canvas.scientific-field').forEach(paint);
})();
