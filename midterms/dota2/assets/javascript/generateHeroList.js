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
                            <div class="border-bottom border-secondary pb-2 justify-content-center d-flex ">
                                <span class="">
                                    <img src="${attributeIcons[currentAttr].attributeIcon}" class="d-inline-block mb-3" style="width: 2rem">
                                    <h2 class="fw-lighter radiance d-inline-block pb-2" 
                                        style="letter-spacing: 2px; ${headerStyle}">
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
                <div class="card glass-card col-2 m-2" style="width: 12rem; cursor: pointer;" onclick="selectHero(${hero.id})">
                    <div class="card-body">
                        <p class="card-text hero-name-font text-center text-light">${hero.localized_name}</p>
                    </div>
                    <img src="${fullImgUrl}" class="card-img-bottom rounded-4 mb-2" alt="${hero.localized_name}">
                </div>
                `;
            }).join('');

            elHeroListContainer.innerHTML = heroHTML;
        };
        generateHeroList();

    } catch (error) {
        console.error("Error fetching hero data:", error);
    }
}

window.selectHero = function(heroID) {
    localStorage.setItem('lastViewedHeroID', heroID);
    window.location.href = 'hero_showcase.html';
};

generateHero();