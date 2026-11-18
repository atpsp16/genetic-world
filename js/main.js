/* App shell: top bar, screen switching, boot. */
GW.app = (function () {
  const { $ } = GW.ui;

  function buildTop() {
    $('#topbar').innerHTML = `
      <button class="tb-logo" id="tb-home" aria-label="หน้าแรก">${GW.creature.dna(30)}<span>GENETIC WORLD</span></button>
      <div class="tb-label" id="tb-label"></div>
      <div class="tb-right">
        <span class="chip chip-demo" id="tb-demo" hidden>โหมดสาธิต</span>
        <span class="chip" id="tb-lv"></span>
        <span class="chip chip-coin" id="tb-coins"></span>
        <button class="icon-btn" id="tb-board" aria-label="อันดับคะแนน" title="อันดับคะแนน">🏆</button>
        <button class="icon-btn" id="tb-book" aria-label="สมุดสะสม" title="สมุดสะสม">📖</button>
        <button class="icon-btn" id="tb-sound" aria-label="เปิดหรือปิดเสียง" title="เสียง"></button>
        <button class="icon-btn" id="tb-map" aria-label="แผนที่โรงงาน" title="แผนที่โรงงาน">🗺️</button>
      </div>`;
    $('#tb-home').addEventListener('click', () => { GW.sound.play('click'); GW.screens.title(); });
    $('#tb-book').addEventListener('click', () => { GW.sound.play('click'); GW.screens.book(); });
    $('#tb-board').addEventListener('click', () => { GW.sound.play('click'); GW.board.show(); });
    $('#tb-map').addEventListener('click', () => { GW.sound.play('click'); GW.screens.map(); });
    $('#tb-sound').addEventListener('click', () => {
      GW.state.set('sound', !GW.state.get().sound);
      GW.sound.play('click');
    });
  }

  let lastCoins = null;
  function refreshTop() {
    const s = GW.state.get();
    const coins = $('#tb-coins');
    if (!coins) return;
    coins.textContent = `🪙 ${s.coins}`;
    if (lastCoins !== null && s.coins !== lastCoins) {
      coins.classList.remove('bump');
      void coins.offsetWidth;
      coins.classList.add('bump');
    }
    lastCoins = s.coins;
    $('#tb-lv').textContent = `✨ Lv.${GW.state.level()}`;
    $('#tb-sound').textContent = s.sound ? '🔊' : '🔇';
    $('#tb-demo').hidden = !s.demo;
  }

  let leaveFns = [];
  /** Run fn when the current screen is replaced (e.g. stop a refresh timer). */
  function onLeave(fn) { leaveFns.push(fn); }

  function screen(name, label) {
    leaveFns.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    leaveFns = [];
    document.body.dataset.screen = name;
    GW.drag.reset();
    $('#topbar').hidden = name === 'title';
    $('#tb-label').textContent = label || '';
    const ov = $('#overlay');
    ov.classList.remove('open');
    ov.innerHTML = '';
    refreshTop();
    window.scrollTo(0, 0);
  }

  function boot() {
    buildTop();
    refreshTop();
    GW.screens.title();
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline cache is optional */ });
    }
  }

  return { screen, onLeave, refreshTop, boot };
})();

GW.app.boot();
