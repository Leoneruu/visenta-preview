/* ======================================================
   Sundara Café · script.js
   Vanilla JS – keine Frameworks
   ====================================================== */
(function () {
  'use strict';

  /* ---------- Jahr im Footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: Scroll-Zustand ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobiles Menü ---------- */
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
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

  /* ---------- Scroll-Animationen via IntersectionObserver ---------- */
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

  /* ---------- Smooth-Scroll mit Offset für fixe Nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      if (a.id === 'openImpressum' || a.id === 'openDatenschutz') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Reservierung: Datum & Uhrzeiten ---------- */
  const dateInput = document.getElementById('date');
  const timeSelect = document.getElementById('time');

  const pad = (n) => String(n).padStart(2, '0');
  const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (dateInput) {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    dateInput.min = fmtDate(today);
    dateInput.max = fmtDate(maxDate);
  }

  // Öffnungszeiten je Wochentag: [öffnetStunde, öffnetMin, letzterSlotStunde, letzterSlotMin]
  // 0 = Sonntag, 1 = Montag … 6 = Samstag
  const hours = {
    0: [10, 0, 17, 30], // Sonntag 10–18
    1: [8, 0, 18, 30],  // Mo–Fr 08–19
    2: [8, 0, 18, 30],
    3: [8, 0, 18, 30],
    4: [8, 0, 18, 30],
    5: [8, 0, 18, 30],
    6: [9, 0, 18, 30],  // Samstag 09–19
  };

  const buildTimes = (selectedDateStr) => {
    if (!timeSelect) return;
    const current = timeSelect.value;
    timeSelect.innerHTML = '<option value="" disabled selected>Bitte wählen</option>';

    let dayOfWeek = 1;
    if (selectedDateStr) dayOfWeek = new Date(selectedDateStr + 'T00:00:00').getDay();

    const [oh, om, ch, cm] = hours[dayOfWeek];
    let h = oh, m = om;
    while (h < ch || (h === ch && m <= cm)) {
      const slot = `${pad(h)}:${pad(m)}`;
      const opt = document.createElement('option');
      opt.value = slot;
      opt.textContent = slot + ' Uhr';
      timeSelect.appendChild(opt);
      m += 30;
      if (m >= 60) { m -= 60; h += 1; }
    }

    if (current && timeSelect.querySelector(`option[value="${current}"]`)) {
      timeSelect.value = current;
    }
  };

  buildTimes('');
  if (dateInput) dateInput.addEventListener('change', () => buildTimes(dateInput.value));

  /* ---------- Formspree-Versand ---------- */
  const form = document.getElementById('kontaktForm');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (formSuccess) formSuccess.hidden = true;
      if (formError) formError.hidden = true;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wird gesendet …'; }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          form.reset();
          buildTimes('');
          if (formSuccess) {
            formSuccess.hidden = false;
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          throw new Error('Formspree-Antwort nicht ok');
        }
      } catch (err) {
        if (formError) formError.hidden = false;
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      }
    });
  }

  /* ---------- Modal: Impressum / Datenschutz ---------- */
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const impressumHTML = `
    <p><strong>Angaben gemäß § 5 DDG (TMG)</strong></p>
    <p><strong>Sundara Café</strong><br>
    Markt<br>
    37073 Göttingen</p>
    <p><strong>Vertretungsberechtigt:</strong><br>[Name der Inhaberin / des Inhabers]</p>
    <p><strong>Kontakt:</strong><br>
    Telefon: [Telefonnummer]<br>
    E-Mail: <a href="mailto:hallo@sundara-cafe.de">hallo@sundara-cafe.de</a></p>
    <p><strong>Umsatzsteuer-ID:</strong> [USt-IdNr. gemäß § 27 a UStG]</p>
    <p>Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV: [Name], Anschrift wie oben.</p>
    <p style="font-size:13px;opacity:.7">Hinweis: Bitte ergänze die mit [ ] markierten Angaben vor Veröffentlichung.</p>
  `;

  const datenschutzHTML = `
    <p>Wir freuen uns über deinen Besuch auf unserer Website. Der Schutz deiner persönlichen Daten ist uns wichtig.</p>
    <p><strong>Verantwortlich</strong> für die Datenverarbeitung im Sinne der DSGVO ist:<br>
    Sundara Café, Markt, 37073 Göttingen.</p>
    <p><strong>Reservierungs- &amp; Kontaktanfragen:</strong> Die im Formular eingegebenen Daten (Name, E-Mail, Telefon, Datum, Uhrzeit, Personenanzahl, Anmerkungen) verarbeiten wir ausschließlich zur Bearbeitung deiner Anfrage gemäß Art. 6 Abs. 1 lit. b DSGVO. Der Versand erfolgt über den Dienstleister Formspree (Formspree Inc., USA).</p>
    <p><strong>Google Maps:</strong> Zur Darstellung unseres Standorts binden wir Google Maps (Google Ireland Ltd.) ein. Dabei können Daten an Google übertragen werden.</p>
    <p><strong>Speicherdauer:</strong> Deine Daten werden gelöscht, sobald sie für die Zweckerreichung nicht mehr erforderlich sind.</p>
    <p><strong>Deine Rechte:</strong> Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wende dich dazu an die oben stehenden Kontaktdaten.</p>
    <p style="font-size:13px;opacity:.7">Hinweis: Dies ist eine Vorlage. Bitte lass den Text vor Veröffentlichung rechtlich prüfen.</p>
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
