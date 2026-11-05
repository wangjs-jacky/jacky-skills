(()=>{
 const $=s=>document.querySelector(s),cards=[...document.querySelectorAll('.wall-card')],dialog=$('#viewer'),slot=dialog.querySelector('.slot');let selected=-1,origin=null,frame=null;
 const locations=[15,181,341,495],angles=[-5,-2,1,5],tops=[38,20,45,55];
 function paint(t){cards.forEach((n,i)=>{const p=Math.max(0,Math.min(1,(t-1.2-i*.55)/.65)),e=1-(1-p)**3;n.style.opacity=e;n.style.transform=`translate(${locations[i]+(1-e)*260}px,${tops[i]+(1-e)*40}px) rotate(${angles[i]+(1-e)*5}deg)`;n.inert=e<.99;n.setAttribute('aria-hidden',e<.01?'true':'false')})}
 function applyPrefs(){for(const n of document.querySelectorAll('.wall-card iframe,#viewer iframe'))n.contentWindow?.postMessage({type:'motion-prefs',reduced:room.reduced()},location.origin)}
 function open(i,button){if(dialog.open||!cards[i])return;study.pause();selected=i;origin=button;frame=cards[i].querySelector('iframe');if(typeof slot.moveBefore!=='function'){study.explain('当前浏览器缺少保留文档移动能力','不能保证同一页面状态时，不将重新创建的页面冒称同文档操作。请使用独立示例入口。',button);return}slot.moveBefore(frame,null);dialog.showModal();cards[i].classList.add('hidden-card');$('#close-viewer').focus();applyPrefs()}
 function restore(){if(selected<0)return;const n=cards[selected];n.moveBefore(frame,n.querySelector('button'));n.classList.remove('hidden-card');const button=origin;selected=-1;origin=null;frame=null;button?.focus();applyPrefs()}
 cards.forEach((n,i)=>{n.querySelector('button').onclick=e=>open(i,e.currentTarget);n.querySelector('iframe').addEventListener('load',applyPrefs)});
 $('#close-viewer').onclick=()=>dialog.close();dialog.addEventListener('close',restore);window.studyRenderers.push(paint);window.studyResetters.push(()=>{if(dialog.open){dialog.close();restore()}cards.forEach(n=>n.querySelector('iframe').contentWindow?.postMessage({type:'reset-demo'},location.origin))});room.onPreference(applyPrefs);
 window.workbuddyWall={open:i=>open(i,cards[i].querySelector('button')),state:()=>({selected,opened:dialog.open,frames:document.querySelectorAll('.wall-card iframe,#viewer iframe').length,supportsMove:typeof slot.moveBefore==='function'})};paint(study.state().t);applyPrefs();document.body.dataset.wallReady='true';
})();
