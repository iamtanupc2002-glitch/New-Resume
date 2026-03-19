const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const revealItems = document.querySelectorAll('.reveal');
const tiltCards = document.querySelectorAll('.tilt-card');
const cursorGlow = document.querySelector('.cursor-glow');

// Theme toggle
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light') body.classList.add('light');

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light');
  localStorage.setItem('portfolio-theme', body.classList.contains('light') ? 'light' : 'dark');
});

// Mobile nav
menuToggle.addEventListener('click', () => {
  const isOpen = mobileNav.style.display === 'flex';
  mobileNav.style.display = isOpen ? 'none' : 'flex';
  body.classList.toggle('menu-open', !isOpen);
});

document.querySelectorAll('.mobile-nav a, .desktop-nav a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.style.display = 'none';
    body.classList.remove('menu-open');
  });
});

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.16 });

revealItems.forEach(item => observer.observe(item));

// Tilt cards
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 10;
      const rotateX = ((y / rect.height) - 0.5) * -10;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// Contact form demo
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  formStatus.textContent = `Thanks ${name}, your message animation-ready demo was submitted.`;
  contactForm.reset();
  setTimeout(() => {
    formStatus.textContent = '';
  }, 3500);
});

// Cursor glow
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorGlow.style.opacity = '1';
});

window.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
});

function animateGlow() {
  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;
  cursorGlow.style.left = `${glowX}px`;
  cursorGlow.style.top = `${glowY}px`;
  requestAnimationFrame(animateGlow);
}
animateGlow();

// Canvas particle + spark/firework system
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
const ambientParticles = [];
const sparks = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createAmbient() {
  ambientParticles.length = 0;
  const count = Math.min(90, Math.floor(width / 18));
  for (let i = 0; i < count; i++) {
    ambientParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: rand(0.6, 2.4),
      alpha: rand(0.08, 0.45),
      speedX: rand(-0.12, 0.12),
      speedY: rand(-0.18, 0.18)
    });
  }
}
createAmbient();
window.addEventListener('resize', createAmbient);

function addSparkBurst(x, y, amount = 14, spread = 1.15) {
  for (let i = 0; i < amount; i++) {
    const angle = rand(0, Math.PI * 2);
    const velocity = rand(0.8, 3.5) * spread;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * velocity + rand(-0.35, 0.35),
      vy: Math.sin(angle) * velocity - rand(0.2, 0.8),
      life: rand(30, 65),
      maxLife: rand(30, 65),
      size: rand(1.8, 3.8),
      gravity: rand(0.028, 0.055),
      hue: rand(24, 48)
    });
  }
}

let moveTick = 0;
window.addEventListener('mousemove', (e) => {
  moveTick += 1;
  if (moveTick % 2 === 0) {
    addSparkBurst(e.clientX, e.clientY, 4, 0.55);
  }
});

window.addEventListener('click', (e) => {
  addSparkBurst(e.clientX, e.clientY, 28, 1.65);
});

// Hero ambient fireworks on load
setTimeout(() => addSparkBurst(window.innerWidth * 0.75, window.innerHeight * 0.24, 34, 1.55), 600);
setTimeout(() => addSparkBurst(window.innerWidth * 0.66, window.innerHeight * 0.30, 24, 1.2), 1100);

function drawAmbient() {
  ambientParticles.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    ctx.beginPath();
    ctx.fillStyle = `rgba(180, 198, 255, ${p.alpha})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSparks() {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += s.gravity;
    s.vx *= 0.992;
    s.life -= 1;

    const alpha = Math.max(s.life / s.maxLife, 0);

    ctx.beginPath();
    ctx.fillStyle = `hsla(${s.hue}, 100%, 62%, ${alpha})`;
    ctx.shadowBlur = 18;
    ctx.shadowColor = `hsla(${s.hue}, 100%, 62%, ${alpha})`;
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.strokeStyle = `hsla(${s.hue}, 100%, 70%, ${alpha * 0.8})`;
    ctx.lineWidth = 1.1;
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 2.6, s.y - s.vy * 2.6);
    ctx.stroke();

    if (s.life <= 0) sparks.splice(i, 1);
  }
}

function animateCanvas() {
  ctx.clearRect(0, 0, width, height);
  drawAmbient();
  drawSparks();
  requestAnimationFrame(animateCanvas);
}
animateCanvas();
