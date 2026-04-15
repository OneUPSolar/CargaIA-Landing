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

    // 3. Animated Key Metrics (ScrollTrigger reveal)
    function animateMetric(id, target, suffix, duration) {
        const el = document.getElementById(id);
        if (!el) return;
        const counter = { val: 0 };
        gsap.to(counter, {
            val: target,
            duration: duration,
            ease: "power2.out",
            snap: { val: 1 },
            scrollTrigger: { trigger: ".metrics-grid", start: "top 90%" },
            onUpdate: () => { el.textContent = Math.round(counter.val) + (suffix || ''); }
        });
    }
    animateMetric('metric-danger', 73, '%', 2);
    animateMetric('metric-cities', 6, '', 2.5);
    animateMetric('metric-savings', 40, '%', 3);

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
        const engTitle = "Charging an EV should not melt your meter.";
        const spTitle = "Cargar un EV no debería derretir tu medidor.";
        const engSub = "Safe EV charging starts with real infrastructure. CargaIA deploys compliant, managed charging for homes and businesses across Mexico.";
        const spSub = "La carga segura de EVs comienza con infraestructura real. CargaIA instala carga gestionada y certificada para hogares y negocios en todo México.";
        
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
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // GOOGLE SHEETS WEBHOOK — paste your deployed
    // Apps Script Web App URL here:
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyGC43LO1vYrCql73lZvZ1mRHByTeToEQtSki2W_wJ-XezAt0IcVqgF75d6ORI0RyXDdg/exec';

    async function submitToSheets(payload) {
        // NOTE: no-cors blocks custom headers like Content-Type: application/json.
        // Using text/plain (a "simple" header) lets the browser send the body.
        // Apps Script reads e.postData.contents as a string — JSON.parse still works.
        await fetch(SHEETS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
        return true;
    }

    // 5. Hero Waitlist Form
    const waitlistForm = document.getElementById('waitlist-form');
    const formSuccess = document.getElementById('form-success');

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = waitlistForm.querySelector('button');
            const originalText = submitBtn.textContent;

            submitBtn.textContent = 'ENVIANDO...';
            submitBtn.disabled = true;

            const payload = {
                timestamp: new Date().toISOString(),
                nombre: document.getElementById('name').value,
                email: document.getElementById('email').value,
                region: document.getElementById('region')?.value || 'tijuana',
                tipo: 'early_access',
                fuente: 'Hero Waitlist'
            };

            try {
                await submitToSheets(payload);
                waitlistForm.classList.add('hidden');
                formSuccess.classList.remove('hidden');
            } catch (error) {
                console.error('Error:', error);
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('Error al enviar. Por favor intenta de nuevo.');
            }
        });
    }

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
