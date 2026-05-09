/**
 * EU AI Act Quick Scan — bilingual question bank (EN/DE).
 *
 * Fifteen questions grouped into: scope (Q1–Q3), Annex III category probes
 * (Q4–Q11), Annex I product-safety cross-check (Q12), AI system types (Q13),
 * and compliance maturity (Q14–Q15).
 *
 * Each question carries `question.en`, `question.de`, `help.en`, `help.de`.
 * Option labels likewise. Annex categories resolve via i18n keys at render
 * time so PDF/UI stay in sync with the selected language.
 *
 * Access: window.EKM_getQuestions(lang?) returns a flat array with the
 * localised `question`, `help`, `options[].label`, and `annexCategory`
 * fields for the requested language.
 */
(function () {
  'use strict';

  const Q = [
    // ─── Scope ──────────────────────────────────────────────────────────────
    {
      id: 'role',
      group: 'scope',
      type: 'radio',
      question: {
        en: "What is your organisation's role with respect to AI systems?",
        de: 'Welche Rolle hat Ihre Organisation in Bezug auf KI-Systeme?',
      },
      help: {
        en: 'Article 3 of the EU AI Act defines providers, deployers, importers, distributors. Your role determines the obligation set.',
        de: 'Artikel 3 der EU-KI-Verordnung definiert Anbieter, Betreiber, Einführer und Händler. Ihre Rolle bestimmt den Pflichtenkatalog.',
      },
      options: [
        {
          value: 'provider',
          label: {
            en: 'We develop or place AI systems on the EU market (provider)',
            de: 'Wir entwickeln oder bringen KI-Systeme auf den EU-Markt (Anbieter)',
          },
        },
        {
          value: 'deployer',
          label: {
            en: 'We use third-party AI systems in our operations (deployer)',
            de: 'Wir nutzen KI-Systeme Dritter in unserem Betrieb (Betreiber)',
          },
        },
        {
          value: 'distributor',
          label: {
            en: 'We import or distribute AI systems in the EU',
            de: 'Wir importieren oder vertreiben KI-Systeme in der EU',
          },
        },
        {
          value: 'none',
          label: {
            en: "None of the above — we don't use any AI systems",
            de: 'Keines davon — wir nutzen keine KI-Systeme',
          },
        },
      ],
    },
    {
      id: 'market',
      group: 'scope',
      type: 'checkbox',
      question: {
        en: 'Where is your AI system used or whose output reaches the EU?',
        de: 'Wo wird Ihr KI-System eingesetzt oder wessen Ausgaben erreichen die EU?',
      },
      help: {
        en: 'Article 2 applies the AI Act to anyone whose AI output is used in the EU — not only EU-based companies.',
        de: 'Artikel 2 erstreckt die KI-Verordnung auf alle, deren KI-Ausgaben in der EU genutzt werden — nicht nur auf in der EU ansässige Unternehmen.',
      },
      options: [
        {
          value: 'eu',
          label: {
            en: 'Inside the EU (including DACH)',
            de: 'Innerhalb der EU (einschließlich DACH)',
          },
        },
        {
          value: 'output',
          label: {
            en: 'Outside the EU, but the output is used inside the EU',
            de: 'Außerhalb der EU, aber die Ausgabe wird innerhalb der EU genutzt',
          },
        },
        {
          value: 'none',
          label: {
            en: 'Neither — no EU footprint',
            de: 'Weder noch — keine EU-Präsenz',
          },
        },
      ],
    },
    {
      id: 'size',
      group: 'scope',
      type: 'radio',
      question: {
        en: 'How many people does your organisation employ?',
        de: 'Wie viele Mitarbeitende beschäftigt Ihre Organisation?',
      },
      help: {
        en: "Size doesn't change scope, but it does affect what a defensible compliance programme looks like.",
        de: 'Die Größe ändert den Anwendungsbereich nicht, beeinflusst aber, wie ein belastbares Compliance-Programm auszusehen hat.',
      },
      options: [
        { value: 'xs', label: { en: 'Fewer than 50',        de: 'Weniger als 50' } },
        { value: 's',  label: { en: '50–250',               de: '50–250' } },
        { value: 'm',  label: { en: '250–1,000',            de: '250–1.000' } },
        { value: 'l',  label: { en: 'More than 1,000',      de: 'Mehr als 1.000' } },
      ],
    },

    // ─── Annex III probes ───────────────────────────────────────────────────
    {
      id: 'annex_biometric',
      group: 'annex_iii',
      annexKey: 'annex.biometric',
      type: 'yesno',
      question: {
        en: 'Do you use AI for biometric identification, categorisation, or emotion recognition?',
        de: 'Setzen Sie KI zur biometrischen Identifizierung, Kategorisierung oder Emotionserkennung ein?',
      },
      help: {
        en: 'Examples: face recognition at factory gates, voice authentication, emotion analysis in video interviews, behavioural biometrics for fraud.',
        de: 'Beispiele: Gesichtserkennung an Werkstoren, Stimmauthentifizierung, Emotionsanalyse in Video-Interviews, Verhaltensbiometrie zur Betrugserkennung.',
      },
    },
    {
      id: 'annex_infra',
      group: 'annex_iii',
      annexKey: 'annex.infra',
      type: 'yesno',
      question: {
        en: 'Is AI a safety component of critical infrastructure you operate or supply?',
        de: 'Ist KI eine Sicherheitskomponente kritischer Infrastruktur, die Sie betreiben oder liefern?',
      },
      help: {
        en: '"Safety component" means the system\u2019s failure would cause a safety incident. Covers energy grids, water supply, gas, road or rail traffic, digital infrastructure.',
        de: '„Sicherheitskomponente" bedeutet, dass ein Ausfall des Systems einen Sicherheitsvorfall auslösen würde. Umfasst Stromnetze, Wasserversorgung, Gas, Straßen- oder Schienenverkehr, digitale Infrastruktur.',
      },
    },
    {
      id: 'annex_education',
      group: 'annex_iii',
      annexKey: 'annex.education',
      type: 'yesno',
      question: {
        en: 'Do you use AI to decide admissions, score students, or monitor exams?',
        de: 'Nutzen Sie KI, um über Zulassungen zu entscheiden, Lernende zu bewerten oder Prüfungen zu überwachen?',
      },
      help: {
        en: 'Includes AI essay scoring, proctoring tools, learner assignment, drop-out risk prediction in schools and vocational programmes.',
        de: 'Umfasst KI-gestützte Aufsatzbewertung, Proctoring-Tools, Lernendenzuweisung, Abbruchrisiko-Prognosen in Schulen und Berufsbildungsprogrammen.',
      },
    },
    {
      id: 'annex_employment',
      group: 'annex_iii',
      annexKey: 'annex.employment',
      type: 'yesno',
      question: {
        en: 'Do you use AI in hiring, performance review, task allocation, or termination decisions?',
        de: 'Nutzen Sie KI bei Einstellung, Leistungsbeurteilung, Aufgabenverteilung oder Kündigungsentscheidungen?',
      },
      help: {
        en: 'Includes ATS CV ranking, video-interview sentiment analysis, productivity scoring, shift-assignment optimisation, promotion or termination recommendations.',
        de: 'Umfasst ATS-Lebenslauf-Ranking, Stimmungsanalyse in Video-Interviews, Produktivitäts-Scoring, Schichtplanung, Empfehlungen zu Beförderungen oder Kündigungen.',
      },
    },
    {
      id: 'annex_services',
      group: 'annex_iii',
      annexKey: 'annex.services',
      type: 'yesno',
      question: {
        en: 'Do you use AI for creditworthiness, insurance risk, social benefits, or emergency triage?',
        de: 'Nutzen Sie KI für Kreditwürdigkeit, Versicherungsrisiko, Sozialleistungen oder Notfall-Triage?',
      },
      help: {
        en: 'Includes credit scoring, lending decisions, life or health insurance underwriting, fraud detection for public benefits, emergency call-centre triage.',
        de: 'Umfasst Kredit-Scoring, Kreditentscheidungen, Underwriting für Lebens- oder Krankenversicherungen, Betrugserkennung bei Sozialleistungen, Triage in Notrufzentralen.',
      },
    },
    {
      id: 'annex_law',
      group: 'annex_iii',
      annexKey: 'annex.law',
      type: 'yesno',
      question: {
        en: 'Do you supply AI systems to law-enforcement authorities?',
        de: 'Liefern Sie KI-Systeme an Strafverfolgungsbehörden?',
      },
      help: {
        en: 'Risk assessment of natural persons, polygraph-like emotion analysis, evidence reliability, profiling during investigations. Rare for commercial deployers.',
        de: 'Risikobewertung natürlicher Personen, polygraphische Emotionsanalyse, Beweiswürdigung, Profiling bei Ermittlungen. Bei kommerziellen Betreibern selten.',
      },
    },
    {
      id: 'annex_migration',
      group: 'annex_iii',
      annexKey: 'annex.migration',
      type: 'yesno',
      question: {
        en: 'Do you supply AI for migration, asylum, or border-control decisions?',
        de: 'Liefern Sie KI für Entscheidungen im Bereich Migration, Asyl oder Grenzkontrolle?',
      },
      help: {
        en: 'Document-authenticity AI, risk scoring for visa or asylum applications. Typically relevant to gov-tech vendors.',
        de: 'KI zur Dokumentenechtheit, Risiko-Scoring bei Visum- oder Asylanträgen. In der Regel relevant für Gov-Tech-Anbieter.',
      },
    },
    {
      id: 'annex_justice',
      group: 'annex_iii',
      annexKey: 'annex.justice',
      type: 'yesno',
      question: {
        en: 'Do you supply AI used in judicial research, court decisions, or election processes?',
        de: 'Liefern Sie KI für juristische Recherche, Gerichtsentscheidungen oder Wahlprozesse?',
      },
      help: {
        en: 'Case-law retrieval that materially influences judicial reasoning, tools that influence voter behaviour in elections.',
        de: 'Rechtsprechungs-Recherche mit materiellem Einfluss auf richterliche Begründungen, Werkzeuge, die Wählerverhalten bei Wahlen beeinflussen.',
      },
    },

    // ─── Annex I cross-check ────────────────────────────────────────────────
    {
      id: 'annex_i',
      group: 'annex_i',
      type: 'yesno',
      question: {
        en: 'Is the AI embedded in a product covered by EU product-safety legislation (Annex I)?',
        de: 'Ist die KI in ein Produkt eingebettet, das unter EU-Produktsicherheitsrecht (Anhang I) fällt?',
      },
      help: {
        en: 'Medical devices, machinery, toys, lifts, recreational craft, radio equipment, in-vitro diagnostics, civil aviation. If the product itself needs CE marking under Annex I, any AI safety component is high-risk under Article 6(1).',
        de: 'Medizinprodukte, Maschinen, Spielzeug, Aufzüge, Sportboote, Funkanlagen, In-vitro-Diagnostika, zivile Luftfahrt. Wenn das Produkt selbst nach Anhang I CE-kennzeichnungspflichtig ist, gilt jede KI-Sicherheitskomponente nach Artikel 6 Absatz 1 als hochriskant.',
      },
    },

    // ─── AI stack in use ────────────────────────────────────────────────────
    {
      id: 'ai_types',
      group: 'ai_stack',
      type: 'checkbox',
      question: {
        en: 'Which types of AI do you currently use or plan to deploy?',
        de: 'Welche Arten von KI nutzen Sie derzeit oder planen Sie einzusetzen?',
      },
      help: {
        en: 'Select all that apply. General-purpose AI (foundation models, LLMs) triggers an additional obligation set under Articles 51–55.',
        de: 'Mehrfachauswahl möglich. KI mit allgemeinem Verwendungszweck (Foundation Models, LLMs) löst zusätzliche Pflichten nach den Artikeln 51–55 aus.',
      },
      options: [
        {
          value: 'vendor',
          label: {
            en: 'Third-party vendor AI (SaaS, embedded in tools we buy)',
            de: 'KI von Drittanbietern (SaaS, in eingekauften Tools eingebettet)',
          },
        },
        {
          value: 'inhouse',
          label: {
            en: 'In-house developed AI or ML models',
            de: 'Intern entwickelte KI- oder ML-Modelle',
          },
        },
        {
          value: 'gpai',
          label: {
            en: 'General-purpose AI / foundation models / LLMs',
            de: 'KI mit allgemeinem Verwendungszweck / Foundation Models / LLMs',
          },
        },
        { value: 'none', label: { en: 'None of these', de: 'Nichts davon' } },
      ],
    },

    // ─── Maturity ───────────────────────────────────────────────────────────
    {
      id: 'maturity',
      group: 'maturity',
      type: 'radio',
      question: {
        en: 'Where is your AI Act compliance programme today?',
        de: 'Wo steht Ihr Compliance-Programm zur KI-Verordnung heute?',
      },
      help: {
        en: 'Regulators will ask for documented evidence. "Started" means you have a written risk register, not just an intent.',
        de: 'Behörden verlangen dokumentierte Nachweise. „Begonnen" bedeutet, dass ein schriftliches Risikoregister vorliegt — nicht nur eine Absicht.',
      },
      options: [
        {
          value: 'running',
          label: {
            en: 'Full programme running — inventory, risk register, responsible owner',
            de: 'Vollständiges Programm läuft — Inventar, Risikoregister, verantwortliche Person',
          },
        },
        {
          value: 'partial',
          label: {
            en: 'Partial — some work started, not all high-risk systems covered',
            de: 'Teilweise — Arbeiten begonnen, aber nicht alle Hochrisiko-Systeme abgedeckt',
          },
        },
        {
          value: 'planning',
          label: {
            en: 'Planning — nothing documented yet',
            de: 'Planungsphase — noch nichts dokumentiert',
          },
        },
        { value: 'none', label: { en: 'Not started', de: 'Noch nicht begonnen' } },
      ],
    },
    {
      id: 'governance',
      group: 'maturity',
      type: 'radio',
      question: {
        en: 'How visible is AI compliance at board level?',
        de: 'Wie sichtbar ist KI-Compliance auf Vorstandsebene?',
      },
      help: {
        en: 'Article 14 requires a designated human-oversight role. Boards and insurers will ask who that is.',
        de: 'Artikel 14 verlangt eine benannte Rolle für menschliche Aufsicht. Vorstände und Versicherer werden fragen, wer diese Person ist.',
      },
      options: [
        {
          value: 'board',
          label: {
            en: 'Named owner and regular board reporting',
            de: 'Benannte verantwortliche Person und regelmäßiges Vorstands-Reporting',
          },
        },
        {
          value: 'dept',
          label: {
            en: 'Owned at department level (compliance, legal, risk)',
            de: 'Auf Abteilungsebene verankert (Compliance, Recht, Risiko)',
          },
        },
        {
          value: 'ad_hoc',
          label: {
            en: 'Ad-hoc, no named owner',
            de: 'Ad-hoc, keine benannte verantwortliche Person',
          },
        },
        { value: 'none', label: { en: 'No visibility at all', de: 'Keinerlei Sichtbarkeit' } },
      ],
    },
  ];

  /**
   * Return the question bank resolved to the requested language.
   * Each question carries flat string fields (question, help, options[].label,
   * annexCategory) in the chosen language so renderers don't need i18n
   * lookups per question.
   */
  function getQuestions(lang) {
    const L = (window.EKM_SUPPORTED_LANGS || ['en', 'de']).includes(lang)
      ? lang
      : (window.EKM_LANG ? window.EKM_LANG() : 'en');

    return Q.map((q) => {
      const resolved = {
        id:       q.id,
        group:    q.group,
        type:     q.type,
        question: q.question[L] || q.question.en,
        help:     q.help?.[L] || q.help?.en,
      };
      if (q.annexKey) {
        resolved.annexKey      = q.annexKey;
        resolved.annexCategory = (window.EKM_T ? window.EKM_T(q.annexKey) : q.annexKey);
      }
      if (q.options) {
        resolved.options = q.options.map((o) => ({
          value: o.value,
          label: o.label[L] || o.label.en,
        }));
      }
      return resolved;
    });
  }

  window.EKM_getQuestions = getQuestions;
  // Back-compat: expose a default-language snapshot so existing callers
  // that read window.EKM_QUESTIONS don't break before they're upgraded.
  Object.defineProperty(window, 'EKM_QUESTIONS', {
    get: () => getQuestions(),
  });
})();
