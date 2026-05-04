const baseHeroAssetsUrl = `https://cdn.cloudflare.steamstatic.com`;
const attributeIcons = {
    str: { attributeIcon: `./assets/image/stricon.webp` },
    agi: { attributeIcon: `./assets/image/agiicon.webp` },
    int: { attributeIcon: `./assets/image/inticon.webp` },
    all: { attributeIcon: `./assets/image/uniicon.webp` }
};

const bkbPierceLookup = {
    yes: "text-success",
    no: "text-danger"
};

const dispellableLookup = {
    yes: "text-success",
    strongdispelsonly: "text-warning",
    no: "text-danger"
};

const damageTypeLookup = {
    magical: "text-primary",
    pure: "text-warning",
    physical: "text-danger"
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
    let currentHeroID = 1;

    try {
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
                .filter(name => name !== "generic_hidden")
                .map(name => {
                    const detail = abilitiesDetails[name] || {};

                    // Helper for attributes (damage, range, etc.)
                    const formatAttrib = (key) => {
                        const val = detail.attrib?.find(a => a.key === key)?.value;
                        if (val === undefined || val === null) return "0";
                        return Array.isArray(val) ? val.join("/") : val;
                    };

                    // Helper for simple strings that might accidentally be arrays (like Lich's BKB pierce)
                    const formatString = (val) => {
                        if (!val) return "no";
                        // If it's an array, take the first element; otherwise use the value
                        const str = Array.isArray(val) ? val[0] : val;
                        return String(str).toLowerCase();
                    };

                    return {
                        id: name,
                        dname: detail.dname || "Ability",
                        icon: `${baseHeroAssetsUrl}/apps/dota2/images/dota_react/abilities/${name}.png`,
                        desc: detail.desc,
                        mc: Array.isArray(detail.mc) ? detail.mc.join("/") : detail.mc,
                        cd: Array.isArray(detail.cd) ? detail.cd.join("/") : detail.cd,
                        attributes: (detail.attrib || []).map(a => ({
                            header: a.header,
                            value: Array.isArray(a.value) ? a.value.join("/") : a.value,
                            key: a.key,
                            generated: a.generated // useful if you want to hide internal values
                        })),

                        // Updated with formatString helper to prevent the Lich error
                        bkb_pierce: formatString(detail.bkbpierce),
                        dispellable: formatString(detail.dispellable),
                        dispellableColor: formatString(detail.dispellable).replaceAll(' ', ''),
                        dmg_type: formatString(detail.dmg_type),
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



        function toSentenceCase(str) {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }

        function renderHeroSkills(targetID) {
            const profile = getFullHeroProfile(targetID);
            const container = document.getElementById('skillContainer');

            if (!profile) return;

            // Generate the HTML for all skills
            container.innerHTML = profile.skills.map(skill => `
       <div class="row g-0 overflow-hidden glass-card me-3 mb-3">
    <div class="col-12">
        <div class="row g-0"> 
            
            
            <div class="skill-wrapper mt-4 col-5 mx-auto mb-4 col-md-2" data-bs-toggle="tooltip" title="${skill.dname}">
                <img src="${skill.icon}" 
                    alt="${skill.dname}" 
                    class="img-fluid rounded-4 border border-secondary shadow w-100"
                    style="object-fit: cover;"
                    onerror="this.src='./assets/image/defaultSkillIcon.webp'">
            </div>

            <!-- Content Column: Remove 'ms-4'. Use 'px-3' for mobile and 'ps-md-4' for desktop -->
            <div class="col-12 col-md-9 text-light mt-4 mb-5 px-3 ps-md-4">
                
                <h4 class="cinzel text-light text-uppercase mb-2 text-center text-md-start">${skill.dname}</h4>
                
                
                <div class="gentium shadow glass-card p-4 mx-2 mx-md-0" 
                     style="background: rgba(0, 0, 0, 0.5) !important;">
                    <p class="mb-0">${skill.desc}</p>
                </div>
            </div>
            
        </div>
    </div>
</div>
            <div class="row g-0">
            
            <div class="ms-5 mb-4 gentium fs-6 col-12 col-lg-4 col-xl-3 justify-content-center border-end">
                <div>
                    <p class="d-inline-block grey">Pierces Spell Immunity:</p>
                    <p class="d-inline-block ${bkbPierceLookup[skill.bkb_pierce]}">${toSentenceCase(skill.bkb_pierce)}</p>
                </div>
                <div>
                    <p class="d-inline-block grey">Dispellable:</p>
                    <p class="d-inline-block ${dispellableLookup[skill.dispellableColor]}">${toSentenceCase(skill.dispellable)}</p>
                </div>
                ${skill.dmg_type !== "no" ? `
                <div>
                    <p class="d-inline-block grey">Damage Type:</p>
                    <p class="d-inline-block ${damageTypeLookup[skill.dmg_type]}">${toSentenceCase(skill.dmg_type)}</p>
                </div>
                ` : ''}
                ${skill.mc ? `
                    <div class="attr-row d-flex align-items-center mb-1">
                        <img src="./assets/image/ability-manacost-icon.webp" style="width:20px;" class="me-2">
                        <p class="text-info mb-0">${skill.mc}</p>
                    </div>
                ` : ''}
            
                <!-- 2. Cooldown Row -->
                ${skill.cd ? `
                    <div class="attr-row d-flex align-items-center mb-1 mt-2">
                        <img src="./assets/image/ability-cooldown-icon.webp" style="width: 20px;" class="me-2">
                        <p class="text-white mb-0">${skill.cd}</p>
                    </div>
                ` : ''}
            </div>

            <hr class="border-secondary border-1 opacity-75 d-lg-none g-0 me-5">

            
            <div class="ms-5 mb-4 gentium fs-6 col-12 col-lg-6 col-xl-7 justify-content-center">
    ${skill.attributes.map(attr => {
                // Only render if value exists, isn't 0, and has a header
                if (!attr.value || attr.value === "0" || attr.value === "0%" || !attr.header) return '';

                return `
            <div class="attr-row">
                <p class="d-inline-block grey mb-1" style="font-size:12px">${attr.header.trim()}</p>
                <p class="d-inline-block mb-1 ${attr.key.includes('damage') ? damageTypeLookup[skill.dmg_type] : 'text-white'}"style="font-size:12px">
                    ${attr.value}
                </p>
            </div>
        `;
            }).join('')}
</div>
        </div>
    </div>
    <hr class="border-secondary border-3 border-danger opacity-100 g-0 me-3">
`).join('');

        }


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
                baseAttackTime: hero.base_attack_time
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

        function setupSearchAutocomplete(heroes) {

            const dataList = document.getElementById('heroList');

            dataList.innerHTML = ''; // Clear existing



            heroes.forEach(hero => {

                const option = document.createElement('option');

                option.value = hero.localized_name;

                dataList.appendChild(option);

            });

        }

        // 1. Populate the Datalist so users see suggestions
        function updateHeroDisplay(hero) {
            if (!hero) return;

            // Update global ID and Persistence
            currentHeroID = hero.id;
            localStorage.setItem('lastViewedHeroID', currentHeroID);

            const profile = getFullHeroProfile(currentHeroID);

            // Update Image and Name
            document.getElementById("currentHeroImage").src = `${baseHeroAssetsUrl}${hero.img}`;

            const elCurrentHeroName = document.getElementById("currentHeroName");
            elCurrentHeroName.innerHTML = profile.localized_name;

            // Apply Styles
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
            container.innerHTML = renderHeroStats(hero);
            renderHeroSkills(currentHeroID);
        }

        function initializeApp(heroStats) {
            setupSearchAutocomplete(heroStats);

            // Check localStorage for the last viewed hero
            const savedHeroID = localStorage.getItem('lastViewedHeroID');

            if (savedHeroID) {
                const lastHero = heroStats.find(h => h.id == savedHeroID);
                if (lastHero) {
                    updateHeroDisplay(lastHero);
                }
            } else {
                // Optional: Load a default hero (e.g., Anti-Mage) if no history exists
                updateHeroDisplay(heroStats[0]);
            }
        }

        document.getElementById('searchBtn').addEventListener('click', () => {
            const input = document.getElementById('heroSearchInput');
            const searchTerm = input.value.trim().toLowerCase();
        
            const foundHero = heroStats.find(h => h.localized_name.toLowerCase() === searchTerm);
        
            if (foundHero) {
                updateHeroDisplay(foundHero);
                input.value = "";
            } else {
                showHeroNotFoundModal();
            }
        });

        document.getElementById('heroSearchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('searchBtn').click();
        });


        const spinner = document.getElementById('heroDataSpinner');
        const container = document.getElementById('heroProfile');
        if (spinner) spinner.style.cssText = 'display: none !important';
        if (container) container.style.display = '';
        initializeApp(heroStats);
    } catch (error) {
        document.getElementById('heroDataSpinner').innerHTML = `
            <p class="text-danger radiance fs-5" style="letter-spacing: 2px;">FAILED TO LOAD HERO DATA</p>
            <p class="text-secondary gentium">Could not connect to the API. Please try again later.</p>
        `;
        console.error("Error fetching hero data:", error);
    }
};
const path = window.location.pathname;

if (path.endsWith("hero_showcase.html") || path === "/" || path.endsWith("/")) {
    getDota2Data();
}



