const body = document.getElementById("body");
const themeBtn = document.getElementById("themeBtn");
const aboutTab = document.getElementById("aboutTab");
const actTab = document.getElementById("activitiesTab");

const aboutCard = document.getElementById('aboutCard');

aboutTab.onclick = () => {
    aboutTab.classList.add('active')
    actTab.classList.remove('active')
    aboutTab.setAttribute('data-bs-toggle',' ')
    actTab.setAttribute('data-bs-toggle','collapse')
    aboutTab.setAttribute('href','#')
    actTab.setAttribute('href','.activities')
    aboutCard.style.display = '';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        aboutCard.classList.remove('hidden');
    }));
};

actTab.onclick = () => {
    actTab.classList.add('active')
    aboutTab.classList.remove('active')
    actTab.setAttribute('data-bs-toggle',' ')
    aboutTab.setAttribute('data-bs-toggle','collapse')
    actTab.setAttribute('href','#')
    aboutTab.setAttribute('href','.activities')
    aboutCard.classList.add('hidden');
    setTimeout(() => {
        if (aboutCard.classList.contains('hidden')) {
            aboutCard.style.display = 'none';
        }
    }, 500);
};

themeBtn.onclick = () => {
    let bodyTheme = body.getAttribute("data-bs-theme");
    let currentbodytheme = bodyTheme == "light" ? body.setAttribute("data-bs-theme", "dark") : body.setAttribute("data-bs-theme", "light");
    themeBtn.innerText = body.getAttribute("data-bs-theme") == "light" ? themeBtn.innerText = "Dark Mode" : themeBtn.innerText = "Light Mode";
};