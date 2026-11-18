/* Small UI helpers shared by every screen. */
GW.ui = (function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  /** Escape text typed by players (names come from other devices too). */
  const esc = (t) => String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /** Allele chip HTML, e.g. allele('P') */
  function allele(a, extra) {
    const cls = GW.gen.isDom(a) ? 'dom' : 'rec';
    return `<span class="allele ${cls} ${extra || ''}" data-a="${a}">${a}</span>`;
  }

  /** The "factory rule" legend for a trait. */
  function rule(T) {
    const L = T.letter;
    return `<span class="rule-item">${allele(L, 'mini')} ${T.dom.label} <small>(เด่น)</small></span>
            <span class="rule-item">${allele(L.toLowerCase(), 'mini')} ${T.rec.label} <small>(ด้อย)</small></span>`;
  }

  /** Modal dialog. buttons: [{label, cls, onClick}] — returns close(). */
  function modal({ title, html, buttons }) {
    const ov = document.getElementById('overlay');
    ov.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
        ${title ? `<h2>${title}</h2>` : ''}
        <div class="modal-body">${html || ''}</div>
        <div class="modal-actions">${(buttons || [])
          .map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`)
          .join('')}</div>
      </div>`;
    ov.classList.add('open');
    const close = () => { ov.classList.remove('open'); ov.innerHTML = ''; };
    $$('.modal-actions .btn', ov).forEach((el) => {
      el.addEventListener('click', () => {
        const b = buttons[+el.dataset.i];
        GW.sound.play('click');
        if (!b.keepOpen) close();
        if (b.onClick) b.onClick();
      });
    });
    return close;
  }

  function confetti() {
    const colors = ['#a46ee8', '#f7c948', '#34d399', '#60a5fa', '#fb7185', '#fbbf24'];
    const box = document.createElement('div');
    box.className = 'confetti';
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = pick(colors);
      p.style.animationDelay = Math.random() * 0.6 + 's';
      p.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3400);
  }

  /** "+2 🪙" floating up from an element. */
  function floatText(el, text) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'float-text';
    d.textContent = text;
    d.style.left = r.left + r.width / 2 + 'px';
    d.style.top = r.top + 'px';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  }

  /** Multiple-choice question. Wrong answers are disabled so the student can retry. */
  function mcq(container, { q, choices, answer, onRight, onWrong }) {
    const order = shuffle(choices.map((_, i) => i));
    container.innerHTML = `<div class="mcq">
        <div class="mcq-q">${q}</div>
        <div class="mcq-choices">${order
          .map((i, k) => `<button class="choice" data-i="${i}"><span class="ck">${'กขคง'[k]}</span><span>${choices[i]}</span></button>`)
          .join('')}</div>
      </div>`;
    $$('.choice', container).forEach((b) => {
      b.addEventListener('click', () => {
        const i = +b.dataset.i;
        if (i === answer) {
          b.classList.add('correct');
          $$('.choice', container).forEach((x) => (x.disabled = true));
          if (onRight) onRight(b);
        } else {
          b.classList.add('wrong');
          b.disabled = true;
          if (onWrong) onWrong(i, b);
        }
      });
    });
  }

  return { $, $$, shuffle, pick, esc, allele, rule, modal, confetti, floatText, mcq };
})();
