/* Pre-test / post-test (same questions, choices shuffled). Results are compared
   on the post-test screen and on the teacher page. */
GW.quiz = (function () {
  const { $, $$ } = GW.ui;

  function start(kind) {
    const label = kind === 'pre' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน';
    GW.app.screen('quiz', label);
    const qs = GW.QUIZ.map((q) => Object.assign({}, q, { order: GW.ui.shuffle(q.choices.map((_, i) => i)) }));
    const picks = [];
    let i = 0;

    function intro() {
      $('#screen').innerHTML = `
        <div class="center-screen">
          <div class="card quiz-card intro">
            ${GW.creature.mascot('think', 80)}
            <h1>${kind === 'pre' ? '📝' : '🎓'} ${label}</h1>
            <p>${qs.length} ข้อ · เลือกคำตอบที่ถูกที่สุดเพียงข้อเดียว</p>
            <p class="muted">${kind === 'pre' ? 'ยังไม่รู้ก็ไม่เป็นไร ตอบตามที่เข้าใจตอนนี้ได้เลย' : 'มาดูกันว่าหลังจากทำงานในโรงงานแล้ว เข้าใจมากขึ้นแค่ไหน'}</p>
            <div class="row center">
              <button class="btn btn-ghost" id="q-back">← กลับ</button>
              <button class="btn btn-xl" id="q-go">เริ่มทำ ➜</button>
            </div>
          </div>
        </div>`;
      $('#q-back').addEventListener('click', () => { GW.sound.play('click'); GW.screens.map(); });
      $('#q-go').addEventListener('click', () => { GW.sound.play('pop'); ask(); });
    }

    function ask() {
      const q = qs[i];
      $('#screen').innerHTML = `
        <div class="center-screen">
          <div class="card quiz-card">
            <div class="quiz-top">
              <span class="quiz-label">${label}</span>
              <span class="quiz-dots">${qs.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'on' : ''}"></i>`).join('')}</span>
              <span>ข้อ ${i + 1}/${qs.length}</span>
            </div>
            <h2 class="quiz-q">${q.q}</h2>
            <div class="mcq-choices one-col">${q.order.map((ci, k) => `<button class="choice" data-i="${ci}"><span class="ck">${'กขคง'[k]}</span><span>${q.choices[ci]}</span></button>`).join('')}</div>
          </div>
        </div>`;
      $$('.choice').forEach((b) => b.addEventListener('click', () => {
        GW.sound.play('click');
        $$('.choice').forEach((x) => (x.disabled = true));
        b.classList.add('picked');
        picks[i] = +b.dataset.i;
        setTimeout(() => { i++; if (i < qs.length) ask(); else end(); }, 350);
      }));
    }

    function end() {
      const score = qs.reduce((n, q, k) => n + (picks[k] === q.answer ? 1 : 0), 0);
      const rec = { score, total: qs.length, at: Date.now() };
      GW.state.set(kind, rec);
      const s = GW.state.get();
      GW.sound.play('win');

      let compare = '';
      if (kind === 'post' && s.pre) {
        const diff = score - s.pre.score;
        compare = `<div class="compare-bars">
            <div class="cb"><span>ก่อนเรียน</span><div class="cb-bar"><i style="width:${(s.pre.score / s.pre.total) * 100}%"></i></div><b>${s.pre.score}/${s.pre.total}</b></div>
            <div class="cb post"><span>หลังเรียน</span><div class="cb-bar"><i style="width:${(score / qs.length) * 100}%"></i></div><b>${score}/${qs.length}</b></div>
            <p class="cb-diff">${diff > 0 ? `พัฒนาขึ้น <b>+${diff}</b> คะแนน 🎉` : diff === 0 ? 'คะแนนเท่าเดิม' : `คะแนนลดลง ${diff} — ลองทบทวนบทเรียนอีกครั้ง`}</p>
          </div>`;
      }
      const review = kind === 'post'
        ? `<div class="review"><h3>เฉลยและคำอธิบาย</h3>${qs.map((q, k) => {
            const ok = picks[k] === q.answer;
            return `<div class="rv ${ok ? 'ok' : 'no'}"><b>${ok ? '✓' : '✗'} ข้อ ${k + 1}</b> ${q.q}<div>คำตอบ: <b>${q.choices[q.answer]}</b></div><small>${q.why}</small></div>`;
          }).join('')}</div>`
        : '';

      $('#screen').innerHTML = `
        <div class="center-screen">
          <div class="card quiz-card result">
            ${GW.creature.mascot('happy', 80)}
            <h1>${label}เสร็จแล้ว!</h1>
            <div class="score-big">${score}<small>/${qs.length}</small></div>
            ${compare}
            ${kind === 'pre' ? '<p class="muted">เก็บคะแนนไว้แล้ว หลังผ่านบทที่ 3 มาทำแบบทดสอบหลังเรียนเพื่อดูพัฒนาการ</p>' : ''}
            ${review}
            <div class="row center">
              <button class="btn btn-xl" id="q-map">${kind === 'pre' ? 'ไปที่โรงงาน ➜' : '🗺️ กลับแผนที่'}</button>
            </div>
          </div>
        </div>`;
      if (kind === 'post') GW.ui.confetti();
      $('#q-map').addEventListener('click', () => { GW.sound.play('click'); GW.screens.map(); });
    }

    intro();
  }

  return { start };
})();
