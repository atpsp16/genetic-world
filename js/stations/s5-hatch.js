/* Station 5 — hatch eggs with REAL random inheritance and compare actual results
   with the expected Punnett ratio (probability vs. outcome, law of large numbers). */
GW.STATIONS.push({
  icon: '🥚',
  short: 'ตู้ฟักไข่',
  title: 'ตู้ฟักสิ่งมีชีวิต',
  mission: 'ฟักไข่ดูลูกที่เกิดขึ้นจริง แล้วเทียบผลกับอัตราส่วนที่คาดหมาย',

  render(main, ctx) {
    const { $, $$ } = GW.ui;
    const { T, F, M } = ctx;
    const gen = GW.gen;
    const exp = gen.expected(F, M);
    const stats = { total: 0, dom: 0, rec: 0, geno: {} };
    let busy = false;

    main.innerHTML = `
      <div class="s5">
        <div class="incubator">
          <div class="inc-top">ตู้ฟักไข่ <b>${F} × ${M}</b></div>
          <div class="inc-glass"><div class="inc-glow"></div><div class="inc-egg" id="s5-egg">${GW.creature.egg({ size: 130 })}</div></div>
          <div class="inc-base">
            <button class="btn btn-sun btn-lg" data-n="1">🥚 ฟัก 1 ฟอง</button>
            <div class="row">
              <button class="btn btn-ghost" data-n="10">ฟัก 10 ฟอง</button>
              <button class="btn btn-ghost" data-n="100">ฟัก 100 ฟอง</button>
            </div>
          </div>
        </div>
        <div class="s5-right">
          <div class="born" id="s5-born"><div class="empty">${GW.creature.egg({ size: 56 })}<span>กดปุ่มฟักไข่เพื่อดูลูกที่เกิดขึ้น</span></div></div>
          <div class="chart" id="s5-chart"></div>
        </div>
      </div>`;

    const pctTxt = (x) => `${Math.round(x * 100)}%`;

    function drawChart() {
      const row = (key) => {
        const P = T[key];
        const act = stats.total ? stats[key] / stats.total : 0;
        return `<div class="bar-row">
          <div class="bar-label"><i class="sw" style="background:${P.color}"></i>${P.label}</div>
          <div class="bars">
            <div class="bar exp"><span style="width:${exp[key] * 100}%"></span><em>คาดหมาย ${pctTxt(exp[key])}</em></div>
            <div class="bar act"><span style="width:${act * 100}%;background:${P.color}"></span><em>ผลจริง ${stats.total ? pctTxt(act) : '-'} <small>(${stats[key]} ตัว)</small></em></div>
          </div>
        </div>`;
      };
      const genoLine = gen.genoOrder(T.letter)
        .map((g) => `<span class="${exp.geno[g] ? '' : 'muted'}">${g} <b>${stats.geno[g] || 0}</b></span>`).join(' · ');
      $('#s5-chart').innerHTML = `
        <div class="chart-head"><b>ฟักแล้วทั้งหมด ${stats.total} ตัว</b><span>เทียบกับค่าที่คาดหมายจากตารางพันเนตต์</span></div>
        ${row('dom')}${row('rec')}
        <div class="geno-line">จีโนไทป์ที่ได้: ${genoLine}</div>`;
    }

    function showBorn(kids) {
      const box = $('#s5-born');
      if (kids.length === 1) {
        const { g, f, m } = kids[0];
        const P = T[gen.pheno(g)];
        box.innerHTML = `<div class="born-one">
          ${GW.creature.svg(g, Object.assign({ size: 150, cls: 'pop-in' }, GW.creature.randomLook()))}
          <div class="born-info">
            <div class="born-name">น้อง${GW.ui.pick(GW.NAMES)}</div>
            <div class="born-tags"><span class="tag-g">จีโนไทป์ <b>${g}</b></span><span class="tag-p" style="--c:${P.dark}">${P.label}</span></div>
            <div class="born-from">ได้ ${GW.ui.allele(f, 'mini')} จากพ่อ และ ${GW.ui.allele(m, 'mini')} จากแม่</div>
          </div>
        </div>`;
      } else if (kids.length <= 12) {
        box.innerHTML = `<div class="born-grid">${kids.map(({ g }, i) => `
          <div class="born-mini" style="animation-delay:${i * 70}ms">
            ${GW.creature.svg(g, Object.assign({ size: 62 }, GW.creature.randomLook()))}<b>${g}</b>
          </div>`).join('')}</div>`;
      } else {
        const d = kids.filter(({ g }) => gen.pheno(g) === 'dom').length;
        box.innerHTML = `<div class="waffle-wrap">
          <div class="waffle">${kids.map(({ g }, i) => `<i class="${gen.pheno(g)}" style="animation-delay:${i * 9}ms"></i>`).join('')}</div>
          <div class="waffle-legend">
            <div><i class="sw" style="background:${T.dom.color}"></i>${T.dom.label} <b>${d}</b> ตัว</div>
            <div><i class="sw" style="background:${T.rec.color}"></i>${T.rec.label} <b>${kids.length - d}</b> ตัว</div>
            <small>จากการฟักครั้งนี้ ${kids.length} ฟอง</small>
          </div>
        </div>`;
      }
    }

    function message() {
      if (exp.dom === 1 || exp.rec === 1) {
        const only = Object.keys(exp.geno)[0];
        return `ลูกทุกตัวเป็น <b>${only}</b> ตรงตามตารางพันเนตต์ทุกครั้ง เพราะโอกาสเป็น 100% — ไม่ว่าจะฟักกี่ฟองก็ได้ผลเหมือนเดิม`;
      }
      const a = Math.round((stats.dom / stats.total) * 100);
      const e = Math.round(exp.dom * 100);
      if (stats.total < 30) {
        return `ฟักแล้ว ${stats.total} ตัว — ผลจริงอาจยังไม่ตรงกับที่คาดหมาย เพราะลูกแต่ละตัวได้แอลลีลแบบสุ่ม ลองกด <b>ฟัก 100 ฟอง</b> ดูสิ`;
      }
      return `ฟักแล้ว ${stats.total} ตัว: ${T.dom.label} ${a}% (คาดหมาย ${e}%) — ยิ่งฟักมาก ผลจริงยิ่งใกล้ค่าที่คาดหมาย อัตราส่วนจากตารางพันเนตต์จึงเป็น<b>ความน่าจะเป็น</b> ไม่ใช่ผลที่ต้องตรงทุกครั้ง`;
    }

    function hatch(n) {
      if (busy) return;
      busy = true;
      $$('.inc-base .btn', main).forEach((b) => (b.disabled = true));
      const eggEl = $('#s5-egg');
      eggEl.classList.add('shaking');
      GW.sound.play('wobble');
      setTimeout(() => {
        eggEl.classList.remove('shaking');
        eggEl.innerHTML = GW.creature.egg({ size: 130, cracked: true });
        GW.sound.play('hatch');
        const pick = (g) => g[Math.random() < 0.5 ? 0 : 1];
        const kids = Array.from({ length: n }, () => {
          const f = pick(F);
          const m = pick(M);
          return { f, m, g: gen.join(f, m) };
        });
        const tally = {};
        kids.forEach(({ g }) => {
          stats.total++;
          stats[gen.pheno(g)]++;
          stats.geno[g] = (stats.geno[g] || 0) + 1;
          tally[g] = (tally[g] || 0) + 1;
        });
        Object.keys(tally).forEach((g) => GW.state.addToBook(g, tally[g]));
        showBorn(kids);
        drawChart();
        if (!ctx.isDone()) ctx.done(message() + '<br>กด <b>ส่งมอบใบสั่งผลิต</b> เมื่อพร้อม');
        else ctx.say(message(), 'happy');
        setTimeout(() => {
          eggEl.innerHTML = GW.creature.egg({ size: 130 });
          busy = false;
          $$('.inc-base .btn', main).forEach((b) => (b.disabled = false));
        }, 700);
      }, n === 1 ? 900 : 600);
    }

    $$('.inc-base .btn', main).forEach((b) => b.addEventListener('click', () => hatch(+b.dataset.n)));
    drawChart();
    ctx.setHints([
      'ลองฟัก 1 ฟองก่อน แล้วลองฟัก 100 ฟอง เทียบแท่ง "ผลจริง" กับ "คาดหมาย"',
      'ค่าที่คาดหมายมาจากตารางพันเนตต์ในสถานี 4: นับจำนวนช่องของแต่ละลักษณะ แล้วหารด้วย 4',
    ]);
    ctx.setAutofill(() => hatch(100));
    ctx.say('ถึงเวลาฟักไข่! ลูกแต่ละตัวได้แอลลีลแบบสุ่มจากพ่อ 1 ตัว และจากแม่ 1 ตัว เหมือนการโยนเหรียญ');
  },
});
