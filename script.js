// ─── Preloader ─────────────────────────────────────────────────────────────
const preloader = document.getElementById('preloader');
const skipPreload = sessionStorage.getItem('visited');

if (skipPreload) {
  preloader.classList.add('done');
} else {
  sessionStorage.setItem('visited', '1');
  setTimeout(() => preloader.classList.add('done'), 1400);
}

// ─── Custom cursor (desktop / fine pointer only) ────────────────────────────
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let rx = 0, ry = 0; // ring lags behind dot for smooth feel

  document.addEventListener('mousemove', e => {
    const x = e.clientX, y = e.clientY;
    dot.style.left  = x + 'px';
    dot.style.top   = y + 'px';
    // Lerp ring toward cursor on next frame
    rx += (x - rx) * .18;
    ry += (y - ry) * .18;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    document.body.classList.add('cursor-ready');
  });

  // Expand ring on interactive elements
  document.querySelectorAll('a, button, .player-play, .player-bar, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Smooth ring lerp loop
  (function loop() {
    if (document.body.classList.contains('cursor-ready')) {
      const x = parseFloat(dot.style.left) || 0;
      const y = parseFloat(dot.style.top)  || 0;
      rx += (x - rx) * .14;
      ry += (y - ry) * .14;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
    }
    requestAnimationFrame(loop);
  })();
}

// ─── Nav scroll & parallax ─────────────────────────────────────────────────
const nav    = document.getElementById('nav');
const heroBg = document.querySelector('.hero-bg');
const heroH  = () => document.getElementById('hero').offsetHeight;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 60);
  if (heroBg && y < heroH() * 1.2) {
    heroBg.style.transform = `translateY(${y * 0.28}px)`;
  }
}, { passive: true });

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

// ─── Scroll reveal ─────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal, .clip-reveal').forEach(el => revealObserver.observe(el));

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
    const dur    = 1400;
    const start  = performance.now();
    countObserver.unobserve(el);

    function step(now) {
      const progress = Math.min((now - start) / dur, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = formatCount(value, target);
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
