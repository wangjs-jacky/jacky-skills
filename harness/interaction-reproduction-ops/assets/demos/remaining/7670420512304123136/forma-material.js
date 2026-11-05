(()=>{
  document.querySelector('#show-other').addEventListener('click',()=>room.announce('已显示自制同景中的画框、花瓶与书册版本。背景纹理仍有生图差异。'));
  document.querySelector('#restore').addEventListener('click',()=>room.announce('已恢复同景软装的局部显影。'));
  document.querySelector('[data-page="WORKS"]').addEventListener('click',()=>{
    document.querySelector('#info-content p').textContent='同一场景，两种陈设。将指针或手指移入画面，查看画框、玻璃花瓶与书册如何在局部显露。素材为编辑自制摄影得到的替代层，精确配准和纹理与原片仍有差异。';
  });
  document.body.dataset.variantReady='true';
})();
