'use strict';

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('header');
    const preloader = document.getElementById('preloader');
    const navLinks = document.querySelector('.nav-links');
    const burger = document.querySelector('.burger');
    const modal = document.getElementById('menu-modal');
    const closeModal = document.querySelector('#menu-modal .close-modal');
    const menuItems = document.querySelectorAll('.menu-item');
    const contactForm = document.getElementById('main-contact-form');

    const reservasModal = document.getElementById('reservas-modal');
    const reservasForm = document.getElementById('reservas-form');
    const fechaInput = document.getElementById('fecha');

    // 1. Preloader: Ocultarlo cuando la página esté completamente cargada
    window.addEventListener('load', () => {
        if (preloader) preloader.classList.add('hidden');
    });

    // 2. Header Pegajoso (Sticky) que cambia con el scroll
    const handleScroll = () => {
        if (!header) return;
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);

    // Establecer la fecha mínima como hoy para el formulario de reservas (si existe)
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.min = today;
    }

    // 3. Menú de Hamburguesa (Móvil)
    if (burger && navLinks) {
        const toggleNav = () => {
            navLinks.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
        };
        burger.addEventListener('click', toggleNav);
    }

    // 4. Animaciones al Hacer Scroll (Intersection Observer API)
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length) {
        const observerOptions = { root: null, threshold: 0.1 };
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        };
        const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
        animatedElements.forEach(el => scrollObserver.observe(el));
    }

    // 5. Lógica del Modal del Menú
    if (menuItems && modal) {
        const openModal = (e) => {
            const item = e.currentTarget;
            const name = item.dataset.name || '';
            const desc = item.dataset.desc || '';
            const price = item.dataset.price || '';
            const img = item.dataset.img || '';

            const modalName = modal.querySelector('#modal-name');
            const modalDesc = modal.querySelector('#modal-desc');
            const modalPrice = modal.querySelector('#modal-price');
            const modalImg = modal.querySelector('#modal-img');

            if (modalName) modalName.textContent = name;
            if (modalDesc) modalDesc.textContent = desc;
            if (modalPrice) modalPrice.textContent = price;
            if (modalImg) {
                modalImg.src = img;
                modalImg.alt = name;
            }

            modal.style.display = 'flex';
        };

        const hideModal = () => { modal.style.display = 'none'; };

        menuItems.forEach(item => item.addEventListener('click', openModal));
        if (closeModal) closeModal.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });
    }

    // 6. Modal de Reservas
    if (reservasModal) {
        window.openReservasModal = function() { reservasModal.style.display = 'flex'; };
        window.closeReservasModal = function() { reservasModal.style.display = 'none'; };

        reservasModal.addEventListener('click', (e) => { if (e.target === reservasModal) closeReservasModal(); });

        if (reservasForm) {
            reservasForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Aquí se podría integrar envío a servidor; por ahora confirmación local
                alert('¡Reserva realizada con éxito! Te enviaremos un email de confirmación.');
                closeReservasModal();
                reservasForm.reset();
            });
        }
    }

    // 7. Validación simple del Formulario de Contacto
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('#name').value;
            const email = contactForm.querySelector('#email').value;
            const message = contactForm.querySelector('#message').value;
            if (name.trim() === '' || email.trim() === '' || message.trim() === '') {
                alert('Por favor, rellena todos los campos.');
                return;
            }
            alert(`¡Gracias por tu mensaje, ${name}! Te contactaremos pronto.`);
            contactForm.reset();
        });
    }

});