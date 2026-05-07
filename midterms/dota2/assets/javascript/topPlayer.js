function loadTopPlayers() {
    const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

    // --- Mappings ---
    const rankTierMapping = {
        1: "Herald", 2: "Guardian", 3: "Crusader", 4: "Archon",
        5: "Legend", 6: "Ancient", 7: "Divine", 8: "Immortal"
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

    
    // Fetches full player data including rank_tier and MMR
    const fetchFullPlayerData = async (account_id) => {
        try {
            const res = await fetch(`https://api.opendota.com/api/players/${account_id}`);
            const data = await res.json();
    
            const mmrValue = data.computed_mmr 
                             ?? data.mmr_estimate?.estimate 
                             ?? data.competitive_rank 
                             ?? "N/A";
    
            return {
                mmr: mmrValue,
                rank_tier: data.rank_tier ?? 0
            };
        } catch (error) {
            console.error("Fetch error:", error);
            return { mmr: "N/A", rank_tier: 0 };
        }
    };

    const proPlayerData = async (count = 5) => {
        const res = await fetch(`https://api.opendota.com/api/proPlayers`);
        const proPlayers = await res.json();
        window._proPlayers = proPlayers;

        const elProPlayersContainer = document.getElementById("proPlayersContainer");
        const sampledPros = shuffleArray(proPlayers).slice(0, count);

        const enrichedPros = await Promise.all(sampledPros.map(async (p) => {
            const details = await fetchFullPlayerData(p.account_id);
            return { ...p, ...details }; // Merges the pro info with fresh Rank/MMR
        }));

        renderPlayerCards(enrichedPros, elProPlayersContainer, count);
    };

    const topPlayerData = async (count = 5) => {
        const res = await fetch(`https://api.opendota.com/api/topPlayers`);
        const topPlayers = await res.json();
        window._topPlayers = topPlayers;
        const elTopPlayersContainer = document.getElementById("topPlayersContainer");
        renderPlayerCards(shuffleArray(topPlayers), elTopPlayersContainer, count);
    };

    // --- Render Logic ---

    const renderPlayerCards = (players, container, count = 5) => {
        container.innerHTML = "";
        for (let i = 0; i < count; i++) {
            const player = players[i];
            if (!player) break;

            const medalIndex = Math.floor((player.rank_tier ?? 0) / 10);
            const playerRank = rankTierMapping[medalIndex] ?? "Uncalibrated";
            const playerRankIcon = rankIconMapping[medalIndex] ?? rankIconMapping[0];
            
            container.innerHTML += `
            <div class="card mb-2 player-card scale" data-account-id="${player.account_id}" style="cursor: pointer;">
                <div class="row g-0 align-items-center">
                    <div class="col-3">
                        <img src="${player.avatarfull}" class="img-fluid rounded-start player-avatar" alt="${player.personaname}">
                    </div>
                    <div class="col-9">
                        <div class="card-body py-1 px-2">
                            <p class="card-title fw-bold mb-0 text-truncate small">${player.personaname}</p>
                            <p class="mb-0 text-secondary" style="font-size: 0.7rem;">Team: ${player.team_name ?? 'Free Agent'}</p>
                            <div class="d-flex align-items-center gap-1">
                                <img src="${playerRankIcon}" style="width: 24px; height: 24px; object-fit: contain;">
                                <span style="font-size: 0.7rem;">${playerRank}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        container.querySelectorAll(".player-card").forEach(card => {
            card.addEventListener("click", () => {
                localStorage.setItem("savedFriendCode", card.dataset.accountId);
                window.location.href = "overview.html";
            });
        });
    };

    // --- Modal Logic ---

    const buildModalCard = (player, extraData) => {
        const rankTier = extraData?.rank_tier ?? 0;
        const mmr = extraData?.mmr ?? "N/A";
        
        const medalIndex = Math.floor(rankTier / 10);
        const playerRank = rankTierMapping[medalIndex] ?? "Uncalibrated";
        const playerRankIcon = rankIconMapping[medalIndex] ?? rankIconMapping[0];

        return `
        <div class="col-12 col-sm-6">
            <div class="card player-card scale h-100" data-account-id="${player.account_id}" style="cursor: pointer;">
                <div class="row g-0 align-items-center">
                    <div class="col-3">
                        <img src="${player.avatarfull}" class="img-fluid rounded-start player-avatar">
                    </div>
                    <div class="col-9">
                        <div class="card-body py-2 px-2">
                            <p class="card-title fw-bold mb-0 text-truncate small">${player.personaname}</p>
                            <p class="mb-0 text-danger fw-bold" style="font-size: 0.7rem;">MMR: ${mmr}</p>
                            <div class="d-flex align-items-center gap-1">
                                <img src="${playerRankIcon}" style="width: 22px; height: 22px; object-fit: contain;">
                                <span style="font-size: 0.7rem;">${playerRank}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    };

    const openPlayerModal = async (title, allPlayers) => {
        const modalBody = document.getElementById("playerModalBody");
        const modalSearch = document.getElementById("playerModalSearch");
        document.getElementById("playerModalLabel").textContent = title;
        modalSearch.value = "";

        const refreshModalContent = async (playerList) => {
            modalBody.innerHTML = `
                <div class="text-center text-light py-5">
                    <div class="spinner-border text-danger" role="status"></div>
                    <p class="mt-2 gentium">Fetching Rank & MMR data...</p>
                </div>`;

            const sample = shuffleArray(playerList).slice(0, 20);
            
            // Parallel fetch for the specific players being shown
            const fullDataResults = await Promise.all(sample.map(p => fetchFullPlayerData(p.account_id)));

            if (sample.length === 0) {
                modalBody.innerHTML = `<p class="text-secondary text-center py-4">No players found.</p>`;
                return;
            }

            modalBody.innerHTML = `<div class="row g-2">${sample.map((p, i) => buildModalCard(p, fullDataResults[i])).join("")}</div>`;
            
            modalBody.querySelectorAll(".player-card").forEach(card => {
                card.addEventListener("click", () => {
                    localStorage.setItem("savedFriendCode", card.dataset.accountId);
                    window.location.href = "overview.html";
                });
            });
        };

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("playerModal"));
        modal.show();
        refreshModalContent(allPlayers);

        let debounceTimer;
        modalSearch.oninput = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = modalSearch.value.trim().toLowerCase();
                const filtered = !query ? allPlayers : allPlayers.filter(p => 
                    p.personaname?.toLowerCase().includes(query) || 
                    p.name?.toLowerCase().includes(query) || 
                    p.team_name?.toLowerCase().includes(query)
                );
                refreshModalContent(filtered);
            }, 400);
        };
    };

    // --- Initialization ---

    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("btnViewMoreTop")?.addEventListener("click", () => openPlayerModal("High MMR Players", window._topPlayers ?? []));
        document.getElementById("btnViewMorePro")?.addEventListener("click", () => openPlayerModal("Pro Players", window._proPlayers ?? []));
    });


        topPlayerData(5);
        proPlayerData(5);
    
}

loadTopPlayers();