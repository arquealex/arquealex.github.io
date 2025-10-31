'use strict';

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('header');
    const preloader = document.getElementById('preloader');
    const navLinks = document.querySelector('.nav-links');
    const burger = document.querySelector('.burger');
    const modal = document.getElementById('menu-modal');
    const closeModal = document.querySelector('.close-modal');
    const menuItems = document.querySelectorAll('.menu-item');
    const contactForm = document.getElementById('main-contact-form');

    // 1. Preloader: Ocultarlo cuando la página esté completamente cargada
    window.addEventListener('load', () => {
        preloader.classList.add('hidden');
    });

    // 2. Header Pegajoso (Sticky) que cambia con el scroll
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);

    // 3. Menú de Hamburguesa (Móvil)
    const toggleNav = () => {
        // Animación de links
        navLinks.classList.toggle('nav-active');
        
        // Animación del burger (X)
        burger.classList.toggle('toggle');
    };
    burger.addEventListener('click', toggleNav);

    // 4. Animaciones al Hacer Scroll (Intersection Observer API)
    // Esta es una técnica moderna y eficiente para animar elementos cuando entran en la pantalla
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null, // Observa en relación al viewport
        threshold: 0.1 // Se activa cuando el 10% del elemento es visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Dejar de observar una vez animado
            }
        });
    };

    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // 5. Lógica del Modal del Menú
    
    // Función para abrir el modal
    const openModal = (e) => {
        const item = e.currentTarget;
        const name = item.dataset.name;
        const desc = item.dataset.desc;
        const price = item.dataset.price;
        const img = item.dataset.img;

        // Poblar el modal con los datos del item
        modal.querySelector('#modal-name').textContent = name;
        modal.querySelector('#modal-desc').textContent = desc;
        modal.querySelector('#modal-price').textContent = price;
        modal.querySelector('#modal-img').src = img;
        modal.querySelector('#modal-img').alt = name;

        modal.style.display = 'flex'; // Mostrar el modal
    };

    // Función para cerrar el modal
    const hideModal = () => {
        modal.style.display = 'none';
    };

    // Asignar eventos
    menuItems.forEach(item => {
        item.addEventListener('click', openModal);
    });

    closeModal.addEventListener('click', hideModal);

    // Cerrar el modal si se hace clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // 6. Validación simple del Formulario de Contacto
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir el envío real del formulario

        const name = contactForm.querySelector('#name').value;
        const email = contactForm.querySelector('#email').value;
        const message = contactForm.querySelector('#message').value;

        if (name.trim() === '' || email.trim() === '' || message.trim() === '') {
            alert('Por favor, rellena todos los campos.');
            return;
        }

        // Simulación de envío exitoso
        alert(`¡Gracias por tu mensaje, ${name}! Te contactaremos pronto.`);
        contactForm.reset(); // Limpiar el formulario
    });

});