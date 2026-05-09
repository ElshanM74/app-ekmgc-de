/**
 * EU AI Act Quick Scan — UI controller (bilingual).
 *
 * State machine: intro → question[0..n] → result.
 * Answers live in memory only; no data leaves the browser unless the user
 * explicitly submits the email-capture form.
 *
 * Reacts to language changes via the 'ekm:lang-changed' event: the current
 * view is re-rendered so EN/DE toggle is instant.
 */
(function () {
  'use strict';

  const t        = (k, p) => window.EKM_T ? window.EKM_T(k, p) : k;
  const L        = () => (window.EKM_LANG ? window.EKM_LANG() : 'en');
  const getQs    = () => (window.EKM_getQuestions ? window.EKM_getQuestions(L()) : []);
  const daysLeft = window.EKM_DAYS_TO_DEADLINE();

  const state = {
    step: -1,
    answers: {},
    startedAt: null,
    result: null,
  };

  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    intro:      $('#intro'),
    survey:     $('#survey'),
    result:     $('#result'),
    progress:   $('#progress'),
    startBtn:   $('#startBtn'),
    daysBadges: $$('.js-days-left'),
  };

  els.daysBadges.forEach((b) => { b.textContent = String(daysLeft); });

  // ─── Navigation helpers ──────────────────────────────────────────────────
  function show(view) {
    [els.intro, els.survey, els.result].forEach((n) => n && n.classList.remove('is-active'));
    if (view === 'intro')  els.intro.classList.add('is-active');
    if (view === 'survey') els.survey.classList.add('is-active');
    if (view === 'result') els.result.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress() {
    const total = getQs().length;
    const pct = total === 0 ? 0 : Math.max(0, Math.min(100, Math.round((state.step / total) * 100)));
    if (els.progress) {
      els.progress.style.width = pct + '%';
      els.progress.setAttribute('aria-valuenow', String(pct));
    }
  }

  // ─── Static intro strings (re-bound on language change) ──────────────────
  function renderIntroStatic() {
    const map = {
      '.intro__eyebrow':                 t('intro.eyebrow'),
      '.intro__title-a':                 t('intro.title.a'),
      '.intro__title-accent':            t('intro.title.accent'),
      '.intro__title-b':                 t('intro.title.b'),
      '.intro__subtitle':                t('intro.subtitle'),
      '[data-i18n="intro.fact.days"]':        t('intro.fact.days'),
      '[data-i18n="intro.fact.penalty.num"]': t('intro.fact.penalty.num'),
      '[data-i18n="intro.fact.penalty"]':     t('intro.fact.penalty'),
      '[data-i18n="intro.fact.annex"]':       t('intro.fact.annex'),
      '[data-i18n="intro.fact.articles"]':    t('intro.fact.articles'),
      '#startBtn':                       t('intro.cta.start'),
      '[data-i18n="intro.cta.visit"]':       t('intro.cta.visit'),
      '[data-i18n="topbar.suffix"]':         t('topbar.suffix'),
      '[data-i18n="topbar.daysSuffix"]':     t('topbar.daysSuffix'),
      '[data-i18n="footer.disclaimer"]':     t('footer.disclaimer'),
      '[data-i18n="intro.small"]':           t('intro.small'),
    };
    for (const [sel, txt] of Object.entries(map)) {
      const el = document.querySelector(sel);
      if (el) el.textContent = txt;
    }
    // Document-level
    document.title = t('doc.title');
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('doc.description'));
  }

  // ─── Question renderer ───────────────────────────────────────────────────
  function renderQuestion() {
    const questions = getQs();
    const q = questions[state.step];
    if (!q) return;

    const optionsHtml = (() => {
      if (q.type === 'yesno') {
        const labels = [
          { value: 'yes',    label: t('survey.yes') },
          { value: 'no',     label: t('survey.no') },
          { value: 'unsure', label: t('survey.unsure') },
        ];
        return labels.map((opt) => optionHtml(q, opt, 'radio')).join('');
      }
      const inputType = q.type === 'checkbox' ? 'checkbox' : 'radio';
      return (q.options || []).map((opt) => optionHtml(q, opt, inputType)).join('');
    })();

    const isLast = state.step === questions.length - 1;
    const nextLabel = isLast ? t('survey.finish') : t('survey.next');

    els.survey.innerHTML = `
      <div class="card">
        <div class="card__step">${t('survey.step', { n: state.step + 1, total: questions.length })}</div>
        <h2 class="card__title">${escapeHtml(q.question)}</h2>
        ${q.help ? `<p class="card__help">${escapeHtml(q.help)}</p>` : ''}
        <form class="options" id="qForm" autocomplete="off">
          ${optionsHtml}
        </form>
        <div class="card__actions">
          <button type="button" class="btn btn--ghost" id="backBtn"${state.step === 0 ? ' disabled' : ''}>${t('survey.back')}</button>
          <button type="button" class="btn btn--primary" id="nextBtn" disabled>${nextLabel}</button>
        </div>
      </div>
    `;

    const nextBtn = $('#nextBtn');
    const backBtn = $('#backBtn');
    const form    = $('#qForm');

    // Pre-fill previous answer if exists
    const prior = state.answers[q.id];
    if (prior !== undefined) {
      if (Array.isArray(prior)) {
        prior.forEach((v) => {
          const el = form.querySelector(`input[value="${CSS.escape(v)}"]`);
          if (el) el.checked = true;
        });
      } else {
        const el = form.querySelector(`input[value="${CSS.escape(prior)}"]`);
        if (el) el.checked = true;
      }
    }

    const syncNext = () => {
      nextBtn.disabled = form.querySelectorAll('input:checked').length === 0;
    };
    syncNext();
    form.addEventListener('change', syncNext);

    nextBtn.addEventListener('click', () => {
      const inputs = form.querySelectorAll('input:checked');
      if (!inputs.length) return;
      const values = Array.from(inputs).map((i) => i.value);
      state.answers[q.id] = q.type === 'checkbox' ? values : values[0];

      if (window.EKM_TRACK) window.EKM_TRACK('scan_answered', { question: q.id });

      if (isLast) {
        finishSurvey();
      } else {
        state.step += 1;
        updateProgress();
        renderQuestion();
      }
    });

    backBtn.addEventListener('click', () => {
      if (state.step === 0) return;
      state.step -= 1;
      updateProgress();
      renderQuestion();
    });
  }

  function optionHtml(q, opt, inputType) {
    const id = `${q.id}__${opt.value}`;
    return `
      <label for="${id}" class="option">
        <input type="${inputType}" name="${q.id}" value="${escapeHtml(opt.value)}" id="${id}">
        <span class="option__label">${escapeHtml(opt.label)}</span>
      </label>
    `;
  }

  // ─── Result renderer ─────────────────────────────────────────────────────
  function finishSurvey() {
    state.result = window.EKM_SCORE(state.answers, getQs());
    updateProgress();
    renderResult();
    show('result');
    if (window.EKM_TRACK) {
      window.EKM_TRACK('scan_completed', {
        tier:        state.result.tier,
        score:       state.result.score,
        triggered:   state.result.triggeredAnnex.length,
        duration_ms: state.startedAt ? Date.now() - state.startedAt : null,
        lang:        L(),
      });
    }
  }

  function renderResult() {
    const r  = state.result;
    const tm = window.EKM_getTierMeta(r.tier);

    // Re-resolve Annex categories in case language changed after score()
    const triggeredLocalised = r.triggeredAnnex.map((a) => ({
      id: a.id,
      category: a.annexKey ? t(a.annexKey) : a.category,
    }));

    const triggeredHtml = triggeredLocalised.length
      ? `<ul class="result__list">${
          triggeredLocalised.map((a) => `<li>${escapeHtml(a.category)}</li>`).join('')
        }</ul>`
      : `<p class="result__muted">${escapeHtml(t('result.triggered.none'))}</p>`;

    const obligationsHtml = r.obligationKeys.length
      ? `<ul class="result__list">${
          r.obligationKeys.slice(0, 8).map((k) => `<li>${escapeHtml(t(k))}</li>`).join('')
        }</ul>`
      : `<p class="result__muted">${escapeHtml(t('result.obligations.none'))}</p>`;

    const rationaleHtml = r.rationaleKeys.length
      ? `<ul class="result__rationale">${
          r.rationaleKeys.map((k) => `<li>${escapeHtml(t(k))}</li>`).join('')
        }</ul>`
      : '';

    els.result.innerHTML = `
      <div class="result__hero" style="--tier-color:${tm.color}">
        <div class="result__tier-pill">${escapeHtml(tm.label)}</div>
        <div class="result__score">
          <span class="result__score-num">${r.score}</span>
          <span class="result__score-unit">${escapeHtml(t('result.scoreUnit'))}</span>
        </div>
        <h2 class="result__headline">${escapeHtml(tm.intro)}</h2>
        <p class="result__detail">${escapeHtml(tm.detail)}</p>
        <div class="result__deadline">
          <strong>${r.daysToDeadline}</strong> ${escapeHtml(t('result.deadline'))}
        </div>
      </div>

      <div class="result__grid">
        <section class="result__card">
          <h3>${escapeHtml(t('result.heading.triggered'))}</h3>
          ${triggeredHtml}
        </section>
        <section class="result__card">
          <h3>${escapeHtml(t('result.heading.obligations'))}</h3>
          ${obligationsHtml}
        </section>
      </div>

      ${rationaleHtml ? `
        <section class="result__card result__card--wide">
          <h3>${escapeHtml(t('result.heading.rationale'))}</h3>
          ${rationaleHtml}
        </section>
      ` : ''}

      <section class="result__card result__card--wide result__capture">
        <h3>${escapeHtml(t('result.capture.title'))}</h3>
        <p>${escapeHtml(t('result.capture.body'))}</p>
        <form id="captureForm" class="capture">
          <input type="email" name="email" placeholder="${escapeHtml(t('result.capture.email'))}" required>
          <input type="text"  name="company" placeholder="${escapeHtml(t('result.capture.company'))}">
          <button type="submit" class="btn btn--primary">${escapeHtml(t('result.capture.submit'))}</button>
        </form>
        <p class="capture__note" id="captureNote">
          ${escapeHtml(t('result.capture.note'))}
          <a href="https://www.linkedin.com/in/elshan-musayev/" target="_blank" rel="noopener">${escapeHtml(t('result.capture.noteLink'))}</a>
          ${escapeHtml(t('result.capture.noteSuffix'))}
          <strong>BOARD</strong>.
        </p>
      </section>

      <div class="result__actions">
        <button class="btn btn--primary" id="downloadBtn">${escapeHtml(t('result.download'))}</button>
        <a class="btn btn--ghost" href="https://ekmgc.de#contact" target="_blank" rel="noopener">${escapeHtml(t('result.book'))}</a>
        <button class="btn btn--ghost" id="restartBtn">${escapeHtml(t('result.restart'))}</button>
      </div>
    `;

    $('#restartBtn').addEventListener('click', () => {
      state.step = -1;
      state.answers = {};
      state.result = null;
      show('intro');
      updateProgress();
    });

    $('#downloadBtn').addEventListener('click', () => {
      if (window.EKM_BuildPdf) window.EKM_BuildPdf(state.result, state.answers);
      if (window.EKM_TRACK)    window.EKM_TRACK('pdf_downloaded', { tier: r.tier, lang: L() });
    });

    $('#captureForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f       = e.target;
      const email   = f.email.value.trim();
      const company = f.company.value.trim();
      if (!email) return;

      if (window.EKM_SubmitCapture) {
        window.EKM_SubmitCapture({ email, company, result: state.result, lang: L() })
          .then(() => {
            $('#captureNote').textContent = t('result.capture.thanks');
            if (window.EKM_BuildPdf) window.EKM_BuildPdf(state.result, state.answers);
            if (window.EKM_TRACK)    window.EKM_TRACK('email_captured', { tier: state.result.tier, lang: L() });
          })
          .catch(() => {
            $('#captureNote').textContent = t('result.capture.fail');
            if (window.EKM_BuildPdf) window.EKM_BuildPdf(state.result, state.answers);
          });
      } else {
        if (window.EKM_BuildPdf) window.EKM_BuildPdf(state.result, state.answers);
      }
    });
  }

  // ─── Start button ────────────────────────────────────────────────────────
  if (els.startBtn) {
    els.startBtn.addEventListener('click', () => {
      state.step      = 0;
      state.startedAt = Date.now();
      updateProgress();
      renderQuestion();
      show('survey');
      if (window.EKM_TRACK) window.EKM_TRACK('scan_started', { lang: L() });
    });
  }

  // ─── Language toggle ─────────────────────────────────────────────────────
  function setupLangToggle() {
    const toggle = document.querySelector('[data-lang-toggle]');
    if (!toggle) return;

    const update = () => {
      toggle.querySelectorAll('[data-lang]').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.lang === L());
        btn.setAttribute('aria-pressed', btn.dataset.lang === L() ? 'true' : 'false');
      });
    };

    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lang]');
      if (!btn) return;
      const lang = btn.dataset.lang;
      if (lang && lang !== L() && window.EKM_SET_LANG) {
        window.EKM_SET_LANG(lang);
      }
    });

    update();
    window.addEventListener('ekm:lang-changed', update);
  }

  window.addEventListener('ekm:lang-changed', () => {
    renderIntroStatic();
    // Re-render active view
    if (state.step >= 0 && state.result == null) {
      renderQuestion();
    } else if (state.result) {
      renderResult();
    }
  });

  // ─── Utils ───────────────────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&',  '&amp;')
      .replaceAll('<',  '&lt;')
      .replaceAll('>',  '&gt;')
      .replaceAll('"',  '&quot;')
      .replaceAll("'",  '&#39;');
  }

  // ─── Init ────────────────────────────────────────────────────────────────
  renderIntroStatic();
  setupLangToggle();
  show('intro');
  updateProgress();
})();
