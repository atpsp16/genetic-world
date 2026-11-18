/* Station 4 — fill the Punnett square allele by allele, then answer ratio questions. */
GW.STATIONS.push({
  icon: '🧪',
  short: 'เครื่องผสม',
  title: 'เครื่องผสมพันธุกรรม',
  mission: 'ลากแอลลีลลงตารางพันเนตต์ให้ครบทุกช่อง แล้วหาอัตราส่วนของลูก',

  render(main, ctx) {
    const { $, $$ } = GW.ui;
    const { T, F, M } = ctx;
    const gen = GW.gen;
    const fa = gen.alleles(F);
    const ma = gen.alleles(M);
    const U = T.letter.toUpperCase();
    const L = T.letter.toLowerCase();
    let filledSlots = 0;
    let qIndex = 0;
    const slotAccepts = [];

    main.innerHTML = `
      <div class="s4">
        <div class="punnett">
          <div class="pn-corner"><span class="pc-m">♂ พ่อ →</span><span class="pc-f">♀ แม่ ↓</span></div>
          ${fa.map((a) => `<div class="pn-head col">${GW.ui.allele(a)}<small>จากพ่อ</small></div>`).join('')}
          ${ma.map((b, r) => `
            <div class="pn-head row">${GW.ui.allele(b)}<small>จากแม่</small></div>
            ${fa.map((a, c) => `
              <div class="pn-cell" data-r="${r}" data-c="${c}">
                <div class="pn-slots">
                  <div class="pslot" data-r="${r}" data-c="${c}" data-k="f"><span class="ph">♂</span></div>
                  <div class="pslot" data-r="${r}" data-c="${c}" data-k="m"><span class="ph">♀</span></div>
                </div>
                <div class="pn-result"></div>
              </div>`).join('')}`).join('')}
        </div>
        <div class="s4-bottom" id="s4-bottom">
          <div class="tray" id="s4-tray">
            <div class="tray-label">แอลลีล — ช่องซ้าย (♂) ใส่แอลลีลจากพ่อ ช่องขวา (♀) ใส่แอลลีลจากแม่</div>
            <div class="tray-items">${GW.ui.allele(U)}${GW.ui.allele(L)}</div>
          </div>
        </div>
      </div>`;

    function cellDone(r, c) {
      const cell = $(`.pn-cell[data-r="${r}"][data-c="${c}"]`, main);
      const g = gen.join(fa[c], ma[r]);
      const ph = gen.pheno(g);
      cell.classList.add('done', ph);
      cell.querySelector('.pn-result').innerHTML = `<span class="pn-g">${g}</span>${GW.creature.svg(g, { size: 46, mood: 'smile' })}`;
      GW.sound.play('pop');
    }

    $$('.pslot', main).forEach((slot) => {
      const r = +slot.dataset.r;
      const c = +slot.dataset.c;
      const k = slot.dataset.k;
      const expected = k === 'f' ? fa[c] : ma[r];
      const accept = (a) => {
        if (a !== expected) {
          ctx.wrong(k === 'f'
            ? `ช่องซ้าย (♂) คือแอลลีลจาก<b>พ่อ</b> — ดูที่หัวคอลัมน์ด้านบน ซึ่งเป็น <b>${expected}</b>`
            : `ช่องขวา (♀) คือแอลลีลจาก<b>แม่</b> — ดูที่หัวแถวด้านซ้าย ซึ่งเป็น <b>${expected}</b>`);
          return false;
        }
        slot.classList.add('filled');
        slot.innerHTML = GW.ui.allele(a, 'placed');
        filledSlots++;
        ctx.right(null, slot, 1);
        const pair = $$(`.pslot[data-r="${r}"][data-c="${c}"]`, main);
        if (pair.every((s) => s.classList.contains('filled'))) cellDone(r, c);
        if (filledSlots === 8) setTimeout(startQuestions, 600);
        return true;
      };
      slotAccepts.push({ slot, accept, expected });
      GW.drag.zone(slot, accept);
    });
    $$('#s4-tray .allele', main).forEach((el) => GW.drag.token(el, el.dataset.a));

    const { geno, ph } = gen.counts(F, M);
    const pct = (n) => `${(n / 4) * 100}%`;
    const QS = [
      {
        q: 'อัตราส่วน<b>จีโนไทป์</b>ของลูกคือข้อใด',
        correct: gen.genoRatioText(F, M),
        pool: gen.allGenoRatioTexts(T.letter),
        wrong: 'ยังไม่ใช่ — นับจีโนไทป์ในตารางทั้ง 4 ช่องอีกครั้ง แล้วทำให้เป็นอัตราส่วนอย่างต่ำ',
      },
      {
        q: 'อัตราส่วน<b>ฟีโนไทป์</b>ของลูกคือข้อใด',
        correct: gen.phenoRatioText(F, M, T),
        pool: gen.allPhenoRatioTexts(T),
        wrong: `ยังไม่ใช่ — ${U + U} และ ${U + L} มี${T.dom.label}เหมือนกัน ลองนับช่องที่ขน${T.dom.short}และขน${T.rec.short}`,
      },
      {
        q: `ลูกแต่ละตัวมีโอกาส<b>${T.rec.label}</b>เท่าใด`,
        correct: pct(ph.rec),
        pool: ['0%', '25%', '50%', '75%', '100%'],
        wrong: `ยังไม่ใช่ — นับช่องที่เป็น ${L + L} แล้วหารด้วยจำนวนช่องทั้งหมด (4 ช่อง)`,
      },
    ];

    function startQuestions() {
      const chips = gen.genoOrder(T.letter).filter((g) => geno[g])
        .map((g) => `<span class="gcount ${gen.pheno(g)}"><b>${g}</b> ${geno[g]} ช่อง</span>`).join('');
      $('#s4-bottom').innerHTML = `<div class="s4-summary">ผลจากตาราง: ${chips}</div><div id="s4-q"></div>`;
      ctx.say('ตารางครบแล้ว! ลองนับผลในตารางแล้วตอบคำถามทีละข้อ', 'happy');
      askQ();
      $('#s4-bottom').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function askQ() {
      const q = QS[qIndex];
      const choices = [q.correct].concat(GW.ui.shuffle(q.pool.filter((x) => x !== q.correct)).slice(0, 3));
      GW.ui.mcq($('#s4-q'), {
        q: `❓ ข้อ ${qIndex + 1}/3: ${q.q}`,
        choices,
        answer: 0,
        onRight: (btn) => {
          ctx.right(null, btn, 2);
          qIndex++;
          if (qIndex < QS.length) {
            ctx.say(`ถูกต้อง! <b>${q.correct}</b>`, 'happy');
            setTimeout(askQ, 700);
          } else {
            const mystery = ph.rec > 0 && gen.pheno(F) === 'dom' && gen.pheno(M) === 'dom'
              ? ` — ไขปริศนาได้แล้ว: ลูก${T.rec.short} (${L + L}) เกิดเมื่อได้ ${L} จากทั้งพ่อและแม่ โอกาส 1 ใน 4`
              : '';
            ctx.done(`ยอดเยี่ยม! ${F} × ${M} ได้ <b>${gen.genoRatioText(F, M)}</b> และ <b>${gen.phenoRatioText(F, M, T)}</b>${mystery} ไปฟักไข่ดูผลจริงกัน!`);
          }
        },
        onWrong: () => ctx.wrong(q.wrong),
      });
    }

    const answerGrid = ma.map((b) => fa.map((a) => gen.join(a, b)).join(' , ')).join(' | ');
    ctx.setHints([
      'แต่ละช่องในตาราง = แอลลีลจากหัวคอลัมน์ (พ่อ) 1 ตัว + แอลลีลจากหัวแถว (แม่) 1 ตัว',
      `เฉลยตาราง (แถวบน | แถวล่าง): ${answerGrid}`,
    ]);
    ctx.setAutofill(() => {
      if (filledSlots < 8) {
        slotAccepts.forEach(({ slot, accept, expected }) => { if (!slot.classList.contains('filled')) accept(expected); });
      } else {
        const b = main.querySelector('.choice[data-i="0"]:not(:disabled)');
        if (b) b.click();
      }
    });
    ctx.say(`ตารางพันเนตต์: หัวคอลัมน์คือเซลล์สืบพันธุ์ของพ่อ (${fa.join(', ')}) หัวแถวคือของแม่ (${ma.join(', ')}) — เติมแอลลีลให้ครบทุกช่อง`);
  },
});
