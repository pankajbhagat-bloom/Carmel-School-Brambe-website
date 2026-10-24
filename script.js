  // Active nav on scroll
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (document.getElementById('home')) window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current || (current === '' && a.getAttribute('href') === '#')) a.classList.add('active');
    });
  });

  // Animated stat counter
  const statsEl = document.querySelector('.stats-section');
  let counted = false;
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      document.querySelectorAll('.stat-num[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '+';
        let count = 0;
        const step = Math.ceil(target / 50);
        const timer = setInterval(() => {
          count = Math.min(count + step, target);
          el.textContent = count + suffix;
          if (count >= target) clearInterval(timer);
        }, 28);
      });
    }
  }, { threshold: 0.4 });
  if (statsEl) observer.observe(statsEl);

  // Smooth card entrance on scroll
  const cards = document.querySelectorAll('.academic-card, .feature-item');
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = e.target.classList.contains('feature-item') ? 'none' : 'translateY(0)';
        }, i * 80);
        cardObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(20px)';
    c.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.25s, border-color 0.25s';
    cardObserver.observe(c);
  });

  // Scroll reveal for major sections
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  // Admission form submission (Web3Forms)
  const admissionForm = document.getElementById('admissionForm');
  if (admissionForm) {
    const keyInput = admissionForm.querySelector('input[name="access_key"]');
    if (keyInput && keyInput.value.indexOf('YOUR_') === 0) {
      admissionForm.style.display = 'none';
      const fb = document.getElementById('formFallback');
      if (fb) fb.style.display = 'block';
    }
    const submitBtn = document.getElementById('admissionSubmitBtn');
    const successMsg = document.getElementById('formSuccessMsg');
    const errorMsg = document.getElementById('formErrorMsg');
    admissionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      successMsg.style.display = 'none';
      errorMsg.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      try {
        const formData = new FormData(admissionForm);
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        const result = await res.json();
        if (result.success) {
          successMsg.style.display = 'block';
          admissionForm.reset();
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          errorMsg.style.display = 'block';
        }
      } catch (err) {
        errorMsg.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Enquiry';
      }
    });
  }

  // Mobile hamburger menu
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileMenuOverlay');
  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    overlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.contains('active') ? closeMenu() : openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  // Admission popup (homepage). Drop images/admission-notice.jpg in the repo to show it as the poster.
  (function () {
    const modal = document.getElementById('admPopup');
    if (!modal) return;
    const img = document.getElementById('admPopupImg');
    const textCard = document.getElementById('admPopupText');
    const closeBtn = document.getElementById('admPopupClose');
    let lastFocus = null;

    const probe = new Image();
    probe.onload = function () { img.src = probe.src; img.hidden = false; textCard.hidden = true; };
    probe.src = img.getAttribute('data-src');

    function openPopup() {
      lastFocus = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function closePopup() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      try { sessionStorage.setItem('admPopupSeen', '1'); } catch (e) {}
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    closeBtn.addEventListener('click', closePopup);
    modal.addEventListener('click', function (e) { if (e.target === modal) closePopup(); });
    modal.querySelectorAll('[data-close]').forEach(function (el) { el.addEventListener('click', closePopup); });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') closePopup();
      if (e.key === 'Tab') {
        const f = modal.querySelectorAll('a[href], button:not([disabled])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    let seen = false;
    try { seen = sessionStorage.getItem('admPopupSeen') === '1'; } catch (e) {}
    if (!seen) setTimeout(openPopup, 900);
  })();
