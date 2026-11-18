/* "สำหรับครู" page: the innovation summary (curriculum, 5E, assessment, theory),
   this device's pre/post results, and teacher tools (demo mode, save code, reset). */
GW.teacher = (function () {
  const { $, $$ } = GW.ui;

  function show() {
    GW.app.screen('teacher', 'สำหรับครู');
    const t = GW.TEACHER;
    const c = GW.CONFIG;
    const s = GW.state.get();

    const stationRows = GW.STATIONS.map((st, i) => `<li><span class="sn">${i + 1}</span><b>${st.icon} ${st.title}</b> — ${st.mission}</li>`).join('')
      + `<li><span class="sn">★</span><b>🏆 ด่านบอส</b> — เลือกพ่อแม่พันธุ์ให้ได้อัตราส่วนตามใบสั่ง และผสมเพื่อทดสอบ (test cross)</li>`;

    let results = '<p class="muted">ยังไม่มีผลการทดสอบในเครื่องนี้</p>';
    if (s.pre || s.post) {
      const bar = (label, r) => r
        ? `<div class="cb ${label === 'หลังเรียน' ? 'post' : ''}"><span>${label}</span><div class="cb-bar"><i style="width:${(r.score / r.total) * 100}%"></i></div><b>${r.score}/${r.total}</b></div>`
        : `<div class="cb"><span>${label}</span><div class="cb-bar"></div><b>—</b></div>`;
      results = `<div class="compare-bars">${bar('ก่อนเรียน', s.pre)}${bar('หลังเรียน', s.post)}</div>`;
    }

    $('#screen').innerHTML = `
      <div class="doc">
        <header class="card doc-hero">
          ${GW.creature.dna(64)}
          <div>
            <div class="doc-kicker">นวัตกรรมการจัดการเรียนรู้ · รายวิชาวิทยาศาสตร์ ${c.grade}</div>
            <h1>${t.innovation}</h1>
            <p>พัฒนาโดย <b>${c.developer}</b>${c.school ? ' · ' + c.school : ''}</p>
          </div>
        </header>

        <section class="card"><h2>ที่มาและความสำคัญของปัญหา</h2><p>${t.problem}</p></section>

        <section class="card"><h2>วัตถุประสงค์</h2><ol>${t.objectives.map((x) => `<li>${x}</li>`).join('')}</ol></section>

        <section class="card">
          <h2>ความสอดคล้องกับตัวชี้วัด</h2>
          <div class="table-wrap"><table>
            <thead><tr><th>ตัวชี้วัด</th><th>รายละเอียด</th><th>ส่วนของเกม</th></tr></thead>
            <tbody>${t.indicators.map((x) => `<tr><td class="nowrap"><b>${x.code}</b></td><td>${x.text}</td><td>${x.where}</td></tr>`).join('')}</tbody>
          </table></div>
          <p class="muted small">สาระที่ 1 วิทยาศาสตร์ชีวภาพ มาตรฐาน ว 1.3 หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พุทธศักราช 2551 (ฉบับปรับปรุง พ.ศ. 2560)</p>
        </section>

        <section class="card">
          <h2>การนำไปใช้ในชั้นเรียน (5E · 50 นาที)</h2>
          <div class="table-wrap"><table>
            <thead><tr><th>ขั้น</th><th>เวลา</th><th>กิจกรรม</th></tr></thead>
            <tbody>${t.fiveE.map((x) => `<tr><td><b>${x.step}</b></td><td class="nowrap">${x.time}</td><td>${x.act}</td></tr>`).join('')}</tbody>
          </table></div>
        </section>

        <section class="card"><h2>โครงสร้างเกม</h2><ul class="stations-list">${stationRows}</ul></section>

        <div class="two-col">
          <section class="card"><h2>การวัดและประเมินผล</h2><ul>${t.assessment.map((x) => `<li>${x}</li>`).join('')}</ul></section>
          <section class="card"><h2>แนวคิดและทฤษฎีที่ใช้</h2><dl>${t.theory.map((x) => `<dt>${x.name}</dt><dd>${x.text}</dd>`).join('')}</dl></section>
        </div>

        <div class="two-col">
          <section class="card"><h2>จุดเด่นของนวัตกรรม</h2><ul>${t.features.map((x) => `<li>${x}</li>`).join('')}</ul></section>
          <section class="card"><h2>ผลการทดสอบในเครื่องนี้</h2>${results}</section>
        </div>

        <section class="card tools">
          <h2>🛠️ เครื่องมือครู</h2>
          <label class="switch-row">
            <span><b>โหมดสาธิต</b><br><small>ปลดล็อกทุกบท กดข้ามไปสถานีใดก็ได้ และมีปุ่ม ✨ เติมคำตอบ สำหรับนำเสนอ</small></span>
            <button class="switch ${s.demo ? 'on' : ''}" id="tt-demo" role="switch" aria-checked="${s.demo}"><i></i></button>
          </label>
          ${s.demo ? `<div class="demo-card inline"><h3>⚡ ทางลัดสาธิต</h3>${GW.screens.shortcutsHtml()}</div>` : ''}
          <div class="tool-row">
            <button class="btn btn-ghost" id="tt-export">💾 คัดลอกรหัสเซฟ</button>
            <button class="btn btn-ghost" id="tt-import">📥 ใส่รหัสเซฟ</button>
            <button class="btn btn-ghost danger" id="tt-reset">🗑️ เริ่มใหม่ทั้งหมด</button>
          </div>
          <p class="muted small">ความคืบหน้าบันทึกไว้ในเครื่องนี้เท่านั้น ถ้า Safari ไม่ได้เปิดเว็บนานอาจลบข้อมูลเอง — ใช้รหัสเซฟเก็บไว้ หรือเพิ่มเว็บไปยังหน้าจอโฮม</p>
        </section>

        <div class="row center"><button class="btn btn-ghost" id="tt-home">← หน้าแรก</button><button class="btn" id="tt-map">🗺️ ไปที่แผนที่โรงงาน</button></div>
      </div>`;

    $('#tt-demo').addEventListener('click', () => {
      GW.sound.play('click');
      GW.state.set('demo', !GW.state.get().demo);
      show();
    });
    $('#tt-export').addEventListener('click', () => {
      const code = GW.state.exportCode();
      GW.ui.modal({
        title: '💾 รหัสเซฟ',
        html: `<p>คัดลอกรหัสนี้เก็บไว้ แล้วนำมาใส่ทีหลังเพื่อกู้ความคืบหน้า</p><textarea class="code-box" readonly>${code}</textarea>`,
        buttons: [{ label: 'ปิด', cls: 'btn-ghost' }],
      });
      const box = $('.code-box');
      box.focus();
      box.select();
      try { navigator.clipboard.writeText(code); } catch (e) { /* selection is enough */ }
    });
    $('#tt-import').addEventListener('click', () => {
      GW.ui.modal({
        title: '📥 ใส่รหัสเซฟ',
        html: '<textarea class="code-box" id="imp" placeholder="วางรหัสเซฟที่นี่"></textarea><p class="muted small" id="imp-msg"></p>',
        buttons: [
          { label: 'ยกเลิก', cls: 'btn-ghost' },
          {
            label: 'กู้ความคืบหน้า',
            keepOpen: true,
            onClick: () => {
              if (GW.state.importCode($('#imp').value)) {
                $('#overlay').classList.remove('open');
                show();
              } else {
                $('#imp-msg').textContent = 'รหัสไม่ถูกต้อง ลองคัดลอกใหม่อีกครั้ง';
              }
            },
          },
        ],
      });
    });
    $('#tt-reset').addEventListener('click', () => {
      GW.ui.modal({
        title: 'เริ่มใหม่ทั้งหมด?',
        html: '<p>ดาว เหรียญ สมุดสะสม และคะแนนแบบทดสอบในเครื่องนี้จะถูกลบ</p>',
        buttons: [
          { label: 'ยกเลิก', cls: 'btn-ghost' },
          { label: 'ลบและเริ่มใหม่', cls: 'btn-danger', onClick: () => { GW.state.reset(); show(); } },
        ],
      });
    });
    $('#tt-home').addEventListener('click', () => { GW.sound.play('click'); GW.screens.title(); });
    $('#tt-map').addEventListener('click', () => { GW.sound.play('click'); GW.screens.map(); });
    GW.screens.bindShortcuts($('#screen'));
  }

  return { show };
})();
