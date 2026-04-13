// Floating nested-geometry motifs on the hero canvas
// Matches the KOSL reticle/alignment mark brand motif
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');

    let w, h, dpr;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    const COUNT = 14;
    const particles = [];

    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * 1400,
            y: Math.random() * 800,
            size: 14 + Math.random() * 26,
            speed: 0.12 + Math.random() * 0.22,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.004,
            opacity: 0.03 + Math.random() * 0.05,
        });
    }

    function drawMark(x, y, size, rotation, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        ctx.lineWidth = 1;

        // Outer square
        ctx.strokeRect(-size, -size, size * 2, size * 2);

        // Circle
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        // Rotated square (diamond)
        ctx.save();
        ctx.rotate(Math.PI / 4);
        const ds = size * 0.52;
        ctx.strokeRect(-ds, -ds, ds * 2, ds * 2);
        ctx.restore();

        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.28, 0, Math.PI * 2);
        ctx.stroke();

        // Center dot
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.07, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            p.y -= p.speed;
            p.rotation += p.rotSpeed;

            if (p.y < -p.size * 2) {
                p.y = h + p.size * 2;
                p.x = Math.random() * w;
            }
            if (p.x > w) p.x = p.x % w;

            drawMark(p.x, p.y, p.size, p.rotation, p.opacity);
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
