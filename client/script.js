document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            // Toggle icon here if using SVGs, for now just simple toggle
        });
    }

    // Set Copyright Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Fetch Services (if on Home Page)
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        fetchServices();
    }

    async function fetchServices() {
        try {
            const res = await fetch('/api/services');
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    renderServices(data);
                }
            }
        } catch (err) {
            console.warn("API unavailable, using static content.");
        }
    }

    function renderServices(services) {
        if (!servicesGrid) return;
        servicesGrid.innerHTML = services.map(service => `
            <div class="service-card">
                <div class="service-icon">
                    ${getIconSvg(service.icon)}
                </div>
                <h3 class="service-title">${service.title}</h3>
                <p class="service-desc">${service.description}</p>
            </div>
        `).join('');
    }

    // Helper for Icons (Simple SVG fallback for Lucide)
    function getIconSvg(name) {
        // Simple mapping for demo purposes. 
        // In a real static HTML, you might use an icon font or SVG sprites.
        // Here returning simple inline SVGs.
        const icons = {
            'zap': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
            'droplet': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.74 5.88a6 6 0 0 1-8.48 8.48A6 6 0 0 1 5.53 9.35l5.74-5.88a1 1 0 0 1 1.46 0z"></path></svg>',
            'wrench': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>',
            'book-open': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
            'default': '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        // Normalized key
        const key = name ? name.toLowerCase().replace('ico', '') : 'default';
        return icons[key] || icons['default'];
    }

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            const msgContainer = document.getElementById('contact-msg');

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';
            msgContainer.textContent = '';
            msgContainer.style.color = '';

            const formData = {
                name: contactForm.name.value,
                email: contactForm.email.value,
                message: contactForm.message.value
            };

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    msgContainer.textContent = 'Message sent successfully!';
                    msgContainer.style.color = '#059669';
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send');
                }
            } catch (err) {
                msgContainer.textContent = 'Failed to send message. Please try again.';
                msgContainer.style.color = '#dc2626';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Internship Form Handling
    const internshipForm = document.getElementById('internship-form');
    if (internshipForm) {
        internshipForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = internshipForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            const msgContainer = document.getElementById('internship-msg');

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting...';
            msgContainer.textContent = '';
            msgContainer.style.color = '';

            const formData = {
                name: internshipForm.name.value,
                collegeName: internshipForm.collegeName.value,
                course: internshipForm.course.value,
                branch: internshipForm.branch.value,
                academicYear: internshipForm.academicYear.value,
                domain: internshipForm.domain.value,
                email: internshipForm.email.value,
                phone: internshipForm.phone.value
            };

            try {
                const res = await fetch('/api/internship', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    msgContainer.textContent = 'Application submitted successfully!';
                    msgContainer.style.color = '#059669';
                    internshipForm.reset();
                } else {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to submit');
                }
            } catch (err) {
                console.error(err);
                msgContainer.textContent = err.message || 'Failed to submit application. Please try again.';
                msgContainer.style.color = '#dc2626';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });

        // Excel Download
        const downloadBtn = document.getElementById('download-excel-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                window.open('/api/internship/excel', '_blank');
            });
        }
    }
});
