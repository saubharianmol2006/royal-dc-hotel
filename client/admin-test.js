const loginForm = document.getElementById("loginForm");
const result = document.getElementById("result");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    result.style.display = "block";
    result.className = "";
    result.textContent = "Logging in...";

    try {
        // STEP 1: Login
        const loginResponse = await fetch(
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

        const loginData = await loginResponse.json();

        if (!loginResponse.ok || !loginData.success) {
            result.className = "error";
            result.textContent =
                loginData.message || "Login failed.";
            return;
        }

        // Save JWT token
        sessionStorage.setItem(
            "royalDCAdminToken",
            loginData.token
        );

        sessionStorage.setItem(
            "royalDCAdmin",
            JSON.stringify(loginData.admin)
        );

        result.textContent =
            "Login successful!\n\n" +
            "Checking protected Admin API...";

        // STEP 2: Test protected /me API
        const token =
            sessionStorage.getItem(
                "royalDCAdminToken"
            );

        const meResponse = await fetch(
            "/api/admin/me",
            {
                method: "GET",
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        const meData = await meResponse.json();

        if (!meResponse.ok || !meData.success) {
            result.className = "error";

            result.textContent =
                "LOGIN SUCCESSFUL\n\n" +
                "But protected Admin API failed.\n\n" +
                (meData.message ||
                    "Unable to access /api/admin/me");

            return;
        }

        // Everything worked
        result.className = "success";

        result.textContent =
            "ADMIN AUTHENTICATION SUCCESSFUL!\n\n" +
            "Admin Name: " +
            meData.admin.name +
            "\n" +
            "Email: " +
            meData.admin.email +
            "\n" +
            "Role: " +
            meData.admin.role +
            "\n\n" +
            "JWT Login: SUCCESS\n" +
            "Protected API: SUCCESS";

    } catch (error) {
        console.error(error);

        result.className = "error";

        result.textContent =
            "Unable to connect to server.\n\n" +
            error.message;
    }
});