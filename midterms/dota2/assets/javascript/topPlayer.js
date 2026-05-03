const topPlayerData = async () => {

    const baseUrl = `https://api.opendota.com/api`;
    const topPlayersUrl = `${baseUrl}/topPlayers`;

    const topPlayersRes = await fetch(topPlayersUrl);

    const topPlayers = await topPlayersRes.json();

    function getTopPlayerData(index) {
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

        const topPlayerAvatar = topPlayers[index].avatarfull;
        const topPlayerName = topPlayers[index].personaname
        const topPlayerMMR = topPlayers[index].computed_mmr;
        const tierValue = topPlayers[index].rank_tier;
        const medalIndex = Math.floor(tierValue / 10);
        const topPlayerRank = rankTierMapping[medalIndex] ? rankTierMapping[medalIndex].name : "Uncalibrated";
        const topPlayerRankIcon = rankIconMapping[medalIndex] ? rankIconMapping[medalIndex].rankImg : "./assets/image/uncalibrated.webp";

        document.getElementById("topPlayersContainer").innerHTML = `
        <div class="card" style="width: 18rem;">
            <img src="${topPlayerAvatar}" class="card-img-top" alt="...">
            <div class="card-body">
                <div>
                    <p class="card-text">
                    Rank: ${index + 1}
                    </p>
                </div>
                <div class="h5 mb-3 text-center">
                Current Rank: 
                </div> 
                <div class="d-flex flex-row"> 
                    <p class="mt-5 me-3"> 
                    ${topPlayerRank} 
                    </p> 
                    <img class="img-fluid w-50" src="${topPlayerRankIcon}"> 
                </div>
                 </div>
        </div>
        
        
        `
    }
    getTopPlayerData(0);

}

topPlayerData();