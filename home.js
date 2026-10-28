/* ═══════════════════════════════════════════════════════════
   EASTSTAR ANALYTICS — FLAGSHIP HOME ENGINE
   three.js fields · GSAP ScrollTrigger · Lenis · cursor · media
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobile     = window.matchMedia('(max-width: 900px)').matches;

  /* ───────── 0. MEDIA FALLBACK DETECTION ───────── */
  // Any [data-media] whose <img>/<video> fails to load reveals its .media-fallback.
  document.querySelectorAll('[data-media]').forEach(function (wrap) {
    const img = wrap.querySelector('img');
    const video = wrap.querySelector('video');
    if (img) {
      if (img.complete && !img.naturalWidth) wrap.classList.add('is-missing');
      img.addEventListener('load', function () { wrap.classList.remove('is-missing'); });
      img.addEventListener('error', function () { wrap.classList.add('is-missing'); });
    }
    if (video) {
      const src = video.querySelector('source');
      const miss = function () { wrap.classList.add('is-missing'); };
      video.addEventListener('error', miss);
      if (src) src.addEventListener('error', miss);
      video.addEventListener('loadeddata', function () { wrap.classList.remove('is-missing'); });
      // NETWORK_NO_SOURCE === 3 → the file 404'd / is absent
      setTimeout(function () { if (video.networkState === 3) miss(); }, 1800);
    }
  });

  /* ───────── 1. THREE.JS PARTICLE FIELD ───────── */
  function buildField(canvas, opts) {
    if (!canvas || reduceMotion || typeof THREE === 'undefined') return null;
    opts = opts || {};
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 60;

    const sprite = (function () {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, 'rgba(255,255,255,0.9)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.beginPath(); x.arc(32, 32, 32, 0, Math.PI * 2); x.fill();
      const t = new THREE.Texture(c); t.needsUpdate = true; return t;
    })();

    const COUNT = opts.count || (isMobile ? 900 : 2200);
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const gold = new THREE.Color(0xD4A017);
    const cream = new THREE.Color(0xF4F1EA);
    const spread = opts.spread || 150;
    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * spread;
      pos[i*3+1] = (Math.random() - 0.5) * spread;
      pos[i*3+2] = (Math.random() - 0.5) * spread;
      const c = Math.random() < 0.32 ? gold : cream;
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: opts.size || 0.7, map: sprite, vertexColors: true, transparent: true, opacity: opts.opacity || 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let emblem = null;
    if (opts.emblem) {
      new THREE.TextureLoader().load('logo-mark.png', function (tex) {
        const s = isMobile ? 30 : 46;
        const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: isMobile ? 0.32 : 0.44, depthWrite: false });
        emblem = new THREE.Mesh(new THREE.PlaneGeometry(s, s), m);
        emblem.position.z = 20;
        scene.add(emblem);
      });
    }

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    function onMove(e) {
      const t = e.touches ? e.touches[0] : e;
      mouse.tx = (t.clientX / window.innerWidth - 0.5);
      mouse.ty = (t.clientY / window.innerHeight - 0.5);
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });

    function resize() {
      const r = canvas.getBoundingClientRect();
      const w = r.width || window.innerWidth, h = r.height || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();

    let raf, t0 = performance.now(), running = true;
    function tick(now) {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const t = (now - t0) * 0.001;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      points.rotation.y = t * 0.04 + mouse.x * 0.5;
      points.rotation.x = t * 0.02 + mouse.y * 0.3;
      if (emblem) {
        emblem.rotation.y = Math.sin(t * 0.4) * 0.35 + mouse.x * 0.6;
        emblem.rotation.x = mouse.y * -0.4;
        emblem.position.y = Math.sin(t * 0.6) * 1.6;
      }
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { running = e.isIntersecting; if (running) { t0 = performance.now() - 1; raf = requestAnimationFrame(tick); } });
    }, { threshold: 0 });
    io.observe(canvas);

    return { resize: resize };
  }

  const heroField = buildField(document.getElementById('heroCanvas'), { emblem: true, count: isMobile ? 1100 : 2600, size: 0.8 });
  const contactField = buildField(document.getElementById('contactCanvas'), { count: isMobile ? 700 : 1500, size: 0.6, opacity: 0.7, spread: 120 });
  window.addEventListener('resize', function () { heroField && heroField.resize(); contactField && contactField.resize(); });

  /* ───────── 2. PRELOADER ───────── */
  const preloader = document.getElementById('preloader');
  const preCount = document.getElementById('preCount');
  const preBar = document.getElementById('preBarFill');
  const preSkip = document.getElementById('preSkip');
  let preDone = false;

  function finishPreloader() {
    if (preDone) return; preDone = true;
    if (window.gsap) {
      gsap.to(preloader, { yPercent: -100, duration: 1, ease: 'power4.inOut', onComplete: function () { preloader.style.display = 'none'; document.body.classList.add('loaded'); } });
      startHeroIntro();
    } else {
      preloader.style.display = 'none'; document.body.classList.add('loaded'); startHeroIntro();
    }
  }
  (function runCounter() {
    if (reduceMotion) { preCount.textContent = '100'; preBar.style.width = '100%'; setTimeout(finishPreloader, 200); return; }
    let n = 0;
    const iv = setInterval(function () {
      n += Math.floor(Math.random() * 8) + 3;
      if (n >= 100) { n = 100; clearInterval(iv); setTimeout(finishPreloader, 380); }
      preCount.textContent = n; preBar.style.width = n + '%';
    }, 90);
  })();
  preSkip.addEventListener('click', finishPreloader);

  // Failsafe: never let the preloader trap the page if rAF/GSAP stalls or fails to load.
  setTimeout(function () {
    if (preloader && getComputedStyle(preloader).display !== 'none') {
      preDone = true;
      preloader.style.display = 'none';
      document.body.classList.add('loaded');
    }
    document.querySelectorAll('.hero-title .word, [data-fade]').forEach(function (el) {
      el.style.opacity = '1'; el.style.transform = 'none';
    });
  }, 5000);

  /* ───────── 3. LENIS + SCROLLTRIGGER ───────── */
  let lenis = null;
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis && !reduceMotion) {
      lenis = new Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ───────── 4. HERO INTRO ───────── */
  function startHeroIntro() {
    if (!window.gsap) return;
    if (reduceMotion) { gsap.set(['.hero-title .word', '[data-fade]'], { opacity: 1, y: 0 }); return; }
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .from('.hero-title .word', { yPercent: 120, duration: 1, stagger: 0.06 })
      .from('[data-fade]', { y: 26, opacity: 0, duration: 0.9, stagger: 0.1 }, '-=0.6')
      .from('.exp-nav', { y: -30, opacity: 0, duration: 0.8 }, '-=0.9');
  }

  /* ───────── 5. SCROLL-DRIVEN ANIMATIONS ───────── */
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    const nav = document.getElementById('expNav');
    const rail = document.getElementById('scrollRailFill');
    ScrollTrigger.create({ start: 'top -80', end: 99999, onUpdate: function (self) { nav.classList.toggle('shrink', self.scroll() > 80); } });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) { rail.style.width = (self.progress * 100) + '%'; } });

    gsap.utils.toArray('.sec-title').forEach(function (el) {
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, { y: 36, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // SERVICES horizontal scroll (desktop)
    const track = document.getElementById('servicesTrack');
    const pin = document.getElementById('servicesPin');
    if (track && pin && !isMobile) {
      const amount = function () { return track.scrollWidth - window.innerWidth + 80; };
      gsap.to(track, { x: function () { return -amount(); }, ease: 'none',
        scrollTrigger: { trigger: '.services', start: 'top top', end: function () { return '+=' + amount(); }, pin: pin, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    }

    // SHOWREEL scroll-scale
    const reelMedia = document.querySelector('.reel-media');
    if (reelMedia) {
      gsap.fromTo(reelMedia, { scale: 0.86 }, { scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.reel-stage', start: 'top 90%', end: 'top 25%', scrub: 1 } });
    }

    // WORK: masked image reveals + stat count-ups
    gsap.utils.toArray('[data-shot]').forEach(function (fig) {
      const media = fig.querySelector('.shot-media');
      gsap.from(media, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: fig, start: 'top 86%' } });
      gsap.from(fig.querySelectorAll('img'), { scale: 1.3, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: fig, start: 'top 86%' } });
    });

    const whyMedia = document.querySelector('.why-media');
    if (whyMedia) {
      gsap.from(whyMedia, { clipPath: 'inset(100% 0 0 0)', duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: whyMedia, start: 'top 85%' } });
      gsap.from(whyMedia.querySelectorAll('img'), { scale: 1.25, duration: 1.5, ease: 'power3.out', scrollTrigger: { trigger: whyMedia, start: 'top 85%' } });
    }

    gsap.utils.toArray('[data-stat]').forEach(function (el) {
      const span = el.querySelector('[data-count]');
      const target = parseFloat(span.dataset.count);
      const prefix = span.dataset.prefix || '';
      const suffix = span.dataset.suffix || '';
      const obj = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: function () {
        gsap.from(el, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' });
        gsap.to(obj, { v: target, duration: 1.8, ease: 'power2.out', onUpdate: function () { span.textContent = prefix + Math.round(obj.v) + suffix; } });
      } });
    });

    gsap.from('.contact-title .cl', { yPercent: 110, opacity: 0, duration: 1, stagger: 0.12, ease: 'power4.out', scrollTrigger: { trigger: '.contact', start: 'top 60%' } });
    gsap.to('.hero-grid', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ───────── 6. SHOWREEL PLAYBACK ───────── */
  (function () {
    const stage = document.getElementById('reelStage');
    const video = document.getElementById('reelVideo');
    const play = document.getElementById('reelPlay');
    if (!stage || !video || !play) return;
    const wrap = video.closest('[data-media]');
    function hidePlayIfMissing() { if (wrap && wrap.classList.contains('is-missing')) play.style.display = 'none'; }
    setTimeout(hidePlayIfMissing, 1900);
    play.addEventListener('click', function () {
      if (wrap && wrap.classList.contains('is-missing')) return;
      video.muted = false;
      const p = video.play();
      if (p && p.catch) p.catch(function () { video.muted = true; video.play(); });
      stage.classList.add('is-playing');
    });
    video.addEventListener('click', function () {
      if (video.paused) { video.play(); stage.classList.add('is-playing'); }
      else { video.pause(); stage.classList.remove('is-playing'); }
    });
    video.addEventListener('pause', function () { stage.classList.remove('is-playing'); });
  })();

  // hero reel accent: autoplay muted loop when present
  (function () {
    const v = document.querySelector('.hero-reel-video');
    if (!v || reduceMotion) return;
    const tryPlay = function () { const p = v.play(); if (p && p.catch) p.catch(function () {}); };
    v.addEventListener('loadeddata', tryPlay);
    tryPlay();
  })();

  /* ───────── 7. CURSOR + MAGNETIC ───────── */
  if (finePointer && !reduceMotion && window.gsap) {
    const cursor = document.getElementById('cursor');
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    const label = cursor.querySelector('.cursor-label');
    const xs = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3' }), ys = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3' });
    const xr = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), yr = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    const xl = gsap.quickTo(label, 'x', { duration: 0.45, ease: 'power3' }), yl = gsap.quickTo(label, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { xs(e.clientX); ys(e.clientY); xr(e.clientX); yr(e.clientY); xl(e.clientX); yl(e.clientY); });
    window.addEventListener('mousedown', function () { cursor.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { cursor.classList.remove('is-down'); });

    const labels = { explore: 'Go', cta: 'Talk', whatsapp: 'Chat', brand: 'Top' };
    document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
      const key = el.getAttribute('data-cursor');
      el.addEventListener('mouseenter', function () {
        if (key && labels[key]) { cursor.classList.add('is-label'); label.textContent = labels[key]; }
        else { cursor.classList.add('is-hover'); }
      });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover', 'is-label'); });
    });

    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * 0.35, y: (e.clientY - (r.top + r.height / 2)) * 0.35, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () { gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }); });
    });
  }

  /* ───────── 8. NAV: scrollspy + mobile menu + anchor scroll ───────── */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  const sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if (window.ScrollTrigger) {
    sections.forEach(function (sec) {
      ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: function (self) {
        if (self.isActive) navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id); });
      } });
    });
  }

  const burger = document.getElementById('expBurger');
  const menu = document.getElementById('mobileMenu');
  function closeMenu() { if (burger) { burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } if (menu) menu.classList.remove('open'); }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault(); closeMenu();
      if (lenis) lenis.scrollTo(tgt, { offset: -10, duration: 1.3 });
      else tgt.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
  if (burger) {
    burger.addEventListener('click', function () {
      const open = burger.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('open', open);
    });
    document.querySelectorAll('[data-mnav], .mobile-wa').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  if (document.fonts && window.ScrollTrigger) { document.fonts.ready.then(function () { ScrollTrigger.refresh(); }); }
})();
