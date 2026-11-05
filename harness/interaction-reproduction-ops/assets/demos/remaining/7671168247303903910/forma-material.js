(()=>{
  document.querySelector('#show-other').addEventListener('click',()=>room.announce('已显示同一构图中的橙枕与格纹版本。背景纹理仍有生图差异。'));
  document.querySelector('#restore').addEventListener('click',()=>room.announce('已恢复同景软装的局部显影。'));
  document.querySelector('[data-page="WORKS"]').addEventListener('click',()=>{
    document.querySelector('#info-content p').textContent='同一场景，两种软装。将指针或手指移入画面，查看橙色靠枕与蓝灰格纹如何在局部显露。素材为自制编辑变体，配准和纹理存在差异。';
  });
  document.body.dataset.variantReady='true';
})();
