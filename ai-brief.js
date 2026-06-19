/* EastStar — AI Monthly Brief demo.
   Turns grounded sales metrics (ai_brief.json) into a natural-language executive brief
   in English or Bahasa Malaysia — a stand-in for the LLM automation EastStar would deploy. */
(function () {
  const ROOT = document.getElementById('ai-brief');
  if (!ROOT) return;
  const DATA_URL = 'samples/borneo-hardware-trading/ai_brief.json';
  let AI = null, period = 'FY', lang = 'en';

  const rm = n => 'RM ' + Math.round(n).toLocaleString('en-MY');
  const rmK = n => n >= 1e6 ? 'RM ' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? 'RM ' + Math.round(n / 1e3) + 'k' : rm(n);

  // ---------- English generator ----------
  function briefEN(p, name, d, isFY) {
    let head, summary, moved = [], watch = [], actions = [];
    if (isFY) {
      head = `FY2025 brought in <b>${rm(d.revenue)}</b> across ${d.orders} orders — about ${rm(d.avg_month)} a month.`;
      summary = `It was a solid year. <b>${d.best_month[0]}</b> was the strongest month at ${rmK(d.best_month[1])}, while <b>${d.worst_month[0]}</b> was the quietest at ${rmK(d.worst_month[1])}. The ${d.top_branch[0]} branch carried the business with ${rmK(d.top_branch[1])}, and ${d.top_rep[0]} was the standout on the sales floor.`;
      moved = [
        `<b>${d.top_cat[0]}</b> was the engine of the year — roughly ${d.top_cat[1]}% of everything sold.`,
        `<b>${d.top_product[0]}</b> was the single best-selling line at ${rmK(d.top_product[1])}.`,
        `Your biggest customer, <b>${d.top_customer[0]}</b>, spent ${rmK(d.top_customer[1])} with you.`
      ];
    } else {
      const mom = d.mom;
      if (mom === null) head = `${name} opened the year at <b>${rm(d.revenue)}</b> across ${d.orders} orders.`;
      else if (Math.abs(mom) < 3) head = `${name} held roughly flat at <b>${rm(d.revenue)}</b> — within ${Math.abs(mom)}% of ${d.prev}.`;
      else head = `${name} ${mom >= 0 ? 'rose' : 'slipped'} to <b>${rm(d.revenue)}</b>, ${mom >= 0 ? 'up' : 'down'} <b>${Math.abs(mom)}%</b> on ${d.prev}.`;
      summary = `The ${d.top_branch[0]} branch led with ${rmK(d.top_branch[1])}, and ${d.top_rep[0]} was the top performer. ${d.top_cat[0]} made up about ${d.top_cat[1]}% of sales, with <b>${d.top_product[0]}</b> the best-selling line. Average order value was ${rm(d.avg)}.`;
      moved = [
        `Top branch: <b>${d.top_branch[0]}</b> (${rmK(d.top_branch[1])}).`,
        `Top salesperson: <b>${d.top_rep[0]}</b>.`,
        `Best-selling product: <b>${d.top_product[0]}</b>.`
      ];
      if (mom !== null && mom < -5) watch.push(`Revenue fell ${Math.abs(mom)}% from ${d.prev} — worth checking if it's seasonal or the start of a trend.`);
    }
    // shared watch-outs
    if (d.outstanding_pct >= 15) watch.push(`<b>${rm(d.outstanding)}</b> (${d.outstanding_pct}% of sales) is still unpaid — a few follow-up calls would tighten cash flow.`);
    if (!isFY && d.weak_branch && d.weak_branch[0] !== d.top_branch[0]) watch.push(`${d.weak_branch[0]} was the quietest branch at ${rmK(d.weak_branch[1])}.`);
    if (isFY) watch.push(`${d.worst_month[0]} was a noticeable dip — plan promotions or stock ahead of that period next year.`);
    if (!watch.length) watch.push(`Nothing urgent — collections and branch spread both look healthy.`);
    // actions
    actions.push(`Follow up on the ${rm(d.outstanding)} outstanding before it ages further.`);
    actions.push(`Keep <b>${d.top_product[0]}</b> and ${d.top_cat[0]} stock well supplied — that's where demand is.`);
    actions.push(isFY
      ? `Have ${d.top_rep[0]} share what's working with the rest of the team.`
      : `Give ${d.weak_branch ? d.weak_branch[0] : 'the quieter branch'} extra support to lift the total.`);
    return { head, summary, moved, watch, actions,
      L: { moved: 'What moved', watch: 'Worth a look', actions: 'Recommended next steps' } };
  }

  // ---------- Bahasa Malaysia generator ----------
  function briefBM(p, name, d, isFY) {
    let head, summary, moved = [], watch = [], actions = [];
    if (isFY) {
      head = `Tahun 2025 mencatat jualan <b>${rm(d.revenue)}</b> daripada ${d.orders} pesanan — kira-kira ${rm(d.avg_month)} sebulan.`;
      summary = `Tahun yang memberangsangkan. Bulan <b>${d.best_month[0]}</b> paling kukuh pada ${rmK(d.best_month[1])}, manakala <b>${d.worst_month[0]}</b> paling perlahan pada ${rmK(d.worst_month[1])}. Cawangan ${d.top_branch[0]} menerajui perniagaan dengan ${rmK(d.top_branch[1])}, dan ${d.top_rep[0]} jurujual terbaik.`;
      moved = [
        `<b>${d.top_cat[0]}</b> penyumbang utama — kira-kira ${d.top_cat[1]}% daripada semua jualan.`,
        `<b>${d.top_product[0]}</b> produk paling laris pada ${rmK(d.top_product[1])}.`,
        `Pelanggan terbesar, <b>${d.top_customer[0]}</b>, berbelanja ${rmK(d.top_customer[1])}.`
      ];
    } else {
      const mom = d.mom;
      if (mom === null) head = `${name} membuka tahun pada <b>${rm(d.revenue)}</b> daripada ${d.orders} pesanan.`;
      else if (Math.abs(mom) < 3) head = `${name} hampir mendatar pada <b>${rm(d.revenue)}</b> — dalam lingkungan ${Math.abs(mom)}% berbanding ${d.prev}.`;
      else head = `${name} ${mom >= 0 ? 'naik' : 'turun'} kepada <b>${rm(d.revenue)}</b>, ${mom >= 0 ? 'naik' : 'turun'} <b>${Math.abs(mom)}%</b> berbanding ${d.prev}.`;
      summary = `Cawangan ${d.top_branch[0]} mendahului dengan ${rmK(d.top_branch[1])}, dan ${d.top_rep[0]} jurujual terbaik. ${d.top_cat[0]} menyumbang kira-kira ${d.top_cat[1]}% jualan, dengan <b>${d.top_product[0]}</b> paling laris. Purata nilai pesanan ${rm(d.avg)}.`;
      moved = [
        `Cawangan terbaik: <b>${d.top_branch[0]}</b> (${rmK(d.top_branch[1])}).`,
        `Jurujual terbaik: <b>${d.top_rep[0]}</b>.`,
        `Produk paling laris: <b>${d.top_product[0]}</b>.`
      ];
      if (mom !== null && mom < -5) watch.push(`Jualan turun ${Math.abs(mom)}% berbanding ${d.prev} — perlu disemak sama ada bermusim atau tren baharu.`);
    }
    if (d.outstanding_pct >= 15) watch.push(`<b>${rm(d.outstanding)}</b> (${d.outstanding_pct}% jualan) masih belum dibayar — beberapa panggilan susulan akan membantu aliran tunai.`);
    if (!isFY && d.weak_branch && d.weak_branch[0] !== d.top_branch[0]) watch.push(`${d.weak_branch[0]} cawangan paling perlahan pada ${rmK(d.weak_branch[1])}.`);
    if (isFY) watch.push(`${d.worst_month[0]} menurun ketara — rancang promosi atau stok lebih awal untuk tempoh itu tahun depan.`);
    if (!watch.length) watch.push(`Tiada isu mendesak — kutipan dan taburan cawangan kelihatan sihat.`);
    actions.push(`Buat susulan untuk ${rm(d.outstanding)} yang belum dibayar sebelum ia semakin lama.`);
    actions.push(`Pastikan stok <b>${d.top_product[0]}</b> dan ${d.top_cat[0]} sentiasa mencukupi — di situ permintaannya.`);
    actions.push(isFY
      ? `Minta ${d.top_rep[0]} kongsi kaedah jualannya dengan pasukan lain.`
      : `Beri sokongan tambahan kepada ${d.weak_branch ? d.weak_branch[0] : 'cawangan yang perlahan'} untuk menaikkan jumlah.`);
    return { head, summary, moved, watch, actions,
      L: { moved: 'Apa yang berubah', watch: 'Perlu perhatian', actions: 'Langkah seterusnya' } };
  }

  // ---------- Ask-your-data ----------
  function questions() {
    const d = AI.fy;
    const en = [
      ['Which branch needs attention?', `${d.weak_branch[0]} is your quietest branch at ${rmK(d.weak_branch[1])} for the year — well behind ${d.top_branch[0]} (${rmK(d.top_branch[1])}). A visit or a local promotion could help close the gap.`],
      ['Who is my best salesperson?', `${d.top_rep[0]} led the year with ${rmK(d.top_rep[1])} in sales. Worth having them mentor the rest of the team.`],
      ['How much money is still owed to me?', `About ${rm(d.outstanding)} is still unpaid — ${d.outstanding_pct}% of the year's revenue. Chasing even half of it would noticeably ease cash flow.`],
      ['What should I stock more of?', `${d.top_product[0]} and the wider ${d.top_cat[0]} category drive most of your revenue — keep those well supplied, especially before peak months.`],
      ['When is my busiest period?', `${d.best_month[0]} was your strongest month (${rmK(d.best_month[1])}) and ${d.worst_month[0]} the slowest (${rmK(d.worst_month[1])}). Plan stock and staffing around that swing.`]
    ];
    const bm = [
      ['Cawangan mana perlu perhatian?', `${d.weak_branch[0]} cawangan paling perlahan pada ${rmK(d.weak_branch[1])} setahun — jauh di belakang ${d.top_branch[0]} (${rmK(d.top_branch[1])}). Lawatan atau promosi setempat boleh membantu.`],
      ['Siapa jurujual terbaik saya?', `${d.top_rep[0]} mendahului tahun ini dengan jualan ${rmK(d.top_rep[1])}. Sesuai untuk membimbing pasukan lain.`],
      ['Berapa banyak wang masih terhutang?', `Kira-kira ${rm(d.outstanding)} masih belum dibayar — ${d.outstanding_pct}% daripada jualan tahunan. Kutipan separuh sahaja pun banyak membantu aliran tunai.`],
      ['Apa yang patut saya stok lebih?', `${d.top_product[0]} dan kategori ${d.top_cat[0]} memacu sebahagian besar jualan — pastikan stoknya mencukupi, terutamanya sebelum bulan puncak.`],
      ['Bila tempoh paling sibuk?', `${d.best_month[0]} bulan paling kukuh (${rmK(d.best_month[1])}) dan ${d.worst_month[0]} paling perlahan (${rmK(d.worst_month[1])}). Rancang stok dan tenaga kerja mengikut perubahan ini.`]
    ];
    return lang === 'en' ? en : bm;
  }

  // ---------- Render ----------
  function currentBrief() {
    if (period === 'FY') {
      const name = lang === 'en' ? 'Full Year 2025' : 'Sepanjang Tahun 2025';
      return (lang === 'en' ? briefEN : briefBM)('FY', name, AI.fy, true);
    }
    const name = (lang === 'en' ? AI.fullnames : AI.fullnames_bm)[period] + ' 2025';
    return (lang === 'en' ? briefEN : briefBM)(period, name, AI.months[period], false);
  }

  function bullets(items) { return '<ul>' + items.map(t => `<li>${t}</li>`).join('') + '</ul>'; }

  function render(animate) {
    const b = currentBrief();
    const paper = ROOT.querySelector('.ai-paper-body');
    const stamp = lang === 'en' ? 'AI-GENERATED · SAMPLE OUTPUT' : 'DIJANA AI · CONTOH';
    paper.innerHTML =
      `<p class="ai-head">${b.head}</p>
       <p class="ai-summary">${b.summary}</p>
       <div class="ai-sec"><div class="ai-sec-h"><span class="ai-ico up">▲</span>${b.L.moved}</div>${bullets(b.moved)}</div>
       <div class="ai-sec"><div class="ai-sec-h"><span class="ai-ico warn">!</span>${b.L.watch}</div>${bullets(b.watch)}</div>
       <div class="ai-sec"><div class="ai-sec-h"><span class="ai-ico ok">✓</span>${b.L.actions}</div>${bullets(b.actions)}</div>`;
    if (animate) {
      const blocks = paper.querySelectorAll('p,.ai-sec');
      blocks.forEach((el, i) => { el.style.animation = 'none'; void el.offsetWidth;
        el.style.animation = `aiIn .5s ${i * 0.12 + 0.05}s both`; });
    }
    // questions
    const qWrap = ROOT.querySelector('.ai-q-chips');
    const ans = ROOT.querySelector('.ai-answer');
    const qs = questions();
    qWrap.innerHTML = qs.map((q, i) => `<button class="ai-chip" data-i="${i}">${q[0]}</button>`).join('');
    qWrap.querySelectorAll('.ai-chip').forEach(btn => btn.onclick = () => {
      qWrap.querySelectorAll('.ai-chip').forEach(x => x.classList.remove('on'));
      btn.classList.add('on');
      ans.innerHTML = `<div class="ai-answer-in"><span class="ai-dot">●</span> ${qs[btn.dataset.i][1]}</div>`;
    });
    ans.innerHTML = `<div class="ai-answer-hint">${lang === 'en' ? 'Tap a question — the assistant answers from the same data.' : 'Tekan satu soalan — pembantu menjawab daripada data yang sama.'}</div>`;
    // delivery line
    ROOT.querySelector('.ai-deliver').innerHTML = lang === 'en'
      ? '⏱ Auto-generated on the 1st of every month and sent straight to your WhatsApp.'
      : '⏱ Dijana automatik pada 1 haribulan setiap bulan dan dihantar terus ke WhatsApp anda.';
    ROOT.querySelector('.ai-stamp').textContent = stamp;
  }

  function buildControls() {
    const sel = ROOT.querySelector('.ai-period');
    const fyLabel = lang === 'en' ? 'Full Year 2025' : 'Sepanjang Tahun 2025';
    sel.innerHTML = `<option value="FY">${fyLabel}</option>` +
      AI.order.map(m => `<option value="${m}">${(lang === 'en' ? AI.fullnames : AI.fullnames_bm)[m]} 2025</option>`).join('');
    sel.value = period;
    sel.onchange = () => { period = sel.value; render(true); };
    ROOT.querySelectorAll('.ai-lang').forEach(btn => btn.onclick = () => {
      lang = btn.dataset.lang;
      ROOT.querySelectorAll('.ai-lang').forEach(x => x.classList.toggle('on', x.dataset.lang === lang));
      buildControls(); render(true);
    });
  }

  fetch(DATA_URL).then(r => r.json()).then(d => {
    AI = d; buildControls(); render(false);
    // animate first reveal when scrolled into view
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { render(true); io.disconnect(); } });
    }, { threshold: 0.25 });
    io.observe(ROOT);
  }).catch(e => { ROOT.querySelector('.ai-paper-body').innerHTML = '<p style="color:#ff7a8a">Demo data failed to load.</p>'; });
})();
