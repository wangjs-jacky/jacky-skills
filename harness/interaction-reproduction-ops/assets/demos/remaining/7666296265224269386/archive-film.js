(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const stage = $('#stage'), opening = $('#opening'), gallery = $('.gallery');
  const frames = [...document.querySelectorAll('.frame')];
  const originalImages = frames.map(frame => frame.querySelector('img'));
  const progress = $('#progress'), legacyInput = progress.oninput;
  const title = $('#title'), phrase = 'Mouseshi';
  title.setAttribute('aria-label', phrase);
  title.replaceChildren(...[...phrase].map((letter, i) => {
    const span = document.createElement('span');
    span.className = 'letter'; span.textContent = letter;
    span.dataset.letter = letter; span.setAttribute('aria-hidden', 'true');
    span.style.setProperty('--photograph', 'url("' + originalImages[i % originalImages.length].src + '")');
    return span;
  }));
  const letters = [...title.children];
  const initialPosition = new URLSearchParams(location.search).get('view') === 'letters' ? 1 : 0;
  const state = { position: initialPosition, target: 1, channel: null, paused: false, letterTime: 0, phase: 'title', cycles: 0 };
  let raf = 0, last = 0, bases = [], sizeKey = '';
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
  const mix = (a, b, t) => a + (b - a) * t;
  function legacyAt(value) {
    progress.value = Math.round(value * 1000);
    legacyInput.call(progress, { target: progress });
  }
  function clearLetters() {
    for (const letter of letters) {
      letter.style.transform = 'none';
      letter.style.setProperty('--photo-opacity', 0);
    }
  }
  function drawLetters() {
    for (const [i, letter] of letters.entries()) {
      const local = clamp((state.letterTime - i * .23) / .72);
      const wave = Math.sin(local * Math.PI);
      letter.style.transform = `translateY(${-wave * 12}px) rotateY(${wave * 18}deg)`;
      letter.style.setProperty('--photo-opacity', wave.toFixed(4));
    }
  }
  function render() {
    const t = state.position, legacy = clamp((t - .72) / .28);
    legacyAt(legacy);
    const w = stage.clientWidth, h = stage.clientHeight, mobile = innerWidth <= 720;
    const key = [w, h, mobile].join(':');
    if (t < .72 && (key !== sizeKey || !bases.length)) {
      bases = frames.map(frame => {
        const m = new DOMMatrixReadOnly(getComputedStyle(frame).transform);
        return { x: m.m41, y: m.m42, z: m.m43, angle: Math.atan2(-m.m13, m.m11) * 180 / Math.PI };
      });
      sizeKey = key;
    }
    const zoom = ease((t - .11) / .12), fade = 1 - ease((t - .19) / .045);
    opening.style.transform = `scale(${1 + zoom * 8})`;
    opening.style.opacity = String(fade);
    opening.style.visibility = fade ? 'visible' : 'hidden';
    stage.inert = t < 1;
    if (t < .72) {
      const scatter = ease((t - .53) / .19), reveal = ease((t - .22) / .075);
      frames.forEach((frame, i) => {
        const angle = i / frames.length * Math.PI * 2 + (t - .28) * 3.8;
        const r = mobile ? 130 : Math.min(470, w * .24), z = mobile ? 115 : 235;
        const width = frame.offsetWidth, height = frame.offsetHeight, b = bases[i];
        const x = Math.sin(angle) * r - width / 2, y = h / 2 - height / 2;
        const rotation = angle * 180 / Math.PI;
        let targetAngle = b.angle;
        while (targetAngle - rotation > 180) targetAngle -= 360;
        while (targetAngle - rotation < -180) targetAngle += 360;
        frame.style.transform = `translate3d(${mix(x, b.x, scatter)}px,${mix(y, b.y, scatter)}px,${mix(Math.cos(angle) * z, b.z, scatter)}px) rotateY(${mix(rotation, targetAngle, scatter)}deg) scale(${mix(mobile ? 1 : 1.7, 1, scatter)})`;
        frame.style.opacity = String(reveal * mix(.35 + .65 * Math.max(0, Math.cos(angle)), 1, scatter));
      });
    } else {
      for (const frame of frames) frame.style.opacity = '1';
    }
    state.phase = t < .23 ? 'title' : t < .53 ? 'ring' : t < .72 ? 'space' : t < 1 ? 'gathering' : 'column';
    if (state.channel === 'letters') state.phase = 'letters';
    gallery.dataset.phase = state.phase;
    $('#mode').textContent = t === 1 ? 'Back through the photographs ↗' : 'Enter the archive ↗';
    $('#pause').disabled = !state.channel;
    $('#pause').textContent = state.paused ? '继续' : '暂停';
    $('#letters-play').disabled = t !== 1;
    progress.value = Math.round(t * 1000);
    drawLetters();
    room.announce((state.channel === 'letters' ? '逐字照片波' : '片头→环带→分层→竖列') + ' · ' + Math.round(t * 100) + '%' + (state.paused ? ' · 已暂停' : ''));
  }
  function halt() { cancelAnimationFrame(raf); raf = 0; last = 0; }
  function start() { if (!raf && state.channel && !state.paused) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function lettersPlay() {
    if (state.position !== 1) return;
    halt(); state.letterTime = 0; state.paused = false;
    if (room.reduced()) { state.channel = null; render(); room.announce('减少动态：保留清晰原标题。'); return; }
    state.channel = 'letters'; render(); start();
  }
  function tick(now) {
    raf = 0;
    if (!state.channel || state.paused) return;
    const dt = Math.min(50, now - last); last = now;
    if (state.channel === 'intro') {
      state.position = clamp(state.position + (state.target ? 1 : -1) * dt / 7800);
      render();
      if (state.position === state.target) {
        state.channel = null; state.cycles++;
        if (state.target === 1) { lettersPlay(); return; }
        render(); room.announce('已沿同一照片集合返回片头。'); return;
      }
    } else {
      state.letterTime += dt / 1000;
      if (state.letterTime >= 2.6) { state.letterTime = 2.6; state.channel = null; render(); room.announce('逐字照片波结束，标题恢复清晰白字。'); return; }
      render();
    }
    raf = requestAnimationFrame(tick);
  }
  function go(target) {
    halt(); state.target = target; state.paused = false; state.letterTime = 0; clearLetters();
    if (room.reduced()) { state.position = target; state.channel = null; render(); return; }
    state.channel = state.position === target ? null : 'intro'; render(); start();
  }
  function reset() {
    halt(); state.position = initialPosition; state.target = 1; state.channel = null; state.paused = false; state.letterTime = 0; state.cycles = 0;
    sizeKey = ''; bases = []; clearLetters(); render(); room.announce(initialPosition ? '同一18张图片与逐字标题已复位。' : '同一18张图片与片头已复位。');
  }
  $('#play').onclick = () => { if (state.position === 1) state.position = 0; go(1); };
  $('#pause').onclick = () => { if (!state.channel) return; state.paused = !state.paused; halt(); render(); start(); };
  $('#mode').onclick = () => go(state.position === 1 || state.channel && state.target === 1 ? 0 : 1);
  $('#return-space').onclick = () => go(0);
  $('#letters-play').onclick = lettersPlay;
  $('#home').onclick = e => { e.preventDefault(); dispatchEvent(new Event('room-reset')); };
  progress.oninput = e => { halt(); state.channel = null; state.paused = false; state.position = clamp(+e.target.value / 1000); state.letterTime = 0; clearLetters(); render(); };
  addEventListener('room-reset', reset);
  addEventListener('resize', () => { sizeKey = ''; render(); });
  room.onPreference(reduced => { if (reduced) { halt(); if (state.channel === 'intro') state.position = state.target; state.channel = null; state.paused = false; state.letterTime = 0; render(); } });
  window.filmStudy = { state: () => ({ ...state, activeRAF: !!raf, originalImages: originalImages.every((img, i) => frames[i].contains(img) || $('#detail-image').contains(img)), imageCount: originalImages.length }), reset };
  render();
})();
