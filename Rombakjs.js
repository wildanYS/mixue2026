(function () {
  "use strict";

  /* ─────────────────────────────────────────
     1. CUSTOM CURSOR
  ───────────────────────────────────────── */
  const cursorDot   = createEl("div", "cursor-dot");
  const cursorRing  = createEl("div", "cursor-ring");
  document.body.append(cursorDot, cursorRing);

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Smooth ring follow
  (function trackRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(trackRing);
  })();

  // Cursor scale on hover
  document.querySelectorAll("a, button, .menu-card, .stat-card, .feature-item").forEach(el => {
    el.addEventListener("mouseenter", () => {
      cursorDot.classList.add("cursor-grow");
      cursorRing.classList.add("cursor-grow");
    });
    el.addEventListener("mouseleave", () => {
      cursorDot.classList.remove("cursor-grow");
      cursorRing.classList.remove("cursor-grow");
    });
  });

  injectStyles(`
    .cursor-dot, .cursor-ring {
      position: fixed; top: 0; left: 0;
      pointer-events: none; z-index: 99999;
      border-radius: 50%;
      transition: width .3s, height .3s, background .3s, border-color .3s, opacity .3s;
      will-change: transform;
    }
    .cursor-dot {
      width: 8px; height: 8px;
      background: #D0202A;
      margin: -4px 0 0 -4px;
    }
    .cursor-ring {
      width: 36px; height: 36px;
      border: 2px solid rgba(208,32,42,0.5);
      margin: -18px 0 0 -18px;
    }
    .cursor-dot.cursor-grow  { width: 14px; height: 14px; margin: -7px 0 0 -7px; background: rgba(208,32,42,0.8); }
    .cursor-ring.cursor-grow { width: 56px; height: 56px; margin: -28px 0 0 -28px; border-color: rgba(208,32,42,0.35); }
    @media (hover: none) { .cursor-dot, .cursor-ring { display: none; } }
  `);


  /* ─────────────────────────────────────────
     2. SMOOTH PAGE ENTRANCE
  ───────────────────────────────────────── */
  const loader = createEl("div", "page-loader");
  loader.innerHTML = `
    <div class="loader-inner">
      <div class="loader-snowflake">❄</div>
      <div class="loader-bar"><div class="loader-fill"></div></div>
      <span class="loader-label">Memuat...</span>
    </div>`;
  document.body.prepend(loader);

  injectStyles(`
    .page-loader {
      position: fixed; inset: 0; z-index: 99998;
      background: #1a1a1a;
      display: flex; align-items: center; justify-content: center;
      transition: opacity .6s ease, visibility .6s ease;
    }
    .page-loader.hide { opacity: 0; visibility: hidden; pointer-events: none; }
    .loader-inner { text-align: center; }
    .loader-snowflake {
      font-size: 3rem; color: #D0202A;
      display: block; margin-bottom: 1.5rem;
      animation: loaderSpin 2s linear infinite;
    }
    @keyframes loaderSpin { to { transform: rotate(360deg); } }
    .loader-bar {
      width: 200px; height: 3px;
      background: rgba(255,255,255,.1);
      border-radius: 3px; overflow: hidden;
      margin: 0 auto 1rem;
    }
    .loader-fill {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, #D0202A, #ff6b6b);
      border-radius: 3px;
      transition: width .05s linear;
    }
    .loader-label { font-size: .78rem; color: rgba(255,255,255,.4); letter-spacing: .1em; font-family: 'DM Sans', sans-serif; }
  `);

  let loadProgress = 0;
  const fillEl = loader.querySelector(".loader-fill");
  const loadInterval = setInterval(() => {
    loadProgress += Math.random() * 18;
    if (loadProgress > 100) loadProgress = 100;
    fillEl.style.width = loadProgress + "%";
    if (loadProgress === 100) {
      clearInterval(loadInterval);
      setTimeout(() => loader.classList.add("hide"), 300);
    }
  }, 80);

  window.addEventListener("load", () => {
    loadProgress = 100;
    fillEl.style.width = "100%";
    setTimeout(() => loader.classList.add("hide"), 400);
  });


  /* ─────────────────────────────────────────
     3. PARALLAX HERO & TILT CARDS
  ───────────────────────────────────────── */
  const heroImg = document.querySelector(".hero-img");
  window.addEventListener("scroll", () => {
    const sy = window.scrollY;
    if (heroImg) heroImg.style.transform = `scale(1.1) translateY(${sy * 0.25}px)`;
    updateParticles(sy);
  });

  // 3D tilt on menu cards
  document.querySelectorAll(".menu-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(600px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateY(-10px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.transition = "transform .5s cubic-bezier(0.16,1,0.3,1)";
      setTimeout(() => card.style.transition = "", 500);
    });
  });


  /* ─────────────────────────────────────────
     4. FLOATING SNOW PARTICLES
  ───────────────────────────────────────── */
  const canvas = createEl("canvas", "snow-canvas");
  document.body.prepend(canvas);
  injectStyles(`
    .snow-canvas {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none; z-index: 1;
      opacity: .45;
    }
  `);
  const ctx = canvas.getContext("2d");
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initSnow();
  });

  const FLAKE_COUNT = window.innerWidth < 768 ? 35 : 70;
  let flakes = [];
  let scrollY = 0;

  function initSnow() {
    flakes = Array.from({ length: FLAKE_COUNT }, () => newFlake(true));
  }
  function newFlake(random = false) {
    return {
      x: Math.random() * W,
      y: random ? Math.random() * H : -10,
      r: Math.random() * 3 + 1,
      speed: Math.random() * 0.8 + 0.3,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.04,
    };
  }

  function updateParticles(sy) { scrollY = sy; }

  function drawSnow() {
    ctx.clearRect(0, 0, W, H);
    flakes.forEach(f => {
      f.y += f.speed;
      f.x += f.drift + Math.sin(f.angle) * 0.3;
      f.angle += f.spin;
      if (f.y > H + 10) { Object.assign(f, newFlake()); }
      ctx.save();
      ctx.globalAlpha = f.opacity;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(drawSnow);
  }
  initSnow();
  drawSnow();


  /* ─────────────────────────────────────────
     5. TYPED TEXT EFFECT ON HERO
  ───────────────────────────────────────── */
  const heroTitle = document.querySelector(".hero-title em");
  if (heroTitle) {
    const phrases = ["Tak Terlupakan", "Terjangkau", "Menyegarkan", "Untuk Semua"];
    let pIdx = 0, cIdx = 0, deleting = false;
    const TYPING_SPEED = 80, DELETE_SPEED = 45, PAUSE = 2000;

    function typeLoop() {
      const current = phrases[pIdx];
      if (!deleting) {
        heroTitle.textContent = current.slice(0, ++cIdx);
        if (cIdx === current.length) { deleting = true; return setTimeout(typeLoop, PAUSE); }
      } else {
        heroTitle.textContent = current.slice(0, --cIdx);
        if (cIdx === 0) {
          deleting = false;
          pIdx = (pIdx + 1) % phrases.length;
        }
      }
      setTimeout(typeLoop, deleting ? DELETE_SPEED : TYPING_SPEED);
    }
    // Start after page loads
    setTimeout(typeLoop, 2000);

    injectStyles(`
      .hero-title em::after {
        content: '|';
        animation: blink .7s step-end infinite;
        color: #ffbfc2;
        margin-left: 2px;
      }
      @keyframes blink { 50% { opacity: 0; } }
    `);
  }


  /* ─────────────────────────────────────────
     6. GLITCH EFFECT ON LOGO
  ───────────────────────────────────────── */
  const logoText = document.querySelector(".logo-text");
  if (logoText) {
    logoText.setAttribute("data-text", logoText.textContent);
    injectStyles(`
      .logo-text {
        position: relative;
        display: inline-block;
      }
      .logo-text:hover::before,
      .logo-text:hover::after {
        content: attr(data-text);
        position: absolute;
        top: 0; left: 0;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        letter-spacing: inherit;
      }
      .logo-text:hover::before {
        color: #09f;
        animation: glitchTop .3s linear infinite;
        clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
      }
      .logo-text:hover::after {
        color: #f09;
        animation: glitchBot .3s linear infinite;
        clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
      }
      @keyframes glitchTop {
        0%   { transform: translate(-2px, -2px); }
        25%  { transform: translate(2px, 2px); }
        50%  { transform: translate(-1px, 0); }
        75%  { transform: translate(1px, -1px); }
        100% { transform: translate(-2px, -2px); }
      }
      @keyframes glitchBot {
        0%   { transform: translate(2px, 2px); }
        25%  { transform: translate(-2px, -2px); }
        50%  { transform: translate(1px, 0); }
        75%  { transform: translate(-1px, 1px); }
        100% { transform: translate(2px, 2px); }
      }
    `);
  }


  /* ─────────────────────────────────────────
     7. RIPPLE EFFECT ON BUTTONS
  ───────────────────────────────────────── */
  document.querySelectorAll(".btn-primary, .btn-ghost, .nav-cta").forEach(btn => {
    btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = createEl("span", "ripple-wave");
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        top: ${e.clientY - rect.top - size/2}px;
        left: ${e.clientX - rect.left - size/2}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.35);
        transform: scale(0);
        animation: rippleAnim .6s ease-out forwards;
        pointer-events: none;
      `;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
  injectStyles(`
    @keyframes rippleAnim {
      to { transform: scale(1); opacity: 0; }
    }
  `);


  /* ─────────────────────────────────────────
     8. MAGNETIC HOVER ON STAT CARDS
  ───────────────────────────────────────── */
  document.querySelectorAll(".stat-card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) * 0.15;
      const dy = (e.clientY - rect.top  - rect.height / 2) * 0.15;
      card.style.transform = `translate(${dx}px, ${dy}px) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });


  /* ─────────────────────────────────────────
     9. SMOOTH ACTIVE NAV HIGHLIGHT
  ───────────────────────────────────────── */
  const sections = document.querySelectorAll("section[id], div[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.getAttribute("id");
        navLinks.forEach(a => {
          a.classList.toggle("nav-active", a.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObs.observe(s));

  injectStyles(`
    .nav-links a.nav-active { color: #D0202A !important; }
    .nav-links a.nav-active::after { width: 100% !important; }
  `);


  /* ─────────────────────────────────────────
     10. TOAST NOTIFICATION on CTA Button
  ───────────────────────────────────────── */
  const ctaBtn = document.querySelector(".nav-cta");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", () => showToast("🎉 Terima kasih! Segera menuju gerai Mixue terdekat!"));
  }

  function showToast(msg) {
    const toast = createEl("div", "toast-notif");
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast-show"));
    setTimeout(() => {
      toast.classList.remove("toast-show");
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  injectStyles(`
    .toast-notif {
      position: fixed;
      bottom: 2rem; left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: #1a1a1a;
      color: #fff;
      padding: .9rem 1.8rem;
      border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: .9rem;
      font-weight: 500;
      box-shadow: 0 12px 40px rgba(0,0,0,.35);
      z-index: 9999;
      white-space: nowrap;
      border: 1px solid rgba(255,255,255,.08);
      transition: transform .4s cubic-bezier(0.16,1,0.3,1), opacity .4s ease;
      opacity: 0;
    }
    .toast-notif.toast-show { transform: translateX(-50%) translateY(0); opacity: 1; }
  `);


  /* ─────────────────────────────────────────
     11. MENU CARD IMAGE ZOOM + OVERLAY INFO
  ───────────────────────────────────────── */
  document.querySelectorAll(".menu-card").forEach(card => {
    const overlay = createEl("div", "card-overlay");
    overlay.innerHTML = `<span>Lihat Detail</span>`;
    card.querySelector(".card-img-wrap").appendChild(overlay);

    card.addEventListener("click", () => {
      const name  = card.querySelector("h3")?.textContent  || "";
      const type  = card.querySelector("p")?.textContent   || "";
      const price = card.querySelector(".card-price")?.textContent || "";
      showModal(name, type, price);
    });
  });

  injectStyles(`
    .card-overlay {
      position: absolute; inset: 0;
      background: rgba(208,32,42,0.75);
      display: flex; align-items: center; justify-content: center;
      opacity: 0;
      transition: opacity .35s ease;
      backdrop-filter: blur(4px);
    }
    .card-overlay span {
      color: #fff; font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      font-size: .9rem; letter-spacing: .05em;
      border: 2px solid rgba(255,255,255,.6);
      padding: .5rem 1.4rem; border-radius: 50px;
    }
    .menu-card:hover .card-overlay { opacity: 1; }
  `);

  // Modal
  const modal     = createEl("div", "item-modal");
  const modalInner = createEl("div", "modal-inner");
  modal.appendChild(modalInner);
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  injectStyles(`
    .item-modal {
      position: fixed; inset: 0; z-index: 9990;
      background: rgba(0,0,0,.6);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity .35s ease;
    }
    .item-modal.modal-open { opacity: 1; pointer-events: all; }
    .modal-inner {
      background: #fff;
      border-radius: 24px;
      padding: 2.5rem;
      max-width: 380px; width: 90%;
      text-align: center;
      transform: scale(.88) translateY(30px);
      transition: transform .4s cubic-bezier(0.16,1,0.3,1);
      box-shadow: 0 32px 80px rgba(0,0,0,.25);
    }
    .item-modal.modal-open .modal-inner { transform: scale(1) translateY(0); }
    .modal-icon { font-size: 3rem; margin-bottom: 1rem; }
    .modal-name { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; color: #1a1a1a; margin-bottom: .4rem; }
    .modal-type { font-size: .82rem; letter-spacing: .12em; text-transform: uppercase; color: #888; margin-bottom: 1rem; }
    .modal-price { font-size: 1.3rem; font-weight: 700; color: #D0202A; margin-bottom: 1.5rem; }
    .modal-close {
      background: #D0202A; color: #fff; border: none;
      padding: .7rem 2rem; border-radius: 50px;
      font-family: 'DM Sans', sans-serif;
      font-size: .9rem; font-weight: 600;
      cursor: pointer;
      transition: background .3s, transform .3s;
    }
    .modal-close:hover { background: #9e1520; transform: translateY(-2px); }
  `);

  function showModal(name, type, price) {
    const icons = { "Es Krim": "🍦", "Milk Tea": "🧋", "Fruit Tea": "🍵" };
    modalInner.innerHTML = `
      <div class="modal-icon">${icons[type] || "❄"}</div>
      <div class="modal-name">${name}</div>
      <div class="modal-type">${type}</div>
      <div class="modal-price">${price}</div>
      <button class="modal-close" onclick="document.querySelector('.item-modal').classList.remove('modal-open')">
        Tutup
      </button>`;
    modal.classList.add("modal-open");
  }
  function closeModal() { modal.classList.remove("modal-open"); }


  /* ─────────────────────────────────────────
     12. SCROLL PROGRESS BAR
  ───────────────────────────────────────── */
  const progressBar = createEl("div", "scroll-progress");
  document.body.prepend(progressBar);
  injectStyles(`
    .scroll-progress {
      position: fixed; top: 0; left: 0;
      height: 3px; width: 0%;
      background: linear-gradient(90deg, #D0202A, #ff6b6b);
      z-index: 99997;
      transition: width .05s linear;
    }
  `);
  window.addEventListener("scroll", () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / docH * 100) + "%";
  });


  /* ─────────────────────────────────────────
     13. BACK TO TOP BUTTON
  ───────────────────────────────────────── */
  const backTop = createEl("button", "back-top");
  backTop.innerHTML = "↑";
  backTop.setAttribute("aria-label", "Kembali ke atas");
  document.body.appendChild(backTop);
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  window.addEventListener("scroll", () => {
    backTop.classList.toggle("back-top-show", window.scrollY > 400);
  });

  injectStyles(`
    .back-top {
      position: fixed; bottom: 2rem; right: 2rem;
      width: 48px; height: 48px;
      background: #D0202A; color: #fff;
      border: none; border-radius: 50%;
      font-size: 1.3rem; font-weight: 700;
      cursor: pointer; z-index: 999;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 20px rgba(208,32,42,.4);
      transform: translateY(80px) scale(.8);
      opacity: 0;
      transition: all .4s cubic-bezier(0.16,1,0.3,1);
    }
    .back-top.back-top-show { transform: translateY(0) scale(1); opacity: 1; }
    .back-top:hover { transform: translateY(-4px) scale(1.08); box-shadow: 0 10px 28px rgba(208,32,42,.5); }
  `);


  /* ─────────────────────────────────────────
     14. FEATURE ITEMS STAGGER ANIMATION
  ───────────────────────────────────────── */
  const featureItems = document.querySelectorAll(".feature-item");
  featureItems.forEach((item, i) => {
    item.style.opacity = "0";
    item.style.transform = "translateX(30px)";
    item.style.transition = `opacity .5s ease ${i * 0.12}s, transform .5s ease ${i * 0.12}s`;
  });

  const featureObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        featureItems.forEach(item => {
          item.style.opacity = "1";
          item.style.transform = "translateX(0)";
        });
        featureObs.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const featureList = document.querySelector(".feature-list");
  if (featureList) featureObs.observe(featureList);


  /* ─────────HELPERS──────────────── */
  function createEl(tag, cls) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  function injectStyles(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

})();