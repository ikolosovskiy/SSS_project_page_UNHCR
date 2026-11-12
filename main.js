(() => {
  const root = document.querySelector('.sss-project');
  if (!root) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Preserve final values in the HTML and for assistive technology.
  // A hidden sizing copy keeps each number's width stable while counting.
  if ('IntersectionObserver' in window && !motion.matches) {
    const running = new Map();
    const counters = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        counters.unobserve(entry.target);
        const element = entry.target;
        const finalText = element.textContent.trim();
        const finalValue = Number(finalText.replace(/\s/g, ''));
        if (!/^\d[\d\s]*$/.test(finalText) || !Number.isFinite(finalValue)) return;
        const accessible = document.createElement('span');
        accessible.className = 'counter-accessible';
        accessible.textContent = finalText;
        const sizing = document.createElement('span');
        sizing.className = 'counter-sizing';
        sizing.setAttribute('aria-hidden', 'true');
        sizing.textContent = finalText;
        const value = document.createElement('span');
        value.className = 'counter-value';
        value.setAttribute('aria-hidden', 'true');
        value.textContent = '0';
        element.classList.add('counter');
        element.replaceChildren(accessible, sizing, value);
        let frame;
        const finish = () => {
          cancelAnimationFrame(frame);
          value.textContent = finalText;
          running.delete(element);
        };
        if (motion.matches) { finish(); return; }
        running.set(element, finish);
        const start = performance.now();
        const tick = now => {
          const progress = Math.min(1, (now - start) / 1200);
          if (progress === 1 || motion.matches) { finish(); return; }
          const current = Math.round(finalValue * (1 - (1 - progress) ** 3));
          value.textContent = String(current).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      });
    }, { threshold: .5 });
    root.querySelectorAll('.results-grid b, .chapter-stats b, .portal-number').forEach(el => counters.observe(el));
    motion.addEventListener('change', () => {
      if (motion.matches) {
        counters.disconnect();
        running.forEach(finish => finish());
      }
    });
  }
  const menu = root.querySelector('.menu-toggle');
  const menuDialog = root.querySelector('.project-menu');
  let previousOverflow = '';
  const syncClosedMenu = () => {
    // Ignore a delayed close event if the dialog has already reopened.
    if (menuDialog.open) return;
    document.body.style.overflow = previousOverflow;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Відкрити меню сайту');
  };
  const closeMenu = () => {
    if (menuDialog?.open) {
      menuDialog.close();
      syncClosedMenu();
    }
  };
  menu?.addEventListener('click', () => {
    if (menuDialog.open) { closeMenu(); return; }
    previousOverflow = document.body.style.overflow;
    menuDialog.showModal();
    document.body.style.overflow = 'hidden';
    menu.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-label', 'Закрити меню сайту');
  });
  menuDialog?.addEventListener('close', syncClosedMenu);
  root.querySelector('.menu-close')?.addEventListener('click', closeMenu);
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menu.focus();
    }
  });
  root.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    closeMenu();
    if (target instanceof HTMLDetailsElement) target.open = true;
    target.scrollIntoView({ behavior: motion.matches || event.detail === 0 ? 'instant' : 'smooth', block: 'start' });
    history.replaceState(null, '', link.hash);
    if (event.detail === 0) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
  });
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('is-pending'); reveal.unobserve(entry.target); } });
    }, { threshold: .08 });
    root.querySelectorAll('[data-reveal]').forEach(element => {
      if (!motion.matches && element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('is-pending'); reveal.observe(element);
      }
    });
    motion.addEventListener('change', () => { if (motion.matches) root.querySelectorAll('.is-pending').forEach(el => el.classList.remove('is-pending')); });
  }
  const navLinks = [...root.querySelectorAll('.section-nav a')];
  const sections = navLinks.map(link => document.getElementById(link.hash.slice(1)));
  const progress = root.querySelector('.reading-progress');
  let scheduled = false;
  function updateScroll() {
    const offset = root.querySelector('.section-nav-shell').getBoundingClientRect().height + 140;
    let active = 0;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= offset) active = i; });
    navLinks.forEach((link, i) => { if (i === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    const rect = root.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - innerHeight)));
    progress.style.transform = `scaleX(${fraction})`;
    scheduled = false;
  }
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', updateScroll);
  root.querySelectorAll('details').forEach(details => details.addEventListener('toggle', updateScroll));
  const disclosureExpansion = new Map();
  const finishExpansion = (details, state) => {
    if (disclosureExpansion.get(details) !== state) return;
    disclosureExpansion.delete(details);
    details.open = state.wantOpen;
    details.style.height = '';
    details.style.overflow = '';
    state.animation?.cancel();
    details.querySelector('summary').setAttribute('aria-expanded', String(details.open));
    updateScroll();
  };
  root.querySelectorAll('details').forEach(details => {
    const summary = details.querySelector('summary');
    summary.addEventListener('click', event => {
      event.preventDefault();
      const previous = disclosureExpansion.get(details);
      const wantOpen = !(previous?.wantOpen ?? details.open);
      const from = details.getBoundingClientRect().height;
      previous?.animation?.cancel();
      disclosureExpansion.delete(details);
      details.style.height = '';
      details.style.overflow = '';
      summary.setAttribute('aria-expanded', String(wantOpen));
      if (motion.matches) { details.open = wantOpen; return; }
      details.open = true;
      const to = wantOpen ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
      details.style.height = from + 'px';
      details.style.overflow = 'hidden';
      const state = { wantOpen, animation: null };
      disclosureExpansion.set(details, state);
      state.animation = details.animate([
        { height: from + 'px' }, { height: to + 'px' }
      ], { duration: 680, easing: 'cubic-bezier(.25,.6,.25,1)', fill: 'forwards' });
      state.animation.finished.then(() => finishExpansion(details, state)).catch(() => {});
    });
    details.addEventListener('toggle', () => {
      const state = disclosureExpansion.get(details);
      if (!details.open && state) {
        disclosureExpansion.delete(details);
        state.animation?.cancel();
        details.style.height = '';
        details.style.overflow = '';
      }
    });
  });
  const disclosureAnimations = new Map();
  const stopDisclosureAnimation = details => {
    (disclosureAnimations.get(details) || []).forEach(animation => animation.cancel());
    disclosureAnimations.delete(details);
  };
  root.querySelectorAll('.story-details').forEach(details => {
    details.addEventListener('toggle', () => {
      stopDisclosureAnimation(details);
      if (!details.open || motion.matches) return;
      const paragraphs = details.querySelectorAll('.prose>p, .prose>ul, .prose>.portal-results, .story-gallery img');
      const animations = [...paragraphs].map((paragraph, index) => paragraph.animate([
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 480, delay: Math.min(index, 6) * 70, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }));
      disclosureAnimations.set(details, animations);
    });
  });
  if ('IntersectionObserver' in window && !motion.matches) {
    const disclosureCue = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('disclosure-cue');
          disclosureCue.unobserve(entry.target);
        }
      });
    }, { threshold: .7 });
    root.querySelectorAll('.story-details>summary').forEach(summary => disclosureCue.observe(summary));
  }
  motion.addEventListener('change', () => {
    if (motion.matches) {
      disclosureAnimations.forEach((_, details) => stopDisclosureAnimation(details));
      disclosureExpansion.forEach((state, details) => finishExpansion(details, state));
    }
  });
  updateScroll();
})();
