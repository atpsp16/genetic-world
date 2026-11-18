/* Station 2 — zoom from body → cell → nucleus/chromosomes → DNA/gene, then place
   the alleles on a homologous chromosome pair (a model of gene–DNA–chromosome). */
(function () {
  const QUESTIONS = [
    {
      q: 'ยีนอยู่ที่ใด',
      choices: ['เป็นส่วนหนึ่งของ DNA ซึ่งขดตัวอยู่ในโครโมโซม', 'อยู่นอกเซลล์', 'อยู่ในเลือดเท่านั้น', 'เป็นชื่อเรียกของโครโมโซมทั้งแท่ง'],
      answer: 0,
      why: 'ยีนคือช่วงหนึ่งของ DNA และ DNA ขดตัวอยู่ในโครโมโซมภายในนิวเคลียส',
    },
    {
      q: 'โครโมโซมคู่เหมือนแต่ละคู่ในเซลล์ร่างกาย ได้มาจากที่ใด',
      choices: ['จากพ่อ 1 แท่ง และจากแม่ 1 แท่ง', 'จากพ่อทั้ง 2 แท่ง', 'จากแม่ทั้ง 2 แท่ง', 'เซลล์สร้างขึ้นใหม่เองทั้งหมด'],
      answer: 0,
      why: 'โครโมโซมคู่เหมือนแท่งหนึ่งมาจากพ่อ อีกแท่งมาจากแม่ จึงมีแอลลีลของยีนหนึ่ง ๆ 2 ตัวเสมอ',
    },
    {
      q: 'แอลลีล (เช่น P และ p) คืออะไร',
      choices: ['รูปแบบต่าง ๆ ของยีนเดียวกัน ที่อยู่ตำแหน่งเดียวกันบนโครโมโซมคู่เหมือน', 'โครโมโซม 1 คู่', 'เซลล์สืบพันธุ์', 'ลักษณะที่มองเห็นได้จากภายนอก'],
      answer: 0,
      why: 'แอลลีลคือรูปแบบของยีนเดียวกัน เช่น P (ขนม่วง) และ p (ขนเหลือง) อยู่ตำแหน่งเดียวกันบนโครโมโซมคู่เหมือน',
    },
  ];

  const CRUMBS = ['ร่างกาย', 'เซลล์', 'โครโมโซม', 'DNA และยีน', 'แอลลีล'];

  function sceneBody(g) {
    return `<div class="scene scene-body">
      ${GW.creature.svg(g, { size: 230, mood: 'o' })}
      <div class="magnifier"><div class="mag-cells"></div></div>
    </div>`;
  }

  function sceneCell() {
    const org = [[110, 112, -25], [292, 98, 20], [118, 214, 30], [300, 212, -15], [205, 58, 5]]
      .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="10" fill="#fda4af" stroke="#e11d74" stroke-width="2" transform="rotate(${r} ${x} ${y})"/>`)
      .join('');
    return `<div class="scene"><svg viewBox="0 0 400 300" class="scene-svg">
      <defs>
        <radialGradient id="cellG" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff1f5"/><stop offset="1" stop-color="#fbcfe8"/></radialGradient>
        <radialGradient id="nucG" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f5f3ff"/><stop offset="1" stop-color="#c4b5fd"/></radialGradient>
      </defs>
      <path d="M200 22 C292 20 364 80 366 150 C369 226 292 280 200 278 C108 280 34 228 36 150 C38 74 110 24 200 22Z" fill="url(#cellG)" stroke="#f472b6" stroke-width="6"/>
      ${org}
      <circle cx="205" cy="158" r="64" fill="url(#nucG)" stroke="#7c3aed" stroke-width="5"/>
      <path d="M170 140 q10 -14 20 0 t20 0 M180 170 q8 12 16 0 t16 0 M215 130 q6 10 12 0 M222 182 q10 -10 18 2" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <line x1="258" y1="120" x2="306" y2="84" stroke="#334155" stroke-width="2"/>
      <rect x="282" y="58" width="104" height="32" rx="10" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
      <text x="334" y="80" text-anchor="middle" font-size="17" fill="#5b21b6" font-family="Mitr, sans-serif">นิวเคลียส</text>
      <rect x="14" y="14" width="74" height="30" rx="10" fill="#fff" stroke="#f472b6" stroke-width="2"/>
      <text x="51" y="35" text-anchor="middle" font-size="17" fill="#be185d" font-family="Mitr, sans-serif">เซลล์</text>
    </svg></div>`;
  }

  function rod(x, y, w, h, color, stroke, bands) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${color}" stroke="${stroke}" stroke-width="3"/>`;
    (bands || []).forEach(([by, bh, bc]) => { s += `<rect x="${x + 2}" y="${y + by}" width="${w - 4}" height="${bh}" fill="${bc}"/>`; });
    return s;
  }

  function sceneNucleus() {
    const small = [
      [96, 80, '#93c5fd', '#1d4ed8'], [276, 74, '#86efac', '#15803d'],
      [88, 168, '#fdba74', '#c2410c'], [286, 172, '#f9a8d4', '#be185d'],
    ].map(([x, y, c, s]) => rod(x, y, 13, 52, c, s) + rod(x + 18, y + 4, 13, 52, c, s)).join('');
    return `<div class="scene"><svg viewBox="0 0 400 300" class="scene-svg">
      <defs><radialGradient id="nucG2" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#faf5ff"/><stop offset="1" stop-color="#ddd6fe"/></radialGradient></defs>
      <circle cx="200" cy="150" r="136" fill="url(#nucG2)" stroke="#7c3aed" stroke-width="6"/>
      ${small}
      ${rod(160, 100, 22, 104, '#a78bfa', '#5b21b6', [[18, 8, '#5b21b6'], [42, 14, '#fde047'], [72, 8, '#5b21b6']])}
      ${rod(218, 100, 22, 104, '#c4b5fd', '#5b21b6', [[18, 8, '#5b21b6'], [42, 14, '#fde047'], [72, 8, '#5b21b6']])}
      <circle cx="200" cy="152" r="70" fill="none" stroke="#f59e0b" stroke-width="4" stroke-dasharray="9 9" class="spin-slow"/>
      <rect x="138" y="62" width="46" height="22" rx="7" fill="#fff"/>
      <text x="161" y="78" text-anchor="middle" font-size="13" fill="#1d4ed8" font-family="Mitr, sans-serif">จากพ่อ</text>
      <rect x="216" y="62" width="46" height="22" rx="7" fill="#fff"/>
      <text x="239" y="78" text-anchor="middle" font-size="13" fill="#be185d" font-family="Mitr, sans-serif">จากแม่</text>
      <rect x="118" y="238" width="164" height="32" rx="10" fill="#fff" stroke="#f59e0b" stroke-width="2"/>
      <text x="200" y="260" text-anchor="middle" font-size="16" fill="#b45309" font-family="Mitr, sans-serif">โครโมโซมคู่เหมือน</text>
    </svg></div>`;
  }

  function sceneDNA() {
    let s1 = '';
    let s2 = '';
    let rungs = '';
    const base = ['#f87171', '#60a5fa', '#34d399', '#fbbf24'];
    for (let x = 140, i = 0; x <= 384; x += 3, i++) {
      const y1 = 150 + 54 * Math.sin((x - 140) / 24);
      const y2 = 150 - 54 * Math.sin((x - 140) / 24);
      s1 += (i ? 'L' : 'M') + x + ' ' + y1.toFixed(1);
      s2 += (i ? 'L' : 'M') + x + ' ' + y2.toFixed(1);
      if (i % 4 === 0) rungs += `<line x1="${x}" y1="${y1.toFixed(1)}" x2="${x}" y2="${y2.toFixed(1)}" stroke="${base[(i / 4) % 4]}" stroke-width="4"/>`;
    }
    return `<div class="scene"><svg viewBox="0 0 400 300" class="scene-svg">
      ${rod(36, 36, 44, 228, '#a78bfa', '#5b21b6', [[30, 10, '#5b21b6'], [96, 26, '#fde047'], [170, 10, '#5b21b6']])}
      <path d="M80 132 L140 62 M80 158 L140 238" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"/>
      <rect x="226" y="72" width="88" height="156" rx="16" fill="#fde68a" opacity=".55" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 6"/>
      ${rungs}
      <path d="${s1}" fill="none" stroke="#7c3aed" stroke-width="6" stroke-linecap="round"/>
      <path d="${s2}" fill="none" stroke="#0ea5a4" stroke-width="6" stroke-linecap="round"/>
      <rect x="216" y="30" width="108" height="32" rx="10" fill="#fff" stroke="#f59e0b" stroke-width="2"/>
      <text x="270" y="52" text-anchor="middle" font-size="17" fill="#b45309" font-family="Mitr, sans-serif">ยีนสีขน</text>
      <rect x="140" y="246" width="64" height="30" rx="10" fill="#fff" stroke="#7c3aed" stroke-width="2"/>
      <text x="172" y="267" text-anchor="middle" font-size="17" fill="#5b21b6" font-family="Mitr, sans-serif">DNA</text>
      <text x="58" y="290" text-anchor="middle" font-size="14" fill="#5b21b6" font-family="Mitr, sans-serif">โครโมโซม</text>
    </svg></div>`;
  }

  const STEPS = [
    { term: 'ร่างกาย', text: 'ร่างกายของปุกปุยประกอบด้วย<b>เซลล์</b>จำนวนมหาศาล ลองซูมเข้าไปดูในเซลล์กัน', scene: (ctx) => sceneBody(ctx.F) },
    { term: 'เซลล์', text: 'ภายในเซลล์มี<b>นิวเคลียส</b> ซึ่งเป็นที่เก็บสารพันธุกรรม', scene: sceneCell },
    { term: 'นิวเคลียส', text: 'ในนิวเคลียสมี<b>โครโมโซม</b>อยู่เป็นคู่ เรียกว่า<b>โครโมโซมคู่เหมือน</b> แท่งหนึ่งได้จากพ่อ อีกแท่งได้จากแม่', scene: sceneNucleus },
    { term: 'DNA และยีน', text: 'โครโมโซมประกอบด้วย <b>DNA</b> ที่ขดตัวแน่น ช่วงหนึ่งของ DNA ที่ควบคุมลักษณะ เรียกว่า<b>ยีน</b> เช่น ยีนสีขน', scene: sceneDNA },
  ];

  GW.STATIONS.push({
    icon: '🔬',
    short: 'ซูมเซลล์',
    title: 'กล้องซูมเซลล์',
    mission: 'ซูมเข้าไปในตัวปุกปุยจนเจอยีน แล้ววางแอลลีลของพ่อแม่ลงบนโครโมโซมคู่เหมือน',

    render(main, ctx) {
      const { $, $$ } = GW.ui;
      const { level, T, F, M } = ctx;
      const quiz = QUESTIONS[(level.id - 1) % QUESTIONS.length];
      let step = 0;
      let inTask = false;
      let placed = 0;
      const accepts = [];

      main.innerHTML = `
        <div class="s2">
          <div class="crumbs" id="s2-crumbs"></div>
          <div class="s2-stage" id="s2-stage">
            <div class="viewer"><div class="scene-wrap" id="s2-scene"></div></div>
            <div class="s2-caption" id="s2-cap"></div>
            <div class="s2-actions"><button class="btn btn-teal btn-lg" id="s2-zoom">🔍 ซูมเข้าไป</button></div>
          </div>
        </div>`;

      function crumbs(active) {
        $('#s2-crumbs').innerHTML = CRUMBS.map((c, i) => `<span class="crumb ${i < active ? 'past' : ''} ${i === active ? 'on' : ''}">${c}</span>`).join('<span class="crumb-sep">›</span>');
      }

      function showStep(animate) {
        const s = STEPS[step];
        const wrap = $('#s2-scene');
        const put = () => {
          if (inTask) return; // demo auto-fill jumped ahead during the animation
          wrap.innerHTML = s.scene(ctx);
          if (animate) wrap.firstElementChild.classList.add('zoom-arrive');
          $('#s2-cap').innerHTML = `<span class="term">${s.term}</span><span>${s.text}</span>`;
          crumbs(step);
        };
        if (animate && wrap.firstElementChild) {
          wrap.firstElementChild.classList.add('zoom-away');
          setTimeout(put, 380);
        } else put();
        $('#s2-zoom').textContent = step < STEPS.length - 1 ? '🔍 ซูมเข้าไป' : '🧬 วางแอลลีลบนโครโมโซม';
      }

      function pairBox(k, label, g) {
        return `<div class="pairbox">
          <div class="pb-title">${label} <b>${g}</b></div>
          <div class="nucleus">
            <div class="chromo"><div class="locus" data-who="${k}"></div></div>
            <div class="chromo alt"><div class="locus" data-who="${k}"></div></div>
          </div>
          <div class="pb-note">โครโมโซมคู่เหมือน 1 คู่<br><small>แต่ละแท่งมีแอลลีล 1 ตัว</small></div>
        </div>`;
      }

      function startTask() {
        inTask = true;
        crumbs(4);
        $('#s2-stage').innerHTML = `
          <div class="s2-task zoom-arrive">
            <div class="pairs">
              ${pairBox('father', '♂ พ่อพันธุ์', F)}
              ${pairBox('mother', '♀ แม่พันธุ์', M)}
            </div>
            <div class="tray" id="s2-tray">
              <div class="tray-label">แอลลีล — ลากไปวางที่ตำแหน่งยีน (แถบสีเหลือง) บนโครโมโซม</div>
              <div class="tray-items">${GW.ui.allele(T.letter)}${GW.ui.allele(T.letter.toLowerCase())}</div>
            </div>
            <div class="s2-q" id="s2-q"></div>
          </div>`;
        const need = { father: GW.gen.alleles(F), mother: GW.gen.alleles(M) };
        $$('.locus', main).forEach((z) => {
          const k = z.dataset.who;
          const g = k === 'father' ? F : M;
          const nm = k === 'father' ? 'พ่อพันธุ์' : 'แม่พันธุ์';
          const accept = (a) => {
            const i = need[k].indexOf(a);
            if (i < 0) {
              if (!g.includes(a)) ctx.wrong(`${nm}มีจีโนไทป์ <b>${g}</b> จึงไม่มีแอลลีล <b>${a}</b> เลย`);
              else {
                const other = g.replace(a, '');
                ctx.wrong(`${g} มี <b>${a}</b> แค่ 1 ตัว — แต่ละแท่งของโครโมโซมคู่เหมือนมีแอลลีล 1 ตัว อีกแท่งต้องเป็น <b>${other}</b>`);
              }
              return false;
            }
            need[k].splice(i, 1);
            z.classList.add('filled');
            z.innerHTML = GW.ui.allele(a, 'placed');
            placed++;
            ctx.right(null, z, 1);
            if (placed === 4) askQuestion();
            return true;
          };
          accepts.push({ z, k, accept, need });
          GW.drag.zone(z, accept);
        });
        $$('#s2-tray .allele', main).forEach((el) => GW.drag.token(el, el.dataset.a));
        ctx.say(`ยีนเดียวกันมีได้หลายรูปแบบ เรียกว่า<b>แอลลีล</b> (${T.letter} หรือ ${T.letter.toLowerCase()}) — วางแอลลีลของพ่อแม่ลงบนโครโมโซมคู่เหมือนให้ตรงกับจีโนไทป์`);
      }

      function askQuestion() {
        $('#s2-tray').hidden = true;
        ctx.say(`เยี่ยม! จีโนไทป์ก็คือแอลลีล 2 ตัวที่อยู่ตำแหน่งเดียวกันบนโครโมโซมคู่เหมือน — ตอบคำถามด้านล่างเพื่อผ่านสถานี`, 'happy');
        GW.ui.mcq($('#s2-q'), {
          q: '❓ ' + quiz.q,
          choices: quiz.choices,
          answer: quiz.answer,
          onRight: () => ctx.done(`ถูกต้อง! ${quiz.why}`),
          onWrong: () => ctx.wrong('ยังไม่ใช่ — ลองนึกถึงภาพที่ซูมผ่านมา: ร่างกาย › เซลล์ › นิวเคลียส › โครโมโซม › DNA › ยีน'),
        });
        $('#s2-q').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      $('#s2-zoom').addEventListener('click', () => {
        GW.sound.play('pop');
        if (step < STEPS.length - 1) { step++; showStep(true); } else startTask();
      });

      showStep(false);
      ctx.setHints([
        'ดูจีโนไทป์ที่หัวกล่อง เช่น Pp แปลว่าแท่งหนึ่งมี P อีกแท่งมี p',
        `เฉลย: พ่อ ${F} → วาง ${F[0]} กับ ${F[1]} | แม่ ${M} → วาง ${M[0]} กับ ${M[1]}`,
      ]);
      ctx.setAutofill(() => {
        if (!inTask) startTask();
        if (placed < 4) {
          accepts.forEach(({ z, accept, need }) => {
            if (!z.classList.contains('filled')) accept(need[z.dataset.who][0]);
          });
        } else {
          const b = main.querySelector(`.choice[data-i="${quiz.answer}"]:not(:disabled)`);
          if (b) b.click();
        }
      });
      ctx.say('มาซูมเข้าไปในตัวปุกปุยกัน! กดปุ่ม <b>🔍 ซูมเข้าไป</b> ทีละขั้น แล้วอ่านคำอธิบายใต้ภาพ');
    },
  });
})();
