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
    const playerPeersUrl = `${profileUrl}/peers`

    const [profileRes, playerWinLoseRes, heroesData, playerPeersRes] = await Promise.all([
        fetch(profileUrl),
        fetch(playerWinLoseUrl),
        fetchHeroesData(heroesUrl),
        fetch(playerPeersUrl)
    ]);

    const heroesRes = await fetch(playerHeroesUrl);
    const playerHeroData = await heroesRes.json();

    const [playerData, playerWinLoseData, playerPeersData] = await Promise.all([
        profileRes.json(),
        playerWinLoseRes.json(),
        playerPeersRes.json()
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
        const heroInfo = getHeroData(heroID); // already fetched from heroesData
        const heroImg = getHeroImg(heroInfo.name);
        const attrColor = attributeColors[heroInfo.primary_attr].attributeColor;
        const matches = playerHeroData.games;
        const withMatches = playerHeroData.with_games;
        const againstMatches = playerHeroData.against_games;
        let mainWinRate, withWinRate, againstWinRate;

        // Winrate calculations
        if (matches === 0) {
            mainWinRate = 0;
        } else {
            mainWinRate = winrate(matches, playerHeroData.win);
        }

        if (withMatches === 0) {
            withWinRate = 0;
        } else {
            withWinRate = winrate(withMatches, playerHeroData.with_win);
        }

        if (againstMatches === 0) {
            againstWinRate = 0;
        } else {
            againstWinRate = winrate(againstMatches, playerHeroData.against_win);
        }

        // 1. Try to find your original <div> by ID
        let elPlayerHeroStats = document.getElementById(`playerHeroStats${index}`);

        // 2. If it doesn't exist (e.g., for the 4th, 5th hero), create it dynamically
        if (!elPlayerHeroStats) {
            const parent = document.getElementById(containerId);
            elPlayerHeroStats = document.createElement('div');
            elPlayerHeroStats.id = `playerHeroStats${index}`;
            // Use the EXACT classes from your original HTML
            elPlayerHeroStats.className = "col-xs-12 col-md-6 col-xxl-4 my-2";
            parent.appendChild(elPlayerHeroStats);
        }

        // 3. Inject the Card Content
        elPlayerHeroStats.innerHTML = `
            <div class="card glass-card mx-auto overflow-visible h-100" >
                <img src="${heroImg}" onclick="selectHero(${playerHeroID})" style="cursor: pointer" class="card-img-top scale border-bottom border-danger border-5" alt="..." >
                <div class="card-body card-body-glass">
                    <div class="mb-3 text-center">
                        <span class="hero-name-font text-light mt-3 fs-6 p-1 px-4 text-center mb-3 rounded-3 border border-secondary"
                            style="backdrop-filter: blur(10px); 
                            background: ${attrColor}; 
                            border: 1px solid rgba(255, 255, 255, 0.1); 
                            -webkit-backdrop-filter: blur(10px); 
                            border-radius: 8px; 
                            padding: 4px 16px;
                            display: inline-block;">
                            <b>${getHeroData(playerHeroID).localized_name.toUpperCase()}</b>
                        </span>
                    </div>
                    <hr class="border-secondary border-1 opacity-75">
                    
                    <div class="text-light stat-text">
                        <p><b>Matches Played As:</b> ${matches}</p>
                    </div>
                    
                    <div class="text-light stat-text d-flex flex-row">
                        <p><b>Win Rate:</b></p>
                        <div class="progress ms-3 align-self-center rounded-0 mb-3 bg-danger border border-secondary" 
                             style="width: 65%; height:13px" role="progressbar" 
                             aria-valuenow="${mainWinRate}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar bg-success stat-text" style="width: ${mainWinRate}%">
                                ${mainWinRate}%
                            </div>
                        </div>
                    </div>
    
                    <hr class="border-secondary border-1 opacity-75">
                    
                    <div class="mt-2 text-center">
                        <button class="btn glass-card text-light fw-bold shadow glass-card-hover"
                            type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapseAdditionalStats${index}">
                            DISPLAY MORE
                        </button>
                    </div>
    
                    <div class="collapse mt-3" id="collapseAdditionalStats${index}">
                        <hr class="border-secondary border-1 opacity-75">

                        
                    <div class="text-light stat-text">
                        <p><b>Matches Played With:</b> ${withMatches}</p>
                    </div>
                        <div class="text-light stat-text d-flex flex-row">
                        
                        <p><b>Win Rate:</b></p>
                        <div class="progress ms-3 align-self-center rounded-0 mb-3 bg-danger border border-secondary" 
                             style="width: 65%; height:13px" role="progressbar" 
                             aria-valuenow="${withMatches}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar bg-success stat-text" style="width: ${withWinRate}%">
                                ${withWinRate}%
                            </div>
                        </div>
                    </div>

                        <hr class="border-secondary border-1 opacity-75">
                        
                    <div class="text-light stat-text">
                        <p><b>Matches Played Against:</b> ${againstMatches}</p>
                    </div>
                        <div class="text-light stat-text d-flex flex-row">
                        <p><b>Win Rate:</b></p>
                        <div class="progress ms-3 align-self-center mb-3 rounded-0 bg-danger border border-secondary" 
                             style="width: 65%; height:13px" role="progressbar" 
                             aria-valuenow="${againstMatches}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-bar bg-success stat-text" style="width: ${againstWinRate}%">
                                ${againstWinRate}%
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>`;
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