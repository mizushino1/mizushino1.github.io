const SIZE = 115;
const STROKE = 8;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = (SIZE / 2) - (STROKE / 2) - 10;
const CIRCUM = 2 * Math.PI * R;

function renderBadges() {
    const isDark = document.body.getAttribute('data-bs-theme') === 'dark';
    const fillColor = isDark ? '#2c2c2a' : '#f1efe8';
    const textColor = isDark ? '#ffffff' : '#2c2c2a';

    document.querySelectorAll('.skill-circle').forEach(el => {
        const pct   = Math.min(100, Math.max(0, parseInt(el.dataset.progress) || 0));
        const color = el.dataset.color || '#7F77DD';
        const name  = el.querySelector('.skill-name').textContent.trim();

        el.querySelector('.skill-name').style.display = 'none';

        const dash = (pct / 100) * CIRCUM;
        const gap  = CIRCUM - dash;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', SIZE);
        svg.setAttribute('height', SIZE);
        svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', `${name} — ${pct}%`);

        svg.innerHTML = `
            <circle cx="${CX}" cy="${CY}" r="${R + STROKE / 2 + 4}"
                fill="${fillColor}" stroke="${fillColor}" stroke-width="1.5"/>
            <circle cx="${CX}" cy="${CY}" r="${R}"
                fill="none" stroke="${color}" stroke-width="${STROKE + 6}" opacity="0.25"/>
            <circle cx="${CX}" cy="${CY}" r="${R}"
                fill="none" stroke="${color}" stroke-width="${STROKE}"
                stroke-dasharray="${dash} ${gap}"
                stroke-dashoffset="${CIRCUM / 4}"
                stroke-linecap="round"/>
            <text x="${CX}" y="${CY}" text-anchor="middle"
                font-size="11" font-weight="500" font-family="inherit"
                fill="${textColor}" class="fw-bold">${name}</text>
        `;

        el.insertBefore(svg, el.firstChild);
    });
}

renderBadges();

const observer = new MutationObserver(() => {
    document.querySelectorAll('.skill-circle svg').forEach(svg => svg.remove());
    document.querySelectorAll('.skill-circle').forEach(el => {
        el.querySelector('.skill-name').style.display = '';
    });
    renderBadges();
});

observer.observe(document.body, { attributes: true, attributeFilter: ['data-bs-theme'] });