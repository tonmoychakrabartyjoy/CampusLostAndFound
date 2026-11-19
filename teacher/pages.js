// JavaScript for items_browse.html, report_lost.html and report_found.html
// Data is kept in memory only (demonstration, no backend).

// ---------- Shared helpers ----------
function showMessage(text, type) {
    var msg = document.getElementById("page-msg");
    if (msg) {
        msg.textContent = text;
        msg.className = "page-msg " + type;
    }
}

function clearInvalid(form) {
    var fields = form.querySelectorAll(".invalid");
    for (var i = 0; i < fields.length; i++) {
        fields[i].classList.remove("invalid");
    }
}

function fail(el, text) {
    el.classList.add("invalid");
    el.focus();
    showMessage(text, "error");
    return false;
}

function todayText() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    if (month < 10) { month = "0" + month; }
    if (day < 10) { day = "0" + day; }
    return d.getFullYear() + "-" + month + "-" + day;
}

// =====================================================
// BROWSE LISTINGS PAGE
// =====================================================
var filterForm = document.getElementById("filter-form");

if (filterForm) {
    var cards = document.querySelectorAll(".item-card");

    function filterListings() {
        var keyword = document.getElementById("search").value.trim().toLowerCase();
        var category = document.getElementById("filter-category").value;
        var location = document.getElementById("filter-location").value;
        var type = document.getElementById("filter-type").value;
        var visible = 0;

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var text = card.textContent.toLowerCase();

            var matchKeyword = keyword === "" || text.indexOf(keyword) !== -1;
            var matchCategory = category === "" || card.getAttribute("data-category") === category;
            var matchLocation = location === "" || card.getAttribute("data-location") === location;
            var matchType = type === "" || card.getAttribute("data-type") === type;

            if (matchKeyword && matchCategory && matchLocation && matchType) {
                card.hidden = false;
                visible++;
            } else {
                card.hidden = true;
            }
        }

        document.getElementById("result-count").textContent =
            "Showing " + visible + " active items. Sorted by: Most Recent";
        document.getElementById("no-results").hidden = visible !== 0;
    }

    filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        filterListings();
    });

    document.getElementById("search").addEventListener("input", filterListings);
    document.getElementById("filter-category").addEventListener("change", filterListings);
    document.getElementById("filter-location").addEventListener("change", filterListings);
    document.getElementById("filter-type").addEventListener("change", filterListings);

    document.getElementById("filter-reset").addEventListener("click", function () {
        // wait for the browser to clear the fields first
        setTimeout(filterListings, 0);
    });

    // Support ?q=keyword from other pages
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q) {
        document.getElementById("search").value = q;
        filterListings();
    }
}

// =====================================================
// REPORT LOST / REPORT FOUND PAGES
// =====================================================
var lostForm = document.getElementById("lost-form");
var foundForm = document.getElementById("found-form");
var reportForm = lostForm || foundForm;

if (reportForm) {
    var isLost = lostForm !== null;
    var records = [];

    // Live description counter
    var descInput = document.getElementById("description");
    var counter = document.getElementById("desc-counter");
    var counterBase = counter.textContent.split(". ").slice(1).join(". ");

    function updateCounter() {
        counter.textContent = descInput.value.length + " / 200 characters. " + counterBase;
    }
    descInput.addEventListener("input", updateCounter);

    reportForm.addEventListener("reset", function () {
        clearInvalid(reportForm);
        showMessage("", "");
        setTimeout(updateCounter, 0);
    });

    // Validation + save
    reportForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearInvalid(reportForm);

        var nameInput = document.getElementById("item_name");
        var categoryInput = document.getElementById("category");
        var locationInput = document.getElementById("location");
        var dateInput = document.getElementById("date");
        var timeInput = document.getElementById("time");
        var imageInput = document.getElementById("item_image");
        var custodyInput = document.getElementById("custody");

        var name = nameInput.value.trim();
        var desc = descInput.value.trim();

        if (name.length < 3) {
            return fail(nameInput, "Item name must be at least 3 characters long.");
        }
        if (categoryInput.value === "") {
            return fail(categoryInput, "Please select an item category.");
        }
        if (desc.length < 3 || desc.length > 200) {
            return fail(descInput, "Description must be between 3 and 200 characters.");
        }
        if (locationInput.value === "") {
            return fail(locationInput, isLost ? "Please select the last seen campus location." : "Please select where you found the item.");
        }
        if (!isLost && custodyInput.value === "") {
            return fail(custodyInput, "Please select the current item custody.");
        }
        if (dateInput.value === "") {
            return fail(dateInput, isLost ? "Please select the date the item was lost." : "Please select the date the item was found.");
        }
        if (dateInput.value > todayText()) {
            return fail(dateInput, "The date cannot be in the future.");
        }
        if (timeInput.value === "") {
            return fail(timeInput, "Please enter the approximate time.");
        }

        var fileName = "No image";
        if (imageInput.files.length > 0) {
            var file = imageInput.files[0];
            var lower = file.name.toLowerCase();
            var okType = lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");

            if (!okType) {
                return fail(imageInput, "Only JPG or PNG images are supported.");
            }
            if (file.size > 5 * 1024 * 1024) {
                return fail(imageInput, "Image size must not exceed 5 MB.");
            }
            fileName = file.name;
        }

        var record = {
            id: (isLost ? "LST-" : "FND-") + ((isLost ? 3001 : 2001) + records.length),
            name: name,
            category: categoryInput.value,
            location: locationInput.value,
            custody: isLost ? "" : custodyInput.value,
            dateTime: dateInput.value + " at " + timeInput.value,
            image: fileName
        };
        records.push(record);

        renderLog();
        reportForm.reset();
        showMessage((isLost ? "Lost property report submitted" : "Found property notice logged") +
            "! Reference ID: " + record.id + " (" + name + ").", "ok");
    });

    function renderLog() {
        var tbody = document.querySelector("#report-log tbody");
        tbody.innerHTML = "";

        records.forEach(function (r) {
            var tr = document.createElement("tr");
            var values = isLost
                ? [r.id, r.name, r.category, r.location, r.dateTime, "Active Search"]
                : [r.id, r.name, r.category, r.location, r.custody, r.dateTime];

            values.forEach(function (v) {
                var td = document.createElement("td");
                td.textContent = v;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    // Empty-state row
    (function () {
        var tbody = document.querySelector("#report-log tbody");
        var cols = document.querySelectorAll("#report-log thead th").length;
        var tr = document.createElement("tr");
        tr.className = "empty-row";
        var td = document.createElement("td");
        td.colSpan = cols;
        td.textContent = "Nothing submitted yet.";
        tr.appendChild(td);
        tbody.appendChild(tr);
    })();
}
