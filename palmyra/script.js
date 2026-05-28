(function () {
  'use strict';

  // ---------- Year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Nav scroll state ----------
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  const burger = document.getElementById('navBurger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('mobile-open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('mobile-open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- IntersectionObserver reveals ----------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Reservation form ----------
  const dateInput = document.getElementById('resDate');
  const timeSelect = document.getElementById('resTime');
  const form = document.getElementById('reservierungForm');
  const formSuccess = document.getElementById('formSuccess');

  const pad = (n) => String(n).padStart(2, '0');
  const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (dateInput) {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    dateInput.min = fmtDate(today);
    dateInput.max = fmtDate(maxDate);
  }

  const buildTimes = (selectedDateStr) => {
    if (!timeSelect) return;
    const current = timeSelect.value;
    timeSelect.innerHTML = '<option value="" disabled selected>Bitte wählen</option>';

    const slots = [];
    for (let h = 11; h <= 21; h++) {
      slots.push(`${pad(h)}:30`);
      if (h < 21) slots.push(`${pad(h + 1)}:00`);
    }
    const unique = [...new Set(slots)].sort();

    let dayOfWeek = -1;
    if (selectedDateStr) {
      const d = new Date(selectedDateStr + 'T00:00:00');
      dayOfWeek = d.getDay();
    }

    unique.forEach((slot) => {
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = slot + ' Uhr';
      // Sunday closed
      if (dayOfWeek === 0) opt.disabled = true;
      timeSelect.appendChild(opt);
    });

    if (current && timeSelect.querySelector(`option[value="${current}"]:not([disabled])`)) {
      timeSelect.value = current;
    }
  };

  buildTimes('');
  if (dateInput) {
    dateInput.addEventListener('change', () => buildTimes(dateInput.value));
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.querySelectorAll('input, select, textarea, button').forEach((el) => (el.disabled = true));
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ---------- Smooth anchor offset for sticky nav ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      if (a.id === 'openImpressum' || a.id === 'openDatenschutz') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Modal (Impressum / Datenschutz) ----------
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const impressumHTML = `
    <p><strong>Palmyra Syrian Food</strong><br>
    Düstere Straße 10<br>
    37073 Göttingen</p>
    <p><strong>Vertretungsberechtigt:</strong><br>Mohammad Alalawi</p>
    <p><strong>Kontakt:</strong><br>
    E-Mail: <a href="mailto:info@palmyra-goettingen.de">info@palmyra-goettingen.de</a><br>
    Fax: 0800 202 07 702</p>
    <p>Inhaltlich verantwortlich gemäß § 55 Abs. 2 RStV: Mohammad Alalawi, Anschrift wie oben.</p>
  `;

  const datenschutzHTML = `
    <p>Wir freuen uns über Ihren Besuch auf unserer Website. Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen.</p>
    <p><strong>Verantwortlich</strong> für die Datenverarbeitung im Sinne der DSGVO ist:<br>
    Palmyra Syrian Food, Düstere Straße 10, 37073 Göttingen.</p>
    <p><strong>Reservierungsanfragen:</strong> Die in unserem Reservierungsformular eingegebenen Daten (Name, E-Mail, Telefon, Datum, Uhrzeit, Personenanzahl, Anmerkungen) verarbeiten wir ausschließlich zur Bearbeitung Ihrer Anfrage gemäß Art. 6 Abs. 1 lit. b DSGVO.</p>
    <p><strong>Speicherdauer:</strong> Ihre Daten werden gelöscht, sobald sie für die Zweckerreichung nicht mehr erforderlich sind.</p>
    <p><strong>Ihre Rechte:</strong> Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Bitte wenden Sie sich an obenstehende Kontaktdaten.</p>
  `;

  const openModal = (title, html) => {
    if (!modal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  document.getElementById('openImpressum')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('Impressum', impressumHTML);
  });
  document.getElementById('openDatenschutz')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('Datenschutz', datenschutzHTML);
  });
  modal?.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });
})();
