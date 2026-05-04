const topPlayerData = async () => {

    const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    const baseUrl = isLocal
        ? `https://corsproxy.io/?https://api.opendota.com/api`
        : `https://api.opendota.com/api`;
    const topPlayersUrl = `${baseUrl}/topPlayers`;

    const topPlayersRes = await fetch(topPlayersUrl);
    const topPlayers = await topPlayersRes.json();

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

    const elTopPlayersContainer = document.getElementById("topPlayersContainer");
    elTopPlayersContainer.innerHTML = ""; // Clear before rendering

    for (let index = 0; index < 5; index++) {
        const player = topPlayers[index];
        if (!player) break; // Safety check if API returns fewer than 25

        const topPlayerAvatar = player.avatarfull;
        const topPlayerName = player.personaname;
        const topPlayerMMR = player.computed_mmr;
        const topPlayerAccountId = player.account_id;
        const tierValue = player.rank_tier;
        const medalIndex = Math.floor(tierValue / 10);
        const topPlayerRank = rankTierMapping[medalIndex]?.name ?? "Uncalibrated";
        const topPlayerRankIcon = rankIconMapping[medalIndex]?.rankImg ?? "./assets/image/uncalibrated.webp";

        const playerCard = `
            <div class="card mb-2 player-card scale" data-account-id="${topPlayerAccountId}" style="cursor: pointer;">
                <div class="row g-0 align-items-center">
                    <div class="col-3">
                        <img src="${topPlayerAvatar}" class="img-fluid rounded-start player-avatar" alt="${topPlayerName}">
                    </div>
                    <div class="col-9">
                        <div class="card-body py-1 px-2">
                            <p class="card-title fw-bold mb-0 text-truncate small"> ${topPlayerName}</p>
                            <p class="mb-0 text-secondary" style="font-size: 0.7rem;">MMR: ${topPlayerMMR}</p>
                            <div class="d-flex align-items-center gap-1">
                                <img src="${topPlayerRankIcon}" style="width: 24px; height: 24px; object-fit: contain;">
                                <span style="font-size: 0.7rem;">${topPlayerRank}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        elTopPlayersContainer.innerHTML += playerCard;
    }
    elTopPlayersContainer.querySelectorAll(".player-card").forEach(card => {
        card.addEventListener("click", () => {
            const accountId = card.dataset.accountId;
            localStorage.setItem("savedFriendCode", accountId);
            window.location.href = "overview.html";

        });
    });
    
};



topPlayerData();