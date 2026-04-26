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

const attributeColors = {
    str: {attributeColor:"background-color:#B9500B"},
    agi: {attributeColor:"background-color:#167C13"},
    int: {attributeColor:"background-color:#257DAE"},
    all: {attributeColor:"background: linear-gradient(to right,#B9500B, #167C13, #257DAE);"}
}


const getPlayerData = async () => {

    if (event) event.preventDefault(); 

    const friendCodeInput = document.getElementById("searchPlayerCode");
    const friendCode = friendCodeInput.value;
    
    console.log("Searching for:", friendCode);

    localStorage.setItem("savedFriendCode", friendCode);

    const baseUrl = `https://api.opendota.com/api`
    const profileUrl = `${baseUrl}/players/${friendCode}`;
    const playerHeroesUrl = `${profileUrl}/heroes`;
    const heroesUrl = `${baseUrl}/heroes`;
    const heroStatsUrl = `${baseUrl}/heroStats`;
    const baseHeroImgUrl = `https://cdn.cloudflare.steamstatic.com`;

    const [profileRes, heroesRes, heroesDataRes, heroStatsRes] = await Promise.all([
        fetch(profileUrl),
        fetch(playerHeroesUrl),
        fetch(heroesUrl),
        fetch(heroStatsUrl)
    ]);

    const playerData = await profileRes.json();
    const playerHeroData = await heroesRes.json();
    const heroesData = await  heroesDataRes.json();
    const heroStats = await heroStatsRes.json();


    const playerName = playerData.profile.personaname;
    const playerAvatar = playerData.profile.avatarfull;
    const tierValue = playerData.rank_tier;
    const medalIndex = Math.floor(tierValue / 10);
    const playerRank = rankTierMapping[medalIndex] ? rankTierMapping[medalIndex].name : "Uncalibrated";
    const playerRankIcon = rankIconMapping[medalIndex] ? rankIconMapping[medalIndex].rankImg : "./assets/image/uncalibrated.webp";

    function getPlayerHeroData(a) {
            this.heroData = playerHeroData[a];
    }

    const playerTop1Hero = new getPlayerHeroData(0).heroData;
    const playerTop2Hero = new getPlayerHeroData(1).heroData;
    const playerTop3Hero = new getPlayerHeroData(2).heroData;

    const playerTop1HeroID = playerTop1Hero.hero_id;
    const playerTop2HeroID = playerTop2Hero.hero_id;
    const playerTop3HeroID = playerTop3Hero.hero_id;

    function getHeroData(a) {
       return heroesData.find(h => h.id === a);
    };

    function getHeroStats(a) {
        return heroStats.find(h => h.id === a);
    };

    function winrate(totalGames, wins) {
        
        if (!totalGames || totalGames === 0) return "0%";
    
        const percent = (wins / totalGames) * 100;
        
        
        return percent.toFixed(2);
    }

    function fillPlayerHeroStats(heroID, index) {
        const playerHeroStats = getHeroStats(heroID);
        const playerHeroData = new getPlayerHeroData(parseInt(index - 1)).heroData;
        const playerHeroID = playerHeroData.hero_id;
        const heroImg = baseHeroImgUrl + playerHeroStats.img;
        const mainWinRate = winrate(playerHeroData.games, playerHeroData.win);
        const withWinRate = winrate(playerHeroData.with_games, playerHeroData.with_win);
        const againstWinRate = winrate(playerHeroData.against_games, playerHeroData.against_win);
        
        const elPlayerHeroStats = document.getElementById(`playerHeroStats${index}`);
        elPlayerHeroStats.innerHTML = `
   
                        <div class="card glass-card mx-auto" style="width: 18rem;" >
                        <img src="${heroImg}" class="card-img-top" alt="..." id="">
                            <div class="card-body" id="">
                            <div class="mb-3 text-center">
                                    <span class="h5 p-1 px-4 text-center mb-3 rounded-3 border border-secondary"
                                        style="${attributeColors[playerHeroStats.primary_attr].attributeColor}">
                                        <b>${getHeroData(playerHeroID).localized_name.toUpperCase()}</b></span>
                                </div>
                                <div class="">
                                    <div class=" text-light">
                                        <p> <b> Matches Played As: </b> ${playerHeroData.games} </p>
                                    </div>
                                    <div class="text-light d-flex flex-row">
                                        <p> <b>Win Rate:</b> </p>
                                        <div class="progress ms-3 align-self-center mb-3 bg-danger border border-secondary" 
                                        style="width: 65%; height:25px"
                                        role="progressbar" 
                                        aria-label="Success example" 
                                        aria-valuenow="${mainWinRate}"
                                        aria-valuemin="0" 
                                        aria-valuemax="100">
                                            <div class="progress-bar bg-success fs-6" style="width: ${mainWinRate +"%"}">
                                                ${mainWinRate +"%"}
                                            </div>
                                        </div>
                                    </div>
                                    <hr class="border-secondary border-1 opacity-75">
                                    <div class="mt-2 text-center">
                                        <button class="btn glass-card text-light fw-bold shadow glass-card-hover"
                                            type="button" data-bs-toggle="collapse"
                                            data-bs-target="#collapseAdditionalStats${index}" aria-expanded="false"
                                            aria-controls="collapseAdditionalStats${index}">
                                            DISPLAY MORE
                                        </button>
                                    </div>
                                </div>
                                <div class="collapse mt-3" id="collapseAdditionalStats${index}">
                                    <hr class="border-secondary border-1 opacity-75">

                                    <div class="">
                                        <p class="fw-bold text-light">Matches Played With: ${playerHeroData.with_games}</p>
                                    </div>

                                    <div class="d-flex flex-row">
                                        <p class="fw-bold text-light">Win Rate:</p>
                                        <div class="progress ms-3 align-self-center mb-3 bg-danger border border-secondary" 
                                        style="width: 65%; height:25px"
                                        role="progressbar" 
                                        aria-label="Success example" 
                                        aria-valuenow="${withWinRate}"
                                        aria-valuemin="0" 
                                        aria-valuemax="100">
                                            <div class="progress-bar bg-success fs-6" style="width: ${withWinRate +"%"}">
                                                ${withWinRate +"%"}
                                            </div>
                                        </div>
                                    </div>

                                    <hr class="border-secondary border-1 opacity-75">

                                    <div class="">
                                        <p class="fw-bold text-light">Matches Played Against:${playerHeroData.against_games}</p>
                                    </div>

                                    <div class="d-flex flex-row">
                                        <p class="fw-bold text-light">Win Rate:</p>
                                        <div class="progress ms-3 align-self-center mb-3 bg-danger border border-secondary" 
                                        style="width: 65%; height:25px"
                                        role="progressbar" 
                                        aria-label="Success example" 
                                        aria-valuenow="${againstWinRate}"
                                        aria-valuemin="0" 
                                        aria-valuemax="100">
                                            <div class="progress-bar bg-success fs-6" style="width: ${againstWinRate +"%"}">
                                                ${againstWinRate +"%"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
`

    }


    const elPlayerName = document.getElementById("playerName");
    elPlayerName.innerHTML =`<h5 class="bg-dark py-2 rounded border border-secondary"> ${playerName} </h5>`;


    const elPlayerRank = document.getElementById("playerRank");
    elPlayerRank.innerHTML =`<div class="h5 mb-3 text-center">Current Rank: </div> <div class="d-flex flex-row"> <p class="mt-5 me-3"> ${playerRank} </p> <img class="img-fluid w-50" src="${playerRankIcon}"> </div>`

    const elPlayerAvatar = document.getElementById("playerAvatar");
    elPlayerAvatar.src = playerAvatar;

    const elPlayerFriendCode = document.getElementById("playerFriendCode");
    elPlayerFriendCode.innerHTML ="<b>Friend Code</b>: " + friendCode;


    fillPlayerHeroStats(playerTop1HeroID,1);
    fillPlayerHeroStats(playerTop2HeroID,2);
    fillPlayerHeroStats(playerTop3HeroID,3);

 



};


window.onload = () => {
    const lastCode = localStorage.getItem("savedFriendCode");
    if (lastCode) {
        // Put the code back in the input box
        document.getElementById("searchPlayerCode").value = lastCode;
        // Run the search automatically
        getPlayerData();
    }
};