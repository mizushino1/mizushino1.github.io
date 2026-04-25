

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


const getPlayerData = async () => {

    if (event) event.preventDefault(); 

    const friendCodeInput = document.getElementById("searchPlayerCode");
    const friendCode = friendCodeInput.value;
    
    console.log("Searching for:", friendCode);

    localStorage.setItem("savedFriendCode", friendCode);


    const profileUrl = `https://api.opendota.com/api/players/${friendCode}`;
    const playerHeroesUrl = `https://api.opendota.com/api/players/${friendCode}/heroes`;
    const heroesUrl = `https://api.opendota.com/api/heroes`;
    const heroStatsUrl = `https://api.opendota.com/api/heroStats`;
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

    function getPlayerHeroID(a) {
        const heroData = playerHeroData[a]
        return this.heroID = heroData.hero_id;
    }

    const playerTop1HeroID = new getPlayerHeroID(0).heroID;
    const playerTop2HeroID = new getPlayerHeroID(1).heroID;
    const playerTop3HeroID = new getPlayerHeroID(2).heroID;

    function getHeroData(a) {
       return heroesData.find(h => h.id === a);
    };

    function getHeroStats(a) {
        return heroStats.find(h => h.id === a);
    };

    const playerTop1HeroStats = getHeroStats(playerTop1HeroID);
    const playerTop2HeroStats = getHeroStats(playerTop2HeroID);
    const playerTop3HeroStats = getHeroStats(playerTop3HeroID);



    const elPlayerName = document.getElementById("playerName");
    elPlayerName.innerHTML =`<h5 class="bg-dark py-2 rounded border border-secondary"> ${playerName} </h5>`;


    const elPlayerRank = document.getElementById("playerRank");
    elPlayerRank.innerHTML =`<div class="h5 mb-3 text-center">Current Rank: </div> <div class="d-flex flex-row"> <p class="mt-5 me-3"> ${playerRank} </p> <img class="img-fluid w-50" src="${playerRankIcon}"> </div>`

    const elPlayerAvatar = document.getElementById("playerAvatar");
    elPlayerAvatar.src = playerAvatar;

    const elPlayerFriendCode = document.getElementById("playerFriendCode");
    elPlayerFriendCode.innerHTML ="<b>Friend Code</b>: " + friendCode;

    const elPlayerTop1HeroImg = document.getElementById("playerTop1HeroImg");
    elPlayerTop1HeroImg.src = baseHeroImgUrl + playerTop1HeroStats.img;

    const elPlayerTop2HeroImg = document.getElementById("playerTop2HeroImg");
    elPlayerTop2HeroImg.src = baseHeroImgUrl + playerTop2HeroStats.img;

    const elPlayerTop3HeroImg = document.getElementById("playerTop3HeroImg");
    elPlayerTop3HeroImg.src = baseHeroImgUrl + playerTop3HeroStats.img;



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