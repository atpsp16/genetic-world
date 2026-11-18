/* Station 3 — meiosis (simplified): one cell → 4 gametes, each with ONE allele. */
GW.STATIONS.push({
  icon: '⚙️',
  short: 'ผลิตเซลล์สืบพันธุ์',
  title: 'เครื่องผลิตเซลล์สืบพันธุ์',
  mission: 'แยกแอลลีลจากเซลล์ของพ่อและแม่ใส่เซลล์สืบพันธุ์ทั้ง 4 เซลล์ (ไมโอซิส)',

  render(main, ctx) {
    const { $, $$ } = GW.ui;
    const { T, F, M } = ctx;
    const parents = [
      { k: 'father', label: '♂ พ่อพันธุ์', short: 'พ่อ', g: F },
      { k: 'mother', label: '♀ แม่พันธุ์', short: 'แม่', g: M },
    ];
    let pi = 0;
    let need = [];
    let filled = 0;
    let accepts = [];

    const chromo = (a, extra) => `<div class="mchromo ${GW.gen.isDom(a) ? 'dom' : 'rec'} ${extra || ''}"><span>${a}</span></div>`;

    function summaryText(p) {
      const m = GW.gen.meiosis(p.g);
      const types = GW.gen.uniq(p.g);
      if (types.length === 1) {
        return `เซลล์สืบพันธุ์ของ${p.short}มีแต่ <b>${types[0]}</b> ทั้ง 4 เซลล์ → มีแบบเดียว คือ ${types[0]}`;
      }
      const c = (a) => m.filter((x) => x === a).length;
      return `เซลล์สืบพันธุ์ของ${p.short}: <b>${types[0]}</b> ${c(types[0])} เซลล์ และ <b>${types[1]}</b> ${c(types[1])} เซลล์ → ${types[0]} : ${types[1]} = 1 : 1`;
    }

    function renderParent() {
      const p = parents[pi];
      need = GW.gen.meiosis(p.g);
      filled = 0;
      accepts = [];
      main.innerHTML = `
        <div class="s3">
          <div class="s3-top">
            <div class="s3-who">${p.label} <b>${p.g}</b></div>
            <div class="s3-progress">${parents.map((_, i) => `<i class="${i < pi ? 'done' : i === pi ? 'on' : ''}"></i>`).join('')}</div>
          </div>
          <div class="s3-flow">
            <div class="s3-src">
              <div class="cell big">${GW.gen.alleles(p.g).map((a) => chromo(a)).join('')}</div>
              <div class="cell-cap">เซลล์ตั้งต้น<br><small>โครโมโซม 1 คู่</small></div>
            </div>
            <div class="s3-arrow">
              <div class="arrow-label">ไมโอซิส</div>
              <div class="arrow-body"></div>
              <small>1 เซลล์ → 4 เซลล์</small>
            </div>
            <div class="s3-out">
              <div class="s3-gametes">${[0, 1, 2, 3].map((i) => `<div class="cell small gcell" data-i="${i}"><span class="ph">?</span></div>`).join('')}</div>
              <div class="cell-cap">เซลล์สืบพันธุ์ 4 เซลล์<br><small>โครโมโซมเหลือครึ่งเดียว</small></div>
            </div>
          </div>
          <div class="tray" id="s3-tray">
            <div class="tray-label">แอลลีล — ลากใส่เซลล์สืบพันธุ์ เซลล์ละ 1 ตัว</div>
            <div class="tray-items">${GW.ui.allele(T.letter)}${GW.ui.allele(T.letter.toLowerCase())}</div>
          </div>
          <div class="s3-summary" id="s3-sum" hidden></div>
        </div>`;

      $$('.gcell', main).forEach((cell) => {
        const accept = (a) => {
          const i = need.indexOf(a);
          if (i < 0) {
            if (!p.g.includes(a)) {
              ctx.wrong(`เซลล์ของ${p.short}พันธุ์ (${p.g}) ไม่มีแอลลีล <b>${a}</b> — เซลล์สืบพันธุ์ได้แอลลีลจากเซลล์ตั้งต้นเท่านั้น`);
            } else {
              const n = GW.gen.meiosis(p.g).filter((x) => x === a).length;
              ctx.wrong(`ก่อนแบ่งเซลล์ โครโมโซมจะจำลองตัวเองเป็น 2 ชุด จึงมี <b>${a}</b> ได้แค่ ${n} เซลล์ — เซลล์ที่เหลือต้องได้ <b>${need[0]}</b>`);
            }
            return false;
          }
          need.splice(i, 1);
          cell.classList.add('filled');
          cell.innerHTML = chromo(a, 'placed');
          filled++;
          ctx.right(null, cell, 1);
          if (filled === 4) parentDone();
          return true;
        };
        accepts.push({ cell, accept });
        GW.drag.zone(cell, accept);
      });
      $$('#s3-tray .allele', main).forEach((el) => GW.drag.token(el, el.dataset.a));
      ctx.say(pi === 0
        ? `เซลล์ของพ่อพันธุ์ (${p.g}) มีแอลลีล ${p.g[0]} และ ${p.g[1]} อยู่บนโครโมโซมคู่เหมือน — เมื่อแบ่งแบบไมโอซิส แอลลีลจะแยกออกจากกัน ลองใส่ให้ครบ 4 เซลล์`
        : `ต่อไปเป็นเซลล์ของแม่พันธุ์ (${p.g}) — ใส่แอลลีลให้ครบ 4 เซลล์`);
    }

    function parentDone() {
      const p = parents[pi];
      $('#s3-tray').hidden = true;
      const sum = $('#s3-sum');
      sum.hidden = false;
      sum.innerHTML = `<p>${summaryText(p)}</p>
        ${pi === 0 ? '<button class="btn btn-teal" id="s3-next">ต่อไป: เซลล์ของแม่พันธุ์ ➜</button>' : ''}`;
      if (pi === 0) {
        ctx.say(`ถูกต้อง! ${summaryText(p)}`, 'happy');
        $('#s3-next').addEventListener('click', () => { GW.sound.play('click'); pi = 1; renderParent(); });
      } else {
        setTimeout(allDone, 700);
      }
    }

    function allDone() {
      const types = (g) => GW.gen.alleles(g).map((a) => GW.ui.allele(a, 'mini')).join(' ');
      main.innerHTML = `
        <div class="s3 s3-final">
          <div class="s3-result">
            <div class="s3-res-row"><span class="lbl">♂ เซลล์สืบพันธุ์ของพ่อ</span>${types(F)}</div>
            <div class="s3-res-row"><span class="lbl">♀ เซลล์สืบพันธุ์ของแม่</span>${types(M)}</div>
            <p class="muted">เซลล์สืบพันธุ์เหล่านี้จะถูกนำไปใช้ที่ <b>เครื่องผสม</b> ในสถานีถัดไป</p>
          </div>
          <div class="compare">
            <div class="cmp">
              <h4>ไมโทซิส</h4>
              <div class="cmp-vis"><i class="c"></i><b>→</b><i class="c"></i><i class="c"></i></div>
              <ul><li>ได้ <b>2</b> เซลล์</li><li>โครโมโซม<b>เท่าเดิม</b></li><li>ใช้เจริญเติบโต ซ่อมแซมร่างกาย</li></ul>
            </div>
            <div class="cmp hl">
              <h4>ไมโอซิส <span class="badge">สถานีนี้</span></h4>
              <div class="cmp-vis"><i class="c"></i><b>→</b><i class="c s"></i><i class="c s"></i><i class="c s"></i><i class="c s"></i></div>
              <ul><li>ได้ <b>4</b> เซลล์</li><li>โครโมโซม<b>ลดลงครึ่งหนึ่ง</b></li><li>ใช้สร้างเซลล์สืบพันธุ์</li></ul>
            </div>
          </div>
        </div>`;
      ctx.done('ไมโอซิสทำให้แอลลีลที่อยู่คู่กันแยกออกจากกัน เซลล์สืบพันธุ์ 1 เซลล์จึงมีแอลลีลเพียง 1 ตัว — ต่างจากไมโทซิสที่ได้ 2 เซลล์และโครโมโซมเท่าเดิม');
    }

    function autoParent() {
      accepts.forEach(({ cell, accept }) => { if (!cell.classList.contains('filled')) accept(need[0]); });
    }

    renderParent();
    ctx.setHints([
      'ก่อนแบ่ง โครโมโซมจะจำลองตัวเอง แอลลีลแต่ละตัวจึงมี 2 ชุด แล้วแยกไปอยู่คนละเซลล์ เซลล์สืบพันธุ์ 1 เซลล์ได้แอลลีลเพียง 1 ตัว',
      `เฉลย: พ่อ (${F}) → ${GW.gen.meiosis(F).join(', ')} | แม่ (${M}) → ${GW.gen.meiosis(M).join(', ')}`,
    ]);
    ctx.setAutofill(() => {
      if (ctx.isDone()) return;
      if (pi === 0) {
        if (filled < 4) autoParent();
        pi = 1;
        renderParent();
      }
      autoParent();
    });
  },
});
