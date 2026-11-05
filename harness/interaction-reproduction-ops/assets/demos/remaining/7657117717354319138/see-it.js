(()=>{'use strict';
 const $=s=>document.querySelector(s),fixture=$('#fixture'),annotations=$('#annotations'),dialog=$('#finding'),background=[30,18,55];
 let issues=[],guides=[],flags=true,fixed=false,selected=null,opener=null,raf=0;
 const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
 function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
 function describe(issue){selected=issue.key;$('#finding-title').textContent=issue.title;$('#finding-copy').textContent=issue.copy;dialog.showModal()}
 function layout(){raf=0;const base=fixture.getBoundingClientRect();for(const n of annotations.children){const issue=[...issues,...guides].find(i=>i.key===n.dataset.issue);if(!issue)continue;const r=issue.target.getBoundingClientRect();Object.assign(n.style,{left:r.left-base.left-3+'px',top:r.top-base.top-3+'px',width:r.width+6+'px',height:r.height+6+'px'})}}
 function request(){if(!raf)raf=requestAnimationFrame(layout)}
 function scan(){
  issues=[];guides=[];
  if(!fixed){
   if(fixture.querySelector('#sample-features h3'))issues.push({key:'heading',kind:'heading',target:$('#sample-heading'),title:'Skipped heading level',copy:'The sample moves from h1 to h3. This is a structural check on the actual DOM; it does not prove the visual style is poor.'});
   const rgb=getComputedStyle($('#sample-heading')).color.match(/[\d.]+/g).slice(0,3).map(Number),ratio=contrast(rgb,background);
   const measured='The actual heading color is compared with the fixed solid background #1e1237. The current ratio is '+ratio.toFixed(2)+':1. ';
   if(ratio<4.5)issues.push({key:'contrast',kind:'contrast',target:$('#sample-heading'),title:'Low contrast: '+ratio.toFixed(2)+':1',copy:measured+'The 4.5:1 threshold is a conservative local check, not an exact reproduction of the author’s label or an aesthetic score.'});
   else guides.push({key:'contrast-guide',kind:'guide',target:$('#sample-heading'),title:'Contrast review',copy:measured+'This is not a failed check. The outline preserves the visible review composition; it does not repeat the author’s low-contrast claim as a local measurement.'});
   for(const [i,n]of [...fixture.querySelectorAll('[data-gradient]')].entries())if(getComputedStyle(n).backgroundImage!=='none')issues.push({key:'gradient-'+i,kind:'gradient',target:n,title:'Gradient text',copy:'A visible gradient on text was found. This is a review heuristic; gradients can be appropriate and this flag alone does not establish a design defect.'});
   issues.push({key:'palette',kind:'palette',target:$('#get-started'),title:'Repeated purple palette',copy:'This fixed sample repeats purple and rounded accents. This is an intentionally limited visual heuristic, not an AI detector or a judgment of all purple interfaces.'});
  }
  annotations.replaceChildren();$('#issue-list').replaceChildren();
  for(const issue of [...issues,...guides]){
   if(issue.kind!=='heading'){const box=document.createElement('div');box.className='flag';box.dataset.issue=issue.key;box.dataset.kind=issue.kind;const b=document.createElement('button');b.textContent=issue.title;b.setAttribute('aria-label',(issue.kind==='guide'?'Review guide: ':'Finding: ')+issue.title);b.onclick=e=>{opener=e.currentTarget;describe(issue)};box.append(b);annotations.append(box)}
   if(issue.kind!=='guide'){const li=document.createElement('li'),b=document.createElement('button');b.textContent=issue.title;b.dataset.issue=issue.key;b.onclick=e=>{opener=e.currentTarget;describe(issue)};li.append(b);$('#issue-list').append(li)}
  }
  annotations.hidden=!flags;$('#warning').textContent=issues.length?'Local review · '+issues.length+' findings · '+issues.map(i=>i.title).slice(0,2).join(' / '):'Local sample corrected · no findings under these limited checks';$('#warning').style.background=issues.length?'#dd008d':'#356248';$('#undo').disabled=!fixed;$('#apply-fix').disabled=fixed;$('#heading-color').disabled=fixed;layout();room.announce(issues.length+'项本地检查，'+guides.length+'处对照指示；不是作者检测结果或自动审美结论。');
 }
 function setFixed(value){fixed=value;fixture.classList.toggle('fixed',fixed);for(const old of [...fixture.querySelectorAll('#sample-features '+(fixed?'h3':'h2'))]){const h=document.createElement(fixed?'h2':'h3');h.textContent=old.textContent;old.replaceWith(h)}scan()}
 $('#scan').onclick=scan;$('#toggle-flags').onclick=()=>{flags=!flags;annotations.hidden=!flags;$('#toggle-flags').setAttribute('aria-pressed',String(flags));$('#toggle-flags').textContent=flags?'隐藏标注':'显示标注'};
 $('#apply-fix').onclick=()=>setFixed(true);$('#undo').onclick=()=>setFixed(false);$('#heading-color').oninput=()=>{$('#sample-heading').style.color=$('#heading-color').value;scan()};
 $('#close-finding').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{selected=null;if(opener?.isConnected)opener.focus({preventScroll:true});else $('#scan').focus({preventScroll:true})});
 $('#get-started').onclick=()=>$('#sample-entry').showModal();$('#close-entry').onclick=()=>$('#sample-entry').close();$('#sample-entry').addEventListener('close',()=>$('#get-started').focus({preventScroll:true}));
 function reset(){for(const d of document.querySelectorAll('dialog'))if(d.open)d.close();flags=true;$('#toggle-flags').setAttribute('aria-pressed','true');$('#toggle-flags').textContent='隐藏标注';$('#heading-color').value='#f3eaff';$('#sample-heading').style.color='#f3eaff';setFixed(false);scrollTo({top:0,behavior:'instant'})}
 addEventListener('room-reset',reset);addEventListener('resize',request);new ResizeObserver(request).observe(fixture);
 window.seeItStudy={state:()=>({fixed,flags,selected,issues:issues.map(({key,kind,title})=>({key,kind,title})),guides:guides.map(({key,title})=>({key,title})),detail:dialog.open,entry:$('#sample-entry').open,reduced:room.reduced()}),contrast};scan();document.body.dataset.ready='true';
})();
