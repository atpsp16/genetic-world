/* Original artwork drawn in code (SVG): the "ปุกปุย" creature, eggs, the
   robot coach "ดร.ยีน" and the DNA logo. The creature's body colour comes
   only from its genotype — expression/eyes vary, genetics-driven parts never do. */
GW.creature = (function () {
  let uid = 0;
  const nextId = (p) => `${p}${++uid}`;

  /** Fluffy scalloped outline around an ellipse. */
  function fluff(cx, cy, rx, ry, n, amp) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + rx * Math.cos(a);
      const y = cy + ry * Math.sin(a);
      if (i === 0) { d += `M${x.toFixed(1)} ${y.toFixed(1)}`; continue; }
      const am = ((i - 0.5) / n) * Math.PI * 2 - Math.PI / 2;
      const qx = cx + (rx + amp) * Math.cos(am);
      const qy = cy + (ry + amp) * Math.sin(am);
      d += ` Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d + 'Z';
  }
  const BODY = fluff(100, 112, 66, 60, 26, 13);

  const MOUTHS = {
    smile: '<path d="M87 131 Q100 144 113 131" fill="none" stroke="#3b1d2e" stroke-width="4.5" stroke-linecap="round"/>',
    open: '<path d="M85 128 Q100 154 115 128 Z" fill="#7a1f3d" stroke="#3b1d2e" stroke-width="3.5" stroke-linejoin="round"/><path d="M92 140 Q100 147 108 140 Q100 136 92 140Z" fill="#ff8fab"/>',
    o: '<ellipse cx="100" cy="135" rx="6.5" ry="8" fill="#7a1f3d" stroke="#3b1d2e" stroke-width="3"/>',
    sad: '<path d="M88 140 Q100 129 112 140" fill="none" stroke="#3b1d2e" stroke-width="4.5" stroke-linecap="round"/>',
  };

  function eyes(mood, look, ink, rim) {
    if (mood === 'happy') {
      return `<path d="M63 104 Q78 86 93 104" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>
              <path d="M107 104 Q122 86 137 104" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`;
    }
    const dx = look * 5;
    return `<g class="eyes">
      <ellipse cx="78" cy="102" rx="17" ry="19" fill="#fff" stroke="${rim}" stroke-width="2.5"/>
      <ellipse cx="122" cy="102" rx="17" ry="19" fill="#fff" stroke="${rim}" stroke-width="2.5"/>
      <circle cx="${80 + dx}" cy="105" r="9.5" fill="${ink}"/>
      <circle cx="${124 + dx}" cy="105" r="9.5" fill="${ink}"/>
      <circle cx="${83.5 + dx}" cy="100.5" r="3.4" fill="#fff"/>
      <circle cx="${127.5 + dx}" cy="100.5" r="3.4" fill="#fff"/>
    </g>`;
  }

  /**
   * svg(genotype, {size, mood, look, cls, unknown})
   * genotype: "Pp" (fur) or {fur:"Pp", horns:"Hh"}
   */
  function svg(geno, o) {
    o = o || {};
    const g = typeof geno === 'string' ? { fur: geno } : geno;
    const size = o.size || 120;
    const T = GW.TRAITS.fur;
    const c = o.unknown
      ? { color: '#cbd5e1', dark: '#94a3b8', light: '#e2e8f0', label: 'ยังไม่ค้นพบ' }
      : T[GW.gen.pheno(g.fur)];
    const id = nextId('pg');
    const horns = g.horns && GW.gen.pheno(g.horns) === 'dom';
    const mood = o.mood || 'smile';
    const face = o.unknown
      ? '<text x="100" y="128" text-anchor="middle" font-size="64" font-weight="700" fill="#64748b" font-family="Mitr, sans-serif">?</text>'
      : `${eyes(mood, o.look || 0, '#1e1b2e', c.dark)}
         <ellipse cx="58" cy="127" rx="10" ry="6" fill="#ff7aa2" opacity=".45"/>
         <ellipse cx="142" cy="127" rx="10" ry="6" fill="#ff7aa2" opacity=".45"/>
         ${MOUTHS[mood === 'happy' ? 'open' : mood] || MOUTHS.smile}`;
    return `<svg class="puk ${o.cls || ''}" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="ปุกปุย${o.unknown ? '' : c.label}">
      <defs><radialGradient id="${id}" cx="38%" cy="32%" r="75%">
        <stop offset="0" stop-color="${c.light}"/><stop offset=".55" stop-color="${c.color}"/><stop offset="1" stop-color="${c.dark}"/>
      </radialGradient></defs>
      <ellipse cx="100" cy="187" rx="54" ry="7" fill="#0f172a" opacity=".12"/>
      ${horns ? `<path d="M66 64 Q50 30 70 20 Q66 44 82 56 Z" fill="#f3dcb8" stroke="#a37b4c" stroke-width="3" stroke-linejoin="round"/>
                 <path d="M134 64 Q150 30 130 20 Q134 44 118 56 Z" fill="#f3dcb8" stroke="#a37b4c" stroke-width="3" stroke-linejoin="round"/>` : ''}
      <path d="M84 60 Q78 36 96 30 Q92 44 103 46 Q104 28 122 30 Q110 42 117 60 Z" fill="${c.color}" stroke="${c.dark}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="74" cy="171" rx="17" ry="11" fill="${c.dark}"/>
      <ellipse cx="126" cy="171" rx="17" ry="11" fill="${c.dark}"/>
      <path d="${BODY}" fill="url(#${id})" stroke="${c.dark}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="78" cy="76" rx="22" ry="11" fill="#fff" opacity=".22" transform="rotate(-20 78 76)"/>
      ${face}
    </svg>`;
  }

  function egg(o) {
    o = o || {};
    const size = o.size || 110;
    const id = nextId('eg');
    const crack = o.cracked
      ? '<path d="M14 84 L32 74 L44 88 L60 72 L74 90 L88 74 L106 84" fill="none" stroke="#8a7550" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>'
      : '';
    return `<svg class="egg ${o.cls || ''}" viewBox="0 0 120 150" width="${Math.round(size * 0.8)}" height="${size}" aria-hidden="true">
      <defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f1e6cf"/></radialGradient></defs>
      <ellipse cx="60" cy="143" rx="38" ry="6" fill="#0f172a" opacity=".12"/>
      <path d="M60 8 C92 8 112 62 112 92 C112 124 90 142 60 142 C30 142 8 124 8 92 C8 62 28 8 60 8 Z" fill="url(#${id})" stroke="#cdb98f" stroke-width="3"/>
      <circle cx="44" cy="50" r="9" fill="#c9b0f5" opacity=".85"/>
      <circle cx="78" cy="68" r="12" fill="#fde68a" opacity=".95"/>
      <circle cx="40" cy="104" r="11" fill="#fde68a" opacity=".95"/>
      <circle cx="82" cy="114" r="8" fill="#c9b0f5" opacity=".85"/>
      <circle cx="62" cy="30" r="5" fill="#fde68a"/>
      ${crack}
    </svg>`;
  }

  /** Robot coach "ดร.ยีน". mood: info | happy | sad | think */
  function mascot(mood, size) {
    size = size || 64;
    const face = {
      info: '<rect x="40" y="50" width="11" height="17" rx="5.5" fill="#5eead4"/><rect x="69" y="50" width="11" height="17" rx="5.5" fill="#5eead4"/><path d="M50 77 Q60 84 70 77" fill="none" stroke="#5eead4" stroke-width="4" stroke-linecap="round"/>',
      happy: '<path d="M37 64 Q45 50 53 64" fill="none" stroke="#5eead4" stroke-width="5" stroke-linecap="round"/><path d="M67 64 Q75 50 83 64" fill="none" stroke="#5eead4" stroke-width="5" stroke-linecap="round"/><path d="M45 72 Q60 90 75 72" fill="#5eead4"/>',
      sad: '<rect x="40" y="56" width="11" height="9" rx="4.5" fill="#fda4af"/><rect x="69" y="56" width="11" height="9" rx="4.5" fill="#fda4af"/><path d="M50 82 Q60 74 70 82" fill="none" stroke="#fda4af" stroke-width="4" stroke-linecap="round"/>',
      think: '<rect x="40" y="52" width="11" height="15" rx="5.5" fill="#fde68a"/><path d="M68 60 L81 60" stroke="#fde68a" stroke-width="5" stroke-linecap="round"/><path d="M52 79 L68 77" stroke="#fde68a" stroke-width="4" stroke-linecap="round"/>',
    }[mood || 'info'];
    return `<svg class="mascot" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">
      <line x1="60" y1="10" x2="60" y2="26" stroke="#0e7490" stroke-width="4"/>
      <circle cx="60" cy="9" r="7" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
      <circle cx="12" cy="66" r="8" fill="#7dd3fc" stroke="#0e7490" stroke-width="3"/>
      <circle cx="108" cy="66" r="8" fill="#7dd3fc" stroke="#0e7490" stroke-width="3"/>
      <rect x="14" y="26" width="92" height="80" rx="30" fill="#e0f2fe" stroke="#0e7490" stroke-width="4"/>
      <rect x="26" y="38" width="68" height="56" rx="18" fill="#0f172a"/>
      ${face}
    </svg>`;
  }

  /** DNA double-helix logo. */
  function dna(size) {
    size = size || 48;
    let s1 = '';
    let s2 = '';
    let rungs = '';
    for (let y = 4; y <= 96; y += 2) {
      const x1 = 50 + 22 * Math.sin(y / 9);
      const x2 = 50 - 22 * Math.sin(y / 9);
      s1 += (y === 4 ? 'M' : 'L') + x1.toFixed(1) + ' ' + y;
      s2 += (y === 4 ? 'M' : 'L') + x2.toFixed(1) + ' ' + y;
      if (y % 10 === 6) {
        rungs += `<line x1="${x1.toFixed(1)}" y1="${y}" x2="${x2.toFixed(1)}" y2="${y}" stroke="${(y / 10) % 2 < 1 ? '#f7c948' : '#a46ee8'}" stroke-width="5" stroke-linecap="round"/>`;
      }
    }
    return `<svg class="dna" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
      ${rungs}
      <path d="${s1}" fill="none" stroke="#7c3aed" stroke-width="7" stroke-linecap="round"/>
      <path d="${s2}" fill="none" stroke="#0ea5a4" stroke-width="7" stroke-linecap="round"/>
    </svg>`;
  }

  /** Random cosmetic look for a newborn (does not depend on genes). */
  function randomLook() {
    return {
      mood: GW.ui.pick(['smile', 'open', 'o', 'happy', 'smile']),
      look: GW.ui.pick([-1, -0.5, 0, 0.5, 1]),
    };
  }

  return { svg, egg, mascot, dna, randomLook };
})();
