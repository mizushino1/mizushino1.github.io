const body = document.getElementById("body")
const themeBtn = document.getElementById("themeBtn");

themeBtn.onclick = () => {
    let bodyTheme = body.getAttribute("data-bs-theme");
    let currentbodytheme = bodyTheme == "light" ? body.setAttribute("data-bs-theme", "dark") : body.setAttribute("data-bs-theme", "light");
    themeBtn.innerText = body.getAttribute("data-bs-theme") == "light" ? themeBtn.innerText = "Dark Mode" : themeBtn.innerText = "Light Mode";

};



