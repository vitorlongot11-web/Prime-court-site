/* Galeria da Estrutura: toque numa foto para vê-la inteira, com zoom.
   - zoom: botões + / −, roda do mouse, pinça (2 dedos) ou toque duplo
   - com zoom: arraste para mover a foto
   - sem zoom: deslize para os lados (ou use as setas) para trocar de foto
   - teclado: Esc fecha, ← → trocam, + − dão zoom, 0 volta ao tamanho normal
   Funciona com as fotos de espaço reservado de hoje e com <img> reais depois. */
(() => {
  const gal = document.querySelector('.gal');
  if (!gal) return;
  const figs = [...gal.querySelectorAll('figure')];
  if (!figs.length) return;

  const MAX = 5, STEP = 1.5;
  const svg = p => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Galeria de fotos');
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML = `
    <div class="lb-stage"><div class="lb-media"></div></div>
    <div class="lb-top"><span class="lb-count" aria-live="polite"></span>
      <button type="button" class="lb-btn lb-close" aria-label="Fechar">${svg('<path d="M6 6l12 12M18 6L6 18"/>')}</button></div>
    <button type="button" class="lb-btn lb-nav lb-prev" aria-label="Foto anterior">${svg('<path d="M15 5l-7 7 7 7"/>')}</button>
    <button type="button" class="lb-btn lb-nav lb-next" aria-label="Próxima foto">${svg('<path d="M9 5l7 7-7 7"/>')}</button>
    <div class="lb-bottom"><p class="lb-cap"></p>
      <div class="lb-zoom">
        <button type="button" class="lb-btn" data-z="out" aria-label="Diminuir zoom">${svg('<path d="M5 12h14"/>')}</button>
        <button type="button" class="lb-btn lb-pct" data-z="reset" aria-label="Voltar ao tamanho normal">100%</button>
        <button type="button" class="lb-btn" data-z="in" aria-label="Aumentar zoom">${svg('<path d="M12 5v14M5 12h14"/>')}</button>
      </div></div>`;
  document.body.appendChild(lb);

  const stage = lb.querySelector('.lb-stage'), media = lb.querySelector('.lb-media');
  const cap = lb.querySelector('.lb-cap'), count = lb.querySelector('.lb-count'), pct = lb.querySelector('.lb-pct');
  const bIn = lb.querySelector('[data-z=in]'), bOut = lb.querySelector('[data-z=out]');

  let idx = 0, s = 1, tx = 0, ty = 0, lastFocus = null, isOpen = false;

  const clampPan = () => {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const mx = Math.max(0, (media.offsetWidth * s - sw) / 2), my = Math.max(0, (media.offsetHeight * s - sh) / 2);
    tx = Math.min(mx, Math.max(-mx, tx)); ty = Math.min(my, Math.max(-my, ty));
  };
  const apply = (smooth) => {
    media.style.transition = smooth ? 'transform .22s cubic-bezier(.16,1,.3,1)' : 'none';
    media.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
    pct.textContent = Math.round(s * 100) + '%';
    bIn.disabled = s >= MAX - .001; bOut.disabled = s <= 1.001;
    lb.classList.toggle('zoomed', s > 1.001);
  };
  // dá zoom mantendo o ponto (cx, cy), medido a partir do centro da tela, parado
  const zoomAt = (ns, cx, cy, smooth) => {
    ns = Math.min(MAX, Math.max(1, ns));
    tx = cx - (cx - tx) * (ns / s); ty = cy - (cy - ty) * (ns / s);
    s = ns;
    if (s <= 1.001) { s = 1; tx = 0; ty = 0; }
    clampPan(); apply(smooth);
  };
  const centerOf = () => { const r = stage.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

  const buildMedia = fig => {
    media.innerHTML = '';
    const photo = fig.querySelector('.photo');
    const img = photo && photo.querySelector('img');
    let el;
    if (img) {
      el = document.createElement('img');
      el.className = 'lb-img'; el.src = img.currentSrc || img.src; el.alt = img.alt || ''; el.draggable = false;
    } else if (photo) {
      el = photo.cloneNode(true); el.classList.add('lb-ph'); el.removeAttribute('style');
    }
    if (el) media.appendChild(el);
  };

  const show = i => {
    idx = (i + figs.length) % figs.length;
    const fig = figs[idx];
    buildMedia(fig);
    const c = fig.querySelector('figcaption');
    cap.textContent = c ? c.textContent : '';
    count.textContent = (idx + 1) + ' / ' + figs.length;
    s = 1; tx = 0; ty = 0; apply(false);
  };

  const open = (i, trigger) => {
    lastFocus = trigger || document.activeElement;
    show(i);
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    isOpen = true;
    setTimeout(() => lb.querySelector('.lb-close').focus({ preventScroll: true }), 40);
  };
  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };

  // as fotos da galeria viram botões
  figs.forEach((f, i) => {
    const c = f.querySelector('figcaption');
    f.setAttribute('tabindex', '0'); f.setAttribute('role', 'button');
    f.setAttribute('aria-label', 'Ampliar foto' + (c ? ': ' + c.textContent : ''));
    f.addEventListener('click', () => open(i, f));
    f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, f); } });
  });

  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
  lb.querySelector('.lb-zoom').addEventListener('click', e => {
    const b = e.target.closest('[data-z]'); if (!b) return;
    const k = b.dataset.z;
    if (k === 'reset') zoomAt(1, 0, 0, true);
    else zoomAt(k === 'in' ? s * STEP : s / STEP, 0, 0, true);
  });

  // roda do mouse
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const c = centerOf();
    zoomAt(s * Math.exp(-e.deltaY * 0.0018), e.clientX - c.x, e.clientY - c.y, false);
  }, { passive: false });

  // dedo / mouse: arrastar, pinça, toque duplo, deslizar para trocar de foto
  const ptrs = new Map();
  let startDist = 0, startS = 1, drag = null, moved = false, lastTap = 0;
  stage.addEventListener('pointerdown', e => {
    stage.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) moved = false;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; startDist = Math.hypot(a.x - b.x, a.y - b.y) || 1; startS = s; }
    drag = { x: e.clientX, y: e.clientY, tx, ty };
  });
  stage.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()], c = centerOf();
      zoomAt(startS * Math.hypot(a.x - b.x, a.y - b.y) / startDist, (a.x + b.x) / 2 - c.x, (a.y + b.y) / 2 - c.y, false);
      moved = true; return;
    }
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      if (s > 1.001) { tx = drag.tx + dx; ty = drag.ty + dy; clampPan(); apply(false); stage.classList.add('grabbing'); }
    }
  });
  const end = e => {
    if (!ptrs.has(e.pointerId)) return;
    const wasOne = ptrs.size === 1;
    ptrs.delete(e.pointerId);
    stage.classList.remove('grabbing');
    if (wasOne && drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (s <= 1.001 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) { show(idx + (dx < 0 ? 1 : -1)); drag = null; return; }
      if (!moved) {
        const now = Date.now();
        if (now - lastTap < 320) {
          const c = centerOf();
          zoomAt(s > 1.001 ? 1 : 2.5, e.clientX - c.x, e.clientY - c.y, true);
          lastTap = 0;
        } else {
          lastTap = now;
          if (e.target === stage) setTimeout(() => { if (lastTap && Date.now() - lastTap >= 300 && s <= 1.001) close(); }, 330);
        }
      }
      drag = null;
    }
    if (ptrs.size === 1) { const [p] = [...ptrs.values()]; drag = { x: p.x, y: p.y, tx, ty }; }
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  addEventListener('resize', () => { if (isOpen) { clampPan(); apply(false); } });
  addEventListener('keydown', e => {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === '+' || e.key === '=') zoomAt(s * STEP, 0, 0, true);
    else if (e.key === '-') zoomAt(s / STEP, 0, 0, true);
    else if (e.key === '0') zoomAt(1, 0, 0, true);
    else if (e.key === 'Tab') {
      const f = [...lb.querySelectorAll('button:not([disabled])')];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
