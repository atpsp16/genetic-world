/* Saved progress (localStorage). Each player on this device has their own
   profile (progress + name + room); demo/sound settings are shared.
   Every read/write is guarded: private mode or blocked storage must never break the game. */
GW.state = (function () {
  const KEY = 'genetic-world-save-v2';
  const OLD_KEY = 'genetic-world-save-v1';
  const newId = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const freshProgress = () => ({
    coins: GW.CONFIG.startCoins,
    exp: 0,
    stars: {},      // { levelId: 0..3 }
    scores: {},     // { levelId: best chapter score 20..100 }
    book: {},       // { genotype: count }
    hatched: 0,
    pre: null,      // { score, total, at }
    post: null,
  });
  const newProfile = (name, room) =>
    Object.assign({ id: newId(), name: name || '', room: room || '', synced: true }, freshProgress());
  const sum = (o) => Object.values(o || {}).reduce((a, b) => a + b, 0);

  let db = { current: null, profiles: {}, settings: { demo: false, sound: true } };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      db = Object.assign(db, JSON.parse(raw));
    } else {
      const old = localStorage.getItem(OLD_KEY); // progress saved by version 1
      if (old) {
        const o = JSON.parse(old);
        const p = Object.assign(newProfile(), o);
        delete p.demo;
        delete p.sound;
        db.profiles[p.id] = p;
        db.current = p.id;
        db.settings = { demo: !!o.demo, sound: o.sound !== false };
      }
    }
  } catch (e) { /* storage unavailable: play without saving */ }
  if (!db.profiles[db.current]) {
    const p = newProfile();
    db.profiles[p.id] = p;
    db.current = p.id;
  }

  let s;
  function bind() {
    s = Object.assign(freshProgress(), db.profiles[db.current]);
    db.profiles[db.current] = s;
    s.demo = db.settings.demo;
    s.sound = db.settings.sound;
  }
  bind();

  function save() {
    try {
      const out = JSON.parse(JSON.stringify(db));
      Object.values(out.profiles).forEach((p) => { delete p.demo; delete p.sound; });
      localStorage.setItem(KEY, JSON.stringify(out));
    } catch (e) { /* ignore */ }
  }
  const refresh = () => GW.app && GW.app.refreshTop();
  const isBlank = (p) => !p.name && !sum(p.scores) && !p.hatched && !p.pre;

  return {
    get: () => s,
    save,
    set(k, v) {
      if (k === 'demo' || k === 'sound') db.settings[k] = v;
      s[k] = v;
      save();
      refresh();
    },
    addCoins(n) { s.coins = Math.max(0, s.coins + n); save(); refresh(); },
    addExp(n) { s.exp += n; save(); refresh(); },
    level: () => 1 + Math.floor(s.exp / 100),
    levelProgress: () => s.exp % 100,
    unlocked(id) {
      if (s.demo || id === 1) return true;
      return (s.stars[id - 1] || 0) > 0;
    },
    setStars(id, n) { s.stars[id] = Math.max(s.stars[id] || 0, n); save(); },
    addToBook(g, n = 1) { s.book[g] = (s.book[g] || 0) + n; s.hatched += n; save(); },

    /* ---- scores & players ---- */
    setScore(id, n) { s.scores[id] = Math.max(s.scores[id] || 0, n); s.synced = false; save(); },
    total: () => sum(s.scores),
    totalStars: () => sum(s.stars),
    player: () => ({ id: s.id, name: s.name, room: s.room }),
    setPlayer(name, room) {
      if (s.room !== room) s.synced = false;
      s.name = name;
      s.room = room;
      s.synced = false;
      save();
      refresh();
    },
    /** New player on this device (reuses the current profile if it was never used). */
    newPlayer(name, room) {
      if (isBlank(s)) { this.setPlayer(name, room); return; }
      const p = newProfile(name, room);
      p.synced = false;
      db.profiles[p.id] = p;
      db.current = p.id;
      bind();
      save();
      refresh();
    },
    profiles: () => Object.values(db.profiles).filter((p) => p.name).map((p) => ({
      id: p.id, name: p.name, room: p.room, total: sum(p.scores), stars: sum(p.stars),
    })),
    switchTo(id) {
      if (!db.profiles[id]) return;
      db.current = id;
      bind();
      save();
      refresh();
    },
    markSynced(v) { s.synced = v; save(); },

    exportCode() {
      const out = Object.assign({}, s);
      delete out.demo;
      delete out.sound;
      return btoa(unescape(encodeURIComponent(JSON.stringify(out))));
    },
    importCode(code) {
      try {
        const o = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
        if (typeof o !== 'object' || o === null) return false;
        const p = Object.assign(freshProgress(), o);
        if (!p.id) p.id = newId();
        delete p.demo;
        delete p.sound;
        p.synced = false;
        delete db.profiles[db.current];
        db.profiles[p.id] = p;
        db.current = p.id;
        bind();
        save();
        refresh();
        return true;
      } catch (e) { return false; }
    },
    /** Wipe every player on this device (settings are kept). */
    reset() {
      db = { current: null, profiles: {}, settings: db.settings };
      const p = newProfile();
      db.profiles[p.id] = p;
      db.current = p.id;
      bind();
      save();
      refresh();
    },
  };
})();
