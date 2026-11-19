// JavaScript for faculty_dashboard.html and faculty_activity_log.html
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

// Returns true when every listed field has a value; marks the first empty one.
function requireFields(ids, message) {
    for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el.value.trim() === "") {
            el.classList.add("invalid");
            el.focus();
            showMessage(message, "error");
            return false;
        }
    }
    return true;
}

function todayText() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    if (month < 10) { month = "0" + month; }
    if (day < 10) { day = "0" + day; }
    return d.getFullYear() + "-" + month + "-" + day;
}

function makeCell(row, text) {
    var td = document.createElement("td");
    td.textContent = text;
    row.appendChild(td);
    return td;
}

function makeBadge(text) {
    var span = document.createElement("span");
    span.className = "badge badge-" + text.toLowerCase();
    span.textContent = text;
    return span;
}

function makeButton(text, className, handler) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "small-button " + className;
    btn.textContent = text;
    btn.addEventListener("click", handler);
    return btn;
}

function emptyRow(tbody, cols, text) {
    var tr = document.createElement("tr");
    tr.className = "empty-row";
    var td = document.createElement("td");
    td.colSpan = cols;
    td.textContent = text;
    tr.appendChild(td);
    tbody.appendChild(tr);
}

function findIndexById(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            return i;
        }
    }
    return -1;
}

// =====================================================
// FACULTY DASHBOARD PAGE
// =====================================================
var priorityTable = document.getElementById("priority-table");

if (priorityTable) {
    var reports = [
        { id: "PR-101", item: "Laptop (Lab 3)", department: "CS", priority: "High", status: "Open", flagged: true },
        { id: "PR-102", item: "Oscilloscope Probe Set", department: "EEE", priority: "Medium", status: "Open", flagged: false },
        { id: "PR-103", item: "Faculty ID Card", department: "BBA", priority: "Low", status: "Resolved", flagged: false }
    ];
    var claims = [
        { id: "FC-201", asset: "Projector Remote (Room 204)", claimant: "Dr. Rahman", status: "Pending" },
        { id: "FC-202", asset: "Lab Laptop (Tag AIUB-4471)", claimant: "Ms. Sultana", status: "Approved" }
    ];
    var notices = [
        { id: "N-1", title: "Unclaimed items cleanup", text: "Items unclaimed for 30 days will be sent to the Security Desk.", date: "2026-11-10" }
    ];
    var nextReportNo = 104;
    var nextClaimNo = 203;
    var nextNoticeNo = 2;
    var editingNoticeId = null;

    // ----- Priority reports -----
    function renderReports() {
        var tbody = priorityTable.querySelector("tbody");
        tbody.innerHTML = "";

        if (reports.length === 0) {
            emptyRow(tbody, 7, "No priority reports.");
        }

        reports.forEach(function (r) {
            var tr = document.createElement("tr");
            if (r.flagged) { tr.className = "row-flagged"; }

            makeCell(tr, r.id);
            makeCell(tr, r.item);
            makeCell(tr, r.department);
            makeCell(tr, "").appendChild(makeBadge(r.priority));
            makeCell(tr, r.status);

            var flagCell = makeCell(tr, r.flagged ? "Flagged" : "-");
            if (r.flagged) { flagCell.className = "flag-on"; }

            var actions = makeCell(tr, "");
            actions.className = "action-cell";

            actions.appendChild(makeButton(r.flagged ? "Unflag" : "Flag", "danger-button", function () {
                r.flagged = !r.flagged;
                renderAll();
                showMessage(r.id + (r.flagged ? " flagged." : " unflagged."), "ok");
            }));

            actions.appendChild(makeButton("Edit", "", function () {
                var newName = prompt("Enter the corrected item name:", r.item);
                if (newName !== null && newName.trim() !== "") {
                    r.item = newName.trim();
                    renderAll();
                    showMessage(r.id + " updated.", "ok");
                }
            }));

            if (r.status !== "Resolved") {
                actions.appendChild(makeButton("Resolve", "success-button", function () {
                    r.status = "Resolved";
                    renderAll();
                    showMessage(r.id + " marked as Resolved.", "ok");
                }));
            }

            actions.appendChild(makeButton("Delete", "danger-button", function () {
                if (confirm("Delete report " + r.id + "?")) {
                    reports.splice(findIndexById(reports, r.id), 1);
                    renderAll();
                    showMessage(r.id + " deleted.", "ok");
                }
            }));

            tbody.appendChild(tr);
        });
    }

    var priorityForm = document.getElementById("priority-form");
    priorityForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearInvalid(priorityForm);

        if (!requireFields(["pr-item", "pr-department", "pr-priority"], "Please fill in item, department and priority.")) {
            return;
        }
        var item = document.getElementById("pr-item").value.trim();
        if (item.length < 3) {
            document.getElementById("pr-item").classList.add("invalid");
            showMessage("Item name must be at least 3 characters.", "error");
            return;
        }

        var report = {
            id: "PR-" + nextReportNo,
            item: item,
            department: document.getElementById("pr-department").value,
            priority: document.getElementById("pr-priority").value,
            status: "Open",
            flagged: false
        };
        nextReportNo++;
        reports.push(report);
        priorityForm.reset();
        renderAll();
        showMessage("Priority report " + report.id + " added.", "ok");
    });

    // ----- Fast-track claims -----
    function renderClaims() {
        var tbody = document.querySelector("#claims-tracker tbody");
        tbody.innerHTML = "";

        if (claims.length === 0) {
            emptyRow(tbody, 5, "No fast-track claims.");
        }

        claims.forEach(function (c) {
            var tr = document.createElement("tr");
            makeCell(tr, c.id);
            makeCell(tr, c.asset);
            makeCell(tr, c.claimant);
            makeCell(tr, "").appendChild(makeBadge(c.status));

            var actions = makeCell(tr, "");
            actions.className = "action-cell";

            var select = document.createElement("select");
            ["Pending", "Approved", "Rejected"].forEach(function (s) {
                var opt = document.createElement("option");
                opt.value = s;
                opt.textContent = s;
                if (s === c.status) { opt.selected = true; }
                select.appendChild(opt);
            });
            actions.appendChild(select);

            actions.appendChild(makeButton("Update", "success-button", function () {
                c.status = select.value;
                renderAll();
                showMessage(c.id + " status updated to " + c.status + ".", "ok");
            }));

            actions.appendChild(makeButton("Delete", "danger-button", function () {
                if (confirm("Delete claim " + c.id + "?")) {
                    claims.splice(findIndexById(claims, c.id), 1);
                    renderAll();
                    showMessage(c.id + " deleted.", "ok");
                }
            }));

            tbody.appendChild(tr);
        });
    }

    var claimForm = document.getElementById("claim-form");
    claimForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearInvalid(claimForm);

        if (!requireFields(["fc-asset", "fc-claimant"], "Please enter the asset name and claimant.")) {
            return;
        }

        var claim = {
            id: "FC-" + nextClaimNo,
            asset: document.getElementById("fc-asset").value.trim(),
            claimant: document.getElementById("fc-claimant").value.trim(),
            status: "Pending"
        };
        nextClaimNo++;
        claims.push(claim);
        claimForm.reset();
        renderAll();
        showMessage("Fast-track claim " + claim.id + " added.", "ok");
    });

    // ----- Notices -----
    function renderNotices() {
        var list = document.getElementById("notice-list");
        list.innerHTML = "";

        if (notices.length === 0) {
            var none = document.createElement("p");
            none.textContent = "No departmental notices.";
            list.appendChild(none);
        }

        notices.forEach(function (n) {
            var card = document.createElement("div");
            card.className = "detail-card";

            var title = document.createElement("h4");
            title.textContent = n.title;
            card.appendChild(title);

            var date = document.createElement("p");
            date.className = "notice-date";
            date.textContent = "Posted: " + n.date;
            card.appendChild(date);

            var text = document.createElement("p");
            text.textContent = n.text;
            card.appendChild(text);

            var actions = document.createElement("div");
            actions.className = "notice-actions";
            actions.appendChild(makeButton("Edit", "", function () {
                editingNoticeId = n.id;
                document.getElementById("notice-title").value = n.title;
                document.getElementById("notice-text").value = n.text;
                document.getElementById("notice-form-title").textContent = "Edit Notice (" + n.id + ")";
                document.getElementById("notice-submit").textContent = "Save Changes";
                document.getElementById("notice-title").focus();
            }));
            actions.appendChild(makeButton("Delete", "danger-button", function () {
                if (confirm("Delete this notice?")) {
                    notices.splice(findIndexById(notices, n.id), 1);
                    if (editingNoticeId === n.id) { resetNoticeForm(); }
                    renderAll();
                    showMessage("Notice deleted.", "ok");
                }
            }));
            card.appendChild(actions);

            list.appendChild(card);
        });
    }

    function resetNoticeForm() {
        editingNoticeId = null;
        document.getElementById("notice-form").reset();
        document.getElementById("notice-form-title").textContent = "Create Notice";
        document.getElementById("notice-submit").textContent = "Publish Notice";
    }

    var noticeForm = document.getElementById("notice-form");
    noticeForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearInvalid(noticeForm);

        if (!requireFields(["notice-title", "notice-text"], "Please enter a notice title and text.")) {
            return;
        }

        var title = document.getElementById("notice-title").value.trim();
        var text = document.getElementById("notice-text").value.trim();

        if (editingNoticeId !== null) {
            var index = findIndexById(notices, editingNoticeId);
            if (index !== -1) {
                notices[index].title = title;
                notices[index].text = text;
            }
            resetNoticeForm();
            renderAll();
            showMessage("Notice updated.", "ok");
        } else {
            notices.unshift({ id: "N-" + nextNoticeNo, title: title, text: text, date: todayText() });
            nextNoticeNo++;
            noticeForm.reset();
            renderAll();
            showMessage("Notice published.", "ok");
        }
    });

    document.getElementById("notice-reset").addEventListener("click", function () {
        resetNoticeForm();
    });

    // ----- Summary cards -----
    function updateSummary() {
        var open = 0;
        var flagged = 0;
        var pending = 0;
        reports.forEach(function (r) {
            if (r.status !== "Resolved") { open++; }
            if (r.flagged) { flagged++; }
        });
        claims.forEach(function (c) {
            if (c.status === "Pending") { pending++; }
        });
        document.getElementById("count-reports").textContent = open;
        document.getElementById("count-flagged").textContent = flagged;
        document.getElementById("count-claims").textContent = pending;
    }

    function renderAll() {
        renderReports();
        renderClaims();
        renderNotices();
        updateSummary();
    }

    renderAll();
}

// =====================================================
// FACULTY ACTIVITY LOG PAGE
// =====================================================
var resolutionTable = document.getElementById("resolution-table");

if (resolutionTable) {
    var logs = [
        { id: "LOG-1", date: "2026-11-12", department: "CS", item: "Laptop (Lab 3)", resolution: "Returned to owner", remark: "Verified with faculty ID and serial number.", status: "Final" },
        { id: "LOG-2", date: "2026-11-15", department: "EEE", item: "Oscilloscope Probe Set", resolution: "Transferred to security", remark: "Owner not found. Moved to Building D desk.", status: "Final" },
        { id: "LOG-3", date: "2026-11-17", department: "BBA", item: "Faculty ID Card", resolution: "Unclaimed - held", remark: "Draft: waiting for owner reply.", status: "Draft" },
        { id: "LOG-4", date: "2026-11-18", department: "CS", item: "Projector Remote", resolution: "Claim rejected", remark: "Draft: claimant could not describe the item.", status: "Draft" }
    ];
    var archivedLogs = [];
    var nextLogNo = 5;

    var departmentNames = {
        CS: "Computer Science",
        EEE: "Electrical & Electronic Engineering",
        BBA: "Business Administration",
        English: "English"
    };

    function getFilteredLogs() {
        var dept = document.getElementById("filter-department").value;
        var from = document.getElementById("filter-from").value;
        var to = document.getElementById("filter-to").value;
        var keyword = document.getElementById("filter-keyword").value.trim().toLowerCase();

        var result = logs.filter(function (l) {
            if (dept !== "" && l.department !== dept) { return false; }
            if (from !== "" && l.date < from) { return false; }
            if (to !== "" && l.date > to) { return false; }
            if (keyword !== "" &&
                l.item.toLowerCase().indexOf(keyword) === -1 &&
                l.remark.toLowerCase().indexOf(keyword) === -1) {
                return false;
            }
            return true;
        });

        // newest first
        result.sort(function (a, b) {
            if (a.date < b.date) { return 1; }
            if (a.date > b.date) { return -1; }
            return 0;
        });
        return result;
    }

    function renderLogs() {
        var tbody = resolutionTable.querySelector("tbody");
        tbody.innerHTML = "";
        var list = getFilteredLogs();

        document.getElementById("log-count").textContent = "Showing " + list.length + " of " + logs.length + " entries.";

        if (list.length === 0) {
            emptyRow(tbody, 8, "No resolution entries match the filter.");
        }

        list.forEach(function (l) {
            var tr = document.createElement("tr");
            makeCell(tr, l.id);
            makeCell(tr, l.date);
            makeCell(tr, l.department);
            makeCell(tr, l.item);
            makeCell(tr, l.resolution);
            makeCell(tr, l.remark);
            makeCell(tr, "").appendChild(makeBadge(l.status));

            var actions = makeCell(tr, "");
            actions.className = "action-cell";

            actions.appendChild(makeButton("Edit Remark", "", function () {
                var newRemark = prompt("Edit the internal remark:", l.remark);
                if (newRemark === null) { return; }
                if (newRemark.trim().length < 5) {
                    showMessage("Remark must be at least 5 characters.", "error");
                    return;
                }
                l.remark = newRemark.trim();
                renderLogs();
                showMessage(l.id + " remark updated.", "ok");
            }));

            if (l.status === "Draft") {
                actions.appendChild(makeButton("Mark Final", "success-button", function () {
                    l.status = "Final";
                    renderLogs();
                    showMessage(l.id + " marked as Final.", "ok");
                }));
                actions.appendChild(makeButton("Archive", "secondary-button", function () {
                    if (confirm("Archive draft note " + l.id + "?")) {
                        logs.splice(findIndexById(logs, l.id), 1);
                        archivedLogs.push(l);
                        renderLogs();
                        renderArchive();
                        showMessage(l.id + " archived.", "ok");
                    }
                }));
            }

            tbody.appendChild(tr);
        });
    }

    function renderArchive() {
        var tbody = document.querySelector("#archive-table tbody");
        tbody.innerHTML = "";

        if (archivedLogs.length === 0) {
            emptyRow(tbody, 6, "No archived notes.");
        }

        archivedLogs.forEach(function (l) {
            var tr = document.createElement("tr");
            makeCell(tr, l.id);
            makeCell(tr, l.date);
            makeCell(tr, l.department);
            makeCell(tr, l.item);
            makeCell(tr, l.remark);

            var actions = makeCell(tr, "");
            actions.className = "action-cell";

            actions.appendChild(makeButton("Restore", "success-button", function () {
                archivedLogs.splice(findIndexById(archivedLogs, l.id), 1);
                logs.push(l);
                renderLogs();
                renderArchive();
                showMessage(l.id + " restored to the active log.", "ok");
            }));

            actions.appendChild(makeButton("Delete Permanently", "danger-button", function () {
                if (confirm("Permanently delete " + l.id + "? This cannot be undone.")) {
                    archivedLogs.splice(findIndexById(archivedLogs, l.id), 1);
                    renderArchive();
                    showMessage(l.id + " permanently deleted.", "ok");
                }
            }));

            tbody.appendChild(tr);
        });
    }

    // ----- Filter form -----
    var filterForm = document.getElementById("filter-form");
    filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var from = document.getElementById("filter-from").value;
        var to = document.getElementById("filter-to").value;

        if (from !== "" && to !== "" && from > to) {
            showMessage("From date cannot be after the To date.", "error");
            return;
        }
        renderLogs();
        showMessage("Filter applied.", "ok");
    });

    document.getElementById("filter-reset").addEventListener("click", function () {
        // run after the browser resets the fields
        setTimeout(function () {
            renderLogs();
            showMessage("Filter cleared.", "ok");
        }, 0);
    });

    // ----- Add entry form -----
    var resolutionForm = document.getElementById("resolution-form");
    resolutionForm.addEventListener("submit", function (event) {
        event.preventDefault();
        clearInvalid(resolutionForm);

        if (!requireFields(["res-date", "res-department", "res-item", "res-resolution", "res-remark"],
            "Please fill in all fields before saving the entry.")) {
            return;
        }

        var date = document.getElementById("res-date").value;
        if (date > todayText()) {
            document.getElementById("res-date").classList.add("invalid");
            showMessage("Date cannot be in the future.", "error");
            return;
        }

        var remark = document.getElementById("res-remark").value.trim();
        if (remark.length < 5) {
            document.getElementById("res-remark").classList.add("invalid");
            showMessage("Remark must be at least 5 characters.", "error");
            return;
        }

        var entry = {
            id: "LOG-" + nextLogNo,
            date: date,
            department: document.getElementById("res-department").value,
            item: document.getElementById("res-item").value.trim(),
            resolution: document.getElementById("res-resolution").value,
            remark: remark,
            status: document.getElementById("res-status").value
        };
        nextLogNo++;
        logs.push(entry);
        resolutionForm.reset();
        renderLogs();
        showMessage("Entry " + entry.id + " saved.", "ok");
    });

    renderLogs();
    renderArchive();
}
