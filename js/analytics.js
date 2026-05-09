/**
 * EU AI Act Quick Scan — analytics helper.
 *
 * Forwards custom events to Plausible when the script tag has loaded.
 * Also honours UTM parameters in the URL so LinkedIn-post traffic can be
 * attributed back to the specific post id (use utm_content=post_043).
 *
 * Falls back to console.log in dev (when Plausible not present) so that
 * during local testing we can still see the event stream.
 */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const utm = {
    source:   params.get('utm_source')   || null,
    medium:   params.get('utm_medium')   || null,
    campaign: params.get('utm_campaign') || null,
    content:  params.get('utm_content')  || null,
    term:     params.get('utm_term')     || null,
  };

  // Persist UTM on first visit so event follow-ups carry the attribution.
  try {
    if (Object.values(utm).some(Boolean)) {
      sessionStorage.setItem('ekm_utm', JSON.stringify(utm));
    }
  } catch { /* sessionStorage might be unavailable in private mode */ }

  function getUtm() {
    try {
      const raw = sessionStorage.getItem('ekm_utm');
      return raw ? JSON.parse(raw) : utm;
    } catch { return utm; }
  }

  window.EKM_TRACK = function (eventName, props = {}) {
    const payload = Object.assign({}, props, getUtm());
    if (typeof window.plausible === 'function') {
      window.plausible(eventName, { props: payload });
    } else {
      // Dev / no-analytics fallback
      // eslint-disable-next-line no-console
      console.log('[analytics]', eventName, payload);
    }
  };

  // Fire a generic pageview+utm event on load (Plausible auto-pageview is on
  // by default; this gives us a parallel event with custom props).
  window.EKM_TRACK('scan_pageview');
})();
