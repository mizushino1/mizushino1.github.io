
let allHeroData = [];
const baseHeroAssetsUrl = `https://cdn.cloudflare.steamstatic.com`;

async function fetchHeroStats() {
    try {
        const response = await fetch('https://api.opendota.com/api/heroStats');
        const data = await response.json();
        
        // Pre-process data (calculate total picks and win rates)
        return data.map(hero => {
            const totalPicks = (hero['1_pick'] || 0) + (hero['2_pick'] || 0) + 
                               (hero['3_pick'] || 0) + (hero['4_pick'] || 0) + 
                               (hero['5_pick'] || 0) + (hero['6_pick'] || 0) + 
                               (hero['7_pick'] || 0) + (hero['8_pick'] || 0);
            
            const winRate = hero.pub_pick > 0 ? ((hero.pub_win / hero.pub_pick) * 100) : 0;
            const proWinRate = hero.pro_pick > 0 ? ((hero.pro_win / hero.pro_pick) * 100) : 0;

            return { ...hero, totalPicks, winRate, proWinRate };
        });
    } catch (error) {
        console.error("Error fetching hero stats:", error);
        return [];
    }
}


async function loadTopPickedHeroes(heroes) {
    const container = document.getElementById("topHeroesContainer");
    if (!container) return;

    const sorted = [...heroes].sort((a, b) => b.totalPicks - a.totalPicks).slice(0, 5);
    container.innerHTML = sorted.map(hero => renderHeroSmallCard(hero, 'picks')).join('');
}


async function loadTopWinRateHeroes(heroes) {
    const container = document.getElementById("topWinRateContainer");
    if (!container) return;

    const sorted = [...heroes]
        .filter(h => h.pub_pick > 1000)
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 5);
    container.innerHTML = sorted.map(hero => renderHeroSmallCard(hero, 'winrate')).join('');
}


function renderHeroSmallCard(hero, type) {
    const subText = type === 'picks' ? `Picks: ${hero.totalPicks.toLocaleString()}` : `Matches: ${hero.pub_pick.toLocaleString()}`;
    const rate = type === 'picks' ? hero.proWinRate.toFixed(1) : hero.winRate.toFixed(1);
    
    return `
        <div class="d-flex align-items-center mb-3 pe-2 rounded glass-card shadow-sm scale" style="cursor: pointer;" onclick="selectHero(${hero.id})">
            <img src="${baseHeroAssetsUrl + hero.img}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #444;">
            <div class="ms-3 flex-grow-1 overflow-hidden">
                <p class="text-light fw-bold mb-0 text-truncate small">${hero.localized_name}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="text-secondary" style="font-size: 0.7rem;">${subText}</span>
                    <span class="badge ${rate >= 50 ? 'bg-success' : 'bg-danger'} opacity-75" style="font-size: 0.6rem;">${rate}% WR</span>
                </div>
            </div>
        </div>`;
}

// Modal Logic
async function openHeroModal(mode) {
    const modal = new bootstrap.Modal(document.getElementById('heroModal'));
    const container = document.getElementById('heroModalContent');
    const title = document.getElementById('heroModalTitle');
    const searchInput = document.getElementById('heroSearchInput');

    title.innerText = mode === 'picks' ? "All Heroes by Popularity" : "All Heroes by Win Rate";
    searchInput.value = ""; 

    const renderModalItems = (filterText = "") => {
        let list = [...allHeroData];
        
        // Filter by search
        if(filterText) {
            list = list.filter(h => h.localized_name.toLowerCase().includes(filterText.toLowerCase()));
        }


        if (mode === 'picks') {
            list.sort((a, b) => b.totalPicks - a.totalPicks);
        } else {
            list.sort((a, b) => b.winRate - a.winRate);
        }

        container.innerHTML = list.map(hero => `
            <div class="col-12 col-md-6">
                ${renderHeroSmallCard(hero, mode)}
            </div>
        `).join('');
    };


    renderModalItems();
    

    searchInput.oninput = (e) => renderModalItems(e.target.value);
    
    modal.show();
}


document.addEventListener("DOMContentLoaded", async () => {
    allHeroData = await fetchHeroStats();
    if (allHeroData.length > 0) {
        loadTopPickedHeroes(allHeroData);
        loadTopWinRateHeroes(allHeroData);
    }
});

