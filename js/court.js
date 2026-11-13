/* Efeito de scroll das quadras (página Estrutura) */
(() => {
  const sec = document.getElementById('estrutura'), iso = document.getElementById('iso');
  if (!sec || !iso) return;
  const ga = iso.querySelector('[data-g="a"]'), gb = iso.querySelector('[data-g="b"]');
  const stm = [...sec.querySelectorAll('.stm > div')];
  const stepEl = document.getElementById('step'), prog = document.getElementById('prog');
  const SCN = [
    [['translateX(0) scale(1)', 1], ['translateX(150px) scale(.66)', 0]],
    [['translateX(-150px) scale(.66)', 0], ['translateX(0) scale(1)', 1]],
    [['translateX(-86px) scale(.66)', 1], ['translateX(86px) scale(.66)', 1]],
  ];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  let idx = -1;
  const setIdx = i => {
    idx = i;
    stm.forEach((el, k) => { el.classList.toggle('on', k === i); el.classList.toggle('past', k < i); });
    stepEl.textContent = '0' + (i + 1) + ' / 03';
    prog.style.width = ((i + 1) / 3 * 100) + '%';
    [[ga, SCN[i][0]], [gb, SCN[i][1]]].forEach(([g, [t, o]]) => { g.style.transform = t; g.style.setProperty('--o', o); });
  };
  const fx = () => {
    const vh = innerHeight, vw = innerWidth, r = sec.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
    const stage = sec.querySelector('.stage');
    const i = Math.min(2, Math.floor(p * 3));
    let k;
    if (vw < 700) k = clamp(Math.min(vw * .5, vh * .3) / 240, .55, .9);
    else {
      // computador: a escala acompanha o giro e a cena atual, para a quadra nunca ser cortada
      const th = (-50 + p * 100) * Math.PI / 180, rx = (58 - p * 8) * Math.PI / 180;
      const w = i === 2 ? 272 : 240, l = i === 2 ? 317 : 480;
      const bw = w * Math.abs(Math.cos(th)) + l * Math.abs(Math.sin(th));
      const bh = (w * Math.abs(Math.sin(th)) + l * Math.abs(Math.cos(th))) * Math.cos(rx) + 130;
      k = clamp(Math.min(stage.clientWidth * .92 / bw, stage.clientHeight * .88 / bh) / (1 + p * .1), .5, 1.7);
    }
    iso.style.transform = `rotateX(${58 - p * 8}deg) rotateZ(${-50 + p * 100}deg) scale(${k * (1 + p * .1)})`;
    if (i !== idx) setIdx(i);
  };
  setIdx(0); fx();
  addEventListener('scroll', fx, { passive: true });
  addEventListener('resize', fx);
})();
