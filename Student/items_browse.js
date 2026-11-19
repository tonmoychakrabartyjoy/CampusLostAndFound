function matchesCategory(selectedCat, cardCatText) {
    if (selectedCat === "") return true;
    let c = cardCatText.toLowerCase();
    if (selectedCat === "electronics" && c.indexOf("electronics") !== -1) return true;
    if (selectedCat === "accessories" && c.indexOf("bags") !== -1) return true;
    if (selectedCat === "documents" && c.indexOf("documents") !== -1) return true;
    if (selectedCat === "stationery" && c.indexOf("books") !== -1) return true;
    if (selectedCat === "keys" && c.indexOf("keys") !== -1) return true;
    return false;
}

function matchesLocation(selectedLoc, cardLocText) {
    if (selectedLoc === "") return true;
    let l = cardLocText.toLowerCase();
    if (selectedLoc === "building-d" && l.indexOf("building d") !== -1) return true;
    if (selectedLoc === "central-library" && l.indexOf("library") !== -1) return true;
    if (selectedLoc === "cafeteria" && l.indexOf("cafeteria") !== -1) return true;
    if (selectedLoc === "annex" && l.indexOf("annex") !== -1) return true;
    if (selectedLoc === "basement" && l.indexOf("basement") !== -1) return true;
    return false;
}

function filterListings(event) {
    if (event) {
        event.preventDefault();
    }

    let searchQuery = document.getElementById("search").value.trim().toLowerCase();
    let categoryVal = document.getElementById("filter_category").value;
    let locationVal = document.getElementById("filter_location").value;
    let typeVal = document.getElementById("filter-type").value;

    let cards = document.querySelectorAll(".item-card");
    let visibleCount = 0;

    for (let card of cards) {
        let title = card.querySelector(".item-title").innerText.toLowerCase();
        let desc = card.querySelector(".item-description").innerText.toLowerCase();
        let badge = card.querySelector(".status-badge").innerText.trim().toLowerCase();
        let metaSpans = card.querySelectorAll(".item-meta span");
        let cardCategory = metaSpans[0] ? metaSpans[0].innerText : "";
        let cardLocation = metaSpans[1] ? metaSpans[1].innerText : "";

        let matchKeyword = searchQuery === "" || title.indexOf(searchQuery) !== -1 || desc.indexOf(searchQuery) !== -1 || cardLocation.toLowerCase().indexOf(searchQuery) !== -1;
        let matchCat = matchesCategory(categoryVal, cardCategory);
        let matchLoc = matchesLocation(locationVal, cardLocation);
        let matchType = typeVal === "" || badge === typeVal;

        if (matchKeyword && matchCat && matchLoc && matchType) {
            card.style.display = "flex";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    }

    let statsCount = document.querySelector(".catalog-stats strong");
    if (statsCount) {
        statsCount.innerText = visibleCount;
    }

    let gridContainer = document.querySelector("#main_body > div:last-of-type");
    let emptyMsg = document.getElementById("no_results_msg");

    if (visibleCount === 0) {
        if (!emptyMsg) {
            emptyMsg = document.createElement("p");
            emptyMsg.id = "no_results_msg";
            emptyMsg.style.gridColumn = "1 / -1";
            emptyMsg.style.textAlign = "center";
            emptyMsg.style.padding = "24px";
            emptyMsg.style.backgroundColor = "#ffffff";
            emptyMsg.style.border = "1px solid #e2e8f0";
            emptyMsg.style.borderRadius = "10px";
            emptyMsg.style.color = "#64748b";
            emptyMsg.style.fontWeight = "600";
            emptyMsg.innerText = "No matching items found. Try adjusting your search or filter selections.";
            gridContainer.appendChild(emptyMsg);
        }
    } else if (emptyMsg) {
        emptyMsg.remove();
    }

    return false;
}

function resetFilters(event) {
    if (event) {
        event.preventDefault();
    }
    document.getElementById("search").value = "";
    document.getElementById("filter_category").value = "";
    document.getElementById("filter_location").value = "";
    document.getElementById("filter-type").value = "";
    filterListings();
    return false;
}

window.onload = function () {
    let searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterListings();
        });
    }

    let params = new URLSearchParams(window.location.search);
    let qParam = params.get("q");
    if (qParam && searchInput) {
        searchInput.value = qParam;
        filterListings();
    }
};