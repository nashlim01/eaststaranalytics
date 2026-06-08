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
