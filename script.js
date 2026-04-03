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

    // 4. Reveal Animations on Scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

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
