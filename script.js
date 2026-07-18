// ─── Motion & pointer preferences ──────────────────────────────────────────
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ─── Preloader ─────────────────────────────────────────────────────────────
const preloader = document.getElementById('preloader');
const skipPreload = sessionStorage.getItem('visited');

if (skipPreload) {
  preloader.classList.add('done');
} else {
  sessionStorage.setItem('visited', '1');
  setTimeout(() => preloader.classList.add('done'), 1400);
}

// ─── Hero headline: split into letters for a per-character rise ────────────
if (!reduceMotion) {
  document.querySelectorAll('.h1-line').forEach(line => {
    const target = line.querySelector('em') || line;
    const text = target.textContent;
    target.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.style.setProperty('--ci', i);
      s.textContent = ch;
      target.appendChild(s);
    });
    line.classList.add('has-chars');
  });
}

// ─── Custom cursor (desktop / fine pointer only) ────────────────────────────
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

if (finePointer) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    document.body.classList.add('cursor-ready');
  });

  // Expand ring on interactive elements
  document.querySelectorAll('a, button, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Smooth ring lerp loop
  (function loop() {
    rx += (mx - rx) * .14;
    ry += (my - ry) * .14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
}

// ─── Scroll engine: nav, progress line, layered parallax ───────────────────
const nav         = document.getElementById('nav');
const progress    = document.getElementById('scroll-progress');
const heroBg      = document.querySelector('.hero-bg');
const heroContent = document.querySelector('.hero-content');
const imageBreak  = document.querySelector('.image-break');
const breakBg     = document.querySelector('.image-break-bg');
const heroH       = () => document.getElementById('hero').offsetHeight;

let ticking = false;

function updateScroll() {
  ticking = false;
  const y = window.scrollY;

  nav.classList.toggle('scrolled', y > 60);

  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  if (reduceMotion) return;

  const h = heroH();
  if (heroBg && y < h * 1.2) {
    // Background drifts down slowly, headline drifts up faster and fades —
    // two layers moving apart is what creates the depth
    heroBg.style.transform = `translateY(${y * 0.28}px)`;
    if (heroContent) {
      if (y > 0) heroContent.classList.add('parallax');
      heroContent.style.transform = `translateY(${y * -0.12}px)`;
      heroContent.style.opacity = Math.max(1 - y / (h * 0.85), 0);
    }
  }

  if (imageBreak && breakBg && imageBreak.offsetParent !== null) {
    const r = imageBreak.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) {
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      breakBg.style.transform = `translateY(${p * -10}%)`;
    }
  }
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateScroll);
  }
}, { passive: true });
updateScroll();

// ─── Mobile nav ────────────────────────────────────────────────────────────
const toggle   = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// ─── Scroll reveal with entrance stagger ───────────────────────────────────
// Elements entering the viewport in the same frame cascade in sequence
const revealObserver = new IntersectionObserver(entries => {
  entries
    .filter(e => e.isIntersecting)
    .forEach((e, i) => {
      e.target.style.transitionDelay = `${Math.min(i * 90, 450)}ms`;
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    });
}, { threshold: 0.12 });

// Hold the hero reveal until the preloader curtain starts lifting,
// so the headline letters rise into view rather than behind it
document.querySelectorAll('.reveal, .clip-reveal').forEach(el => {
  if (el === heroContent && !skipPreload) return;
  revealObserver.observe(el);
});
if (heroContent && !skipPreload) {
  setTimeout(() => revealObserver.observe(heroContent), 1100);
}

// ─── Magnetic buttons (fine pointer only) ──────────────────────────────────
if (finePointer && !reduceMotion) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * .15}px, ${y * .3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ─── Count-up animation on stats ───────────────────────────────────────────
function formatCount(n, target) {
  if (target >= 1000) return n >= 1000 ? '1,000' : n.toLocaleString();
  return String(n);
}

const countEls = document.querySelectorAll('.count[data-target]');
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target, 10);
    countObserver.unobserve(el);

    if (reduceMotion) {
      el.textContent = formatCount(target, target);
      return;
    }

    const dur   = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / dur, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCount(Math.round(eased * target), target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });

countEls.forEach(el => countObserver.observe(el));

// ─── Footer year ───────────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ─── Contact form ──────────────────────────────────────────────────────────
const form   = document.querySelector('.contact-form');
const status = form.querySelector('.form-status');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  status.className = 'form-status';
  status.textContent = '';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      status.classList.add('success');
      status.textContent = 'Thank you — your message has been sent.';
      form.reset();
    } else {
      throw new Error();
    }
  } catch {
    status.classList.add('error');
    status.textContent = 'Something went wrong. Please email directly.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send message';
  }
});
