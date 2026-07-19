function goFramework() {

    const framework = document.getElementById("framework");

    if (framework) {

        framework.scrollIntoView({
            behavior: "smooth"
        });

    }

}



function updateStatus() {

    const status = document.getElementById("system-status");

    if (status) {

        status.textContent = "ONLINE | READY FOR ASSESSMENT";

    }

}



document.addEventListener("DOMContentLoaded", function() {

    updateStatus();

});
