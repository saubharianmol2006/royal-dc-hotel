const loginForm = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const message = document.getElementById("message");
const showPasswordButton = document.getElementById("showPassword");


// Show / Hide Password
showPasswordButton.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showPasswordButton.textContent = "HIDE";
    } else {
        passwordInput.type = "password";
        showPasswordButton.textContent = "SHOW";
    }
});


// Admin Login
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage(
            "Please enter your email and password.",
            "error"
        );

        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Signing In...";

    hideMessage();

    try {
        const response = await fetch(
            "/api/admin/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            showMessage(
                data.message ||
                "Invalid email or password.",
                "error"
            );

            return;
        }


        // Save authentication token
        sessionStorage.setItem(
            "royalDCAdminToken",
            data.token
        );


        // Save admin information
        sessionStorage.setItem(
            "royalDCAdmin",
            JSON.stringify(data.admin)
        );


        showMessage(
            "Login successful. Redirecting...",
            "success"
        );


        // Redirect to Admin Dashboard
        setTimeout(function () {
            window.location.href =
                "/admin-dashboard.html";
        }, 700);

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        showMessage(
            "Unable to connect to the server. Please try again.",
            "error"
        );

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "Sign In";
    }
});


// Show message
function showMessage(text, type) {

    message.textContent = text;

    message.className =
        "message " + type;
}


// Hide message
function hideMessage() {

    message.textContent = "";

    message.className = "message";
}