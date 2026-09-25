const adminToken = sessionStorage.getItem("royalDCAdminToken");

if (!adminToken) {
    window.location.href = "/admin-login.html";
}


/* =========================
   ELEMENTS
========================= */

const adminName =
    document.getElementById("adminName");

const logoutBtn =
    document.getElementById("logoutBtn");

const searchInput =
    document.getElementById("searchInput");

const paymentStatusFilter =
    document.getElementById("paymentStatusFilter");

const paymentMethodFilter =
    document.getElementById("paymentMethodFilter");

const paymentsContainer =
    document.getElementById("paymentsContainer");


/* =========================
   DATA
========================= */

let allPayments = [];


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
                    Authorization:
                        `Bearer ${adminToken}`
                }
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
   LOAD PAYMENT RECORDS
========================= */

async function loadPayments() {

    paymentsContainer.innerHTML = `
        <div class="loading">
            Loading payments...
        </div>
    `;

    try {

        const response =
            await fetch("/api/bookings");

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                data.message ||
                "Unable to load payment records."
            );
        }

        allPayments =
            data.bookings || [];

        renderPayments();

    } catch (error) {

        console.error(
            "Payment loading error:",
            error
        );

        paymentsContainer.innerHTML = `
            <div class="error-message">
                Unable to load payment records.
                Please refresh the page and try again.
            </div>
        `;
    }
}


/* =========================
   FILTER PAYMENTS
========================= */

function getFilteredPayments() {

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        paymentStatusFilter.value;

    const selectedMethod =
        paymentMethodFilter.value;


    return allPayments.filter(
        function (payment) {

            const bookingId =
                String(
                    payment.bookingId || ""
                ).toLowerCase();


            const guestName =
                String(
                    payment.guestName || ""
                ).toLowerCase();


            const guestEmail =
                String(
                    payment.guestEmail || ""
                ).toLowerCase();


            const paymentStatus =
                String(
                    payment.paymentStatus ||
                    "pending"
                ).toLowerCase();


            const paymentMethod =
                String(
                    payment.paymentMethod ||
                    "razorpay"
                ).toLowerCase();


            const matchesSearch =
                !searchValue ||
                bookingId.includes(searchValue) ||
                guestName.includes(searchValue) ||
                guestEmail.includes(searchValue);


            const matchesStatus =
                selectedStatus === "all" ||
                paymentStatus === selectedStatus;


            const matchesMethod =
                selectedMethod === "all" ||
                paymentMethod === selectedMethod;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesMethod
            );
        }
    );
}


/* =========================
   RENDER PAYMENTS
========================= */

function renderPayments() {

    const payments =
        getFilteredPayments();


    if (payments.length === 0) {

        paymentsContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    No payment records found
                </h3>

                <p>
                    No payments match your
                    current filters.
                </p>

            </div>
        `;

        return;
    }


    paymentsContainer.innerHTML =
        payments
            .map(function (payment) {

                return createPaymentCard(
                    payment
                );

            })
            .join("");
}


/* =========================
   CREATE PAYMENT CARD
========================= */

function createPaymentCard(payment) {

    const bookingId =
        escapeHtml(
            payment.bookingId || "—"
        );


    const guestName =
        escapeHtml(
            payment.guestName || "Guest"
        );


    const guestEmail =
        escapeHtml(
            payment.guestEmail || "—"
        );


    const guestPhone =
        escapeHtml(
            payment.guestPhone || "—"
        );


    const roomNumber =
        escapeHtml(
            payment.roomNumber || "—"
        );


    let roomType = "—";

    if (
        payment.room &&
        payment.room.roomType
    ) {
        roomType =
            escapeHtml(
                payment.room.roomType
            );
    }


    const paymentStatus =
        payment.paymentStatus ||
        "pending";


    const paymentMethod =
        payment.paymentMethod ||
        "razorpay";


    const bookingStatus =
        payment.bookingStatus ||
        "pending";


    const amount =
        formatCurrency(
            payment.totalAmount
        );


    const pricePerNight =
        formatCurrency(
            payment.pricePerNight
        );


    const checkIn =
        formatDate(
            payment.checkIn
        );


    const checkOut =
        formatDate(
            payment.checkOut
        );


    const bookedOn =
        formatDate(
            payment.createdAt
        );


    const paymentId =
        escapeHtml(
            payment.razorpayPaymentId ||
            "Not available"
        );


    const orderId =
        escapeHtml(
            payment.razorpayOrderId ||
            "Not available"
        );


    const statusClass =
        getPaymentStatusClass(
            paymentStatus
        );


    const statusText =
        formatPaymentStatus(
            paymentStatus
        );


    const methodText =
        formatPaymentMethod(
            paymentMethod
        );


    return `
        <article class="payment-card">

            <div class="payment-header">

                <div>

                    <div class="payment-booking-id">
                        ${bookingId}
                    </div>

                    <div class="payment-guest">
                        ${guestName}
                    </div>

                    <div class="payment-contact">
                        ${guestEmail}
                        &nbsp; • &nbsp;
                        ${guestPhone}
                    </div>

                </div>


                <div class="status-area">

                    <span
                        class="status-badge ${statusClass}"
                    >
                        ${escapeHtml(
                            statusText
                        )}
                    </span>

                    <span
                        class="status-badge status-pending"
                        style="
                            ${
                                bookingStatus ===
                                "confirmed"
                                    ? `
                                        background:#e4f7eb;
                                        color:#08752d;
                                      `
                                    : ""
                            }
                        "
                    >
                        Booking:
                        ${escapeHtml(
                            formatBookingStatus(
                                bookingStatus
                            )
                        )}
                    </span>

                </div>

            </div>


            <div class="payment-details">


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
                        PAYMENT METHOD
                    </div>

                    <div class="detail-value">
                        ${escapeHtml(
                            methodText
                        )}
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
                        PRICE / NIGHT
                    </div>

                    <div class="detail-value">
                        ${pricePerNight}
                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        RAZORPAY ORDER ID
                    </div>

                    <div class="detail-value">
                        ${orderId}
                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        RAZORPAY PAYMENT ID
                    </div>

                    <div class="detail-value">
                        ${paymentId}
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


            <div class="amount-section">

                <span class="amount-label">
                    Total Amount
                </span>

                <span class="amount-value">
                    ${amount}
                </span>

            </div>

        </article>
    `;
}


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    function () {
        renderPayments();
    }
);


/* =========================
   PAYMENT STATUS FILTER
========================= */

paymentStatusFilter.addEventListener(
    "change",
    function () {
        renderPayments();
    }
);


/* =========================
   PAYMENT METHOD FILTER
========================= */

paymentMethodFilter.addEventListener(
    "change",
    function () {
        renderPayments();
    }
);


/* =========================
   LOGOUT
========================= */

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


/* =========================
   PAYMENT STATUS CLASS
========================= */

function getPaymentStatusClass(status) {

    switch (
        String(status).toLowerCase()
    ) {

        case "paid":
            return "status-paid";

        case "failed":
            return "status-failed";

        case "refunded":
            return "status-refunded";

        case "pending":
        default:
            return "status-pending";
    }
}


/* =========================
   PAYMENT STATUS TEXT
========================= */

function formatPaymentStatus(status) {

    switch (
        String(status).toLowerCase()
    ) {

        case "paid":
            return "Paid";

        case "failed":
            return "Failed";

        case "refunded":
            return "Refunded";

        case "pending":
        default:
            return "Payment Pending";
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
            return "—";
    }
}


/* =========================
   BOOKING STATUS
========================= */

function formatBookingStatus(status) {

    switch (
        String(status).toLowerCase()
    ) {

        case "checked-in":
            return "Checked In";

        case "checked-out":
            return "Checked Out";

        case "cancelled":
            return "Cancelled";

        case "confirmed":
            return "Confirmed";

        case "pending":
        default:
            return "Pending";
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
   START
========================= */

loadAdminDetails();

loadPayments();