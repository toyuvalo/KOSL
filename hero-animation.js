// KOSL Hero — Floating reticle motifs with parallax depth layers
// Matches nested-geometry brand motif with varied opacity/size for depth
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, dpr, mouseX = 0.5, mouseY = 0.5;

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

    // Subtle mouse parallax
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
    });

    // Three depth layers
    const layers = [
        { count: 6, sizeRange: [30, 50], speedRange: [0.06, 0.12], opRange: [0.015, 0.03], parallax: 6 },
        { count: 8, sizeRange: [16, 28], speedRange: [0.12, 0.22], opRange: [0.03, 0.055], parallax: 12 },
        { count: 5, sizeRange: [8, 14], speedRange: [0.2, 0.35], opRange: [0.04, 0.07], parallax: 20 },
    ];

    const particles = [];

    layers.forEach(layer => {
        for (let i = 0; i < layer.count; i++) {
            const size = layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]);
            particles.push({
                x: Math.random() * 1600,
                y: Math.random() * 900,
                size,
                speed: layer.speedRange[0] + Math.random() * (layer.speedRange[1] - layer.speedRange[0]),
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.003,
                opacity: layer.opRange[0] + Math.random() * (layer.opRange[1] - layer.opRange[0]),
                parallax: layer.parallax,
            });
        }
    });

    function drawMark(x, y, size, rotation, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        ctx.lineWidth = size > 20 ? 1 : 0.75;

        // Outer square
        ctx.strokeRect(-size, -size, size * 2, size * 2);

        // Circle
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        // Rotated diamond
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
        ctx.fillStyle = `rgba(255,255,255,${opacity * 1.5})`;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(size * 0.06, 1), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);

        const mx = (mouseX - 0.5);
        const my = (mouseY - 0.5);

        for (const p of particles) {
            p.y -= p.speed;
            p.rotation += p.rotSpeed;

            if (p.y < -p.size * 2.5) {
                p.y = h + p.size * 2.5;
                p.x = Math.random() * w;
            }

            const px = p.x + mx * p.parallax;
            const py = p.y + my * p.parallax;

            drawMark(px, py, p.size, p.rotation, p.opacity);
        }

        requestAnimationFrame(animate);
    }

    animate();
})();
