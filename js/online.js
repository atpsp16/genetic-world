/* Online leaderboard through the Firebase Realtime Database REST API
   (plain fetch, no SDK). Data layout:
     rooms/{room}/players/{playerId} = { name, total, stars, updated }
   Security rules that validate these writes are in firebase-rules.json. */
GW.online = (function () {
  const base = () => (GW.ONLINE.databaseURL || '').trim().replace(/\/+$/, '');
  const enabled = () => /^https?:\/\/[^/]+/.test(base());

  /** Room codes become database keys: strip characters Firebase does not allow. */
  function cleanRoom(r) {
    const c = String(r || '').replace(/[.$#[\]/\s]/g, '').slice(0, 20).toUpperCase();
    return c || GW.ONLINE.defaultRoom;
  }
  const playersPath = (room) => `${base()}/rooms/${encodeURIComponent(cleanRoom(room))}/players`;

  async function withTimeout(promise, ms) {
    let t;
    const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error('timeout')), ms); });
    try { return await Promise.race([promise, timeout]); } finally { clearTimeout(t); }
  }

  /** Send the current player's total to the room board. Returns true when saved. */
  async function push() {
    const p = GW.state.player();
    if (!enabled() || !p.name) return false;
    const body = {
      name: p.name,
      total: GW.state.total(),
      stars: GW.state.totalStars(),
      updated: { '.sv': 'timestamp' },
    };
    try {
      const res = await withTimeout(fetch(`${playersPath(p.room)}/${p.id}.json`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }), 8000);
      GW.state.markSynced(res.ok);
      return res.ok;
    } catch (e) {
      GW.state.markSynced(false);
      return false;
    }
  }

  /** Everyone in a room, best first (ties: whoever reached the score first). */
  async function fetchBoard(room) {
    const q = `orderBy=${encodeURIComponent('"total"')}&limitToLast=100`;
    const res = await withTimeout(fetch(`${playersPath(room)}.json?${q}`), 8000);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = (await res.json()) || {};
    return Object.keys(data).map((id) => Object.assign({ id }, data[id]))
      .filter((r) => typeof r.name === 'string' && typeof r.total === 'number')
      .sort((a, b) => b.total - a.total || (a.updated || 0) - (b.updated || 0));
  }

  window.addEventListener('online', () => { if (!GW.state.get().synced) push(); });

  return { enabled, cleanRoom, push, fetchBoard };
})();
