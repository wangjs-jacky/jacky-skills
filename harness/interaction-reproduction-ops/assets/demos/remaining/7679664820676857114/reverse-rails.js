(() => {
  'use strict';
  const view = document.querySelector('#quorum-window');
  const stack = document.querySelector('#art-stack');
  const assets = ['quorum-yellow-grid', 'quorum-blue-orange', 'quorum-deep-blue', 'sun-yellow', 'rose-scraps', 'cyan-gesture'];
  const names = ['金黄块面', '蓝橙矩形', '深蓝笔触', '明黄红绿', '粉色混合纸纹', '青蓝弧线'];
  const order = [0, 1, 2, 3, 4, 5, 1, 0, 5, 2];
  const rails = ['rail-top', 'rail-bottom', 'rail-lower'].map(id => document.getElementById(id));
  let pinned = false, hover = false, focused = false, trace = [], inputs = [];
  const cycles = new Map();
  for (const [row, rail] of rails.entries()) {
    for (let group = 0; group < 3; group++) {
      for (const [index, id] of order.entries()) {
        const img = document.createElement('img');
        img.src = 'assets/' + assets[(id + row) % assets.length] + '.png';
        img.alt = group === 1 ? names[(id + row) % assets.length] + ' · 图版' + (index + 1) : '';
        img.draggable = false;
        if (group !== 1) img.setAttribute('aria-hidden', 'true');
        rail.append(img);
      }
    }
  }
  function record() {
    const row = {scrollTop: view.scrollTop, offsets: rails.map(r => Number(r.dataset.offset)), spread: pinned || hover || focused, pinned, at: performance.now()};
    trace.push(row);
    if (trace.length > 300) trace.shift();
  }
  function layout() {
    for (const rail of rails) {
      const images = [...rail.children];
      const width = images[10].offsetLeft - images[0].offsetLeft;
      cycles.set(rail, width);
    }
    render();
  }
  function render() {
    const s = room.reduced() ? 0 : view.scrollTop;
    rails.forEach((rail, index) => {
      const width = cycles.get(rail) || 1;
      const speed = index === 0 ? -.3 : index === 1 ? 1 : -.55;
      const dx = (s * speed) % width;
      rail.style.transform = 'translateX(' + (-width + dx) + 'px)';
      rail.dataset.offset = String(dx);
    });
    record();
  }
  function display() {
    const open = pinned || hover || focused;
    stack.classList.toggle('spread', open);
    stack.setAttribute('aria-expanded', String(open));
    record();
  }
  stack.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse') return;
    hover = true;
    display();
  });
  stack.addEventListener('pointerleave', e => {
    if (e.pointerType !== 'mouse') return;
    hover = false;
    display();
  });
  stack.addEventListener('focus', e => {
    // Focus during pointer input should not make a touch tap impossible to close.
    focused = stack.matches(':focus-visible');
    display();
  });
  stack.addEventListener('blur', () => { focused = false; display(); });
  stack.addEventListener('click', e => {
    pinned = !pinned;
    focused = false;
    inputs.push({type:'toggle', trusted:e.isTrusted, pinned, at:e.timeStamp});
    display();
    room.announce(pinned ? '三张画已锁定展开；再次轻点解除' : hover || focused ? '已解除锁定，移开指针收回' : '三张画已收回');
  });
  stack.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    pinned = hover = focused = false;
    display();
    room.announce('已收回三张画');
  });
  view.addEventListener('scroll', render, {passive:true});
  document.querySelector('#back-top').addEventListener('click', () => {
    view.scrollTo({top:0, behavior:'instant'});
    view.focus({preventScroll:true});
    render();
  });
  room.onPreference(() => {render(); display();});
  addEventListener('room-reset', () => {
    pinned = hover = focused = false;
    trace = [];
    inputs = [];
    view.scrollTo({top:0, behavior:'instant'});
    render();
    display();
    room.announce('图带回到开始，三图收拢');
  });
  const resize = new ResizeObserver(layout);
  resize.observe(view);
  Object.defineProperty(window, 'reverseRailsState', {get:() => ({
    scrollTop:view.scrollTop, max:view.scrollHeight-view.clientHeight,
    offsets:rails.map(r => Number(r.dataset.offset)),
    cycles:rails.map(r => cycles.get(r)), pinned, hover, focused,
    spread:pinned||hover||focused, reduced:room.reduced(),
    imageCount:document.querySelectorAll('.gallery-paper img').length,
    trace:[...trace], inputs:[...inputs]
  })});
  layout();
  display();
  document.body.dataset.ready = 'true';
  room.announce('滚动两行图带，靠近或轻点三张画');
})();
