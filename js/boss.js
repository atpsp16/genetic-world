/* Boss chapter — reverse problems: choose a pair to meet an order's ratio,
   then a test-cross puzzle. Each order is a "station" so the shared runner
   (stepper, coach, hints, stars) works unchanged. */
(function () {
  const { $, $$ } = GW.ui;
  const gen = GW.gen;

  function miniPunnett(f, m) {
    const fa = gen.alleles(f);
    const ma = gen.alleles(m);
    return `<div class="mini-pn">
      <div class="mp-c"></div>${fa.map((a) => `<div class="mp-h">${GW.ui.allele(a, 'mini')}</div>`).join('')}
      ${ma.map((b) => `<div class="mp-h">${GW.ui.allele(b, 'mini')}</div>${fa.map((a) => {
        const g = gen.join(a, b);
        return `<div class="mp-cell ${gen.pheno(g)}">${g}</div>`;
      }).join('')}`).join('')}
    </div>`;
  }

  function renderPick(main, ctx, order) {
    const { T } = ctx;
    const pool = GW.BOSS.pool;
    const sel = { father: null, mother: null };

    const card = (sex, p) => `<button class="bcard" data-sex="${sex}" data-g="${p.g}">
        ${GW.creature.svg(p.g, { size: 70, mood: 'smile' })}
        <b>${p.g}</b><small>${p.name}</small>
      </button>`;

    main.innerHTML = `
      <div class="bp">
        <div class="order-banner">📋 ใบสั่ง: ${order.text}</div>
        <div class="bp-pools">
          <div class="pool"><div class="pool-title">♂ พ่อพันธุ์ <small>แตะเพื่อเลือก</small></div><div class="pool-items">${pool.father.map((p) => card('father', p)).join('')}</div></div>
          <div class="pool"><div class="pool-title">♀ แม่พันธุ์ <small>แตะเพื่อเลือก</small></div><div class="pool-items">${pool.mother.map((p) => card('mother', p)).join('')}</div></div>
        </div>
        <div class="bp-mate">
          <div class="mate-slot" id="slot-father"><span class="ph">♂ ?</span></div>
          <div class="mate-x">×</div>
          <div class="mate-slot" id="slot-mother"><span class="ph">♀ ?</span></div>
          <button class="btn btn-sun btn-lg" id="bp-go" disabled>⚗️ ผสม!</button>
        </div>
        <div class="bp-result" id="bp-result"></div>
      </div>`;

    function choose(sex, g) {
      sel[sex] = g;
      $$(`.bcard[data-sex="${sex}"]`, main).forEach((b) => b.classList.toggle('on', b.dataset.g === g));
      $(`#slot-${sex}`).innerHTML = `${GW.creature.svg(g, { size: 54 })}<b>${g}</b>`;
      $(`#slot-${sex}`).classList.add('filled');
      $('#bp-go').disabled = !(sel.father && sel.mother);
    }

    $$('.bcard', main).forEach((b) => b.addEventListener('click', () => {
      GW.sound.play('click');
      choose(b.dataset.sex, b.dataset.g);
    }));

    $('#bp-go').addEventListener('click', () => {
      const f = sel.father;
      const m = sel.mother;
      const { ph } = gen.counts(f, m);
      const ok = ph.dom === order.target.dom && ph.rec === order.target.rec;
      const txt = gen.phenoRatioText(f, m, T);
      $('#bp-result').innerHTML = `<div class="bp-res ${ok ? 'ok' : 'no'}">
          ${miniPunnett(f, m)}
          <div class="bp-res-text"><b>${f} × ${m}</b><span>ได้ลูก ${gen.genoRatioText(f, m)}</span><span>${txt}</span>
          <strong>${ok ? '✓ ตรงตามใบสั่ง' : '✗ ยังไม่ตรงตามใบสั่ง'}</strong></div>
        </div>`;
      if (ok) {
        $$('.bcard', main).forEach((b) => (b.disabled = true));
        $('#bp-go').disabled = true;
        ctx.done(`สำเร็จ! ${f} × ${m} ได้ <b>${txt}</b> ตรงตามที่ลูกค้าสั่ง`);
      } else {
        ctx.wrong(`คู่ ${f} × ${m} ได้ <b>${txt}</b> — ยังไม่ตรงกับใบสั่ง ดูตารางพันเนตต์แล้วลองเลือกคู่ใหม่`);
      }
    });

    ctx.setHints(order.hints);
    ctx.setAutofill(() => {
      choose('father', order.auto[0]);
      choose('mother', order.auto[1]);
      $('#bp-go').click();
    });
    ctx.say(`ใบสั่งผลิตพิเศษ! ${order.text} — เลือกพ่อพันธุ์ 1 ตัวและแม่พันธุ์ 1 ตัว แล้วกด <b>ผสม!</b>`);
  }

  function renderTest(main, ctx) {
    const { T } = ctx;
    const tc = GW.BOSS.testCross;
    const d = tc.offspring.filter((g) => gen.pheno(g) === 'dom').length;
    main.innerHTML = `
      <div class="bt">
        <div class="bt-cross">
          <div class="bt-parent mystery">
            ${GW.creature.svg('Pp', { size: 110, mood: 'o' })}
            <b>${T.letter} ?</b><small>${T.dom.label} ไม่มีประวัติ</small>
          </div>
          <div class="mate-x">×</div>
          <div class="bt-parent">
            ${GW.creature.svg('pp', { size: 110, mood: 'smile' })}
            <b>${T.letter.toLowerCase().repeat(2)}</b><small>${T.rec.label}</small>
          </div>
        </div>
        <div class="bt-kids">
          <div class="bt-kids-title">ลูกที่ได้ 8 ตัว: ${T.dom.short} ${d} ตัว · ${T.rec.short} ${tc.offspring.length - d} ตัว</div>
          <div class="bt-kids-row">${tc.offspring.map((g, i) => `<div class="born-mini" style="animation-delay:${i * 80}ms">${GW.creature.svg(g, Object.assign({ size: 58 }, GW.creature.randomLook()))}</div>`).join('')}</div>
        </div>
        <div id="bt-q"></div>
      </div>`;

    const wrongWhy = {
      PP: `ถ้าเป็น PP ลูกทุกตัวจะได้ P และ${T.dom.label}ทั้งหมด — แต่ที่นี่มีลูก${T.rec.short}`,
      pp: `ตัวนี้${T.dom.label} จึงเป็น pp ไม่ได้`,
      'บอกไม่ได้': 'บอกได้! ดูลูกที่ขนเหลือง (pp): ได้ p จากแม่ 1 ตัว แล้วอีก 1 ตัวมาจากไหน?',
    };
    GW.ui.mcq($('#bt-q'), {
      q: '❓ ' + tc.text,
      choices: tc.choices,
      answer: tc.answer,
      onRight: () => ctx.done(`ถูกต้อง! ${tc.why} — วิธีนี้เรียกว่า<b>การผสมเพื่อทดสอบ</b>`),
      onWrong: (i) => ctx.wrong(wrongWhy[tc.choices[i]] || 'ยังไม่ใช่ ลองดูลูกที่ขนเหลืองอีกครั้ง'),
    });
    ctx.setHints([
      'ลูกขนเหลืองเป็น pp ต้องได้ p จากพ่อ 1 ตัวและจากแม่ 1 ตัว',
      'เฉลย: Pp เพราะพ่อส่ง p ให้ลูกได้',
    ]);
    ctx.setAutofill(() => {
      const b = main.querySelector(`.choice[data-i="${tc.answer}"]:not(:disabled)`);
      if (b) b.click();
    });
    ctx.say('ปริศนาสุดท้าย! ปุกปุยขนม่วงตัวนี้อาจเป็น PP หรือ Pp ก็ได้ — ลองดูลูกของมันแล้วอนุมาน');
  }

  GW.BOSS.orders.forEach((order, i) => {
    GW.BOSS_STATIONS.push({
      icon: '📋',
      short: `ใบสั่งที่ ${i + 1}`,
      title: `ใบสั่งผลิตพิเศษ ${i + 1}`,
      mission: `เลือกพ่อพันธุ์และแม่พันธุ์ 1 คู่ ให้ได้ลูกตามใบสั่ง: ${order.text}`,
      render: (main, ctx) => renderPick(main, ctx, order),
    });
  });
  GW.BOSS_STATIONS.push({
    icon: '🕵️',
    short: 'ไขปริศนา',
    title: 'ปุกปุยไม่มีประวัติ',
    mission: 'ดูลูกที่เกิดจากการผสม แล้วอนุมานจีโนไทป์ของปุกปุยขนม่วงตัวนี้',
    render: renderTest,
  });
})();
