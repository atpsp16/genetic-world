/* Tiny synthesized sound effects (no audio files needed).
   iOS only allows audio after a user touch, so unlock() runs on the first tap. */
GW.sound = (function () {
  let ctx = null;

  function unlock() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, start, dur, type, vol) {
    const t0 = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }

  const SFX = {
    click: () => tone(560, 0, 0.06, 'triangle', 0.07),
    pop: () => { tone(420, 0, 0.08, 'sine', 0.16); tone(700, 0.05, 0.1, 'sine', 0.1); },
    right: () => { tone(660, 0, 0.12, 'triangle', 0.14); tone(990, 0.09, 0.2, 'triangle', 0.12); },
    wrong: () => { tone(220, 0, 0.15, 'square', 0.05); tone(165, 0.11, 0.22, 'square', 0.05); },
    coin: () => { tone(988, 0, 0.07, 'square', 0.04); tone(1319, 0.06, 0.14, 'square', 0.04); },
    wobble: () => tone(330, 0, 0.09, 'sine', 0.07),
    hatch: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.18, 'triangle', 0.11)),
    win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.26, 'triangle', 0.11)),
  };

  function play(name) {
    if (!GW.state.get().sound) return;
    unlock();
    if (!ctx || !SFX[name]) return;
    try { SFX[name](); } catch (e) { /* ignore */ }
  }

  document.addEventListener('pointerdown', unlock, { once: true });
  return { unlock, play };
})();
