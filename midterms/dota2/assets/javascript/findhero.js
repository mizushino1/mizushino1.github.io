const attributeIcons = {
    str: { attributeIcon: `./assets/image/stricon.webp`},   
    agi: { attributeIcon: `./assets/image/agiicon.webp`},    
    int: { attributeIcon: `./assets/image/inticon.webp`},  
    all: { attributeIcon: `./assets/image/uniicon.webp` }
};


const getDota2Data = async () => {
    const baseUrl = `https://api.opendota.com/api`;
    const heroesUrl = `${baseUrl}/heroes`;
    const heroStatsUrl = `${baseUrl}/heroStats`;
    const heroAbilitiesUrl = `${baseUrl}/constants/hero_abilities`;
    const abilitiesUrl = `${baseUrl}/constants/abilities`;
    const baseHeroAssetsUrl = `https://cdn.cloudflare.steamstatic.com`;

    const [heroesDataRes, heroStatsRes, heroAbilitiesRes, abilitiesRes] = await Promise.all([
        fetch(heroesUrl),
        fetch(heroStatsUrl),
        fetch(heroAbilitiesUrl),
        fetch(abilitiesUrl)
    ]);

    

    const heroID = 1;

    const heroesData = await heroesDataRes.json();
    const heroStats = await heroStatsRes.json();
    const heroAbilities = await heroAbilitiesRes.json();
    const abilities = await abilitiesRes.json();

    function getHeroStats(a) {
        return heroStats.find(h => h.id === a);
    };

    function getHero(a) {
        return heroesData.find(h => h.id === a);
    };

    const currentHero = getHero(heroID);
    const currentHeroStats = getHeroStats(heroID);
    const currentHeroImage = baseHeroAssetsUrl + currentHeroStats.img;
    const currentHeroName = currentHero.localized_name;
    const currentHeroAttr = currentHeroStats.primary_attr
    const attrColor = attributeColors[currentHeroAttr].attributeColor;
    const attrIcon = attributeIcons[currentHeroAttr].attributeIcon;


    const elCurrentHeroImage = document.getElementById("currentHeroImage");
    elCurrentHeroImage.src = currentHeroImage;

    const elCurrentHeroName = document.getElementById("currentHeroName");
    elCurrentHeroName.innerHTML = currentHeroName;

    const heroStyle = elCurrentHeroName.style;

    const elCurrentHeroAttribute = document.getElementById("attribute");
    elCurrentHeroAttribute.innerHTML = `<p class="ms-1 d-inline">Primary Attribute:</p><p class="d-inline"> ${currentHeroAttr.toUpperCase()}</p> <img src="${attrIcon}">`
    
    
    heroStyle.backdropFilter = "blur(10px)";
    heroStyle.webkitBackdropFilter = "blur(10px)"; // For Safari support
    heroStyle.background = attrColor;
    heroStyle.border = "2px solid rgba(255, 255, 255, 0.1)";
    heroStyle.borderRadius = "8px";
    heroStyle.padding = "4px 16px";


}

getDota2Data();


