const adminToken = sessionStorage.getItem("royalDCAdminToken");

if (!adminToken) {
    window.location.href = "/admin-login.html";
}

const adminName = document.getElementById("adminName");
const logoutBtn = document.getElementById("logoutBtn");
const roomsContainer = document.getElementById("roomsContainer");


// ========================================
// LOAD ADMIN DETAILS
// ========================================

async function loadAdminDetails() {
    try {
        const response = await fetch("/api/admin/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Authentication failed."
            );
        }

        adminName.textContent = data.admin.name;

    } catch (error) {
        console.error("Admin authentication error:", error);

        sessionStorage.removeItem("royalDCAdminToken");
        sessionStorage.removeItem("royalDCAdmin");

        window.location.href = "/admin-login.html";
    }
}


// ========================================
// LOAD ROOMS
// ========================================

async function loadRooms() {
    roomsContainer.innerHTML = `
        <div class="loading">
            Loading rooms...
        </div>
    `;

    try {
        const response = await fetch("/api/rooms");

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load rooms."
            );
        }

        const rooms = data.rooms || [];

        if (rooms.length === 0) {
            roomsContainer.innerHTML = `
                <div class="empty">
                    No rooms found.
                </div>
            `;

            return;
        }

        roomsContainer.innerHTML = "";

        rooms.forEach(function (room) {

            const roomCard = document.createElement("div");

            roomCard.className = "room-card";

            const status = room.status || "available";

            const statusText =
                status.charAt(0).toUpperCase() +
                status.slice(1);

            roomCard.innerHTML = `
                <div class="room-header">

                    <div>
                        <div class="room-number">
                            ROOM ${escapeHtml(room.roomNumber)}
                        </div>

                        <h2 class="room-title">
                            ${escapeHtml(room.title)}
                        </h2>
                    </div>

                    <span class="status ${escapeHtml(status)}">
                        ${escapeHtml(statusText)}
                    </span>

                </div>


                <div class="room-description">
                    ${escapeHtml(room.description)}
                </div>


                <div class="room-details">

                    <div class="detail-box">

                        <div class="detail-label">
                            ROOM TYPE
                        </div>

                        <div class="detail-value">
                            ${escapeHtml(room.roomType)}
                        </div>

                    </div>


                    <div class="detail-box">

                        <div class="detail-label">
                            MAX GUESTS
                        </div>

                        <div class="detail-value">
                            ${escapeHtml(String(room.maxGuests))}
                        </div>

                    </div>


                    <div class="detail-box">

                        <div class="detail-label">
                            BED
                        </div>

                        <div class="detail-value">
                            ${escapeHtml(room.bedType)}
                        </div>

                    </div>


                    <div class="detail-box">

                        <div class="detail-label">
                            SIZE
                        </div>

                        <div class="detail-value">
                            ${escapeHtml(room.size)}
                        </div>

                    </div>

                </div>


                <div class="price">
                    ₹${Number(room.pricePerNight).toLocaleString("en-IN")}
                    <span>/ night</span>
                </div>


                <div class="room-actions">

                    ${
                        status === "available"
                        ?
                        `
                        <button
                            type="button"
                            class="action-btn maintenance-btn"
                            data-room-id="${escapeHtml(room._id)}"
                            data-new-status="maintenance"
                        >
                            Set Maintenance
                        </button>
                        `
                        :
                        `
                        <button
                            type="button"
                            class="action-btn available-btn"
                            data-room-id="${escapeHtml(room._id)}"
                            data-new-status="available"
                        >
                            Set Available
                        </button>
                        `
                    }

                </div>
            `;

            roomsContainer.appendChild(roomCard);
        });

        attachStatusButtons();

    } catch (error) {
        console.error("Load rooms error:", error);

        roomsContainer.innerHTML = `
            <div class="error">
                Unable to load rooms. Please try again.
            </div>
        `;
    }
}


// ========================================
// UPDATE ROOM STATUS
// ========================================

function attachStatusButtons() {

    const buttons = document.querySelectorAll(
        "[data-room-id]"
    );

    buttons.forEach(function (button) {

        button.addEventListener("click", async function () {

            const roomId = button.dataset.roomId;
            const newStatus = button.dataset.newStatus;

            if (!roomId || !newStatus) {
                return;
            }

            const confirmMessage =
                newStatus === "maintenance"
                    ? "Set this room to maintenance?"
                    : "Make this room available again?";

            const confirmed = window.confirm(
                confirmMessage
            );

            if (!confirmed) {
                return;
            }

            button.disabled = true;
            button.textContent = "Updating...";

            try {

                const response = await fetch(
                    `/api/rooms/${roomId}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${adminToken}`
                        },

                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                        "Unable to update room status."
                    );
                }

                await loadRooms();

            } catch (error) {

                console.error(
                    "Room status update error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to update room status."
                );

                button.disabled = false;

                button.textContent =
                    newStatus === "maintenance"
                        ? "Set Maintenance"
                        : "Set Available";
            }
        });
    });
}


// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener(
    "click",
    function () {

        sessionStorage.removeItem(
            "royalDCAdminToken"
        );

        sessionStorage.removeItem(
            "royalDCAdmin"
        );

        window.location.href =
            "/admin-login.html";
    }
);


// ========================================
// SIDEBAR
// ========================================

document
    .getElementById("bookingsLink")
    .addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/admin-bookings.html";
        }
    );


document
    .getElementById("paymentsLink")
    .addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            alert(
                "Payment Management page will be added next."
            );
        }
    );


// ========================================
// SECURITY HELPER
// ========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// INITIAL LOAD
// ========================================

loadAdminDetails();
loadRooms();