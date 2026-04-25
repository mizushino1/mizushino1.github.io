const heroName = document.getElementById("heroName");



        const getDota2Data = async () => {
            const response = await fetch('https://api.opendota.com/api/heroes');
            const dota2Data = await response.json();

            const targetID = 1;

            const hero = dota2Data.find(hero => hero.id === targetID);
            heroName.innerHTML = hero.name;



        }

        getDota2Data();


