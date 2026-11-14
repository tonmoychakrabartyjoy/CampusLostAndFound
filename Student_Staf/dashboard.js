function handleDashboardSearch(event) {
    event.preventDefault();
    let searchInput = document.getElementById("search");
    let query = searchInput.value.trim();

    if (query === "") {
        alert("Please enter a keyword to search.");
        searchInput.style.borderColor = "#d93025";
        searchInput.focus();
        return false;
    }

    searchInput.style.borderColor = "#cbd5e1";
    window.location.href = "items_browse.html?q=" + encodeURIComponent(query);
    return false;
}

window.onload = function () {
    let inspectBtn = document.getElementById("btnItemBrowse");
    if (inspectBtn) {
        inspectBtn.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "claim_item.html?id=101";
        });
    }

    let notifLink = document.querySelector("#header_navigation ul li:first-child a");
    if (notifLink) {
        notifLink.innerText = "Notifications(1)";
        notifLink.addEventListener("click", function (event) {
            event.preventDefault();
            let pcnSection = document.getElementById("PCN");
            if (pcnSection) {
                pcnSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
};