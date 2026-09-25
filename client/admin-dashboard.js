const adminToken = sessionStorage.getItem("royalDCAdminToken");

if (!adminToken) {
    window.location.href = "/admin-login.html";
}

const adminName = document.getElementById("adminName");
const logoutBtn = document.getElementById("logoutBtn");

const totalRooms = document.getElementById("totalRooms");
const availableRooms = document.getElementById("availableRooms");
const totalBookings = document.getElementById("totalBookings");
const pendingBookings = document.getElementById("pendingBookings");


/* =========================
   ADMIN DETAILS
========================= */

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
        console.error("Admin details error:", error);

        sessionStorage.removeItem("royalDCAdminToken");
        sessionStorage.removeItem("royalDCAdmin");

        window.location.href = "/admin-login.html";
    }
}


/* =========================
   ROOM STATISTICS
========================= */

async function loadRoomStats() {
    try {
        const response = await fetch("/api/rooms");
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load rooms."
            );
        }

        const rooms = data.rooms || [];

        totalRooms.textContent = rooms.length;

        const available = rooms.filter(function (room) {
            return room.status === "available";
        });

        availableRooms.textContent = available.length;

    } catch (error) {
        console.error("Room statistics error:", error);

        totalRooms.textContent = "—";
        availableRooms.textContent = "—";
    }
}


/* =========================
   BOOKING STATISTICS
========================= */

async function loadBookingStats() {
    try {
        const response = await fetch("/api/bookings");
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load bookings."
            );
        }

        const bookings = data.bookings || [];

        totalBookings.textContent = bookings.length;

        const pending = bookings.filter(function (booking) {
            return booking.bookingStatus === "pending";
        });

        pendingBookings.textContent = pending.length;

    } catch (error) {
        console.error("Booking statistics error:", error);

        totalBookings.textContent = "—";
        pendingBookings.textContent = "—";
    }
}


/* =========================
   ROOMS NAVIGATION
========================= */

function openRoomsPage(event) {
    if (event) {
        event.preventDefault();
    }

    window.location.href = "/admin-rooms.html";
}


const manageRooms =
    document.getElementById("manageRooms");

if (manageRooms) {
    manageRooms.addEventListener(
        "click",
        openRoomsPage
    );
}


const roomsLink =
    document.getElementById("roomsLink");

if (roomsLink) {
    roomsLink.addEventListener(
        "click",
        openRoomsPage
    );
}


/* =========================
   BOOKINGS NAVIGATION
========================= */

function openBookingsPage(event) {
    if (event) {
        event.preventDefault();
    }

    window.location.href = "/admin-bookings.html";
}


const manageBookings =
    document.getElementById("manageBookings");

if (manageBookings) {
    manageBookings.addEventListener(
        "click",
        openBookingsPage
    );
}


const bookingsLink =
    document.getElementById("bookingsLink");

if (bookingsLink) {
    bookingsLink.addEventListener(
        "click",
        openBookingsPage
    );
}


/* =========================
   PAYMENTS NAVIGATION
========================= */

function openPaymentsPage(event) {
    if (event) {
        event.preventDefault();
    }

    window.location.href = "/admin-payments.html";
}


const managePayments =
    document.getElementById("managePayments");

if (managePayments) {
    managePayments.addEventListener(
        "click",
        openPaymentsPage
    );
}


const paymentsLink =
    document.getElementById("paymentsLink");

if (paymentsLink) {
    paymentsLink.addEventListener(
        "click",
        openPaymentsPage
    );
}


/* =========================
   LOGOUT
========================= */

if (logoutBtn) {
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
}


/* =========================
   START
========================= */

loadAdminDetails();
loadRoomStats();
loadBookingStats();