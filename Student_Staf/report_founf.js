let foundReports = [];

window.onload = function () {
    setupDescriptionCounter();
    setupFormResetHandler();
};


function validateFoundForm(event) {
    event.preventDefault();
    resetFieldBorders();


    let itemNameInput = document.getElementById("item_name");
    let categoryInput = document.getElementById("catagory");
    let descInput     = document.getElementById("description");
    let locationInput = document.getElementById("location");
    let custodyInput  = document.getElementById("custody");
    let dateInput     = document.getElementById("date");
    let timeInput     = document.getElementById("Time");
    let imageInput    = document.getElementById("item_image");

    let itemName = itemNameInput.value.trim();
    let category = categoryInput.value;
    let desc     = descInput.value.trim();
    let location = locationInput.value;
    let custody  = custodyInput.value;
    let dateVal  = dateInput.value;
    let timeVal  = timeInput.value;

    let msg = document.getElementById("msg");

    
    if (itemName.length < 3) {
        showError(itemNameInput, msg, "Item Name must be at least 3 characters long.");
        return false;
    }

    
    if (category === "") {
        showError(categoryInput, msg, "Please select an item category.");
        return false;
    }

    
    if (desc.length < 3 || desc.length > 200) {
        showError(descInput, msg, "Description must be between 3 and 200 characters.");
        return false;
    }

    
    if (location === "") {
        showError(locationInput, msg, "Please select where you found the item.");
        return false;
    }

    
    if (custody === "") {
        showError(custodyInput, msg, "Please select the current item custody status.");
        return false;
    }

    
    if (dateVal === "") {
        showError(dateInput, msg, "Please select the date when the item was found.");
        return false;
    }
    let todayStr = new Date().toISOString().split("T")[0];
    if (dateVal > todayStr) {
        showError(dateInput, msg, "Found date cannot be in the future.");
        return false;
    }

    
    if (timeVal === "") {
        showError(timeInput, msg, "Please enter the approximate time the item was found.");
        return false;
    }

    
    let uploadedFileName = "No image attached";
    if (imageInput.files && imageInput.files.length > 0) {
        let file = imageInput.files[0];
        let lowerName = file.name.toLowerCase();
        let validImage =
            lowerName.endsWith(".jpg") ||
            lowerName.endsWith(".jpeg") ||
            lowerName.endsWith(".png");

        if (!validImage) {
            showError(imageInput, msg, "Only JPG or PNG image formats are supported.");
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            showError(imageInput, msg, "Image file size must not exceed 5 MB.");
            return false;
        }
        uploadedFileName = file.name;
    }

   
    let newNotice = {
        noticeId: "FND-" + (2001 + foundReports.length),
        itemName: itemName,
        category: category,
        location: location,
        custody: custody,
        dateTime: dateVal + " at " + timeVal,
        image: uploadedFileName
    };

    foundReports.push(newNotice);

    msg.style.color = "#137333";
    msg.innerText =
        "Found property notice logged! Reference ID: " +
        newNotice.noticeId +
        " (" + itemName + ").";

    renderFoundNoticesTable();

    document.getElementById("found_form").reset();
    let counter = document.getElementById("desc_char_count");
    if (counter) {
        counter.innerText = "0 / 200 characters";
    }

    return false;
}


function showError(inputEl, msgEl, errorText) {
    msgEl.style.color = "#d93025";
    msgEl.innerText = errorText;
    if (inputEl) {
        inputEl.style.borderColor = "#d93025";
        inputEl.focus();
    }
}

function resetFieldBorders() {
    let ids = ["item_name", "catagory", "description", "location", "custody", "date", "Time", "item_image"];
    for (let id of ids) {
        let el = document.getElementById(id);
        if (el) {
            el.style.borderColor = "#cbd5e1";
        }
    }
}


function setupDescriptionCounter() {
    let descInput = document.getElementById("description");
    if (!descInput) return;

    let counter = document.createElement("p");
    counter.id = "desc_char_count";
    counter.style.fontSize = "11px";
    counter.style.color = "#64748b";
    counter.style.marginTop = "4px";
    counter.innerText = "0 / 200 characters";
    descInput.parentNode.insertBefore(counter, descInput.nextSibling);

    descInput.addEventListener("input", function () {
        let len = descInput.value.length;
        counter.innerText = len + " / 200 characters";
        if (len >= 3) {
            descInput.style.borderColor = "#cbd5e1";
        }
    });
}


function setupFormResetHandler() {
    let form = document.getElementById("found_form");
    if (!form) return;

    form.addEventListener("reset", function () {
        resetFieldBorders();
        let msg = document.getElementById("msg");
        if (msg) {
            msg.innerText = "";
        }
        let counter = document.getElementById("desc_char_count");
        if (counter) {
            counter.innerText = "0 / 200 characters";
        }
    });
}


function validateSearch(event) {
    let searchInput = document.getElementById("search");
    if (searchInput && searchInput.value.trim() === "") {
        event.preventDefault();
        alert("Please enter a keyword to search lost or found items.");
        searchInput.style.borderColor = "#d93025";
        searchInput.focus();
        return false;
    }
    return true;
}


function renderFoundNoticesTable() {
    let mainBody = document.getElementById("main_body");
    let container = document.getElementById("found_log_container");

    if (!container) {
        container = document.createElement("div");
        container.id = "found_log_container";
        container.style.maxWidth = "680px";
        container.style.margin = "28px auto 0 auto";
        container.style.backgroundColor = "#ffffff";
        container.style.border = "1px solid #e2e8f0";
        container.style.borderRadius = "12px";
        container.style.padding = "24px";
        container.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.05)";
        mainBody.appendChild(container);
    }

    container.innerHTML = "";

    let heading = document.createElement("h3");
    heading.innerText = "Logged Found Property Notices (Session Summary)";
    heading.style.fontSize = "16px";
    heading.style.color = "#0f172a";
    heading.style.marginBottom = "12px";
    container.appendChild(heading);

    let table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "13px";

    let headRow = document.createElement("tr");
    let headers = ["Notice ID", "Item Name", "Category", "Location", "Custody", "Found Date/Time"];

    for (let h of headers) {
        let th = document.createElement("th");
        th.innerText = h;
        th.style.backgroundColor = "#f1f5f9";
        th.style.color = "#1e293b";
        th.style.padding = "9px 10px";
        th.style.textAlign = "left";
        th.style.border = "1px solid #cbd5e1";
        headRow.appendChild(th);
    }
    table.appendChild(headRow);

    for (let item of foundReports) {
        let tr = document.createElement("tr");
        let values = [
            item.noticeId,
            item.itemName,
            item.category,
            item.location,
            item.custody,
            item.dateTime
        ];

        for (let val of values) {
            let td = document.createElement("td");
            td.innerText = val;
            td.style.padding = "9px 10px";
            td.style.border = "1px solid #e2e8f0";
            td.style.color = "#334155";
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

    container.appendChild(table);
}