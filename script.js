// ─── Nav scroll ────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
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

// ─── Custom audio players ──────────────────────────────────────────────────
let currentAudio = null;
let currentItem  = null;

function fmt(s) {
  if (!isFinite(s)) return '–:––';
  const m = Math.floor(s / 60);
  const sec = String(Math.floor(s % 60)).padStart(2, '0');
  return `${m}:${sec}`;
}

document.querySelectorAll('.audio-item').forEach(item => {
  const src      = item.dataset.src;
  const playBtn  = item.querySelector('.player-play');
  const bar      = item.querySelector('.player-bar');
  const fill     = item.querySelector('.player-fill');
  const current  = item.querySelector('.player-current');
  const duration = item.querySelector('.player-duration');
  const iconPlay  = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');

  let audio = null;

  function ensureAudio() {
    if (audio) return;
    audio = new Audio(src);
    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = pct + '%';
      bar.style.setProperty('--pct', pct + '%');
      bar.setAttribute('aria-valuenow', Math.round(pct));
      current.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('durationchange', () => {
      duration.textContent = fmt(audio.duration);
    });
    audio.addEventListener('ended', () => setPlaying(false));
  }

  function setPlaying(playing) {
    iconPlay.style.display  = playing ? 'none' : '';
    iconPause.style.display = playing ? '' : 'none';
    playBtn.classList.toggle('playing', playing);
  }

  playBtn.addEventListener('click', () => {
    ensureAudio();
    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    // pause any other track
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      setPlaying.call(currentItem, false);
      currentItem.querySelector('.player-play').classList.remove('playing');
      currentItem.querySelector('.icon-play').style.display  = '';
      currentItem.querySelector('.icon-pause').style.display = 'none';
    }
    currentAudio = audio;
    currentItem  = item;
    audio.play().catch(() => {});
    setPlaying(true);
  });

  // click bar to seek
  bar.addEventListener('click', e => {
    ensureAudio();
    if (!audio.duration) return;
    const rect = bar.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  // keyboard seek on bar
  bar.addEventListener('keydown', e => {
    ensureAudio();
    if (!audio.duration) return;
    if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
    if (e.key === 'ArrowLeft')  audio.currentTime = Math.max(0, audio.currentTime - 5);
  });
});

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
