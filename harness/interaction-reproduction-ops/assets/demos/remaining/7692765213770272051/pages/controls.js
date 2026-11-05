// Small, event-driven demo controls. Motion parameters in these pages are fitted.
export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const reduced = () => $('#reduce').checked || matchMedia('(prefers-reduced-motion:reduce)').matches;
export function announce(text) {
  $('#state').textContent = text;
  parent.postMessage({ type: 'demo-state', state: text }, '*');
}
export const animations = new Set();
export function animate(node, frames, options) {
  if (reduced()) return null;
  const a = node.animate(frames, options);
  animations.add(a);
  a.finished.then(() => { animations.delete(a); a.cancel(); }, () => animations.delete(a));
  return a;
}
export function stopAnimations() {
  for (const a of animations) a.cancel();
  animations.clear();
}
export async function setup({ reset, settle, extra = {} }) {
  function sync() {
    document.documentElement.dataset.reduced = String(reduced());
    stopAnimations();
    settle();
  }
  $('#reset').addEventListener('click', () => { stopAnimations(); reset(); });
  $('#reduce').addEventListener('change', sync);
  matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change', sync);
  addEventListener('message', e => {
    if (e.source !== parent) return;
    if (['reset', 'reset-demo'].includes(e.data?.type)) { stopAnimations(); reset(); }
    if (['motion-prefs', 'motion-preference'].includes(e.data?.type)) {
      $('#reduce').checked = !!e.data.reduced;
      sync();
    }
  });
  await Promise.all($$('img').map(img => img.decode().catch(() => {})));
  document.documentElement.dataset.reduced = String(reduced());
  window.demo = { reset, reduced, ...extra };
  document.body.dataset.ready = 'true';
}
