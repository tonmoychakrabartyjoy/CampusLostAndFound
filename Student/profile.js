function updateStudentProfile(event) {
    event.preventDefault();

    let nameInput = document.getElementById("full_name");
    let deptInput = document.getElementById("department");
    let phoneInput = document.getElementById("phone_number");
    let msg = document.getElementById("profile_msg");

    nameInput.style.borderColor = "#cbd5e1";
    phoneInput.style.borderColor = "#cbd5e1";
    msg.style.color = "#d93025";

    let nameVal = nameInput.value.trim();
    let deptVal = deptInput.value;
    let phoneVal = phoneInput.value.trim();

    if (nameVal.length < 3) {
        msg.innerText = "Full name must be at least 3 characters long.";
        nameInput.style.borderColor = "#d93025";
        nameInput.focus();
        return false;
    }

    let cleanPhone = phoneVal.replace(/[\s-]/g, "");
    let bdPhonePattern = /^(?:\+8801|01)[3-9]\d{8}$/;
    if (!bdPhonePattern.test(cleanPhone)) {
        msg.innerText = "Enter a valid Bangladesh phone number (e.g., +880 17XXXXXXXX or 017XXXXXXXX).";
        phoneInput.style.borderColor = "#d93025";
        phoneInput.focus();
        return false;
    }

    document.getElementById("display_fullname").innerText = nameVal;
    document.getElementById("display_dept").innerText = deptVal;
    document.getElementById("display_phone").innerText = phoneVal;

    let parts = nameVal.split(" ");
    let initials = parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) {
        initials += parts[1].charAt(0).toUpperCase();
    }
    document.getElementById("avatar_initials").innerText = initials;
    document.getElementById("nav_username").innerText = parts[0] + " (Student)";

    msg.style.color = "#137333";
    msg.innerText = "Profile details updated successfully!";
    return false;
}

function changePassword(event) {
    event.preventDefault();

    let currInput = document.getElementById("current_password");
    let newInput = document.getElementById("new_password");
    let confInput = document.getElementById("confirm_password");
    let msg = document.getElementById("password_msg");

    currInput.style.borderColor = "#cbd5e1";
    newInput.style.borderColor = "#cbd5e1";
    confInput.style.borderColor = "#cbd5e1";
    msg.style.color = "#d93025";

    let currVal = currInput.value;
    let newVal = newInput.value;
    let confVal = confInput.value;

    if (currVal === "") {
        msg.innerText = "Please enter your current password.";
        currInput.style.borderColor = "#d93025";
        currInput.focus();
        return false;
    }

    if (newVal.length < 6) {
        msg.innerText = "New password must be at least 6 characters long.";
        newInput.style.borderColor = "#d93025";
        newInput.focus();
        return false;
    }

    if (newVal === currVal) {
        msg.innerText = "New password must be different from your current password.";
        newInput.style.borderColor = "#d93025";
        newInput.focus();
        return false;
    }

    if (newVal !== confVal) {
        msg.innerText = "New password and confirmation password do not match.";
        confInput.style.borderColor = "#d93025";
        confInput.focus();
        return false;
    }

    msg.style.color = "#137333";
    msg.innerText = "Portal password updated successfully!";
    document.getElementById("password_form").reset();
    return false;
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