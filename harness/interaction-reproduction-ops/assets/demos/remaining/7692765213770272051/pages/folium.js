import { $, $$, clamp, reduced, announce, animate, setup } from './controls.js';
let currentSection = 'drawer';
function markSection(id) { currentSection = id; document.body.dataset.section = id; }
for (const type of ['wheel', 'touchstart']) addEventListener(type, e => {
  const section = e.target.closest?.('section[id]');
  if (section && ['drawer', 'archive', 'process', 'catalogue'].includes(section.id)) markSection(section.id);
}, { passive: true });
$$('.site-header a[href^="#"],.hero-actions a').forEach(n => n.addEventListener('click', () => markSection(n.hash.slice(1))));
const specimens = [
  { file: 'maple', name: 'Acer platanoides', family: 'Sapindaceae', common: 'Autumn maple, field study', place: 'Sonian Forest, Brussels', altitude: '112 m', date: '18 Oct 2025', collector: 'A. Maes', no: '0416' },
  { file: 'poppy', name: 'Papaver rhoeas', family: 'Papaveraceae', common: 'Field poppy, pressed in red', place: 'Field margins, Kent', altitude: '73 m', date: '21 Jun 2025', collector: 'E. Lane', no: '0417' },
  { file: 'allium', name: 'Allium ursinum', family: 'Amaryllidaceae', common: 'Wild garlic, with company', place: 'Sonian Forest, Brussels', altitude: '98 m', date: '18 Apr 2025', collector: 'A. Maes', no: '0418' },
  { file: 'golden-fern', name: 'Pteridium aquilinum', family: 'Dennstaedtiaceae', common: 'Bracken, slowly turning gold', place: 'Woodland edge, Wales', altitude: '245 m', date: '02 Sep 2025', collector: 'J. Evans', no: '0419' },
  { file: 'green-fern', name: 'Dryopteris filix-mas', family: 'Dryopteridaceae', common: 'A fern from the shaded path', place: 'Forest path, Ardennes', altitude: '320 m', date: '16 Jul 2025', collector: 'L. Martin', no: '0420' },
  { file: 'meadow-grass', name: 'Poa pratensis', family: 'Poaceae', common: 'Meadow grass, late summer', place: 'Open meadow, Sussex', altitude: '64 m', date: '28 Aug 2025', collector: 'E. Lane', no: '0421' },
];
const asset = file => `../assets/folium/${file}.png`;
specimens.forEach((s, i) => {
  const flyer = document.createElement('span'); flyer.className = 'flying-card';
  flyer.innerHTML = `<img src="${asset(s.file)}" alt="">`; flyer.style.zIndex = 9 - i; $('.flying-specimens').append(flyer);
  const note = document.createElement('article'); note.className = 'specimen-note';
  note.innerHTML = `<p class="eyebrow">No. ${s.no} · ${s.family}</p><h3>${s.name}</h3><p class="common">${s.common}</p><dl><dt>LOCALITY</dt><dd>${s.place}</dd><dt>ALTITUDE</dt><dd>${s.altitude}</dd><dt>COLLECTED</dt><dd>${s.date}</dd><dt>COLLECTOR</dt><dd>${s.collector}</dd></dl>`;
  $('.specimen-notes').append(note);
  const card = document.createElement('article'); card.className = 'archive-card'; card.dataset.id = i;
  card.innerHTML = `<img src="${asset(s.file)}" alt="Independent generated specimen: ${s.common}"><small><span>No. ${s.no}</span><span>${s.family}</span></small>`;
  card.style.zIndex = 6 - i; $('.archive-stack').append(card);
});
specimens.forEach((s, i) => {
  const img = new Image(); img.src = asset(s.file); img.alt = s.common;
  img.style.cssText = `left:${[2, 48, 15, 61, 5, 52][i]}%;top:${[5, 1, 34, 31, 62, 65][i]}%;transform:rotate(${[-24, 18, 13, -23, 20, -12][i]}deg)`;
  $('.botanical-collage').append(img);
});
const drawerMotions = new Set(); let drawerOpen = false;
function stopDrawer() { for (const a of drawerMotions) a.cancel(); drawerMotions.clear(); }
function setDrawer(open, recordSection = true) {
  if (recordSection) markSection('drawer');
  const flyers = $$('.flying-card'), from = flyers.map(n => ({ transform: getComputedStyle(n).transform, opacity: getComputedStyle(n).opacity }));
  stopDrawer(); drawerOpen = open;
  $('.drawer-button').setAttribute('aria-pressed', String(open));
  flyers.forEach((n, i) => {
    const to = { transform: open ? `translate(${(i - 2.5) * 8}px,${-78 - i * 12}px) rotate(${(i - 2.5) * 4}deg)` : 'translate(0,0) rotate(0deg)', opacity: open ? 1 : 0 };
    Object.assign(n.style, to);
    const a = animate(n, [from[i], to], { duration: 620, delay: i * 40, easing: 'cubic-bezier(.2,.7,.24,1)', fill: 'both' });
    if (a) drawerMotions.add(a);
  });
  announce(open ? '抽屉标本分层展开' : '抽屉标本收回');
}
function replayDrawer() {
  stopDrawer(); drawerOpen = false; $('.drawer-button').setAttribute('aria-pressed', 'false');
  if (reduced()) { setDrawer(true); return; }
  $$('.flying-card').forEach((n, i) => {
    n.style.opacity = '0'; n.style.transform = 'none';
    const a = animate(n, [
      { transform: 'translate(0,35px) rotate(-3deg)', opacity: 0 },
      { transform: `translate(${(i % 2 ? 1 : -1) * 5}px,-50px) rotate(1deg)`, opacity: 1, offset: .2 },
      { transform: `translate(${(i % 2 ? 1 : -1) * 18}px,-135px) rotate(-2deg)`, opacity: .9, offset: .72 },
      { transform: 'translate(0,-210px) rotate(4deg)', opacity: 0 },
    ], { duration: 1450, delay: i * 200, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'both' });
    if (a) drawerMotions.add(a);
  });
  announce('首屏标本逐张浮出 · 可点击展开');
}
$('.drawer-button').onclick = () => setDrawer(!drawerOpen);

let scrollFrame = 0;
const line = $('.process-ink'), lineLength = line.getTotalLength();
line.style.strokeDasharray = lineLength;
function updateScroll() {
  scrollFrame = 0;
  const pin = $('.archive-pin'), section = $('#archive'), top = innerWidth < 700 ? 52 : 56;
  const p = clamp((top - section.getBoundingClientRect().top) / Math.max(1, section.offsetHeight - pin.offsetHeight));
  const turn = p * 5, index = Math.min(5, Math.floor(turn + .55));
  pin.dataset.progress = p.toFixed(4); pin.dataset.index = index;
  $$('.archive-card').forEach((n, i) => {
    const t = clamp(turn - i), depth = Math.max(0, i - Math.floor(turn));
    n.style.transform = reduced() ? 'none' : `translateY(${t * 150 - Math.min(depth, 3) * 3}px) rotateX(${-106 * t}deg) scale(${1 - Math.min(depth, 3) * .008})`;
    n.style.opacity = reduced() ? (i === index ? 1 : 0) : 1 - clamp((t - .78) / .22);
    n.style.visibility = reduced() ? (i === index ? 'visible' : 'hidden') : (t === 1 && i < 5 ? 'hidden' : 'visible');
    n.dataset.turn = t.toFixed(4); n.setAttribute('aria-hidden', String(i !== index));
  });
  $$('.specimen-note').forEach((n, i) => {
    const fraction = turn % 1, at = Math.floor(turn);
    const out = 1 - smooth(clamp((fraction - .28) / .25)), incoming = smooth(clamp((fraction - .48) / .30));
    const opacity = reduced() || at === 5 ? (i === index ? 1 : 0) : i === at ? out : i === at + 1 ? incoming : 0;
    n.style.opacity = opacity; n.style.transform = `translateY(${reduced() ? 0 : (1 - opacity) * 7}px)`;
    n.setAttribute('aria-hidden', String(i !== index));
  });
  $('#archive-index').textContent = String(index + 1).padStart(2, '0');
  const steps = $('.process-list'), rect = steps.getBoundingClientRect();
  const process = reduced() ? (rect.top < innerHeight ? 1 : 0) : clamp((innerHeight * .8 - rect.top) / (rect.height * .94));
  line.style.strokeDashoffset = lineLength * (1 - process); steps.dataset.progress = process.toFixed(4);
  $$('.process-step').forEach((n, i) => n.dataset.active = String(process >= i / 3 + .02));
}
function smooth(t) { return t * t * (3 - 2 * t); }
function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
addEventListener('scroll', scheduleScroll, { passive: true });
function goSection(id) { markSection(id); $('#' + id).scrollIntoView({ block: 'start', behavior: 'instant' }); updateScroll(); }
function goCard(index) {
  markSection('archive');
  const top = $('#archive').offsetTop - (innerWidth < 700 ? 52 : 56) + clamp(index / 5) * ($('#archive').offsetHeight - $('.archive-pin').offsetHeight);
  scrollTo({ top, behavior: 'instant' }); updateScroll(); announce(`标本 ${clamp(index, 0, 5) + 1} / 6`);
}
$('.archive-pin').addEventListener('keydown', e => {
  if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
    e.preventDefault(); const index = +$('.archive-pin').dataset.index;
    goCard(e.key === 'Home' ? 0 : e.key === 'End' ? 5 : index + (['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : -1));
  }
});
$('#previous').onclick = () => goCard(+$('.archive-pin').dataset.index - 1);
$('#next').onclick = () => goCard(+$('.archive-pin').dataset.index + 1);
$('#show-process').onclick = () => goSection('process');
$('#show-catalogue').onclick = () => goSection('catalogue');
$('#replay-drawer').onclick = () => { goSection('drawer'); replayDrawer(); };

// 18 illustrative studies preserve the source category counts; six generated plant assets are reused.
const studies = [
  ['maple', 'Leaf study 01', 'leaves'], ['allium', 'Allium study', 'flowers'], ['green-fern', 'Dryopteris', 'ferns'],
  ['golden-fern', 'Pteridium', 'ferns', true], ['meadow-grass', 'Meadow study 01', 'grasses'], ['maple', 'Leaf study 02', 'leaves'],
  ['poppy', 'Flower study 01', 'flowers'], ['green-fern', 'Asplenium study', 'ferns'], ['maple', 'Leaf study 03', 'leaves'],
  ['poppy', 'Papaver study', 'flowers', true], ['allium', 'Flower study 02', 'flowers'], ['meadow-grass', 'Meadow study 02', 'grasses'],
  ['maple', 'Leaf study 04', 'leaves'], ['allium', 'Flower study 03', 'flowers'], ['maple', 'Leaf study 05', 'leaves', true],
  ['poppy', 'Flower study 04', 'flowers'], ['allium', 'Flower study 05', 'flowers'], ['maple', 'Leaf study 06', 'leaves'],
];
studies.forEach(([file, title, category, dark], i) => {
  const n = document.createElement('figure'); n.className = 'catalogue-item' + (dark ? ' dark' : '') + (i === 3 ? ' detail' : '');
  n.dataset.id = i; n.dataset.category = category;
  n.innerHTML = `<div class="paper"><img src="${asset(file)}" alt="Illustrative ${title}"></div><figcaption>${title}<small>${String(411 + i).padStart(4, '0')}</small></figcaption>`;
  if (i > 5) $('img', n).style.rotate = ((i % 3 - 1) * 12) + 'deg';
  $('.catalogue-grid').append(n);
});
const items = $$('.catalogue-item'), filterMotions = new Set();
let filterTarget = 'all', filterToken = 0;
function cancelFilterMotions() { for (const a of filterMotions) a.cancel(); filterMotions.clear(); }
function track(a) { if (a) filterMotions.add(a); return a?.finished.catch(() => {}); }
function layout(items) {
  const grid = $('.catalogue-grid'), w = grid.clientWidth, cols = innerWidth < 700 ? 3 : 6, gap = innerWidth < 700 ? 10 : 14;
  const cw = (w - gap * (cols - 1)) / cols, ch = cw * 1.48 + 27;
  items.forEach((n, i) => Object.assign(n.style, { left: (i % cols) * (cw + gap) + 'px', top: Math.floor(i / cols) * (ch + gap) + 'px', width: cw + 'px', height: ch + 'px' }));
  grid.style.height = (Math.ceil(items.length / cols) * (ch + gap) - gap) + 'px';
}
async function filter(category, immediate = false) {
  filterTarget = category; const token = ++filterToken, grid = $('.catalogue-grid');
  const frozen = items.map(n => { const c = getComputedStyle(n); return { transform: c.transform, opacity: c.opacity, visible: n.style.visibility !== 'hidden', rect: n.getBoundingClientRect() }; });
  const oldHeight = grid.getBoundingClientRect().height;
  cancelFilterMotions();
  items.forEach((n, i) => Object.assign(n.style, { transform: frozen[i].transform, opacity: frozen[i].opacity }));
  const keep = items.filter(n => category === 'all' || n.dataset.category === category);
  $$('.filters button').forEach(n => n.setAttribute('aria-pressed', String(n.dataset.filter === category)));
  grid.dataset.busy = 'true'; grid.dataset.filter = category;
  const out = [];
  if (!reduced() && !immediate) items.forEach((n, i) => {
    if (keep.includes(n) || !frozen[i].visible || +frozen[i].opacity < .01) return;
    out.push(track(animate(n, [{ transform: frozen[i].transform, opacity: frozen[i].opacity }, { transform: 'scale(.78)', opacity: 0 }], { duration: 220, easing: 'cubic-bezier(.4,0,.7,1)', fill: 'forwards' })));
  });
  await Promise.all(out);
  if (token !== filterToken) return;
  const first = keep.map(n => n.getBoundingClientRect());
  items.forEach(n => { n.style.visibility = keep.includes(n) ? 'visible' : 'hidden'; n.style.opacity = keep.includes(n) ? '1' : '0'; n.style.transform = 'none'; n.setAttribute('aria-hidden', String(!keep.includes(n))); });
  layout(keep);
  const motions = [];
  if (!reduced() && !immediate) {
    keep.forEach((n, i) => {
      const id = items.indexOf(n), wasVisible = frozen[id].visible && +frozen[id].opacity > .02;
      const end = n.getBoundingClientRect(), start = first[i];
      motions.push(track(animate(n, [{ transform: wasVisible ? `translate(${start.x - end.x}px,${start.y - end.y}px) scale(${start.width / end.width},${start.height / end.height})` : 'scale(.83)', opacity: wasVisible ? frozen[id].opacity : 0 }, { transform: 'none', opacity: 1 }], { duration: 470, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' })));
    });
    motions.push(track(animate(grid, [{ height: oldHeight + 'px' }, { height: grid.style.height }], { duration: 470, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' })));
  }
  $('#filter-count').textContent = `${keep.length} ${category === 'all' ? 'specimens' : category}`;
  await Promise.all(motions);
  if (token !== filterToken) return;
  grid.dataset.busy = 'false'; announce(`${category} · ${keep.length} specimens`); updateScroll();
}
$$('.filters button').forEach((n, i, buttons) => {
  n.addEventListener('click', () => { markSection('catalogue'); filter(n.dataset.filter); });
  n.addEventListener('keydown', e => {
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
      e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : clamp(i + (e.key === 'ArrowRight' ? 1 : -1), 0, buttons.length - 1);
      buttons[next].focus();
    }
  });
});
addEventListener('resize', () => { filter(filterTarget, true); updateScroll(); });
function reset() {
  const current = currentSection;
  if (current === 'archive') goCard(0);
  else if (current === 'catalogue') { filter('all'); goSection('catalogue'); }
  else if (current === 'process') { goSection('process'); announce('步骤线回到此段起点'); }
  else { goSection('drawer'); setDrawer(false); }
}
await filter('all', true);
await setup({ reset, settle: () => { stopDrawer(); setDrawer(drawerOpen, false); filter(filterTarget, true); updateScroll(); }, extra: { filter: category => filter(category) } });
updateScroll();
if (['drawer', 'archive', 'process', 'catalogue'].includes(location.hash.slice(1))) markSection(location.hash.slice(1));
if (!location.hash || location.hash === '#drawer') replayDrawer();
else announce('滚动翻卡 · 参数为画面拟合');
