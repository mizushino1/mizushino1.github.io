const rankTierMapping = {
    1: "Herald", 2: "Guardian", 3: "Crusader", 4: "Archon",
    5: "Legend",  6: "Ancient",  7: "Divine",   8: "Immortal"
};

const rankIconMapping = {
    0: "./assets/image/uncalibrated.webp",
    1: "./assets/image/herald.webp",
    2: "./assets/image/guardian.webp",
    3: "./assets/image/crusader.webp",
    4: "./assets/image/archon.webp",
    5: "./assets/image/legend.webp",
    6: "./assets/image/ancient.webp",
    7: "./assets/image/divine.webp",
    8: "./assets/image/immortal.webp"
};


const path = window.location.pathname;
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

        const onOverview = window.location.pathname.endsWith("overview.html");
        if (onOverview && typeof loadPlayerData === "function") {
            loadPlayerData(); // call findPlayer.js's version directly
        } else {
            window.location.href = "overview.html";
        }

    } catch (error) {
        localStorage.removeItem("savedFriendCode");
        showApiErrorModal("Could not connect to the server. Please check your internet connection and try again.");
        console.error("API error:", error);
    }
};

function createCustomModal(id, title, message, extraButtons = '') {
    const existing = document.getElementById(id);
    if (existing) existing.remove();


    const backdrop = document.createElement("div");
    backdrop.id = `${id}Backdrop`;
    backdrop.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0, 0, 0, 0.65);
        z-index: 9998;
        transition: opacity 0.15s ease;
    `;


    const modal = document.createElement("div");
    modal.id = id;
    modal.style.cssText = `
        position: fixed; inset: 0;
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
        pointer-events: none;
    `;
    modal.innerHTML = `
        <div class="glass-card" style="
            pointer-events: all;
            border-radius: 12px;
            padding: 2rem;
            max-width: 360px;
            width: 90%;
            text-align: center;
            
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
        ">
            <h2 style="margin: 0 0 0.75rem; font-size: 18px; font-family: 'Cinzel', serif; letter-spacing: 2px;">
                ${title}
            </h2>
            <p style="margin: 0 0 1.5rem; color: rgba(200,200,200,0.8); font-size: 14px;">
                ${message}
            </p>
            ${extraButtons}
            <button id="${id}CloseBtn" style="
                padding: 8px 24px;
                border-radius: 8px;
                border: 1px solid rgba(255,68,68,0.6);
                background: transparent;
                color: #ff4444;
                cursor: pointer;
                font-size: 14px;
                font-family: 'radiance', sans-serif;
                letter-spacing: 1px;
                transition: background 0.2s ease, color 0.2s ease;
            "
            onmouseover="this.style.background='#ff4444'; this.style.color='#fff';"
            onmouseout="this.style.background='transparent'; this.style.color='#ff4444';">
                GOT IT
            </button>
        </div>
    `;

    function closeModal() {
        backdrop.remove();
        modal.remove();
    }

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    document.getElementById(`${id}CloseBtn`).addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);
}

function showFriendCodeInputModal(message = "Invalid input.") {
    createCustomModal(
        "friendCodeInputModal",
        "Invalid Friend Code",
        message
    );
}

function showApiErrorModal(message = "Something went wrong.") {
    createCustomModal(
        "apiErrorModal",
        "Player Not Found",
        message
    );
}

function showHeroNotFoundModal(message = "Please check the spelling and try again.") {
    createCustomModal(
        "heroNotFoundModal",
        "Hero Not Found",
        message
    );
}

function showNoFriendCodeModal() {
    createCustomModal(
        "noFriendCodeModal",
        "No Friend Code Found",
        "Enter a friend code or click a profile on the homepage to continue."
    );
}

const videoA = document.getElementById('videoA');
const videoB = document.getElementById('videoB');
const FADE = 1.5; // match your CSS transition duration

let current = videoA;
let next = videoB;

function onTimeUpdate() {
  const timeLeft = current.duration - current.currentTime;

  if (timeLeft <= FADE && !next.dataset.started) {
    next.dataset.started = 'true';
    next.currentTime = 0;
    next.play();

    next.classList.add('active');
    current.classList.remove('active');

    setTimeout(() => {
      current.pause();
      current.currentTime = 0;
      delete current.dataset.started;

      // Swap references
      [current, next] = [next, current];

      // Re-attach the listener to the new current
      current.addEventListener('timeupdate', onTimeUpdate);
      next.removeEventListener('timeupdate', onTimeUpdate);

    }, FADE * 1000);
  }
}
if (path.endsWith("index.html") || path === "/" || path.endsWith("/")) {
    videoA.addEventListener('timeupdate', onTimeUpdate);
}
