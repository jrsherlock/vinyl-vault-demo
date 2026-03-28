/* ============================================
   IYPAA 10 — Primordial Ooze
   Main JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- Countdown Timer ---
  const CONFERENCE_DATE = new Date('2026-08-14T15:00:00-05:00');

  function updateCountdown() {
    const now = new Date();
    const diff = CONFERENCE_DATE - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '0';
      document.getElementById('cd-hours').textContent = '0';
      document.getElementById('cd-mins').textContent = '0';
      document.getElementById('cd-secs').textContent = '0';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent = days;
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --- Mobile Navigation ---
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('nav__links--open');
    navToggle.classList.toggle('nav__toggle--active');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('nav__links--open');
      navToggle.classList.remove('nav__toggle--active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // --- Sticky Nav Background ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // --- Schedule Tabs ---
  const tabs = document.querySelectorAll('.schedule__tab');
  const days = document.querySelectorAll('.schedule__day');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const day = this.dataset.day;
      tabs.forEach(function (t) { t.classList.remove('schedule__tab--active'); });
      days.forEach(function (d) { d.classList.remove('schedule__day--active'); });
      this.classList.add('schedule__tab--active');
      document.getElementById('day-' + day).classList.add('schedule__day--active');
    });
  });

  // --- Scroll Reveal ---
  function initReveal() {
    var reveals = document.querySelectorAll(
      '.section__header, .about__card, .about__text, .about__stats, ' +
      '.speaker-card, .venue__info, .venue__map, ' +
      '.register__card, .register__scholarship, ' +
      '.faq__item, .contact__info, .contact__form'
    );
    reveals.forEach(function (el) { el.classList.add('reveal'); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('reveal--visible'); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(function (el) { observer.observe(el); });
  }
  initReveal();

  // --- Animated Stat Counters ---
  function animateCounters() {
    var counters = document.querySelectorAll('[data-count]');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          var target = parseInt(entry.target.dataset.count, 10);
          var duration = 2000;
          var startTime = null;
          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - (1 - progress) * (1 - progress);
            entry.target.textContent = Math.floor(eased * target);
            if (progress < 1) { requestAnimationFrame(step); }
            else { entry.target.textContent = target; }
          }
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { observer.observe(el); });
  }
  animateCounters();

  // --- Card Mouse Glow Effect ---
  document.querySelectorAll('.about__card, .speaker-card, .register__card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  // --- Ooze Drip Canvas ---
  function initOozeCanvas() {
    var canvas = document.getElementById('ooze-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var drips = [];
    var maxDrips = 15;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    function Drip() { this.reset(); }
    Drip.prototype.reset = function () {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.width = 2 + Math.random() * 4;
      this.speed = 0.5 + Math.random() * 1.5;
      this.length = 30 + Math.random() * 80;
      this.opacity = 0.1 + Math.random() * 0.3;
      this.hue = 100 + Math.random() * 40;
      this.bulge = this.width * (1.5 + Math.random());
    };
    Drip.prototype.update = function () {
      this.y += this.speed;
      if (this.y > canvas.height + this.length) this.reset();
    };
    Drip.prototype.draw = function () {
      ctx.save();
      var gradient = ctx.createLinearGradient(this.x, this.y - this.length, this.x, this.y);
      gradient.addColorStop(0, 'hsla(' + this.hue + ', 100%, 50%, 0)');
      gradient.addColorStop(0.7, 'hsla(' + this.hue + ', 100%, 50%, ' + this.opacity + ')');
      gradient.addColorStop(1, 'hsla(' + this.hue + ', 100%, 50%, ' + this.opacity * 0.5 + ')');
      ctx.beginPath();
      ctx.moveTo(this.x - this.width / 2, this.y - this.length);
      ctx.lineTo(this.x + this.width / 2, this.y - this.length);
      ctx.lineTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x - this.width / 2, this.y);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.bulge, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + this.hue + ', 100%, 50%, ' + this.opacity * 0.6 + ')';
      ctx.fill();
      ctx.shadowColor = 'hsla(' + this.hue + ', 100%, 50%, 0.3)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.bulge * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + this.hue + ', 100%, 60%, ' + this.opacity * 0.3 + ')';
      ctx.fill();
      ctx.restore();
    };

    for (var i = 0; i < maxDrips; i++) {
      var drip = new Drip();
      drip.y = Math.random() * canvas.height;
      drips.push(drip);
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drips.forEach(function (drip) { drip.update(); drip.draw(); });
      requestAnimationFrame(animate);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { animate(); }
  }
  initOozeCanvas();

  // --- Contact Form Handler ---
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = 'Sent! We\'ll be in touch.';
      btn.disabled = true;
      btn.style.background = 'var(--ooze-600)';
      setTimeout(function () {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  // --- Smooth Scroll for Safari ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 70;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

})();
