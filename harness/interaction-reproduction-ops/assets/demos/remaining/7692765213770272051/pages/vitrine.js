import { $, $$, clamp, reduced, announce, setup } from './controls.js';
const titles = ['Paper hours', 'Warm currents', 'Blue study', 'Soft planets', 'Folded light', 'Almost a landscape', 'Lavender loop', 'Colour directions', 'Red horizon', 'Marbled afternoon', 'Quiet forms', 'A little rhythm', 'Desert ribbon', 'Prismatic figure'];
const makers = ['Robin', 'Andrea', 'Mika', 'Johnson', 'Elena', 'Amir', 'Noa'];
const day = i => i === 4 ? '../assets/vitrine/pleated-resin.png' : `../assets/vitrine/day-${String(i).padStart(2, '0')}.svg`;
const night = i => i === 4 ? '../assets/vitrine/chrome-vortex.png' : `../assets/vitrine/night-${String(i).padStart(2, '0')}.svg`;
titles.forEach((title, i) => {
  const n = document.createElement('button');
  n.className = 'work'; n.dataset.id = String(i); n.dataset.active = 'false';
  n.setAttribute('aria-label', `${title}, by ${makers[i % makers.length]}`);
  n.setAttribute('aria-pressed', 'false');
  n.innerHTML = `<img src="${day(i)}" alt="Original replacement artwork: ${title}"><span class="work-label">${title}<br>@${makers[i % makers.length].toLowerCase()}</span>`;
  $('.works').append(n);
});
const works = $$('.work'), corridorOrder = [9, 10, 11, 3, 12, 13, 6, 2, 7, 8, 0, 1, 4, 5];
let active = -1, progress = 0, scrollFrame = 0;
function mix(a, b, t) { return a + (b - a) * t; }
function smooth(t) { t = clamp(t); return t * t * (3 - 2 * t); }
function render() {
  const scene = $('.scene'), w = scene.clientWidth, h = scene.clientHeight, mobile = w < 700;
  const raw = clamp((scrollY - $('#journey').offsetTop + (mobile ? 52 : 58)) / ($('#journey').offsetHeight - h));
  progress = reduced() ? (raw < .25 ? 0 : raw < .65 ? .5 : .82) : raw;
  const first = smooth(progress / .48), second = smooth((progress - .48) / .22);
  const pan = clamp((progress - .7) / .3) * w * .8;
  const cw = Math.max(mobile ? 65 : 110, w * .14), ch = mobile ? 160 : 230;
  scene.dataset.stage = progress < .05 ? 'arc' : progress < .63 ? 'stairs' : 'corridor';
  scene.dataset.progress = raw.toFixed(4);
  works.forEach((n, i) => {
    const dist = Math.abs(i - active), nearby = active >= 0 && dist <= 2 && i < 9;
    const lift = active === i ? (mobile ? 22 : 38) : nearby ? (dist === 1 ? 11 : 3) : 0;
    const push = nearby && i !== active ? Math.sign(i - active) * (dist === 1 ? 13 : 6) : 0;
    const ax = w / 2 + (i - 4) * w * .101 - cw / 2;
    const ay = h * .37 + Math.pow(Math.abs(i - 4) / 4, 1.7) * (mobile ? 42 : 74);
    const rank = corridorOrder.indexOf(i);
    const sx = i < 2 ? -cw * (2.5 - i) : w * .4 + (i - 2) * w * .101;
    const sy = h * .28 + (i - 2) * h * .055;
    const cx = (mobile ? 55 : 112) + rank * w * .103 - pan;
    const cy = h * .12 + rank * h * .062 - pan * .22;
    const x = mix(mix(ax, sx, first), cx, second) + push * (1 - second);
    const y = mix(mix(ay, sy, first), cy, second) - lift;
    const baseRotation = mix(mix((i - 4) * 2.2, 0, first), 0, second);
    const rot = active === i ? baseRotation * .15 : baseRotation + (nearby ? Math.sign(i - active) * (dist === 1 ? 1.7 : .7) * (1 - second) : 0);
    const opacity = i < 9 ? mix(1, i < 2 ? 0 : 1, first) * (1 - second) + second : second;
    n.style.width = cw + 'px'; n.style.height = ch + 'px';
    n.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg) scale(${active === i ? 1.055 : 1})`;
    n.style.opacity = clamp(opacity);
    n.style.zIndex = active === i ? '40' : String(20 - Math.abs(i - 4));
    const visible = opacity > .2 && x + cw > 0 && x < w && y + ch > 0 && y < h;
    n.style.pointerEvents = visible ? 'auto' : 'none'; n.tabIndex = visible ? 0 : -1;
    n.setAttribute('aria-hidden', String(!visible));
    n.dataset.active = String(active === i); n.setAttribute('aria-pressed', String(active === i));
  });
  const introOpacity = 1 - smooth(progress / .25);
  $('.intro').style.cssText = `opacity:${introOpacity};transform:translateY(${-first * 170}px);pointer-events:${introOpacity > .5 ? 'auto' : 'none'}`;
  $('.intro-bottom').style.cssText = `opacity:${1 - smooth(progress / .15)};transform:translateY(${-first * 35}px);visibility:${progress > .2 ? 'hidden' : 'visible'}`;
  $('.stairs-copy').style.cssText = `opacity:${first * (1 - second)};transform:translateX(${(1 - first) * -35}px)`;
  $('.corridor-copy').style.opacity = second;
  $('.corridor-progress').style.opacity = second;
  $('.intro').setAttribute('aria-hidden', String(introOpacity < .05));
  $('.stairs-copy').setAttribute('aria-hidden', String(first * (1 - second) < .05));
  $('.corridor-copy').setAttribute('aria-hidden', String(second < .05));
  $('.intro-bottom').inert = progress > .2;
  $('#piece-index').textContent = String(1 + Math.round(clamp((raw - .7) / .3) * 8)).padStart(2, '0');
}
function select(i) {
  active = i;
  $('.selection').textContent = i < 0 ? '' : `${titles[i]} · @${makers[i % makers.length].toLowerCase()}`;
  render();
}
works.forEach((n, i) => {
  let touchStartActive = -1;
  n.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') touchStartActive = active; });
  n.addEventListener('pointercancel', e => { if (e.pointerType === 'touch') select(touchStartActive); });
  n.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') select(i); });
  n.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch' && document.activeElement !== n) select(-1); });
  n.addEventListener('focus', () => select(i));
  n.addEventListener('blur', e => { if (!e.relatedTarget?.classList.contains('work')) select(-1); });
  n.addEventListener('click', e => { e.stopPropagation(); select(e.pointerType === 'touch' && touchStartActive === i ? -1 : i); });
  n.addEventListener('keydown', e => {
    if (e.key === 'Escape') { n.blur(); select(-1); }
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const visible = works.filter(n => n.tabIndex === 0), at = visible.indexOf(n), next = clamp(at + (e.key === 'ArrowRight' ? 1 : -1), 0, visible.length - 1);
      visible[next]?.focus({ preventScroll: true });
    }
  });
});
$('.scene').addEventListener('pointerdown', e => { if (!e.target.closest('.work')) select(-1); });
function schedule() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; render(); });
}
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', () => {
  $('.scene').dataset.hoverReady = 'false';
  render();
  $('.scene').getBoundingClientRect();
  $('.scene').dataset.hoverReady = 'true';
});
function go(p, hash) {
  active = -1; document.activeElement?.classList.contains('work') && document.activeElement.blur();
  const top = $('#journey').offsetTop - (innerWidth < 700 ? 52 : 58) + p * ($('#journey').offsetHeight - $('.scene').clientHeight);
  scrollTo({ top, behavior: 'instant' });
  if (hash) history.replaceState(null, '', '#' + hash);
  render();
}
const destinations = { arc: 0, stairs: .48, corridor: .72 };
$$('a[href^="#"]').forEach(n => n.addEventListener('click', e => { const hash = n.hash.slice(1); if (hash in destinations) { e.preventDefault(); go(destinations[hash], hash); } }));
$('#show-arc').onclick = () => go(0, 'arc');
$('#show-stairs').onclick = () => go(.48, 'stairs');
$('#show-corridor').onclick = () => go(.72, 'corridor');

let wantedNight = false, themeToken = 0, transition = null, ripple = null;
function applyTheme() {
  document.documentElement.dataset.theme = wantedNight ? 'night' : 'day';
  $('#theme').textContent = wantedNight ? '☼' : '☾';
  $('#theme').setAttribute('aria-pressed', String(wantedNight));
  $('#theme').setAttribute('aria-label', wantedNight ? 'Switch to day theme' : 'Switch to night theme');
  $('.intro h1').innerHTML = wantedNight ? 'A wall that stays lit<br>long after <em>closing time.</em>' : "A wall for the work<br>you can't <em>stop making.</em>";
  works.forEach((n, i) => { $('img', n).src = (wantedNight ? night : day)(i); });
}
async function switchTheme(e) {
  wantedNight = !wantedNight;
  const token = ++themeToken;
  transition?.skipTransition(); ripple?.cancel();
  if (reduced() || !document.startViewTransition) { applyTheme(); announce('主题已切换 · 无扩散'); return; }
  const r = $('#theme').getBoundingClientRect(), x = e.detail ? e.clientX : r.x + r.width / 2, y = e.detail ? e.clientY : r.y + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.documentElement.dataset.themeBusy = 'true';
  const t = document.startViewTransition(() => { if (token === themeToken) applyTheme(); });
  transition = t;
  try {
    await t.ready;
    if (token !== themeToken) { t.skipTransition(); return; }
    ripple = document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, { duration: 740, easing: 'cubic-bezier(.22,.65,.3,1)', pseudoElement: '::view-transition-new(root)' });
    await ripple.finished;
    await t.finished;
  } catch { /* A subsequent user action intentionally cancels the old reveal. */ }
  if (token === themeToken) { document.documentElement.dataset.themeBusy = 'false'; announce(wantedNight ? '夜间主题 · 作品同时切换' : '日间主题 · 作品同时切换'); }
}
$('#theme').addEventListener('click', switchTheme);
function reset() {
  themeToken++; transition?.skipTransition(); ripple?.cancel(); wantedNight = false; applyTheme();
  document.documentElement.dataset.themeBusy = 'false';
  select(-1); go(0, 'arc'); announce('已回到日间弧排');
}
await Promise.all(Array.from({ length: 14 }, (_, i) => new Promise(resolve => { const img = new Image(); img.onload = img.onerror = resolve; img.src = night(i); })));
await setup({ reset, settle: () => { transition?.skipTransition(); ripple?.cancel(); applyTheme(); document.documentElement.dataset.themeBusy = 'false'; render(); announce('当前布局稳定 · 减少动态'); } });
go(destinations[location.hash.slice(1)] ?? 0);
$('.scene').getBoundingClientRect();
$('.scene').dataset.hoverReady = 'true';
announce('悬停、点击作品或向下滚动');
