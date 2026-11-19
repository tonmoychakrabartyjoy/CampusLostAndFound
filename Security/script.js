// JavaScript for the four Campus Lost & Found pages

// Update the report status and summary values.
function updateReportSummary() {
    var reportRows = document.querySelectorAll("#reports-table tbody tr");
    var activeCount = 0;
    var recoveredCount = 0;

    for (var i = 0; i < reportRows.length; i++) {
        var statusCell = reportRows[i].querySelector(".report-status");

        if (statusCell) {
            if (statusCell.textContent === "Recovered") {
                recoveredCount++;
            } else {
                activeCount++;
            }
        }
    }

    var activeElement = document.getElementById("active-report-count");
    var recoveredElement = document.getElementById("recovered-report-count");

    if (activeElement) {
        activeElement.textContent = activeCount;
    }

    if (recoveredElement) {
        recoveredElement.textContent = recoveredCount;
    }
}

// Report History page
var reportTable = document.getElementById("reports-table");

if (reportTable) {
    var recoverButtons = document.querySelectorAll(".recover-report");

    for (var i = 0; i < recoverButtons.length; i++) {
        recoverButtons[i].addEventListener("click", function () {
            var row = this.parentElement.parentElement;
            var statusCell = row.querySelector(".report-status");
            var reportId = row.cells[0].textContent;

            statusCell.textContent = "Recovered";
            this.disabled = true;
            this.textContent = "Recovered";

            var detailId = reportId.replace("-", "").toLowerCase();
            var detailStatus = document.getElementById("detail-status-" + detailId);
            if (detailStatus) {
                detailStatus.textContent = "Recovered";
            }

            updateReportSummary();
            alert("Report status changed to Recovered.");
        });
    }

    var cancelButtons = document.querySelectorAll(".cancel-report");

    for (var j = 0; j < cancelButtons.length; j++) {
        cancelButtons[j].addEventListener("click", function () {
            var answer = confirm("Are you sure you want to cancel this report?");

            if (answer) {
                var row = this.parentElement.parentElement;
                row.remove();
                updateReportSummary();
                alert("Report cancelled.");
            }
        });
    }

    var editButtons = document.querySelectorAll(".edit-report");

    for (var k = 0; k < editButtons.length; k++) {
        editButtons[k].addEventListener("click", function () {
            var row = this.parentElement.parentElement;
            var itemCell = row.querySelector(".item-name");
            var oldName = itemCell.textContent;
            var newName = prompt("Enter the corrected item name:", oldName);

            if (newName !== null && newName.trim() !== "") {
                itemCell.textContent = newName.trim();
                alert("Item name updated.");
            }
        });
    }

    updateReportSummary();

    var claimRows = document.querySelectorAll("#claims-table tbody tr");
    var pendingClaims = 0;

    for (var m = 0; m < claimRows.length; m++) {
        var claimStatus = claimRows[m].querySelector(".claim-status");

        if (claimStatus && claimStatus.textContent === "Pending") {
            pendingClaims++;
        }
    }

    var pendingClaimElement = document.getElementById("pending-claim-count");
    if (pendingClaimElement) {
        pendingClaimElement.textContent = pendingClaims;
    }
}

// Security Dashboard page
var securityReportsTable = document.getElementById("security-reports-table");

if (securityReportsTable) {
    var acceptButtons = document.querySelectorAll(".accept-report");

    for (var n = 0; n < acceptButtons.length; n++) {
        acceptButtons[n].addEventListener("click", function () {
            var row = this.parentElement.parentElement;
            row.querySelector(".security-report-status").textContent = "Accepted";
            alert("Report accepted for further processing.");
        });
    }

    var dismissButtons = document.querySelectorAll(".dismiss-report");

    for (var p = 0; p < dismissButtons.length; p++) {
        dismissButtons[p].addEventListener("click", function () {
            var answer = confirm("Do you want to dismiss this report?");

            if (answer) {
                var row = this.parentElement.parentElement;
                row.querySelector(".security-report-status").textContent = "Dismissed";
                alert("Report dismissed.");
            }
        });
    }

    var updateClaimButtons = document.querySelectorAll(".update-claim");

    for (var q = 0; q < updateClaimButtons.length; q++) {
        updateClaimButtons[q].addEventListener("click", function () {
            var row = this.parentElement.parentElement;
            var decision = row.querySelector(".claim-decision").value;

            if (decision === "") {
                alert("Please select a claim decision.");
            } else {
                row.querySelector(".security-claim-status").textContent = decision;
                alert("Claim status updated to " + decision + ".");
            }
        });
    }


    var dismissClaimButtons = document.querySelectorAll(".dismiss-claim");

    for (var r = 0; r < dismissClaimButtons.length; r++) {
        dismissClaimButtons[r].addEventListener("click", function () {
            var answer = confirm("Are you sure this is a fake claim?");

            if (answer) {
                var row = this.parentElement.parentElement;
                row.querySelector(".security-claim-status").textContent = "Rejected";
                alert("Claim dismissed.");
            }
        });
    }

    var reportReviewForm = document.getElementById("report-review-form");

    reportReviewForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var reportId = document.getElementById("review-report-id").value.trim();

        if (reportId === "") {
            alert("Please enter a report ID.");
        } else {
            alert("Review note saved for this demonstration.");
            reportReviewForm.reset();
        }
    });

    var claimReviewForm = document.getElementById("claim-review-form");

    claimReviewForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var claimId = document.getElementById("review-claim-id").value.trim();
        var status = document.getElementById("claim-status").value;
        var note = document.getElementById("claim-note").value;

        if (claimId === "" || status === "" || note.trim() === "") {
            alert("Please enter a claim ID, select a status and write an officer note.");
        } else {
            alert("Claim status updated to " + status + " for " + claimId + ".");
            claimReviewForm.reset();
        }
    });
}

// Add a new activity row to the storage log.
function addActivity(itemId, activity, details) {
    var tableBody = document.querySelector("#activity-log tbody");

    if (tableBody) {
        var row = document.createElement("tr");
        var recordId = "LOG-" + (tableBody.rows.length + 1);
        var today = new Date();
        var month = today.getMonth() + 1;
        var day = today.getDate();

        if (month < 10) {
            month = "0" + month;
        }
        if (day < 10) {
            day = "0" + day;
        }

        var dateText = today.getFullYear() + "-" + month + "-" + day;

        var values = [recordId, itemId, activity, details, dateText, "Security Officer"];

        for (var i = 0; i < values.length; i++) {
            var cell = document.createElement("td");
            cell.textContent = values[i];
            row.appendChild(cell);
        }

        tableBody.appendChild(row);
    }
}

// Find an inventory row by its item ID.
function findInventoryRow(itemId) {
    var rows = document.querySelectorAll("#inventory-table tbody tr");

    for (var i = 0; i < rows.length; i++) {
        if (rows[i].cells[0].textContent.toLowerCase() === itemId.toLowerCase()) {
            return rows[i];
        }
    }

    return null;
}

// Storage and Handover page
var lockerForm = document.getElementById("locker-form");

if (lockerForm) {
    lockerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var itemId = document.getElementById("storage-item-id").value.trim();
        var lockerId = document.getElementById("locker-id").value.trim();
        var note = document.getElementById("storage-note").value.trim();
        var row = findInventoryRow(itemId);

        if (row === null) {
            alert("Item ID was not found in the inventory.");
        } else {
            row.querySelector(".locker-value").textContent = lockerId;
            row.querySelector(".storage-status").textContent = "In Storage";
            row.querySelector(".updated-date").textContent = new Date().toISOString().slice(0, 10);

            addActivity(itemId, "Locker assigned / relocated", "Locker: " + lockerId + ". " + note);
            alert("Locker information updated.");
            lockerForm.reset();
        }
    });
}

var handoverForm = document.getElementById("handover-form");

if (handoverForm) {
    handoverForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var itemId = document.getElementById("handover-item-id").value.trim();
        var recipient = document.getElementById("recipient-name").value.trim();
        var recipientId = document.getElementById("recipient-id").value.trim();
        var handoverDate = document.getElementById("handover-date").value;
        var signatureInput = document.getElementById("recipient-signature");
        var signatureName = "";
        var row = findInventoryRow(itemId);

        if (row === null) {
            alert("Item ID was not found in the inventory.");
        } else if (row.querySelector(".storage-status").textContent === "Disposed") {
            alert("A disposed item cannot be handed over.");
        } else if (signatureInput.files.length === 0) {
            alert("Please attach the recipient signature image.");
        } else if (signatureInput.files[0].type.indexOf("image/") !== 0) {
            alert("Please select an image file for the recipient signature.");
        } else {
            signatureName = signatureInput.files[0].name;
            row.querySelector(".storage-status").textContent = "Handed Over";
            row.querySelector(".locker-value").textContent = "-";

            addActivity(itemId, "Item handed over",
                "Recipient: " + recipient + " (" + recipientId + "), date: " + handoverDate + ", signature: " + signatureName);
            alert("Handover record added.");
            handoverForm.reset();
        }
    });
}

var disposalForm = document.getElementById("disposal-form");

if (disposalForm) {
    disposalForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var itemId = document.getElementById("disposal-item-id").value.trim();
        var reason = document.getElementById("disposal-reason").value;
        var details = document.getElementById("disposal-details").value.trim();
        var row = findInventoryRow(itemId);

        if (row === null) {
            alert("Item ID was not found in the inventory.");
        } else {
            row.querySelector(".storage-status").textContent = "Disposed";
            row.querySelector(".locker-value").textContent = "-";

            addActivity(itemId, "Item disposed", reason + ". " + details);
            alert("Disposal record added.");
            disposalForm.reset();
        }
    });
}

var voidSlipForm = document.getElementById("void-slip-form");

if (voidSlipForm) {
    voidSlipForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var slipId = document.getElementById("dispatch-slip-id").value.trim();
        var reason = document.getElementById("void-reason").value.trim();

        addActivity(slipId, "Dispatch slip voided", reason);
        alert("Dispatch slip marked as void in this demonstration.");
        voidSlipForm.reset();
    });
}

// Profile page
var profileForm = document.getElementById("profile-form");

if (profileForm) {
    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        document.getElementById("profile-name").textContent =
            document.getElementById("full-name").value;
        document.getElementById("profile-id").textContent =
            document.getElementById("student-id").value;
        document.getElementById("profile-email").textContent =
            document.getElementById("email").value;
        document.getElementById("profile-department").textContent =
            document.getElementById("department").value;

        var phone = document.getElementById("phone").value;
        if (phone === "") {
            phone = "Not provided";
        }
        document.getElementById("profile-phone").textContent = phone;

        var pictureInput = document.getElementById("profile-picture");

        if (pictureInput.files.length > 0) {
            var picture = pictureInput.files[0];

            if (picture.type.indexOf("image/") === 0) {
                document.getElementById("profile-picture-name").textContent =
                    "Selected picture: " + picture.name;
            } else {
                alert("Please select an image file.");
                return;
            }
        }

        alert("Profile information updated on this page.");
    });
}

var passwordForm = document.getElementById("password-form");

if (passwordForm) {
    passwordForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var newPassword = document.getElementById("new-password").value;
        var confirmPassword = document.getElementById("confirm-password").value;

        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match.");
        } else {
            alert("Password form validated. A real password change requires a backend.");
            passwordForm.reset();
        }
    });
}

var notificationForm = document.getElementById("notification-form");

if (notificationForm) {
    notificationForm.addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Notification settings saved for this demonstration.");
    });
}

// Display the selected profile picture name.
var profilePictureInput = document.getElementById("profile-picture");

if (profilePictureInput) {
    profilePictureInput.addEventListener("change", function () {
        var pictureName = document.getElementById("profile-picture-name");

        if (this.files.length > 0) {
            pictureName.textContent = "Selected picture: " + this.files[0].name;
        } else {
            pictureName.textContent = "Choose a profile picture";
        }
    });
}
