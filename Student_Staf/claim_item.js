let submittedClaims = [];


window.onload = function () {
    setupLiveCharacterCounter();
    setupCancelConfirmation();
    setupSearchValidation();
};


function validateClaimForm(event) {
    event.preventDefault();

    
    resetInputBorders();

    
    let nameInput  = document.getElementById("claimant_name");
    let idInput    = document.getElementById("student_id");
    let phoneInput = document.getElementById("contact_phone");
    let descInput  = document.getElementById("ownership_proof_desc");
    let fileInput  = document.getElementById("proof_file");
    let slotInput  = document.getElementById("collection_time");
    let termsInput = document.getElementById("verify_declaration");

    let nameVal  = nameInput.value.trim();
    let idVal    = idInput.value.trim();
    let phoneVal = phoneInput.value.trim();
    let descVal  = descInput.value.trim();
    let slotVal  = slotInput.value;
    let isAgreed = termsInput.checked;

    let msg = document.getElementById("msg");
    msg.style.color = "#d93025";


    if (nameVal.length < 3) {
        showError(nameInput, msg, "Claimant name must be at least 3 characters long.");
        return false;
    }

    
    if (idVal.length !== 10 || idVal.charAt(2) !== "-" || idVal.charAt(8) !== "-") {
        showError(idInput, msg, "Student ID must follow the AIUB format (e.g., 24-57838-2).");
        return false;
    }

    
    let cleanPhone = phoneVal.replace(/[\s-]/g, "");
    let bdPhonePattern = /^(?:\+8801|01)[3-9]\d{8}$/;
    if (cleanPhone === "") {
        showError(phoneInput, msg, "Contact phone number is required.");
        return false;
    }
    if (!bdPhonePattern.test(cleanPhone)) {
        showError(phoneInput, msg, "Enter a valid Bangladesh phone number (e.g., +880 17XXXXXXXX or 017XXXXXXXX).");
        return false;
    }

    if (descVal.length < 10) {
        showError(descInput, msg, "Please provide at least 10 characters of specific identifying details.");
        return false;
    }

 
    if (!fileInput.files || fileInput.files.length === 0) {
        showError(fileInput, msg, "Please upload a proof photo, receipt, or reference document.");
        return false;
    }

    let uploadedFile = fileInput.files[0];
    let fileNameLower = uploadedFile.name.toLowerCase();
    let isValidExt =
        fileNameLower.endsWith(".jpg") ||
        fileNameLower.endsWith(".jpeg") ||
        fileNameLower.endsWith(".png") ||
        fileNameLower.endsWith(".pdf");

    if (!isValidExt) {
        showError(fileInput, msg, "Invalid file format. Only JPG, PNG, or PDF files are accepted.");
        return false;
    }

    let maxSize = 5 * 1024 * 1024;
    if (uploadedFile.size > maxSize) {
        showError(fileInput, msg, "File exceeds the 5 MB limit. Please upload a smaller file.");
        return false;
    }


    if (slotVal === "") {
        showError(slotInput, msg, "Please select a preferred verification visit time slot.");
        return false;
    }

    
    if (!isAgreed) {
        showError(termsInput, msg, "You must tick the ownership declaration checkbox before submitting.");
        return false;
    }

    
    let slotText = slotInput.options[slotInput.selectedIndex].text;

    let newClaim = {
        claimId: "CLM-" + (1001 + submittedClaims.length),
        itemName: "Casio FX-991EX ClassWiz (#ITM-2026-101)",
        claimant: nameVal + " (" + idVal + ")",
        phone: phoneVal,
        proofFile: uploadedFile.name,
        visitSlot: slotText,
        status: "Pending Verification"
    };

    submittedClaims.push(newClaim);

    
    msg.style.color = "#137333";
    msg.innerText ="Claim submitted successfully! Reference ID: " + newClaim.claimId + ". Bring your AIUB ID card during your selected slot.";


    renderClaimHistoryTable();

    
    phoneInput.value = "";
    descInput.value = "";
    fileInput.value = "";
    slotInput.value = "";
    termsInput.checked = false;

    let counter = document.getElementById("desc_counter");
    if (counter) {
        counter.innerText = "Characters typed: 0 / 20 minimum";
        counter.style.color = "#64748b";
    }

    return false;
}


function showError(inputEl, msgEl, errorText) {
    msgEl.style.color = "#d93025";
    msgEl.innerText = errorText;
    if (inputEl && inputEl.type !== "checkbox") {
        inputEl.style.borderColor = "#d93025";
        inputEl.focus();
    }
}

function resetInputBorders() {
    let ids = [
        "claimant_name",
        "student_id",
        "contact_phone",
        "ownership_proof_desc",
        "proof_file",
        "collection_time"
    ];
    for (let id of ids) {
        let el = document.getElementById(id);
        if (el) {
            el.style.borderColor = "#cbd5e1";
        }
    }
}


function setupLiveCharacterCounter() {
    let descInput = document.getElementById("ownership_proof_desc");
    if (!descInput) return;

    let counter = document.createElement("p");
    counter.id = "desc_counter";
    counter.style.fontSize = "12px";
    counter.style.color = "#64748b";
    counter.style.marginTop = "4px";
    counter.innerText = "Characters typed: 0 / 10 minimum";
    descInput.parentNode.appendChild(counter);

    descInput.addEventListener("input", function () {
        let len = descInput.value.trim().length;
        counter.innerText = "Characters typed: " + len + " / 10 minimum";
        if (len >= 10) {
            counter.style.color = "#137333";
            descInput.style.borderColor = "#cbd5e1";
        } else {
            counter.style.color = "#64748b";
        }
    });
}


function setupCancelConfirmation() {
    let cancelBtn = document.querySelector(".btn_cancel");
    if (!cancelBtn) return;

    cancelBtn.addEventListener("click", function (event) {
        let phone = document.getElementById("contact_phone").value.trim();
        let desc  = document.getElementById("ownership_proof_desc").value.trim();

        if (phone !== "" || desc !== "") {
            let leavePage = confirm("You have unsaved claim details. Are you sure you want to cancel?");
            if (!leavePage) {
                event.preventDefault();
            }
        }
    });
}


function setupSearchValidation() {
    let searchForm = document.querySelector("header form");
    if (!searchForm) return;

    searchForm.addEventListener("submit", function (event) {
        let searchInput = document.getElementById("search");
        if (searchInput.value.trim() === "") {
            event.preventDefault();
            alert("Please enter an item keyword to search.");
            searchInput.style.borderColor = "#d93025";
            searchInput.focus();
        }
    });
}


function renderClaimHistoryTable() {
    let mainBody = document.getElementById("main_body");
    let container = document.getElementById("submitted_claims_box");

    if (!container) {
        container = document.createElement("div");
        container.id = "submitted_claims_box";
        container.style.marginTop = "28px";
        container.style.backgroundColor = "#ffffff";
        container.style.border = "1px solid #e2e8f0";
        container.style.borderRadius = "10px";
        container.style.padding = "24px";
        container.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
        mainBody.appendChild(container);
    }

    container.innerHTML = "";

    let title = document.createElement("h3");
    title.innerText = "Submitted Ownership Claims (Session Log)";
    title.style.fontSize = "17px";
    title.style.color = "#0f172a";
    title.style.marginBottom = "12px";
    container.appendChild(title);

    let table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "13px";

    
    let headRow = document.createElement("tr");
    let headers = ["Claim ID", "Item", "Claimant", "Phone", "Proof File", "Visit Slot", "Status"];

    for (let h of headers) {
        let th = document.createElement("th");
        th.innerText = h;
        th.style.backgroundColor = "#f1f5f9";
        th.style.color = "#1e293b";
        th.style.padding = "10px 12px";
        th.style.textAlign = "left";
        th.style.border = "1px solid #cbd5e1";
        headRow.appendChild(th);
    }
    table.appendChild(headRow);

    
    for (let claim of submittedClaims) {
        let tr = document.createElement("tr");

        let cells = [
            claim.claimId,
            claim.itemName,
            claim.claimant,
            claim.phone,
            claim.proofFile,
            claim.visitSlot,
            claim.status
        ];

        for (let val of cells) {
            let td = document.createElement("td");
            td.innerText = val;
            td.style.padding = "10px 12px";
            td.style.border = "1px solid #e2e8f0";
            td.style.color = "#334155";
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

    container.appendChild(table);
}