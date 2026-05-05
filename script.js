/* ============================================================
   ASVALFP — CINEMATIC JS ENGINE
   ============================================================ */

'use strict';

// ===== GLITCH SOUND =====
const likeSound = new Audio('son/Glitch Sound Effect.mp3');
likeSound.preload = 'auto';
likeSound.volume  = 0.75;

// ===== GÉNÉRATION AUTOMATIQUE DES CARTES VIDÉO =====
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

(function buildVideoGrid() {
  const grid = document.getElementById('videoGrid');
  if (!grid || typeof VIDEOS === 'undefined') return;

  const catClass = { highlights: 'cat-highlight', gameplay: 'cat-gameplay', live: 'cat-live' };
  const catLabel = { highlights: 'HIGHLIGHT', gameplay: 'GAMEPLAY', live: 'LIVE REPLAY' };

  VIDEOS.forEach((v, i) => {
    const encodedSrc = v.src.replace(/ /g, '%20');
    const card = document.createElement('div');
    card.className = 'video-card' + (v.featured ? ' vc-featured' : '');
    card.dataset.category = v.category;
    card.dataset.src = encodedSrc;
    card.setAttribute('data-aos', '');
    card.style.setProperty('--aod', (i * 0.08) + 's');

    card.innerHTML = `
      <div class="vc-thumb">
        <video class="vc-video" preload="metadata" muted loop playsinline>
          <source src="${encodedSrc}" type="video/mp4" />
        </video>
        <div class="vc-overlay">
          <button class="vc-play" aria-label="Lire">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="vc-meta-top">
          <span class="vc-cat ${catClass[v.category] || 'cat-highlight'}">${catLabel[v.category] || v.category.toUpperCase()}</span>
          ${v.badge ? `<span class="vc-badge">${v.badge}</span>` : ''}
        </div>
        <span class="vc-dur">${v.duration || ''}</span>
      </div>
      <div class="vc-info">
        <h3 class="vc-title">${v.title}</h3>
        <div class="vc-foot">
          <span class="vc-views">${v.views || ''}</span>
        </div>
      </div>`;
    grid.appendChild(card);

    // Durée réelle auto-détectée
    const videoEl  = card.querySelector('.vc-video');
    const durEl    = card.querySelector('.vc-dur');
    const setDur   = () => { const d = formatDuration(videoEl.duration); if (d) durEl.textContent = d; };
    if (videoEl.readyState >= 1) setDur();
    else videoEl.addEventListener('loadedmetadata', setDur, { once: true });
  });
})();

// ===== LERP UTILITY =====
const lerp = (a, b, t) => a + (b - a) * t;

// ===== LOGO RAIN =====
const logoRainContainer = document.getElementById('logoRain');
let lastScrollForRain   = 0;
let rainThrottle        = false;

function spawnLogoDrop(count = 1) {
  if (!logoRainContainer) return;
  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div');
    drop.classList.add('logo-drop');

    const size     = Math.random() * 28 + 18;        // 18–46px
    const left     = Math.random() * 100;             // 0–100vw
    const duration = Math.random() * 2.5 + 1.8;      // 1.8–4.3s
    const delay    = Math.random() * 0.4;             // 0–0.4s
    const opacity  = Math.random() * 0.25 + 0.08;    // 0.08–0.33
    const rot      = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 360 + 180);
    const drift    = (Math.random() - 0.5) * 60;     // horizontal drift

    drop.style.cssText = `
      left: ${left}vw;
      width: ${size}px;
      height: ${size}px;
      opacity: ${opacity};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --rot: ${rot}deg;
      transform: translateX(${drift}px);
    `;
    logoRainContainer.appendChild(drop);
    drop.addEventListener('animationend', () => drop.remove(), { once: true });
  }
}

window.addEventListener('scroll', () => {
  if (rainThrottle) return;
  rainThrottle = true;

  const delta = Math.abs(window.scrollY - lastScrollForRain);
  if (delta > 30) {
    const count = Math.min(Math.floor(delta / 40) + 1, 4);
    spawnLogoDrop(count);
    lastScrollForRain = window.scrollY;
  }

  setTimeout(() => { rainThrottle = false; }, 80);
}, { passive: true });

// ===== STATE =====
const state = {
  mouse:    { x: 0, y: 0 },
  cursor:   { x: 0, y: 0 },
  cursorO:  { x: 0, y: 0 },
  scroll:   0,
  scrollTarget: 0,
};

// ===== LOADER =====
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('lpFill');
  const pct    = document.getElementById('loaderPct');
  let progress = 0;

  const tick = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) { progress = 100; clearInterval(tick); }
    fill.style.width = progress + '%';
    pct.textContent  = Math.floor(progress) + '%';
    if (progress === 100) {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        startHeroAnimations();
      }, 500);
    }
  }, 80);

  document.body.style.overflow = 'hidden';
})();

// ===== HERO STATS COUNTER =====
function startHeroAnimations() {
  document.querySelectorAll('.hero-stats .stat-num').forEach(el => {
    animateCounter(el, 2200);
  });
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    heroStats.style.animation = 'fadeInUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s forwards';
    heroStats.style.opacity   = '0';
  }
}

function animateCounter(el, duration) {
  const target   = parseInt(el.dataset.target);
  const start    = performance.now();
  const easeOut  = t => 1 - Math.pow(1 - t, 3);

  const update = (now) => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(easeOut(t) * target).toLocaleString();
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(update);
}

// ===== CUSTOM CURSOR =====
const cursorOuter = document.getElementById('cursorOuter');
const cursorInner = document.getElementById('cursorInner');

window.addEventListener('mousemove', e => {
  state.mouse.x = e.clientX;
  state.mouse.y = e.clientY;
  cursorInner.style.left = e.clientX + 'px';
  cursorInner.style.top  = e.clientY + 'px';
});

document.querySelectorAll('a, button, .video-card, .sg-card, .filter-btn, .magnetic').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ===== SCROLL CHAPTERS — Apple / DJI style =====
const chapHeroContent = document.getElementById('heroContent');
const chapScrollCue   = document.getElementById('scrollCue');
const chapHero        = document.querySelector('.hero');
const chapContainers  = [
  document.querySelector('.videos-section  > .container'),
  document.querySelector('.about-section   > .container'),
  document.querySelector('.contact-section > .container'),
  document.querySelector('.cin-banner-content'),
];

function updateScrollChapters() {
  const sy = window.scrollY;
  const vh = window.innerHeight;

  // 1 — Hero exit : contenu s'estompe et monte en scrollant
  if (chapHero && chapHeroContent) {
    const p = Math.max(0, Math.min(1, sy / (chapHero.offsetHeight * 0.6)));
    chapHeroContent.style.opacity   = Math.max(0, 1 - p * 1.9);
    chapHeroContent.style.transform = `translateY(${p * -90}px) scale(${1 - p * 0.07})`;
    if (chapScrollCue) chapScrollCue.style.opacity = Math.max(0, 1 - sy / 100);
  }

  // 2 — Sections : révélation précise liée au scroll
  chapContainers.forEach(cont => {
    if (!cont) return;
    const rect = cont.getBoundingClientRect();
    const p    = Math.max(0, Math.min(1, (vh * 0.9 - rect.top) / (vh * 0.5)));
    cont.style.opacity   = p;
    cont.style.transform = p < 1 ? `translateY(${(1 - p) * 60}px)` : 'none';
  });
}

// ===== RAF LOOP =====
let rafId;
function raf() {
  // Cursor outer — lerp for smooth lag
  state.cursorO.x = lerp(state.cursorO.x, state.mouse.x, 0.12);
  state.cursorO.y = lerp(state.cursorO.y, state.mouse.y, 0.12);
  cursorOuter.style.left = state.cursorO.x + 'px';
  cursorOuter.style.top  = state.cursorO.y + 'px';

  updateParallax();
  updateTransitions();
  updateScrollChapters();

  rafId = requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ===== HERO PARALLAX (mouse + scroll) =====
const layerBg  = document.getElementById('layerBg');
const layerMid = document.getElementById('layerMid');
const layerFg  = document.getElementById('layerFg');
const aboutBg  = document.getElementById('aboutBg');

let scrollY = 0;
window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

function updateParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const rect    = hero.getBoundingClientRect();
  const inView  = rect.bottom > 0;

  if (inView) {
    const sx = scrollY;
    // Scroll parallax
    if (layerBg)  layerBg.style.transform  = `translateY(${sx * 0.15}px)`;
    if (layerMid) layerMid.style.transform = `translateY(${sx * 0.3}px)`;
    if (layerFg)  layerFg.style.transform  = `translateY(${sx * -0.1}px)`;

    // Mouse parallax
    const cx = (state.mouse.x / window.innerWidth  - 0.5);
    const cy = (state.mouse.y / window.innerHeight - 0.5);

    if (layerBg)  layerBg.style.transform  += ` translate(${cx * 12}px, ${cy * 12 + sx * 0.15}px)`;
    if (layerMid) layerMid.style.transform += ` translate(${cx * 22}px, ${cy * 22}px)`;
    if (layerFg)  layerFg.style.transform  += ` translate(${cx * 35}px, ${cy * 35}px)`;
  }

  // About section parallax bg
  if (aboutBg) {
    const aRect = document.getElementById('about')?.getBoundingClientRect();
    if (aRect && aRect.top < window.innerHeight && aRect.bottom > 0) {
      const progress = 1 - (aRect.top / window.innerHeight);
      aboutBg.style.transform = `translateY(${progress * -60}px)`;
    }
  }
}

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const dx   = (e.clientX - rect.left - rect.width  / 2) * 0.3;
    const dy   = (e.clientY - rect.top  - rect.height / 2) * 0.3;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    el.style.transform  = 'translate(0,0)';
    setTimeout(() => el.style.transition = '', 500);
  });
});

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Active nav link
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const a = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => navObserver.observe(s));

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinksList = document.getElementById('navLinks');
hamburger?.addEventListener('click', () => {
  const open = navLinksList.classList.toggle('open');
  const [s1, s2, s3] = hamburger.querySelectorAll('span');
  s1.style.transform = open ? 'rotate(45deg) translate(4px,4px)' : '';
  s2.style.opacity   = open ? '0' : '1';
  s3.style.transform = open ? 'rotate(-45deg) translate(4px,-4px)' : '';
});
navLinksList?.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    navLinksList.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
  });
});

// ===== SCROLL REVEAL (IntersectionObserver) =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up, .reveal-clip, .reveal-left, .reveal-line, [data-aos]').forEach(el => {
  revealObserver.observe(el);
});

// ===== IMAGE TRANSITIONS — scroll-driven gradient fade =====
const transitionEls = document.querySelectorAll('.img-transition');

function updateTransitions() {
  const vh = window.innerHeight;
  transitionEls.forEach(el => {
    const bg = el.querySelector('.it-bg');
    if (!bg) return;
    const rect = el.getBoundingClientRect();
    const elH  = el.offsetHeight;

    if (rect.bottom < -80 || rect.top > vh + 80) return;

    // 0 = element bottom enters viewport, 1 = element top exits top
    const progress = (vh - rect.top) / (vh + elH);
    const clamped  = Math.max(0, Math.min(1, progress));

    // Bell-curve opacity: 0 → 1 → 0 as element scrolls through viewport
    const fade     = Math.sin(clamped * Math.PI);
    // Slow parallax: image moves less than the scroll
    const parallax = (0.5 - clamped) * 70;

    bg.style.opacity   = fade;
    bg.style.transform = `translateY(${parallax}px)`;
  });
}

// ===== SKILL BARS =====
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.si-fill').forEach(f => {
        f.style.width = f.dataset.w + '%';
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const skillList = document.querySelector('.skill-list');
if (skillList) skillObserver.observe(skillList);

// ===== SCROLL COUNTERS (about/other sections) =====
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target, 1800);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num:not(.hero-stats .stat-num)').forEach(el => {
  counterObserver.observe(el);
});

// ===== VIDEO AUTOPLAY ON SCROLL =====
const videoPlayObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const video = entry.target.querySelector('.vc-video');
    if (!video) return;
    if (entry.isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.video-card').forEach(card => {
  const video = card.querySelector('.vc-video');
  if (!video) return;
  video.addEventListener('loadeddata', () => video.classList.add('loaded'));
  if (video.readyState >= 2) video.classList.add('loaded');
  videoPlayObserver.observe(card);
});

// ===== VIDEO MODAL =====
const vmodal      = document.getElementById('vmodal');
const vmodalVideo = document.getElementById('vmodalVideo');
const vmodalClose = document.getElementById('vmodalClose');
const vmodalBack  = document.getElementById('vmodalBackdrop');

function openModal(src) {
  vmodalVideo.src = src;
  vmodal.classList.add('open');
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  vmodalVideo.play().catch(() => {});
}
function closeModal() {
  vmodal.classList.remove('open');
  document.body.classList.remove('modal-open');
  vmodalVideo.pause();
  vmodalVideo.src = '';
  document.body.style.overflow = '';
}

document.querySelectorAll('.vc-play').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const card = btn.closest('.video-card');
    const src  = card?.dataset.src;
    if (src) openModal(src);
  });
});

vmodalClose?.addEventListener('click', closeModal);
vmodalBack?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== LOGO BURST =====
function burstLogo(x, y) {
  const count = 14;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist  = 55 + Math.random() * 90;
    const size  = 14 + Math.random() * 22;
    const dur   = 0.55 + Math.random() * 0.45;
    const rot   = (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 250);

    const p = document.createElement('div');
    p.className = 'logo-burst';
    p.style.cssText = `
      left:${x}px; top:${y}px;
      width:${size}px; height:${size}px;
      --ex:${Math.cos(angle) * dist}px;
      --ey:${Math.sin(angle) * dist}px;
      --er:${rot}deg;
      --dur:${dur}s;
    `;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove(), { once: true });
  }
}

// ===== SCREEN GLITCH TRIGGER =====
function triggerScreenGlitch() {
  const el = document.createElement('div');
  el.className = 'glitch-screen';
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

// ===== LIKE & COMMENT SYSTEM =====
function getLikeData(id) {
  return JSON.parse(localStorage.getItem('asval_likes') || '{}')[id] || { count: 0, liked: false };
}
function saveLikeData(id, data) {
  const all = JSON.parse(localStorage.getItem('asval_likes') || '{}');
  all[id] = data; localStorage.setItem('asval_likes', JSON.stringify(all));
}
function getComments(id) {
  return JSON.parse(localStorage.getItem('asval_comments') || '{}')[id] || [];
}
function saveComment(id, author, text) {
  const all = JSON.parse(localStorage.getItem('asval_comments') || '{}');
  if (!all[id]) all[id] = [];
  all[id].push({ author: author.trim() || 'Anonyme', text: text.trim() });
  localStorage.setItem('asval_comments', JSON.stringify(all));
  return all[id];
}
function renderComments(list, comments) {
  list.innerHTML = '';
  if (!comments.length) {
    list.innerHTML = '<p class="vc-comment-empty">Aucun commentaire — sois le premier !</p>';
    return;
  }
  comments.forEach(c => {
    const el = document.createElement('div');
    el.className = 'vc-comment-item';
    el.innerHTML = `<div class="vc-comment-author">${c.author}</div><div class="vc-comment-text">${c.text}</div>`;
    list.appendChild(el);
  });
  list.scrollTop = list.scrollHeight;
}

document.querySelectorAll('.video-card').forEach(card => {
  const videoId = card.dataset.src || Math.random().toString(36);
  const likeData = getLikeData(videoId);
  const comments = getComments(videoId);

  // Inject interact bar
  const interact = document.createElement('div');
  interact.className = 'vc-interact';
  interact.innerHTML = `
    <button class="vc-like-btn${likeData.liked ? ' liked' : ''}">
      <svg viewBox="0 0 24 24" fill="${likeData.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08A6.003 6.003 0 0 1 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/>
      </svg>
      <span class="vc-like-count">${likeData.count}</span>
    </button>
    <button class="vc-comment-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span class="vc-comment-count">${comments.length}</span>
    </button>`;
  card.appendChild(interact);

  // Inject comment panel
  const panel = document.createElement('div');
  panel.className = 'vc-comments';
  panel.innerHTML = `
    <div class="vc-comment-list"></div>
    <div class="vc-comment-form">
      <div class="vc-comment-inputs">
        <input class="vc-input vc-input-name" type="text" placeholder="Pseudo" maxlength="20" />
        <input class="vc-input vc-input-text" type="text" placeholder="Ton commentaire..." maxlength="200" />
      </div>
      <button class="vc-submit">Envoyer →</button>
    </div>`;
  card.appendChild(panel);
  renderComments(panel.querySelector('.vc-comment-list'), comments);

  // Like toggle
  const likeBtn = interact.querySelector('.vc-like-btn');
  likeBtn.addEventListener('click', () => {
    const d = getLikeData(videoId);
    d.liked = !d.liked; d.count = Math.max(0, d.count + (d.liked ? 1 : -1));
    saveLikeData(videoId, d);
    likeBtn.classList.toggle('liked', d.liked);
    likeBtn.querySelector('svg').setAttribute('fill', d.liked ? 'currentColor' : 'none');
    likeBtn.querySelector('.vc-like-count').textContent = d.count;
    likeBtn.classList.remove('pop');
    requestAnimationFrame(() => likeBtn.classList.add('pop'));
    if (d.liked) {
      const r = likeBtn.getBoundingClientRect();
      burstLogo(r.left + r.width / 2, r.top + r.height / 2);
      triggerScreenGlitch();
      likeSound.currentTime = 0;
      likeSound.play().catch(() => {});
    }
  });
  likeBtn.addEventListener('animationend', () => likeBtn.classList.remove('pop'));

  // Comment panel toggle
  interact.querySelector('.vc-comment-btn').addEventListener('click', () => {
    panel.classList.toggle('open');
  });

  // Submit comment
  const submitComment = () => {
    const nameEl = panel.querySelector('.vc-input-name');
    const textEl = panel.querySelector('.vc-input-text');
    if (!textEl.value.trim()) return;
    const updated = saveComment(videoId, nameEl.value, textEl.value);
    textEl.value = '';
    interact.querySelector('.vc-comment-count').textContent = updated.length;
    renderComments(panel.querySelector('.vc-comment-list'), updated);
  };
  panel.querySelector('.vc-submit').addEventListener('click', submitComment);
  panel.querySelector('.vc-input-text').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitComment();
  });

  // Custom cursor hover for new buttons
  [likeBtn, interact.querySelector('.vc-comment-btn'), panel.querySelector('.vc-submit')].forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
});

// ===== VIDEO FILTERS =====
const filterBtns = document.querySelectorAll('.filter-btn');
const videoCards  = document.querySelectorAll('.video-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    videoCards.forEach((card, i) => {
      const show = filter === 'all' || card.dataset.category === filter;
      if (show) {
        card.style.display = '';
        setTimeout(() => card.classList.add('in-view'), i * 60);
      } else {
        card.classList.remove('in-view');
        setTimeout(() => card.style.display = 'none', 300);
      }
    });
  });
});

// ===== VIDEO CARD 3D TILT =====
videoCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transition = 'border-color 0.4s, box-shadow 0.4s, transform 0.15s';
    card.style.transform  = `translateY(-4px) perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'all 0.5s cubic-bezier(0.16,1,0.3,1)';
    card.style.transform  = '';
  });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

// ===== GLITCH EFFECT on logo (random) =====
const logoEls = document.querySelectorAll('.logo');
setInterval(() => {
  logoEls.forEach(logo => {
    logo.style.filter = 'blur(0.5px) brightness(1.3)';
    setTimeout(() => logo.style.filter = '', 80);
  });
}, 6000 + Math.random() * 4000);

// ===== MOBILE ENHANCEMENTS =====
const isMobile = () => window.innerWidth <= 768;

function initMobileCarousel() {
  if (!isMobile()) return;
  const grid  = document.getElementById('videoGrid');
  const cards = Array.from(grid.querySelectorAll('.video-card'));
  if (!cards.length) return;

  // Dots
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'carousel-dots';
  cards.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'c-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => {
      grid.scrollTo({ left: cards[i].offsetLeft - 20, behavior: 'smooth' });
    });
    dotsWrap.appendChild(dot);
  });
  grid.after(dotsWrap);

  // Swipe hint
  const hint = document.createElement('div');
  hint.className = 'swipe-hint';
  hint.innerHTML = 'SWIPE <span class="swipe-arrow">→</span>';
  dotsWrap.after(hint);

  // Sync dots on scroll
  let t;
  grid.addEventListener('scroll', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const cx = grid.scrollLeft + grid.clientWidth / 2;
      let closest = 0, minD = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - cx);
        if (d < minD) { minD = d; closest = i; }
      });
      dotsWrap.querySelectorAll('.c-dot').forEach((d, i) => d.classList.toggle('active', i === closest));
    }, 30);
  }, { passive: true });
}

function initGyroParallax() {
  if (!window.DeviceOrientationEvent || !isMobile()) return;
  window.addEventListener('deviceorientation', e => {
    if (!e.gamma && !e.beta) return;
    const tx = Math.max(-1, Math.min(1, (e.gamma || 0) / 20));
    const ty = Math.max(-1, Math.min(1, ((e.beta  || 45) - 45) / 20));
    if (layerBg)  layerBg.style.transform  = `translate(${tx * 10}px, ${ty * 6}px)`;
    if (layerMid) layerMid.style.transform = `translate(${tx * 18}px, ${ty * 12}px)`;
    if (layerFg)  layerFg.style.transform  = `translate(${tx * 28}px, ${ty * 18}px)`;
  }, { passive: true });
}

function initTouchRipple() {
  document.querySelectorAll('.sg-card, .cta-primary, .cta-ghost, .filter-btn, .vc-play').forEach(el => {
    el.addEventListener('touchstart', e => {
      const rect   = el.getBoundingClientRect();
      const touch  = e.touches[0];
      const size   = Math.max(rect.width, rect.height) * 2.5;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${touch.clientX - rect.left - size / 2}px;top:${touch.clientY - rect.top - size / 2}px;`;
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }, { passive: true });
  });
}

window.addEventListener('load', () => {
  initMobileCarousel();
  initGyroParallax();
  initTouchRipple();
});

// ===== SCROLL PROGRESS LINE =====
const progressLine = document.createElement('div');
progressLine.style.cssText = `
  position:fixed; top:0; left:0; height:1px; z-index:10000; pointer-events:none;
  background:rgba(255,255,255,0.7);
  box-shadow:0 0 8px rgba(255,255,255,0.3);
  transition:width 0.1s linear;
`;
document.body.appendChild(progressLine);

window.addEventListener('scroll', () => {
  const max  = document.body.scrollHeight - window.innerHeight;
  const pct  = (window.scrollY / max) * 100;
  progressLine.style.width = pct + '%';
}, { passive: true });
