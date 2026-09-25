/* =========================================================
   ROYAL DC HOTEL
   BOOKING JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const bookingForm =
        document.getElementById("bookingForm");

    const selectedRoomBox =
        document.getElementById("selectedRoomBox");

    const summaryRoom =
        document.getElementById("summaryRoom");

    const checkIn =
        document.getElementById("checkIn");

    const checkOut =
        document.getElementById("checkOut");

    const adults =
        document.getElementById("adults");

    const children =
        document.getElementById("children");

    const summaryCheckIn =
        document.getElementById("summaryCheckIn");

    const summaryCheckOut =
        document.getElementById("summaryCheckOut");

    const summaryNights =
        document.getElementById("summaryNights");

    const summaryGuests =
        document.getElementById("summaryGuests");

    const summaryRate =
        document.getElementById("summaryRate");

    const summaryTotal =
        document.getElementById("summaryTotal");

    const bookingMessage =
        document.getElementById("bookingMessage");

    const bookingSubmitBtn =
        document.getElementById("bookingSubmitBtn");

    const bookingSubmitText =
        document.getElementById("bookingSubmitText");

    const specialRequest =
        document.getElementById("specialRequest");


    let selectedRoom = null;


    /* =====================================================
       URL + SAVED ROOM
       ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const urlRoomId =
        params.get("roomId");

    const savedRoomId =
        sessionStorage.getItem(
            "royalDCSelectedRoomId"
        );

    /*
     * Priority:
     * 1. URL roomId
     * 2. sessionStorage roomId
     */
    const roomId =
        urlRoomId || savedRoomId;


    const urlCheckIn =
        params.get("checkIn");

    const urlCheckOut =
        params.get("checkOut");

    const urlGuests =
        params.get("guests");


    console.log(
        "Royal DC Hotel - Room ID:",
        roomId
    );


    /* =====================================================
       DATE SETUP
       ===================================================== */

    const today =
        new Date();

    const todayString =
        today.toISOString()
            .split("T")[0];

    checkIn.min =
        todayString;

    checkOut.min =
        todayString;


    /* =====================================================
       RAZORPAY CHECKOUT SCRIPT
       ===================================================== */

    function loadRazorpayScript() {

        return new Promise(
            (resolve, reject) => {

                if (window.Razorpay) {

                    resolve(true);

                    return;
                }


                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://checkout.razorpay.com/v1/checkout.js";


                script.onload =
                    () => {

                        resolve(true);

                    };


                script.onerror =
                    () => {

                        reject(
                            new Error(
                                "Razorpay Checkout could not be loaded."
                            )
                        );

                    };


                document.body.appendChild(
                    script
                );

            }
        );
    }


    /* =====================================================
       LOAD SELECTED ROOM
       ===================================================== */

    async function loadSelectedRoom() {

        /*
         * If room ID is not available anywhere
         */
        if (!roomId) {

            showRoomError(
                "Please select a room before booking."
            );

            return;
        }


        try {

            console.log(
                "Loading room:",
                roomId
            );


            const response =
                await fetch(
                    `/api/rooms/${encodeURIComponent(roomId)}`
                );


            if (!response.ok) {

                throw new Error(
                    "Room could not be found."
                );

            }


            const data =
                await response.json();


            if (
                !data.success ||
                !data.room
            ) {

                throw new Error(
                    data.message ||
                    "Room not found."
                );

            }


            selectedRoom =
                data.room;


            /*
             * Keep the selected room saved
             */
            sessionStorage.setItem(
                "royalDCSelectedRoomId",
                selectedRoom._id
            );


            renderSelectedRoom();

            updateSummary();


        } catch (error) {

            console.error(
                "Room loading error:",
                error
            );


            showRoomError(
                error.message ||
                "Unable to load selected room."
            );

        }
    }


    /* =====================================================
       RENDER SELECTED ROOM
       ===================================================== */

    function renderSelectedRoom() {

        if (!selectedRoom) {
            return;
        }


        selectedRoomBox.innerHTML = `

            <div class="selected-room-content">

                <div class="selected-room-info">

                    <h4>
                        ${escapeHTML(
                            selectedRoom.title
                        )}
                    </h4>

                    <p>

                        ${escapeHTML(
                            selectedRoom.roomType
                        )}

                        &nbsp; • &nbsp;

                        Room

                        ${escapeHTML(
                            selectedRoom.roomNumber
                        )}

                        &nbsp; • &nbsp;

                        ${escapeHTML(
                            selectedRoom.size
                        )}

                        &nbsp; • &nbsp;

                        ${escapeHTML(
                            selectedRoom.bedType
                        )}

                    </p>

                </div>


                <div class="selected-room-price">

                    ₹${formatPrice(
                        selectedRoom.pricePerNight
                    )}

                    <small>
                        PER NIGHT
                    </small>

                </div>

            </div>

        `;


        summaryRoom.innerHTML = `

            <div class="summary-room-content">

                <i class="bi bi-building"></i>

                <h3>
                    ${escapeHTML(
                        selectedRoom.title
                    )}
                </h3>

                <p>
                    Room
                    ${escapeHTML(
                        selectedRoom.roomNumber
                    )}
                </p>

            </div>

        `;
    }


    /* =====================================================
       ROOM ERROR
       ===================================================== */

    function showRoomError(message) {

        selectedRoomBox.innerHTML = `

            <div
                style="
                    text-align:center;
                    color:#d99999;
                    padding:20px;
                "
            >

                <i
                    class="bi bi-exclamation-circle"
                    style="
                        font-size:30px;
                        display:block;
                        margin-bottom:10px;
                    "
                ></i>

                <span>
                    ${escapeHTML(message)}
                </span>

            </div>

        `;


        bookingSubmitBtn.disabled =
            true;
    }


    /* =====================================================
       URL VALUES
       ===================================================== */

    if (urlCheckIn) {

        checkIn.value =
            urlCheckIn;

        checkOut.min =
            urlCheckIn;
    }


    if (urlCheckOut) {

        checkOut.value =
            urlCheckOut;
    }


    if (urlGuests) {

        const guestNumber =
            Number(urlGuests);


        if (
            guestNumber >= 1 &&
            guestNumber <= 3
        ) {

            adults.value =
                String(
                    guestNumber
                );
        }
    }


    /* =====================================================
       DATE EVENTS
       ===================================================== */

    checkIn.addEventListener(
        "change",
        () => {

            if (!checkIn.value) {
                return;
            }


            checkOut.min =
                checkIn.value;


            if (
                checkOut.value &&
                checkOut.value <=
                    checkIn.value
            ) {

                checkOut.value =
                    "";

            }


            updateSummary();

        }
    );


    checkOut.addEventListener(
        "change",
        updateSummary
    );


    adults.addEventListener(
        "change",
        updateSummary
    );


    children.addEventListener(
        "change",
        updateSummary
    );


    /* =====================================================
       UPDATE BOOKING SUMMARY
       ===================================================== */

    function updateSummary() {

        const start =
            parseLocalDate(
                checkIn.value
            );


        const end =
            parseLocalDate(
                checkOut.value
            );


        const adultCount =
            Number(
                adults.value || 0
            );


        const childCount =
            Number(
                children.value || 0
            );


        const totalGuests =
            adultCount +
            childCount;


        summaryCheckIn.textContent =
            checkIn.value
                ? formatDate(
                    checkIn.value
                )
                : "—";


        summaryCheckOut.textContent =
            checkOut.value
                ? formatDate(
                    checkOut.value
                )
                : "—";


        summaryGuests.textContent =
            totalGuests > 0
                ? `${totalGuests} Guest${
                    totalGuests > 1
                        ? "s"
                        : ""
                }`
                : "—";


        if (
            !start ||
            !end ||
            end <= start
        ) {

            summaryNights.textContent =
                "—";

            summaryRate.textContent =
                "₹0";

            summaryTotal.textContent =
                "₹0";

            return;
        }


        const nights =
            calculateNights(
                start,
                end
            );


        summaryNights.textContent =
            `${nights} Night${
                nights > 1
                    ? "s"
                    : ""
            }`;


        if (selectedRoom) {

            const rate =
                Number(
                    selectedRoom.pricePerNight
                );


            const total =
                nights * rate;


            summaryRate.textContent =
                `₹${formatPrice(rate)}`;


            summaryTotal.textContent =
                `₹${formatPrice(total)}`;

        }
    }


    /* =====================================================
       SUBMIT BOOKING
       ===================================================== */

    bookingForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            clearMessage();


            if (!selectedRoom) {

                showMessage(
                    "Please select a valid room.",
                    "error"
                );

                return;
            }


            const guestName =
                document
                    .getElementById("guestName")
                    .value
                    .trim();


            const guestEmail =
                document
                    .getElementById("guestEmail")
                    .value
                    .trim();


            const guestPhone =
                document
                    .getElementById("guestPhone")
                    .value
                    .trim();


            const start =
                parseLocalDate(
                    checkIn.value
                );


            const end =
                parseLocalDate(
                    checkOut.value
                );


            const adultCount =
                Number(
                    adults.value
                );


            const childCount =
                Number(
                    children.value || 0
                );


            /* Guest validation */

            if (
                !guestName ||
                !guestEmail ||
                !guestPhone
            ) {

                showMessage(
                    "Please complete all guest information.",
                    "error"
                );

                return;
            }


            if (
                !isValidEmail(
                    guestEmail
                )
            ) {

                showMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            if (!start || !end) {

                showMessage(
                    "Please select check-in and check-out dates.",
                    "error"
                );

                return;
            }


            if (end <= start) {

                showMessage(
                    "Check-out date must be after check-in date.",
                    "error"
                );

                return;
            }


            const nights =
                calculateNights(
                    start,
                    end
                );


            if (nights < 1) {

                showMessage(
                    "Minimum stay is 1 night.",
                    "error"
                );

                return;
            }


            const totalGuests =
                adultCount +
                childCount;


            if (
                totalGuests >
                Number(
                    selectedRoom.maxGuests
                )
            ) {

                showMessage(
                    `This room allows maximum ${selectedRoom.maxGuests} guests.`,
                    "error"
                );

                return;
            }


            bookingSubmitBtn.disabled =
                true;


            bookingSubmitText.textContent =
                "Creating Booking...";


            try {

                /* ==========================================
                   1. CREATE BOOKING
                   ========================================== */

                const bookingResponse =
                    await fetch(
                        "/api/bookings",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    guestName,

                                    guestEmail,

                                    guestPhone,

                                    roomId:
                                        selectedRoom._id,

                                    checkIn:
                                        checkIn.value,

                                    checkOut:
                                        checkOut.value,

                                    adults:
                                        adultCount,

                                    children:
                                        childCount,

                                    specialRequest:
                                        specialRequest
                                            .value
                                            .trim()

                                })
                        }
                    );


                const bookingData =
                    await bookingResponse.json();


                if (!bookingResponse.ok) {

                    throw new Error(
                        bookingData.message ||
                        "Booking could not be created."
                    );

                }


                const booking =
                    bookingData.booking;


                /* ==========================================
                   2. LOAD RAZORPAY
                   ========================================== */

                bookingSubmitText.textContent =
                    "Opening Payment...";


                await loadRazorpayScript();


                /* ==========================================
                   3. CREATE RAZORPAY ORDER
                   ========================================== */

                const orderResponse =
                    await fetch(
                        "/api/payments/create-order",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    bookingId:
                                        booking.bookingId

                                })
                        }
                    );


                const orderData =
                    await orderResponse.json();


                if (!orderResponse.ok) {

                    throw new Error(
                        orderData.message ||
                        "Unable to create payment order."
                    );

                }


                /* ==========================================
                   4. RAZORPAY CHECKOUT
                   ========================================== */

                const options = {

                    key:
                        orderData.keyId,

                    amount:
                        orderData.order.amount,

                    currency:
                        orderData.order.currency,

                    name:
                        "Royal DC Hotel",

                    description:
                        `Room Booking - ${booking.roomNumber}`,

                    order_id:
                        orderData.order.id,


                    prefill: {

                        name:
                            booking.guestName,

                        email:
                            booking.guestEmail,

                        contact:
                            booking.guestPhone

                    },


                    notes: {

                        bookingId:
                            booking.bookingId,

                        roomNumber:
                            booking.roomNumber

                    },


                    theme: {

                        color:
                            "#d4af37"

                    },


                    handler:
                        async function (
                            response
                        ) {

                            await verifyPayment(
                                booking.bookingId,
                                response
                            );

                        },


                    modal: {

                        ondismiss:
                            function () {

                                bookingSubmitBtn.disabled =
                                    false;

                                bookingSubmitText.textContent =
                                    "Pay Now";

                                showMessage(
                                    "Payment window was closed. Your booking is still pending payment.",
                                    "error"
                                );

                            }

                    }

                };


                const razorpay =
                    new Razorpay(
                        options
                    );


                razorpay.open();


            } catch (error) {

                console.error(
                    "Booking/payment error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Something went wrong. Please try again.",
                    "error"
                );


                bookingSubmitBtn.disabled =
                    false;


                bookingSubmitText.textContent =
                    "Confirm Booking";

            }

        }
    );


    /* =====================================================
       VERIFY RAZORPAY PAYMENT
       ===================================================== */

    async function verifyPayment(
        bookingId,
        paymentResponse
    ) {

        try {

            bookingSubmitText.textContent =
                "Verifying Payment...";


            const response =
                await fetch(
                    "/api/payments/verify",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                bookingId,

                                razorpayOrderId:
                                    paymentResponse
                                        .razorpay_order_id,

                                razorpayPaymentId:
                                    paymentResponse
                                        .razorpay_payment_id,

                                razorpaySignature:
                                    paymentResponse
                                        .razorpay_signature

                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Payment verification failed."
                );

            }


            /* Save confirmed booking */

            sessionStorage.setItem(
                "royalDCBooking",
                JSON.stringify(
                    data.booking
                )
            );


            /* Room selection no longer needed */

            sessionStorage.removeItem(
                "royalDCSelectedRoomId"
            );


            showMessage(
                "Payment successful! Booking confirmed.",
                "success"
            );


            bookingSubmitText.textContent =
                "Payment Successful";


            setTimeout(
                () => {

                    window.location.href =
                        "booking-success.html";

                },
                1000
            );


        } catch (error) {

            console.error(
                "Payment verification error:",
                error
            );


            showMessage(
                error.message ||
                "Payment verification failed.",
                "error"
            );


            bookingSubmitBtn.disabled =
                false;


            bookingSubmitText.textContent =
                "Try Payment Again";

        }
    }


    /* =====================================================
       MESSAGE
       ===================================================== */

    function showMessage(
        message,
        type
    ) {

        bookingMessage.textContent =
            message;


        bookingMessage.className =
            `booking-message show ${type}`;

    }


    function clearMessage() {

        bookingMessage.textContent =
            "";


        bookingMessage.className =
            "booking-message";

    }


    /* =====================================================
       HELPERS
       ===================================================== */

    function calculateNights(
        start,
        end
    ) {

        const difference =
            end.getTime() -
            start.getTime();


        return Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );

    }


    function parseLocalDate(
        value
    ) {

        if (!value) {
            return null;
        }


        const parts =
            value.split("-");


        if (parts.length !== 3) {
            return null;
        }


        const date =
            new Date(
                Number(parts[0]),
                Number(parts[1]) - 1,
                Number(parts[2])
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return null;

        }


        return date;

    }


    function formatDate(
        value
    ) {

        const date =
            parseLocalDate(value);


        if (!date) {
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


    function formatPrice(
        value
    ) {

        return Number(
            value || 0
        ).toLocaleString(
            "en-IN"
        );

    }


    function isValidEmail(
        email
    ) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
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


    /* =====================================================
       START
       ===================================================== */

    loadSelectedRoom();

});