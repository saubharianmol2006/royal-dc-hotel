const adminToken = sessionStorage.getItem("royalDCAdminToken");

if (!adminToken) {
    window.location.href = "/admin-login.html";
}


/* =========================
   ELEMENTS
========================= */

const adminName = document.getElementById("adminName");
const logoutBtn = document.getElementById("logoutBtn");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const paymentFilter = document.getElementById("paymentFilter");

const bookingsContainer =
    document.getElementById("bookingsContainer");

const paymentsLink =
    document.getElementById("paymentsLink");


/* =========================
   DATA
========================= */

let allBookings = [];


/* =========================
   ADMIN DETAILS
========================= */

async function loadAdminDetails() {
    try {
        const response = await fetch(
            "/api/admin/me",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Authentication failed."
            );
        }

        adminName.textContent =
            data.admin.name;

    } catch (error) {

        console.error(
            "Admin details error:",
            error
        );

        sessionStorage.removeItem(
            "royalDCAdminToken"
        );

        sessionStorage.removeItem(
            "royalDCAdmin"
        );

        window.location.href =
            "/admin-login.html";
    }
}


/* =========================
   LOAD BOOKINGS
========================= */

async function loadBookings() {

    bookingsContainer.innerHTML = `
        <div class="loading">
            Loading bookings...
        </div>
    `;

    try {

        const response = await fetch(
            "/api/bookings"
        );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load bookings."
            );
        }

        allBookings =
            data.bookings || [];

        renderBookings();

    } catch (error) {

        console.error(
            "Booking loading error:",
            error
        );

        bookingsContainer.innerHTML = `
            <div class="error">
                Unable to load bookings.
                Please refresh the page and try again.
            </div>
        `;
    }
}


/* =========================
   FILTER BOOKINGS
========================= */

function getFilteredBookings() {

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value;

    const selectedPayment =
        paymentFilter.value;


    return allBookings.filter(
        function (booking) {

            const bookingId =
                String(
                    booking.bookingId || ""
                ).toLowerCase();


            const guestName =
                String(
                    booking.guestName || ""
                ).toLowerCase();


            const guestEmail =
                String(
                    booking.guestEmail || ""
                ).toLowerCase();


            const bookingStatus =
                String(
                    booking.bookingStatus ||
                    "pending"
                ).toLowerCase();


            const paymentStatus =
                String(
                    booking.paymentStatus ||
                    "pending"
                ).toLowerCase();


            const matchesSearch =
                !searchValue ||
                bookingId.includes(searchValue) ||
                guestName.includes(searchValue) ||
                guestEmail.includes(searchValue);


            const matchesStatus =
                selectedStatus === "all" ||
                bookingStatus === selectedStatus;


            const matchesPayment =
                selectedPayment === "all" ||
                paymentStatus === selectedPayment;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment
            );
        }
    );
}


/* =========================
   RENDER BOOKINGS
========================= */

function renderBookings() {

    const bookings =
        getFilteredBookings();


    if (bookings.length === 0) {

        bookingsContainer.innerHTML = `
            <div class="empty">

                <h3>
                    No bookings found
                </h3>

                <p>
                    No bookings match your
                    current filters.
                </p>

            </div>
        `;

        return;
    }


    bookingsContainer.innerHTML =
        bookings
            .map(function (booking) {

                return createBookingCard(
                    booking
                );

            })
            .join("");


    attachBookingActionButtons();
}


/* =========================
   CREATE BOOKING CARD
========================= */

function createBookingCard(booking) {

    const bookingId =
        escapeHtml(
            booking.bookingId || "—"
        );


    const guestName =
        escapeHtml(
            booking.guestName || "Guest"
        );


    const guestEmail =
        escapeHtml(
            booking.guestEmail || "—"
        );


    const guestPhone =
        escapeHtml(
            booking.guestPhone || "—"
        );


    const roomNumber =
        escapeHtml(
            booking.roomNumber || "—"
        );


    let roomType = "—";

    if (
        booking.room &&
        booking.room.roomType
    ) {
        roomType =
            escapeHtml(
                booking.room.roomType
            );
    }


    const bookingStatus =
        booking.bookingStatus ||
        "pending";


    const paymentStatus =
        booking.paymentStatus ||
        "pending";


    const adults =
        Number(booking.adults || 0);


    const children =
        Number(booking.children || 0);


    const totalNights =
        Number(
            booking.totalNights || 0
        );


    const pricePerNight =
        formatCurrency(
            booking.pricePerNight
        );


    const totalAmount =
        formatCurrency(
            booking.totalAmount
        );


    const checkIn =
        formatDate(
            booking.checkIn
        );


    const checkOut =
        formatDate(
            booking.checkOut
        );


    const bookedOn =
        formatDate(
            booking.createdAt
        );


    const paymentMethod =
        formatPaymentMethod(
            booking.paymentMethod
        );


    const specialRequest =
        escapeHtml(
            booking.specialRequest ||
            "None"
        );


    const statusClass =
        getBookingStatusClass(
            bookingStatus
        );


    const paymentClass =
        getPaymentStatusClass(
            paymentStatus
        );


    const actions =
        getBookingActions(
            booking
        );


    return `
        <article
            class="booking-card"
            data-booking-id="${escapeHtml(
                booking._id || ""
            )}"
        >

            <div class="booking-header">

                <div>

                    <div class="booking-id">
                        ${bookingId}
                    </div>

                    <div class="guest-name">
                        ${guestName}
                    </div>

                    <div class="guest-email">
                        ${guestEmail}
                        &nbsp; • &nbsp;
                        ${guestPhone}
                    </div>

                </div>


                <div class="status-group">

                    <span class="status ${statusClass}">
                        ${escapeHtml(
                            formatBookingStatus(
                                bookingStatus
                            )
                        )}
                    </span>

                    <span class="status ${paymentClass}">
                        ${escapeHtml(
                            formatPaymentStatus(
                                paymentStatus
                            )
                        )}
                    </span>

                </div>

            </div>


            <div class="booking-details">


                <div class="detail-box">

                    <div class="detail-label">
                        ROOM
                    </div>

                    <div class="detail-value">
                        Room ${roomNumber}
                        <br>
                        ${roomType}
                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        CHECK-IN
                    </div>

                    <div class="detail-value">
                        ${checkIn}
                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        CHECK-OUT
                    </div>

                    <div class="detail-value">
                        ${checkOut}
                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        GUESTS
                    </div>

                    <div class="detail-value">

                        ${adults}
                        Adult${adults === 1 ? "" : "s"}

                        ${
                            children > 0
                                ? `
                                    <br>
                                    ${children}
                                    Child${children === 1 ? "" : "ren"}
                                  `
                                : ""
                        }

                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        TOTAL NIGHTS
                    </div>

                    <div class="detail-value">
                        ${totalNights}
                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        PRICE / NIGHT
                    </div>

                    <div class="detail-value">
                        ${pricePerNight}
                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        PAYMENT METHOD
                    </div>

                    <div class="detail-value">
                        ${paymentMethod}
                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        BOOKED ON
                    </div>

                    <div class="detail-value">
                        ${bookedOn}
                    </div>

                </div>


            </div>


            <div class="booking-footer">

                <div class="special-request">

                    <strong>
                        Special Request:
                    </strong>

                    ${specialRequest}

                </div>


                <div class="amount">

                    ${totalAmount}

                    <span>
                        total
                    </span>

                </div>

            </div>


            ${
                actions
                    ? `
                        <div
                            class="booking-actions"
                            style="
                                margin-top: 18px;
                                padding-top: 18px;
                                border-top: 1px solid #eeeeee;
                                display: flex;
                                gap: 10px;
                                flex-wrap: wrap;
                            "
                        >
                            ${actions}
                        </div>
                      `
                    : ""
            }

        </article>
    `;
}


/* =========================
   BOOKING ACTIONS
========================= */

function getBookingActions(booking) {

    const status =
        booking.bookingStatus;


    if (status === "pending") {

        return `
            <button
                type="button"
                class="booking-action-btn"
                data-booking-id="${escapeHtml(
                    booking._id
                )}"
                data-new-status="confirmed"
                style="
                    border: 1px solid #18763a;
                    background: #18763a;
                    color: #fff;
                    padding: 9px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                "
            >
                Confirm Booking
            </button>

            <button
                type="button"
                class="booking-action-btn"
                data-booking-id="${escapeHtml(
                    booking._id
                )}"
                data-new-status="cancelled"
                style="
                    border: 1px solid #b42323;
                    background: #fff;
                    color: #b42323;
                    padding: 9px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                "
            >
                Cancel Booking
            </button>
        `;
    }


    if (status === "confirmed") {

        return `
            <button
                type="button"
                class="booking-action-btn"
                data-booking-id="${escapeHtml(
                    booking._id
                )}"
                data-new-status="checked-in"
                style="
                    border: 1px solid #235ea8;
                    background: #235ea8;
                    color: #fff;
                    padding: 9px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                "
            >
                Check-in
            </button>

            <button
                type="button"
                class="booking-action-btn"
                data-booking-id="${escapeHtml(
                    booking._id
                )}"
                data-new-status="cancelled"
                style="
                    border: 1px solid #b42323;
                    background: #fff;
                    color: #b42323;
                    padding: 9px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                "
            >
                Cancel Booking
            </button>
        `;
    }


    if (status === "checked-in") {

        return `
            <button
                type="button"
                class="booking-action-btn"
                data-booking-id="${escapeHtml(
                    booking._id
                )}"
                data-new-status="checked-out"
                style="
                    border: 1px solid #555;
                    background: #555;
                    color: #fff;
                    padding: 9px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                "
            >
                Check-out
            </button>
        `;
    }


    return "";
}


/* =========================
   ACTION BUTTON EVENTS
========================= */

function attachBookingActionButtons() {

    const buttons =
        document.querySelectorAll(
            ".booking-action-btn"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            async function () {

                const bookingId =
                    button.dataset.bookingId;

                const newStatus =
                    button.dataset.newStatus;


                if (
                    !bookingId ||
                    !newStatus
                ) {
                    return;
                }


                const readableStatus =
                    formatBookingStatus(
                        newStatus
                    );


                const confirmed =
                    window.confirm(
                        `Are you sure you want to change this booking to "${readableStatus}"?`
                    );


                if (!confirmed) {
                    return;
                }


                await updateBookingStatus(
                    bookingId,
                    newStatus,
                    button
                );

            }
        );

    });
}


/* =========================
   UPDATE BOOKING STATUS
========================= */

async function updateBookingStatus(
    bookingId,
    newStatus,
    button
) {

    const originalText =
        button.textContent;


    button.disabled = true;

    button.textContent =
        "Updating...";


    try {

        const response =
            await fetch(
                `/api/bookings/${encodeURIComponent(
                    bookingId
                )}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${adminToken}`
                    },

                    body: JSON.stringify({
                        bookingStatus:
                            newStatus
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to update booking."
            );
        }


        await loadBookings();


    } catch (error) {

        console.error(
            "Booking status update error:",
            error
        );


        alert(
            error.message ||
            "Unable to update booking."
        );


        button.disabled = false;

        button.textContent =
            originalText;
    }
}


/* =========================
   SEARCH
========================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            renderBookings();

        }
    );
}


/* =========================
   BOOKING STATUS FILTER
========================= */

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        function () {

            renderBookings();

        }
    );
}


/* =========================
   PAYMENT FILTER
========================= */

if (paymentFilter) {

    paymentFilter.addEventListener(
        "change",
        function () {

            renderBookings();

        }
    );
}


/* =========================
   PAYMENTS PAGE
========================= */

if (paymentsLink) {

    paymentsLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            window.location.href =
                "/admin-payments.html";
        }
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
   BOOKING STATUS CLASS
========================= */

function getBookingStatusClass(status) {

    switch (
        String(status).toLowerCase()
    ) {

        case "confirmed":
            return "confirmed";

        case "checked-in":
            return "checked-in";

        case "checked-out":
            return "checked-out";

        case "cancelled":
            return "cancelled";

        case "pending":
        default:
            return "pending";
    }
}


/* =========================
   PAYMENT STATUS CLASS
========================= */

function getPaymentStatusClass(status) {

    switch (
        String(status).toLowerCase()
    ) {

        case "paid":
            return "paid";

        case "failed":
            return "failed";

        case "refunded":
            return "failed";

        case "pending":
        default:
            return "payment-pending";
    }
}


/* =========================
   BOOKING STATUS TEXT
========================= */

function formatBookingStatus(status) {

    switch (
        String(status).toLowerCase()
    ) {

        case "checked-in":
            return "Checked In";

        case "checked-out":
            return "Checked Out";

        default:
            return String(status)
                .replace(/-/g, " ")
                .replace(
                    /\b\w/g,
                    function (letter) {
                        return letter.toUpperCase();
                    }
                );
    }
}


/* =========================
   PAYMENT STATUS TEXT
========================= */

function formatPaymentStatus(status) {

    switch (
        String(status).toLowerCase()
    ) {

        case "pending":
            return "Payment Pending";

        default:
            return String(status)
                .replace(/-/g, " ")
                .replace(
                    /\b\w/g,
                    function (letter) {
                        return letter.toUpperCase();
                    }
                );
    }
}


/* =========================
   PAYMENT METHOD
========================= */

function formatPaymentMethod(method) {

    switch (
        String(method).toLowerCase()
    ) {

        case "razorpay":
            return "Razorpay";

        case "cash":
            return "Cash";

        case "other":
            return "Other";

        default:
            return method || "—";
    }
}


/* =========================
   CURRENCY
========================= */

function formatCurrency(amount) {

    const value =
        Number(amount || 0);


    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(value);
}


/* =========================
   DATE
========================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================
   START APPLICATION
========================= */

loadAdminDetails();

loadBookings();