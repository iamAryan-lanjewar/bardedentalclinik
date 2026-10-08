// ===================================================================
// BARDE DENTAL CLINIC — CLIENT APPLICATION SCRIPT
// 16:9 Canvas Stage Engine + Slide Presentation & Modern UX Controls
// ===================================================================

// Global Error Guard: Gracefully prevent third-party / external frame issues from surfacing
window.addEventListener('error', (e) => {
  if (e && e.filename && (e.filename.includes('chrome-extension') || e.filename.includes('maps.google') || e.filename.includes('google.com') || e.filename.includes('googleapis'))) {
    e.preventDefault();
  }
});
window.addEventListener('unhandledrejection', (e) => {
  if (e && e.reason && (String(e.reason).includes('AbortError') || String(e.reason).includes('cancelled') || String(e.reason).includes('ResizeObserver'))) {
    e.preventDefault();
  }
});

// Auto-cleanup any stale service workers from past deployments
try {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) reg.unregister();
    }).catch(() => {});
  }
} catch (_) {}

document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_SLIDES = 11;
  let currentSlide = 1;
  let isSlideMode = false;

  // --- Elements ---
  const body = document.body;
  const sections = document.querySelectorAll('.slide-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const prevSlideBtn = document.getElementById('prevSlideBtn');
  const nextSlideBtn = document.getElementById('nextSlideBtn');
  const currSlideNum = document.getElementById('currSlideNum');

  // Modals & Triggers
  const bookingModal = document.getElementById('bookingModalBackdrop');
  const closeBookingModal = document.getElementById('closeBookingModal');
  const appointmentForm = document.getElementById('appointmentForm');
  const consultationSuccessModal = document.getElementById('consultationSuccessModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');
  const closeSuccessDoneBtn = document.getElementById('closeSuccessDoneBtn');
  const successWhatsAppActionBtn = document.getElementById('successWhatsAppActionBtn');
  const successPatientName = document.getElementById('successPatientName');
  const ticketNameVal = document.getElementById('ticketNameVal');
  const ticketPhoneVal = document.getElementById('ticketPhoneVal');
  const ticketDateVal = document.getElementById('ticketDateVal');
  const ticketTimeVal = document.getElementById('ticketTimeVal');
  const veneerModal = document.getElementById('veneerModalBackdrop');
  const closeVeneerModal = document.getElementById('closeVeneerModal');
  const serviceDrawer = document.getElementById('serviceDrawerBackdrop');
  const closeServiceDrawer = document.getElementById('closeServiceDrawer');
  const appToast = document.getElementById('appToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');

  // Hero interactive hotspots
  const veneerBadgeBtn = document.getElementById('veneerBadgeBtn');
  const offerClickHereBtn = document.getElementById('offerClickHereBtn');


  // =================================================================
  // 2. 16:9 STAGE AUTO-SCALER ENGINE
  // =================================================================
  function updateStageScale() {
    if (window.innerWidth <= 768) {
      document.documentElement.style.setProperty('--stage-scale', '1');
      return;
    }

    const baseWidth = 1024;
    const baseHeight = 576; // Exact 16:9
    const availableWidth = window.innerWidth - 64;
    const availableHeight = window.innerHeight - 80;

    let scale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight);
    scale = Math.min(Math.max(scale, 0.75), 1.65); // clamp between 0.75x and 1.65x for full PC screens

    document.documentElement.style.setProperty('--stage-scale', scale.toFixed(4));
  }

  // Dynamic Hero Connecting Wire Alignment
  function updateConnectingWire() {
    const badge = document.getElementById('veneerBadgeBtn');
    const pin = document.getElementById('heroToothPin');
    const wirePath = document.querySelector('.connecting-wire path');
    const wireSvg = document.querySelector('.connecting-wire');
    const heroStage = document.querySelector('.slide-hero .canvas-stage');
    if (!badge || !pin || !wirePath || !wireSvg || !heroStage) return;

    if (body.classList.contains('mode-continuous') && window.innerWidth >= 1024) {
      const stageRect = heroStage.getBoundingClientRect();
      const badgeRect = badge.getBoundingClientRect();
      const pinRect = pin.getBoundingClientRect();

      const startX = badgeRect.right - stageRect.left - 12;
      const startY = badgeRect.top - stageRect.top + (badgeRect.height * 0.45);
      const endX = pinRect.left - stageRect.left + (pinRect.width / 2);
      const endY = pinRect.top - stageRect.top + (pinRect.height / 2);

      const ctrl1X = startX + (endX - startX) * 0.45;
      const ctrl1Y = Math.min(startY, endY) - 40;
      const ctrl2X = startX + (endX - startX) * 0.75;
      const ctrl2Y = endY - 60;

      wireSvg.setAttribute('viewBox', `0 0 ${stageRect.width} ${stageRect.height}`);
      wirePath.setAttribute('d', `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${ctrl1X.toFixed(1)} ${ctrl1Y.toFixed(1)}, ${ctrl2X.toFixed(1)} ${ctrl2Y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`);
    } else {
      wireSvg.setAttribute('viewBox', '0 0 1024 576');
      wirePath.setAttribute('d', 'M 438 88 C 550 50, 715 150, 792 251');
    }
  }

  window.addEventListener('resize', () => {
    updateStageScale();
    updateConnectingWire();
  }, { passive: true });
  updateStageScale();
  setTimeout(updateConnectingWire, 100);

  // Mode Switch Buttons (Guarded)
  const btnScrollMode = document.getElementById('btnScrollMode');
  const btnSlideMode = document.getElementById('btnSlideMode');

  // =================================================================
  // 3. VIEW MODE CONTROLLER (SCROLL vs 16:9 SLIDE MODE)
  // =================================================================
  function setViewMode(mode) {
    if (mode === 'slide') {
      isSlideMode = true;
      body.classList.remove('mode-continuous');
      body.classList.add('mode-slide');
      if (btnScrollMode) btnScrollMode.classList.remove('active');
      if (btnSlideMode) btnSlideMode.classList.add('active');
      goToSlide(currentSlide);
    } else {
      isSlideMode = false;
      body.classList.remove('mode-slide');
      body.classList.add('mode-continuous');
      if (btnSlideMode) btnSlideMode.classList.remove('active');
      if (btnScrollMode) btnScrollMode.classList.add('active');
      sections.forEach(s => s.classList.remove('active'));
      const targetSec = document.getElementById(`slide-${currentSlide}`);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
    updateStageScale();
    setTimeout(updateConnectingWire, 50);
  }

  if (btnScrollMode) btnScrollMode.addEventListener('click', () => setViewMode('scroll'));
  if (btnSlideMode) btnSlideMode.addEventListener('click', () => setViewMode('slide'));

  // =================================================================
  // 4. SLIDE NAVIGATION (16:9 STAGE PRESENTATION)
  // =================================================================
  // 3. NAVIGATION CONTROLLER (Pixel-Accurate Redirect to Sections)
  // =================================================================
  function goToSlide(slideNum) {
    if (slideNum < 1) slideNum = 1;
    if (slideNum > TOTAL_SLIDES) slideNum = TOTAL_SLIDES;
    currentSlide = slideNum;

    // Update Counter
    if (currSlideNum) {
      currSlideNum.textContent = slideNum.toString().padStart(2, '0');
    }

    // Update Topbar Nav Links active state
    navLinks.forEach(link => {
      const linkSlide = parseInt(link.getAttribute('data-slide'), 10);
      if (linkSlide === slideNum) link.classList.add('active');
      else link.classList.remove('active');
    });

    // Handle Mobile Web App view scrolling
    if (window.innerWidth <= 768) {
      const mobileSectionMap = {
        1: 'mobileHero',
        2: 'mobileDoctor',
        3: 'mobileOffer',
        4: 'mobileCare',
        5: 'mobileValue',
        6: 'mobileCare',
        7: 'mobileWhichCare',
        8: 'mobileSurgicalExcellence',
        9: 'mobileReviews',
        10: 'mobileContact',
        11: 'mobileContact'
      };
      if (slideNum === 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const secId = mobileSectionMap[slideNum] || 'mobileHero';
        const target = document.getElementById(secId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      try {
        history.pushState(null, null, `#slide-${slideNum}`);
      } catch (err) {}
      return;
    }

    if (isSlideMode) {
      sections.forEach(sec => {
        const secIndex = parseInt(sec.getAttribute('data-slide-index'), 10);
        if (secIndex === slideNum) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });
    } else {
      const target = document.getElementById(`slide-${slideNum}`);
      if (target) {
        // Offset scroll position so target section header sits right below topbar
        const topbarHeight = 64;
        const targetTop = target.getBoundingClientRect().top + window.pageYOffset - topbarHeight;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
        // Update URL hash for redirection history
        try {
          history.pushState(null, null, `#slide-${slideNum}`);
        } catch (err) {}
      }
    }
  }

  if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Topbar Nav Link click handlers (Instant Redirection)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const slideIndex = parseInt(link.getAttribute('data-slide'), 10);
      goToSlide(slideIndex);
    });
  });

  // Topbar Brand Logo click handler (Redirect to Home)
  const topbarBrand = document.querySelector('.topbar-brand');
  if (topbarBrand) {
    topbarBrand.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(1);
    });
  }

  // =================================================================
  // AUTO-HIDE & REVEAL TOPBAR (Tap on Screen Hides, Move Cursor Shows)
  // =================================================================
  const appTopbar = document.getElementById('appTopbar');

  if (appTopbar) {
    let isTopbarHidden = false;
    let lastClickX = 0;
    let lastClickY = 0;
    let lastClickTime = 0;

    function showTopbar() {
      if (isTopbarHidden) {
        appTopbar.classList.remove('topbar-hidden');
        isTopbarHidden = false;
      }
    }

    function hideTopbar() {
      if (!isTopbarHidden) {
        appTopbar.classList.add('topbar-hidden');
        isTopbarHidden = true;
      }
    }

    // TAP / CLICK ON BACKGROUND SCREEN hides the topbar (without blocking any button/card/modal interaction)
    function handleScreenTap(e) {
      // NEVER hide if interacting with interactive UI elements, buttons, links, inputs, or active modals
      if (
        e.target.closest('#appTopbar') ||
        e.target.closest('.app-modal-dialog') ||
        e.target.closest('.app-modal-backdrop') ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('input') ||
        e.target.closest('select') ||
        e.target.closest('textarea') ||
        e.target.closest('.veneer-badge-hitbox') ||
        e.target.closest('.mobile-tooth-pin-wrap') ||
        e.target.closest('.mobile-veneer-badge-hitbox') ||
        e.target.closest('.stage-nav-controls') ||
        e.target.closest('.mobile-bottom-dock')
      ) {
        return;
      }

      // If on mobile touch and already hidden, a single tap on screen toggles it back into view
      if (isTopbarHidden && e.pointerType === 'touch') {
        showTopbar();
        lastClickTime = Date.now();
        return;
      }

      // Hide the top navigation bar when tapping empty screen background
      hideTopbar();
      lastClickX = e.clientX || 0;
      lastClickY = e.clientY || 0;
      lastClickTime = Date.now();
    }

    window.addEventListener('click', handleScreenTap);
    window.addEventListener('pointerdown', (e) => {
      // NEVER hide if clicking on interactive elements or inside a modal
      if (
        e.target.closest('#appTopbar') ||
        e.target.closest('.app-modal-dialog') ||
        e.target.closest('.app-modal-backdrop') ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('input') ||
        e.target.closest('select') ||
        e.target.closest('textarea') ||
        e.target.closest('.veneer-badge-hitbox') ||
        e.target.closest('.mobile-tooth-pin-wrap') ||
        e.target.closest('.mobile-veneer-badge-hitbox') ||
        e.target.closest('.stage-nav-controls') ||
        e.target.closest('.mobile-bottom-dock')
      ) {
        return;
      }
      if (!isTopbarHidden) {
        hideTopbar();
        lastClickX = e.clientX || 0;
        lastClickY = e.clientY || 0;
        lastClickTime = Date.now();
      }
    });

    // MOVING CURSOR smoothly reveals the navigation bar
    window.addEventListener('mousemove', (e) => {
      if (!isTopbarHidden) return;

      // Suppress micro-movement during the physical click (first 180ms)
      if (Date.now() - lastClickTime < 180) return;

      // Distance moved from the click position
      const dist = Math.hypot(e.clientX - lastClickX, e.clientY - lastClickY);

      // Once user moves cursor (at least 15px), reveal the topbar
      if (dist >= 15) {
        showTopbar();
      }
    }, { passive: true });

    // Touch swipe / scroll on mobile also reveals the navigation bar
    window.addEventListener('touchmove', () => {
      if (Date.now() - lastClickTime < 180) return;
      if (isTopbarHidden) {
        showTopbar();
      }
    }, { passive: true });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    // If a modal is open, let Escape close it
    if (e.key === 'Escape') {
      closeAllModals();
      return;
    }

    // Arrow keys for slides
    if (isSlideMode) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToSlide(currentSlide - 1);
      }
    }
  });

  // =================================================================
  // SLIDE 4: TECHNOLOGY CARD TABS (Overview vs Specs)
  // =================================================================
  document.querySelectorAll('.card-mode-tabs .tab-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const tabsParent = chip.closest('.card-mode-tabs');
      if (!tabsParent) return;
      const parentId = tabsParent.getAttribute('data-parent');
      const targetPane = chip.getAttribute('data-tab');
      const card = document.getElementById(parentId);
      if (!card) return;

      card.querySelectorAll('.tab-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      card.querySelectorAll('.card-tab-pane').forEach(pane => {
        if (pane.getAttribute('data-pane') === targetPane) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // IntersectionObserver for continuous scroll mode to track active slide
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0.2
  };

  const slideObserver = new IntersectionObserver((entries) => {
    if (isSlideMode) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const slideIndex = parseInt(entry.target.getAttribute('data-slide-index'), 10);
        if (slideIndex && !isNaN(slideIndex)) {
          currentSlide = slideIndex;
          if (currSlideNum) currSlideNum.textContent = slideIndex.toString().padStart(2, '0');
          navLinks.forEach(l => {
            if (parseInt(l.getAttribute('data-slide'), 10) === slideIndex) l.classList.add('active');
            else l.classList.remove('active');
          });
        }
      }
    });
  }, observerOptions);

  sections.forEach(sec => slideObserver.observe(sec));

  // =================================================================
  // 5. INTERACTIVE MODALS & DRAWERS
  // =================================================================
  function showToast(title, message) {
    if (!appToast) return;
    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;
    appToast.classList.add('active');
    setTimeout(() => {
      appToast.classList.remove('active');
    }, 4500);
  }

  function openModal(modal) {
    if (!modal) return;
    modal.removeAttribute('inert');
    if ('inert' in modal) {
      try { modal.inert = false; } catch (_) {}
    }
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
  }

  function closeModal(modal) {
    if (!modal) return;
    if (modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('inert');
    if ('inert' in modal) {
      try { modal.inert = false; } catch (_) {}
    }
  }

  function closeAllModals() {
    [bookingModal, veneerModal, serviceDrawer, consultationSuccessModal].forEach(closeModal);
  }

  // Close handlers for Success Confirmation Modal
  if (closeSuccessModal) closeSuccessModal.addEventListener('click', closeAllModals);
  if (closeSuccessDoneBtn) closeSuccessDoneBtn.addEventListener('click', closeAllModals);
  if (consultationSuccessModal) {
    consultationSuccessModal.addEventListener('click', (e) => {
      if (e.target === consultationSuccessModal) closeAllModals();
    });
  }

  // Open booking modal helper
  function triggerBookingModal(service, doctor) {
    closeAllModals();
    if (bookingModal) {
      openModal(bookingModal);
      const select = document.getElementById('serviceCategory');
      if (select && service) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text.toLowerCase().includes(service.toLowerCase()) || select.options[i].value.toLowerCase().includes(service.toLowerCase())) {
            select.selectedIndex = i;
            break;
          }
        }
      }
    }
  }

  // Veneer Specs Drawer
  function openVeneerSpecs() {
    closeAllModals();
    openModal(veneerModal);
  }

  // Universal click handler for all modal controls, appointment, and booking CTA buttons across PC and Mobile
  document.addEventListener('click', (e) => {
    // 0. Close modal buttons (works universally on PC & Mobile)
    const closeBtn = e.target.closest('.modal-close-btn, [data-close-modal], #closeVeneerModal, #closeBookingModal, #closeServiceDrawer, #closeSuccessModal, #closeSuccessDoneBtn, #backServiceHeaderBtn, #backServiceDrawerBtn');
    if (closeBtn) {
      e.preventDefault();
      e.stopPropagation();
      closeAllModals();
      return;
    }

    // 1. Veneer Book Assessment button explicitly
    const veneerActionBtn = e.target.closest('#veneerBookNowBtn');
    if (veneerActionBtn) {
      e.preventDefault();
      e.stopPropagation();
      triggerBookingModal('Dental Veeners', '');
      return;
    }

    // 2. Veneer Installation System key / badge clicks
    const veneerBtn = e.target.closest('.veneer-badge-hitbox, #veneerBadgeBtn, #heroToothPin, .hero-tooth-pin-hitbox, #mobileVeneerBadge, #mobileToothPin, .mobile-tooth-pin-wrap, [data-open-modal="veneer"]');
    if (veneerBtn) {
      e.preventDefault();
      e.stopPropagation();
      openVeneerSpecs();
      return;
    }

    // 3. Booking CTA buttons
    const btn = e.target.closest('.open-booking-modal, [data-open-modal="booking"], #topbarGetStartedBtn, #mobileHeroCtaBtn, .card-book-action, .doctor-exact-cta-btn, .value-cta-btn, .reviews-cta-btn, .m916-btn-primary, .m916-value-btn, #bottomBookBtn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const service = btn.getAttribute('data-service') || '';
      const doctor = btn.getAttribute('data-doctor') || '';
      triggerBookingModal(service, doctor);
      return;
    }
  });

  // Direct element attachments to ensure 100% responsiveness on every device
  const heroToothPin = document.getElementById('heroToothPin');
  if (heroToothPin) {
    heroToothPin.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openVeneerSpecs();
    });
  }

  document.querySelectorAll('.open-booking-modal, #topbarGetStartedBtn, #mobileHeroCtaBtn, .card-book-action, .doctor-exact-cta-btn, .value-cta-btn, .reviews-cta-btn, .m916-btn-primary, .m916-value-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const service = b.getAttribute('data-service') || '';
      const doctor = b.getAttribute('data-doctor') || '';
      triggerBookingModal(service, doctor);
    });
  });

  if (closeBookingModal) closeBookingModal.addEventListener('click', closeAllModals);
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeAllModals();
    });
  }

  // --- Client Security & Input Sanitization ---
  function sanitizeInput(str, maxLength = 80) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .trim()
      .slice(0, maxLength);
  }

  function sanitizePhone(phone) {
    if (!phone) return '';
    return String(phone).replace(/\D/g, '').slice(0, 10);
  }

  // Live input filtering for phone: digits only, max 10 digits
  const clientPhoneField = document.getElementById('clientPhone');
  if (clientPhoneField) {
    clientPhoneField.addEventListener('input', () => {
      clientPhoneField.value = clientPhoneField.value.replace(/\D/g, '').slice(0, 10);
      if (clientPhoneField.value.length === 10) {
        clientPhoneField.setCustomValidity('');
      }
    });
    clientPhoneField.addEventListener('blur', () => {
      if (clientPhoneField.value.length === 10 || clientPhoneField.value.length === 0) {
        clientPhoneField.setCustomValidity('');
      }
    });
  }

  // --- Pure 3-Element Digital Time Setter (9:00 AM - 9:00 PM) ---
  function initSimpleTimeSetter() {
    const selectHr = document.getElementById('selectHr');
    const selectMin = document.getElementById('selectMin');
    const btnAm = document.getElementById('btnAm');
    const btnPm = document.getElementById('btnPm');
    const appointmentTime = document.getElementById('appointmentTime');
    if (!selectHr || !selectMin || !btnAm || !btnPm || !appointmentTime) return;

    let currentPeriod = btnAm.classList.contains('active') ? 'AM' : 'PM';

    // Strictly clinic operating hours:
    // AM: 9, 10, 11 (09:00 AM - 11:55 AM)
    // PM: 12, 1, 3, 4, 5, 6, 7, 8 (Strictly erased 2 PM and 9 PM)
    const amHours = [9, 10, 11];
    const pmHours = [12, 1, 3, 4, 5, 6, 7, 8];

    function renderHourOptions(period, keepVal) {
      const hours = period === 'AM' ? amHours : pmHours;
      selectHr.innerHTML = '';
      hours.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = String(h).padStart(2, '0');
        selectHr.appendChild(opt);
      });

      const targetVal = Number(keepVal);
      if (hours.includes(targetVal)) {
        selectHr.value = targetVal;
      } else {
        selectHr.value = hours[0];
      }
    }

    function enforceClinicLimits() {
      const hr = parseInt(selectHr.value, 10);
      if (currentPeriod === 'PM') {
        // Strictly prevent 2:00 PM and 9:00 PM in PM mode
        if (hr === 2) selectHr.value = '3';
        if (hr === 9) selectHr.value = '8';
        if (!pmHours.includes(hr)) selectHr.value = pmHours[0];
      }
    }

    function syncHiddenInput() {
      let hr = parseInt(selectHr.value, 10);
      const min = parseInt(selectMin.value, 10);
      if (isNaN(hr)) hr = 10;

      let h24 = hr;
      if (currentPeriod === 'AM') {
        if (h24 === 12) h24 = 0;
      } else {
        if (h24 !== 12) h24 += 12;
      }

      const hh = String(h24).padStart(2, '0');
      const mm = String(isNaN(min) ? 0 : min).padStart(2, '0');
      appointmentTime.value = `${hh}:${mm}`;
    }

    function setPeriod(period) {
      if (currentPeriod === period) return;
      currentPeriod = period;
      if (period === 'AM') {
        btnAm.classList.add('active');
        btnPm.classList.remove('active');
      } else {
        btnPm.classList.add('active');
        btnAm.classList.remove('active');
      }
      const curHr = selectHr.value;
      renderHourOptions(currentPeriod, curHr);
      enforceClinicLimits();
      syncHiddenInput();
    }

    btnAm.addEventListener('click', (e) => {
      e.preventDefault();
      setPeriod('AM');
    });

    btnPm.addEventListener('click', (e) => {
      e.preventDefault();
      setPeriod('PM');
    });

    selectHr.addEventListener('change', () => {
      enforceClinicLimits();
      syncHiddenInput();
    });

    selectMin.addEventListener('change', () => {
      enforceClinicLimits();
      syncHiddenInput();
    });

    renderHourOptions(currentPeriod, selectHr.value || 10);
    enforceClinicLimits();
    syncHiddenInput();
  }
  initSimpleTimeSetter();

  let lastSubmitTime = 0;

  // Consultation Appointment Form submission & WhatsApp Dispatch
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Anti-Spam Rate Limiter (3 second cooldown)
      const now = Date.now();
      if (now - lastSubmitTime < 3000) {
        showToast('Please wait a moment', 'Your appointment request is already being processed.');
        return;
      }
      lastSubmitTime = now;

      const nameInput = document.getElementById('clientName');
      const phoneInput = document.getElementById('clientPhone');
      const serviceSelect = document.getElementById('serviceCategory');
      const dateInput = document.getElementById('appointmentDate');

      const rawName = (nameInput && nameInput.value) || '';
      const rawPhone = (phoneInput && phoneInput.value) || '';
      const rawService = (serviceSelect && serviceSelect.value) || '';
      const rawDate = dateInput ? dateInput.value : '';

      const name = sanitizeInput(rawName, 60) || 'Valued Patient';
      const phone = sanitizePhone(rawPhone);
      if (!phone || phone.length !== 10) {
        showToast('10-Digit Mobile Required', 'Please enter a valid 10-digit mobile number.');
        if (phoneInput) {
          phoneInput.focus();
          phoneInput.setCustomValidity('Please enter exactly 10 digits');
          phoneInput.reportValidity();
        }
        return;
      }
      if (phoneInput) phoneInput.setCustomValidity('');

      const service = sanitizeInput(rawService, 60) || 'General Dental Consultation';

      let formattedDate = 'Priority / Earliest Available';
      if (rawDate) {
        try {
          const d = new Date(rawDate + 'T00:00:00');
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
          }
        } catch {
          formattedDate = sanitizeInput(rawDate, 30);
        }
      }

      // Format 12-Hour Preferred Time (e.g. 10:30 AM)
      let formattedTime = '10:30 AM';
      const timeInput = document.getElementById('appointmentTime');
      const timeVal = (timeInput && timeInput.value) || '';
      if (timeVal) {
        const parts = timeVal.split(':');
        if (parts.length === 2) {
          let h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          // Strictly clamp PM hours: 12, 1, 3, 4, 5, 6, 7, 8 (erased 2 PM & 9 PM)
          if (h >= 12) {
            if (h === 14) h = 15; // 2 PM clamped to 3 PM
            if (h >= 21) h = 20;  // 9 PM clamped to 8 PM
          }
          const period = h >= 12 ? 'PM' : 'AM';
          let h12 = h % 12;
          if (h12 === 0) h12 = 12;
          formattedTime = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
        }
      }

      // Format WhatsApp booking text
      const waText = 
`*DENTAL CONSULTATION REQUEST*
*Barde Dental Clinic — Tumsar*
--------------------------------
*Patient Name:* ${name}
*Phone Number:* ${phone}
*Care Category:* ${service}
*Preferred Date:* ${formattedDate}
*Preferred Time:* ${formattedTime}
--------------------------------
Hello Dr. Vivek Barde, I submitted this appointment request via your official website. Please confirm my consultation schedule.`;

      const waUrl = `https://api.whatsapp.com/send?phone=917083444404&text=${encodeURIComponent(waText)}`;

      // Populate enhanced success popup ticket
      if (successPatientName) successPatientName.textContent = name;
      if (ticketNameVal) ticketNameVal.textContent = name;
      if (ticketPhoneVal) ticketPhoneVal.textContent = phone;
      if (ticketServiceVal) ticketServiceVal.textContent = service;
      if (ticketDateVal) ticketDateVal.textContent = formattedDate;
      if (ticketTimeVal) ticketTimeVal.textContent = formattedTime;
      if (successWhatsAppActionBtn) {
        successWhatsAppActionBtn.href = waUrl;
        successWhatsAppActionBtn.setAttribute('href', waUrl);
      }

      // Close consultation form modal & reveal enhanced confirmation popup
      closeModal(bookingModal);
      openModal(consultationSuccessModal);

      // Enhanced Toast Notification
      showToast(
        `Consultation Request Notified!`,
        `Opening WhatsApp directly with Dr. Vivek Barde...`
      );

      // Launch WhatsApp reliably
      let opened = null;
      try {
        opened = window.open(waUrl, '_blank');
      } catch (err) {
        console.log('[Notice] Direct window.open deferred by browser:', err);
      }
      // If browser blocked popup window or mobile browser deferred it, navigate reliably
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        setTimeout(() => {
          window.location.href = waUrl;
        }, 800);
      }

      appointmentForm.reset();
    });
  }

  // Veneer Specs Drawer: uses openModal() so inert is properly removed and all buttons work
  function openVeneerSpecs() {
    closeAllModals();
    openModal(veneerModal);
  }

  const backServiceHeaderBtn = document.getElementById('backServiceHeaderBtn');
  const backServiceDrawerBtn = document.getElementById('backServiceDrawerBtn');
  const veneerBookNowBtn = document.getElementById('veneerBookNowBtn');

  if (veneerBadgeBtn) veneerBadgeBtn.addEventListener('click', openVeneerSpecs);
  if (closeVeneerModal) {
    closeVeneerModal.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllModals();
    });
  }
  if (backServiceHeaderBtn) {
    backServiceHeaderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllModals();
    });
  }
  if (backServiceDrawerBtn) {
    backServiceDrawerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllModals();
    });
  }

  if (veneerBookNowBtn) {
    veneerBookNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerBookingModal('Dental Veeners', '');
    });
  }

  if (veneerModal) {
    veneerModal.addEventListener('click', (e) => {
      if (e.target === veneerModal) {
        e.preventDefault();
        closeAllModals();
      }
    });
  }

  // Services Explorer Drawer
  function openServiceExplorer() {
    closeAllModals();
    openModal(serviceDrawer);
  }

  // Only bind drawer to elements explicitly asking for open-service-drawer that are not external links
  document.querySelectorAll('button.open-service-drawer').forEach(el => {
    el.addEventListener('click', openServiceExplorer);
  });
  if (closeServiceDrawer) closeServiceDrawer.addEventListener('click', closeAllModals);
  if (serviceDrawer) {
    serviceDrawer.addEventListener('click', (e) => {
      if (e.target === serviceDrawer) closeAllModals();
    });
  }

  // =================================================================
  // 6. MOBILE WEB APPLICATION CONTROLS & DASHBOARD INTERACTIVITY
  // =================================================================
  const mobileToothPin = document.getElementById('mobileToothPin');
  const mobileVeneerBadge = document.getElementById('mobileVeneerBadge');

  [mobileToothPin, mobileVeneerBadge].forEach(el => {
    if (el) el.addEventListener('click', openVeneerSpecs);
  });

  // =================================================================
  // E. SCREEN 3 (WHAT WE OFFER): CURSOR MOVEMENT KEY GLIDE & ACTIVE PILL TOOLTIP
  // (Pill capsule highlight exactly like PC navigation button — tracks with cursor before click AND stays active upon click)
  // =================================================================
  const mOfferBody = document.getElementById('mOfferBody');
  const mOfferList = document.getElementById('mOfferItemsList');
  const mOfferLinks = Array.from(document.querySelectorAll('#mobileOffer .m916-offer-link'));
  const mOfferLis = Array.from(document.querySelectorAll('#mobileOffer .m916-offer-li'));
  const mOfferClickBtn = document.getElementById('mOfferClickBtn');

  let activeOfferKey = null;

  function setOfferActiveKey(targetLink) {
    if (!targetLink) return;

    if (activeOfferKey === targetLink) return;

    if (activeOfferKey) {
      activeOfferKey.classList.remove('is-hovered', 'is-active-key');
      const prevLi = activeOfferKey.closest('.m916-offer-li');
      if (prevLi) prevLi.classList.remove('is-active-row');
    }

    activeOfferKey = targetLink;
    activeOfferKey.classList.add('is-hovered', 'is-active-key');

    const parentLi = activeOfferKey.closest('.m916-offer-li');
    if (parentLi) parentLi.classList.add('is-active-row');

    if (mOfferClickBtn) {
      const url = activeOfferKey.getAttribute('href');
      if (url) mOfferClickBtn.setAttribute('href', url);
    }
  }

  // Smooth nearest-item vertical locator (guarantees continuous tracking with zero dead zones)
  function findClosestOfferLink(clientY) {
    if (!mOfferLinks.length) return null;
    let closest = null;
    let minDiff = Infinity;

    for (let i = 0; i < mOfferLinks.length; i++) {
      const rect = mOfferLinks[i].getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const diff = Math.abs(clientY - centerY);
      if (diff < minDiff) {
        minDiff = diff;
        closest = mOfferLinks[i];
      }
    }
    return closest;
  }

  // 1. Direct hover / enter on individual links and li elements for instant response
  mOfferLinks.forEach(link => {
    link.addEventListener('mouseenter', () => setOfferActiveKey(link));
    link.addEventListener('pointerenter', () => setOfferActiveKey(link));
    link.addEventListener('mouseover', () => setOfferActiveKey(link));

    // On click: activate and keep active
    link.addEventListener('click', () => {
      setOfferActiveKey(link);
    });
  });

  mOfferLis.forEach(li => {
    const link = li.querySelector('.m916-offer-link');
    if (!link) return;

    li.addEventListener('mouseenter', () => setOfferActiveKey(link));
    li.addEventListener('pointerenter', () => setOfferActiveKey(link));
    li.addEventListener('mouseover', () => setOfferActiveKey(link));

    li.addEventListener('click', () => {
      setOfferActiveKey(link);
    });
  });

  // 2. Continuous cursor tracking as mouse/pointer glides across buttons
  const handleOfferPointerGlide = (e) => {
    if (!e) return;
    const clientY = typeof e.clientY === 'number' ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
    if (clientY === null) return;

    // Check direct target first
    if (e.target && e.target.closest) {
      const directLink = e.target.closest('.m916-offer-link');
      if (directLink) {
        setOfferActiveKey(directLink);
        return;
      }
      const directLi = e.target.closest('.m916-offer-li');
      if (directLi) {
        const l = directLi.querySelector('.m916-offer-link');
        if (l) {
          setOfferActiveKey(l);
          return;
        }
      }
    }

    // Proximity check within vertical list bounds
    if (mOfferList) {
      const listRect = mOfferList.getBoundingClientRect();
      if (clientY >= listRect.top - 20 && clientY <= listRect.bottom + 20) {
        const closest = findClosestOfferLink(clientY);
        if (closest) setOfferActiveKey(closest);
      }
    }
  };

  if (mOfferBody) {
    mOfferBody.addEventListener('mousemove', handleOfferPointerGlide, { passive: true });
    mOfferBody.addEventListener('pointermove', handleOfferPointerGlide, { passive: true });
  }

  if (mOfferList) {
    mOfferList.addEventListener('mousemove', handleOfferPointerGlide, { passive: true });
    mOfferList.addEventListener('pointermove', handleOfferPointerGlide, { passive: true });

    // Touch dragging support
    mOfferList.addEventListener('touchstart', handleOfferPointerGlide, { passive: true });
    mOfferList.addEventListener('touchmove', handleOfferPointerGlide, { passive: true });
  }

  // Also support PC Slide 3 offer services list cursor glide
  const pcOfferList = document.querySelector('.offer-services-list');
  if (pcOfferList) {
    const pcOfferLinks = Array.from(pcOfferList.querySelectorAll('.offer-item-anchor'));
    let activePcOfferKey = null;

    function setPcOfferActiveKey(target) {
      if (activePcOfferKey === target) return;
      if (activePcOfferKey) activePcOfferKey.classList.remove('is-hovered');
      activePcOfferKey = target;
      if (activePcOfferKey) activePcOfferKey.classList.add('is-hovered');
    }

    pcOfferLinks.forEach(link => {
      link.addEventListener('mouseenter', () => setPcOfferActiveKey(link));
      link.addEventListener('pointerenter', () => setPcOfferActiveKey(link));
    });

    pcOfferList.addEventListener('mousemove', (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const link = el ? el.closest('.offer-item-anchor') : null;
      if (link) setPcOfferActiveKey(link);
    }, { passive: true });

    pcOfferList.addEventListener('mouseleave', () => setPcOfferActiveKey(null));
  }

  // =================================================================
  // F. ALL SCREENS SCROLL-ONLY ZOOM ANIMATION ("Bit zoom in, bit zoom out")
  // =================================================================
  const mobileZoomScreens = [
    {
      sec: document.getElementById('mobileOffer'),
      canvas: document.querySelector('#mobileOffer .mobile-916-canvas'),
      img: document.querySelector('.m916-offer-hero-img')
    },
    {
      sec: document.getElementById('mobileValue'),
      canvas: document.querySelector('#mobileValue .mobile-916-canvas'),
      img: document.querySelector('.m916-value-photo')
    },
    // Screen 5 (#mobileCare) static solid #fbc1c2: animations disabled per user instruction
    {
      sec: document.getElementById('mobileSurgical'),
      canvas: document.querySelector('#mobileSurgical .mobile-916-canvas'),
      img: document.querySelector('#mobileSurgical .m916-overview-hero-img')
    },
    {
      sec: document.getElementById('mobileWhichCare'),
      canvas: document.querySelector('#mobileWhichCare .mobile-916-canvas'),
      img: document.querySelectorAll('#mobileWhichCare .m916-story-photo')
    },
    {
      sec: document.getElementById('mobileSurgicalExcellence'),
      canvas: document.querySelector('#mobileSurgicalExcellence .mobile-916-canvas'),
      img: document.querySelector('#mobileSurgicalExcellence .m916-surgical-hero-img')
    },
    {
      sec: document.getElementById('mobileReviews'),
      canvas: document.querySelector('#mobileReviews .mobile-916-canvas'),
      img: document.querySelector('.m916-reviews-stack')
    }
  ];

  let mobileScrollTicking = false;

  function handleMobileAllScreensScrollZoom() {
    // Strictly mobile only (<= 768px) so desktop PC site remains 100% untouched
    if (window.innerWidth > 768) {
      mobileZoomScreens.forEach(item => {
        if (item.canvas) item.canvas.style.transform = '';
        if (item.img) {
          if (NodeList.prototype.isPrototypeOf(item.img) || Array.isArray(item.img)) {
            item.img.forEach(el => el.style.transform = '');
          } else {
            item.img.style.transform = '';
          }
        }
      });
      return;
    }

    const vh = window.innerHeight || document.documentElement.clientHeight;

    mobileZoomScreens.forEach(item => {
      if (!item.sec) return;
      const rect = item.sec.getBoundingClientRect();

      // Check if section is in or near viewport
      if (rect.bottom > -50 && rect.top < vh + 50) {
        const elemCenter = rect.top + rect.height / 2;
        const screenCenter = vh / 2;
        const maxDist = (vh + rect.height) / 2;
        const dist = Math.abs(elemCenter - screenCenter);

        // Normalized progress: 1.0 when centered in screen, 0.0 at edges
        const rawFactor = Math.max(0, Math.min(1, 1 - (dist / maxDist)));
        // Smooth sine ease
        const progress = Math.sin(rawFactor * (Math.PI / 2));

        // 1. Featured image or stack: zooms in to ~1.080 at center, zooms out to 1.00 at edges
        if (item.img) {
          const imgScale = (1.0 + (progress * 0.08)).toFixed(4);
          if (NodeList.prototype.isPrototypeOf(item.img) || Array.isArray(item.img)) {
            item.img.forEach(el => el.style.transform = `scale(${imgScale})`);
          } else {
            item.img.style.transform = `scale(${imgScale})`;
          }
        }

        // 2. Canvas stage: subtle zoom in from 0.965 to 1.000 when centered (matching PC stage scale feeling)
        if (item.canvas) {
          const canvasScale = (0.965 + (progress * 0.035)).toFixed(4);
          item.canvas.style.transform = `scale(${canvasScale})`;
        }
      } else {
        if (item.img) {
          if (NodeList.prototype.isPrototypeOf(item.img) || Array.isArray(item.img)) {
            item.img.forEach(el => el.style.transform = 'scale(1)');
          } else {
            item.img.style.transform = 'scale(1)';
          }
        }
        if (item.canvas) item.canvas.style.transform = 'scale(0.965)';
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!mobileScrollTicking) {
      window.requestAnimationFrame(() => {
        handleMobileAllScreensScrollZoom();
        mobileScrollTicking = false;
      });
      mobileScrollTicking = true;
    }
  }, { passive: true });

  // Initial check on load
  handleMobileAllScreensScrollZoom();

  // 3. Interactive accordion expansion inside Services Drawer
  document.querySelectorAll('#serviceAccordions .service-detail-item').forEach(item => {
    item.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('#serviceAccordions .service-detail-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });

  // 4. Interactive Story Buttons (01, 02, 03) & Swipe for Screen 7 (#mobileWhichCare)
  const storyNumBtns = document.querySelectorAll('.m916-story-num-btn');
  const storySlides = document.querySelectorAll('.m916-story-slide');
  const storyContainer = document.querySelector('.m916-story-slides-container');

  function switchStorySlide(index) {
    const targetIdx = String(index);
    storyNumBtns.forEach(btn => {
      const bIdx = btn.getAttribute('data-story-idx');
      if (bIdx === targetIdx) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    storySlides.forEach(slide => {
      const sIdx = slide.getAttribute('data-story-idx');
      if (sIdx === targetIdx) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }

  storyNumBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = btn.getAttribute('data-story-idx');
      if (idx !== null) {
        switchStorySlide(idx);
      }
    });
  });

  // Mobile Swipe Navigation for Story Cards
  if (storyContainer) {
    let touchStartX = 0;
    let touchEndX = 0;
    storyContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    storyContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleStorySwipe();
    }, { passive: true });

    function handleStorySwipe() {
      const diff = touchStartX - touchEndX;
      const activeBtn = document.querySelector('.m916-story-num-btn.active');
      const currentIdx = activeBtn ? parseInt(activeBtn.getAttribute('data-story-idx'), 10) : 0;
      if (diff > 45 && currentIdx < 2) {
        switchStorySlide(currentIdx + 1);
      } else if (diff < -45 && currentIdx > 0) {
        switchStorySlide(currentIdx - 1);
      }
    }
  }

  // Mobile Reviews Internal Scroll Area Fade Effect
  const reviewsScrollArea = document.getElementById('mobileReviewsScrollArea');
  const reviewsFadeBottom = document.getElementById('reviewsFadeBottom');
  if (reviewsScrollArea && reviewsFadeBottom) {
    reviewsScrollArea.addEventListener('scroll', () => {
      const maxScroll = reviewsScrollArea.scrollHeight - reviewsScrollArea.clientHeight;
      if (maxScroll <= 0) {
        reviewsFadeBottom.style.opacity = '0';
      } else {
        const remaining = maxScroll - reviewsScrollArea.scrollTop;
        if (remaining <= 24) {
          reviewsFadeBottom.style.opacity = '0';
        } else {
          reviewsFadeBottom.style.opacity = '1';
        }
      }
    }, { passive: true });
  }

  // Initial update: Handle URL hash navigation (e.g. straight forward jump to fourth page)
  function handleInitialHashNavigation() {
    const hash = window.location.hash;

    // Straight forward jump to fourth page (#slide-4 or #mobileValue)
    if (hash === '#slide-4' || hash === '#mobileValue' || hash === '#page-4') {
      if (window.innerWidth <= 768) {
        const target = document.getElementById('mobileValue') || document.getElementById('slide-4');
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 180);
          return;
        }
      } else {
        goToSlide(4);
        return;
      }
    }

    if (hash === '#slide-3' || hash === '#mobileOffer') {
      if (window.innerWidth <= 768) {
        const target = document.getElementById('mobileOffer') || document.getElementById('slide-3');
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 180);
          return;
        }
      } else {
        goToSlide(3);
        return;
      }
    }

    const match = hash.match(/#slide-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num >= 1 && num <= TOTAL_SLIDES) {
        goToSlide(num);
        return;
      }
    }

    // Default to slide 1 if no specific hash
    goToSlide(1);
  }

  // Global smooth scrolling handler for all internal anchor links (e.g. #slide-2, #mobileDoctor, #mobileReviews)
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;

    // Check if it's a topbar link or dock item already handled
    if (anchor.classList.contains('nav-link') || anchor.id === 'mobDockHome') return;

    try {
      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        const topbar = document.getElementById('appTopbar');
        const topbarHeight = (topbar && window.innerWidth > 768) ? topbar.offsetHeight : 0;
        const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - topbarHeight;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });

        try {
          history.pushState(null, null, href);
        } catch (_) {}
      }
    } catch (_) {}
  });

  // Smooth scroll to top for mobile bottom dock "Home" button
  const mobDockHome = document.getElementById('mobDockHome');
  if (mobDockHome) {
    mobDockHome.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        goToSlide(1);
      }
    });
  }

  // Footer legal links informative handlers
  ['linkPrivacy', 'linkTerms', 'linkAccessibility'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const titles = {
          linkPrivacy: 'Privacy & Health Records Policy',
          linkTerms: 'Clinical Terms & Appointment Guidelines',
          linkAccessibility: 'Clinic Accessibility & Patient Support'
        };
        const messages = {
          linkPrivacy: 'Patient confidentiality and dental health records are maintained strictly under Indian Healthcare Privacy regulations.',
          linkTerms: 'Appointments can be rescheduled with 2-hour advance notice. Emergency dental walk-ins are given immediate priority.',
          linkAccessibility: 'Our clinic operatory and waiting lounge feature ground-floor wheelchair access and patient assistance.'
        };
        showToast(titles[id] || 'Clinic Notice', messages[id] || 'Barde Dental Clinic is dedicated to compassionate patient care.');
      });
    }
  });

  // PC Slide 10: Smooth, Instant & Secure WhatsApp Launcher with Drafted Message
  const pcWhatsAppBtn = document.getElementById('pcWhatsAppBtn');
  if (pcWhatsAppBtn) {
    const defaultWaUrl = `https://api.whatsapp.com/send?phone=917083444404&text=${encodeURIComponent('Hello Dr. Vivek Barde Clinic, I would like to inquire about an appointment and dental treatments.')}`;
    pcWhatsAppBtn.href = defaultWaUrl;
    pcWhatsAppBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pcWhatsAppBtn.href = defaultWaUrl;
    });
  }

  handleInitialHashNavigation();
  window.addEventListener('hashchange', handleInitialHashNavigation);
});


