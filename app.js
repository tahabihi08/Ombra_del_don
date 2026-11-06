(async () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const link = u => { u = String(u || '').trim(); return !u || /^(https?:\/\/|mailto:|\/|#|images\/|assets\/|\.\/)/i.test(u) ? u : '#'; };
  const imgSrc = u => { u = String(u || '').trim(); return /^(https?:\/\/|\/|images\/|assets\/|\.\/|data:image\/)/i.test(u) ? u : ''; };
  const para = s => esc(s).split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const app = $('#app');

  /* ---------- Chargement du contenu ---------- */
  const preview = new URLSearchParams(location.search).has('preview');
  let data = null;
  if (preview) { try { const d = localStorage.getItem('od_draft'); if (d) data = JSON.parse(d); } catch (e) {} }
  if (!data) {
    try { data = await (await fetch('content.json?v=' + Date.now())).json(); }
    catch (e) { app.innerHTML = '<div class="maint"><h1 class="serif">Erreur de chargement</h1><p>Impossible de lire content.json.</p></div>'; return; }
  }
  const st = data.settings || {};

  /* ---------- Réglages globaux ---------- */
  const root = document.documentElement.style;
  if (st.accent) root.setProperty('--accent', st.accent);
  if (st.gold) root.setProperty('--gold', st.gold);
  if (st.bg) root.setProperty('--bg', st.bg);
  document.title = st.seoTitle || st.name || 'Ombra del Don';
  const setMeta = (sel, attr, val) => { let m = $(sel); if (!m) { m = document.createElement('meta'); const [k, v] = sel.replace(/^meta\[|\]$/g, '').split('='); m.setAttribute(k, v.replace(/"/g, '')); document.head.appendChild(m); } m.setAttribute(attr, val); };
  setMeta('meta[name="description"]', 'content', st.seoDesc || '');
  setMeta('meta[property="og:title"]', 'content', st.seoTitle || st.name || '');
  setMeta('meta[property="og:description"]', 'content', st.seoDesc || '');
  if (imgSrc(st.ogImage)) setMeta('meta[property="og:image"]', 'content', imgSrc(st.ogImage));
  if (imgSrc(st.favicon)) $('#favicon').href = imgSrc(st.favicon);
  $('#customCss').textContent = st.customCss || '';

  const logo = imgSrc(st.logo);
  const socials = (data.socials || []).filter(s => s.url && s.label);

  /* ---------- Mode maintenance ---------- */
  if (st.maintenance && !preview) {
    app.innerHTML = `<div class="maint">${logo ? `<img src="${esc(logo)}" alt="">` : ''}<h1 class="serif">${esc(st.name)}</h1><p>${esc(st.maintenanceText)}</p><div class="socials">${socials.map(s => `<a href="${esc(link(s.url))}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}</div></div>`;
    startFog();
    return;
  }

  /* ---------- Rendu des sections ---------- */
  const wrap = (s, inner, cls = '') =>
    `<section id="${esc(s.id)}" class="sec ${cls}" data-reveal><div class="wrap"><header class="sec-head"><h2>${esc(s.title)}</h2>${s.subtitle ? `<p>${esc(s.subtitle)}</p>` : ''}</header>${inner}</div></section>`;
  const items = s => Array.isArray(s.items) ? s.items : [];

  const R = {
    hero: s => `<section id="${esc(s.id)}" class="hero" ${imgSrc(s.bg) ? `style="background-image:url('${esc(imgSrc(s.bg))}')"` : ''}><div class="in">
      ${logo ? `<img class="logo" src="${esc(logo)}" alt="Logo ${esc(st.name)}">` : ''}
      ${s.eyebrow ? `<div class="eyebrow">${esc(s.eyebrow)}</div>` : ''}
      <h1>${esc(s.title)}</h1>${s.text ? `<p>${esc(s.text).replace(/\n/g, '<br>')}</p>` : ''}
      <div class="btns">${(s.buttons || []).map(b => `<a class="btn ${b.style === 'contour' ? 'btn-ghost' : ''}" href="${esc(link(b.url))}">${esc(b.label)}</a>`).join('')}</div>
      </div><span class="scroll">⌄</span></section>`,

    about: s => wrap(s, `<div class="about ${imgSrc(s.image) ? '' : 'no-img'}"><div class="txt">${para(s.text)}${s.quote ? `<blockquote>${esc(s.quote)}</blockquote>` : ''}</div>${imgSrc(s.image) ? `<img src="${esc(imgSrc(s.image))}" alt="" loading="lazy">` : ''}</div>`),

    stats: s => wrap(s, `<div class="stats">${items(s).map(i => `<div class="stat"><b>${esc(i.value)}</b><span>${esc(i.label)}</span></div>`).join('')}</div>`),

    ranks: s => wrap(s, `<div class="grid">${items(s).map(i => `<div class="card rank"><div class="ic">${esc(i.icon || '♦')}</div><h3>${esc(i.name)}</h3><p>${esc(i.desc)}</p></div>`).join('')}</div>`),

    members: s => wrap(s, `<div class="grid">${items(s).map(i => `<div class="card member" style="padding-top:0"><div class="ph ${imgSrc(i.photo) ? 'has' : ''}" ${imgSrc(i.photo) ? `style="background-image:url('${esc(imgSrc(i.photo))}')"` : ''}>${imgSrc(i.photo) ? '' : '♟'}</div><small>${esc(i.role)}</small><h3>${esc(i.name)}</h3>${i.cpmId ? `<em>ID CPM : ${esc(i.cpmId)}</em>` : ''}</div>`).join('')}</div>`),

    rules: s => wrap(s, `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${items(s).map((i, n) => `<div class="card rule"><div class="n">${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || n + 1}</div><div><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></div></div>`).join('')}</div>`),

    alliances: s => wrap(s, `${s.text ? `<div class="txt" style="text-align:center;margin-bottom:34px">${para(s.text)}</div>` : ''}<div class="grid">${items(s).map(i => {
      const inner = `<div class="lg" ${imgSrc(i.logo) ? `style="background-image:url('${esc(imgSrc(i.logo))}')"` : ''}>${imgSrc(i.logo) ? '' : esc((i.name || '?')[0])}</div><h3>${esc(i.name)}</h3><p>${esc(i.desc)}</p>`;
      return i.url ? `<a class="card ally" href="${esc(link(i.url))}" target="_blank" rel="noopener">${inner}</a>` : `<div class="card ally">${inner}</div>`;
    }).join('')}</div>`),

    gallery: s => wrap(s, `<div class="gal">${items(s).filter(i => imgSrc(i.image)).map(i => `<figure><img src="${esc(imgSrc(i.image))}" alt="${esc(i.caption)}" loading="lazy">${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`),

    news: s => wrap(s, `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(290px,1fr))">${items(s).map(i => `<article class="card news">${imgSrc(i.image) ? `<img src="${esc(imgSrc(i.image))}" alt="" loading="lazy">` : ''}<div class="b"><time>${esc(i.date)}</time><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></div></article>`).join('')}</div>`),

    faq: s => wrap(s, `<div style="max-width:780px;margin:0 auto">${items(s).map(i => `<details><summary>${esc(i.q)}</summary><p>${esc(i.a)}</p></details>`).join('')}</div>`),

    custom: s => wrap(s, `<div class="about ${imgSrc(s.image) ? '' : 'no-img'}"><div class="txt">${para(s.text)}</div>${imgSrc(s.image) ? `<img src="${esc(imgSrc(s.image))}" alt="" loading="lazy">` : ''}</div>`),

    contact: s => wrap(s, `<div class="txt" style="text-align:center;max-width:640px;margin:0 auto">${para(s.text)}</div><div class="socials">${socials.map(x => `<a href="${esc(link(x.url))}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('')}</div>`),

    join: s => wrap(s, `<div class="form-wrap">${s.open === false ? `<div class="closed">${esc(s.closedText)}</div>` : `
      ${s.text ? `<div class="txt">${para(s.text)}</div>` : ''}
      ${lines(s.requirements).length ? `<ul class="reqs">${lines(s.requirements).map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
      <form class="form" name="join" method="POST" data-netlify="true" netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="join">
        <p class="hp"><label>Ne pas remplir <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <div><label>Pseudo CPM *</label><input name="pseudo" required maxlength="40"></div>
        <div><label>ID CPM</label><input name="cpm_id" maxlength="40"></div>
        <div><label>Âge *</label><input name="age" type="number" min="10" max="99" required></div>
        <div><label>Pays *</label><input name="pays" required maxlength="40"></div>
        <div class="full"><label>Discord *</label><input name="discord" required maxlength="60" placeholder="pseudo#0000 ou @pseudo"></div>
        <div class="full"><label>Niveau / expérience</label><select name="experience"><option>Débutant</option><option>Intermédiaire</option><option>Avancé</option><option>Ancien membre d'une autre mafia</option></select></div>
        <div class="full"><label>Pourquoi veux-tu nous rejoindre ? *</label><textarea name="motivation" rows="4" required maxlength="1200"></textarea></div>
        <label class="chk full"><input type="checkbox" required> <span>Je respecte le Code de la famille.</span></label>
        <div class="full" style="text-align:center"><button class="btn" type="submit">Envoyer ma candidature</button></div>
        <div class="msg"></div>
      </form>`}</div>`),

    meeting: s => wrap(s, `<div class="form-wrap">${s.open === false ? `<div class="closed">${esc(s.closedText)}</div>` : `
      ${s.text ? `<div class="txt">${para(s.text)}</div>` : ''}
      ${lines(s.rules).length ? `<ul class="reqs">${lines(s.rules).map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
      <form class="form" name="meeting" method="POST" data-netlify="true" netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="meeting">
        <p class="hp"><label>Ne pas remplir <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <div><label>Nom de la mafia *</label><input name="mafia" required maxlength="60"></div>
        <div><label>Chef / représentant *</label><input name="chef" required maxlength="40"></div>
        <div><label>Discord du représentant *</label><input name="discord" required maxlength="60"></div>
        <div><label>Nombre de membres</label><input name="membres" type="number" min="1" max="999"></div>
        <div><label>Date / heure proposée</label><input name="date_proposee" maxlength="60" placeholder="ex : samedi 21h (heure Maroc)"></div>
        <div><label>Sujet *</label><select name="sujet" required>${lines(s.topics).map(t => `<option>${esc(t)}</option>`).join('')}</select></div>
        <div class="full"><label>Message *</label><textarea name="message" rows="4" required maxlength="1200"></textarea></div>
        <div class="full" style="text-align:center"><button class="btn" type="submit">Demander un meeting</button></div>
        <div class="msg"></div>
      </form>`}</div>`)
  };

  const secs = (data.sections || []).filter(s => s.visible !== false);
  const listTypes = ['members', 'ranks', 'rules', 'alliances', 'gallery', 'news', 'faq', 'stats'];
  const shown = secs.filter(s => {
    if (!R[s.type]) return false;
    if (listTypes.includes(s.type) && !items(s).length) return false;
    if (s.type === 'gallery' && !items(s).some(i => imgSrc(i.image))) return false;
    return true;
  });
  const navItems = shown.filter(s => s.type !== 'hero' && s.navLabel);
  const html = shown.map(s => R[s.type](s)).join('');

  app.innerHTML = `
    <nav class="nav"><div class="wrap"><a class="brand" href="#top-anchor">${logo ? `<img src="${esc(logo)}" alt="">` : ''}<span>${esc(st.name)}</span></a>
    <button class="burger" aria-label="Menu">☰</button>
    <ul class="menu">${navItems.map(s => `<li><a href="#${esc(s.id)}">${esc(s.navLabel)}</a></li>`).join('')}</ul></div></nav>
    <main id="top-anchor">${html}</main>
    <footer>${socials.length ? `<div class="socials">${socials.map(x => `<a href="${esc(link(x.url))}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('')}</div>` : ''}<p>${esc(st.footerText)}</p></footer>`;

  /* ---------- Splash + musique ---------- */
  let audio = null;
  if (st.music) { audio = new Audio(st.music); audio.loop = true; audio.volume = .35; const b = document.createElement('button'); b.id = 'mus'; b.textContent = '♪'; b.title = 'Musique'; b.onclick = () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); b.style.opacity = audio.paused ? .5 : 1; }; document.body.appendChild(b); }
  if (st.splash && !preview && !sessionStorage.getItem('od_in')) {
    const sp = document.createElement('div'); sp.id = 'splash';
    sp.innerHTML = `${logo ? `<img src="${esc(logo)}" alt="">` : ''}<h1 class="serif">${esc(st.name)}</h1><button class="btn">${esc(st.splashText || 'Entrer')}</button>`;
    document.body.appendChild(sp);
    $('button', sp).onclick = () => { sessionStorage.setItem('od_in', '1'); sp.classList.add('out'); setTimeout(() => sp.remove(), 1000); if (audio) audio.play().catch(() => {}); };
  }

  /* ---------- Interactions ---------- */
  $('.burger').onclick = () => $('.menu').classList.toggle('open');
  $$('.menu a').forEach(a => a.addEventListener('click', () => $('.menu').classList.remove('open')));

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  $$('[data-reveal]').forEach(el => io.observe(el));

  const links = $$('.menu a'), targets = links.map(a => $(a.getAttribute('href')));
  const top = $('#top'), bar = $('#progress');
  addEventListener('scroll', () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    top.classList.toggle('on', y > 600);
    let cur = -1; targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < 140) cur = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === cur));
  }, { passive: true });
  top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

  const lb = $('#lb'), lbi = $('img', lb);
  $$('.gal figure').forEach(f => f.onclick = () => { lbi.src = $('img', f).src; lb.classList.add('on'); });
  lb.onclick = () => lb.classList.remove('on');
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('on'); });

  /* Formulaires (Netlify Forms) */
  $$('form[data-netlify]').forEach(f => f.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('.msg', f), btn = $('button[type=submit]', f);
    btn.disabled = true; msg.className = 'msg';
    try {
      const body = new URLSearchParams(new FormData(f)).toString();
      const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      if (!r.ok) throw 0;
      msg.className = 'msg ok'; msg.textContent = 'Message reçu. La famille te répondra sur Discord.'; f.reset();
    } catch (err) {
      msg.className = 'msg err'; msg.textContent = 'Envoi impossible pour le moment. Contacte-nous directement sur nos réseaux.';
    }
    btn.disabled = false;
  }));

  startFog();

  /* ---------- Brouillard animé ---------- */
  function startFog() {
    const c = $('#fog'), x = c.getContext('2d');
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    let w, h; const fit = () => { w = c.width = innerWidth; h = c.height = innerHeight; }; fit(); addEventListener('resize', fit);
    const blobs = Array.from({ length: 12 }, () => ({ x: Math.random(), y: Math.random(), r: 220 + Math.random() * 320, vx: (Math.random() - .5) * 2e-4, vy: (Math.random() - .5) * 1.2e-4, a: .05 + Math.random() * .07 }));
    (function loop() {
      x.clearRect(0, 0, w, h);
      for (const b of blobs) {
        b.x += b.vx; b.y += b.vy; if (b.x < -.2 || b.x > 1.2) b.vx *= -1; if (b.y < -.2 || b.y > 1.2) b.vy *= -1;
        const g = x.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, b.r);
        g.addColorStop(0, `rgba(150,14,24,${b.a})`); g.addColorStop(1, 'rgba(150,14,24,0)');
        x.fillStyle = g; x.fillRect(0, 0, w, h);
      }
      requestAnimationFrame(loop);
    })();
  }
})();
