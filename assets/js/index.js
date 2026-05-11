const body = document.getElementById("body");
const themeBtn = document.getElementById("themeBtn");
const aboutTab = document.getElementById("aboutTab");
const actTab = document.getElementById("activitiesTab");
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const aboutCard = document.getElementById('aboutCard');
const images = document.querySelectorAll(".expandable-img");
const modalImg = document.getElementById("modalImg");
const OFFSET = 100;

const applyTheme = (isDark) => {
    body.setAttribute("data-bs-theme", isDark ? "dark" : "light");
    themeBtn.innerText = isDark ? "Light Mode" : "Dark Mode";
};

applyTheme(prefersDark.matches);
prefersDark.addEventListener('change', (e) => applyTheme(e.matches));


aboutTab.onclick = () => {
    aboutTab.classList.add('active')
    actTab.classList.remove('active')
    aboutTab.setAttribute('data-bs-toggle', ' ')
    actTab.setAttribute('data-bs-toggle', 'collapse')
    aboutTab.setAttribute('href', '#abtSection')
    actTab.setAttribute('href', '.activities')
    aboutCard.style.display = '';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        aboutCard.classList.remove('hidden');
    }));
    setTimeout(() => {
        const section = document.getElementById('abtSection');
        const top = section.getBoundingClientRect().top + window.scrollY - OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
    }, 1);
};


actTab.onclick = () => {
    actTab.classList.add('active')
    aboutTab.classList.remove('active')
    actTab.setAttribute('data-bs-toggle', ' ')
    aboutTab.setAttribute('data-bs-toggle', 'collapse')
    actTab.setAttribute('href', '#actSection')
    aboutTab.setAttribute('href', '.activities')
    aboutCard.classList.add('hidden');
    setTimeout(() => {
        if (aboutCard.classList.contains('hidden')) {
            aboutCard.style.display = 'none';
        }
    }, 500);
    setTimeout(() => {
        const section = document.getElementById('actSection');
        const top = section.getBoundingClientRect().top + window.scrollY - OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
    }, 600);
};

themeBtn.onclick = () => {
    const isDark = body.getAttribute("data-bs-theme") === "dark";
    applyTheme(!isDark);
};

images.forEach(img => {
    img.onclick = (event) => {
        const clickedSrc = event.target.src;
        modalImg.setAttribute("src", clickedSrc);
    };
});