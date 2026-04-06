// Floating nested-geometry motifs on the hero canvas
// Matches the KOSL reticle/alignment mark brand motif
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h;
    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        w = canvas.width = rect.width * devicePixelRatio;
        h = canvas.height = rect.height * devicePixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const COUNT = 12;

    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * (w / devicePixelRatio),
            y: Math.random() * (h / devicePixelRatio),
            size: 16 + Math.random() * 24,
            speed: 0.15 + Math.random() * 0.25,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.003,
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
        ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function animate() {
        const cw = w / devicePixelRatio;
        const ch = h / devicePixelRatio;
        ctx.clearRect(0, 0, cw, ch);

        for (const p of particles) {
            p.y -= p.speed;
            p.rotation += p.rotSpeed;

            if (p.y < -p.size * 2) {
                p.y = ch + p.size * 2;
                p.x = Math.random() * cw;
            }

            drawMark(p.x, p.y, p.size, p.rotation, p.opacity);
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
