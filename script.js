// ────────────────────────────────────────────────────────────
//  SECTION MAP
//  Maps a section key to the DOM wrap ID and a display label.
// ────────────────────────────────────────────────────────────
const SECTION_MAP = {
  sent:   { wrapId: 'sent-wrap',   label: 'Cümle Kurma' },
  warh:   { wrapId: 'warh-wrap',   label: 'war / hatte' },
  sep:    { wrapId: 'sep-wrap',    label: 'Ayrılabilen Fiiller' },
  prep:   { wrapId: 'prep-wrap',   label: 'am/im/um' },
  date:   { wrapId: 'date-wrap',   label: 'Tarihler' },
  season: { wrapId: 'season-wrap', label: 'Mevsimler' },
  read:   { wrapId: 'read-wrap',   label: 'Paragraf' },
  listen: { wrapId: 'listen-wrap', label: 'Dinleme' },
};

// Count of "questions" for progress bar (fill2 counts as 1)
const TOTAL_QUESTIONS = 51;

// ────────────────────────────────────────────────────────────
//  INIT
// ────────────────────────────────────────────────────────────
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

  // Multiple-choice options
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
//  PROGRESS BAR
// ────────────────────────────────────────────────────────────
function countAnswered() {
  let n = 0;

  // True/False
  document.querySelectorAll('.q-item[data-type="tf"]').forEach(item => {
    if (item.querySelector('.tf-btn.selected')) n++;
  });

  // Multiple choice (all mc items across all wraps)
  document.querySelectorAll('.q-item[data-type="mc"]').forEach(item => {
    if (item.querySelector('.mc-option.selected')) n++;
  });

  // Single fill (type="fill") — wide or inline
  document.querySelectorAll('.q-item[data-type="fill"]').forEach(item => {
    const inp = item.querySelector('.fill-input');
    if (inp && inp.value.trim()) n++;
  });

  // Double fill (type="fill2") — counts as 1 question
  document.querySelectorAll('.q-item[data-type="fill2"]').forEach(item => {
    const inputs = item.querySelectorAll('.fill-input');
    if ([...inputs].every(i => i.value.trim())) n++;
  });

  return n;
}

function updateProgress() {
  const n = countAnswered();
  document.getElementById('progressBar').style.width = (n / TOTAL_QUESTIONS * 100) + '%';
  document.getElementById('progressLabel').textContent = `${n} / ${TOTAL_QUESTIONS} soru cevaplandı`;
}

// ────────────────────────────────────────────────────────────
//  STRING HELPERS
// ────────────────────────────────────────────────────────────
function normalizeUmlauts(s) {
  return (s || '')
    .trim()
    .toLowerCase()
    .replace(/ü/g, 'ue')
    .replace(/ö/g, 'oe')
    .replace(/ä/g, 'ae')
    .replace(/ß/g, 'ss');
}

// Accept:
//   • exact match (case-insensitive)
//   • umlaut-substituted match
//   • trailing period optional on sentence answers
function flexMatch(input, answer) {
  const clean = s => normalizeUmlauts(s).replace(/[.!?]$/, '').replace(/\s+/g, ' ').trim();
  return clean(input) === clean(answer);
}

// ────────────────────────────────────────────────────────────
//  CHECK SECTION
// ────────────────────────────────────────────────────────────
function checkSection(sectionKey) {
  const def = SECTION_MAP[sectionKey];
  if (!def) return;
  const wrap = document.getElementById(def.wrapId);
  if (!wrap) return;

  wrap.querySelectorAll('.q-item').forEach(item => {
    const type = item.dataset.type;
    const fb   = item.querySelector('.q-feedback');
    if (!fb) return;
    fb.className = 'q-feedback'; // reset
    fb.textContent = '';

    if (type === 'tf') {
      checkTF(item, fb);
    } else if (type === 'mc') {
      checkMC(item, fb);
    } else if (type === 'fill') {
      checkFill(item, fb);
    } else if (type === 'fill2') {
      checkFill2(item, fb);
    }
  });
}

function checkTF(item, fb) {
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
}

function checkMC(item, fb) {
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

function checkFill(item, fb) {
  const inp = item.querySelector('.fill-input');
  const ans = inp ? inp.dataset.answer : item.dataset.answer;
  if (!inp) return;
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
}

function checkFill2(item, fb) {
  const inputs = item.querySelectorAll('.fill-input');
  if (!inputs.length) return;
  let allAnswered = true;
  let allOk = true;
  inputs.forEach(inp => {
    inp.classList.remove('correct', 'wrong');
    if (!inp.value.trim()) { allAnswered = false; return; }
    const ok = flexMatch(inp.value, inp.dataset.answer);
    inp.classList.add(ok ? 'correct' : 'wrong');
    if (!ok) allOk = false;
  });
  if (!allAnswered) {
    fb.textContent = '⚠️ Tüm boşlukları doldurun.';
    fb.classList.add('show', 'no');
    return;
  }
  const expected = [...inputs].map(i => i.dataset.answer).join(' … ');
  fb.textContent = allOk ? `✓ Doğru! (${expected})` : `✗ Yanlış. Doğru cevaplar: ${expected}`;
  fb.classList.add('show', allOk ? 'ok' : 'no');
}

// ────────────────────────────────────────────────────────────
//  FINAL SUBMIT
// ────────────────────────────────────────────────────────────
function finalSubmit() {
  Object.keys(SECTION_MAP).forEach(key => checkSection(key));

  let totalCorrect = 0;
  let totalQ       = 0;
  const breakdown  = [];

  Object.entries(SECTION_MAP).forEach(([key, def]) => {
    const wrap = document.getElementById(def.wrapId);
    if (!wrap) return;
    let sc = 0, sq = 0;

    wrap.querySelectorAll('.q-item').forEach(item => {
      const type = item.dataset.type;
      sq++;

      if (type === 'tf') {
        const sel = item.querySelector('.tf-btn.selected');
        if (sel && sel.classList.contains('correct')) sc++;
      } else if (type === 'mc') {
        const sel = item.querySelector('.mc-option.selected');
        if (sel && sel.classList.contains('correct')) sc++;
      } else if (type === 'fill') {
        const inp = item.querySelector('.fill-input');
        if (inp && inp.classList.contains('correct')) sc++;
      } else if (type === 'fill2') {
        const inputs = item.querySelectorAll('.fill-input');
        if ([...inputs].every(i => i.classList.contains('correct'))) sc++;
      }
    });

    breakdown.push({ label: def.label, sc, sq });
    totalCorrect += sc;
    totalQ       += sq;
  });

  const pct = Math.round(totalCorrect / totalQ * 100);
  const msgTable = [
    [90, '🏆 Mükemmel! Almancada harika bir seviyedesin!'],
    [75, '🎉 Çok iyi! Küçük eksikler var, tekrar et.'],
    [60, '👍 İyi, ama daha fazla pratik gerekli.'],
    [40, '📚 Konuları tekrar gözden geçir, başarabilirsin!'],
    [0,  '💪 Daha fazla çalışmak gerekiyor. Devam et!'],
  ];
  const msg = (msgTable.find(([min]) => pct >= min) || msgTable[msgTable.length - 1])[1];

  document.getElementById('result-pct').textContent = `${pct}%`;
  document.getElementById('result-msg').textContent = `${totalCorrect} / ${totalQ} doğru — ${msg}`;

  const bdEl = document.getElementById('result-breakdown');
  bdEl.innerHTML = breakdown.map(({ label, sc, sq }) =>
    `<div class="rb-item"><div class="rb-label">${label}</div><div class="rb-val">${sc}/${sq}</div></div>`
  ).join('');

  const panel = document.getElementById('result-panel');
  panel.classList.add('show');
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  updateProgress();
}

// ────────────────────────────────────────────────────────────
//  RESET
// ────────────────────────────────────────────────────────────
function resetSection(sectionKey) {
  const def = SECTION_MAP[sectionKey];
  if (!def) return;
  const wrap = document.getElementById(def.wrapId);
  if (!wrap) return;

  wrap.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected', 'correct', 'wrong'));
  wrap.querySelectorAll('.mc-option').forEach(o => o.classList.remove('selected', 'correct', 'wrong'));
  wrap.querySelectorAll('.fill-input').forEach(i => {
    i.value = '';
    i.classList.remove('correct', 'wrong');
  });
  wrap.querySelectorAll('.q-feedback').forEach(f => {
    f.className = 'q-feedback';
    f.textContent = '';
  });
  updateProgress();
}

function resetAll() {
  Object.keys(SECTION_MAP).forEach(key => resetSection(key));
  document.getElementById('result-panel').classList.remove('show');
  stopListenText();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ────────────────────────────────────────────────────────────
//  LISTENING — Web Speech API (de-DE)
// ────────────────────────────────────────────────────────────
let _utterance = null;

function playListenText() {
  if (!('speechSynthesis' in window)) {
    alert('Tarayıcınız sesli okumayı desteklemiyor. Lütfen Chrome veya Edge kullanın.');
    return;
  }
  window.speechSynthesis.cancel();

  const text = document.getElementById('listen-text').innerText.trim();
  _utterance = new SpeechSynthesisUtterance(text);
  _utterance.lang  = 'de-DE';
  _utterance.rate  = 0.88;
  _utterance.pitch = 1;

  // Try to pick a German voice if available
  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find(v => v.lang.startsWith('de'));
  if (deVoice) _utterance.voice = deVoice;

  const statusEl  = document.getElementById('listen-status');
  const btnStop   = document.getElementById('btn-stop');
  const btnListen = document.getElementById('btn-listen');

  _utterance.onstart = () => {
    statusEl.textContent  = '🔊 Metin okunuyor...';
    btnStop.disabled      = false;
    btnListen.disabled    = true;
  };
  _utterance.onend = () => {
    statusEl.textContent  = '✅ Dinleme tamamlandı. Soruları cevaplayabilirsiniz.';
    btnStop.disabled      = true;
    btnListen.disabled    = false;
  };
  _utterance.onerror = () => {
    statusEl.textContent  = '⚠️ Ses yüklenemedi. Lütfen tekrar deneyin.';
    btnStop.disabled      = true;
    btnListen.disabled    = false;
  };

  window.speechSynthesis.speak(_utterance);
}

function stopListenText() {
  window.speechSynthesis.cancel();
  const statusEl  = document.getElementById('listen-status');
  const btnStop   = document.getElementById('btn-stop');
  const btnListen = document.getElementById('btn-listen');
  if (statusEl)  statusEl.textContent = '⏹ Durduruldu.';
  if (btnStop)   btnStop.disabled    = true;
  if (btnListen) btnListen.disabled  = false;
}

// Reload voices list on some browsers that populate async
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
