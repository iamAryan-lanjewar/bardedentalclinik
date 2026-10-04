// ===================================================================
// BARDE DENTAL CLINIC — SERVICES PAGE LOGIC
// Anchor Scroll, Card Highlighting, Rich Detail Modals, & Booking Form
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
  // Service Data for "read more.." rich dialogs
  const serviceDetails = {
    'root-canal': {
      title: 'Root Canal Therapy',
      subtitle: 'Painless microscopic endodontic tooth-saving care',
      image: 'assets/service_root_canal.webp?v=11.0',
      specs: [
        { label: 'Technology:', value: 'Nickel-Titanium rotary files & apex locators' },
        { label: 'Pain Level:', value: 'Virtually pain-free with computer-controlled anesthesia' },
        { label: 'Visits Required:', value: 'Usually single visit (45–60 minutes)' },
        { label: 'Success Rate:', value: 'Over 97% permanent tooth preservation' }
      ],
      description: 'A root canal sounds scary, but it actually ends the pain. Deep inside each tooth is the dental pulp. When severe decay or trauma causes infection, modern microscopic endodontics removes infected tissue, cleans and sterilizes canals, and seals the tooth safely so you keep your natural smile without extraction.'
    },
    'cavities': {
      title: 'Cement Filling & Restorations',
      subtitle: 'Biocompatible nano-hybrid tooth-colored restorations & cement fillings',
      image: 'assets/service_new_teeth_implant.webp?v=10.0',
      specs: [
        { label: 'Material:', value: 'Nano-hybrid composite resins matching enamel translucency' },
        { label: 'Detection:', value: 'High-definition digital intraoral camera & CBCT' },
        { label: 'Procedure:', value: 'Minimally invasive, preserving maximal healthy enamel' },
        { label: 'Durability:', value: '10+ years with proper oral hygiene' }
      ],
      description: 'A cavity starts silently when food and bacteria team up to slowly eat away at your enamel. Left untreated, acid erodes tooth layers until reaching nerves. We provide early laser diagnostics, gentle enamel remineralization, and imperceptible tooth-colored fillings that restore 100% natural tooth shape and strength.'
    },
    'cleaning': {
      title: 'Teeth Cleaning & Deep Polishing',
      subtitle: 'Healthy habits start with smiles',
      image: 'assets/service_cleaning.webp?v=12.0',
      specs: [
        { label: 'Method:', value: 'Air-Flow ultrasonic micro-vibrations & gentle water jet' },
        { label: 'Benefits:', value: 'Eliminates stubborn plaque, calculus, tea/coffee stains' },
        { label: 'Gum Protection:', value: 'Prevents gingivitis, bleeding, and bone loss' },
        { label: 'Frequency:', value: 'Recommended every 6 months for optimum health' }
      ],
      description: 'Prevent unexpected cavities, and keep teeth visibly stain-free. Even with meticulous brushing, mineralized calculus builds up along the gum line. Our advanced dental hygiene suite uses gentle ultrasonic micro-frequencies to remove plaque and polish teeth to a high-gloss, mirror shine.'
    },
    'veneers': {
      title: 'Dental Veneers & Laminates',
      subtitle: 'Ultra-thin Swiss porcelain cosmetic smile transformation',
      image: 'assets/service_veneers.webp?v=10.0',
      specs: [
        { label: 'Material:', value: 'IPS e.max® press high-translucency lithium disilicate' },
        { label: 'Thickness:', value: 'Ultra-thin 0.2mm – 0.3mm (minimal tooth prep)' },
        { label: 'Customization:', value: 'CAD/CAM digital shade matching (Vita Bleach BL1-BL4)' },
        { label: 'Warranty:', value: '10-Year Clinical Warranty & 15+ year durability' }
      ],
      description: 'Dental veneers and laminates are ultra-thin custom ceramic shells bonded permanently to the front of teeth. They instantly correct discoloration, close gaps, fix chipped edges, and harmonize teeth alignment for a radiant, Hollywood-grade smile designed in harmony with your facial symmetry.'
    },
    'implant-surgery': {
      title: 'Dental Implant Surgery',
      subtitle: 'Permanent replacement for missing teeth with artificial roots',
      image: 'assets/service_implant_surgery.webp?v=12.0',
      specs: [
        { label: 'Material:', value: 'Medical titanium screw with custom ceramic crown' },
        { label: 'Accuracy:', value: '3D guided digital scan for safe and exact placement' },
        { label: 'Benefit:', value: 'Restores 100% natural chewing and keeps jawbone strong' },
        { label: 'Lifespan:', value: 'Permanent, long-lasting solution with proper oral care' }
      ],
      description: 'Dental implant surgery is the most reliable way to replace missing teeth. A small titanium post acts like a natural tooth root in your jaw, holding a custom-made crown securely in place so you can eat, smile, and speak with complete confidence.'
    },
    'new-implant': {
      title: 'Painless Tooth Extraction',
      subtitle: 'Gentle, comfortable removal for damaged or painful teeth',
      image: 'assets/service_tooth_extraction.webp?v=12.0',
      specs: [
        { label: 'Comfort:', value: '100% pain-free with modern local numbing care' },
        { label: 'Technique:', value: 'Gentle removal protecting surrounding bone and gums' },
        { label: 'Recovery:', value: 'healing in 7-8 days with clear aftercare tips' },
        { label: 'When Needed:', value: 'Deep decay, broken teeth, or crowded wisdom teeth' }
      ],
      description: 'Tooth extraction is a routine, gentle procedure to remove teeth that cannot be repaired due to severe cavities, cracks, or impaction. Dr. Barde uses advanced numbing techniques so you feel relaxed and pain-free, ensuring quick and comfortable healing.'
    },
    'orthodontic': {
      title: 'Orthodontic Dental Care',
      subtitle: 'Precision metal & aesthetic braces, clear aligners & smile alignment',
      image: 'assets/service_orthodontic.webp?v=1.0',
      specs: [
        { label: 'Braces Options:', value: 'Low-friction metal brackets, aesthetic ceramic & aligners' },
        { label: 'Alignment Goals:', value: 'Fixes crowded, crooked teeth, spacing gaps & overbites' },
        { label: 'Comfort Care:', value: 'Gentle archwire force for smooth, painless repositioning' },
        { label: 'Age Suitability:', value: 'Custom smile design suitable for children, teens & adults' }
      ],
      description: 'Orthodontic dental care focuses on diagnosing, preventing, and correcting improperly positioned teeth and jaw alignment. Using advanced brackets and gentle shape-memory archwires, Dr. Vivek Barde gently aligns your teeth into their ideal dental arch—restoring optimal chewing function, improving long-term oral hygiene, and creating a balanced, confident smile that lasts a lifetime.'
    }
  };

  // --- Modals & DOM Elements ---
  const bookingModal = document.getElementById('bookingModalBackdrop');
  const closeBookingModal = document.getElementById('closeBookingModal');
  const appointmentForm = document.getElementById('appointmentForm');
  const serviceCategorySelect = document.getElementById('serviceCategory');
  const consultationSuccessModal = document.getElementById('consultationSuccessModal');
  const closeSuccessModal = document.getElementById('closeSuccessModal');
  const closeSuccessDoneBtn = document.getElementById('closeSuccessDoneBtn');
  const successWhatsAppActionBtn = document.getElementById('successWhatsAppActionBtn');
  const successPatientName = document.getElementById('successPatientName');
  const ticketNameVal = document.getElementById('ticketNameVal');
  const ticketPhoneVal = document.getElementById('ticketPhoneVal');
  const ticketServiceVal = document.getElementById('ticketServiceVal');
  const ticketDateVal = document.getElementById('ticketDateVal');

  const detailModal = document.getElementById('detailModalBackdrop');
  const closeDetailModal = document.getElementById('closeDetailModal');
  const detailTitle = document.getElementById('detailModalTitle');
  const detailSubtitle = document.getElementById('detailModalSubtitle');
  const detailHeroImg = document.getElementById('detailHeroImg');
  const detailSpecsBox = document.getElementById('detailSpecsBox');
  const detailDesc = document.getElementById('detailDesc');
  const detailBookBtn = document.getElementById('detailBookBtn');

  const appToast = document.getElementById('appToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');

  // Open & Close Modal Helpers
  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  function closeAllModals() {
    closeModal(bookingModal);
    closeModal(detailModal);
    closeModal(consultationSuccessModal);
  }

  function showToast(title, message) {
    if (!appToast) return;
    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;
    appToast.classList.add('active');
    setTimeout(() => {
      appToast.classList.remove('active');
    }, 4500);
  }

  // Handle "read more.." clicks
  document.querySelectorAll('.read-more-anchor-btn, .service-card-title-anchor').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceKey = btn.getAttribute('data-service');
      const data = serviceDetails[serviceKey];
      if (!data) return;

      if (detailTitle) detailTitle.textContent = data.title;
      if (detailSubtitle) detailSubtitle.textContent = data.subtitle;
      if (detailHeroImg) {
        detailHeroImg.src = data.image;
        detailHeroImg.alt = data.title;
      }
      if (detailDesc) detailDesc.textContent = data.description;

      if (detailSpecsBox) {
        detailSpecsBox.innerHTML = '';
        data.specs.forEach(spec => {
          const row = document.createElement('div');
          row.className = 'spec-line';
          row.innerHTML = `<strong>${spec.label}</strong> <span>${spec.value}</span>`;
          detailSpecsBox.appendChild(row);
        });
      }

      if (detailBookBtn) {
        detailBookBtn.setAttribute('data-preselect-service', data.title);
      }

      closeAllModals();
      openModal(detailModal);
    });
  });

  if (closeDetailModal) {
    closeDetailModal.addEventListener('click', () => closeModal(detailModal));
  }
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeModal(detailModal);
    });
  }

  // Pre-select service in booking modal from detail modal
  if (detailBookBtn) {
    detailBookBtn.addEventListener('click', () => {
      const selected = detailBookBtn.getAttribute('data-preselect-service');
      closeModal(detailModal);
      openBookingModalWithService(selected);
    });
  }

  function openBookingModalWithService(serviceName) {
    if (serviceCategorySelect && serviceName) {
      for (let i = 0; i < serviceCategorySelect.options.length; i++) {
        if (serviceCategorySelect.options[i].text.toLowerCase().includes(serviceName.toLowerCase())) {
          serviceCategorySelect.selectedIndex = i;
          break;
        }
      }
    }
    openModal(bookingModal);
  }

  // Universal click handler for open-booking-modal and bottomBookBtn
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-booking-modal, #bottomBookBtn, [data-open-modal="booking"], .btn-book-appointment-main');
    if (btn) {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || '';
      openBookingModalWithService(service);
    }
  });

  const bottomBookBtn = document.getElementById('bottomBookBtn');
  if (bottomBookBtn) {
    bottomBookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModalWithService('');
    });
  }

  document.querySelectorAll('.open-booking-modal, .btn-book-appointment-main').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || '';
      openBookingModalWithService(service);
    });
  });

  if (closeBookingModal) {
    closeBookingModal.addEventListener('click', () => closeModal(bookingModal));
  }
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeModal(bookingModal);
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

  // Handle appointment form submission & WhatsApp Dispatch
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
      const dateInput = document.getElementById('appointmentDate');

      const rawName = (nameInput && nameInput.value) || '';
      const rawPhone = (phoneInput && phoneInput.value) || '';
      const rawService = (serviceCategorySelect && serviceCategorySelect.value) || '';
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

      // Format WhatsApp text
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

      const waUrl = `https://api.whatsapp.com/send?phone=919823577149&text=${encodeURIComponent(waText)}`;

      // Populate enhanced success popup ticket
      if (successPatientName) successPatientName.textContent = name;
      if (ticketNameVal) ticketNameVal.textContent = name;
      if (ticketPhoneVal) ticketPhoneVal.textContent = phone;
      if (ticketServiceVal) ticketServiceVal.textContent = service;
      if (ticketDateVal) ticketDateVal.textContent = formattedDate;
      if (successWhatsAppActionBtn) successWhatsAppActionBtn.href = waUrl;

      // Close booking modal and open enhanced confirmation modal
      closeModal(bookingModal);
      openModal(consultationSuccessModal);

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

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // =================================================================
  // ANCHOR BUTTON CLICK & CARD HIGHLIGHT PULSE
  // (Root Canal and all pills look identical until a user clicks one)
  // =================================================================
  const anchorLinks = document.querySelectorAll('.anchor-pill-link');
  const cards = document.querySelectorAll('.service-card-item');

  // Clear any active state on load so all buttons look identical
  anchorLinks.forEach(l => l.classList.remove('active-pill'));

  function highlightCard(targetEl) {
    cards.forEach(c => c.classList.remove('highlight-pulse'));
    targetEl.classList.add('highlight-pulse');
    setTimeout(() => {
      targetEl.classList.remove('highlight-pulse');
    }, 2000);
  }

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          history.pushState(null, null, targetId);
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          highlightCard(targetEl);

          // ONLY highlight the button that was actually clicked
          anchorLinks.forEach(l => l.classList.remove('active-pill'));
          link.classList.add('active-pill');
        }
      }
    });
  });

  // Back button click handler: straight forward jump to fourth page directly
  const backToHomeBtn = document.getElementById('backToHomeBtn');
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html#slide-4';
    });
  }
});
