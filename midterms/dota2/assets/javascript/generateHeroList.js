const baseHeroAssetsUrl = `https://cdn.cloudflare.steamstatic.com`;



const generateHero = async () => {
    const attributeColors = {
        str: { attributeColor: "rgba(185, 80, 11)" },
        agi: { attributeColor: "rgba(22, 124, 19)" },
        int: { attributeColor: "rgba(37, 125, 174)" },
        all: { attributeColor: "linear-gradient(to right, rgba(185, 80, 114), rgba(22, 124, 19), rgba(37, 125, 174))" }
    };

    const attributeIcons = {
        str: { attributeIcon: `./assets/image/stricon.webp` },
        agi: { attributeIcon: `./assets/image/agiicon.webp` },
        int: { attributeIcon: `./assets/image/inticon.webp` },
        all: { attributeIcon: `./assets/image/uniicon.webp` }
    };

    const baseUrl = `https://api.opendota.com/api`;
    const heroStatsUrl = `${baseUrl}/heroStats`;

    document.getElementById('heroListContainer').innerHTML = `
        <div id="heroLoadingSpinner" class="col-12 d-flex flex-column align-items-center justify-content-center py-5" style="min-height: 300px;">
            <div class="spinner-border text-danger mb-3" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-secondary radiance" style="letter-spacing: 2px;">LOADING HEROES...</p>
        </div>
    `;

    try {
        const response = await fetch(heroStatsUrl);
        const heroStats = await response.json();



        const generateHeroList = () => {
            const elHeroListContainer = document.getElementById("heroListContainer");

            const attrOrder = { "str": 1, "agi": 2, "int": 3, "all": 4 };
            const attrNames = { "str": "STRENGTH", "agi": "AGILITY", "int": "INTELLIGENCE", "all": "UNIVERSAL" };

            const sortedHeroes = [...heroStats].sort((a, b) => {
                if (attrOrder[a.primary_attr] !== attrOrder[b.primary_attr]) {
                    return attrOrder[a.primary_attr] - attrOrder[b.primary_attr];
                }
                return a.localized_name.localeCompare(b.localized_name);
            });

            let currentAttr = null;

            const heroHTML = sortedHeroes.map(hero => {
                let header = '';


                if (hero.primary_attr !== currentAttr) {
                    currentAttr = hero.primary_attr;
                    const styleData = attributeColors[currentAttr].attributeColor;


                    const isGradient = styleData.includes("linear-gradient");
                    const headerStyle = isGradient
                        ? `background: ${styleData}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;`
                        : `color: ${styleData};`;

                    header = `
                        <div class="col-12 mt-5 mb-3">
                            <div class="border-bottom border-secondary pb-2 d-flex" >
                                <span class="">
                                    <img src="${attributeIcons[currentAttr].attributeIcon}" class="d-inline-block mb-2" style="width: 2rem">
                                    <h2 class="fw-bold fs-5 text-light radiance d-inline-block pb-2" 
                                        style="letter-spacing: 2px;">
                                        ${attrNames[currentAttr]}
                                    </h2>
                                </span> 
                           </div> 
                        </div>
                    `;
                }



                const fullImgUrl = `${baseHeroAssetsUrl}${hero.img}`;

                return `
                ${header}
                <div class="col-4 col-md-3 col-xl-2 mb-2">
                <div class="scale-hero-list h-100 position-relative hero-card" data-attr="${hero.primary_attr}" style="cursor: pointer;" onclick="selectHero(${hero.id})">
    <img src="${fullImgUrl}" class="img-fluid w-100" alt="${hero.localized_name}" style="box-shadow: 0 15px 30px 5px rgba(0, 0, 0, 0.7); display: block;">
    <p class="card-text fw-bold hero-name-font fs-fluid-xs m-0 hero-label text-center text-lg-start" 
   style="position: absolute; bottom: 0; left: 0; right: 0; padding: 4px 8px; color:white !important">
    ${hero.localized_name}
</p>
</div>
                </div>
                `;
            }).join('');

            elHeroListContainer.innerHTML = heroHTML;
        };
        generateHeroList();
        const dataList = document.getElementById('heroList');
        heroStats.forEach(hero => {
            const option = document.createElement('option');
            option.value = hero.localized_name;
            dataList.appendChild(option);
        });

        function applyFilters() {
            const searchTerm = document.getElementById('heroSearchInput').value.trim().toLowerCase();
            const attrValue = document.getElementById('attrFilter').value;

            const children = document.querySelectorAll('#heroListContainer > *');
            let lastHeader = null;
            let visibleInSection = 0;

            children.forEach(el => {

                if (el.classList.contains('col-12')) {

                    if (lastHeader) {
                        lastHeader.style.display = visibleInSection > 0 ? '' : 'none';
                    }
                    lastHeader = el;
                    visibleInSection = 0;
                    return;
                }

                const existing = document.getElementById('noHeroesMsg');
                if (existing) existing.remove();

                // Check if any hero cards are visible
                const visibleHeroes = document.querySelectorAll('#heroListContainer > *:not(.col-12)[style=""]').length
                    + document.querySelectorAll('#heroListContainer > *:not(.col-12):not([style])').length;

                if (visibleHeroes === 0) {
                    const msg = document.createElement('div');
                    msg.id = 'noHeroesMsg';
                    msg.className = 'col-12 text-center text-light py-5';
                    msg.innerHTML = `
        <p class="cinzel fs-4">NO HEROES FOUND</p>
        <p class="gentium grey">"${document.getElementById('heroSearchInput').value.trim()}" did not match any hero.</p>
    `;
                    document.getElementById('heroListContainer').appendChild(msg);
                }


                const heroName = el.querySelector('.hero-name-font')?.textContent?.toLowerCase() || '';
                const card = el.querySelector('.card, .hero-card');
                const heroAttr = card?.getAttribute('data-attr') || '';

                const matchesSearch = !searchTerm || heroName.includes(searchTerm);
                const matchesAttr = !attrValue || heroAttr === attrValue;

                if (matchesSearch && matchesAttr) {
                    el.style.display = '';
                    visibleInSection++;
                } else {
                    el.style.display = 'none';
                }
            });

            // Handle the last header
            if (lastHeader) {
                lastHeader.style.display = visibleInSection > 0 ? '' : 'none';
            }
        }

        document.querySelectorAll('.searchBtnHero').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById('heroSearchInput');
                const searchTerm = input.value.trim().toLowerCase();

                if (!searchTerm) {
                    showHeroNotFoundModal("Please enter a hero name to search.");
                    return;
                }

                const exactMatch = heroStats.find(h => h.localized_name.toLowerCase() === searchTerm);
                if (exactMatch) {
                    window.selectHero(exactMatch.id);
                    return;
                }

                applyFilters();

                const visibleHeroes = document.querySelectorAll('#heroListContainer > *:not(.col-12):not([style*="none"])').length;
                if (visibleHeroes === 0) {
                    showHeroNotFoundModal("Please check the spelling and try again.");
                }
            });
        });

        document.getElementById('heroSearchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.querySelector('.searchBtnHero').click();
        });

        document.getElementById('heroSearchInput').addEventListener('input', () => applyFilters());
        document.getElementById('attrFilter').addEventListener('change', () => applyFilters());

    } catch (error) {
        document.getElementById('heroListContainer').innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger radiance fs-5" style="letter-spacing: 2px;">FAILED TO LOAD HEROES</p>
                <p class="text-secondary gentium">Could not connect to the API. Please try again later.</p>
            </div>
        `;
        console.error("Error fetching hero data:", error);
    }


}

document.getElementById('attrFilter').addEventListener('change', function () {
    const styles = {
        '': { background: '', color: '#ffffff' },
        'str': { color: 'rgba(255, 140, 80)' },
        'agi': { color: 'rgba(80, 200, 80)' },
        'int': { color: 'rgba(80, 160, 255)' },
        'all': { background: 'linear-gradient(to right, rgba(185, 80, 11, 0.4), rgba(22, 124, 19, 0.4), rgba(37, 125, 174, 0.4))', color: '#ffffff' },
    };

    const selected = styles[this.value];
    this.setAttribute('style', `background: ${selected.background}; color: ${selected.color} !important;`);

    applyFilters();

    applyFilters();
});

window.selectHero = function (heroID) {
    localStorage.setItem('lastViewedHeroID', heroID);
    window.location.href = 'hero_showcase.html';
};

document.querySelectorAll('.attr-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const attr = btn.dataset.attr;
        const attrFilter = document.getElementById('attrFilter');
        const isAlreadyActive = btn.classList.contains('active-attr');

        if (isAlreadyActive) {
            // Deselect — show all
            btn.classList.remove('active-attr');
            attrFilter.value = '';
        } else {
            // Deselect all others, select this one
            document.querySelectorAll('.attr-icon-btn').forEach(b => b.classList.remove('active-attr'));
            btn.classList.add('active-attr');
            attrFilter.value = attr;
        }

        attrFilter.dispatchEvent(new Event('change'));
    });
});


generateHero();