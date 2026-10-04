// ===================================================================
// BARDE DENTAL CLINIC — CLIENT APPLICATION SCRIPT
// 16:9 Canvas Stage Engine + Slide Presentation & Modern UX Controls
// ===================================================================
// Auto-purge any stale service workers or legacy caches from past deployments
try {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) reg.unregister();
    }).catch(() => {});
  }
  if (typeof window !== 'undefined' && 'caches' in window) {
    caches.keys().then(names => {
      for (const name of names) caches.delete(name);
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
  const ticketServiceVal = document.getElementById('ticketServiceVal');
  const ticketDateVal = document.getElementById('ticketDateVal');
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

  function closeAllModals() {
    [bookingModal, veneerModal, serviceDrawer, consultationSuccessModal].forEach(m => {
      if (m) m.classList.remove('active');
    });
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
      bookingModal.classList.add('active');
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
    if (veneerModal) {
      veneerModal.classList.add('active');
    }
  }

  // Universal click handler for all appointment and booking CTA buttons across PC and Mobile
  document.addEventListener('click', (e) => {
    // 1. Veneer Installation System key / badge clicks
    const veneerBtn = e.target.closest('.veneer-badge-hitbox, #veneerBadgeBtn, #heroToothPin, .hero-tooth-pin-hitbox, #mobileVeneerBadge, #mobileToothPin, .mobile-tooth-pin-wrap, [data-open-modal="veneer"]');
    if (veneerBtn) {
      e.preventDefault();
      e.stopPropagation();
      openVeneerSpecs();
      return;
    }

    // 2. Booking CTA buttons
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
    return String(phone).replace(/[^\d\s+\-()]/g, '').trim().slice(0, 20);
  }

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

      // Format WhatsApp booking text
      const waText = 
`*DENTAL CONSULTATION REQUEST*
*Barde Dental Clinic — Tumsar*
--------------------------------
*Patient Name:* ${name}
*Phone Number:* ${phone}
*Care Category:* ${service}
*Preferred Date:* ${formattedDate}
--------------------------------
Hello Dr. Vivek Barde, I submitted this appointment request via your official website. Please confirm my consultation schedule.`;

      const waUrl = `https://api.whatsapp.com/send?phone=918999103775&text=${encodeURIComponent(waText)}`;

      // Populate enhanced success popup ticket
      if (successPatientName) successPatientName.textContent = name;
      if (ticketNameVal) ticketNameVal.textContent = name;
      if (ticketPhoneVal) ticketPhoneVal.textContent = phone;
      if (ticketServiceVal) ticketServiceVal.textContent = service;
      if (ticketDateVal) ticketDateVal.textContent = formattedDate;
      if (successWhatsAppActionBtn) successWhatsAppActionBtn.href = waUrl;

      // Close consultation form modal & reveal enhanced confirmation popup
      if (bookingModal) bookingModal.classList.remove('active');
      if (consultationSuccessModal) consultationSuccessModal.classList.add('active');

      // Enhanced Toast Notification
      showToast(
        `Consultation Request Notified!`,
        `Opening WhatsApp directly with Dr. Vivek Barde...`
      );

      // Launch WhatsApp in a new tab securely
      try {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.log('[Notice] Direct window.open deferred by browser:', err);
      }

      appointmentForm.reset();
    });
  }

  // Veneer Specs Drawer
  function openVeneerSpecs() {
    closeAllModals();
    if (veneerModal) veneerModal.classList.add('active');
  }

  if (veneerBadgeBtn) veneerBadgeBtn.addEventListener('click', openVeneerSpecs);
  if (closeVeneerModal) closeVeneerModal.addEventListener('click', closeAllModals);
  if (veneerModal) {
    veneerModal.addEventListener('click', (e) => {
      if (e.target === veneerModal) closeAllModals();
    });
  }

  // Services Explorer Drawer
  function openServiceExplorer() {
    closeAllModals();
    if (serviceDrawer) serviceDrawer.classList.add('active');
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
  // E. SCREEN 3 (WHAT WE OFFER) CLEAN AESTHETIC INTERACTION
  // =================================================================
  const mOfferLinks = document.querySelectorAll('.m916-offer-link');
  mOfferLinks.forEach(link => {
    link.addEventListener('click', () => {
      link.style.transform = 'translateX(4px)';
      setTimeout(() => {
        link.style.transform = '';
      }, 200);
    });
  });

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
    },
    {
      sec: document.getElementById('mobileContact'),
      canvas: document.querySelector('#mobileContact .mobile-916-canvas'),
      img: document.querySelector('.m916-map-img')
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
      } catch (err) {}
    }
  });

  // Smooth scroll to top for mobile bottom dock "Home" button
  const mobDockHome = document.getElementById('mobDockHome');
  if (mobDockHome) {
    mobDockHome.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // PC Slide 10: Smooth, Instant & Secure WhatsApp Launcher with Drafted Message
  const pcWhatsAppBtn = document.getElementById('pcWhatsAppBtn');
  if (pcWhatsAppBtn) {
    pcWhatsAppBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const message = encodeURIComponent('Hello Dr. Vivek Barde Clinic, I would like to inquire about an appointment and dental treatments.');
      const waUrl = `https://api.whatsapp.com/send?phone=918999103775&text=${message}`;
      const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (win) {
        win.focus();
        e.preventDefault();
      }
    });
  }

  handleInitialHashNavigation();
});


