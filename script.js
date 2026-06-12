  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(r => io.observe(r));

  // Fallback: force-reveal everything after 2s in case observer never fires (iOS Safari + overflow-x bug)
  setTimeout(() => { reveals.forEach(r => r.classList.add('in')); }, 2000);

  // Hero entrance animation
  document.querySelectorAll('.hero-content > *, .hero-visual').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = `opacity .65s ease ${i * 0.13}s, transform .65s ease ${i * 0.13}s`;
    setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'none'; }, 100);
  });

  // Nav: solid glass once scrolled past the top of the hero + scroll progress hairline
  const navEl = document.querySelector('nav');
  const progressEl = document.querySelector('.scroll-progress');
  const onScroll = () => {
    navEl.classList.toggle('scrolled', window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressEl && max > 0) progressEl.style.width = (window.scrollY / max * 100) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scrollspy: highlight the nav link of the section in view
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const spyTargets = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  spyTargets.forEach(s => spy.observe(s));

  // KPI count-up on load
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const comma  = el.dataset.comma === 'true';
      const t0 = performance.now() + 600; // start after hero entrance
      const dur = 1400;
      const tick = (now) => {
        const p = Math.min(Math.max((now - t0) / dur, 0), 1);
        const eased = 1 - Math.pow(1 - p, 3);
        let val = Math.round(target * eased);
        if (comma) val = val.toLocaleString('en-US');
        el.textContent = prefix + val + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // Form submit →  WhatsApp
  function submitForm() {
    const name    = document.getElementById('fname').value.trim();
    const phone   = document.getElementById('fphone').value.trim();
    const company = document.getElementById('fcompany').value.trim();
    const industry= document.getElementById('findustry').value;
    const service = document.getElementById('fservice').value;
    const msg     = document.getElementById('fmsg').value.trim();

    if (!name || !phone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    const waText = encodeURIComponent(
      `Hi EastStar Analytics!\\n\\n` +
      `Name: ${name}\\nPhone: ${phone}\\nCompany: ${company || 'N/A'}\\n` +
      `Industry: ${industry || 'N/A'}\\nService: ${service || 'N/A'}\\n` +
      `Message: ${msg || 'N/A'}`
    );

    window.open(`https://wa.me/60138425529?text=${waText}`, '_blank');
    document.getElementById('form-success').style.display = 'block';
  }
