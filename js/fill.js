document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.navbtn');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const pageName = btn.getAttribute('data-page');

            // 1. SYNC ACTIVE CLASS: 
            // Remove 'active' from EVERY button on the page that has the same pageName
            document.querySelectorAll(`.navbtn`).forEach(b => b.classList.remove('active'));
            
            // Add 'active' to ALL buttons that represent this page
            document.querySelectorAll(`.navbtn[data-page="${pageName}"]`).forEach(b => b.classList.add('active'));

            // 2. EXISTING FETCH LOGIC (Dynamically update the target specified in the clicked button)
            const targetId = btn.getAttribute('data-target');
            const targetDiv = document.getElementById(targetId);
            
            if (pageName && targetDiv) {
                targetDiv.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';
                fetch(`contents/${pageName}.html`)
                    .then(response => {
                        if (!response.ok) throw new Error('File not found');
                        return response.text();
                    })
                    .then(html => { targetDiv.innerHTML = html; })
                    .catch(err => {
                        targetDiv.innerHTML = '<p class="text-danger">Error.</p>';
                    });
            }
        });
    });

    // Auto-load triggers
    const deskBtn = document.querySelector('button[data-page="about"][data-target="content-display-2"]');
    const mobBtn = document.querySelector('button[data-page="about"][data-target="content-display-1"]');
    if (deskBtn) deskBtn.click();
    if (mobBtn) mobBtn.click();
});