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

    // 2. Random Data Simulation for Tech Labels
    const techLabels = document.querySelectorAll('.tech-label');
    function updateTechLabels() {
        techLabels.forEach(label => {
            if (label.textContent.includes('PROTOCOL_LOAD')) {
                const hex = Math.floor(Math.random() * 4096).toString(16).toUpperCase().padStart(3, '0');
                label.textContent = `[PROTOCOL_LOAD: 0x${hex}]`;
            }
        });
    }
    setInterval(updateTechLabels, 3000);

    // 3. Countdown Logic (Fintech Metrics)
    // Target date: June 6, 2026
    const targetDate = new Date('June 6, 2026 00:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.querySelector('.metrics-grid').innerHTML = '<div class="mono">[PROTOCOL_LIVE]</div>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

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
    .to("#term-text", { text: "[ESTABLISHING_DECENTRALIZED_UPLINK...]", duration: 0.5 }, "-=1.8")
    .to(".loader-bar-fill", { width: "80%", duration: 1, ease: "power2.inOut" }, "-=1")
    .to("#term-text", { text: "[SYSTEM_ONLINE_&_READY]", duration: 0.5 }, "-=0.3")
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
        onComplete: startTypewriter // Trigger typewriter when the hero entrance is finished!
    }, "-=0.8");

    function startTypewriter() {
        const engTitle = "Automated Energy Protocol Node Infrastructure.";
        const spTitle = "Infraestructura de Nodo de Protocolo de Energía Automatizado.";
        const engSub = "Engineering the decentralized global energy grid. CargaIA is the core settlement layer for the autonomous future.";
        const spSub = "Ingeniería de la red energética global descentralizada. CargaIA es la capa de liquidación central para el futuro autónomo.";
        
        let typeTl = gsap.timeline(); // Remove repeating loop

        // Phase 1: Type English Title (First Impression)
        typeTl.to("#type-title", { text: engTitle, duration: 3, ease: "none" })
        // Type English Subtitle
        .to("#type-subtitle", { text: engSub, duration: 3, ease: "none" }, "-=1.5")

        // Phase 2: Wait, then Erase English
        .to("#type-title", { text: "", duration: 2, ease: "none", delay: 4 })
        .to("#type-subtitle", { text: "", duration: 2, ease: "none" }, "-=1.5")
        
        // Phase 3: Type Spanish and keep it there forever
        .to("#type-title", { text: spTitle, duration: 3, ease: "none" })
        .to("#type-subtitle", { text: spSub, duration: 3, ease: "none" }, "-=1.5");
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

    // 5. Form Logic (Maxify CRM Integration)
    const waitlistForm = document.getElementById('waitlist-form');
    const formSuccess = document.getElementById('form-success');

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = waitlistForm.querySelector('button');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'ESTABLISHING_LINK...';
            submitBtn.disabled = true;

            const formData = {
                firstName: document.getElementById('name').value,
                email: document.getElementById('email').value,
                tags: ['cargaia', 'fintech_v1', 'preorder_alpha'],
                source: 'CargaIA Landing'
            };

            try {
                const response = await fetch('https://www.gomaxify.com/api/v1/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    waitlistForm.classList.add('hidden');
                    formSuccess.classList.remove('hidden');
                } else {
                    throw new Error('Protocol mismatch');
                }
            } catch (error) {
                console.error('Uplink error:', error);
                submitBtn.textContent = 'RETRY_CONNECT';
                submitBtn.disabled = false;
                alert('Connection failure. Please retry the uplink.');
            }
        });
    }
});
