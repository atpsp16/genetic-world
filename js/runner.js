/* Station runner: draws the shared station frame (stepper, side panel with the
   coach, hint and next buttons) and hands each station a `ctx` object. */
GW.STATIONS = [];       // normal chapters: filled by js/stations/*.js
GW.BOSS_STATIONS = [];  // boss chapter: filled by js/boss.js

GW.runner = (function () {
  const { $, $$ } = GW.ui;
  let run = null;

  const listFor = (level) => (level.boss ? GW.BOSS_STATIONS : GW.STATIONS);

  function start(levelId, idx) {
    const level = GW.LEVELS.find((l) => l.id === levelId);
    run = { level, idx: idx || 0, mistakes: 0, coins: 0, exp: 0, done: new Set() };
    show();
  }

  function show() {
    const { level } = run;
    const list = listFor(level);
    const st = list[run.idx];
    const T = GW.TRAITS[level.trait];
    const demo = GW.state.get().demo;
    const last = run.idx === list.length - 1;

    GW.app.screen('station', level.boss ? `ด่านบอส · ${level.name}` : `บทที่ ${level.id} · ${level.name}`);
    $('#screen').innerHTML = `
      <div class="station">
        <nav class="stepper" aria-label="ขั้นตอน">
          ${list.map((s, i) => `<button class="step ${run.done.has(i) ? 'done' : ''} ${i === run.idx ? 'current' : ''}" data-i="${i}" ${demo ? '' : 'disabled'}>
              <span class="step-n">${run.done.has(i) ? '✓' : i + 1}</span><span class="step-t">${s.short}</span>
            </button>`).join('<span class="step-line"></span>')}
        </nav>
        <div class="st-meta">
          <div class="card st-info">
            <div class="st-kicker">${level.boss ? 'ด่านบอส' : 'สถานี'} ${run.idx + 1} จาก ${list.length}</div>
            <h2 class="st-title"><span class="st-ic">${st.icon}</span>${st.title}</h2>
            <p class="mission"><b>ภารกิจ:</b> ${typeof st.mission === 'function' ? st.mission(level) : st.mission}</p>
          </div>
          <div class="card rule">${GW.ui.rule(T)}</div>
        </div>
        <section class="st-main card" id="st-main"></section>
        <aside class="st-dock">
          <div class="card coach"><div class="coach-face">${GW.creature.mascot('info', 64)}</div><div class="bubble" id="bubble" aria-live="polite"></div></div>
          <div class="side-actions">
            <button class="btn btn-ghost" id="btn-hint">💡 คำใบ้</button>
            ${demo ? '<button class="btn btn-demo" id="btn-auto">✨ เติมคำตอบ</button>' : ''}
          </div>
          <button class="btn btn-go btn-lg" id="btn-next" hidden>${last ? (level.boss ? 'ผ่านด่านบอส 🏆' : 'ส่งมอบใบสั่งผลิต ✓') : (level.boss ? 'ใบสั่งต่อไป ➜' : 'ไปสถานีต่อไป ➜')}</button>
        </aside>
      </div>`;

    $$('.stepper .step').forEach((b) => b.addEventListener('click', () => {
      if (!GW.state.get().demo) return;
      run.idx = +b.dataset.i;
      show();
    }));
    $('#btn-next').addEventListener('click', () => {
      GW.sound.play('click');
      if (run.idx < list.length - 1) { run.idx++; show(); } else finish();
    });

    // On phones the dock is fixed to the bottom of the screen: keep the page's
    // bottom padding equal to its height so nothing hides behind it.
    if (dockObserver) dockObserver.disconnect();
    const dock = $('.st-dock');
    const syncDock = () => document.documentElement.style.setProperty('--dock-h', dock.offsetHeight + 'px');
    if (window.ResizeObserver) { dockObserver = new ResizeObserver(syncDock); dockObserver.observe(dock); }
    syncDock();

    const ctx = makeCtx(st);
    st.render($('#st-main'), ctx);
  }
  let dockObserver = null;

  function makeCtx(st) {
    const idx = run.idx;
    const level = run.level;
    let hints = [];
    let hintLevel = 0;
    let autofill = null;
    let finished = false;
    const bubble = $('#bubble');
    const face = $('.coach-face');
    const cost = GW.CONFIG.hintCost;

    const ctx = {
      level,
      T: GW.TRAITS[level.trait],
      F: level.father && level.father.g,
      M: level.mother && level.mother.g,
      run,
      say(msg, mood) {
        face.innerHTML = GW.creature.mascot(mood || 'info', 64);
        bubble.innerHTML = msg;
        bubble.dataset.mood = mood || 'info';
        bubble.classList.remove('pop');
        void bubble.offsetWidth;
        bubble.classList.add('pop');
      },
      /** Correct action: sound + coins (+ optional message). */
      right(msg, el, coins) {
        coins = coins === undefined ? 1 : coins;
        GW.sound.play('right');
        if (coins) {
          GW.state.addCoins(coins);
          run.coins += coins;
          GW.ui.floatText(el, `+${coins} 🪙`);
        }
        if (msg) ctx.say(msg, 'happy');
      },
      /** Wrong action: counted against the chapter's stars, with an explanation. */
      wrong(msg) {
        run.mistakes++;
        GW.sound.play('wrong');
        ctx.say(msg, 'sad');
      },
      /** Station complete: reward once, then show the next button. */
      done(msg) {
        if (finished) { if (msg) ctx.say(msg, 'happy'); return; }
        finished = true;
        run.done.add(idx);
        GW.sound.play('win');
        GW.state.addCoins(5);
        GW.state.addExp(10);
        run.coins += 5;
        run.exp += 10;
        ctx.say(msg, 'happy');
        const nb = $('#btn-next');
        nb.hidden = false;
        nb.classList.add('pop-in');
        const step = $(`.stepper .step[data-i="${idx}"]`);
        if (step) { step.classList.add('done'); step.querySelector('.step-n').textContent = '✓'; }
        const auto = $('#btn-auto');
        if (auto) auto.hidden = true;
        const dockFixed = getComputedStyle($('.st-dock')).position === 'fixed';
        if (!dockFixed && window.matchMedia('(max-width: 980px)').matches) nb.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      isDone: () => finished,
      setHints(h) { hints = h || []; },
      setAutofill(fn) { autofill = fn; },
    };

    $('#btn-hint').addEventListener('click', () => {
      GW.sound.play('click');
      const btn = $('#btn-hint');
      if (!hints.length) { ctx.say('สถานีนี้ลองทำได้เลย ไม่ต้องใช้คำใบ้', 'info'); return; }
      if (hintLevel === 0) {
        hintLevel = 1;
        ctx.say('💡 ' + hints[0], 'think');
        if (hints[1]) btn.textContent = `💡 คำใบ้เพิ่ม (${cost} 🪙)`;
        return;
      }
      if (hintLevel === 1 && hints[1]) {
        if (GW.state.get().coins < cost) {
          ctx.say(`เหรียญไม่พอ (ต้องใช้ ${cost} 🪙) ลองอ่านคำใบ้แรกอีกครั้ง: ${hints[0]}`, 'think');
          return;
        }
        GW.state.addCoins(-cost);
        hintLevel = 2;
        btn.textContent = '💡 ดูคำใบ้อีกครั้ง';
      }
      ctx.say('💡 ' + (hints[hintLevel - 1] || hints[0]), 'think');
    });

    const autoBtn = $('#btn-auto');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        GW.sound.play('click');
        if (autofill) autofill();
      });
    }
    return ctx;
  }

  function finish() {
    const stars = run.mistakes <= 1 ? 3 : run.mistakes <= 4 ? 2 : 1;
    const bonus = 10 + stars * 5;
    GW.state.addCoins(bonus);
    GW.state.addExp(30);
    run.coins += bonus;
    run.exp += 30;
    GW.state.setStars(run.level.id, stars);
    GW.screens.result({ level: run.level, stars, mistakes: run.mistakes, coins: run.coins, exp: run.exp });
  }

  return { start };
})();
