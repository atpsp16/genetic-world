/* Screens: title, factory map, work order, chapter result, creature book. */
GW.screens = (function () {
  const { $, $$ } = GW.ui;
  const C = GW.creature;

  /** "พัฒนาโดย … · โรงเรียน …" — empty when both are blank in data.js. */
  function credit() {
    const c = GW.CONFIG;
    return [c.developer ? 'พัฒนาโดย ' + c.developer : '', c.school].filter(Boolean).join(' · ');
  }

  /* ---------- Title ---------- */
  function title() {
    GW.app.screen('title');
    $('#screen').innerHTML = `
      <div class="title-screen">
        <div class="title-card">
          <div class="logo">${C.dna(72)}<div><div class="logo-main">GENETIC WORLD</div><div class="logo-sub">${GW.CONFIG.subtitle}</div></div></div>
          <div class="title-pals">
            ${C.svg('Pp', { size: 150, mood: 'open', cls: 'bounce' })}
            ${C.egg({ size: 112, cls: 'wobble-slow' })}
            ${C.svg('pp', { size: 150, mood: 'happy', cls: 'bounce delay' })}
          </div>
          <p class="title-desc">เกมการเรียนรู้เรื่อง <b>การถ่ายทอดลักษณะทางพันธุกรรม</b><br>${GW.CONFIG.grade}</p>
          <div class="title-actions">
            <button class="btn btn-xl" id="t-start">▶ เริ่มเกม</button>
            <div class="row">
              <button class="btn btn-ghost" id="t-book">📖 สมุดสะสม</button>
              <button class="btn btn-ghost" id="t-teacher">🧑‍🏫 สำหรับครู</button>
            </div>
          </div>
          ${credit() ? `<div class="credit">${credit()}</div>` : ''}
        </div>
      </div>`;
    $('#t-start').addEventListener('click', () => { GW.sound.play('pop'); startGame(); });
    $('#t-book').addEventListener('click', () => { GW.sound.play('click'); book(); });
    $('#t-teacher').addEventListener('click', () => { GW.sound.play('click'); GW.teacher.show(); });
  }

  /* ---------- Player name + room ---------- */
  function playerDialog(onDone, mode) {
    const { esc } = GW.ui;
    const p = GW.state.player();
    const isNew = mode === 'new';
    const close = GW.ui.modal({
      title: isNew ? '👤 ผู้เล่นใหม่' : '👤 ชื่อผู้เล่น',
      html: `
        <label class="field"><span>ชื่อเล่น <small>(แสดงบนกระดานคะแนน)</small></span>
          <input id="pl-name" maxlength="20" value="${isNew ? '' : esc(p.name)}" placeholder="เช่น มิ้นท์ หรือ เลขที่ 12" autocomplete="off"></label>
        <label class="field"><span>รหัสห้อง <small>(คนที่จะแข่งกันใช้รหัสเดียวกัน)</small></span>
          <input id="pl-room" maxlength="20" value="${esc(p.room || GW.ONLINE.defaultRoom)}" placeholder="เช่น ม32" autocomplete="off"></label>
        <p class="field-msg" id="pl-msg"></p>`,
      buttons: [
        ...(p.name ? [{ label: 'ยกเลิก', cls: 'btn-ghost' }] : []),
        {
          label: 'ตกลง ➜',
          keepOpen: true,
          onClick: () => {
            const n = $('#pl-name').value.trim().replace(/\s+/g, ' ').slice(0, 20);
            if (!n) { $('#pl-msg').textContent = 'กรุณาใส่ชื่อเล่น'; $('#pl-name').focus(); return; }
            const r = GW.online.cleanRoom($('#pl-room').value);
            if (isNew) GW.state.newPlayer(n, r); else GW.state.setPlayer(n, r);
            close();
            GW.online.push();
            if (onDone) onDone();
          },
        },
      ],
    });
    $$('#overlay input').forEach((inp) => inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('#overlay .modal-actions .btn:last-child').click();
    }));
  }

  function playersDialog(onDone) {
    const { esc } = GW.ui;
    const me = GW.state.player().id;
    const list = GW.state.profiles();
    const close = GW.ui.modal({
      title: '👤 เปลี่ยนผู้เล่น',
      html: `<p class="muted small">ผู้เล่นที่เคยเล่นในเครื่องนี้ — แตะชื่อเพื่อสลับ (ความคืบหน้าของแต่ละคนแยกกัน)</p>
        <div class="pl-list">${list.length ? list.map((p) => `
          <button class="pl-item ${p.id === me ? 'on' : ''}" data-id="${p.id}">
            <b>${esc(p.name)}</b><span>ห้อง ${esc(p.room)} · ${p.total} คะแนน</span>
          </button>`).join('') : '<p class="muted">ยังไม่มีผู้เล่น</p>'}</div>`,
      buttons: [
        { label: 'ปิด', cls: 'btn-ghost' },
        { label: '✏️ แก้ชื่อ/ห้อง', cls: 'btn-ghost', onClick: () => playerDialog(onDone) },
        { label: '➕ ผู้เล่นใหม่', onClick: () => playerDialog(onDone, 'new') },
      ],
    });
    $$('#overlay .pl-item').forEach((b) => b.addEventListener('click', () => {
      GW.sound.play('pop');
      GW.state.switchTo(b.dataset.id);
      close();
      if (onDone) onDone();
    }));
  }

  function startGame() {
    const s = GW.state.get();
    if (!s.name) { playerDialog(startGame); return; }
    if (!s.pre && !s.demo) {
      GW.ui.modal({
        title: '📝 ก่อนเริ่มงานในโรงงาน',
        html: '<p>ลองทำ<b>แบบทดสอบก่อนเรียน</b> 6 ข้อ เพื่อดูว่าตอนนี้เข้าใจเรื่องพันธุกรรมแค่ไหน</p><p class="muted">ยังไม่รู้ก็ไม่เป็นไร ตอบตามที่คิดได้เลย</p>',
        buttons: [
          { label: 'ข้ามไปก่อน', cls: 'btn-ghost', onClick: map },
          { label: 'ทำแบบทดสอบ ➜', onClick: () => GW.quiz.start('pre') },
        ],
      });
    } else map();
  }

  /* ---------- Demo shortcuts (map + teacher page) ---------- */
  const SHORTCUTS = [
    ['3:3', '🧪 ตารางพันเนตต์ Pp × Pp'],
    ['3:4', '🥚 ตู้ฟัก Pp × Pp (ฟัก 100 ฟอง)'],
    ['1:1', '🔬 ซูมเซลล์ ยีน–DNA–โครโมโซม'],
    ['1:2', '⚙️ ไมโอซิส สร้างเซลล์สืบพันธุ์'],
    ['4:0', '🏆 ด่านบอส ออกแบบการผสม'],
    ['1:0', '▶ บทที่ 1 ตั้งแต่ต้น'],
  ];
  function shortcutsHtml() {
    return `<div class="shortcuts">${SHORTCUTS.map(([k, t]) => `<button class="sc" data-go="${k}">${t}</button>`).join('')}</div>`;
  }
  function bindShortcuts(root) {
    $$('.sc[data-go]', root).forEach((b) => b.addEventListener('click', () => {
      GW.sound.play('click');
      const [lv, st] = b.dataset.go.split(':').map(Number);
      GW.runner.start(lv, st);
    }));
  }

  /* ---------- Map ---------- */
  function map() {
    GW.app.screen('map', 'แผนที่โรงงาน');
    const s = GW.state.get();
    const totalStars = Object.values(s.stars).reduce((a, b) => a + b, 0);
    const postReady = s.demo || (s.stars[3] || 0) > 0;
    const scoreTxt = (r) => `${r.score}/${r.total} คะแนน`;

    const levelCard = (l) => {
      const unlocked = GW.state.unlocked(l.id);
      const stars = s.stars[l.id] || 0;
      const T = GW.TRAITS[l.trait];
      const art = l.boss
        ? '<div class="lvl-boss">🏆</div>'
        : `${C.svg(l.father.g, { size: 66 })}<span class="x">×</span>${C.svg(l.mother.g, { size: 66 })}`;
      const cross = l.boss
        ? 'ออกแบบการผสมพันธุ์'
        : `${T[GW.gen.pheno(l.father.g)].label} × ${T[GW.gen.pheno(l.mother.g)].label}`;
      return `<button class="lvl ${unlocked ? '' : 'locked'} ${l.boss ? 'boss' : ''}" data-id="${l.id}" ${unlocked ? '' : 'disabled'}>
          <div class="lvl-num">${l.boss ? 'ด่านบอส' : 'บทที่ ' + l.id}</div>
          <div class="lvl-art">${art}</div>
          <div class="lvl-name">${l.name}</div>
          <div class="lvl-cross">${cross}</div>
          <div class="lvl-stars">${[1, 2, 3].map((i) => `<i class="${i <= stars ? 'on' : ''}">★</i>`).join('')}</div>
          <div class="lvl-status">${!unlocked ? '🔒 ผ่านบทก่อนหน้าก่อน' : stars ? 'เล่นอีกครั้ง' : 'เริ่มเลย ➜'}</div>
        </button>`;
    };

    $('#screen').innerHTML = `
      <div class="map">
        <div class="map-main">
          <div class="map-head">
            <h1>แผนที่โรงงาน</h1>
            <p>เลือกใบสั่งผลิตที่ต้องการทำ — ผ่านบทก่อนหน้าเพื่อปลดล็อกบทถัดไป</p>
          </div>
          <div class="levels">${GW.LEVELS.map(levelCard).join('')}</div>
        </div>
        <aside class="map-side">
          <div class="card profile">
            <div class="pf-top">${C.mascot('happy', 56)}<div>
              <div class="pf-title">${s.name ? GW.ui.esc(s.name) : 'นักวิทยาศาสตร์ฝึกหัด'}</div>
              <div class="pf-lv">${s.name ? `ห้อง ${GW.ui.esc(s.room)} · ` : ''}เลเวล ${GW.state.level()}</div>
            </div></div>
            <div class="xp"><div class="xp-bar"><span style="width:${GW.state.levelProgress()}%"></span></div><small>${GW.state.levelProgress()}/100 EXP สู่เลเวลถัดไป</small></div>
            <div class="pf-stats"><span title="คะแนนรวม">🏆 ${GW.state.total()}</span><span title="ดาว">⭐ ${totalStars}/${GW.LEVELS.length * 3}</span><span title="เหรียญ">🪙 ${s.coins}</span></div>
            <div class="pf-actions">
              <button class="btn btn-sun" id="m-board">🏆 อันดับ</button>
              <button class="btn btn-ghost" id="m-player">👤 ${s.name ? 'เปลี่ยนผู้เล่น' : 'ใส่ชื่อ'}</button>
            </div>
          </div>
          <div class="card tests">
            <h3>แบบทดสอบ</h3>
            <button class="test-row" id="m-pre">📝 ก่อนเรียน <span>${s.pre ? scoreTxt(s.pre) : 'ยังไม่ทำ'}</span></button>
            <button class="test-row" id="m-post" ${postReady ? '' : 'disabled'}>🎓 หลังเรียน <span>${s.post ? scoreTxt(s.post) : postReady ? 'ทำได้แล้ว' : '🔒 หลังผ่านบทที่ 3'}</span></button>
          </div>
          <button class="btn btn-ghost wide" id="m-book">📖 สมุดสะสมปุกปุย</button>
          ${s.demo ? `<div class="card demo-card"><h3>⚡ ทางลัดสาธิต</h3>${shortcutsHtml()}</div>` : ''}
        </aside>
      </div>`;

    $$('.lvl:not(.locked)').forEach((b) => b.addEventListener('click', () => {
      GW.sound.play('pop');
      order(+b.dataset.id);
    }));
    $('#m-pre').addEventListener('click', () => { GW.sound.play('click'); GW.quiz.start('pre'); });
    $('#m-post').addEventListener('click', () => { GW.sound.play('click'); GW.quiz.start('post'); });
    $('#m-book').addEventListener('click', () => { GW.sound.play('click'); book(); });
    $('#m-board').addEventListener('click', () => { GW.sound.play('click'); GW.board.show(); });
    $('#m-player').addEventListener('click', () => {
      GW.sound.play('click');
      if (GW.state.get().name) playersDialog(map); else playerDialog(map);
    });
    bindShortcuts($('#screen'));
  }

  /* ---------- Work order ---------- */
  function order(id) {
    const l = GW.LEVELS.find((x) => x.id === id);
    const T = GW.TRAITS[l.trait];
    GW.app.screen('order', l.boss ? 'ด่านบอส' : `บทที่ ${l.id} · ${l.name}`);
    const parent = (p, label) => `<div class="pp-card">
        ${C.svg(p.g, { size: 110, mood: 'smile', cls: 'idle' })}
        <b>${label}</b><span>${T[GW.gen.pheno(p.g)].label}</span>
      </div>`;
    const steps = (l.boss ? GW.BOSS_STATIONS : GW.STATIONS)
      .map((s, i) => `<span class="ps"><i>${i + 1}</i>${s.short}</span>`).join('<span class="ps-arrow">→</span>');
    $('#screen').innerHTML = `
      <div class="center-screen">
        <div class="paper">
          <div class="paper-head"><div>📋 ใบสั่งผลิต${l.boss ? 'พิเศษ' : ''}</div><div class="no">No. ${String(l.id).padStart(3, '0')}</div></div>
          <div class="paper-from">จาก: <b>${l.customer}</b></div>
          <p class="paper-req">“${l.order}”</p>
          ${l.boss
            ? `<div class="paper-parents boss-art">${C.svg('PP', { size: 90 })}${C.svg('Pp', { size: 90 })}${C.svg('pp', { size: 90 })}</div>`
            : `<div class="paper-parents">${parent(l.father, '♂ พ่อพันธุ์')}<span class="x">×</span>${parent(l.mother, '♀ แม่พันธุ์')}</div>`}
          <div class="paper-rule"><b>กฎของโรงงาน:</b> ${GW.ui.rule(T)}</div>
          <div class="paper-steps">${steps}</div>
          <div class="stamp">${l.boss ? 'บอส!' : 'ด่วน!'}</div>
          <div class="row center">
            <button class="btn btn-ghost" id="o-back">← กลับ</button>
            <button class="btn btn-xl" id="o-go">รับงาน! ➜</button>
          </div>
        </div>
      </div>`;
    $('#o-back').addEventListener('click', () => { GW.sound.play('click'); map(); });
    $('#o-go').addEventListener('click', () => { GW.sound.play('pop'); GW.runner.start(id, 0); });
  }

  /* ---------- Chapter result ---------- */
  function result(r) {
    GW.app.screen('result', r.level.boss ? 'ผ่านด่านบอส' : 'ส่งมอบสำเร็จ');
    const s = GW.state.get();
    const next = GW.LEVELS.find((l) => l.id === r.level.id + 1);
    const suggestPost = r.level.id >= 3 && !s.post;
    $('#screen').innerHTML = `
      <div class="center-screen">
        <div class="card result-card">
          ${C.mascot('happy', 84)}
          <h1>${r.level.boss ? 'ผ่านด่านบอส! 🏆' : 'ส่งมอบใบสั่งผลิตสำเร็จ! 🎉'}</h1>
          <div class="big-stars">${[1, 2, 3].map((i) => `<i class="${i <= r.stars ? 'on' : ''}" style="animation-delay:${0.2 + i * 0.25}s">★</i>`).join('')}</div>
          <p class="muted">ตอบผิด ${r.mistakes} ครั้ง${r.stars === 3 ? ' · สุดยอดนักวิทยาศาสตร์!' : ''}</p>
          <div class="score-line">
            <div><small>คะแนนบทนี้</small><b>${r.score}</b></div>
            <div><small>คะแนนรวม</small><b>${r.total}</b><small>/ ${GW.LEVELS.length * 100}</small></div>
          </div>
          ${r.best > r.score ? `<p class="muted small">คะแนนดีที่สุดของบทนี้คือ ${r.best} — กระดานคะแนนนับครั้งที่ดีที่สุด</p>` : ''}
          <div class="rewards"><span>🪙 +${r.coins} เหรียญ</span><span>✨ +${r.exp} EXP</span></div>
          <div class="learned"><h3>สิ่งที่ได้เรียนรู้ในบทนี้</h3><ul>${r.level.learned.map((x) => `<li>${x}</li>`).join('')}</ul></div>
          <div class="row center">
            <button class="btn btn-ghost" id="r-map">🗺️ กลับแผนที่</button>
            <button class="btn btn-ghost" id="r-board">🏆 ดูอันดับ</button>
            ${suggestPost ? '<button class="btn btn-sun" id="r-post">🎓 แบบทดสอบหลังเรียน</button>' : ''}
            ${next ? `<button class="btn" id="r-next">${next.boss ? 'ไปด่านบอส' : 'บทถัดไป'} ➜</button>` : ''}
          </div>
        </div>
      </div>`;
    GW.sound.play('win');
    GW.ui.confetti();
    $('#r-map').addEventListener('click', () => { GW.sound.play('click'); map(); });
    $('#r-board').addEventListener('click', () => { GW.sound.play('click'); GW.board.show(); });
    if (next) $('#r-next').addEventListener('click', () => { GW.sound.play('pop'); order(next.id); });
    if (suggestPost) $('#r-post').addEventListener('click', () => { GW.sound.play('click'); GW.quiz.start('post'); });
  }

  /* ---------- Creature book ---------- */
  function book() {
    GW.app.screen('book', 'สมุดสะสมปุกปุย');
    const s = GW.state.get();
    const T = GW.TRAITS.fur;
    const entries = GW.gen.genoOrder(T.letter).map((g) => {
      const n = s.book[g] || 0;
      const ph = T[GW.gen.pheno(g)];
      return `<div class="bk ${n ? '' : 'locked'}">
          ${C.svg(g, { size: 120, mood: 'happy', unknown: !n })}
          <div class="bk-g">${n ? g : '???'}</div>
          <div class="bk-p" style="color:${n ? ph.dark : ''}">${n ? ph.label : 'ยังไม่ค้นพบ'}</div>
          <div class="bk-z">${n ? (GW.gen.isHomo(g) ? 'พันธุ์แท้ · ฮอมอไซกัส' : 'พันธุ์ทาง · เฮเทอโรไซกัส') : 'ฟักไข่เพื่อค้นพบ'}</div>
          <div class="bk-n">${n ? `ฟักแล้ว ${n} ตัว` : ''}</div>
        </div>`;
    }).join('');
    $('#screen').innerHTML = `
      <div class="book">
        <div class="map-head"><h1>📖 สมุดสะสมปุกปุย</h1><p>ฟักไข่แล้วทั้งหมด <b>${s.hatched}</b> ตัว</p></div>
        <div class="book-grid">${entries}</div>
        <div class="card book-note">💡 <b>${T.letter}${T.letter}</b> และ <b>${T.letter}${T.letter.toLowerCase()}</b> มี${T.dom.label}เหมือนกัน (ฟีโนไทป์เหมือนกัน) แต่จีโนไทป์ต่างกัน — มองจากภายนอกอย่างเดียวจึงบอกจีโนไทป์ไม่ได้เสมอไป</div>
        <div class="row center"><button class="btn btn-ghost" id="b-back">🗺️ กลับแผนที่</button></div>
      </div>`;
    $('#b-back').addEventListener('click', () => { GW.sound.play('click'); map(); });
  }

  return { title, map, order, result, book, shortcutsHtml, bindShortcuts, credit, playerDialog, playersDialog };
})();
