/* Movimento do site: contagem dos números, título letra por letra, parallax do topo e cartaz que inclina.
   Quem pede "reduzir movimento" no aparelho não recebe esses efeitos. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOUSE = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // --- título letra por letra: cada letra desce de dentro de uma "janela" (corte vertical)
  const h1 = document.querySelector('.hero h1');
  if (h1) {
    if (!RM) {
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
      let i = 0;
      const walk = (n, extra) => [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(w => {
            if (!w.trim()) { f.append(w); return; }
            const p = document.createElement('span');
            p.className = 'w'; p.setAttribute('aria-hidden', 'true');
            [...w].forEach(ch => {
              const l = document.createElement('span'), s = document.createElement('i');
              l.className = 'l'; s.textContent = ch; s.style.setProperty('--d', (.1 + extra + i++ * .015).toFixed(3) + 's');
              l.append(s); p.append(l);
            });
            f.append(p);
          });
          c.replaceWith(f);
        } else walk(c, c.classList && c.classList.contains('lime') ? .12 : extra);
      });
      walk(h1, 0);
    }
    h1.classList.add('sp');
  }

  if (RM) return;

  // --- contagem das estatísticas
  const stats = [...document.querySelectorAll('.stats b')];
  if (stats.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, txt = el.textContent, n = parseInt(txt.replace(/\D/g, ''), 10), pre = txt.startsWith('+') ? '+' : '', t0 = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - t0) / 1900);
        el.textContent = p < 1 ? pre + Math.round(n * (1 - Math.pow(1 - p, 2))) : txt;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: .6 });
    stats.forEach(el => io.observe(el));
  }

  // --- parallax do topo: transform direto na foto, só enquanto o topo aparece
  const pic = document.querySelector('.hero picture');
  if (pic) {
    const hero = pic.closest('.hero');
    let raf = 0;
    const par = () => { raf = 0; const y = scrollY; pic.style.translate = y < hero.offsetHeight ? '0 ' + (y * .25).toFixed(1) + 'px' : ''; };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(par); }, { passive: true });
  }

  // --- inclinação do cartaz com o mouse (só computador)
  if (MOUSE) {
    let box = null, raf = 0, ev;
    const move = () => {
      raf = 0;
      box = box && box.isConnected ? box : document.querySelector('.news-poster'); if (!box) return;
      const r = box.getBoundingClientRect();
      const dentro = ev.clientX > r.left - 80 && ev.clientX < r.right + 80 && ev.clientY > r.top - 80 && ev.clientY < r.bottom + 80;
      box.style.setProperty('--ry', dentro ? ((ev.clientX - (r.left + r.width / 2)) / r.width * 14).toFixed(1) + 'deg' : '0deg');
      box.style.setProperty('--rx', dentro ? (-(ev.clientY - (r.top + r.height / 2)) / r.height * 14).toFixed(1) + 'deg' : '0deg');
    };
    document.addEventListener('mousemove', e => { ev = e; if (!raf) raf = requestAnimationFrame(move); }, { passive: true });
  }
})();
