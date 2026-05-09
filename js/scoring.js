/**
 * EU AI Act Quick Scan — scoring engine (language-neutral).
 *
 * Pure data in, pure data out. Zero UI strings live here — instead the
 * engine emits i18n KEYS that app.js/pdf.js resolve via EKM_T. This keeps
 * the scoring logic testable and the translations maintained in one place
 * (js/i18n.js).
 *
 * Input:  a plain object keyed by question id → user answer
 *          (strings for radio, arrays for checkbox, 'yes' | 'no' | 'unsure' for yesno)
 *
 * Output: {
 *   tier:             'out_of_scope' | 'limited' | 'moderate' | 'high' | 'high_article_6',
 *   score:            0..100,
 *   triggeredAnnex:   Array<{ id, annexKey, category }>,   // category resolved for current lang at emit time
 *   gpai:             boolean,
 *   annexIHighRisk:   boolean,
 *   obligationKeys:   Array<string>,                        // i18n keys — resolve with EKM_T
 *   rationaleKeys:    Array<string>,                        // i18n keys — resolve with EKM_T
 *   daysToDeadline:   number,
 * }
 */
(function () {
  'use strict';

  const ENFORCEMENT_DATE = new Date('2026-08-02T00:00:00Z');

  const ANNEX_QUESTION_IDS = [
    'annex_biometric',
    'annex_infra',
    'annex_education',
    'annex_employment',
    'annex_services',
    'annex_law',
    'annex_migration',
    'annex_justice',
  ];

  function daysToDeadline(from = new Date()) {
    const ms = ENFORCEMENT_DATE.getTime() - from.getTime();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  }

  function resolveAnnexCategory(annexKey) {
    return typeof window.EKM_T === 'function' ? window.EKM_T(annexKey) : annexKey;
  }

  function score(answers, questions) {
    const qs = questions || (window.EKM_getQuestions ? window.EKM_getQuestions() : []);
    const byId = Object.fromEntries(qs.map((q) => [q.id, q]));
    const get  = (id) => answers[id];

    const rationaleKeys  = [];
    const triggeredAnnex = [];
    const obligationKeys = new Set();
    let   total          = 0;

    // ── Hard scope gates ───────────────────────────────────────────────────
    if (get('role') === 'none') {
      return {
        tier: 'out_of_scope',
        score: 0,
        triggeredAnnex: [],
        gpai: false,
        annexIHighRisk: false,
        obligationKeys: [],
        rationaleKeys: ['rationale.no_ai'],
        daysToDeadline: daysToDeadline(),
      };
    }
    const market = get('market') || [];
    if (Array.isArray(market) && market.length && !market.includes('eu') && !market.includes('output')) {
      return {
        tier: 'out_of_scope',
        score: 0,
        triggeredAnnex: [],
        gpai: false,
        annexIHighRisk: false,
        obligationKeys: [],
        rationaleKeys: ['rationale.no_eu'],
        daysToDeadline: daysToDeadline(),
      };
    }

    // ── Annex III probes ───────────────────────────────────────────────────
    for (const qid of ANNEX_QUESTION_IDS) {
      const ans = get(qid);
      if (ans === 'yes') {
        const q = byId[qid];
        const annexKey = q?.annexKey || qid;
        triggeredAnnex.push({
          id: qid,
          annexKey,
          category: resolveAnnexCategory(annexKey),
        });
        total += 12;
      } else if (ans === 'unsure') {
        // Uncertainty counts as half-weight — still needs investigation.
        total += 6;
      }
    }

    // ── Annex I product-safety override ────────────────────────────────────
    const annexIHighRisk = get('annex_i') === 'yes';
    if (annexIHighRisk) {
      total += 25;
      rationaleKeys.push('rationale.annex_i');
      obligationKeys.add('obligation.annex_iv');
      obligationKeys.add('obligation.ce_marking');
      obligationKeys.add('obligation.post_market');
    }

    // ── Role weighting ─────────────────────────────────────────────────────
    if (get('role') === 'provider') {
      total += 10;
      rationaleKeys.push('rationale.role.provider');
    } else if (get('role') === 'deployer') {
      total += 3;
      rationaleKeys.push('rationale.role.deployer');
    } else if (get('role') === 'distributor') {
      total += 5;
      rationaleKeys.push('rationale.role.distributor');
    }

    // ── GPAI obligations ───────────────────────────────────────────────────
    const aiTypes = get('ai_types') || [];
    const gpai    = Array.isArray(aiTypes) && aiTypes.includes('gpai');
    if (gpai) {
      total += 8;
      rationaleKeys.push('rationale.gpai');
      obligationKeys.add('obligation.gpai_report');
      obligationKeys.add('obligation.gpai_copyright');
    }

    // ── Maturity adjustment (subtract up to 30) ────────────────────────────
    const maturityBonus = {
      running:  -18,
      partial:   -8,
      planning:   0,
      none:       5,
    }[get('maturity')] ?? 0;

    const governanceBonus = {
      board:   -12,
      dept:     -4,
      ad_hoc:    3,
      none:      6,
    }[get('governance')] ?? 0;

    total += maturityBonus + governanceBonus;
    if (maturityBonus < 0 || governanceBonus < 0) {
      rationaleKeys.push('rationale.maturity_reduces');
    }
    if (get('maturity') === 'none' || get('governance') === 'none') {
      rationaleKeys.push('rationale.no_programme');
    }

    // ── Core obligations if any Annex III or Annex I triggered ─────────────
    if (triggeredAnnex.length || annexIHighRisk) {
      obligationKeys.add('obligation.risk_memo');
      obligationKeys.add('obligation.risk_register');
      obligationKeys.add('obligation.data_governance');
      obligationKeys.add('obligation.instructions');
      obligationKeys.add('obligation.oversight');
      obligationKeys.add('obligation.incident');
    } else if (gpai) {
      obligationKeys.add('obligation.transparency');
    }

    // ── Clamp & tier ───────────────────────────────────────────────────────
    total = Math.max(0, Math.min(100, total));

    let tier;
    if (annexIHighRisk) tier = 'high_article_6';
    else if (total >= 60) tier = 'high';
    else if (total >= 30) tier = 'moderate';
    else tier = 'limited';

    // Tier floor: a company that objectively runs a high-risk AI system under
    // Annex III is still in high-risk territory even with a mature programme.
    const triggered = triggeredAnnex.length;
    if (triggered >= 1 && tier === 'limited')  tier = 'moderate';
    if (triggered >= 2 || (triggered >= 1 && get('role') === 'provider')) {
      if (tier === 'moderate') tier = 'high';
      if (tier === 'limited')  tier = 'high';
    }

    return {
      tier,
      score: total,
      triggeredAnnex,
      gpai,
      annexIHighRisk,
      obligationKeys: Array.from(obligationKeys),
      rationaleKeys,
      daysToDeadline: daysToDeadline(),
    };
  }

  /**
   * Visual tier metadata — colour is language-neutral, label/intro/detail
   * resolve via i18n at render time. Consumers call EKM_getTierMeta(tier)
   * to get the fully localised object.
   */
  const TIER_COLOUR = {
    out_of_scope:   '#4FD5E0',
    limited:        '#3EB489',
    moderate:       '#E8C72B',
    high:           '#E87722',
    high_article_6: '#C1272D',
  };

  function getTierMeta(tier) {
    const t = window.EKM_T || ((k) => k);
    return {
      color:  TIER_COLOUR[tier]   || '#4FD5E0',
      label:  t(`tier.${tier}.label`),
      intro:  t(`tier.${tier}.intro`),
      detail: t(`tier.${tier}.detail`),
    };
  }

  window.EKM_SCORE             = score;
  window.EKM_TIER_COLOUR       = TIER_COLOUR;
  window.EKM_getTierMeta       = getTierMeta;
  window.EKM_DAYS_TO_DEADLINE  = daysToDeadline;

  // Back-compat: old EKM_TIER_META used to be a plain object. Provide a
  // Proxy-like accessor so legacy code reading TIER_META[tier] keeps working.
  Object.defineProperty(window, 'EKM_TIER_META', {
    get() {
      const all = {};
      for (const tier of Object.keys(TIER_COLOUR)) all[tier] = getTierMeta(tier);
      return all;
    },
  });
})();
