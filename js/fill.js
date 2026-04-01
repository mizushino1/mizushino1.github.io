document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.navbtn');
    // Identify all possible content display areas on the page
    const displayContainers = document.querySelectorAll('#content-display-1, #content-display-2');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const pageName = btn.getAttribute('data-page');

            // 1. SYNC ACTIVE BUTTON STATES
            // Remove 'active' from all buttons first
            navButtons.forEach(b => b.classList.remove('active'));
            // Add 'active' to all buttons matching the selected page (syncs mobile & desktop nav)
            document.querySelectorAll(`.navbtn[data-page="${pageName}"]`).forEach(b => b.classList.add('active'));

            // 2. SYNC CONTENT ACROSS ALL DISPLAYS
            if (pageName) {
                // Show loading spinner in all containers
                displayContainers.forEach(container => {
                    container.innerHTML = '<div class="text-center w-100"><div class="spinner-border spinner-border-sm"></div></div>';
                });

                // Fetch the content once
                fetch(`contents/${pageName}.html`)
                    .then(response => {
                        if (!response.ok) throw new Error('File not found');
                        return response.text();
                    })
                    .then(html => {
                        // Inject the same HTML into every display container
                        displayContainers.forEach(container => {
                            container.innerHTML = html;
                        });
                    })
                    .catch(err => {
                        displayContainers.forEach(container => {
                            container.innerHTML = '<p class="text-danger text-center">Error loading content.</p>';
                        });
                        console.error(err);
                    });
            }
        });
    });

    // Auto-load the initial "About" page on startup
    // This finds the first available "About" button and triggers the logic above
    const initialBtn = document.querySelector('.navbtn[data-page="about"]');
    if (initialBtn) initialBtn.click();
});
