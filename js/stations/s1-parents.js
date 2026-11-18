/* Station 1 — identify the parents' genotypes from phenotype + pedigree clue. */
GW.STATIONS.push({
  icon: '🔎',
  short: 'คัดพ่อแม่',
  title: 'ห้องคัดพ่อแม่พันธุ์',
  mission: 'ดูสีขนและประวัติของพ่อแม่พันธุ์ แล้วลากป้ายจีโนไทป์ไปติดให้ถูกตัว',

  render(main, ctx) {
    const { level, T } = ctx;
    const { $$ } = GW.ui;
    const U = T.letter.toUpperCase();
    const L = T.letter.toLowerCase();
    const tags = GW.gen.genoOrder(T.letter);
    const colored = (g) => g.split('').map((a) => `<span class="${GW.gen.isDom(a) ? 'd' : 'r'}">${a}</span>`).join('');
    const who = [
      ['father', '♂ พ่อพันธุ์', 'm'],
      ['mother', '♀ แม่พันธุ์', 'f'],
    ];

    main.innerHTML = `
      <div class="s1">
        <div class="s1-cards">
          ${who.map(([k, label, sx]) => {
            const p = level[k];
            const ph = T[GW.gen.pheno(p.g)];
            return `<div class="pcard">
              <div class="sex ${sx}">${label}</div>
              <div class="pc-art">${GW.creature.svg(p.g, { size: 140, mood: k === 'father' ? 'open' : 'smile', cls: 'idle' })}</div>
              <div class="pc-name">${p.name}</div>
              <div class="pc-pheno">ฟีโนไทป์: <b style="color:${ph.dark}">${ph.label}</b></div>
              <div class="pc-clue">📜 <b>ประวัติ:</b> ${p.clue}</div>
              <div class="gslot" data-who="${k}"><span class="ph">จีโนไทป์ = ?</span></div>
            </div>`;
          }).join('')}
        </div>
        <div class="tray">
          <div class="tray-label">ป้ายจีโนไทป์ — ลากไปวาง หรือแตะป้ายแล้วแตะช่อง</div>
          <div class="tray-items">${tags.map((g) => `<div class="gtag" data-g="${g}">${colored(g)}</div>`).join('')}</div>
        </div>
      </div>`;

    const nameOf = (k) => (k === 'father' ? 'พ่อพันธุ์' : 'แม่พันธุ์');

    function explainRight(k, p) {
      if (GW.gen.pheno(p.g) === 'rec') {
        return `ถูกต้อง! ${nameOf(k)}${T.rec.label} ซึ่งเป็นลักษณะด้อย จะแสดงออกได้เมื่อมีแอลลีลด้อยทั้งคู่เท่านั้น จึงเป็น <b>${p.g}</b>`;
      }
      if (GW.gen.isHomo(p.g)) {
        return `ถูกต้อง! "${p.clue}" แสดงว่าเป็นพันธุ์แท้ มีแอลลีลเหมือนกันทั้งคู่ จึงเป็น <b>${p.g}</b>`;
      }
      return `ถูกต้อง! ${T.dom.label}ต้องมี ${U} อย่างน้อย 1 ตัว และ "${p.clue}" แปลว่ามันได้รับ ${L} มา 1 ตัว (ตัว${T.rec.short}เป็น ${L + L}) จึงเป็น <b>${p.g}</b>`;
    }

    function explainWrong(p, g) {
      const isRec = GW.gen.pheno(p.g) === 'rec';
      if (isRec) return `ยังไม่ใช่ — ตัวนี้${T.rec.label} ซึ่งเป็นลักษณะด้อย ถ้ามี ${U} แม้แค่ 1 ตัว ขนจะกลายเป็น${T.dom.short}ทันที`;
      if (GW.gen.pheno(g) === 'rec') return `ยังไม่ใช่ — ${g} จะมี${T.rec.label} แต่ตัวนี้${T.dom.label} จึงต้องมี ${U} อย่างน้อย 1 ตัว`;
      if (GW.gen.isHomo(p.g)) return `เกือบถูก! ${T.dom.label}เป็นได้ทั้ง ${U + U} และ ${U + L} — อ่านประวัติอีกครั้ง: "${p.clue}" พันธุ์แท้หมายถึงอะไร?`;
      return `เกือบถูก! ${T.dom.label}เป็นได้ทั้ง ${U + U} และ ${U + L} — อ่านประวัติอีกครั้ง: "${p.clue}" ตัว${T.rec.short} (${L + L}) ส่งแอลลีลอะไรให้ลูกได้บ้าง?`;
    }

    let placed = 0;
    const accepts = {};
    $$('.gslot', main).forEach((slot) => {
      const k = slot.dataset.who;
      const p = level[k];
      const accept = (g) => {
        if (g !== p.g) { ctx.wrong(explainWrong(p, g)); return false; }
        slot.classList.add('filled');
        slot.innerHTML = `<span class="gtag placed">${colored(g)}</span>
          <span class="zyg">${GW.gen.isHomo(g) ? 'พันธุ์แท้ (ฮอมอไซกัส)' : 'พันธุ์ทาง (เฮเทอโรไซกัส)'}</span>`;
        placed++;
        ctx.right(explainRight(k, p), slot, 2);
        if (placed === 2) {
          setTimeout(() => ctx.done(
            `ยอดเยี่ยม! พ่อพันธุ์ <b>${ctx.F}</b> × แม่พันธุ์ <b>${ctx.M}</b> — ต่อไปซูมเข้าไปดูว่าแอลลีลเหล่านี้อยู่ตรงไหนในเซลล์`
          ), 900);
        }
        return true;
      };
      accepts[k] = accept;
      GW.drag.zone(slot, accept);
    });
    $$('.gtag[data-g]', main).forEach((el) => GW.drag.token(el, el.dataset.g));

    ctx.setHints([
      `ดูสีขนก่อน: ถ้า${T.rec.label} (ลักษณะด้อย) ต้องเป็น ${L + L} เท่านั้น ถ้า${T.dom.label}ต้องมี ${U} อย่างน้อย 1 ตัว แล้วใช้ประวัติตัดสินว่าเป็น ${U + U} หรือ ${U + L}`,
      `เฉลย: พ่อพันธุ์ = <b>${ctx.F}</b>, แม่พันธุ์ = <b>${ctx.M}</b>`,
    ]);
    ctx.setAutofill(() => {
      $$('.gslot:not(.filled)', main).forEach((slot) => accepts[slot.dataset.who](level[slot.dataset.who].g));
    });
    ctx.say('สวัสดี! ฉันคือ <b>ดร.ยีน</b> มาช่วยกันระบุจีโนไทป์ของพ่อแม่พันธุ์ — ดูสีขนแล้วอ่านประวัติให้ดีนะ');
  },
});
