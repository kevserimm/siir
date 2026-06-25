
// ────────────────────────────────────────────────────────────
//  STATE
// ────────────────────────────────────────────────────────────
const TOTAL_QUESTIONS = 38;

const SECTIONS = {
  tf:   { wrap: 'tf-wrap',   questions: [] },
  fill: { wrap: 'fill-wrap', questions: [] },
  mc:   { wrap: 'mc-wrap',   questions: [] },
  rd:   { wrap: 'rd-wrap',   questions: [] },
};

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // True/False buttons
  document.querySelectorAll('.q-item[data-type="tf"] .tf-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const item = this.closest('.q-item');
      item.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      updateProgress();
    });
  });

  // MC options
  document.querySelectorAll('.q-item[data-type="mc"] .mc-option').forEach(opt => {
    opt.addEventListener('click', function () {
      const item = this.closest('.q-item');
      item.querySelectorAll('.mc-option').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      updateProgress();
    });
  });

  // Fill inputs
  document.querySelectorAll('.fill-input').forEach(inp => {
    inp.addEventListener('input', updateProgress);
  });

  updateProgress();
});

// ────────────────────────────────────────────────────────────
//  PROGRESS
// ────────────────────────────────────────────────────────────
function countAnswered() {
  let n = 0;

  document.querySelectorAll('#tf-wrap .q-item[data-type="tf"]').forEach(item => {
    if (item.querySelector('.tf-btn.selected')) n++;
  });

  document.querySelectorAll('#fill-wrap .q-item[data-type="fill"] .fill-input').forEach(inp => {
    if (inp.value.trim()) n++;
  });

  document.querySelectorAll('#fill-wrap .q-item[data-type="fill2"]').forEach(item => {
    const inputs = item.querySelectorAll('.fill-input');
    if ([...inputs].every(i => i.value.trim())) n++;
  });

  document.querySelectorAll('#mc-wrap .q-item[data-type="mc"], #rd-wrap .q-item[data-type="mc"]').forEach(item => {
    if (item.querySelector('.mc-option.selected')) n++;
  });

  return n;
}

function updateProgress() {
  const n = countAnswered();
  document.getElementById('progressBar').style.width = (n / TOTAL_QUESTIONS * 100) + '%';
  document.getElementById('progressLabel').textContent = `${n} / ${TOTAL_QUESTIONS} soru cevaplandı`;
}

// ────────────────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────────────────
function normalize(s) {
  return (s || '').trim().toLowerCase()
    .replace(/ü/g, 'ue')
    .replace(/ö/g, 'oe')
    .replace(/ä/g, 'ae')
    .replace(/ß/g, 'ss');
}

function flexMatch(input, answer) {
  const v = (input || '').trim().toLowerCase();
  const a = (answer || '').trim().toLowerCase();
  return v === a
    || normalize(v) === normalize(a)
    || v === normalize(a)
    || normalize(v) === a;
}

// ────────────────────────────────────────────────────────────
//  CHECK SECTION
// ────────────────────────────────────────────────────────────
function checkSection(sectionKey) {
  const wrapId = SECTIONS[sectionKey]?.wrap || (sectionKey === 'rd' ? 'rd-wrap' : null);
  if (!wrapId) return;
  const wrap = document.getElementById(wrapId);

  wrap.querySelectorAll('.q-item').forEach(item => {
    const type = item.dataset.type;
    const fb = item.querySelector('.q-feedback');
    fb.classList.remove('show', 'ok', 'no');

    if (type === 'tf') {
      const sel = item.querySelector('.tf-btn.selected');
      const ans = item.dataset.answer;
      item.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('correct', 'wrong'));
      if (!sel) {
        fb.textContent = '⚠️ Lütfen bir şık seçin.';
        fb.classList.add('show', 'no');
        return;
      }
      const ok = sel.dataset.val === ans;
      sel.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) {
        item.querySelectorAll('.tf-btn').forEach(b => {
          if (b.dataset.val === ans) b.classList.add('correct');
        });
      }
      fb.textContent = ok ? '✓ Doğru!' : `✗ Yanlış. Doğru cevap: ${ans === 'D' ? 'Doğru' : 'Yanlış'}`;
      fb.classList.add('show', ok ? 'ok' : 'no');

    } else if (type === 'fill') {
      const inp = item.querySelector('.fill-input');
      const ans = inp.dataset.answer;
      inp.classList.remove('correct', 'wrong');
      if (!inp.value.trim()) {
        fb.textContent = '⚠️ Boşluğu doldurun.';
        fb.classList.add('show', 'no');
        return;
      }
      const ok = flexMatch(inp.value, ans);
      inp.classList.add(ok ? 'correct' : 'wrong');
      fb.textContent = ok ? `✓ Doğru! (${ans})` : `✗ Yanlış. Doğru cevap: ${ans}`;
      fb.classList.add('show', ok ? 'ok' : 'no');

    } else if (type === 'fill2') {
      const inputs = item.querySelectorAll('.fill-input');
      let allOk = true;
      inputs.forEach(inp => {
        inp.classList.remove('correct', 'wrong');
        if (!inp.value.trim()) { allOk = false; return; }
        const ok = flexMatch(inp.value, inp.dataset.answer);
        inp.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) allOk = false;
      });
      const answers = [...inputs].map(i => i.dataset.answer).join(' … ');
      fb.textContent = allOk ? `✓ Doğru! (${answers})` : `✗ Yanlış. Doğru cevaplar: ${answers}`;
      fb.classList.add('show', allOk ? 'ok' : 'no');

    } else if (type === 'mc') {
      const sel = item.querySelector('.mc-option.selected');
      const ans = item.dataset.answer;
      item.querySelectorAll('.mc-option').forEach(o => o.classList.remove('correct', 'wrong'));
      if (!sel) {
        fb.textContent = '⚠️ Lütfen bir şık seçin.';
        fb.classList.add('show', 'no');
        return;
      }
      const ok = sel.dataset.val === ans;
      sel.classList.add(ok ? 'correct' : 'wrong');
      if (!ok) {
        item.querySelectorAll('.mc-option').forEach(o => {
          if (o.dataset.val === ans) o.classList.add('correct');
        });
      }
      fb.textContent = ok ? '✓ Doğru!' : `✗ Yanlış. Doğru cevap: ${ans}`;
      fb.classList.add('show', ok ? 'ok' : 'no');
    }
  });
}

// ────────────────────────────────────────────────────────────
//  FINAL SUBMIT
// ────────────────────────────────────────────────────────────
function finalSubmit() {
  checkSection('tf');
  checkSection('fill');
  checkSection('mc');
  checkSection('rd');

  let totalCorrect = 0, totalQ = 0;
  const sectionScores = {};

  const sectionDefs = [
    { key: 'tf',   label: 'Doğru/Yanlış',   wrapId: 'tf-wrap' },
    { key: 'fill', label: 'Boşluk Doldurma', wrapId: 'fill-wrap' },
    { key: 'mc',   label: 'Test',            wrapId: 'mc-wrap' },
    { key: 'rd',   label: 'Paragraf',        wrapId: 'rd-wrap' },
  ];

  sectionDefs.forEach(def => {
    const wrap = document.getElementById(def.wrapId);
    let sc = 0, sq = 0;
    wrap.querySelectorAll('.q-item').forEach(item => {
      const type = item.dataset.type;
      sq++;
      if (type === 'tf') {
        const sel = item.querySelector('.tf-btn.selected');
        if (sel && sel.classList.contains('correct')) sc++;
      } else if (type === 'fill') {
        const inp = item.querySelector('.fill-input');
        if (inp && inp.classList.contains('correct')) sc++;
      } else if (type === 'fill2') {
        const inputs = item.querySelectorAll('.fill-input');
        if ([...inputs].every(i => i.classList.contains('correct'))) sc++;
      } else if (type === 'mc') {
        const sel = item.querySelector('.mc-option.selected');
        if (sel && sel.classList.contains('correct')) sc++;
      }
    });
    sectionScores[def.label] = { sc, sq };
    totalCorrect += sc;
    totalQ += sq;
  });

  const pct = Math.round(totalCorrect / totalQ * 100);
  const msgs = [
    [90, '🏆 Mükemmel! Almancada harika bir seviyedesin!'],
    [75, '🎉 Çok iyi! Küçük eksikler var, tekrar et.'],
    [60, '👍 İyi, ama daha fazla pratik gerekli.'],
    [40, '📚 Konuları tekrar gözden geçir, başarabilirsin!'],
    [0,  '💪 Daha fazla çalışmak gerekiyor. Devam et!'],
  ];
  const msg = msgs.find(([min]) => pct >= min)[1];

  document.getElementById('result-pct').textContent = `${pct}%`;
  document.getElementById('result-msg').textContent = `${totalCorrect} / ${totalQ} doğru — ${msg}`;

  const bdEl = document.getElementById('result-breakdown');
  bdEl.innerHTML = sectionDefs.map(def => {
    const { sc, sq } = sectionScores[def.label];
    return `<div class="rb-item"><div class="rb-label">${def.label}</div><div class="rb-val">${sc}/${sq}</div></div>`;
  }).join('');

  const panel = document.getElementById('result-panel');
  panel.classList.add('show');
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  updateProgress();
}

// ────────────────────────────────────────────────────────────
//  RESET
// ────────────────────────────────────────────────────────────
function resetSection(sectionKey) {
  const wrapId = SECTIONS[sectionKey]?.wrap || (sectionKey === 'rd' ? 'rd-wrap' : null);
  if (!wrapId) return;
  const wrap = document.getElementById(wrapId);

  wrap.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected', 'correct', 'wrong'));
  wrap.querySelectorAll('.mc-option').forEach(o => o.classList.remove('selected', 'correct', 'wrong'));
  wrap.querySelectorAll('.fill-input').forEach(i => { i.value = ''; i.classList.remove('correct', 'wrong'); });
  wrap.querySelectorAll('.q-feedback').forEach(f => { f.classList.remove('show', 'ok', 'no'); f.textContent = ''; });
  updateProgress();
}

function resetAll() {
  ['tf', 'fill', 'mc', 'rd'].forEach(resetSection);
  document.getElementById('result-panel').classList.remove('show');
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
// ═══════════════════════════════════════
// BÖLÜM 5 — DİNLEME (Web Speech API)
// ═══════════════════════════════════════

let listenUtterance = null;

function playListenText() {
  if (!('speechSynthesis' in window)) {
    alert('Tarayıcınız sesli okumayı desteklemiyor. Lütfen Chrome veya Edge kullanın.');
    return;
  }
  window.speechSynthesis.cancel(); // önceki varsa durdur

  const text = document.getElementById('listen-text').innerText.trim();
  listenUtterance = new SpeechSynthesisUtterance(text);
  listenUtterance.lang = 'de-DE';
  listenUtterance.rate = 0.9;  // biraz yavaş — sınav için ideal
  listenUtterance.pitch = 1;

  const status = document.getElementById('listen-status');
  const btnStop = document.getElementById('btn-stop');
  const btnListen = document.getElementById('btn-listen');

  listenUtterance.onstart = () => {
    status.textContent = '🔊 Metin okunuyor...';
    btnStop.disabled = false;
    btnListen.disabled = true;
  };
  listenUtterance.onend = () => {
    status.textContent = '✅ Dinleme tamamlandı. Soruları cevaplayabilirsiniz.';
    btnStop.disabled = true;
    btnListen.disabled = false;
  };
  listenUtterance.onerror = () => {
    status.textContent = '⚠️ Ses yüklenemedi. Lütfen tekrar deneyin.';
    btnStop.disabled = true;
    btnListen.disabled = false;
  };

  window.speechSynthesis.speak(listenUtterance);
}

function stopListenText() {
  window.speechSynthesis.cancel();
  document.getElementById('listen-status').textContent = '⏹ Durduruldu.';
  document.getElementById('btn-stop').disabled = true;
  document.getElementById('btn-listen').disabled = false;
}
