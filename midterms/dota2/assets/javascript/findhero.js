const heroName = document.getElementById("heroName");



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

    const heroesData = await heroesDataRes.json();
    const heroStats = await heroStatsRes.json();
    const heroAbilities = await heroAbilitiesRes.json();
    const abilities = await abilitiesRes.json();



}

getDota2Data();


