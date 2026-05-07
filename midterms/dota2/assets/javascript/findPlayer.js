const rankTierMapping = {
    1: { name: "Herald" },
    2: { name: "Guardian" },
    3: { name: "Crusader" },
    4: { name: "Archon" },
    5: { name: "Legend" },
    6: { name: "Ancient" },
    7: { name: "Divine" },
    8: { name: "Immortal" }
};

const rankIconMapping = {
    1: { rankImg: "./assets/image/herald.webp" },
    2: { rankImg: "./assets/image/guardian.webp" },
    3: { rankImg: "./assets/image/crusader.webp" },
    4: { rankImg: "./assets/image/archon.webp" },
    5: { rankImg: "./assets/image/legend.webp" },
    6: { rankImg: "./assets/image/ancient.webp" },
    7: { rankImg: "./assets/image/divine.webp" },
    8: { rankImg: "./assets/image/immortal.webp" },
    0: { rankImg: "./assets/image/uncalibrated.webp" }
};

const attributeColors = {
    str: { attributeColor: "rgba(185, 80, 11, 0.4)" },     // Red with 0.4 opacity
    agi: { attributeColor: "rgba(22, 124, 19, 0.4)" },    // Green with 0.4 opacity
    int: { attributeColor: "rgba(37, 125, 174, 0.4)" },   // Blue with 0.4 opacity
    // For Universal, we use a transparent gradient
    all: { attributeColor: "linear-gradient(to right, rgba(185, 80, 11, 0.4), rgba(22, 124, 19, 0.4), rgba(37, 125, 174, 0.4))" }
};

async function fetchHeroesData(heroesUrl) {
    const cached = localStorage.getItem("heroesData");
    if (cached) return JSON.parse(cached);

    const res = await fetch(heroesUrl);
    const data = await res.json();
    localStorage.setItem("heroesData", JSON.stringify(data));
    return data;
}


window.loadPlayerData = async (event) => {

    if (event) event.preventDefault();

    const friendCodeInput = document.querySelector(".searchPlayerCode, #searchPlayerCode");
    const typedCode = friendCodeInput?.value.trim();
    const friendCode = typedCode || localStorage.getItem("savedFriendCode");


    if (!friendCode) return;



    const heroContainer = document.getElementById("heroContainer");
    const profileContainer = document.getElementById("playerProfileContainer");

    if (!heroContainer || !profileContainer) return;

    heroContainer.innerHTML = `
        <div class="text-center text-light py-5">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Loading player data...</p>
        </div>`;

    const originalProfileHTML = profileContainer.innerHTML;

    profileContainer.innerHTML = `
        <div class="text-center text-light py-5">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Loading player data...</p>
        </div>`;

    const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    const baseUrl = isLocal
        ? `https://corsproxy.io/?https://api.opendota.com/api`
        : `https://api.opendota.com/api`;
    const profileUrl = `${baseUrl}/players/${friendCode}`;
    const playerHeroesUrl = `${profileUrl}/heroes`;
    const heroesUrl = `${baseUrl}/heroes`;
    const baseHeroImgUrl = `https://cdn.cloudflare.steamstatic.com`;
    const playerWinLoseUrl = `${profileUrl}/wl`;
    const playerRecentMatchesUrl = `${profileUrl}/recentMatches`
    const playerPeersUrl = `${profileUrl}/peers`

    const [profileRes, playerWinLoseRes, heroesData, playerPeersRes,playerRecentMatchesRes] = await Promise.all([
        fetch(profileUrl),
        fetch(playerWinLoseUrl),
        fetchHeroesData(heroesUrl),
        fetch(playerPeersUrl),
        fetch(playerRecentMatchesUrl)
    ]);

    const heroesRes = await fetch(playerHeroesUrl);
    const playerHeroData = await heroesRes.json();

    const [playerData, playerWinLoseData, playerPeersData, playerRecentMatchesData] = await Promise.all([
        profileRes.json(),
        playerWinLoseRes.json(),
        playerPeersRes.json(),
        playerRecentMatchesRes.json()
    ]);

    if (!playerData || !playerData.profile) {
        localStorage.removeItem("savedFriendCode");
        // optionally call showApiErrorModal if it's available on this page
        return;
    }

    // ✅ Only save AFTER confirmed valid
    if (typedCode) {
        localStorage.setItem("savedFriendCode", typedCode);
    }

    if (!Array.isArray(playerHeroData) || playerHeroData.length === 0) {
        document.getElementById("heroContainer").innerHTML =
            `<div class="text-center text-light py-5">
                <p class="text-warning">Hero data unavailable for this player. The OpenDota API may have timed out.</p>
            </div>`;
        profileContainer.innerHTML = originalProfileHTML;
        document.getElementById("playerName").textContent = playerData.profile.personaname;
        document.getElementById("playerAvatar").src = playerData.profile.avatarfull;
        document.getElementById("playerFriendCode").innerHTML = "<b>Friend Code</b>: " + friendCode;
        return;
    }


    const playerName = playerData.profile.personaname;
    const playerAvatar = playerData.profile.avatarfull;
    const tierValue = playerData.rank_tier;
    const medalIndex = Math.floor(tierValue / 10);
    const playerRank = rankTierMapping[medalIndex] ? rankTierMapping[medalIndex].name : "Uncalibrated";
    const playerRankIcon = rankIconMapping[medalIndex] ? rankIconMapping[medalIndex].rankImg : "./assets/image/uncalibrated.webp";
    const playerTotalWins = playerWinLoseData.win;
    const playerTotalLose = playerWinLoseData.lose;
    const path = window.location.pathname;

    function getPlayerHeroData(a) {
        this.heroData = playerHeroData[a];
    }


    function renderHeroList(dataArray, limit = 3) {
        const allZero = dataArray.every(h => h.games === 0);

        if (!dataArray || dataArray.length === 0 || allZero) {
            document.getElementById("heroContainer").innerHTML = `
            <div class="text-center text-secondary py-4 w-100">
                <p class="gentium fs-fluid-md mb-0">⚠ Match data is private</p>
            </div>`;
            return;
        }

        document.getElementById("heroContainer").innerHTML = "";
        dataArray.slice(0, limit).forEach((hero, i) => {
            fillPlayerHeroStats(hero.hero_id, i + 1);
        });
    }

    function getHeroImg(heroName) {
        const shortName = heroName.replace("npc_dota_hero_", "");
        return `${baseHeroImgUrl}/apps/dota2/images/dota_react/heroes/${shortName}.png?`;
    }

    function getHeroData(a) {
        return heroesData.find(h => h.id === a);
    };



    function winrate(totalGames, wins) {

        if (!totalGames || totalGames === 0) return "0%";

        const percent = (wins / totalGames) * 100;


        return percent.toFixed(2);
    }


    const elPeersContainer = document.getElementById("peersContainer");
    if (elPeersContainer) {
        if (!playerPeersData || playerPeersData.length === 0) {
            elPeersContainer.innerHTML = `
            <div class="text-center py-3 px-2">
                <p class="text-secondary gentium small mb-0">⚠ Match data is private</p>
            </div>`;
        } else {
            for (let index = 0; index < 3; index++) {
                const player = playerPeersData[index];
                if (!player) break;

                const peerAvatar = player.avatarfull;
                const peerName = player.personaname;
                const peerAccountId = player.account_id;
                const peerGames = player.with_games;
                const peerWins = player.with_win;
                const peerWinRate = peerGames > 0 ? ((peerWins / peerGames) * 100).toFixed(1) : "0.0";

                const playerCard = `
            <div class="card mb-2 player-card scale w-75 mx-auto m-2" data-account-id="${peerAccountId}" style="cursor: pointer;">
                <div class="row g-0 align-items-center">
                    <div class="col-3">
                        <img src="${peerAvatar}" class="img-fluid rounded-start player-avatar" alt="${peerName}">
                    </div>
                    <div class="col-9">
                        <div class="card-body py-1 px-2">
                            <p class="card-title fw-bold mb-0 text-truncate small">${peerName}</p>
                            <p class="mb-0 text-secondary" style="font-size: 0.7rem;">Games Together: ${peerGames}</p>
                            <p class="mb-0 text-secondary" style="font-size: 0.7rem;">Win Rate: ${peerWinRate}%</p>
                        </div>
                    </div>
                </div>
            </div>`;

                elPeersContainer.innerHTML += playerCard;
            }

            // ← INSIDE the else block, after the loop
            elPeersContainer.querySelectorAll(".player-card").forEach(card => {
                card.addEventListener("click", () => {
                    const accountId = card.dataset.accountId;
                    localStorage.setItem("savedFriendCode", accountId);
                    window.location.href = "overview.html";
                });
            });
        }
    }





    function fillPlayerHeroStats(heroID, index, containerId = "heroContainer") {
        const playerHeroData = new getPlayerHeroData(parseInt(index - 1)).heroData;
        const playerHeroID = playerHeroData.hero_id;
        const heroInfo = getHeroData(heroID);
        const heroImg = getHeroImg(heroInfo.name);
        const attrColor = attributeColors[heroInfo.primary_attr].attributeColor;
        const matches = playerHeroData.games;
        const withMatches = playerHeroData.with_games;
        const againstMatches = playerHeroData.against_games;
        let mainWinRate, withWinRate, againstWinRate;
    
        if (matches === 0) { mainWinRate = 0; }
        else { mainWinRate = winrate(matches, playerHeroData.win); }
    
        if (withMatches === 0) { withWinRate = 0; }
        else { withWinRate = winrate(withMatches, playerHeroData.with_win); }
    
        if (againstMatches === 0) { againstWinRate = 0; }
        else { againstWinRate = winrate(againstMatches, playerHeroData.against_win); }
    
        let elPlayerHeroStats = document.getElementById(`playerHeroStats${index}`);
    
        if (!elPlayerHeroStats) {
            const parent = document.getElementById(containerId);
            elPlayerHeroStats = document.createElement('div');
            elPlayerHeroStats.id = `playerHeroStats${index}`;
            elPlayerHeroStats.className = "col-4 my-2";
            parent.appendChild(elPlayerHeroStats);
        }
    
        const modalId = `heroStatsModal${index}`;
        const heroName = getHeroData(playerHeroID).localized_name.toUpperCase();
    
   
        elPlayerHeroStats.innerHTML = `
            <div class="card mx-auto overflow-hidden h-100 scale hero-card"
                 style="cursor: pointer; border-radius: 0px"
                 data-bs-toggle="modal"
                 data-bs-target="#${modalId}" >
                <img src="${heroImg}"
                     class="img-fluid"
                     alt="${heroName}" >
               <p class="card-text fw-bold hero-name-font fs-fluid-xs m-0 hero-label text-center text-lg-start" 
   style="position: absolute; bottom: 0; left: 0; right: 0; padding: 4px 8px; color:white !important">
    ${heroName}
</p>
            </div>
        `;
    

        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();
    
        const modalEl = document.createElement('div');
        modalEl.className = 'modal fade';
        modalEl.id = modalId;
        modalEl.setAttribute('tabindex', '-1');
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0"
                     style="background: rgba(15, 15, 20, 0.92);
                            backdrop-filter: blur(20px);
                            border-radius: 15px;
                            overflow: hidden;">
    
                    <div class="modal-header glass-card-red border-0">
                        <span class="hero-name-font text-light fs-6 p-1 px-3 rounded-3"
                              style="background: ${attrColor};">
                            <b>${heroName}</b>
                        </span>
                        <button type="button"
                                class="btn-close btn-close-white ms-auto"
                                data-bs-dismiss="modal"
                                aria-label="Close"></button>
                    </div>
    
                    <div class="modal-body p-0" style="max-height: 70vh; overflow-y: auto;">
    
                        <img src="${heroImg}"
                             class="img-fluid w-100 border-bottom border-danger border-3"
                             style="max-height: 220px; object-fit: cover; object-position: center top;"
                             alt="${heroName}">
    
                        <div class="p-3">
    
                            <div class="text-light stat-text mb-2">
                                <b>Matches Played As:</b> ${matches}
                            </div>
                            <div class="text-light stat-text d-flex align-items-center gap-2 mb-3">
                                <span><b>Win Rate:</b></span>
                                <div class="progress flex-grow-1 rounded-0 bg-danger border border-secondary"
                                     style="height: 13px;"
                                     role="progressbar"
                                     aria-valuenow="${mainWinRate}" aria-valuemin="0" aria-valuemax="100">
                                    <div class="progress-bar bg-success stat-text"
                                         style="width: ${mainWinRate}%">
                                        ${mainWinRate}%
                                    </div>
                                </div>
                            </div>
    
                            <hr class="border-secondary border-1 opacity-75">
    
                            <div class="text-light stat-text mb-2">
                                <b>Matches Played With:</b> ${withMatches}
                            </div>
                            <div class="text-light stat-text d-flex align-items-center gap-2 mb-3">
                                <span><b>Win Rate:</b></span>
                                <div class="progress flex-grow-1 rounded-0 bg-danger border border-secondary"
                                     style="height: 13px;"
                                     role="progressbar"
                                     aria-valuenow="${withWinRate}" aria-valuemin="0" aria-valuemax="100">
                                    <div class="progress-bar bg-success stat-text"
                                         style="width: ${withWinRate}%">
                                        ${withWinRate}%
                                    </div>
                                </div>
                            </div>
    
                            <hr class="border-secondary border-1 opacity-75">
    
                            <div class="text-light stat-text mb-2">
                                <b>Matches Played Against:</b> ${againstMatches}
                            </div>
                            <div class="text-light stat-text d-flex align-items-center gap-2 mb-3">
                                <span><b>Win Rate:</b></span>
                                <div class="progress flex-grow-1 rounded-0 bg-danger border border-secondary"
                                     style="height: 13px;"
                                     role="progressbar"
                                     aria-valuenow="${againstWinRate}" aria-valuemin="0" aria-valuemax="100">
                                    <div class="progress-bar bg-success stat-text"
                                         style="width: ${againstWinRate}%">
                                        ${againstWinRate}%
                                    </div>
                                </div>
                            </div>
    
                        </div>
                    </div>
    
                    <div class="modal-footer border-0 justify-content-center"
                         style="background: rgba(15, 15, 20, 0.92);">
                        <button type="button"
                                class="btn btn-outline-danger radiance fw-bold"
                                data-bs-dismiss="modal"
                                onclick="selectHero(${playerHeroID})">
                            VIEW HERO PAGE
                        </button>
                        <button type="button"
                                class="btn btn-secondary radiance fw-bold"
                                data-bs-dismiss="modal">
                            CLOSE
                        </button>
                    </div>
    
                </div>
            </div>
        `;
    
        document.body.appendChild(modalEl);
    }

    function fillRecentMatchesContainer() {
        const container = document.getElementById("recentMatchesContainer");
        if (!container) return;
    
        container.innerHTML = "";
    
        // ── helper: build one match card element ─────────────────
        function buildMatchCard(match) {
            const matchHeroID   = match.hero_id;
            const matchHeroInfo = getHeroData(matchHeroID);
            const matchHeroImg  = getHeroImg(matchHeroInfo.name);
    
            const playerSide  = match.player_slot >= 128 ? "Dire" : "Radiant";
            const sideColor   = playerSide === "Radiant" ? "#4CAF50" : "#f44336";
            const isRadiant   = match.player_slot < 128;
            const didWin      = (isRadiant && match.radiant_win) || (!isRadiant && !match.radiant_win);
            const resultLabel = didWin ? "WIN" : "LOSS";
            const resultColor = didWin ? "#4CAF50" : "#f44336";
    
            const playerKills   = match.kills         ?? 0;
            const playerDeaths  = match.deaths        ?? 0;
            const playerAssists = match.assists       ?? 0;
            const partySize     = match.party_size    ?? 1;
            const duration      = match.duration
                ? `${Math.floor(match.duration / 60)}m ${match.duration % 60}s`
                : "N/A";
            const matchDate = match.start_time
                ? new Date(match.start_time * 1000).toLocaleDateString()
                : "N/A";
            const lastHits = match.last_hits     ?? "N/A";
            const gpm      = match.gold_per_min  ?? "N/A";
            const xpm      = match.xp_per_min    ?? "N/A";
    
            const card = document.createElement("div");
            card.className = "recent-match-card glass-card mb-3 overflow-hidden";
            card.innerHTML = `
                <div class="row g-0">
                    <div class="col-3 col-md-2 position-relative"
                         style="cursor: pointer;"
                         onclick="selectHero(${matchHeroID})">
                        <img src="${matchHeroImg}"
                             class="img-fluid h-100 scale"
                             style="object-fit: cover; object-position: center top; min-height: 90px;"
                             alt="${matchHeroInfo.localized_name}">
                        <div class="position-absolute bottom-0 start-0 end-0 text-center radiance text-light"
                             style="background: rgba(0,0,0,0.6); font-size: 0.55rem; padding: 2px;">
                            ${matchHeroInfo.localized_name.toUpperCase()}
                        </div>
                    </div>
    
                    <div class="col-9 col-md-10 p-2">
                        <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                            <span class="radiance fw-bold px-2 py-1 rounded-2"
                                  style="font-size: 0.7rem;
                                         background: ${resultColor}22;
                                         color: ${resultColor};
                                         border: 1px solid ${resultColor}88;">
                                ${resultLabel}
                            </span>
                            <span class="radiance px-2 py-1 rounded-2"
                                  style="font-size: 0.65rem;
                                         background: ${sideColor}22;
                                         color: ${sideColor};
                                         border: 1px solid ${sideColor}55;">
                                ${playerSide}
                            </span>
                            <span class="text-secondary" style="font-size: 0.65rem;">${matchDate}</span>
                            <span class="text-secondary" style="font-size: 0.65rem;">⏱ ${duration}</span>
                        </div>
    
                        <div class="d-flex align-items-center gap-1 mb-1">
                            <span class="fw-bold text-light" style="font-size: 0.85rem;">
                                <span style="color: #4CAF50;">${playerKills}</span>
                                <span class="text-secondary mx-1">/</span>
                                <span style="color: #f44336;">${playerDeaths}</span>
                                <span class="text-secondary mx-1">/</span>
                                <span style="color: #90CAF9;">${playerAssists}</span>
                            </span>
                            <span class="text-secondary ms-1" style="font-size: 0.65rem;">K / D / A</span>
                        </div>
    
                        <div class="d-flex flex-wrap gap-2" style="font-size: 0.65rem;">
                            <span class="text-secondary">
                                Last Hits: <span class="text-light fw-bold">${lastHits}</span>
                            </span>
                            <span class="text-secondary">
                                GPM: <span class="text-warning fw-bold">${gpm}</span>
                            </span>
                            <span class="text-secondary">
                                XPM: <span class="text-info fw-bold">${xpm}</span>
                            </span>
                            <span class="text-secondary">
                                Party: <span class="text-light fw-bold">${partySize}</span>
                            </span>
                        </div>
                    </div>
                </div>
            `;
            return card;
        }
    
        // ── render first 3 in the container ──────────────────────
        playerRecentMatchesData.slice(0, 3).forEach(match => {
            container.appendChild(buildMatchCard(match));
        });
    
        // ── "View All" button ─────────────────────────────────────
        if (playerRecentMatchesData.length > 3) {
            const viewAllBtn = document.createElement("div");
            viewAllBtn.className = "text-center mb-3";
            viewAllBtn.innerHTML = `
                <button class="btn btn-outline-danger radiance fw-bold"
                        data-bs-toggle="modal"
                        data-bs-target="#allMatchesModal">
                    VIEW ALL MATCHES
                </button>
            `;
            container.appendChild(viewAllBtn);
        }
    
        // ── build modal with all matches ──────────────────────────
        const existingModal = document.getElementById("allMatchesModal");
        if (existingModal) existingModal.remove();
    
        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.id = "allMatchesModal";
        modal.setAttribute("tabindex", "-1");
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                <div class="modal-content border-0"
                     style="background: rgba(15, 15, 20, 0.95);
                            backdrop-filter: blur(20px);
                            border-radius: 15px;
                            overflow: hidden;">
    
                    <div class="modal-header glass-card-red border-0">
                        <p class="radiance fw-bold text-light fs-5 mb-0">ALL RECENT MATCHES</p>
                        <button type="button"
                                class="btn-close btn-close-white ms-auto"
                                data-bs-dismiss="modal"
                                aria-label="Close"></button>
                    </div>
    
                    <div class="modal-body p-3" id="allMatchesModalBody">
                    </div>
    
                    <div class="modal-footer border-0"
                         style="background: rgba(15, 15, 20, 0.95);">
                        <button type="button"
                                class="btn btn-secondary radiance fw-bold"
                                data-bs-dismiss="modal">
                            CLOSE
                        </button>
                    </div>
    
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    
        // Populate modal body lazily when it opens
        modal.addEventListener("show.bs.modal", () => {
            const modalBody = document.getElementById("allMatchesModalBody");
            if (modalBody.children.length > 0) return; // already populated
            playerRecentMatchesData.forEach(match => {
                modalBody.appendChild(buildMatchCard(match));
            });
        }, { once: false });
    }

    profileContainer.innerHTML = originalProfileHTML;


    const elPlayerName = document.getElementById("playerName");
    elPlayerName.innerHTML = playerName;


    const elPlayerRank = document.getElementById("playerRank");
    elPlayerRank.innerHTML = `<div class="h5 mb-3 text-center">Current Rank: </div> <div class="d-flex flex-row"> <p class="mt-5 me-3"> ${playerRank} </p> <img class="img-fluid w-50" src="${playerRankIcon}"> </div>`

    const elPlayerAvatar = document.getElementById("playerAvatar");
    elPlayerAvatar.src = playerAvatar;

    const elPlayerFriendCode = document.getElementById("playerFriendCode");
    elPlayerFriendCode.innerHTML = "<b>Friend Code</b>: " + friendCode;


    if (path.endsWith("overview.html") || path === "/" || path.endsWith("/")) {
        const elPlayerRecord = document.getElementById("playerWinLoseRatio");

        if (!playerTotalWins && !playerTotalLose) {
            elPlayerRecord.innerHTML = `
                <p class="text-secondary gentium fs-fluid-md mb-0">⚠ Match data is private</p>`;
        } else {
            elPlayerRecord.innerHTML = `
                <p class="stat-text fs-fluid-md text-success d-inline mb-0">${playerTotalWins}</p>
                <p class="stat-text fs-fluid-md text-light d-inline mb-0"> - </p>
                <p class="stat-text fs-fluid-md text-danger d-inline mb-0">${playerTotalLose}</p>
                <p class="grey gentium fs-fluid-md mt-1 mb-3 small">WIN / LOSE</p>
                <p class="stat-text fs-fluid-md text-light mb-0">${playerTotalWins + playerTotalLose}</p>
                <p class="grey gentium fs-fluid-md mt-1 mb-0 small">TOTAL MATCHES</p>
            `;
        }
    }
    if (path.endsWith("overview.html") || path === "/" || path.endsWith("/")) {
        const elPlayerTotalWinRate = document.getElementById("playerTotalWinRate");
        const totalMatches = (playerTotalWins + playerTotalLose);
        const totalWinRate = (playerTotalWins / totalMatches * 100);
        let displayWinRate = totalWinRate.toFixed(2);

        if (!totalMatches || isNaN(totalWinRate)) {
            elPlayerTotalWinRate.innerHTML = `
                <p class="text-secondary gentium fs-fluid-md mb-0">⚠ Match data is private</p>`;
        } else {
            elPlayerTotalWinRate.innerHTML = `
                <p class="stat-text fs-fluid-md fw-bold ${totalWinRate >= 50 ? 'text-success' : 'text-danger'} mb-0">
                    ${displayWinRate}<span class="fs-fluid-md"> %</span>
                </p>
                <p class="grey gentium mt-1 mb-0 fs-fluid-md">WIN RATE</p>
            `;
        }
    }
    function hidePageLoader() {
        const loader = document.getElementById("pageLoader");
        if (!loader) return;
        loader.style.opacity = "0";
        setTimeout(() => loader.remove(), 500);
    }
    hidePageLoader();

    fillRecentMatchesContainer();






    if (path.endsWith("overview.html") || path === "/" || path.endsWith("/")) {
        renderHeroList(playerHeroData, 3);
    } else if (path.includes("player_heroes.html")) {
        renderHeroList(playerHeroData, playerHeroData.length);
    }





};

window.selectHero = function (heroID) {
    localStorage.setItem('lastViewedHeroID', heroID);
    window.location.href = 'hero_showcase.html';
};


window.onload = () => {
    const lastCode = localStorage.getItem("savedFriendCode");
    if (!lastCode) return;

    const heroContainer = document.getElementById("heroContainer");
    const profileContainer = document.getElementById("playerProfileContainer");
    if (!heroContainer || !profileContainer) return;

    const input = document.querySelector(".searchPlayerCode");
    if (input) input.value = lastCode;

    loadPlayerData();
};