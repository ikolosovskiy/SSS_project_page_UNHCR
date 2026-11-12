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
  const mobileNav = root.querySelector('.mobile-nav');
  const closeMenu = () => {
    if (!menu || !mobileNav) return;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Відкрити меню');
    mobileNav.hidden = true;
  };
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    mobileNav.hidden = !open;
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menu.focus();
    }
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
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
  updateScroll();
  const share = root.querySelector('.share-button');
  const feedback = root.querySelector('.share-feedback');
  const canonical = 'https://sss-ua.org/projects/pidtrymka-spromozhnosti-derzhavnykh-ustanov-ta-mistsevykh-hromad-u-zmitsnenni-systemy-sotsialnoho-zakhystu-v-ukraini-2026/';
  share.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Підтримка спроможності державних установ та місцевих громад у зміцненні системи соціального захисту в Україні', url: canonical });
      else { await navigator.clipboard.writeText(canonical); feedback.textContent = 'Посилання на проєкт скопійовано'; }
    } catch (error) {
      if (error.name !== 'AbortError') feedback.textContent = `Посилання на проєкт: ${canonical}`;
    }
  });
})();
