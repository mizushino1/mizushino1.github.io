document.addEventListener("DOMContentLoaded", () => {

    // Restrict all searchPlayerCode inputs to numbers only
    document.querySelectorAll('.searchPlayerCode, #searchPlayerCode').forEach(input => {
        input.addEventListener('input', () => {
            input.value = input.value.replace(/\D/g, '');
        });
        input.addEventListener('keypress', (e) => {
            if (!/\d/.test(e.key)) e.preventDefault();
        });
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text');
            input.value = pasted.replace(/\D/g, '');
        });
    });

    const overviewLink = document.querySelector('a.nav-link[href="overview.html"]');
    if (overviewLink) {
        overviewLink.addEventListener("click", function(e) {
            if (!localStorage.getItem("savedFriendCode")) {
                e.preventDefault();
                showNoFriendCodeModal();
            }
        });
    }

    const heroListBtn = document.getElementById("heroList");
    if (heroListBtn) {
        heroListBtn.addEventListener("click", function() {
            window.location.href = "hero_list.html";
        });
    }

    const developerContainer = document.getElementById("developerContainer");
    if (developerContainer) {
        developerContainer.addEventListener("click", () => {
            const accountId = 373418954;
            localStorage.setItem("savedFriendCode", accountId);
            window.location.href = "overview.html";
        });
    }
});

window.getPlayerData = async function(event) {
    if (event) event.preventDefault();

    const inputs = document.querySelectorAll('.searchPlayerCode, #searchPlayerCode');
    let friendCode = "";

    inputs.forEach(input => {
        if (input.value.trim() !== "") friendCode = input.value.trim();
    });

    if (!friendCode) {
        showFriendCodeInputModal("Please enter a friend code.");
        return;
    }

    if (!/^\d+$/.test(friendCode)) {
        showFriendCodeInputModal("Friend codes can only contain numbers. Please check your input.");
        return;
    }

    try {
        const response = await fetch(`https://api.opendota.com/api/players/${friendCode}`);

        if (!response.ok) {
            localStorage.removeItem("savedFriendCode");
            showApiErrorModal(`Request failed with status ${response.status}. Please try again.`);
            return;
        }

        const data = await response.json();

        if (!data || !data.profile) {
            localStorage.removeItem("savedFriendCode");
            showApiErrorModal("No player found with that friend code. Please double-check and try again.");
            return;
        }

        localStorage.setItem("savedFriendCode", friendCode);
        window.location.href = "overview.html";

    } catch (error) {
        localStorage.removeItem("savedFriendCode");
        showApiErrorModal("Could not connect to the server. Please check your internet connection and try again.");
        console.error("API error:", error);
    }
};

function showFriendCodeInputModal(message = "Invalid input.") {
    const existing = document.getElementById("friendCodeInputModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "friendCodeInputModal";
    modal.style.cssText = `
        position: fixed; inset: 0;
        display: flex; align-items: center; justify-content: center; z-index: 9999;
        color: white;
    `;
    modal.innerHTML = `
        <div class="glass-card" style="border-radius: 12px; padding: 2rem; max-width: 360px; width: 90%; text-align: center;">
            <h2 style="margin: 0 0 0.75rem; font-size: 18px;">Invalid Friend Code</h2>
            <p style="margin: 0 0 1.5rem; color: gray; font-size: 14px;">${message}</p>
            <button id="closeFriendCodeInputModal" style="padding: 8px 24px; border-radius: 8px; border: 1px solid #ccc; cursor: pointer; font-size: 14px;">
                Got it
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById("closeFriendCodeInputModal").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}

function showApiErrorModal(message = "Something went wrong.") {
    const existing = document.getElementById("apiErrorModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "apiErrorModal";
    modal.style.cssText = `
        position: fixed; inset: 0;
        display: flex; align-items: center; justify-content: center; z-index: 9999;
        color: white;
    `;
    modal.innerHTML = `
        <div class="glass-card" style="border-radius: 12px; padding: 2rem; max-width: 360px; width: 90%; text-align: center;">
            <h2 style="margin: 0 0 0.75rem; font-size: 18px;">Player Not Found</h2>
            <p style="margin: 0 0 1.5rem; color: gray; font-size: 14px;">${message}</p>
            <button id="closeApiErrorModal" style="padding: 8px 24px; border-radius: 8px; border: 1px solid #ccc; cursor: pointer; font-size: 14px;">
                Got it
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById("closeApiErrorModal").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}

function showHeroNotFoundModal(message = "Please check the spelling and try again.") {
    const existing = document.getElementById("heroNotFoundModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "heroNotFoundModal";
    modal.style.cssText = `
        position: fixed; inset: 0;
        display: flex; align-items: center; justify-content: center; z-index: 9999;
        color: white;
    `;
    modal.innerHTML = `
        <div class="glass-card" style="border-radius: 12px; padding: 2rem; max-width: 360px; width: 90%; text-align: center;">
            <h2 style="margin: 0 0 0.75rem; font-size: 18px;">Hero Not Found</h2>
            <p style="margin: 0 0 1.5rem; color: gray; font-size: 14px;">${message}</p>
            <button id="closeHeroNotFoundModal" style="padding: 8px 24px; border-radius: 8px; border: 1px solid #ccc; cursor: pointer; font-size: 14px;">
                Got it
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById("closeHeroNotFoundModal").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}

function showNoFriendCodeModal() {
    const existing = document.getElementById("noFriendCodeModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "noFriendCodeModal";
    modal.style.cssText = `
        position: fixed; inset: 0;
        display: flex; align-items: center; justify-content: center; z-index: 9999;
        color: white;
    `;
    modal.innerHTML = `
        <div class="glass-card" style="border-radius: 12px; padding: 2rem; max-width: 360px; width: 90%; text-align: center;">
            <h2 style="margin: 0 0 0.75rem; font-size: 18px;">No Friend Code Found</h2>
            <p style="margin: 0 0 1.5rem; color: gray; font-size: 14px;">
                Enter a friend code or click a profile on the homepage to continue.
            </p>
            <button id="closeNoFriendCodeModal" style="padding: 8px 24px; border-radius: 8px; border: 1px solid #ccc; cursor: pointer; font-size: 14px;">
                Got it
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById("closeNoFriendCodeModal").addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
}