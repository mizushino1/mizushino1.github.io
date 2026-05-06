   const STORAGE_KEY = "dotaTheme";
   const DEFAULT_THEME = "dark";
   

   
   (function () {
       const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
       applyTheme(saved);
   })();
   

   
   function applyTheme(theme) {
       const body = document.body;
   
       body.classList.remove("theme-dark", "theme-light");
       body.classList.add(`theme-${theme}`);
   

       document.documentElement.setAttribute("data-bs-theme", theme);
   

       document.querySelectorAll(".navbar").forEach(nav => {
           nav.setAttribute("data-bs-theme", "dark");
       });
   }
   

   
   function toggleTheme() {
       const current = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
       const next = current === "dark" ? "light" : "dark";
       localStorage.setItem(STORAGE_KEY, next);
       applyTheme(next);
       syncToggleIcon(next);
   }

   
   function syncToggleIcon(theme) {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}
   

   document.addEventListener("DOMContentLoaded", () => {
       const current = localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;

       applyTheme(current);
       syncToggleIcon(current);
   
       const btn = document.getElementById("themeToggle");
       if (btn) {
           btn.addEventListener("click", toggleTheme);
       }
   });