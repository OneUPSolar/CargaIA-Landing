document.addEventListener('DOMContentLoaded', () => {
    // 1. System Clock Logic
    function updateClock() {
        const clockEl = document.getElementById('sys-clock');
        if (!clockEl) return;
        const now = new Date();
        const timeString = now.toISOString().split('T')[1].split('.')[0];
        clockEl.textContent = `TIMESTAMP: ${timeString}_UTC`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 1b. Countdown Timer — Phase 1 Launch
    const LAUNCH_DATE = new Date('2026-06-06T00:00:00-07:00').getTime();
    function updateCountdown() {
        const now = Date.now();
        const diff = Math.max(0, LAUNCH_DATE - now);
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        const pad = n => String(n).padStart(2, '0');
        document.getElementById('cd-days').textContent = pad(d);
        document.getElementById('cd-hours').textContent = pad(h);
        document.getElementById('cd-mins').textContent = pad(m);
        document.getElementById('cd-secs').textContent = pad(s);
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // 2. Random Data Simulation for Tech Labels
    const techLabels = document.querySelectorAll('.tech-label');
    function updateTechLabels() {
        techLabels.forEach(label => {
            if (label.textContent.includes('LOAD_BALANCE')) {
                const hex = Math.floor(Math.random() * 4096).toString(16).toUpperCase().padStart(3, '0');
                label.textContent = `[LOAD_BALANCE: 0x${hex}]`;
            }
            
            // Subtle random glitch
            if (Math.random() > 0.95) {
                label.classList.add('glitch-text');
                label.setAttribute('data-text', label.textContent);
                setTimeout(() => label.classList.remove('glitch-text'), 500);
            }
        });
    }
    setInterval(updateTechLabels, 2000);

    // 3. Scroll Reveal Animation Logic
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Animated Key Metrics & Rings (ScrollTrigger reveal)
    function animateMetric(id, ringId, target, ringPercent, suffix, duration) {
        const el = document.getElementById(id);
        const ring = document.getElementById(ringId);
        if (!el) return;
        
        const counter = { val: 0 };
        const totalDash = 465;
        
        gsap.to(counter, {
            val: target,
            duration: duration,
            ease: "power2.out",
            snap: { val: 1 },
            scrollTrigger: { trigger: ".metrics-grid", start: "top 90%" },
            onUpdate: () => { 
                el.textContent = Math.round(counter.val) + (suffix || '');
                if (ring) {
                    // Calculate current progress relative to target to animate the ring synchronously
                    const currentPercent = (counter.val / target) * ringPercent;
                    const offset = totalDash - (totalDash * (currentPercent / 100));
                    ring.style.strokeDashoffset = offset;
                }
            }
        });
    }
    animateMetric('metric-danger', 'ring-danger', 73, 73, '%', 2);
    animateMetric('metric-cities', 'ring-cities', 6, 60, '', 2.5); // 6 out of 10 cities = 60% ring fill
    animateMetric('metric-savings', 'ring-savings', 40, 40, '%', 3);

    // 4. GSAP Advanced Vectorized & Reveal Animations
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // Master Timeline for Loading & Initial Entrances
    const tl = gsap.timeline();

    // Loader Letter Sequence (C A R G A I A)
    tl.to(".loader-text span", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "expo.out"
    })
    // Scale text slightly while loading for dramatic effect
    .to(".loader-text", {
        scale: 1.05,
        duration: 3,
        ease: "power1.inOut"
    }, "<")
    // Terminal text sequence & Progress Bar
    .to(".loader-bar-fill", { width: "30%", duration: 0.8, ease: "power2.out" }, "-=2.5")
    .to("#term-text", { text: "[SCANNING_GRID_INFRASTRUCTURE...]", duration: 0.5 }, "-=1.8")
    .to(".loader-bar-fill", { width: "80%", duration: 1, ease: "power2.inOut" }, "-=1")
    .to("#term-text", { text: "[INFRASTRUCTURE_READY]", duration: 0.5 }, "-=0.3")
    .to(".loader-bar-fill", { width: "100%", duration: 0.3, ease: "power2.in" })
    
    // Flash explosion of text before hiding overlay
    .to(".loader-text", {
        scale: 1.3,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.6,
        ease: "power4.in"
    })
    .to(".loader-progress-container", {
        opacity: 0,
        duration: 0.4
    }, "<")
    
    // Hide Loader overlay smoothly backwards into the z-axis
    .to("#loader", {
        opacity: 0,
        scale: 1.1,
        duration: 1,
        ease: "power3.inOut"
    }, "-=0.2")
    .set("#loader", { display: "none" })
    // Enter the Header
    .from(".header", { 
        y: -100, 
        opacity: 0, 
        duration: 1.2, 
        ease: "power4.out" 
    }, "-=0.6")
    // Materialize the HUD Panels
    .from(".hud-group", {
        opacity: 0,
        scale: 0.9,
        stagger: 0.2,
        duration: 1.2,
        ease: "expo.out"
    }, "-=1")
    // Hero Content Drop-in
    .from(".hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        onComplete: startTypewriter
    }, "-=0.8")
    // Hero SVG Draw-on
    .to("#heroSvg .draw-on", {
        strokeDashoffset: 0,
        duration: 1.8,
        stagger: 0.06,
        ease: "power2.inOut"
    }, "-=1.2");

    function startTypewriter() {
        const engTitle = "Mexico is going electric. Charge without fear.";
        const spTitle = "México se electrifica. Carga sin miedo.";
        const engSub = "Safe EV charging starts with real infrastructure. CargaIA deploys compliant, managed charging for homes and businesses across Mexico.";
        const spSub = "La carga EV segura empieza con infraestructura real. CargaIA despliega carga certificada y gestionada para hogares y negocios en todo México.";
        
        const titleEl = document.getElementById('type-title');
        const subEl = document.getElementById('type-subtitle');
        
        let typeTl = gsap.timeline();

        // Phase 1: Type English Title (Snappier)
        typeTl.to(titleEl, { text: engTitle, duration: 1.5, ease: "none" })
        .to(subEl, { text: engSub, duration: 2, ease: "none" }, "-=0.5")

        // Phase 2: Glitch Transition
        .to([titleEl, subEl], { 
            onStart: () => {
                titleEl.classList.add('glitch-text');
                titleEl.setAttribute('data-text', engTitle);
                subEl.classList.add('glitch-text');
                subEl.setAttribute('data-text', engSub);
            },
            delay: 3,
            duration: 0.5
        })
        .set([titleEl, subEl], { text: "" })
        .to([titleEl, subEl], { 
            onStart: () => {
                titleEl.classList.remove('glitch-text');
                subEl.classList.remove('glitch-text');
            },
            duration: 0.1
        })
        
        // Phase 3: Type Spanish
        .to(titleEl, { text: spTitle, duration: 1.5, ease: "none" })
        .to(subEl, { text: spSub, duration: 2, ease: "none" }, "-=0.5");
    }

    // Animated Flow SVG Line
    gsap.to("#data-flow-1", {
        strokeDashoffset: -2100, // Move the dash along the vector path
        duration: 4,
        ease: "linear",
        repeat: -1
    });

    // Mouse Parallax for Tech Infrastructure
    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        
        gsap.to(".mesh-bg", { x: x, y: y, duration: 1.5, ease: "power2.out" });
        gsap.to(".infra-svg", { x: -x * 1.5, y: -y * 1.5, duration: 2, ease: "power2.out" });
    });

    // Scroll Animations for Section Titles
    document.querySelectorAll(".section-title").forEach(title => {
        gsap.from(title, {
            scrollTrigger: { trigger: title, start: "top 85%" },
            y: 30, opacity: 0, duration: 1.2, ease: "power3.out"
        });
    });

    // Specs Grid Reveal
    gsap.from(".spec-item", {
        scrollTrigger: { trigger: ".spec-grid", start: "top 80%" },
        y: 50, opacity: 0, stagger: 0.15, duration: 1, ease: "power3.out"
    });

    // Animate Feature Cards Vectorized Icons
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: card, start: "top 90%" },
            y: 40,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: "back.out(1.7)"
        });
        
        // Hover effect for the vectorized icon
        card.addEventListener('mouseenter', () => {
            gsap.to(card.querySelector('.feature-electric-icon svg'), {
                scale: 1.2, rotation: 5, duration: 0.3, ease: "power2.out"
            });
            gsap.to(card, { borderColor: "var(--electric-cyan)", duration: 0.3 });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card.querySelector('.feature-electric-icon svg'), {
                scale: 1, rotation: 0, duration: 0.3, ease: "power2.inOut"
            });
            gsap.to(card, { borderColor: "var(--glass-border)", duration: 0.3 });
        });
    });

    // Section Typewriter Effects (bilingual like hero)
    function sectionTypewriter(titleId, introId, titleEN, titleES, introEN, introES) {
        const titleEl = document.querySelector(`#${titleId} span:first-child`);
        const introEl = introId ? document.getElementById(introId) : null;
        if (!titleEl) return;

        ScrollTrigger.create({
            trigger: `#${titleId}`,
            start: 'top 80%',
            once: true,
            onEnter: () => {
                const tl = gsap.timeline();
                const targets = introEl ? [titleEl, introEl] : [titleEl];
                tl.to(titleEl, { text: titleEN, duration: 1.2, ease: 'none' });
                if (introEl) tl.to(introEl, { text: introEN, duration: 1.5, ease: 'none' }, '-=0.5');
                tl.to(targets, {
                    onStart: () => {
                        titleEl.classList.add('glitch-text');
                        titleEl.setAttribute('data-text', titleEN);
                    },
                    delay: 3, duration: 0.4
                })
                .set(targets, { text: '' })
                .to(targets, {
                    onStart: () => titleEl.classList.remove('glitch-text'),
                    duration: 0.1
                })
                .to(titleEl, { text: titleES, duration: 1.2, ease: 'none' });
                if (introEl) tl.to(introEl, { text: introES, duration: 1.5, ease: 'none' }, '-=0.5');
            }
        });
    }
    // ─────────────────────────────────────────────────
    // RESERVATIONS — bilingual label + title + intro
    // ─────────────────────────────────────────────────
    sectionTypewriter(
        'reservations-title', 'reservations-intro',
        'Reserve your install.',
        'Reserva tu instalación.',
        'Lock in Fase 1 Tijuana. Choose your tier — your deposit applies to your first monthly bill, or is fully refunded if your site does not qualify.',
        'Asegura tu lugar en Fase 1 Tijuana. Elige tu tier — tu depósito aplica a tu primera mensualidad, o se reembolsa 100% si tu sitio no califica.'
    );

    // Cycle the [FASE_1 // ...] mode label between ES / EN
    (function cycleReservationsLabel() {
        const el = document.getElementById('reservations-label-mode');
        if (!el) return;
        const modes = ['CUPOS_RESERVADOS', 'SLOTS_RESERVED'];
        let i = 0;
        el.textContent = modes[0];
        setInterval(() => {
            i = (i + 1) % modes.length;
            el.textContent = modes[i];
        }, 3500);
    })();

    // Cycle the fineprint between ES / EN
    (function cycleReservationsFineprint() {
        const el = document.getElementById('reservations-fineprint');
        if (!el) return;
        const lines = [
            'DEPÓSITO 100% REEMBOLSABLE · SUJETO A CALIFICACIÓN DE SITIO',
            'DEPOSIT 100% REFUNDABLE · SUBJECT TO SITE QUALIFICATION'
        ];
        let i = 0;
        el.textContent = lines[0];
        setInterval(() => {
            i = (i + 1) % lines.length;
            el.textContent = lines[i];
        }, 3500);
    })();

    // Tier CTA — placeholder (Stripe wires here later)
    document.querySelectorAll('[data-tier-cta]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tier = e.currentTarget.getAttribute('data-tier-cta');
            // For now, scroll to the waitlist form and prefill a hidden field if you want.
            const target = document.getElementById('waitlist') || document.getElementById('cta');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            // TODO: replace with Stripe Checkout session create
            console.log('[CARGAIA] tier reservation requested:', tier);
        });
    });

    // Animate progress bar fill on scroll-in
    (function animateReservationsProgress() {
        const fillEl = document.getElementById('rsv-fill');
        const filledEl = document.getElementById('rsv-filled');
        if (!fillEl || !filledEl) return;
        const filled = parseInt(filledEl.textContent, 10) || 0;
        const total = parseInt(document.getElementById('rsv-total').textContent, 10) || 200;
        const pct = Math.max(0, Math.min(100, (filled / total) * 100));

        ScrollTrigger.create({
            trigger: '#reservations-section',
            start: 'top 75%',
            once: true,
            onEnter: () => {
                fillEl.style.width = '0%';
                requestAnimationFrame(() => {
                    fillEl.style.width = pct + '%';
                });
            }
        });
    })();

    sectionTypewriter(
        'title-problem', 'intro-problem',
        'Infrastructure Failure.',
        'Fallo de Infraestructura.',
        'EV adoption is outpacing electrical infrastructure across Mexico. Unsafe installations melt meters, overload panels, and create real damage.',
        'La adopción de EVs supera la infraestructura eléctrica en México. Instalaciones inseguras derriten medidores, sobrecargan paneles y causan daños reales.'
    );

    sectionTypewriter(
        'title-solution', 'intro-solution',
        'How CargaIA Works.',
        'Cómo Funciona CargaIA.',
        'From site qualification to managed service — one platform handles the entire lifecycle of your EV charging infrastructure.',
        'Desde la calificación del sitio hasta el servicio gestionado — una plataforma maneja todo el ciclo de tu infraestructura de carga EV.'
    );

    sectionTypewriter(
        'title-market', null,
        'Who We Serve.',
        'A Quién Servimos.',
        '', ''
    );

    // Comparison Cards Reveal
    document.querySelectorAll('.comparison-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: '.comparison-grid', start: 'top 85%' },
            y: 40, opacity: 0, scale: 0.95,
            duration: 0.8, delay: i * 0.2,
            ease: 'back.out(1.2)'
        });
    });

    // Process Steps Reveal
    document.querySelectorAll('.process-step').forEach((step, i) => {
        gsap.from(step, {
            scrollTrigger: { trigger: '.process-steps', start: 'top 85%' },
            y: 50, opacity: 0, scale: 0.9,
            duration: 0.7, delay: i * 0.15,
            ease: 'back.out(1.4)'
        });
    });

    // Audience Cards Reveal
    document.querySelectorAll('.audience-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: { trigger: '.audience-grid', start: 'top 85%' },
            y: 60, opacity: 0, scale: 0.95,
            duration: 0.8, delay: i * 0.12,
            ease: 'back.out(1.4)'
        });
    });

    // Layer Tags Fade-in
    document.querySelectorAll('.layer-tag').forEach(tag => {
        gsap.from(tag, {
            scrollTrigger: { trigger: tag, start: 'top 90%' },
            x: -30, opacity: 0, duration: 0.8, ease: 'power3.out'
        });
    });

    // Section Intro Text Fade
    document.querySelectorAll('.section-intro').forEach(intro => {
        gsap.from(intro, {
            scrollTrigger: { trigger: intro, start: 'top 85%' },
            y: 20, opacity: 0, duration: 1, ease: 'power3.out'
        });
    });

    // 7. BYD SEAL Canvas + Hologram Overlays (Motion Design Principles Applied)
    // 7. EV Transparent Images Sequence (Fluid Professional Crossfade)
    const evSection = document.getElementById('car-section');
    const evContainer = document.getElementById('ev-image-container');
    
    if (evSection && evContainer) {
        // Detect viewport and pick the correct video variants for this device.
        function getActiveVideoIds() {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            const suffix = isMobile ? '-mobile' : '-desktop';
            return {
                battery: '#ev-img-battery' + suffix,
                port:    '#ev-img-port'    + suffix,
                aero:    '#ev-img-aero'    + suffix
            };
        }
        let evIds = getActiveVideoIds();

        // Setup the GSAP timeline
        const evTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#car-pin",
                start: "top top",
                end: "+=2200", // Shortened from 3000 to remove blank space
                scrub: 1.5,
                pin: true,
                pinSpacing: true
            }
        });

        // Initialize hotspots with blur
        gsap.set('.hs-line', { width: 0 });
        gsap.set('.hs-content', { opacity: 0, x: 20, filter: "blur(4px)" });
        gsap.set('.hs-port .hs-content', { x: -20, filter: "blur(4px)" });
        
        // Initial Image setup: Battery visible, others hidden
        gsap.set(evIds.battery, { opacity: 1, scale: 1, filter: "blur(0px)" });
        gsap.set(evIds.port, { opacity: 0, scale: 1.05, filter: "blur(4px)" });
        gsap.set(evIds.aero, { opacity: 0, scale: 1.05, filter: "blur(4px)" });

        // --- PHASE 1: Battery Matrix (0-33%) ---
        evTl.to(evIds.battery, { scale: 1.05, duration: 1.5, ease: "none" })
            .to('#hs-battery', { opacity: 1, duration: 0.2 }, "-=1.2")
            .to('#hs-battery .hs-line', { width: 100, duration: 0.4 }, "-=1")
            .to('#hs-battery .hs-content', { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.4, ease: "power2.out" }, "-=0.6")
            .to({}, { duration: 0.8 }); // Hold text visible

        // --- PHASE 2: Smart Port (33-66%) ---
        // Crossfade to port image while fading out old text
        evTl.to('#hs-battery', { opacity: 0, y: -5, filter: "blur(2px)", duration: 0.3 }, "+=0")
            .to(evIds.battery, { opacity: 0, filter: "blur(4px)", duration: 0.8 }, "<")
            .to(evIds.port, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5, ease: "power1.out" }, "<")
            .to('#hs-port', { opacity: 1, duration: 0.2 }, "-=1.2")
            .to('#hs-port .hs-line', { width: 80, duration: 0.4 }, "-=1.0")
            .to('#hs-port .hs-content', { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.4, ease: "power2.out" }, "-=0.6")
            .to({}, { duration: 0.8 }); // Hold

        // --- PHASE 3: Aerodynamics (66-100%) ---
        // Crossfade to aero image while fading out old text
        evTl.to('#hs-port', { opacity: 0, y: -5, filter: "blur(2px)", duration: 0.3 }, "+=0")
            .to(evIds.port, { opacity: 0, filter: "blur(4px)", duration: 0.8 }, "<")
            .to(evIds.aero, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5, ease: "power1.out" }, "<")
            .to('#hs-aero', { opacity: 1, duration: 0.2 }, "-=1.2")
            .to('#hs-aero .hs-line', { width: 120, duration: 0.4 }, "-=1.0")
            .to('#hs-aero .hs-content', { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.4, ease: "power2.out" }, "-=0.6")
            .to({}, { duration: 0.5 }) // Reduced hold to fix blank space
            .to('#hs-aero', { opacity: 0, y: -5, filter: "blur(2px)", duration: 0.5 })
            .to(evIds.aero, { opacity: 0, filter: "blur(6px)", duration: 0.8 }, "<");
            
        // Handle viewport rotation
        window.matchMedia('(max-width: 768px)').addEventListener('change', () => {
            evIds = getActiveVideoIds();
            if (window.ScrollTrigger) ScrollTrigger.refresh();
        });

        // Recompute pin offsets once images/videos have settled. Safe to call
        // even if not needed; ScrollTrigger.refresh() is idempotent.
        window.addEventListener('load', () => {
            if (window.ScrollTrigger) ScrollTrigger.refresh();
        });
    }

    // Pause EV videos when scrolled out of view to save battery/CPU.
    // Resume when scrolled back in.
    (function manageEvVideos() {
        const videos = document.querySelectorAll('#ev-image-container video');
        if (!videos.length || typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                videos.forEach((v) => {
                    if (entry.isIntersecting) {
                        const playPromise = v.play();
                        if (playPromise && playPromise.catch) playPromise.catch(() => {});
                    } else {
                        v.pause();
                    }
                });
            });
        }, { threshold: 0.05 });
        const section = document.getElementById('car-section');
        if (section) observer.observe(section);
    })();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // GOOGLE SHEETS WEBHOOK — paste your deployed
    // Apps Script Web App URL here:
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyGC43LO1vYrCql73lZvZ1mRHByTeToEQtSki2W_wJ-XezAt0IcVqgF75d6ORI0RyXDdg/exec';

    async function submitToSheets(payload) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch(SHEETS_WEBHOOK_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error('Submission failed');
            return true;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // 5. Hero Simulator CTA
    const simulatorCTA = document.getElementById('open-simulator-cta');
    if (simulatorCTA) {
        simulatorCTA.addEventListener('click', () => {
            if (typeof window.openSimulatorModal === 'function') {
                window.openSimulatorModal();
            }
        });
    }

    // 5b. Scroll-down trigger — opens the modal on first scroll past hero,
    //     but ONLY if the user hasn't already opened it manually this session.
    let modalAutoOpened = false;
    function onFirstScrollPastHero() {
        if (modalAutoOpened) return;
        const hero = document.getElementById('layer1');
        if (!hero) return;
        const heroBottom = hero.getBoundingClientRect().bottom;
        // Trigger when the user has scrolled past 50% of the hero
        if (heroBottom < window.innerHeight * 0.5) {
            modalAutoOpened = true;
            window.removeEventListener('scroll', onFirstScrollPastHero);
            if (typeof window.openSimulatorModal === 'function') {
                window.openSimulatorModal();
            }
        }
    }
    window.addEventListener('scroll', onFirstScrollPastHero, { passive: true });

    // 6. CTA Pre-Registration Form
    const ctaForm = document.getElementById('cta-form');
    const ctaSuccess = document.getElementById('cta-success');

    if (ctaForm) {
        ctaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = ctaForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'PROCESANDO...';
            submitBtn.disabled = true;

            const payload = {
                timestamp: new Date().toISOString(),
                nombre: document.getElementById('cta-name').value,
                email: document.getElementById('cta-email').value,
                region: document.getElementById('cta-region')?.value || 'tijuana',
                tipo_usuario: document.getElementById('cta-type')?.value || 'homeowner',
                fuente: 'CTA Pre-Registro'
            };

            try {
                await submitToSheets(payload);
                ctaForm.classList.add('hidden');
                ctaSuccess.classList.remove('hidden');
            } catch (error) {
                console.error('Error:', error);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('Error al registrar. Por favor intenta de nuevo.');
            }
        });
    }
});
