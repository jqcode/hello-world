// ─── Nav scroll & parallax ─────────────────────────────────────────────────
const nav   = document.getElementById('nav');
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
const toggle = document.querySelector('.nav-toggle');
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
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

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
