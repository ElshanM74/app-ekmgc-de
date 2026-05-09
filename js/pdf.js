/**
 * EU AI Act Quick Scan — PDF generator (client-side, bilingual).
 *
 * Uses jsPDF (vendored in /vendor/jspdf.umd.min.js) to render a 2-page
 * personalised summary that matches the EKM brand palette. All text is
 * resolved via window.EKM_T — the same PDF template renders in either
 * English or German depending on the current language.
 *
 * No server round-trip; PDF is built and downloaded entirely in the
 * browser. Layout: dark-navy header band, orange accent, cyan sub-labels,
 * footer with app.ekmgc.de + penalty + deadline.
 */
(function () {
  'use strict';

  const NAVY    = '#0F1E36';
  const NAVY_D  = '#0A1728';
  const ORANGE  = '#E87722';
  const CYAN    = '#4FD5E0';
  const OFF     = '#FAFAF7';
  const TEXT    = '#1A2438';
  const MUTED   = '#5B6577';

  const t = (k, p) => window.EKM_T ? window.EKM_T(k, p) : k;
  const L = () => (window.EKM_LANG ? window.EKM_LANG() : 'en');

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function setFill(doc, hex)   { doc.setFillColor(...hexToRgb(hex)); }
  function setStroke(doc, hex) { doc.setDrawColor(...hexToRgb(hex)); }
  function setText(doc, hex)   { doc.setTextColor(...hexToRgb(hex)); }

  const PW       = 210;
  const PH       = 297;
  const MARGIN_X = 16;
  const HEADER_H = 26;
  const FOOTER_H = 10;

  // ─── Logo preload ────────────────────────────────────────────────────────
  const LOGO_WHITE_SRC = './assets/logo_ekm_white.png';
  const logoImg = new Image();
  logoImg.crossOrigin = 'anonymous';
  logoImg.src = LOGO_WHITE_SRC;

  function logoReady() {
    return logoImg.complete && logoImg.naturalWidth > 0;
  }

  function drawHeader(doc, title, subtitle, badge, pageN, pageTotal) {
    // Navy band
    setFill(doc, NAVY);
    doc.rect(0, 0, PW, HEADER_H, 'F');
    // Orange strip
    setFill(doc, ORANGE);
    doc.rect(0, 0, 3, HEADER_H, 'F');

    // EKM lockup
    let labelStartX;
    if (logoReady()) {
      const LOGO_W = 28;
      const LOGO_H = LOGO_W * (logoImg.naturalHeight / logoImg.naturalWidth);
      const LOGO_Y = (HEADER_H / 3) - LOGO_H / 2 - 0.5;
      doc.addImage(logoImg, 'PNG', MARGIN_X, LOGO_Y, LOGO_W, LOGO_H);
      labelStartX = MARGIN_X + LOGO_W + 2;
    } else {
      setText(doc, OFF);
      doc.setFont('helvetica', 'bold').setFontSize(11);
      doc.text('EKM', MARGIN_X, 9);
      labelStartX = MARGIN_X + 11;
    }
    setText(doc, CYAN);
    doc.setFont('helvetica', 'normal').setFontSize(8.5);
    doc.text((L() === 'de' ? 'KI-COMPLIANCE' : 'AI COMPLIANCE'), labelStartX, 9);

    // Title
    setText(doc, OFF);
    doc.setFont('helvetica', 'bold').setFontSize(14.5);
    doc.text(title, MARGIN_X, 17);

    // Subtitle cyan
    setText(doc, CYAN);
    doc.setFont('helvetica', 'normal').setFontSize(8.5);
    doc.text(subtitle, MARGIN_X, 22);

    // Badge top-right
    const txt   = badge.toUpperCase();
    doc.setFont('helvetica', 'bold').setFontSize(8.5);
    const tW    = doc.getTextWidth(txt);
    const padX  = 3, padY = 1.6;
    const bW    = tW + padX * 2;
    const bH    = 4.5 + padY * 2;
    const bx    = PW - MARGIN_X - bW;
    const by    = 6;
    setFill(doc, ORANGE);
    doc.roundedRect(bx, by, bW, bH, 1.5, 1.5, 'F');
    setText(doc, OFF);
    doc.text(txt, bx + padX, by + bH - padY - 0.5);

    // Page counter
    setText(doc, OFF);
    doc.setFont('helvetica', 'normal').setFontSize(8);
    doc.text(`${pageN} / ${pageTotal}`, PW - MARGIN_X, 22, { align: 'right' });
  }

  function drawFooter(doc) {
    setFill(doc, NAVY_D);
    doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, 'F');
    setFill(doc, ORANGE);
    doc.rect(0, PH - FOOTER_H, 3, FOOTER_H, 'F');

    setText(doc, ORANGE);
    doc.setFont('helvetica', 'bold').setFontSize(8.5);
    doc.text('app.ekmgc.de', MARGIN_X, PH - FOOTER_H / 2 + 0.5);

    setText(doc, CYAN);
    doc.setFont('helvetica', 'normal').setFontSize(8);
    doc.text(t('pdf.footer.penalty'), PW / 2, PH - FOOTER_H / 2 + 0.5, { align: 'center' });

    setText(doc, OFF);
    doc.setFontSize(7.5);
    doc.text('EKM Global Consulting GmbH', PW - MARGIN_X, PH - FOOTER_H / 2 + 0.5, { align: 'right' });

    // Disclaimer
    setText(doc, MUTED);
    doc.setFont('helvetica', 'italic').setFontSize(6.8);
    doc.text(t('pdf.footer.disclaimer'), PW / 2, PH - FOOTER_H - 2, { align: 'center' });
  }

  function wrap(doc, text, maxW) {
    return doc.splitTextToSize(text || '', maxW);
  }

  function drawParagraph(doc, text, x, y, maxW, lineH, color = TEXT) {
    setText(doc, color);
    const lines = wrap(doc, text, maxW);
    lines.forEach((line, i) => doc.text(line, x, y + i * lineH));
    return y + lines.length * lineH;
  }

  function buildPdf(result, answers) {
    /* global jspdf */
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      console.error('jsPDF not loaded — aborting PDF build');
      alert(t('pdf.error'));
      return;
    }

    const lang = L();
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    doc.setProperties({
      title:    t('pdf.docTitle'),
      subject:  t('pdf.docSubject'),
      author:   'EKM Global Consulting GmbH',
      keywords: 'EU AI Act, Annex III, risk, compliance, Hochrisiko, Anhang III',
    });

    const tm           = window.EKM_getTierMeta(result.tier);
    const dateIso      = new Date().toISOString().slice(0, 10);
    const dateDisplay  = lang === 'de'
      ? dateIso.split('-').reverse().join('.')   // 2026-04-23 → 23.04.2026
      : dateIso;

    // ── PAGE 1 — risk summary ────────────────────────────────────────────
    setFill(doc, OFF); doc.rect(0, 0, PW, PH, 'F');
    drawHeader(
      doc,
      t('pdf.page1.title'),
      t('pdf.page1.subtitle', { date: dateDisplay }),
      t('pdf.page1.badge'),
      1, 2,
    );

    let y = HEADER_H + 8;
    const INNER_W = PW - MARGIN_X * 2;

    // Tier banner
    setFill(doc, tm.color);
    doc.roundedRect(MARGIN_X, y, INNER_W, 18, 3, 3, 'F');
    setText(doc, OFF);
    doc.setFont('helvetica', 'bold').setFontSize(14);
    doc.text(tm.label.toUpperCase(), MARGIN_X + 5, y + 8);
    doc.setFont('helvetica', 'normal').setFontSize(22);
    doc.text(`${result.score}`, PW - MARGIN_X - 5, y + 12, { align: 'right' });
    doc.setFont('helvetica', 'normal').setFontSize(9);
    doc.text('/100', PW - MARGIN_X - 5, y + 16, { align: 'right' });
    y += 24;

    // Intro + detail
    setText(doc, NAVY);
    doc.setFont('helvetica', 'bold').setFontSize(11);
    y = drawParagraph(doc, tm.intro, MARGIN_X, y, INNER_W, 5, NAVY);
    y += 2;
    doc.setFont('helvetica', 'normal').setFontSize(9.5);
    y = drawParagraph(doc, tm.detail, MARGIN_X, y, INNER_W, 4.5, TEXT);
    y += 4;

    setText(doc, ORANGE);
    doc.setFont('helvetica', 'bold').setFontSize(10);
    doc.text(t('pdf.deadline', { n: result.daysToDeadline }), MARGIN_X, y);
    y += 8;

    // Triggered categories
    setText(doc, CYAN);
    doc.setFont('helvetica', 'bold').setFontSize(8.2);
    doc.text(t('pdf.section.triggered'), MARGIN_X, y);
    setStroke(doc, ORANGE); doc.setLineWidth(0.8);
    y += 1.5;
    doc.line(MARGIN_X, y, PW - MARGIN_X, y);
    y += 5;

    setText(doc, TEXT);
    doc.setFont('helvetica', 'normal').setFontSize(9.5);
    if (result.triggeredAnnex.length) {
      result.triggeredAnnex.forEach((cat) => {
        const label = cat.annexKey ? t(cat.annexKey) : cat.category;
        doc.text('• ' + label, MARGIN_X, y);
        y += 5;
      });
    } else {
      setText(doc, MUTED);
      doc.setFont('helvetica', 'italic').setFontSize(9);
      const ls = wrap(doc, t('pdf.triggered.none'), INNER_W);
      ls.forEach((l, i) => doc.text(l, MARGIN_X, y + i * 4.5));
      y += ls.length * 4.5;
    }
    y += 3;

    // Obligations
    setText(doc, CYAN);
    doc.setFont('helvetica', 'bold').setFontSize(8.2);
    doc.text(t('pdf.section.deliverables'), MARGIN_X, y);
    setStroke(doc, ORANGE); doc.setLineWidth(0.8);
    y += 1.5;
    doc.line(MARGIN_X, y, PW - MARGIN_X, y);
    y += 5;

    setText(doc, TEXT);
    doc.setFont('helvetica', 'normal').setFontSize(9);
    if (result.obligationKeys.length) {
      result.obligationKeys.slice(0, 10).forEach((k) => {
        const lines = wrap(doc, '• ' + t(k), INNER_W - 5);
        lines.forEach((line, i) => doc.text(line, MARGIN_X, y + i * 4.5));
        y += lines.length * 4.5 + 1;
      });
    } else {
      setText(doc, MUTED);
      doc.setFont('helvetica', 'italic').setFontSize(9);
      doc.text(t('pdf.deliverables.none'), MARGIN_X, y);
      y += 5;
    }

    // CTA band
    const ctaY = PH - FOOTER_H - 18;
    setFill(doc, NAVY);
    doc.roundedRect(MARGIN_X, ctaY, INNER_W, 12, 2, 2, 'F');
    setText(doc, OFF);
    doc.setFont('helvetica', 'bold').setFontSize(9.5);
    const prefix = t('pdf.nextStep.prefix');
    doc.text(prefix, MARGIN_X + 4, ctaY + 7.5);
    const prefixW = doc.getTextWidth(prefix);
    setText(doc, ORANGE);
    doc.text(t('pdf.nextStep.text'), MARGIN_X + 4 + prefixW + 2, ctaY + 7.5);

    drawFooter(doc);

    // ── PAGE 2 — how we scored + 30-day plan + inputs ────────────────────
    doc.addPage();
    setFill(doc, OFF); doc.rect(0, 0, PW, PH, 'F');
    drawHeader(
      doc,
      t('pdf.page2.title'),
      t('pdf.page2.subtitle'),
      t('pdf.page2.badge'),
      2, 2,
    );

    y = HEADER_H + 8;

    // Rationale
    setText(doc, CYAN);
    doc.setFont('helvetica', 'bold').setFontSize(8.2);
    doc.text(t('pdf.section.rationale'), MARGIN_X, y);
    setStroke(doc, ORANGE); doc.setLineWidth(0.8);
    y += 1.5;
    doc.line(MARGIN_X, y, PW - MARGIN_X, y);
    y += 5;

    setText(doc, TEXT);
    doc.setFont('helvetica', 'normal').setFontSize(9.5);
    if (result.rationaleKeys.length) {
      result.rationaleKeys.forEach((k) => {
        const ls = wrap(doc, '• ' + t(k), INNER_W - 5);
        ls.forEach((l, i) => doc.text(l, MARGIN_X, y + i * 4.5));
        y += ls.length * 4.5 + 1.5;
      });
    } else {
      setText(doc, MUTED);
      doc.text(t('rationale.fallback'), MARGIN_X, y);
      y += 5;
    }
    y += 3;

    // 30-day plan
    setText(doc, CYAN);
    doc.setFont('helvetica', 'bold').setFontSize(8.2);
    doc.text(t('pdf.section.plan'), MARGIN_X, y);
    setStroke(doc, ORANGE); doc.setLineWidth(0.8);
    y += 1.5;
    doc.line(MARGIN_X, y, PW - MARGIN_X, y);
    y += 5;

    const plan = plan30Days(result);
    setText(doc, TEXT);
    doc.setFont('helvetica', 'normal').setFontSize(9.5);
    plan.forEach((step, idx) => {
      setText(doc, ORANGE);
      doc.setFont('helvetica', 'bold').setFontSize(9.5);
      doc.text(t('pdf.week', { n: idx + 1 }), MARGIN_X, y);
      setText(doc, TEXT);
      doc.setFont('helvetica', 'normal');
      const ls = wrap(doc, step, INNER_W - 22);
      ls.forEach((l, i) => doc.text(l, MARGIN_X + 20, y + i * 4.5));
      y += Math.max(5, ls.length * 4.5) + 2;
    });

    // Inputs recap
    y += 4;
    setText(doc, CYAN);
    doc.setFont('helvetica', 'bold').setFontSize(8.2);
    doc.text(t('pdf.section.inputs'), MARGIN_X, y);
    setStroke(doc, ORANGE); doc.setLineWidth(0.8);
    y += 1.5;
    doc.line(MARGIN_X, y, PW - MARGIN_X, y);
    y += 5;

    setText(doc, MUTED);
    doc.setFont('helvetica', 'normal').setFontSize(8.5);
    const inputsText = summariseAnswers(answers);
    inputsText.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, MARGIN_X, y);
      doc.setFont('helvetica', 'normal');
      const ls = wrap(doc, val, INNER_W - 55);
      ls.forEach((l, i) => doc.text(l, MARGIN_X + 50, y + i * 4));
      y += Math.max(4, ls.length * 4) + 1;
    });

    drawFooter(doc);

    doc.save(t('pdf.filename'));
  }

  function plan30Days(result) {
    const tier = result.tier === 'high_article_6' ? 'high' : result.tier;
    const prefix = `plan.${tier}`;
    return [t(`${prefix}.w1`), t(`${prefix}.w2`), t(`${prefix}.w3`), t(`${prefix}.w4`)];
  }

  function summariseAnswers(answers) {
    const qs = window.EKM_getQuestions ? window.EKM_getQuestions(L()) : [];
    const rows = [];
    for (const q of qs) {
      const val = answers[q.id];
      if (val === undefined) continue;
      const label = `${q.id}:`;
      const display = Array.isArray(val) ? val.join(', ') : String(val);
      rows.push([label, display]);
    }
    return rows;
  }

  // ── Optional email-capture submit (Formspree or custom endpoint) ────────
  window.EKM_SubmitCapture = async function (payload) {
    const endpoint = window.EKM_CAPTURE_ENDPOINT;
    if (!endpoint) {
      return Promise.resolve({ ok: false, skipped: true });
    }
    const body = {
      email:    payload.email,
      company:  payload.company,
      tier:     payload.result?.tier,
      score:    payload.result?.score,
      triggered_categories: (payload.result?.triggeredAnnex || []).map((t) => t.category),
      gpai:     payload.result?.gpai,
      lang:     payload.lang || L(),
      submitted_at: new Date().toISOString(),
      source:   'app.ekmgc.de/quick-scan',
    };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Capture failed: ${res.status}`);
    return res.json().catch(() => ({ ok: true }));
  };

  window.EKM_BuildPdf = buildPdf;
})();
