// ===== Theme Toggle =====
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'none' : 'block';
        moonIcon.style.display = isDark ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', updateThemeIcon);

// ===== Mobile Menu =====
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

// Close mobile menu on link click
document.addEventListener('click', function(e) {
    if (e.target.closest('#mobile-menu a')) {
        const menu = document.getElementById('mobile-menu');
        if (menu) menu.classList.remove('open');
    }
});

// ===== Scroll Animations =====
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.observe(el);
    });
});

// ===== Navbar Scroll Effect =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
        navbar.classList.add('shadow-lg', 'backdrop-blur-xl');
        navbar.classList.remove('backdrop-blur-none');
    } else {
        navbar.classList.remove('shadow-lg', 'backdrop-blur-xl');
        navbar.classList.add('backdrop-blur-none');
    }
    lastScroll = currentScroll;
});
