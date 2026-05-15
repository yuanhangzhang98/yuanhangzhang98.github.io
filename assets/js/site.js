/* ===========================================================================
   site.js — scroll reveals, papers filter, year stamp.
   --------------------------------------------------------------------------- */

(function () {
  // ---- scroll reveals ----------------------------------------------------
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- last-updated stamp ------------------------------------------------
  const stamp = document.querySelector('[data-last-updated]');
  if (stamp) {
    const d = new Date(document.lastModified || Date.now());
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    stamp.textContent = `${yyyy}-${mm}-${dd}`;
  }

  // ---- papers filter (papers page only) ----------------------------------
  const chips = document.querySelectorAll('.filter-chip');
  if (chips.length) {
    const papers = document.querySelectorAll('.papers-page .paper');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const tag = chip.dataset.tag;
        chips.forEach((c) => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
        papers.forEach((p) => {
          if (tag === 'all') { p.hidden = false; return; }
          const tags = (p.dataset.tags || '').split(' ');
          p.hidden = !tags.includes(tag);
        });
        // hide empty year-groups
        document.querySelectorAll('.papers-page .year-group').forEach((g) => {
          const visible = Array.from(g.querySelectorAll('.paper')).some((p) => !p.hidden);
          g.hidden = !visible;
        });
      });
    });
  }
})();
