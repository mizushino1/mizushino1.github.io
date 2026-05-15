
import { Octokit } from "https://esm.sh/octokit";

/*

for web = import { Octokit } from "https://esm.sh/octokit";

for node.js = import { Octokit } from "octokit";

how to use:
- you can either get the github logo from this repo or get your own or whatever
- if you are using a seperate javscript file, in your html add a script element like <script type="module" src="THIS FILE NAME"></script>
  - then in the javascript file just paste everything from here and in the function call just change the argument to whatever your github username is
  - in your html file make sure to use bootstrap and have an element with id ="githubCard" and class="row"
  - read other comments below

  
*/

const octokit = new Octokit();


async function getGithubUser(username) {
  try {
    const { data } = await octokit.request('GET /users/{username}', {
      username: username,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return data;
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error.status);
    return null
  }

}
//data = github data as json


async function createGithubCard(username) {
  const data = await getGithubUser(username);

  if (!data) return;

  const githubCard = document.getElementById("githubCard");

// Read the html comment inside 
  githubCard.innerHTML = `
    <div class="col-2 my-auto pe-0">
      <a href="${data.html_url}">
        <img class="invert-on-light d-inline-block icon"
        <!--Replace this of the path on wherever you have your github logo png-->
         src="./assets/images/gitLogo.png" 
        <!--  -->
         alt="GitHub Logo">
      </a>
    </div>
    <div class="card col-9 border-0 border glass-card-hover">
        <div class="d-flex align-items-center gap-3 p-2">
            <img src="${data.avatar_url}" class="rounded-circle expandable-img"
                data-bs-target="#toggleModalImage" data-bs-toggle="modal"
                style="width:60px; height:60px; object-fit: cover;" alt="${data.name}" id="asdqadw">
            <div>
                <p class="fw-bold mb-0 fs-fluid-xxs">${data.name || data.login}</p>
                <span class="text-secondary fw-semibold fs-fluid-xxs">
                <!--I'll figure out the pronouns part, for now replace it manually  -->
                    ${data.login} · he/him
                </span>
            </div>
        </div>
    </div>
  `;


// you can either use this to expand the image in a modal or remove it ps. idk how you would implement your modal code
  setTimeout(() => {
   const asdqadw = document.getElementById("asdqadw");
   asdqadw.onclick = (event) => {
    const clickedSrc = event.target.src;
    modalImg.setAttribute("src", clickedSrc);
};
   
}, 1500);

 

}

// replace with your github username
createGithubCard("mizushino1");