/* Saved progress (localStorage). Every read/write is guarded: private mode
   or blocked storage must never break the game. */
GW.state = (function () {
  const KEY = 'genetic-world-save-v1';
  const fresh = () => ({
    coins: GW.CONFIG.startCoins,
    exp: 0,
    stars: {},      // { levelId: 0..3 }
    book: {},       // { genotype: count }
    hatched: 0,
    pre: null,      // { score, total, at }
    post: null,
    demo: false,
    sound: true,
  });

  let s = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) s = Object.assign(fresh(), JSON.parse(raw));
  } catch (e) { /* storage unavailable: play without saving */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }
  const refresh = () => GW.app && GW.app.refreshTop();

  return {
    get: () => s,
    save,
    set(k, v) { s[k] = v; save(); refresh(); },
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
    exportCode() {
      return btoa(unescape(encodeURIComponent(JSON.stringify(s))));
    },
    importCode(code) {
      try {
        const o = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
        if (typeof o !== 'object' || o === null) return false;
        s = Object.assign(fresh(), o);
        save(); refresh();
        return true;
      } catch (e) { return false; }
    },
    reset() {
      const keep = { demo: s.demo, sound: s.sound };
      s = Object.assign(fresh(), keep);
      save(); refresh();
    },
  };
})();
