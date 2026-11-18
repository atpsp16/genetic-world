/* Leaderboard: everyone in the same room code, live from the online database
   (refreshes every 10 s). Falls back to the players saved on this device. */
GW.board = (function () {
  const { $, esc } = GW.ui;
  const C = GW.creature;
  const MAX = GW.LEVELS.length * 100;

  function show() {
    const p = GW.state.player();
    if (!p.name) { GW.screens.playerDialog(show); return; }
    const room = GW.online.cleanRoom(p.room);
    GW.app.screen('board', 'อันดับคะแนน');
    $('#screen').innerHTML = `
      <div class="board">
        <div class="map-head">
          <h1>🏆 อันดับคะแนน</h1>
          <p>ห้อง <b>${esc(room)}</b> · <span id="bd-status">กำลังโหลด…</span></p>
        </div>
        <div class="podium" id="bd-podium"></div>
        <div class="card bd-list" id="bd-list"></div>
        <div class="row center">
          <button class="btn btn-ghost" id="bd-map">🗺️ กลับแผนที่</button>
          <button class="btn btn-ghost" id="bd-refresh">🔄 รีเฟรช</button>
          <button class="btn btn-ghost" id="bd-player">👤 เปลี่ยนผู้เล่น</button>
        </div>
        <p class="muted small center-text">คะแนนแต่ละบท = 100 − 10 × จำนวนครั้งที่ตอบผิด (ต่ำสุด 20) · นับคะแนนที่ดีที่สุดของแต่ละบท · เต็ม ${MAX} คะแนน</p>
      </div>`;
    $('#bd-map').addEventListener('click', () => { GW.sound.play('click'); GW.screens.map(); });
    $('#bd-refresh').addEventListener('click', () => { GW.sound.play('click'); load(room); });
    $('#bd-player').addEventListener('click', () => { GW.sound.play('click'); GW.screens.playersDialog(show); });
    load(room);
    if (GW.online.enabled()) {
      const timer = setInterval(() => load(room), 10000);
      GW.app.onLeave(() => clearInterval(timer));
    }
  }

  function localRows(room) {
    return GW.state.profiles()
      .filter((x) => GW.online.cleanRoom(x.room) === room && x.total > 0)
      .sort((a, b) => b.total - a.total);
  }

  async function load(room) {
    let rows = null;
    let status;
    if (GW.online.enabled()) {
      if (!GW.state.get().synced) await GW.online.push();
      try {
        rows = await GW.online.fetchBoard(room);
        const t = new Date();
        status = `🟢 ออนไลน์ · อัปเดต ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
      } catch (e) {
        status = '🔴 เชื่อมต่อไม่ได้ — แสดงเฉพาะผู้เล่นในเครื่องนี้';
      }
    } else {
      status = 'แสดงผู้เล่นในเครื่องนี้ (ยังไม่ได้เชื่อมต่อกระดานออนไลน์)';
    }
    if (!rows) rows = localRows(room);
    if (document.body.dataset.screen !== 'board') return; // left the screen while loading
    $('#bd-status').textContent = status;
    render(rows);
  }

  function render(rows) {
    const me = GW.state.player().id;
    const medals = ['🥇', '🥈', '🥉'];
    const looks = ['happy', 'open', 'smile'];
    if (!rows.length) {
      $('#bd-podium').innerHTML = '';
      $('#bd-list').innerHTML = '<p class="muted center-text">ยังไม่มีคะแนนในห้องนี้ — เล่นให้จบสักบทเพื่อขึ้นกระดาน</p>';
      return;
    }
    const top = rows.slice(0, 3);
    // podium order on screen: 2nd, 1st, 3rd
    const order = [1, 0, 2].filter((i) => top[i]);
    $('#bd-podium').innerHTML = order.map((i) => {
      const r = top[i];
      return `<div class="pod pod-${i + 1} ${r.id === me ? 'me' : ''}">
          <div class="pod-medal">${medals[i]}</div>
          ${C.svg(i === 0 ? 'Pp' : i === 1 ? 'pp' : 'PP', { size: i === 0 ? 92 : 74, mood: looks[i] })}
          <div class="pod-name">${esc(r.name)}${r.id === me ? ' <small>(คุณ)</small>' : ''}</div>
          <div class="pod-score">${r.total}</div>
          <div class="pod-stars">⭐ ${r.stars || 0}</div>
        </div>`;
    }).join('');
    const rest = rows.slice(3);
    const mine = rows.findIndex((r) => r.id === me);
    $('#bd-list').innerHTML = (rest.length
      ? rest.map((r, k) => `<div class="bd-row ${r.id === me ? 'me' : ''}">
            <span class="bd-rank">${k + 4}</span>
            <span class="bd-name">${esc(r.name)}${r.id === me ? ' <small>(คุณ)</small>' : ''}</span>
            <span class="bd-stars">⭐ ${r.stars || 0}</span>
            <span class="bd-total">${r.total}</span>
          </div>`).join('')
      : '<p class="muted center-text">ชวนเพื่อนในห้องมาแข่งกัน! ใช้รหัสห้องเดียวกัน</p>')
      + `<div class="bd-mine">คุณอยู่อันดับ <b>${mine >= 0 ? mine + 1 : '-'}</b> · คะแนนรวม <b>${GW.state.total()}</b> / ${MAX}</div>`;
  }

  return { show };
})();
