/* KOSL shared components — nav, footer, scroll reveal, mobile menu */
(function () {
    const MARK_SVG = `<svg viewBox="0 0 36 36" width="28" height="28">
        <rect x="2" y="2" width="32" height="32" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="18" cy="18" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <rect x="9.5" y="9.5" width="17" height="17" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(45 18 18)"/>
        <circle cx="18" cy="18" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="18" cy="18" r="1.8" fill="currentColor"/>
    </svg>`;

    const FOOTER_MARK_SVG = `<svg viewBox="0 0 36 36" width="22" height="22">
        <rect x="3" y="3" width="30" height="30" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="18" cy="18" r="10" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <rect x="10.3" y="10.3" width="15.4" height="15.4" rx="1" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(45 18 18)"/>
        <circle cx="18" cy="18" r="2" fill="currentColor"/>
    </svg>`;

    const page = location.pathname.split('/').pop().replace('.html', '') || 'index';

    function isActive(href) {
        const target = href.replace('.html', '').replace('./', '');
        if (target === 'index' || target === '' || target === './') return page === 'index' || page === '';
        return page === target;
    }

    // ── NAV ──
    const nav = document.createElement('nav');
    nav.innerHTML = `
        <div class="nav-inner">
            <a href="index.html" class="nav-logo">
                <span style="color: var(--navy)">${MARK_SVG}</span>
                <span class="nav-logo-text">KOSL</span>
            </a>
            <ul class="nav-links" id="nav-links">
                <li><a href="index.html" ${isActive('index') ? 'class="active"' : ''}>Home</a></li>
                <li><a href="about.html" ${isActive('about') ? 'class="active"' : ''}>About</a></li>
                <li><a href="projects.html" ${isActive('projects') ? 'class="active"' : ''}>Projects</a></li>
                <li><a href="shop.html" ${isActive('shop') ? 'class="active"' : ''}>Shop</a></li>
                <li><a href="contact.html" ${isActive('contact') ? 'class="active"' : ''}>Contact</a></li>
            </ul>
            <a href="shop.html" class="nav-cta">Shop →</a>
            <button class="nav-toggle" id="nav-toggle" aria-label="Menu">
                <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
        </div>`;
    document.body.prepend(nav);

    // Mobile toggle
    const toggle = document.getElementById('nav-toggle');
    const links = document.getElementById('nav-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
        });
    }

    // ── FOOTER ──
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <div class="footer-inner">
            <div class="footer-top">
                <div class="footer-brand">
                    <div class="footer-brand-row">
                        <span style="color: rgba(255,255,255,0.3)">${FOOTER_MARK_SVG}</span>
                        <span class="footer-brand-name">KOSL</span>
                    </div>
                    <p>Open source tools and processes for accessible semiconductor fabrication.</p>
                </div>
                <div class="footer-col">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="about.html">About</a></li>
                        <li><a href="projects.html">Projects</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Products</h4>
                    <ul>
                        <li><a href="shop.html">Shop</a></li>
                        <li><a href="shop.html#riboresist">RiboResist</a></li>
                        <li><a href="shop.html#machines">Machines</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Connect</h4>
                    <ul>
                        <li><a href="contact.html">Contact</a></li>
                        <li><a href="https://github.com/levkropp" target="_blank" rel="noopener">GitHub</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <span class="footer-copy">&copy; 2026 KOSL &mdash; Kropp Olsha Science Lab. All rights reserved.</span>
                <div class="footer-meta">
                    <span class="footer-location">Toronto, Canada</span>
                    <span class="footer-version">v0.2.0</span>
                </div>
            </div>
        </div>`;
    document.body.append(footer);

    // ── SCROLL REVEAL ──
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        reveals.forEach(el => obs.observe(el));
    }
})();
