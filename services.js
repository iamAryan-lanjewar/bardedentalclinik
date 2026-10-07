// ===================================================================
// BARDE DENTAL CLINIC — SERVICES PAGE LOGIC
// Anchor Scroll, Card Highlighting, Rich Detail Modals, & Booking Form
// ===================================================================

// Global Error Guard: Gracefully prevent third-party issues from throwing unwanted errors
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
  // Service Data for "read more.." rich dialogs
  const serviceDetails = {
    'root-canal': {
      title: 'Root Canal Therapy',
      subtitle: 'Painless microscopic endodontic tooth-saving care',
      image: 'assets/service_root_canal.webp?v=12.0',
      specs: [
        { label: 'Technology:', value: 'Nickel-Titanium rotary files & apex locators' },
        { label: 'Pain Level:', value: 'Virtually pain-free with computer-controlled anesthesia' },
        { label: 'Visits Required:', value: 'Usually single visit (45–60 minutes)' },
        { label: 'Success Rate:', value: 'Over 97% permanent tooth preservation' }
      ],
      description: 'A root canal sounds scary, but it actually ends the pain. Deep inside each tooth is the dental pulp. When severe decay or trauma causes infection, modern microscopic endodontics removes infected tissue, cleans and sterilizes canals, and seals the tooth safely so you keep your natural smile without extraction.'
    },
    'denture': {
      title: 'Complete & Partial Dentures',
      subtitle: 'Comfortable, natural-looking replacement teeth for easy chewing and smiling',
      image: 'assets/service_denture.webp?v=1.0',
      specs: [
        { label: 'Types Available:', value: 'Full complete dentures & flexible partial dentures' },
        { label: 'Custom Fit:', value: 'Molded gently to match your natural gums and facial shape' },
        { label: 'Daily Comfort:', value: 'Restores comfortable chewing, clear speech & natural face shape' },
        { label: 'Easy Care:', value: 'Simple to remove and clean daily with warm water and soft brush' }
      ],
      description: 'Dentures are gentle, removable teeth designed to replace missing teeth when you have lost several or all of them. Made from lightweight, natural-looking materials, they rest comfortably on your gums and support your facial muscles so your cheeks do not look sunken. Whether you need a full set or just a partial set to fill empty gaps, our custom-crafted dentures let you enjoy your favorite foods and smile happily again.'
    },
    'cavities': {
      title: 'Cosmatic Filling',
      subtitle: 'Biocompatible nano-hybrid tooth-colored restorations & cosmatic fillings',
      image: 'assets/service_new_teeth_implant.webp?v=10.0',
      specs: [
        { label: 'Material:', value: 'Nano-hybrid composite resins matching enamel translucency' },
        { label: 'Detection:', value: 'High-definition digital intraoral camera & CBCT' },
        { label: 'Procedure:', value: 'Minimally invasive, preserving maximal healthy enamel' },
        { label: 'Durability:', value: '10+ years with proper oral hygiene' }
      ],
      description: 'A cavity starts silently when food and bacteria team up to slowly eat away at your enamel. Left untreated, acid erodes tooth layers until reaching nerves. We provide early laser diagnostics, gentle enamel remineralization, and imperceptible tooth-colored fillings that restore 100% natural tooth shape and strength.'
    },
    'surgical-extraction': {
      title: 'Surgical Tooth Extraction',
      subtitle: 'Gentle, pain-free removal for impacted wisdom teeth and deep roots',
      image: 'assets/service_surgical_extraction.webp?v=1.0',
      specs: [
        { label: 'When Needed:', value: 'Impacted wisdom teeth, broken roots beneath gumline' },
        { label: 'Comfort Level:', value: '100% painless with gentle modern local numbing' },
        { label: 'Procedure:', value: 'Careful microsurgical release protecting bone & gums' },
        { label: 'Smooth Healing:', value: 'Quick recovery with clear, simple home care guidance' }
      ],
      description: 'Sometimes a tooth is trapped under the gums, growing sideways (like an impacted wisdom tooth), or broken too close to the gumline for a simple pull. A surgical extraction is a gentle, routine procedure where Dr. Barde carefully numbs the entire area so you stay relaxed and comfortable with zero pain. The tooth is gently freed and removed with minimal pressure, protecting your surrounding jawbone and ensuring smooth, fast healing.'
    },
    'cleaning': {
      title: 'Ultra Sonic Scaling',
      subtitle: 'Healthy habits start with clean smiles',
      image: 'assets/service_cleaning.webp?v=13.0',
      specs: [
        { label: 'Method:', value: 'Air-Flow ultrasonic micro-vibrations & gentle water jet' },
        { label: 'Benefits:', value: 'Eliminates stubborn plaque, calculus, tea/coffee stains' },
        { label: 'Gum Protection:', value: 'Prevents gingivitis, bleeding, and bone loss' },
        { label: 'Frequency:', value: 'Recommended every 6 months for optimum health' }
      ],
      description: 'Prevent unexpected cavities, and keep teeth visibly stain-free. Even with meticulous brushing, mineralized calculus builds up along the gum line. Our advanced dental hygiene suite uses gentle ultrasonic micro-frequencies to remove plaque and polish teeth to a high-gloss, mirror shine.'
    },
    'crown-bridge': {
      title: 'Crown & Bridges',
      subtitle: 'Protect weak teeth and easily replace missing smiles',
      image: 'assets/service_crown_bridge.webp?v=2.0',
      specs: [
        { label: 'What is a Crown?', value: 'A custom tooth-colored cap that covers and protects a weak tooth' },
        { label: 'What is a Bridge?', value: 'Replacement teeth anchored securely to fill empty tooth gaps' },
        { label: 'Materials:', value: 'High-strength natural ceramic & zirconia color-matched to teeth' },
        { label: 'Durability:', value: 'Long-lasting natural bite strength for 10 to 15+ years' }
      ],
      description: 'A dental crown is like a custom-made protective helmet for a weak, cracked, or treated tooth—restoring its shape, strength, and chewing power. If you have one or more missing teeth, a dental bridge comfortably fills the empty gap by connecting to neighboring teeth. Both blend in naturally with your smile, feel like real teeth, and let you bite, talk, and smile with zero worry.'
    },
    'veneers': {
      title: 'Dental Veeners',
      subtitle: 'Ultra-thin Swiss porcelain cosmetic smile transformation',
      image: 'assets/service_veneers.webp?v=10.0',
      specs: [
        { label: 'Material:', value: 'IPS e.max® press high-translucency lithium disilicate' },
        { label: 'Thickness:', value: 'Ultra-thin 0.2mm – 0.3mm (minimal tooth prep)' },
        { label: 'Customization:', value: 'CAD/CAM digital shade matching (Vita Bleach BL1-BL4)' },
        { label: 'Warranty:', value: '10-Year Clinical Warranty & 15+ year durability' }
      ],
      description: 'Dental veeners are ultra-thin custom ceramic shells bonded permanently to the front of teeth. They instantly correct discoloration, close gaps, fix chipped edges, and harmonize teeth alignment for a radiant, Hollywood-grade smile designed in harmony with your facial symmetry.'
    },
    'implant-surgery': {
      title: 'Implants',
      subtitle: 'Permanent replacement for missing teeth with artificial roots',
      image: 'assets/service_implant_surgery.webp?v=12.0',
      specs: [
        { label: 'Material:', value: 'Medical titanium screw with custom ceramic crown' },
        { label: 'Accuracy:', value: '3D guided digital scan for safe and exact placement' },
        { label: 'Benefit:', value: 'Restores 100% natural chewing and keeps jawbone strong' },
        { label: 'Lifespan:', value: 'Permanent, long-lasting solution with proper oral care' }
      ],
      description: 'Dental implants are the most reliable way to replace missing teeth. A small titanium post acts like a natural tooth root in your jaw, holding a custom-made crown securely in place so you can eat, smile, and speak with complete confidence.'
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
    },
    'intraoral-camera': {
      title: 'Dental Intraoral Camera',
      subtitle: 'See your teeth clearly on a live screen in real-time',
      image: 'assets/service_intraoral_camera.webp?v=1.0',
      specs: [
        { label: 'How It Works:', value: 'Tiny gentle pen-camera shows live color video of teeth' },
        { label: 'Comfort Level:', value: '100% painless, safe, gentle and zero radiation' },
        { label: 'What You See:', value: 'High-definition zoom view of teeth, fillings and gums' },
        { label: 'Why It Helps:', value: 'See what the dentist sees so you easily understand your care' }
      ],
      description: 'An intraoral camera is a small, pen-sized wand with a gentle light that lets you see inside your mouth on a live high-definition screen. Instead of just hearing about a dental issue, you can see it with your own eyes in real-time. It helps spot early cavities, tiny cracks, and hidden plaque comfortably and with complete honesty, so you can make informed decisions about your smile with zero stress or pain.'
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
  const ticketDateVal = document.getElementById('ticketDateVal');
  const ticketTimeVal = document.getElementById('ticketTimeVal');

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
    closeModal(bookingModal);
    closeModal(detailModal);
    closeModal(consultationSuccessModal);
  }

  // Universal close button delegation
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.modal-close-btn, [data-close-modal], #closeBookingModal, #closeSuccessModal, #closeSuccessDoneBtn, #closeDetailModal, #closeDetailBackBtn');
    if (closeBtn) {
      e.preventDefault();
      e.stopPropagation();
      closeAllModals();
    }
  });

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

      // Format WhatsApp text
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

      // Close booking modal and open enhanced confirmation modal
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
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        setTimeout(() => {
          window.location.href = waUrl;
        }, 800);
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

          // Smoothly center the tapped button within the horizontal scroll on mobile
          try {
            link.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } catch (_) {}
        }
      }
    });
  });

  // Back button click handler: navigate back to 4th page on Home
  const backToHomeBtn = document.getElementById('backToHomeBtn');
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html#slide-4';
    });
  }

  // Mobile bottom dock Home button handler: return to Home page
  const mobDockHome = document.getElementById('mobDockHome');
  if (mobDockHome) {
    mobDockHome.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
});
