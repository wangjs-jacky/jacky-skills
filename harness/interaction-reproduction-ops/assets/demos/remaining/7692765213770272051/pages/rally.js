import { $, $$, clamp, reduced, announce, animate, setup } from './controls.js';

const climbs = [
  ['STRADE BIANCHE', 'IT · 670 m', 'alpine-dusk.jpg', 6],
  ['SUSTEN', 'CH · 2,224 m', 'alpine-blue.jpg', 4],
  ['GALIBIER', 'FR · 2,642 m', 'alpine-glacier.jpg', 2],
  ['STELVIO', 'IT · 2,757 m', 'alpine-forest.jpg', 1],
  ['TOURMALET', 'FR · 2,115 m', 'alpine-rock.jpg', 3],
  ['GROSSGLOCKNER', 'AT · 2,504 m', 'alpine-granite.jpg', 5],
  ['MONT VENTOUX', 'FR · 1,909 m', 'alpine-rose.jpg', 7],
];
function makeCard(item, className, rank) {
  const card = document.createElement('article');
  card.className = 'climb-card ' + className;
  const [name, meta, image] = item;
  card.innerHTML = `<img src="../assets/rally/${image}" alt="Illustrative landscape for ${name}"><span class="rank">${rank}</span><div class="card-caption"><h3>${name}</h3><small>${meta}</small></div>`;
  return card;
}
const arcY = [64, 40, 20, 0, 20, 40, 64];
climbs.forEach((c, i) => {
  const card = makeCard(c, 'podium-card', String(c[3]).padStart(2, '0'));
  card.style.setProperty('--slot', i);
  card.style.setProperty('--dy', arcY[i]);
  card.style.setProperty('--rot', (i - 3) * 1.6);
  const rank = document.createElement('span');
  rank.className = 'rank-base';
  rank.textContent = c[3];
  // Rank reflection is a sibling, so it is not clipped by the image card.
  const holder = document.createElement('div');
  holder.className = 'podium-position';
  holder.style.cssText = card.style.cssText;
  holder.append(card, rank);
  $('.podium').append(holder);
});
const wallData = [climbs[3], ['FINISTRE', 'IT · 2,178 m', 'alpine-rock.jpg'], climbs[2], climbs[5], climbs[4], ['ALBULA', 'CH · 2,315 m', 'alpine-blue.jpg'], climbs[1], climbs[6], climbs[0], ['FURKA', 'CH · 2,429 m', 'alpine-glacier.jpg'], ['GAVIA', 'IT · 2,621 m', 'alpine-granite.jpg'], ['TIMMELSJOCH', 'AT · 2,509 m', 'alpine-forest.jpg'], ['LA BONETTE', 'FR · 2,802 m', 'nordkette.jpg']];
wallData.forEach((c, i) => {
  const card = makeCard(c, 'wall-card' + (i > 8 ? ' waiting' : ''), i > 8 ? 'TO RIDE' : '✓ 2026');
  if (i > 8) card.insertAdjacentHTML('beforeend', '<span class="lock" aria-label="Not earned">⌁</span>');
  $('.wall-grid').append(card);
});
const heights = [22, 35, 19, 39, 26, 47, 33, 60, 44, 71, 42, 58, 88, 68, 77, 60, 92, 63, 80, 68, 100, 76, 92, 80, 90, 74];
heights.forEach((height, i) => {
  const bar = document.createElement('i');
  bar.style.setProperty('--h', height + '%');
  bar.classList.toggle('accent', [4, 9, 13, 17, 20].includes(i));
  bar.setAttribute('aria-label', `Week ${i + 10}: ${height * 28} metres, illustrative`);
  $('.weekly-bars').append(bar);
});

const introAnimations = new Set(), wallAnimations = new Set();
function clear(group) { for (const a of group) a.cancel(); group.clear(); }
function replayIntro() {
  clear(introAnimations);
  $$('.podium-position').forEach((n, i) => {
    const a = animate(n, [
      { transform: `translate(-${95 + i * 5}px,115px) rotate(-18deg)`, opacity: 0 },
      { transform: 'translate(0,-7px) rotate(1.5deg)', opacity: 1, offset: .78 },
      { transform: 'none', opacity: 1 },
    ], { duration: 780, delay: i * 95, easing: 'cubic-bezier(.18,.73,.25,1)', fill: 'both' });
    if (a) introAnimations.add(a);
  });
  announce(reduced() ? '弧排 · 减少动态' : '弧线依次入场');
}
function replayWall() {
  clear(wallAnimations);
  const cols = innerWidth > 700 ? 7 : 4;
  $$('.wall-card').forEach((n, i) => {
    const delay = ((i % cols) + Math.floor(i / cols)) * 70;
    const a = animate(n, [
      { transform: 'translate(-38px,65px) rotate(-11deg) scale(.93)', opacity: 0 },
      { transform: 'translate(0,-4px) rotate(.6deg)', opacity: 1, offset: .8 },
      { transform: 'none', opacity: 1 },
    ], { duration: 650, delay, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' });
    if (a) wallAnimations.add(a);
  });
  announce(reduced() ? '徽章墙 · 9彩色4灰态' : '徽章墙斜向入场');
}
let counterFrame = 0, counterToken = 0;
function setNumbers(t) {
  $$('[data-target]').forEach(n => { n.textContent = Math.round(Number(n.dataset.target) * t).toLocaleString('en-US'); });
  $$('.weekly-bars i').forEach((n, i) => { n.style.transform = `scaleY(${clamp(t * 1.18 - i * .006)})`; });
}
function settleNumbers() { cancelAnimationFrame(counterFrame); counterToken++; setNumbers(1); }
function replayNumbers() {
  cancelAnimationFrame(counterFrame);
  const token = ++counterToken;
  if (reduced()) { setNumbers(1); announce('数字/柱图 · 减少动态'); return; }
  setNumbers(0);
  let start;
  function frame(now) {
    if (token !== counterToken) return;
    start ??= now;
    const t = clamp((now - start) / 1850), eased = 1 - Math.pow(1 - t, 3.5);
    setNumbers(eased);
    if (t < 1) counterFrame = requestAnimationFrame(frame);
    else { setNumbers(1); announce('9项 · 14,920m · 2,184km · 31天'); }
  }
  counterFrame = requestAnimationFrame(frame);
  announce('数字增长与柱图入场');
}

// A fitted climbing profile. Both directions derive from the same scroll progress.
const route = $('.route-stroke'), ghost = $('.route-ghost');
const points = Array.from({ length: 97 }, (_, i) => {
  const t = i / 96;
  return [14 + t * 892, 315 - 263 * (t * .87 + Math.sin(t * Math.PI / 2) * .13) + (i % 3 - 1) * 1.3];
});
const d = points.map((p, i) => (i ? 'L' : 'M') + p.join(',')).join(' ');
route.setAttribute('d', d); ghost.setAttribute('d', d);
const length = route.getTotalLength();
route.style.strokeDasharray = length;
for (let i = 0; i < 97; i++) {
  const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  tick.setAttribute('x1', points[i][0]); tick.setAttribute('x2', points[i][0]);
  tick.setAttribute('y1', 331); tick.setAttribute('y2', i % 4 === 0 ? 337 : 334);
  $('.route-ticks').append(tick);
}
let scrollFrame = 0;
function updateRoute() {
  scrollFrame = 0;
  const pin = $('.profile-pin'), section = $('#profile'), r = section.getBoundingClientRect();
  const progress = clamp((54 - r.top) / Math.max(1, section.offsetHeight - pin.offsetHeight));
  const p = route.getPointAtLength(progress * length);
  route.style.strokeDashoffset = length * (1 - progress);
  for (const node of [$('.route-dot'), $('.route-halo')]) { node.setAttribute('cx', p.x); node.setAttribute('cy', p.y); }
  $$('.route-ticks line').forEach((line, i) => line.classList.toggle('active', i <= progress * 96));
  $('#route-distance').innerHTML = (progress * 24.3).toFixed(1) + '<em>km</em>';
  $('#route-altitude').innerHTML = Math.round(949 + 1808 * progress).toLocaleString('en-US') + '<em>m</em>';
  $('#route-gradient').innerHTML = (6.4 + Math.sin(progress * 26) * 3.2 + Math.sin(progress * 51) * 1.1).toFixed(1) + '<em>%</em>';
  $('#route-hairpin').textContent = Math.max(0, 48 - Math.floor(progress * 48));
  $('#route-percent').textContent = Math.round(progress * 100) + '%';
  section.dataset.progress = progress.toFixed(4);
}
function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateRoute); }
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', () => {
  $('.podium').style.setProperty('--arc-scale', innerWidth > 700 ? '1' : '.55');
  scheduleScroll();
});
$('.podium').style.setProperty('--arc-scale', innerWidth > 700 ? '1' : '.55');
let numbersSeen = false, wallSeen = false;
const observer = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    if (e.target.id === 'numbers' && !numbersSeen) { numbersSeen = true; replayNumbers(); }
    if (e.target.id === 'wall' && !wallSeen) { wallSeen = true; replayWall(); }
  }
}, { threshold: .3 });
observer.observe($('#numbers')); observer.observe($('#wall'));
function go(id) { $(id).scrollIntoView({ block: 'start', behavior: 'instant' }); updateRoute(); }
$('#replay-intro').onclick = () => { go('#intro'); replayIntro(); };
$('#replay-numbers').onclick = () => { numbersSeen = true; go('#numbers'); replayNumbers(); };
$('#replay-wall').onclick = () => { wallSeen = true; go('#wall'); replayWall(); };
function reset() {
  const candidates = ['intro', 'profile', 'numbers', 'wall'].map(id => $('#' + id));
  const current = candidates.find(n => { const r = n.getBoundingClientRect(); return r.top <= 55 && r.bottom > 55; }) || candidates[0];
  go('#' + current.id);
  if (current.id === 'intro') replayIntro();
  if (current.id === 'numbers') replayNumbers();
  if (current.id === 'wall') replayWall();
  if (current.id === 'profile') announce('路线回到起点 · 可正反向滚动');
}
await setup({ reset, settle: () => { clear(introAnimations); clear(wallAnimations); settleNumbers(); updateRoute(); announce('当前段已稳定'); } });
updateRoute();
if (!location.hash || location.hash === '#intro') replayIntro();
else announce('滚动探索 · 参数为画面拟合');
