/**
 * EU AI Act Quick Scan — internationalisation core.
 *
 * Single source of truth for every UI string the scan emits. Supported:
 *   - en (English)
 *   - de (Deutsch) — official EU AI Act terminology
 *
 * Language resolution order (highest priority first):
 *   1. ?lang=de | ?lang=en in the URL
 *   2. localStorage['ekm_lang']
 *   3. navigator.language starts with 'de' → 'de'
 *   4. fallback 'en'
 *
 * Every consumer reads strings via EKM_T(key, params?). Static pages of
 * content (questions, tier metadata, 30-day plans) keep both translations
 * inline keyed under .en / .de so they can be edited in one place.
 */
(function () {
  'use strict';

  const SUPPORTED = ['en', 'de'];
  const DEFAULT   = 'en';

  function detectLang() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('lang');
    if (fromUrl && SUPPORTED.includes(fromUrl)) return fromUrl;

    try {
      const stored = localStorage.getItem('ekm_lang');
      if (stored && SUPPORTED.includes(stored)) return stored;
    } catch { /* storage unavailable */ }

    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('de')) return 'de';

    return DEFAULT;
  }

  const STRINGS = {
    // ── Topbar / chrome ────────────────────────────────────────────────────
    'topbar.suffix':                     { en: 'AI Compliance',              de: 'KI-Compliance' },
    'topbar.daysSuffix':                 { en: 'days to 02.08.2026',         de: 'Tage bis 02.08.2026' },
    'topbar.langLabel':                  { en: 'Language',                   de: 'Sprache' },

    // ── Document head ──────────────────────────────────────────────────────
    'doc.title':                         { en: 'EU AI Act Quick Scan — EKM Global Consulting', de: 'EU AI Act Quick Scan — EKM Global Consulting' },
    'doc.description':                   {
      en: 'Free 10-minute EU AI Act risk scan. Know which Annex III categories apply to your company, what artefacts your board needs, and how many days remain to 02.08.2026 enforcement.',
      de: 'Kostenloser 10-Minuten-Risikoscan zur EU-KI-Verordnung. Erfahren Sie, welche Anhang-III-Kategorien auf Ihr Unternehmen zutreffen, welche Nachweise Ihr Vorstand braucht und wie viele Tage bis zum 02.08.2026 bleiben.',
    },
    'og.title':                          {
      en: 'EU AI Act Quick Scan — free 10-minute risk assessment',
      de: 'EU AI Act Quick Scan — kostenlose 10-Minuten-Risikoanalyse',
    },
    'og.description':                    {
      en: 'Know your Annex III exposure before 02.08.2026. Runs in your browser — no sign-up.',
      de: 'Kennen Sie Ihre Anhang-III-Exposition vor dem 02.08.2026. Läuft im Browser — ohne Anmeldung.',
    },

    // ── Intro view ─────────────────────────────────────────────────────────
    'intro.eyebrow':                     { en: 'EU AI Act Quick Scan',        de: 'EU AI Act Quick Scan' },
    'intro.title.a':                     { en: 'Know your Annex III exposure', de: 'Kennen Sie Ihre Anhang-III-Exposition' },
    'intro.title.accent':                { en: 'before',                      de: 'vor' },
    'intro.title.b':                     { en: 'enforcement.',                de: 'Inkrafttreten.' },
    'intro.subtitle':                    {
      en: "Fifteen questions. About ten minutes. Runs entirely in your browser — no sign-up, no data leaves this tab unless you ask for the PDF by email. You'll leave with a personalised risk tier, the specific deliverables your board needs, and a 30-day plan.",
      de: 'Fünfzehn Fragen. Etwa zehn Minuten. Läuft vollständig in Ihrem Browser — keine Anmeldung, keine Daten verlassen diesen Tab, es sei denn, Sie fordern das PDF per E-Mail an. Sie erhalten eine personalisierte Risikostufe, die konkreten Nachweise, die Ihr Vorstand braucht, und einen 30-Tage-Plan.',
    },
    'intro.fact.days':                   { en: 'days to 02.08.2026 enforcement',        de: 'Tage bis zum Inkrafttreten am 02.08.2026' },
    'intro.fact.penalty.num':            { en: 'EUR 35M',                                de: '35 Mio. EUR' },
    'intro.fact.penalty':                { en: 'or 7% global turnover — max penalty',    de: 'oder 7 % des weltweiten Umsatzes — max. Bußgeld' },
    'intro.fact.annex':                  { en: 'Annex III high-risk categories',         de: 'Anhang-III-Hochrisikokategorien' },
    'intro.fact.articles':               { en: 'articles govern most of your duties',    de: 'Artikel regeln den Großteil Ihrer Pflichten' },
    'intro.cta.start':                   { en: 'Start the 10-minute scan',               de: '10-Minuten-Scan starten' },
    'intro.cta.visit':                   { en: 'Visit EKM',                              de: 'EKM besuchen' },
    'intro.small':                       {
      en: 'The scan is a starting point, not legal advice. Your answers stay in this browser tab unless you explicitly submit your email. Built by',
      de: 'Der Scan ist ein Ausgangspunkt, keine Rechtsberatung. Ihre Antworten bleiben in diesem Browser-Tab, es sei denn, Sie geben Ihre E-Mail-Adresse explizit an. Erstellt von',
    },

    // ── Survey / question chrome ───────────────────────────────────────────
    'survey.step':                       { en: 'Step {n} of {total}',                    de: 'Schritt {n} von {total}' },
    'survey.back':                       { en: 'Back',                                   de: 'Zurück' },
    'survey.next':                       { en: 'Next',                                   de: 'Weiter' },
    'survey.finish':                     { en: 'See my result',                          de: 'Ergebnis anzeigen' },
    'survey.yes':                        { en: 'Yes',                                    de: 'Ja' },
    'survey.no':                         { en: 'No',                                     de: 'Nein' },
    'survey.unsure':                     { en: 'Not sure',                               de: 'Unsicher' },

    // ── Result view ────────────────────────────────────────────────────────
    'result.scoreUnit':                  { en: '/100 exposure',                          de: '/100 Exposition' },
    'result.deadline':                   { en: 'days to 02.08.2026 enforcement.',        de: 'Tage bis zum Inkrafttreten am 02.08.2026.' },
    'result.heading.triggered':          { en: 'Triggered Annex III categories',         de: 'Ausgelöste Anhang-III-Kategorien' },
    'result.heading.obligations':        { en: 'Required deliverables',                  de: 'Erforderliche Nachweise' },
    'result.heading.rationale':          { en: 'How we scored this',                     de: 'So haben wir bewertet' },
    'result.triggered.none':             { en: 'No Annex III categories triggered.',     de: 'Keine Anhang-III-Kategorien ausgelöst.' },
    'result.obligations.none':           {
      en: 'No high-risk obligations triggered — transparency duties under Article 50 may still apply.',
      de: 'Keine Hochrisiko-Pflichten ausgelöst — Transparenzpflichten nach Artikel 50 können weiterhin gelten.',
    },
    'result.capture.title':              { en: 'Get the 3-page board-ready report',      de: 'Den 3-seitigen vorstandsfertigen Bericht erhalten' },
    'result.capture.body':               {
      en: "We'll send the Annex III Cheat Sheet plus your personalised risk summary — no newsletter, no spam, just the PDF and Elshan's direct line.",
      de: 'Wir senden Ihnen das Anhang-III-Cheat-Sheet sowie Ihre persönliche Risikozusammenfassung — kein Newsletter, kein Spam, nur das PDF und Elshans Direktkontakt.',
    },
    'result.capture.email':              { en: 'work-email@company.com',                 de: 'arbeits-email@firma.de' },
    'result.capture.company':            { en: 'Company (optional)',                     de: 'Firma (optional)' },
    'result.capture.submit':             { en: 'Email me the PDF',                       de: 'PDF per E-Mail senden' },
    'result.capture.note':               {
      en: 'Prefer a direct conversation?',
      de: 'Lieber ein direktes Gespräch?',
    },
    'result.capture.noteLink':           { en: 'DM Elshan on LinkedIn',                  de: 'Elshan direkt auf LinkedIn anschreiben' },
    'result.capture.noteSuffix':         { en: 'with the subject line',                  de: 'mit dem Stichwort' },
    'result.capture.thanks':             {
      en: 'Thank you. The PDF is on its way to your inbox. Also downloading a copy now.',
      de: 'Vielen Dank. Das PDF ist unterwegs in Ihr Postfach. Eine Kopie wird gerade heruntergeladen.',
    },
    'result.capture.fail':               {
      en: 'Could not reach our server — but your PDF is downloading now.',
      de: 'Server nicht erreichbar — Ihr PDF wird trotzdem jetzt heruntergeladen.',
    },
    'result.download':                   { en: 'Download PDF now',                       de: 'PDF jetzt herunterladen' },
    'result.book':                       { en: 'Book a 30-min call',                     de: '30-Min-Gespräch buchen' },
    'result.restart':                    { en: 'Start over',                             de: 'Neu starten' },

    // ── Footer ─────────────────────────────────────────────────────────────
    'footer.disclaimer':                 {
      en: 'Informational summary of Regulation (EU) 2024/1689 — not legal advice.',
      de: 'Informative Zusammenfassung der Verordnung (EU) 2024/1689 — keine Rechtsberatung.',
    },

    // ── Tier metadata ──────────────────────────────────────────────────────
    'tier.out_of_scope.label':           { en: 'Out of scope',                           de: 'Nicht im Anwendungsbereich' },
    'tier.out_of_scope.intro':           { en: 'Based on your answers, the EU AI Act does not appear to apply.', de: 'Nach Ihren Angaben scheint die EU-KI-Verordnung nicht anwendbar zu sein.' },
    'tier.out_of_scope.detail':          { en: 'Keep monitoring — scope can change if you launch new AI systems or enter the EU market.', de: 'Weiter beobachten — der Anwendungsbereich kann sich ändern, sobald Sie neue KI-Systeme einführen oder in den EU-Markt eintreten.' },
    'tier.limited.label':                { en: 'Limited risk',                           de: 'Begrenztes Risiko' },
    'tier.limited.intro':                { en: 'You likely fall outside high-risk categories, but transparency duties still apply.', de: 'Sie fallen wahrscheinlich nicht in Hochrisikokategorien, Transparenzpflichten gelten dennoch.' },
    'tier.limited.detail':               { en: 'Article 50 transparency rules (disclosure to users, AI-generated content labelling) should still be covered.', de: 'Die Transparenzpflichten nach Artikel 50 (Offenlegung gegenüber Nutzern, Kennzeichnung KI-generierter Inhalte) sollten dennoch erfüllt sein.' },
    'tier.moderate.label':               { en: 'Moderate exposure',                      de: 'Mittlere Exposition' },
    'tier.moderate.intro':               { en: 'You have signals that could trigger high-risk obligations depending on exact use.', de: 'Es gibt Signale, die je nach konkreter Nutzung Hochrisiko-Pflichten auslösen können.' },
    'tier.moderate.detail':              { en: 'A focused scoping review in the next 30 days is the right move — before enforcement, not after.', de: 'Eine gezielte Scoping-Prüfung in den nächsten 30 Tagen ist der richtige Schritt — vor Inkrafttreten, nicht danach.' },
    'tier.high.label':                   { en: 'High risk',                              de: 'Hohes Risiko' },
    'tier.high.intro':                   { en: 'You have one or more clear high-risk AI systems in scope.', de: 'Sie haben ein oder mehrere eindeutige Hochrisiko-KI-Systeme im Anwendungsbereich.' },
    'tier.high.detail':                  { en: 'The full Article 8–15 obligation set applies. The 101-day window to enforcement is your critical path.', de: 'Der vollständige Pflichtenkatalog aus Artikel 8–15 gilt. Die verbleibende Frist bis zum Inkrafttreten ist Ihr kritischer Pfad.' },
    'tier.high_article_6.label':         { en: 'High risk via Annex I',                  de: 'Hohes Risiko über Anhang I' },
    'tier.high_article_6.intro':         { en: 'Your product falls under EU product-safety legislation with an AI safety component.', de: 'Ihr Produkt fällt unter EU-Produktsicherheitsrecht mit einer KI-Sicherheitskomponente.' },
    'tier.high_article_6.detail':        { en: 'Article 6(1) makes this high-risk regardless of Annex III. Conformity assessment + CE marking are mandatory.', de: 'Artikel 6 Absatz 1 stuft dies unabhängig von Anhang III als hochriskant ein. Konformitätsbewertung und CE-Kennzeichnung sind verpflichtend.' },

    // ── Annex III categories (shown in both UI and PDF) ────────────────────
    'annex.biometric':                   { en: 'Biometric identification & categorisation',              de: 'Biometrische Identifizierung & Kategorisierung' },
    'annex.infra':                       { en: 'Critical infrastructure',                                de: 'Kritische Infrastruktur' },
    'annex.education':                   { en: 'Education & vocational training',                         de: 'Bildung & Berufsbildung' },
    'annex.employment':                  { en: 'Employment & worker management',                          de: 'Beschäftigung & Mitarbeitermanagement' },
    'annex.services':                    { en: 'Essential private & public services',                     de: 'Wesentliche private & öffentliche Dienstleistungen' },
    'annex.law':                         { en: 'Law enforcement',                                         de: 'Strafverfolgung' },
    'annex.migration':                   { en: 'Migration, asylum & border control',                      de: 'Migration, Asyl & Grenzkontrolle' },
    'annex.justice':                     { en: 'Administration of justice & democratic processes',        de: 'Rechtspflege & demokratische Prozesse' },

    // ── Rationale keys (pushed by scoring.js) ──────────────────────────────
    'rationale.no_ai':                   { en: 'No AI systems in use — Article 2 scope does not apply.', de: 'Keine KI-Systeme im Einsatz — Anwendungsbereich nach Artikel 2 nicht eröffnet.' },
    'rationale.no_eu':                   { en: 'No EU market footprint — territorial scope under Article 2 does not apply.', de: 'Keine Präsenz im EU-Markt — räumlicher Anwendungsbereich nach Artikel 2 nicht eröffnet.' },
    'rationale.annex_i':                 { en: 'Annex I product-safety integration triggers Article 6(1) — high-risk regardless of Annex III.', de: 'Integration in ein Anhang-I-Produktsicherheitsprodukt löst Artikel 6 Absatz 1 aus — hohes Risiko unabhängig von Anhang III.' },
    'rationale.role.provider':           { en: 'As a provider you carry the full Article 16 obligation set.', de: 'Als Anbieter tragen Sie den vollständigen Pflichtenkatalog nach Artikel 16.' },
    'rationale.role.deployer':           { en: 'As a deployer you carry a lighter but still enforceable Article 26 obligation set.', de: 'Als Betreiber tragen Sie einen leichteren, aber dennoch durchsetzbaren Pflichtenkatalog nach Artikel 26.' },
    'rationale.role.distributor':        { en: 'Distributor obligations under Article 24 apply to every high-risk system you place.', de: 'Händlerpflichten nach Artikel 24 gelten für jedes von Ihnen bereitgestellte Hochrisiko-System.' },
    'rationale.gpai':                    { en: 'General-purpose AI use triggers the Article 51–55 transparency + copyright obligations.', de: 'Nutzung von KI-Modellen mit allgemeinem Verwendungszweck (GPAI) löst die Transparenz- und Urheberrechtspflichten nach Artikel 51–55 aus.' },
    'rationale.maturity_reduces':        { en: 'Existing programme maturity reduces residual risk.', de: 'Die bestehende Programmreife reduziert das Restrisiko.' },
    'rationale.no_programme':            { en: 'No documented programme — regulators look for evidence of good-faith effort.', de: 'Kein dokumentiertes Programm — Behörden erwarten Nachweise guten Willens und ernsthafter Bemühungen.' },
    'rationale.fallback':                { en: 'Score derived primarily from Annex III category matches.', de: 'Bewertung basiert primär auf Treffern in Anhang-III-Kategorien.' },

    // ── Obligation keys ────────────────────────────────────────────────────
    'obligation.annex_iv':               { en: 'Full technical documentation under Annex IV', de: 'Vollständige technische Dokumentation nach Anhang IV' },
    'obligation.ce_marking':             { en: 'Conformity assessment + CE marking (Article 43)', de: 'Konformitätsbewertung + CE-Kennzeichnung (Artikel 43)' },
    'obligation.post_market':            { en: 'Post-market monitoring plan (Article 72)', de: 'Plan zur Beobachtung nach dem Inverkehrbringen (Artikel 72)' },
    'obligation.risk_memo':              { en: 'Written risk-classification memo per AI system (Article 6)', de: 'Schriftliches Risikoklassifizierungs-Memo je KI-System (Artikel 6)' },
    'obligation.risk_register':          { en: 'Living risk-management register with named owner (Article 9)', de: 'Laufendes Risikomanagement-Register mit benannter verantwortlicher Person (Artikel 9)' },
    'obligation.data_governance':        { en: 'Data-governance policy + datasheets (Article 10)', de: 'Data-Governance-Richtlinie + Daten-Datenblätter (Artikel 10)' },
    'obligation.instructions':           { en: 'Instructions-for-use / model card for deployers (Article 13)', de: 'Gebrauchsanweisung / Model Card für Betreiber (Artikel 13)' },
    'obligation.oversight':              { en: 'Named human-oversight role + override procedure (Article 14)', de: 'Benannte Rolle für menschliche Aufsicht + Eingriffsverfahren (Artikel 14)' },
    'obligation.incident':               { en: 'Incident-response playbook + serious-incident reporting (Article 73)', de: 'Incident-Response-Playbook + Meldung schwerwiegender Vorfälle (Artikel 73)' },
    'obligation.transparency':           { en: 'Transparency disclosure to users (Article 50)', de: 'Transparenzhinweis für Nutzer (Artikel 50)' },
    'obligation.gpai_report':            { en: 'GPAI transparency report (Article 53)', de: 'GPAI-Transparenzbericht (Artikel 53)' },
    'obligation.gpai_copyright':         { en: 'Copyright compliance policy (Article 53(1)(c))', de: 'Urheberrechts-Compliance-Richtlinie (Artikel 53 Absatz 1 Buchstabe c)' },

    // ── PDF — headers + chrome ─────────────────────────────────────────────
    'pdf.filename':                      { en: 'EKM_AI_Act_QuickScan_Report.pdf',        de: 'EKM_AI_Act_QuickScan_Bericht.pdf' },
    'pdf.docTitle':                      { en: 'EKM Quick Scan — EU AI Act Risk Report', de: 'EKM Quick Scan — EU-KI-Risiko-Bericht' },
    'pdf.docSubject':                    { en: 'Personalised EU AI Act Risk Report',     de: 'Personalisierter EU-KI-Risiko-Bericht' },
    'pdf.page1.title':                   { en: 'EU AI Act — Your Quick Scan Result',     de: 'EU AI Act — Ihr Quick-Scan-Ergebnis' },
    'pdf.page1.subtitle':                { en: 'Personalised risk summary · Scored {date}', de: 'Personalisierte Risikozusammenfassung · Bewertet am {date}' },
    'pdf.page1.badge':                   { en: 'PAGE 1 / SUMMARY',                       de: 'SEITE 1 / ZUSAMMENFASSUNG' },
    'pdf.page2.title':                   { en: 'How We Scored This',                     de: 'So haben wir bewertet' },
    'pdf.page2.subtitle':                { en: 'Rationale, inputs, and what to do in the next 30 days', de: 'Begründung, Eingaben und die nächsten 30 Tage' },
    'pdf.page2.badge':                   { en: 'PAGE 2 / DETAIL',                        de: 'SEITE 2 / DETAILS' },
    'pdf.section.triggered':             { en: 'TRIGGERED ANNEX III CATEGORIES',          de: 'AUSGELÖSTE ANHANG-III-KATEGORIEN' },
    'pdf.section.deliverables':          { en: 'REQUIRED DELIVERABLES',                   de: 'ERFORDERLICHE NACHWEISE' },
    'pdf.section.rationale':             { en: 'SCORING RATIONALE',                       de: 'BEGRÜNDUNG DER BEWERTUNG' },
    'pdf.section.plan':                  { en: 'NEXT 30 DAYS — WHAT TO DO',              de: 'NÄCHSTE 30 TAGE — ZU TUN' },
    'pdf.section.inputs':                { en: 'YOUR INPUTS',                             de: 'IHRE EINGABEN' },
    'pdf.triggered.none':                { en: 'No Annex III category triggered — transparency duties under Article 50 may still apply.', de: 'Keine Anhang-III-Kategorie ausgelöst — Transparenzpflichten nach Artikel 50 können dennoch gelten.' },
    'pdf.deliverables.none':             { en: 'No high-risk obligations triggered.',     de: 'Keine Hochrisiko-Pflichten ausgelöst.' },
    'pdf.deadline':                      { en: '{n} days to 02.08.2026 enforcement.',    de: '{n} Tage bis zum Inkrafttreten am 02.08.2026.' },
    'pdf.nextStep.prefix':               { en: 'Next step:',                              de: 'Nächster Schritt:' },
    'pdf.nextStep.text':                 { en: 'DM Elshan Musayev on LinkedIn — subject BOARD — for a 30-min board-prep call.', de: 'Elshan Musayev auf LinkedIn anschreiben — Betreff BOARD — für ein 30-Min. Vorstands-Briefing.' },
    'pdf.week':                          { en: 'Week {n}',                                de: 'Woche {n}' },
    'pdf.footer.penalty':                { en: 'Penalty: up to EUR 35M  |  Deadline: 02.08.2026', de: 'Bußgeld: bis zu 35 Mio. EUR  |  Frist: 02.08.2026' },
    'pdf.footer.disclaimer':             { en: '© 2026 EKM Global Consulting GmbH. Informational summary of Regulation (EU) 2024/1689. Not legal advice.', de: '© 2026 EKM Global Consulting GmbH. Informative Zusammenfassung der Verordnung (EU) 2024/1689. Keine Rechtsberatung.' },
    'pdf.error':                         { en: 'Could not generate PDF — please refresh and try again.', de: 'PDF konnte nicht erstellt werden — bitte Seite neu laden und erneut versuchen.' },

    // ── 30-day plans — 4 tiers × 4 weeks ───────────────────────────────────
    'plan.out_of_scope.w1':              { en: 'Confirm no EU market activity is planned in the next 6 months. Keep this report as your audit trail.', de: 'Bestätigen Sie, dass in den nächsten 6 Monaten keine EU-Marktaktivität geplant ist. Bewahren Sie diesen Bericht als Audit-Trail auf.' },
    'plan.out_of_scope.w2':              { en: 'Set a quarterly reminder to re-run the scan if any vendor AI is introduced.', de: 'Richten Sie eine quartalsweise Erinnerung ein, um den Scan zu wiederholen, sobald KI-Lösungen von Anbietern eingeführt werden.' },
    'plan.out_of_scope.w3':              { en: 'Subscribe to EKM briefings at app.ekmgc.de so you catch regulatory changes early.', de: 'Abonnieren Sie EKM-Briefings auf app.ekmgc.de, um regulatorische Änderungen frühzeitig mitzubekommen.' },
    'plan.out_of_scope.w4':              { en: 'No further action required this month.', de: 'In diesem Monat sind keine weiteren Maßnahmen erforderlich.' },
    'plan.limited.w1':                   { en: 'Inventory every AI system or AI-enabled vendor product — one line per system, one named owner.', de: 'Erfassen Sie jedes KI-System und jedes KI-gestützte Anbieterprodukt — eine Zeile pro System, eine benannte verantwortliche Person.' },
    'plan.limited.w2':                   { en: 'Add the transparency disclosure required by Article 50 to any AI interaction with users.', de: 'Ergänzen Sie die nach Artikel 50 erforderliche Transparenzangabe an jeder KI-Interaktion mit Nutzern.' },
    'plan.limited.w3':                   { en: 'Draft a one-page AI policy covering GPAI use, data handling, and human-review checkpoints.', de: 'Entwerfen Sie eine einseitige KI-Richtlinie zu GPAI-Nutzung, Datenverarbeitung und menschlichen Prüfpunkten.' },
    'plan.limited.w4':                   { en: 'Store everything in a single shared folder. Regulators want evidence, not intent.', de: 'Speichern Sie alles in einem einzigen gemeinsamen Ordner. Behörden verlangen Nachweise, keine Absichtserklärungen.' },
    'plan.moderate.w1':                  { en: 'Inventory all AI systems and classify each against Annex III. Flag anything you are not sure about.', de: 'Erfassen Sie alle KI-Systeme und klassifizieren Sie jedes anhand von Anhang III. Markieren Sie alles, was unklar ist.' },
    'plan.moderate.w2':                  { en: 'Appoint a named owner for each high-risk candidate. Article 14 requires a human oversight role.', de: 'Benennen Sie für jedes Hochrisiko-Kandidatensystem eine verantwortliche Person. Artikel 14 verlangt eine menschliche Aufsichtsrolle.' },
    'plan.moderate.w3':                  { en: 'Stand up a risk register — risks, mitigations, review cadence, owner — and brief it to the exec team.', de: 'Richten Sie ein Risikoregister ein — Risiken, Maßnahmen, Prüfintervall, verantwortliche Person — und briefen Sie die Geschäftsleitung.' },
    'plan.moderate.w4':                  { en: 'Book a board-level checkpoint for the 02.08.2026 deadline. Plan gaps before they plan you.', de: 'Setzen Sie einen Vorstandstermin bis zur Frist 02.08.2026 an. Planen Sie Lücken, bevor sie Sie planen.' },
    'plan.high.w1':                      { en: 'Full AI system inventory with Annex III classification and named owner per system.', de: 'Vollständiges KI-System-Inventar mit Anhang-III-Klassifizierung und benannter verantwortlicher Person pro System.' },
    'plan.high.w2':                      { en: 'Stand up the Article 9 risk-management register + Article 10 data-governance policy v1.', de: 'Einrichtung des Risikomanagement-Registers nach Artikel 9 + Data-Governance-Richtlinie Version 1 nach Artikel 10.' },
    'plan.high.w3':                      { en: 'Draft instructions-for-use (Article 13) and the Article 14 human-oversight procedure for every high-risk system.', de: 'Entwurf von Gebrauchsanweisungen (Artikel 13) und des Verfahrens zur menschlichen Aufsicht (Artikel 14) für jedes Hochrisiko-System.' },
    'plan.high.w4':                      { en: 'Board briefing + external legal sign-off. Insurance and customer audits will demand both.', de: 'Vorstands-Briefing + externe juristische Freigabe. Versicherer und Kunden-Audits verlangen beides.' },
  };

  let currentLang = detectLang();

  /**
   * Resolve an i18n key to a localised string with optional {placeholder} substitution.
   * Falls back to English if the key is missing in the current language.
   */
  function t(key, params) {
    const entry = STRINGS[key];
    if (!entry) {
      console.warn('[i18n] missing key:', key);
      return key;
    }
    let out = entry[currentLang] || entry.en || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        out = out.replaceAll(`{${k}}`, String(v));
      }
    }
    return out;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    currentLang = lang;
    try { localStorage.setItem('ekm_lang', lang); } catch { /* ignore */ }
    document.documentElement.setAttribute('lang', lang);
    // Notify listeners so views can re-render
    window.dispatchEvent(new CustomEvent('ekm:lang-changed', { detail: { lang } }));
  }

  function getLang() { return currentLang; }

  window.EKM_T        = t;
  window.EKM_LANG     = getLang;
  window.EKM_SET_LANG = setLang;
  window.EKM_SUPPORTED_LANGS = SUPPORTED;

  // Set initial <html lang>
  document.documentElement.setAttribute('lang', currentLang);
})();
