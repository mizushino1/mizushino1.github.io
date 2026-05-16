const activitiesContainer = document.getElementById("activitiesContainer");

function loadActivities() {

    for (i = 0; i != activitiesData.length; i++) {
        let isLessThan2 = i < 1;
        let isLessThan3 = i < 2;

        activitiesContainer.innerHTML += `
        <div class="col-12 col-md-5 card mx-auto ${isLessThan2 ? "" : "my-4"} ${isLessThan3 ? "my-md-0" : "collapse activities"} p-0 glass-card-hover">
                                    <img src="${activitiesData[i].preview}" class="card-img-top activity-image expandable-img"
                                        data-bs-target="#toggleModalImage" data-bs-toggle="modal" alt="a02">
                                    <div class="card-body">
                                        <h5 class="card-title fs-fluid-md">${activitiesData[i].title}</h5>
                                        <p class="card-text fs-fluid-sm">${activitiesData[i].description}</p>
                                        <a href="${activitiesData[i].link}"
                                            class="btn btn-dark border">
                                            <img src="./assets/images/view.png" class="invert"
                                                style="height:16px; width: 16px;" alt="">
                                            <span class="fs-fluid-xs">View</span>
                                        </a>
                                        <a href="${activitiesData[i].documentation}"
                                            class="btn btn-dark custom-btn border">
                                            <img src="./assets/images/documentation.png" class="invert"
                                                style="height:16px; width: 16px;" alt="">
                                            <span class="fs-fluid-xs">Documentation</span>
                                        </a>
                                    </div>
                                </div>
        
        `

    }
    setTimeout(() => {
        const activityImages = document.querySelectorAll(".activity-image");
        activityImages.forEach(img => {
            img.onclick = (event) => {
                const clickedSrc = event.target.src;
                modalImg.setAttribute("src", clickedSrc);
            };
        });

    }, 10);



}

loadActivities();