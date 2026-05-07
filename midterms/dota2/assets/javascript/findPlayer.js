const rankTierMapping = {
    1: { name: "Herald" }, 2: { name: "Guardian" }, 3: { name: "Crusader" },
    4: { name: "Archon" }, 5: { name: "Legend" },   6: { name: "Ancient" },
    7: { name: "Divine" }, 8: { name: "Immortal" }
};

const rankIconMapping = {
    0: { rankImg: "./assets/image/uncalibrated.webp" },
    1: { rankImg: "./assets/image/herald.webp" },
    2: { rankImg: "./assets/image/guardian.webp" },
    3: { rankImg: "./assets/image/crusader.webp" },
    4: { rankImg: "./assets/image/archon.webp" },
    5: { rankImg: "./assets/image/legend.webp" },
    6: { rankImg: "./assets/image/ancient.webp" },
    7: { rankImg: "./assets/image/divine.webp" },
    8: { rankImg: "./assets/image/immortal.webp" }
};

const attributeColors = {
    str: { attributeColor: "rgba(185, 80, 11, 0.4)" },
    agi: { attributeColor: "rgba(22, 124, 19, 0.4)" },
    int: { attributeColor: "rgba(37, 125, 174, 0.4)" },
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

    const loadingSpinner = `
        <div class="text-center text-light py-5">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Loading player data...</p>
        </div>`;

    heroContainer.innerHTML = loadingSpinner;
    const originalProfileHTML = profileContainer.innerHTML;
    profileContainer.innerHTML = loadingSpinner;

    const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
    const baseUrl = isLocal
        ? `https://corsproxy.io/?https://api.opendota.com/api`
        : `https://api.opendota.com/api`;

    const profileUrl          = `${baseUrl}/players/${friendCode}`;
    const heroesUrl           = `${baseUrl}/heroes`;
    const baseHeroImgUrl      = `https://cdn.cloudflare.steamstatic.com`;

    // --- Shared helpers (defined early so all functions below can use them) ---

    function getHeroImg(heroName) {
        return `${baseHeroImgUrl}/apps/dota2/images/dota_react/heroes/${heroName.replace("npc_dota_hero_", "")}.png?`;
    }

    function getHeroData(id) {
        return heroesData.find(h => h.id === id);
    }

    function calcWinRate(wins, games) {
        return games > 0 ? ((wins / games) * 100).toFixed(2) : "0.00";
    }

    // --- Fetch everything in parallel ---

    const [profileRes, winLoseRes, heroesData, peersRes, recentRes] = await Promise.all([
        fetch(profileUrl),
        fetch(`${profileUrl}/wl`),
        fetchHeroesData(heroesUrl),
        fetch(`${profileUrl}/peers`),
        fetch(`${profileUrl}/recentMatches`)
    ]);

    const heroesRes      = await fetch(`${profileUrl}/heroes`);
    const playerHeroData = await heroesRes.json();

    const [playerData, winLoseData, peersData, recentMatchesData] = await Promise.all([
        profileRes.json(),
        winLoseRes.json(),
        peersRes.json(),
        recentRes.json()
    ]);

    if (!playerData?.profile) {
        localStorage.removeItem("savedFriendCode");
        return;
    }

    if (typedCode) localStorage.setItem("savedFriendCode", typedCode);

    if (!Array.isArray(playerHeroData) || playerHeroData.length === 0) {
        heroContainer.innerHTML = `
            <div class="text-center text-light py-5">
                <p class="text-warning">Hero data unavailable. The OpenDota API may have timed out.</p>
            </div>`;
        profileContainer.innerHTML = originalProfileHTML;
        document.getElementById("playerName").textContent = playerData.profile.personaname;
        document.getElementById("playerAvatar").src = playerData.profile.avatarfull;
        document.getElementById("playerFriendCode").innerHTML = `<b>Friend Code</b>: ${friendCode}`;
        return;
    }

    // --- Player profile ---

    const medalIndex   = Math.floor(playerData.rank_tier / 10);
    const playerRank   = rankTierMapping[medalIndex]?.name ?? "Uncalibrated";
    const playerRankIcon = rankIconMapping[medalIndex]?.rankImg ?? "./assets/image/uncalibrated.webp";
    const totalWins    = winLoseData.win;
    const totalLoses   = winLoseData.lose;
    const path         = window.location.pathname;

    profileContainer.innerHTML = originalProfileHTML;
    document.getElementById("playerName").innerHTML      = playerData.profile.personaname;
    document.getElementById("playerAvatar").src          = playerData.profile.avatarfull;
    document.getElementById("playerFriendCode").innerHTML = `<b>Friend Code</b>: ${friendCode}`;
    document.getElementById("playerRank").innerHTML = `
        <div class="h5 mb-3 text-center">Current Rank:</div>
        <div class="d-flex flex-row">
            <p class="mt-5 me-3">${playerRank}</p>
            <img class="img-fluid w-50" src="${playerRankIcon}">
        </div>`;

    // --- Win/Loss record ---

    const isOverview = path.endsWith("overview.html") || path === "/" || path.endsWith("/");

    if (isOverview) {
        const elRecord = document.getElementById("playerWinLoseRatio");
        const elWinRate = document.getElementById("playerTotalWinRate");
        const totalMatches = totalWins + totalLoses;
        const winRatePct = totalMatches ? (totalWins / totalMatches * 100) : NaN;
        const privateMsg = `<p class="text-secondary gentium fs-fluid-md mb-0">⚠ Match data is private</p>`;

        elRecord.innerHTML = (!totalWins && !totalLoses) ? privateMsg : `
            <p class="stat-text fs-fluid-md text-success d-inline mb-0">${totalWins}</p>
            <p class="stat-text fs-fluid-md text-light d-inline mb-0"> - </p>
            <p class="stat-text fs-fluid-md text-danger d-inline mb-0">${totalLoses}</p>
            <p class="grey gentium fs-fluid-md mt-1 mb-3 small">WIN / LOSE</p>
            <p class="stat-text fs-fluid-md text-light mb-0">${totalMatches}</p>
            <p class="grey gentium fs-fluid-md mt-1 mb-0 small">TOTAL MATCHES</p>`;

        elWinRate.innerHTML = isNaN(winRatePct) ? privateMsg : `
            <p class="stat-text fs-fluid-md fw-bold ${winRatePct >= 50 ? 'text-success' : 'text-danger'} mb-0">
                ${winRatePct.toFixed(2)}<span class="fs-fluid-md"> %</span>
            </p>
            <p class="grey gentium mt-1 mb-0 fs-fluid-md">WIN RATE</p>`;
    }

    // --- Peers ---

    const elPeers = document.getElementById("peersContainer");
    if (elPeers) {
        if (!peersData?.length) {
            elPeers.innerHTML = `
                <div class="text-center py-3 px-2">
                    <p class="text-secondary gentium small mb-0">⚠ Match data is private</p>
                </div>`;
        } else {
            elPeers.innerHTML = peersData.slice(0, 3).map(p => {
                const wr = p.with_games > 0 ? ((p.with_win / p.with_games) * 100).toFixed(1) : "0.0";
                return `
                <div class="card mb-2 player-card scale w-75 mx-auto m-2"
                     data-account-id="${p.account_id}" style="cursor: pointer;">
                    <div class="row g-0 align-items-center">
                        <div class="col-3">
                            <img src="${p.avatarfull}" class="img-fluid rounded-start" alt="${p.personaname}">
                        </div>
                        <div class="col-9">
                            <div class="card-body py-1 px-2">
                                <p class="card-title fw-bold mb-0 text-truncate small">${p.personaname}</p>
                                <p class="mb-0 text-secondary" style="font-size:0.7rem;">Games Together: ${p.with_games}</p>
                                <p class="mb-0 text-secondary" style="font-size:0.7rem;">Win Rate: ${wr}%</p>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join("");

            elPeers.querySelectorAll(".player-card").forEach(card => {
                card.addEventListener("click", () => {
                    localStorage.setItem("savedFriendCode", card.dataset.accountId);
                    window.location.href = "overview.html";
                });
            });
        }
    }

    // --- Hero card builder (used for both the top-3 outside AND the modal grid) ---
    // Accepts the raw hero data object directly — no positional index lookup.

    function buildHeroCard(heroData, containerId, modalIdPrefix) {
        const heroInfo   = getHeroData(heroData.hero_id);
        if (!heroInfo) return;

        const heroImg    = getHeroImg(heroInfo.name);
        const attrColor  = attributeColors[heroInfo.primary_attr]?.attributeColor ?? "rgba(100,100,100,0.4)";
        const heroName   = heroInfo.localized_name.toUpperCase();
        const modalId    = `${modalIdPrefix}_${heroData.hero_id}`;
        const heroID     = heroData.hero_id;

        const matches        = heroData.games        ?? 0;
        const withMatches    = heroData.with_games   ?? 0;
        const againstMatches = heroData.against_games ?? 0;
        const mainWR         = calcWinRate(heroData.win,          matches);
        const withWR         = calcWinRate(heroData.with_win,     withMatches);
        const againstWR      = calcWinRate(heroData.against_win,  againstMatches);

        // Card
        const parent  = document.getElementById(containerId);
        if (!parent) return;
        const wrapper = document.createElement("div");
        wrapper.className = "col-4 my-2";
        wrapper.innerHTML = `
            <div class="card mx-auto overflow-hidden h-100 scale hero-card position-relative"
                 style="cursor:pointer; border-radius:0"
                 data-bs-toggle="modal" data-bs-target="#${modalId}">
                <img src="${heroImg}" class="img-fluid" alt="${heroName}">
                <p class="card-text fw-bold hero-name-font fs-fluid-xs m-0 hero-label text-center text-lg-start"
                   style="position:absolute;bottom:0;left:0;right:0;padding:4px 8px;color:white !important">
                    ${heroName}
                </p>
            </div>`;
        parent.appendChild(wrapper);

        // Stat modal (remove stale one first)
        document.getElementById(modalId)?.remove();
        const modalEl = document.createElement("div");
        modalEl.className = "modal fade";
        modalEl.id = modalId;
        modalEl.setAttribute("tabindex", "-1");
        modalEl.setAttribute("aria-hidden", "true");

        // Reusable progress bar row
        function statRow(label, value) {
            return `
                <div class="text-light stat-text d-flex align-items-center gap-2 mb-3">
                    <span><b>${label}:</b></span>
                    <div class="progress flex-grow-1 rounded-0 bg-danger border border-secondary"
                         style="height:13px" role="progressbar"
                         aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar bg-success stat-text" style="width:${value}%">
                            ${value}%
                        </div>
                    </div>
                </div>`;
        }

        modalEl.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0"
             style="background:rgba(15,15,20,0.92);backdrop-filter:blur(20px);border-radius:15px;overflow:hidden">

            <div class="border-0 p-3 position-relative">
                <button type="button" class="btn-close btn-close-white"
                        style="position:absolute;top:10px;right:10px;z-index:10"
                        data-bs-dismiss="modal" aria-label="Close"></button>

                <div class="d-flex gap-3 align-items-stretch">

                    <div class="position-relative flex-shrink-0"
                         style="width:335px;height:180px;overflow:hidden;">
                        <img src="${heroImg}"
                             class="w-100 h-100 scale" onclick="selectHero(${heroID})"
                             style="object-fit:cover;object-position:center top; cursor: pointer"
                             alt="${heroName}">
                        <div class="position-absolute bottom-0 start-0 end-0"
                             style="padding:5px 8px;">
                            <p class="hero-name-font fw-bold m-0"
                               style="color:white !important;font-size:0.8rem;letter-spacing:1px;">
                                ${heroName}
                            </p>
                        </div>
                    </div>

                    <div class="d-flex flex-column justify-content-center flex-grow-1 gap-1"
                         style="padding-right:28px;">
                        <p class="text-light stat-text mb-0 small"><b>As:</b> ${matches} games</p>
                        ${statRow("Win Rate", mainWR)}
                        <p class="text-light stat-text mb-0 small"><b>With:</b> ${withMatches} games</p>
                        ${statRow("Win Rate", withWR)}
                        <p class="text-light stat-text mb-0 small"><b>Against:</b> ${againstMatches} games</p>
                        ${statRow("Win Rate", againstWR)}
                    </div>

                </div>
            </div>

            <div class="modal-footer border-0 justify-content-center p-2"
                 style="background:rgba(15,15,20,0.92)">
                <button type="button" class="btn btn-outline-danger radiance fw-bold"
                        data-bs-toggle="modal" data-bs-target="#allHeroesModal"">GO TO ALL HERO LIST</button>
                <button type="button" class="btn btn-secondary radiance fw-bold"
                        data-bs-dismiss="modal">CLOSE</button>
            </div>

        </div>
    </div>`;
        document.body.appendChild(modalEl);
    }

    // --- Hero list (top-3 outside + full modal) ---

    function renderHeroList(dataArray) {
        const allZero = dataArray.every(h => h.games === 0);

        if (!dataArray.length || allZero) {
            heroContainer.innerHTML = `
                <div class="text-center text-secondary py-4 w-100">
                    <p class="gentium fs-fluid-md mb-0">⚠ Match data is private</p>
                </div>`;
            return;
        }

        // Top 3 outside the modal — use prefix "heroTop" so IDs never clash with modal cards
        heroContainer.innerHTML = "";
        dataArray.slice(0, 3).forEach(hero => buildHeroCard(hero, "heroContainer", "heroTop"));

        // Build the "All Heroes" modal
        document.getElementById("allHeroesModal")?.remove();

        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.id = "allHeroesModal";
        modal.setAttribute("tabindex", "-1");
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                <div class="modal-content border-0"
                     style="background:rgba(15,15,20,0.95);backdrop-filter:blur(20px);border-radius:15px;overflow:hidden">
                    <div class="modal-header glass-card-red border-0 flex-column flex-sm-row gap-2">
                        <p class="radiance fw-bold text-light fs-5 mb-0">ALL HEROES</p>
                        <div class="d-flex align-items-center gap-2 ms-sm-auto">
                            <label for="heroSortSelect" class="text-light radiance small mb-0 text-nowrap">Sort by:</label>
                            <select id="heroSortSelect" class="form-select form-select-sm bg-dark text-light border-secondary" style="min-width:180px">
                                <option value="matches">Matches Played</option>
                                <option value="name">Hero Name</option>
                                <option value="winrate">Win Rate</option>
                                <option value="with">Most Played With</option>
                                <option value="against">Most Played Against</option>
                                <option value="with_wr">Played With Win Rate</option>
                                <option value="against_wr">Played Against Win Rate</option>
                            </select>
                            <select id="heroSortOrder" class="form-select form-select-sm bg-dark text-light border-secondary" style="min-width:130px">
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                    </div>
                    <div class="modal-body p-3" id="allHeroesModalBody">
                        <div class="text-center text-light py-5">
                            <div class="spinner-border" role="status"></div>
                            <p class="mt-2">Loading all heroes...</p>
                        </div>
                    </div>
                    <div class="modal-footer border-0" style="background:rgba(15,15,20,0.95)">
                        <button type="button" class="btn btn-secondary radiance fw-bold" data-bs-dismiss="modal">CLOSE</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);

        // Sorting

        function getHeroName(hero) {
            return (getHeroData(hero.hero_id)?.localized_name ?? "").toUpperCase();
        }

        function sortHeroes(arr, field, order) {
            const dir = order === "asc" ? 1 : -1;

            // Split into heroes with a real value vs zero, zeros trail sorted alpha
            function split(keyFn) {
                const active = [], zero = [];
                arr.forEach(h => (keyFn(h) > 0 ? active : zero).push(h));
                zero.sort((a, b) => getHeroName(a).localeCompare(getHeroName(b)));
                return { active, zero };
            }

            if (field === "name") {
                return [...arr].sort((a, b) => dir * getHeroName(a).localeCompare(getHeroName(b)));
            }

            const configs = {
                matches:    { keyFn: h => h.games,          cmpFn: (a, b) => a.games - b.games },
                winrate:    { keyFn: h => h.games,          cmpFn: (a, b) => calcWinRate(a.win, a.games) - calcWinRate(b.win, b.games) },
                with:       { keyFn: h => h.with_games,     cmpFn: (a, b) => a.with_games - b.with_games },
                against:    { keyFn: h => h.against_games,  cmpFn: (a, b) => a.against_games - b.against_games },
                with_wr:    { keyFn: h => h.with_games,     cmpFn: (a, b) => calcWinRate(a.with_win, a.with_games) - calcWinRate(b.with_win, b.with_games) },
                against_wr: { keyFn: h => h.against_games,  cmpFn: (a, b) => calcWinRate(a.against_win, a.against_games) - calcWinRate(b.against_win, b.against_games) },
            };

            const { keyFn, cmpFn } = configs[field] ?? configs.matches;
            const { active, zero } = split(keyFn);
            active.sort((a, b) => dir * cmpFn(a, b));
            return [...active, ...zero];
        }

        function renderGrid(field, order) {
            const grid = document.getElementById("allHeroesGrid");
            if (!grid) return;
            // Clean up old modal hero stat modals
            document.querySelectorAll('[id^="heroModal_"]').forEach(el => el.remove());
            grid.innerHTML = "";
            sortHeroes(dataArray, field, order).forEach(hero => {
                buildHeroCard(hero, "allHeroesGrid", "heroModal");
            });
        }

        modal.addEventListener("show.bs.modal", () => {
            const body = document.getElementById("allHeroesModalBody");
            if (!body.dataset.loaded) {
                body.dataset.loaded = "true";
                body.innerHTML = `<div class="row justify-content-center" id="allHeroesGrid"></div>`;
                renderGrid("matches", "desc");
            }
            const sel = document.getElementById("heroSortSelect");
            const ord = document.getElementById("heroSortOrder");
            if (sel && !sel.dataset.bound) {
                sel.dataset.bound = "true";
                const onChange = () => renderGrid(sel.value, ord.value);
                sel.addEventListener("change", onChange);
                ord.addEventListener("change", onChange);
            }
        }, { once: false });
    }

    // --- Recent matches ---

    function fillRecentMatchesContainer() {
        const container = document.getElementById("recentMatchesContainer");
        if (!container) return;
        container.innerHTML = "";

        function buildMatchCard(match) {
            const heroInfo    = getHeroData(match.hero_id);
            const heroImg     = getHeroImg(heroInfo.name);
            const isRadiant   = match.player_slot < 128;
            const didWin      = (isRadiant && match.radiant_win) || (!isRadiant && !match.radiant_win);
            const resultColor = didWin ? "#4CAF50" : "#f44336";
            const sideColor   = isRadiant ? "#4CAF50" : "#f44336";
            const duration    = match.duration
                ? `${Math.floor(match.duration / 60)}m ${match.duration % 60}s` : "N/A";
            const matchDate   = match.start_time
                ? new Date(match.start_time * 1000).toLocaleDateString() : "N/A";

            const card = document.createElement("div");
            card.className = "recent-match-card glass-card mb-3 overflow-hidden";
            card.innerHTML = `
                <div class="row g-0">
                    <div class="col-3 col-md-2 position-relative"
                         style="cursor:pointer" onclick="selectHero(${match.hero_id})">
                        <img src="${heroImg}" class="img-fluid h-100 scale"
                             style="object-fit:cover;object-position:center top;min-height:90px"
                             alt="${heroInfo.localized_name}">
                        <div class="position-absolute bottom-0 start-0 end-0 text-center radiance text-light"
                             style="background:rgba(0,0,0,0.6);font-size:0.55rem;padding:2px">
                            ${heroInfo.localized_name.toUpperCase()}
                        </div>
                    </div>
                    <div class="col-9 col-md-10 p-2">
                        <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
                            <span class="radiance fw-bold px-2 py-1 rounded-2"
                                  style="font-size:0.7rem;background:${resultColor}22;color:${resultColor};border:1px solid ${resultColor}88">
                                ${didWin ? "WIN" : "LOSS"}
                            </span>
                            <span class="radiance px-2 py-1 rounded-2"
                                  style="font-size:0.65rem;background:${sideColor}22;color:${sideColor};border:1px solid ${sideColor}55">
                                ${isRadiant ? "Radiant" : "Dire"}
                            </span>
                            <span class="text-secondary" style="font-size:0.65rem">${matchDate}</span>
                            <span class="text-secondary" style="font-size:0.65rem">⏱ ${duration}</span>
                        </div>
                        <div class="d-flex align-items-center gap-1 mb-1">
                            <span class="fw-bold text-light" style="font-size:0.85rem">
                                <span style="color:#4CAF50">${match.kills ?? 0}</span>
                                <span class="text-secondary mx-1">/</span>
                                <span style="color:#f44336">${match.deaths ?? 0}</span>
                                <span class="text-secondary mx-1">/</span>
                                <span style="color:#90CAF9">${match.assists ?? 0}</span>
                            </span>
                            <span class="text-secondary ms-1" style="font-size:0.65rem">K / D / A</span>
                        </div>
                        <div class="d-flex flex-wrap gap-2" style="font-size:0.65rem">
                            <span class="text-secondary">Last Hits: <span class="text-light fw-bold">${match.last_hits ?? "N/A"}</span></span>
                            <span class="text-secondary">GPM: <span class="text-warning fw-bold">${match.gold_per_min ?? "N/A"}</span></span>
                            <span class="text-secondary">XPM: <span class="text-info fw-bold">${match.xp_per_min ?? "N/A"}</span></span>
                            <span class="text-secondary">Party: <span class="text-light fw-bold">${match.party_size ?? 1}</span></span>
                        </div>
                    </div>
                </div>`;
            return card;
        }

        recentMatchesData.slice(0, 3).forEach(m => container.appendChild(buildMatchCard(m)));

        if (recentMatchesData.length > 3) {
            const btn = document.createElement("div");
            btn.className = "text-center mb-3";
            btn.innerHTML = `
                <button class="btn btn-dark border gentium fs-fluid-sm searchBtnHero fw-bold"
                        data-bs-toggle="modal" data-bs-target="#allMatchesModal">
                    VIEW ALL MATCHES
                </button>`;
            container.appendChild(btn);
        }

        document.getElementById("allMatchesModal")?.remove();
        const modal = document.createElement("div");
        modal.className = "modal fade";
        modal.id = "allMatchesModal";
        modal.setAttribute("tabindex", "-1");
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                <div class="modal-content border-0"
                     style="background:rgba(15,15,20,0.95);backdrop-filter:blur(20px);border-radius:15px;overflow:hidden">
                    <div class="modal-header glass-card-red border-0">
                        <p class="radiance fw-bold text-light fs-5 mb-0">ALL RECENT MATCHES</p>
                        <button type="button" class="btn-close btn-close-white ms-auto"
                                data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3" id="allMatchesModalBody"></div>
                    <div class="modal-footer border-0" style="background:rgba(15,15,20,0.95)">
                        <button type="button" class="btn btn-secondary radiance fw-bold"
                                data-bs-dismiss="modal">CLOSE</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);

        modal.addEventListener("show.bs.modal", () => {
            const body = document.getElementById("allMatchesModalBody");
            if (body.children.length > 0) return;
            recentMatchesData.forEach(m => body.appendChild(buildMatchCard(m)));
        }, { once: false });
    }

    // --- Page loader ---

    function hidePageLoader() {
        const loader = document.getElementById("pageLoader");
        if (!loader) return;
        loader.style.opacity = "0";
        setTimeout(() => loader.remove(), 500);
    }

    // --- Run ---

    hidePageLoader();
    fillRecentMatchesContainer();

    if (isOverview) {
        renderHeroList(playerHeroData);
    } else if (path.includes("player_heroes.html")) {
        renderHeroList(playerHeroData);
    }
};

window.selectHero = function (heroID) {
    localStorage.setItem("lastViewedHeroID", heroID);
    window.location.href = "hero_showcase.html";
};

window.onload = () => {
    const lastCode = localStorage.getItem("savedFriendCode");
    if (!lastCode) return;

    const heroContainer    = document.getElementById("heroContainer");
    const profileContainer = document.getElementById("playerProfileContainer");
    if (!heroContainer || !profileContainer) return;

    const input = document.querySelector(".searchPlayerCode");
    if (input) input.value = lastCode;

    loadPlayerData();
};