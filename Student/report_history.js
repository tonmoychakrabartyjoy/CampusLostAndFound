let myReports = [
    {
        reportId: "RPT-2026-014",
        type: "Lost",
        itemName: "Casio FX-991EX ClassWiz",
        category: "Electronics",
        location: "Building D, Room 204",
        date: "27 Oct 2026",
        status: "Active"
    },
    {
        reportId: "RPT-2026-011",
        type: "Lost",
        itemName: "Navy Blue Backpack",
        category: "Bags & Wallets",
        location: "Main Cafeteria",
        date: "26 Oct 2026",
        status: "Active"
    },
    {
        reportId: "RPT-2026-008",
        type: "Found",
        itemName: "AIUB Student ID Card",
        category: "Documents & IDs",
        location: "Library 3rd Floor",
        date: "24 Oct 2026",
        status: "In Custody"
    },
    {
        reportId: "RPT-2026-003",
        type: "Lost",
        itemName: "Algorithms Study Notebook",
        category: "Books & Stationery",
        location: "Building D, Room 101",
        date: "18 Oct 2026",
        status: "Resolved"
    }
];

let myClaims = [
    {
        claimId: "CLM-1001",
        itemId: "#ITM-2026-101",
        itemName: "Casio FX-991EX ClassWiz",
        visitSlot: "Morning (09:00 AM - 12:00 PM)",
        submittedDate: "28 Oct 2026",
        status: "Pending Verification"
    },
    {
        claimId: "CLM-0987",
        itemId: "#ITM-2026-074",
        itemName: "Black Steel Water Flask",
        visitSlot: "Afternoon (01:00 PM - 03:30 PM)",
        submittedDate: "15 Oct 2026",
        status: "Approved"
    }
];

let currentTab = "reports";

window.onload = function () {
    let params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "claims") {
        currentTab = "claims";
    }
    updateTabButtons();
    renderActiveTab();
};

function switchHistoryTab(tabName) {
    currentTab = tabName;
    document.getElementById("filter_status").value = "";
    document.getElementById("action_msg").innerText = "";
    updateTabButtons();
    renderActiveTab();
}

function updateTabButtons() {
    document.getElementById("report_count").innerText = myReports.length;
    document.getElementById("claim_count").innerText = myClaims.length;

    let btnReports = document.getElementById("tab_reports");
    let btnClaims = document.getElementById("tab_claims");

    if (currentTab === "reports") {
        btnReports.classList.add("active_tab");
        btnClaims.classList.remove("active_tab");
        document.getElementById("table_section_title").innerText = "Submitted Lost & Found Property Reports";
    } else {
        btnClaims.classList.add("active_tab");
        btnReports.classList.remove("active_tab");
        document.getElementById("table_section_title").innerText = "Submitted Ownership Verification Claims";
    }
}

function renderActiveTab() {
    let container = document.getElementById("dynamic_table_container");
    container.innerHTML = "";

    let selectedStatus = document.getElementById("filter_status").value;

    if (currentTab === "reports") {
        renderReportsTable(container, selectedStatus);
    } else {
        renderClaimsTable(container, selectedStatus);
    }
}

function renderReportsTable(container, statusFilter) {
    let filtered = myReports.filter(function (r) {
        return statusFilter === "" || r.status === statusFilter;
    });

    if (filtered.length === 0) {
        let p = document.createElement("p");
        p.style.color = "#64748b";
        p.style.padding = "12px 0";
        p.innerText = "No property reports match the selected filter.";
        container.appendChild(p);
        return;
    }

    let table = document.createElement("table");
    let headRow = document.createElement("tr");
    let headers = ["Report ID", "Type", "Item Name", "Category", "Location", "Date", "Status", "Actions"];

    for (let h of headers) {
        let th = document.createElement("th");
        th.innerText = h;
        headRow.appendChild(th);
    }
    table.appendChild(headRow);

    for (let r of filtered) {
        let tr = document.createElement("tr");

        let tdId = document.createElement("td");
        tdId.innerText = r.reportId;
        tr.appendChild(tdId);

        let tdType = document.createElement("td");
        let typeSpan = document.createElement("span");
        typeSpan.innerText = r.type;
        typeSpan.className = r.type === "Lost" ? "badge badge_lost" : "badge badge_found";
        tdType.appendChild(typeSpan);
        tr.appendChild(tdType);

        let tdName = document.createElement("td");
        tdName.innerText = r.itemName;
        tr.appendChild(tdName);

        let tdCat = document.createElement("td");
        tdCat.innerText = r.category;
        tr.appendChild(tdCat);

        let tdLoc = document.createElement("td");
        tdLoc.innerText = r.location;
        tr.appendChild(tdLoc);

        let tdDate = document.createElement("td");
        tdDate.innerText = r.date;
        tr.appendChild(tdDate);

        let tdStatus = document.createElement("td");
        let statusSpan = document.createElement("span");
        statusSpan.innerText = r.status;
        statusSpan.className = r.status === "Resolved" ? "badge badge_resolved" : "badge badge_pending";
        tdStatus.appendChild(statusSpan);
        tr.appendChild(tdStatus);

        let tdAction = document.createElement("td");
        if (r.status !== "Resolved") {
            let resolveBtn = document.createElement("button");
            resolveBtn.type = "button";
            resolveBtn.className = "btn_action btn_resolve";
            resolveBtn.innerText = "Mark Resolved";
            resolveBtn.onclick = function () {
                markReportResolved(r.reportId);
            };
            tdAction.appendChild(resolveBtn);
        }

        let delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn_action btn_delete";
        delBtn.innerText = "Remove";
        delBtn.onclick = function () {
            removeReport(r.reportId);
        };
        tdAction.appendChild(delBtn);

        tr.appendChild(tdAction);
        table.appendChild(tr);
    }

    container.appendChild(table);
}

function renderClaimsTable(container, statusFilter) {
    let filtered = myClaims.filter(function (c) {
        return statusFilter === "" || c.status === statusFilter;
    });

    if (filtered.length === 0) {
        let p = document.createElement("p");
        p.style.color = "#64748b";
        p.style.padding = "12px 0";
        p.innerText = "No ownership claims match the selected filter.";
        container.appendChild(p);
        return;
    }

    let table = document.createElement("table");
    let headRow = document.createElement("tr");
    let headers = ["Claim ID", "Item ID", "Item Name", "Verification Slot", "Submitted Date", "Status", "Actions"];

    for (let h of headers) {
        let th = document.createElement("th");
        th.innerText = h;
        headRow.appendChild(th);
    }
    table.appendChild(headRow);

    for (let c of filtered) {
        let tr = document.createElement("tr");

        let cells = [c.claimId, c.itemId, c.itemName, c.visitSlot, c.submittedDate];
        for (let val of cells) {
            let td = document.createElement("td");
            td.innerText = val;
            tr.appendChild(td);
        }

        let tdStatus = document.createElement("td");
        let statusSpan = document.createElement("span");
        statusSpan.innerText = c.status;
        statusSpan.className = c.status === "Approved" ? "badge badge_found" : "badge badge_pending";
        tdStatus.appendChild(statusSpan);
        tr.appendChild(tdStatus);

        let tdAction = document.createElement("td");
        if (c.status === "Pending Verification") {
            let cancelBtn = document.createElement("button");
            cancelBtn.type = "button";
            cancelBtn.className = "btn_action btn_delete";
            cancelBtn.innerText = "Withdraw Claim";
            cancelBtn.onclick = function () {
                withdrawClaim(c.claimId);
            };
            tdAction.appendChild(cancelBtn);
        } else {
            tdAction.innerText = "Ready at Building D Desk";
        }
        tr.appendChild(tdAction);

        table.appendChild(tr);
    }

    container.appendChild(table);
}

function markReportResolved(reportId) {
    for (let r of myReports) {
        if (r.reportId === reportId) {
            r.status = "Resolved";
            break;
        }
    }
    let msg = document.getElementById("action_msg");
    msg.style.color = "#137333";
    msg.innerText = "Report " + reportId + " marked as Resolved.";
    renderActiveTab();
}

function removeReport(reportId) {
    let confirmDel = confirm("Are you sure you want to remove report " + reportId + "?");
    if (!confirmDel) return;

    myReports = myReports.filter(function (r) {
        return r.reportId !== reportId;
    });
    updateTabButtons();
    renderActiveTab();

    let msg = document.getElementById("action_msg");
    msg.style.color = "#d93025";
    msg.innerText = "Report " + reportId + " removed from your history.";
}

function withdrawClaim(claimId) {
    let confirmWithdraw = confirm("Withdraw ownership claim " + claimId + "?");
    if (!confirmWithdraw) return;

    myClaims = myClaims.filter(function (c) {
        return c.claimId !== claimId;
    });
    updateTabButtons();
    renderActiveTab();

    let msg = document.getElementById("action_msg");
    msg.style.color = "#d93025";
    msg.innerText = "Claim " + claimId + " has been withdrawn.";
}

function validateSearch(event) {
    let searchInput = document.getElementById("search");
    if (searchInput && searchInput.value.trim() === "") {
        event.preventDefault();
        alert("Please enter an item keyword to search.");
        searchInput.style.borderColor = "#d93025";
        searchInput.focus();
        return false;
    }
    return true;
}