const baseHeroAssetsUrl = `https://cdn.cloudflare.steamstatic.com`;
const attributeIcons = {
    str: { attributeIcon: `./assets/image/stricon.webp` },
    agi: { attributeIcon: `./assets/image/agiicon.webp` },
    int: { attributeIcon: `./assets/image/inticon.webp` },
    all: { attributeIcon: `./assets/image/uniicon.webp` }
};


const roleIcons = {
    Carry: `./assets/image/roles/carryIcon.webp`,
    Escape: `./assets/image/roles/escapeIcon.webp`,
    Nuker: `./assets/image/roles/nukerIcon.webp`,
    Support: `./assets/image/roles/supportIcon.webp`,
    Disabler: `./assets/image/roles/disablerIcon.webp`,
    Jungler: `./assets/image/roles/junglerIcon.webp`,
    Durable: `./assets/image/roles/durableIcon.webp`,
    Pusher: `./assets/image/roles/pusherIcon.webp`,
    Initiator: `./assets/image/roles/initiatorIcon.webp`
};

const getDota2Data = async () => {
    const baseUrl = `https://api.opendota.com/api`;
    const heroesUrl = `${baseUrl}/heroes`;
    const heroStatsUrl = `${baseUrl}/heroStats`;
    const heroAbilitiesUrl = `${baseUrl}/constants/hero_abilities`;
    const abilitiesUrl = `${baseUrl}/constants/abilities`;

    const [heroesDataRes, heroStatsRes, heroAbilitiesRes, abilitiesRes] = await Promise.all([
        fetch(heroesUrl),
        fetch(heroStatsUrl),
        fetch(heroAbilitiesUrl),
        fetch(abilitiesUrl)
    ]);


    let currentHeroID = 1;

    const heroesData = await heroesDataRes.json();
    const heroStats = await heroStatsRes.json();
    const heroAbilities = await heroAbilitiesRes.json();
    const abilitiesDetails = await abilitiesRes.json();
    const getSkillIconUrl = (abilityName) => {
        return `${baseHeroAssetsUrl}/apps/dota2/images/dota_react/abilities/${abilityName}.png`;
    };

    function getHeroStats(a) {
        return heroStats.find(h => h.id === a);
    };

    function getHero(a) {
        return heroesData.find(h => h.id === a);
    };

    function getFullHeroProfile(targetID) {
        const hero = getHero(targetID);
        if (!hero) return null;

        // Get skills from hero_abilities constant (using internal NPC name)
        const skillNames = heroAbilities[hero.name]?.abilities || [];

        // Map skills to details and CDN icons
        const skills = skillNames
        .filter(name => name !== "generic_hidden") // Strictly removes the hidden slots
        .map(name => {
            const detail = abilitiesDetails[name] || {};
            return {
                id: name,
                dname: detail.dname || "Ability",
                icon: `${baseHeroAssetsUrl}/apps/dota2/images/dota_react/abilities/${name}.png`,
                desc: detail.desc,
                mc: detail.mc,
                cd: detail.cd
            };
        });

        // Return the combined object with pre-mapped stat icons
        return {
            ...hero,
            skills: skills,
            // Add roles here so they are part of the profile
            roleDetails: hero.roles.map(role => ({
                name: role,
                icon: roleIcons[role] || `./assets/image/roles/default.webp`
            })),
            // Helper icons for your UI
            icons: {
                primaryAttr: `${baseHeroAssetsUrl}/apps/dota2/images/dota_react/icons/hero_${hero.primary_attr === 'str' ? 'strength' :
                    hero.primary_attr === 'agi' ? 'agility' :
                        hero.primary_attr === 'int' ? 'intelligence' : 'universal'
                    }.png`
            }
        };
    }

    function renderHeroSkills(targetID) {
        const profile = getFullHeroProfile(targetID);
        const container = document.getElementById('skillContainer');

        if (!profile) return;

        // Generate the HTML for all skills
        const skillsHTML = profile.skills.map(skill => `
        <div class="row g-0 overflow-hidden glass-card me-3 mb-3">
            <div class="col">
                <div class="row">
            
                    <div class="skill-wrapper mt-4 col-3 col-md-2" data-bs-toggle="tooltip" title="${skill.dname}">
                        <img src="${skill.icon}" 
                            alt="${skill.dname}" 
                            class="img-fluid rounded-4 rounded-1 ms-3 border border-secondary shadow w-100"
                            style="object-fit: cover;"
                            onerror="this.src='./assets/image/defaultSkillIcon.webp'">.
                    </div>
                    <div class="col-8 col-md-9 text-light ms-4 mt-4 mb-5 glass-card" style="">
                        <h4 class="row ms-4 cinzel text-light">${skill.dname}</h4>
                        <p class=" row ms-4 gentium shadow glass-card p-4 me-md-4 me-0" style="background: rgba(0, 0, 0, 0.5) !important;">${skill.desc}</p>
                    </div>
                </div>
            </div>
        </div>
        `).join('');

        container.innerHTML = skillsHTML;
    }

    renderHeroSkills(currentHeroID);

    function renderHeroStats(hero) {
        const stats = {
            str: `${hero.base_str} + ${hero.str_gain}`,
            agi: `${hero.base_agi} + ${hero.agi_gain}`,
            int: `${hero.base_int} + ${hero.int_gain}`,
            damage: `${hero.base_attack_min} - ${hero.base_attack_max}`,
            armor: hero.base_armor,
            attackRate: hero.attack_rate,
            range: hero.attack_range,
            moveSpeed: hero.move_speed,
            baseAttackTime: hero.base_attack_time // Often 1.7 or 1.4
        };

        return `

            <div class="col-5 col-lg-4 border-end border-secondary" id="attributeStats">
                <div class="mb-0">
                    <p class="d-block radiance grey mb-0" style="font-size: 10px;">Strength</p>
                    <img src="assets/image/stricon.webp" class="d-inline-block">
                    <p class="d-inline-block ms-2 fw-bold radiance text-light" style="font-size: 13px;">${stats.str}</p>
                </div>
                <div class="mb-0">
                    <p class="d-block radiance grey mb-0" style="font-size: 10px;">Agility</p>
                    <img src="assets/image/agiicon.webp" class="d-inline-block">
                    <p class="d-inline-block ms-2 fw-bold radiance text-light" style="font-size: 13px;">${stats.agi}</p>
                </div>
                <div class="mb-0">
                    <p class="d-block radiance grey mb-0" style="font-size: 10px;">Intelligence</p>
                    <img src="assets/image/inticon.webp" class="d-inline-block">
                    <p class="d-inline-block ms-2 fw-bold radiance text-light" style="font-size: 13px;">${stats.int}</p>
                </div>
            </div>
    
            <div class="col-4 col-lg-4 col-xl-4">
                <div class="mb-0">
                    <p class="d-block radiance grey mb-0" style="font-size: 10px;">Attack Damage</p>
                    <p class="d-inline-block ms-2 fw-bold radiance text-light" style="font-size: 13px;">${stats.damage}</p>
                </div>
                <div class="mb-0">
                    <p class="d-block radiance grey mb-0" style="font-size: 10px;">Armor</p>
                    <p class="d-inline-block ms-2 fw-bold radiance text-light" style="font-size: 13px;">${stats.armor}</p>
                </div>
                <div class="mb-0">
                    <p class="d-block radiance grey mb-0" style="font-size: 10px;">Attack Rate</p>
                    <p class="d-inline-block ms-2 fw-bold radiance text-light" style="font-size: 13px;">${stats.attackRate}</p>
                </div>
            </div>
    
            <div class="col-3 col-lg-4 col-xl-3">
                <div class="mb-0">
                    <p class="d-block radiance grey mb-0" style="font-size: 10px;">Attack Range</p>
                    <p class="d-inline-block ms-2 fw-bold radiance text-light" style="font-size: 13px;">${stats.range}</p>
                </div>
                <div class="mb-0">
                    <p class="d-block radiance grey mb-0" style="font-size: 10px;">Move Speed</p>
                    <p class="d-inline-block ms-2 fw-bold radiance text-light" style="font-size: 13px;">${stats.moveSpeed}</p>
                </div>
                <div class="mb-0">
                    <p class="d-block radiance grey mb-0" style="font-size: 10px;">Attack Time</p>
                    <p class="d-inline-block ms-2 fw-bold radiance text-light" style="font-size: 13px;">${stats.baseAttackTime}</p>
                </div>
            </div>`;
    }

    const profile = getFullHeroProfile(currentHeroID);
    const currentHero = getHero(currentHeroID);
    const currentHeroStats = getHeroStats(currentHeroID);
    const currentHeroImage = baseHeroAssetsUrl + currentHeroStats.img;
    const currentHeroName = currentHero.localized_name;
    const currentHeroAttr = currentHeroStats.primary_attr
    const attrColor = attributeColors[currentHeroAttr].attributeColor;
    const attrIcon = attributeIcons[currentHeroAttr].attributeIcon;

    const elHeroStats = document.getElementById("heroStats");
    elHeroStats.innerHTML = renderHeroStats(currentHeroStats);




    const elCurrentHeroImage = document.getElementById("currentHeroImage");
    elCurrentHeroImage.src = currentHeroImage;

    const elCurrentHeroName = document.getElementById("currentHeroName");
    elCurrentHeroName.innerHTML = currentHeroName;

    const heroStyle = elCurrentHeroName.style;

    const roleHtml = profile.roleDetails.map(role => `
        <div class="role-item d-inline-block mt-2">
            <img src="${role.icon}" width="25" style="filter: invert(100%);">
        </div>
    `).join('');

    const elAttributePrimary = document.getElementById("attributePrimary")
    elAttributePrimary.innerHTML = `
    <span class="d-block">
    <p class="d-inline-block radiance me-2 grey mb-0" style="font-size: 15px;">
     Primary Attribute </p>
    <img class="mb-2 mt-2" style="width:25px" src="${profile.icons.primaryAttr}"> 
    </span>

    `

    const elHeroRoles = document.getElementById("heroRoles")
    elHeroRoles.innerHTML = `
    <span class="d-block"><p class="d-inline-block mt-2 me-2" style="font-size:15px">Roles: </p> ${roleHtml}</span>`



    heroStyle.backdropFilter = "blur(10px)";
    heroStyle.webkitBackdropFilter = "blur(10px)"; // For Safari support
    heroStyle.background = attrColor;
    heroStyle.border = "2px solid rgba(255, 255, 255, 0.1)";
    heroStyle.borderRadius = "8px";
    heroStyle.padding = "4px 16px";



    // 1. Populate the Datalist so users see suggestions
    function setupSearchAutocomplete(heroes) {
        const dataList = document.getElementById('heroList');
        dataList.innerHTML = ''; // Clear existing

        heroes.forEach(hero => {
            const option = document.createElement('option');
            option.value = hero.localized_name;
            dataList.appendChild(option);
        });
    }

    document.getElementById('searchBtn').addEventListener('click', () => {
        const input = document.getElementById('heroSearchInput');
        const searchTerm = input.value.trim();

        const foundHero = heroStats.find(h =>
            h.localized_name.toLowerCase() === searchTerm.toLowerCase()
        );

        if (foundHero) {
            currentHeroID = foundHero.id;

            // 1. Get the full profile data for the new hero
            const profile = getFullHeroProfile(currentHeroID);

            // 2. Update Image and Name
            const elCurrentHeroImage = document.getElementById("currentHeroImage");
            elCurrentHeroImage.src = `${baseHeroAssetsUrl}${foundHero.img}`;

            const elCurrentHeroName = document.getElementById("currentHeroName");
            elCurrentHeroName.innerHTML = profile.localized_name;

            // 3. APPLY STYLES (Background, Blur, and Attribute Color)
            // Ensure you have your attributeColors mapping available
            const currentHeroAttr = profile.primary_attr;
            const attrColor = attributeColors[currentHeroAttr].attributeColor;

            const heroStyle = elCurrentHeroName.style;
            heroStyle.backdropFilter = "blur(10px)";
            heroStyle.webkitBackdropFilter = "blur(10px)";
            heroStyle.background = attrColor;
            heroStyle.border = "2px solid rgba(255, 255, 255, 0.1)";
            heroStyle.borderRadius = "8px";
            heroStyle.padding = "4px 16px";

            // 4. Update Primary Attribute HTML
            const elAttributePrimary = document.getElementById("attributePrimary");
            elAttributePrimary.innerHTML = `
            <span class="d-block">
                <p class="d-inline-block radiance me-2 grey mb-0" style="font-size: 15px;">
                Primary Attribute </p>
                <img class="mb-2 mt-2" style="width:25px" src="${profile.icons.primaryAttr}"> 
            </span>
        `;

            // 5. Update Roles HTML (Generating the icons list)
            const roleHtml = profile.roleDetails.map(role => `
            <div class="role-item d-inline-block mt-2">
                <img src="${role.icon}" width="25" style="filter: invert(100%);">
            </div>
        `).join('');

            const elHeroRoles = document.getElementById("heroRoles");
            elHeroRoles.innerHTML = `
            <span class="d-block">
                <p class="d-inline-block mt-2 me-2" style="font-size:15px">Roles: </p> 
                ${roleHtml}
            </span>
        `;

            // 6. Final Render for the stats table/area
            const container = document.getElementById('heroStatsContainer') || document.getElementById('heroStats');
            container.innerHTML = renderHeroStats(foundHero);

            input.value = "";
        } else {
            alert("Hero not found. Please check the spelling.");
        }

        renderHeroSkills(currentHeroID);
    });

    // Initialization (Call this after you fetch your heroStats)
    setupSearchAutocomplete(heroStats);


}

getDota2Data();


