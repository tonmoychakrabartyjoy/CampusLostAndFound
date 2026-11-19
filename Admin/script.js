// JavaScript for requirements 01 to 04

// Public Home Page: Search recent item cards.
var searchForm = document.getElementById("search-form");

if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var keyword = document.getElementById("keyword").value.toLowerCase();
        var itemCards = document.querySelectorAll(".item-card");
        var foundCount = 0;

        for (var i = 0; i < itemCards.length; i++) {
            var itemText = itemCards[i].textContent.toLowerCase();

            if (itemText.indexOf(keyword) !== -1) {
                itemCards[i].style.display = "block";
                foundCount++;
            } else {
                itemCards[i].style.display = "none";
            }
        }

        if (itemCards.length === 0) {
            alert("There are no recent listings to search right now.");
        } else if (foundCount === 0) {
            alert("No matching item was found.");
        }
    });
}

// Public Home Page: Category shortcut buttons.
var categoryButtons = document.querySelectorAll(".category-button");

for (var j = 0; j < categoryButtons.length; j++) {
    categoryButtons[j].addEventListener("click", function () {
        var selectedCategory = this.getAttribute("data-category");
        var itemCards = document.querySelectorAll(".item-card");
        var foundCount = 0;

        for (var k = 0; k < categoryButtons.length; k++) {
            categoryButtons[k].classList.remove("active");
        }

        this.classList.add("active");

        for (var m = 0; m < itemCards.length; m++) {
            var itemCategory = itemCards[m].getAttribute("data-category");

            if (itemCategory === selectedCategory) {
                itemCards[m].style.display = "block";
                foundCount++;
            } else {
                itemCards[m].style.display = "none";
            }
        }

        if (itemCards.length === 0) {
            alert("There are no listings in this category right now.");
        } else if (foundCount === 0) {
            alert("No item is available in this category.");
        }
    });
}

// Login Page: Four predefined demonstration accounts.
// These passwords are visible in JavaScript. Do not use this for real security.
var defaultUsers = [
    {username: "student", password: "student123", role: "student", page: "dashboard.html"},
    {username: "staff", password: "staff123", role: "staff", page: "dashboard.html"},
    {username: "security", password: "security123", role: "security", page: "security_dashboard.html"},
    {username: "admin", password: "admin123", role: "admin", page: "admin_dashboard.html"}
];

var loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var username = document.getElementById("login-id").value.trim();
        var password = document.getElementById("login-password").value;
        var role = document.getElementById("login-role").value;
        var matchedUser = null;
        var message = document.getElementById("login-message");

        for (var i = 0; i < defaultUsers.length; i++) {
            if (username === defaultUsers[i].username &&
                password === defaultUsers[i].password &&
                role === defaultUsers[i].role) {
                matchedUser = defaultUsers[i];
                break;
            }
        }

        if (matchedUser === null) {
            message.textContent = "Incorrect username, password or user role.";
        } else {
            message.textContent = "";
            // Redirect only: a backend is required to protect role-specific pages.
            window.location.href = matchedUser.page;
        }
    });
}

// Registration Page: Check that both password fields match.
var registerForm = document.getElementById("register-form");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var password = document.getElementById("register-password").value;
        var confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Password and Confirm Password do not match.");
        } else {
            alert("Registration form is valid. Saving a real account requires a backend.");
            registerForm.reset();
        }
    });
}

// Password Recovery Page: Request a reset token.
var requestTokenButton = document.getElementById("request-token-button");

if (requestTokenButton) {
    requestTokenButton.addEventListener("click", function () {
        var email = document.getElementById("recovery-email");

        if (email.value === "") {
            alert("Please enter your institutional email.");
        } else if (email.checkValidity() === false) {
            alert("Please enter a valid email address.");
        } else {
            alert("Email accepted for this demonstration. A real reset token must be sent by a backend service.");
        }
    });
}

// Password Recovery Page: Validate token field and new password fields.
var recoveryForm = document.getElementById("recovery-form");

if (recoveryForm) {
    recoveryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var email = document.getElementById("recovery-email").value;
        var token = document.getElementById("security-token").value;
        var newPassword = document.getElementById("new-password").value;
        var confirmPassword = document.getElementById("confirm-new-password").value;

        if (email === "" || token === "" || newPassword === "" || confirmPassword === "") {
            alert("Please fill in all required fields.");
        } else if (newPassword !== confirmPassword) {
            alert("New Password and Confirm New Password do not match.");
        } else {
            alert("The form is valid. Real token verification and password update require a backend.");
            recoveryForm.reset();
        }
    });
}
