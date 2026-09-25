/* =========================================================
   ROYAL DC HOTEL
   ROOMS + GALLERY + BOOKING
   FINAL FIXED VERSION
========================================================= */


/* =========================================================
   LOCAL ROOM DISPLAY DATA
========================================================= */

const roomData = {

    "101": {
        type: "DELUXE ROOM",
        title: "Deluxe Room",
        description:
            "Elegant and comfortable accommodation for a relaxing stay.",
        single: 2000,
        double: 2500,
        maxGuests: 2,
        size: "350 sq ft",
        bed: "King Bed",
        images: [
            "assets/images/Deluxe King Room1.jpeg",
            "assets/images/Deluxe King Room2.jpeg",
            "assets/images/Deluxe King bathroom.jpeg"
        ]
    },

    "201": {
        type: "EXECUTIVE ROOM",
        title: "Executive Room",
        description:
            "A spacious stay offering extra comfort for business and family guests.",
        single: 3000,
        double: 3500,
        maxGuests: 3,
        size: "450 sq ft",
        bed: "King Bed",
        images: [
            "assets/images/Royal Executive Room1.jpeg",
            "assets/images/Royal Executive Room2.jpeg",
            "assets/images/Royal Executive Room3.jpeg"
        ]
    }

};


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const roomsContainer =
    document.getElementById("roomsContainer");

const checkIn =
    document.getElementById("checkIn");

const checkOut =
    document.getElementById("checkOut");

const guests =
    document.getElementById("guests");

const searchRooms =
    document.getElementById("searchRooms");

const searchMessage =
    document.getElementById("searchMessage");


/* =========================================================
   MODAL ELEMENTS
========================================================= */

const modal =
    document.getElementById("roomModal");

const modalBackdrop =
    document.getElementById("modalBackdrop");

const modalClose =
    document.getElementById("modalClose");

const modalMainImage =
    document.getElementById("modalMainImage");

const modalThumbs =
    document.getElementById("modalThumbs");

const modalType =
    document.getElementById("modalType");

const modalTitle =
    document.getElementById("modalTitle");

const modalDescription =
    document.getElementById("modalDescription");

const modalPrice =
    document.getElementById("modalPrice");

const modalDetails =
    document.getElementById("modalDetails");

const modalBook =
    document.getElementById("modalBook");

const galleryPrev =
    document.getElementById("galleryPrev");

const galleryNext =
    document.getElementById("galleryNext");


/* =========================================================
   BOOKING ELEMENTS
========================================================= */

const selectedRoomId =
    document.getElementById("selectedRoomId");

const selectedRoomName =
    document.getElementById("selectedRoomName");

const selectedRoomPrice =
    document.getElementById("selectedRoomPrice");

const bookingAdults =
    document.getElementById("bookingAdults");

const bookingChildren =
    document.getElementById("bookingChildren");

const bookingCheckIn =
    document.getElementById("bookingCheckIn");

const bookingCheckOut =
    document.getElementById("bookingCheckOut");

const bookingMessage =
    document.getElementById("bookingMessage");

const bookingForm =
    document.getElementById("bookingFormElement");


/* =========================================================
   STATE
========================================================= */

let allRooms = [];

let selectedRoomNumber = "";

let selectedOccupancy = "";

let currentGallery = [];

let currentGalleryIndex = 0;

let roomSelector = null;

let roomOccupancy = null;


/* =========================================================
   MONEY
========================================================= */

function money(value) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);

}


/* =========================================================
   TODAY
========================================================= */

function getToday() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   CALCULATE NIGHTS
========================================================= */

function calculateNights(
    checkInDate,
    checkOutDate
) {

    if (
        !checkInDate ||
        !checkOutDate
    ) {
        return 0;
    }

    const start =
        new Date(
            `${checkInDate}T12:00:00`
        );

    const end =
        new Date(
            `${checkOutDate}T12:00:00`
        );

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return 0;
    }

    const difference =
        end.getTime() -
        start.getTime();

    const nights =
        Math.round(
            difference /
            (1000 * 60 * 60 * 24)
        );

    return nights > 0
        ? nights
        : 0;

}


/* =========================================================
   DATE DEFAULTS
========================================================= */

function setDateDefaults() {

    const today =
        getToday();

    if (checkIn) {
        checkIn.min =
            today;
    }

    if (checkOut) {
        checkOut.min =
            today;
    }

    if (bookingCheckIn) {
        bookingCheckIn.min =
            today;
    }

    if (bookingCheckOut) {
        bookingCheckOut.min =
            today;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );

    const urlCheckIn =
        params.get("checkIn");

    const urlCheckOut =
        params.get("checkOut");

    const urlGuests =
        params.get("guests");


    if (urlCheckIn) {

        if (checkIn) {
            checkIn.value =
                urlCheckIn;
        }

        if (bookingCheckIn) {
            bookingCheckIn.value =
                urlCheckIn;
        }

    }


    if (urlCheckOut) {

        if (checkOut) {
            checkOut.value =
                urlCheckOut;
        }

        if (bookingCheckOut) {
            bookingCheckOut.value =
                urlCheckOut;
        }

    }


    if (
        urlGuests &&
        guests
    ) {

        const optionExists =
            [...guests.options].some(
                option =>
                    option.value ===
                    urlGuests
            );

        if (optionExists) {
            guests.value =
                urlGuests;
        }

    }

}


/* =========================================================
   LOCAL ROOM
========================================================= */

function getLocalRoom(room) {

    if (!room) {
        return null;
    }

    return roomData[
        String(room.roomNumber)
    ] || null;

}


/* =========================================================
   REAL MONGODB ROOM ID
========================================================= */

function findRoomId(roomNumber) {

    const found =
        allRooms.find(
            room =>
                String(
                    room.roomNumber
                ) ===
                String(roomNumber)
        );


    if (
        !found ||
        !found._id
    ) {

        return "";

    }


    const id =
        String(found._id);


    if (
        !/^[a-fA-F0-9]{24}$/.test(id)
    ) {

        return "";

    }


    return id;

}


/* =========================================================
   CREATE ROOM SELECTOR + OCCUPANCY
========================================================= */

function createBookingRoomControls() {

    if (!bookingForm) {
        return;
    }


    const formGrid =
        bookingForm.querySelector(
            ".form-grid"
        );


    if (!formGrid) {
        return;
    }


    /*
     * Already created?
     */

    let controls =
        document.getElementById(
            "bookingRoomControls"
        );


    if (!controls) {

        controls =
            document.createElement(
                "div"
            );

        controls.id =
            "bookingRoomControls";

        controls.className =
            "booking-room-controls";


        controls.innerHTML = `

            <div class="form-field">

                <label for="roomSelector">
                    ROOM
                </label>

                <select
                    id="roomSelector"
                    required
                >

                    <option value="">
                        Select a room
                    </option>

                </select>

            </div>


            <div class="form-field">

                <label for="roomOccupancy">
                    OCCUPANCY
                </label>

                <select
                    id="roomOccupancy"
                    required
                    disabled
                >

                    <option value="">
                        Select room first
                    </option>

                </select>

            </div>

        `;


        formGrid.insertAdjacentElement(
            "beforebegin",
            controls
        );

    }


    roomSelector =
        document.getElementById(
            "roomSelector"
        );

    roomOccupancy =
        document.getElementById(
            "roomOccupancy"
        );


    /*
     * Small styling so the dynamically
     * created fields match the page.
     */

    if (
        !document.getElementById(
            "bookingRoomControlsStyle"
        )
    ) {

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "bookingRoomControlsStyle";

        style.textContent = `

            .booking-room-controls {

                display: grid;

                grid-template-columns:
                    repeat(2, minmax(0, 1fr));

                gap: 14px;

                margin-bottom: 14px;

            }


            .booking-room-controls
            .form-field {

                width: 100%;

            }


            .booking-room-controls
            select {

                width: 100%;

            }


            @media (max-width: 700px) {

                .booking-room-controls {

                    grid-template-columns:
                        1fr;

                }

            }

        `;

        document.head.appendChild(
            style
        );

    }


    populateRoomSelector();


    /*
     * Bind events only once.
     */

    if (
        roomSelector &&
        !roomSelector.dataset.bound
    ) {

        roomSelector.dataset.bound =
            "true";


        roomSelector.addEventListener(
            "change",
            () => {

                selectRoomFromDropdown(
                    roomSelector.value
                );

            }
        );
        updateBookingButtonState();

    }


    if (
        roomOccupancy &&
        !roomOccupancy.dataset.bound
    ) {

        roomOccupancy.dataset.bound =
            "true";


        roomOccupancy.addEventListener(
    "change",
    () => {

        selectedOccupancy =
            roomOccupancy.value;

        updateSelectedPrice();

        updateBookingButtonState();

    }
);

    }


    if (
        bookingAdults &&
        !bookingAdults.dataset.bound
    ) {

        bookingAdults.dataset.bound =
            "true";


        bookingAdults.addEventListener(
    "change",
    () => {

        updateSelectedPrice();

        updateBookingButtonState();

    }
);

    }

}
/* =========================================================
   POPULATE ROOM SELECT
========================================================= */

function populateRoomSelector() {

    if (!roomSelector) {
        return;
    }

    const current =
        roomSelector.value;

    roomSelector.innerHTML = `
        <option value="">
            Select a room
        </option>
    `;

    allRooms.forEach(room => {

        if (!room || !room._id) {
            return;
        }

        const option =
            document.createElement("option");

        option.value =
            String(room._id);

        option.textContent =
    `${room.roomType} — ${
        money(room.singleOccupancyPrice ?? 0)
    } Single / ${
        money(room.doubleOccupancyPrice ?? 0)
    } Double`;

        roomSelector.appendChild(option);

    });

    if (current) {

        const exists =
            [...roomSelector.options]
                .some(
                    option =>
                        option.value === current
                );

        if (exists) {
            roomSelector.value = current;
        }

    }

}

/* =========================================================
   SELECT ROOM
========================================================= */

function selectRoomFromDropdown(roomId) {

    if (!roomId) {

        selectedRoomNumber = "";
        selectedOccupancy = "";

        if (selectedRoomId) {
            selectedRoomId.value = "";
        }

        if (selectedRoomName) {
            selectedRoomName.textContent =
                "Please select a room";
        }

        if (selectedRoomPrice) {
            selectedRoomPrice.textContent = "—";
        }

        if (roomOccupancy) {

            roomOccupancy.innerHTML = `
                <option value="">
                    Select room first
                </option>
            `;

            roomOccupancy.disabled = true;
        }

        updateSelectedPrice();

        updateBookingButtonState();

        return;
    }


    const room =
        allRooms.find(
            item =>
                String(item._id) ===
                String(roomId)
        );


    if (!room) {
        return;
    }


    selectedRoomNumber =
    String(room.roomNumber);


    if (selectedRoomId) {
        selectedRoomId.value =
            String(room._id);
    }


    if (selectedRoomName) {
        selectedRoomName.textContent =
            room.roomType;
    }

/* =====================================================
   OCCUPANCY OPTIONS
===================================================== */

if (roomOccupancy) {

    roomOccupancy.innerHTML = `

        <option value="">
            Select occupancy
        </option>

        <option value="single">
            Single Occupancy — ${
                money(room.singleOccupancyPrice ?? 0)
            } / night
        </option>

        <option value="double">
            Double Occupancy — ${
                money(room.doubleOccupancyPrice ?? 0)
            } / night
        </option>

    `;

    roomOccupancy.disabled = false;

    if (
        bookingAdults &&
        Number(bookingAdults.value) === 1
    ) {

        roomOccupancy.value = "single";
        selectedOccupancy = "single";

    } else {

        roomOccupancy.value = "double";
        selectedOccupancy = "double";

    }

    updateAdultOptions(
        Number(room.maxGuests) || 2
    );

    updateSelectedPrice();
}

}

/* =========================================================
   ADULT OPTIONS
========================================================= */

function updateAdultOptions(
    maxGuests
) {

    if (!bookingAdults) {
        return;
    }


    const current =
        Number(
            bookingAdults.value
        ) || 2;


    bookingAdults.innerHTML =
        "";


    for (
        let i = 1;
        i <= maxGuests;
        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            String(i);


        option.textContent =
            `${i} ${
                i === 1
                    ? "Adult"
                    : "Adults"
            }`;


        bookingAdults.appendChild(
            option
        );

    }


    /*
     * Keep 1 if current was 1,
     * otherwise use 2 where possible.
     */

    let selected =
        current;


    if (
        selected < 1
    ) {
        selected = 1;
    }


    if (
        selected > maxGuests
    ) {
        selected = maxGuests;
    }


    bookingAdults.value =
        String(selected);

}


/* =========================================================
   UPDATE PRICE / NIGHTS / TOTAL
========================================================= */
function updateSelectedPrice() {

    const room =
    allRooms.find(
        item =>
            String(item.roomNumber) ===
            String(selectedRoomNumber)
    );

    const summaryPriceNight =
        document.getElementById(
            "summaryPriceNight"
        );


    const summaryNights =
        document.getElementById(
            "summaryNights"
        );


    const summaryTotal =
        document.getElementById(
            "summaryTotal"
        );


    if (
        !room ||
        !selectedOccupancy
    ) {

        if (selectedRoomPrice) {
            selectedRoomPrice.textContent =
                "—";
        }

        if (summaryPriceNight) {
            summaryPriceNight.textContent =
                "—";
        }

        if (summaryNights) {
            summaryNights.textContent =
                "Select dates";
        }

        if (summaryTotal) {
            summaryTotal.textContent =
                "Select dates";
        }

        return;
    }


    let pricePerNight = 0;


    /*
        SINGLE OCCUPANCY
        Deluxe = ₹2000
        Executive = ₹3000
    */
    if (
        selectedOccupancy ===
        "single"
    ) {

        pricePerNight =
            Number(
                room.singleOccupancyPrice || 0
            );

        if (bookingAdults) {
            bookingAdults.value =
                "1";
        }

    }


    /*
        DOUBLE OCCUPANCY
        Deluxe = ₹2500
        Executive = ₹3500
    */
    else {

        pricePerNight =
            Number(
                room.doubleOccupancyPrice || 0
            );

        if (bookingAdults) {

            let adults =
                Number(
                    bookingAdults.value
                ) || 2;

            adults =
                Math.max(
                    2,
                    adults
                );

            adults =
                Math.min(
                    Number(room.maxGuests) || 2,
                    adults
                );

            bookingAdults.value =
                String(adults);
        }
    }


    const nights =
        calculateNights(
            bookingCheckIn?.value,
            bookingCheckOut?.value
        );


    if (selectedRoomPrice) {

        selectedRoomPrice.textContent =
            `${money(pricePerNight)} / night`;

    }


    if (summaryPriceNight) {

        summaryPriceNight.textContent =
            `${money(pricePerNight)} / night`;

    }


    if (summaryNights) {

        summaryNights.textContent =
            nights > 0
                ? `${nights} ${
                    nights === 1
                        ? "Night"
                        : "Nights"
                }`
                : "Select dates";
    }


    if (summaryTotal) {

        if (nights > 0) {

            const total =
                pricePerNight *
                nights;

            summaryTotal.textContent =
                money(total);

        } else {

            summaryTotal.textContent =
                "Select dates";

        }
    }

}


/* =========================================================
   PRICE SUMMARY
========================================================= */

function createPriceSummary() {

    if (
        document.getElementById(
            "bookingPriceSummary"
        )
    ) {
        return;
    }


    if (!selectedRoomPrice) {
        return;
    }


    const summary =
        document.createElement(
            "div"
        );


    summary.id =
        "bookingPriceSummary";


    summary.className =
        "booking-price-summary";


    summary.innerHTML = `

        <div class="summary-row">

            <span class="summary-label">
                Price / Night
            </span>

            <span
                class="summary-value"
                id="summaryPriceNight"
            >
                —
            </span>

        </div>


        <div class="summary-row">

            <span class="summary-label">
                Number of Nights
            </span>

            <span
                class="summary-value"
                id="summaryNights"
            >
                Select dates
            </span>

        </div>


        <div class="summary-row total-row">

            <span class="total-label">
                TOTAL AMOUNT
            </span>

            <span
                class="total-value"
                id="summaryTotal"
            >
                Select dates
            </span>

        </div>

    `;


    const selectedBox =
        document.querySelector(
            ".selected-room-box"
        );


    if (selectedBox) {

        selectedBox.insertAdjacentElement(
            "afterend",
            summary
        );

    }

}


/* =========================================================
   SUMMARY STYLE
========================================================= */

function addSummaryStyles() {

    if (
        document.getElementById(
            "bookingSummaryStyle"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "bookingSummaryStyle";


    style.textContent = `

        .booking-price-summary {

            margin-top: 18px;

            padding: 20px;

            border:
                1px solid
                rgba(200,164,93,.35);

            background:
                #0b0b0b;

        }


        .booking-price-summary
        .summary-row {

            display: flex;

            justify-content:
                space-between;

            align-items:
                center;

            gap: 20px;

            padding: 8px 0;

        }


        .booking-price-summary
        .summary-label {

            color: #aaa;

            font-size: 12px;

            letter-spacing: 1.5px;

            text-transform:
                uppercase;

        }


        .booking-price-summary
        .summary-value {

            color: #fff;

            font-weight: 600;

        }


        .booking-price-summary
        .total-row {

            margin-top: 10px;

            padding-top: 15px;

            border-top:
                1px solid
                rgba(200,164,93,.3);

        }


        .booking-price-summary
        .total-label {

            color: #c9a35d;

            font-weight: 700;

            letter-spacing: 1.5px;

        }


        .booking-price-summary
        .total-value {

            color: #c9a35d;

            font-family:
                "Cormorant Garamond",
                serif;

            font-size: 30px;

            font-weight: 700;

        }


        @media(max-width:700px) {

            .booking-price-summary
            .summary-row {

                align-items:
                    flex-start;

            }

            .booking-price-summary
            .total-value {

                font-size: 25px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   RENDER ROOM CARDS
========================================================= */

function renderRooms(rooms) {

    if (!roomsContainer) {
        return;
    }


    roomsContainer.innerHTML =
        "";


    if (
        !rooms ||
        !rooms.length
    ) {

        roomsContainer.innerHTML = `

            <div class="loading">

                No rooms available
                right now.

            </div>

        `;

        return;

    }


    rooms.forEach(
        room => {

            const local =
                getLocalRoom(room);


            if (!local) {
                return;
            }


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "room-card";


            const unavailable =
                room.status !==
                "available";


            card.innerHTML = `

                <div class="room-card-image">

                    <img
                        src="${local.images[0]}"
                        alt="${local.title}"
                        loading="lazy"
                    >

                    <div class="room-tag">

                        ${local.type}

                    </div>

                </div>


                <div class="room-card-body">

                    <div class="room-card-title">

                        <h3>
                            ${local.title}
                        </h3>

                        <div class="room-price">

                            ${money(local.single)}

                            <small>
                                single
                            </small>

                            ${money(local.double)}

                            <small>
                                double
                            </small>

                        </div>

                    </div>


                    <p>
                        ${local.description}
                    </p>


                    <div class="room-details">

                        <span>

                            <i class="bi bi-people"></i>

                            Up to
                            ${local.maxGuests}
                            Guests

                        </span>


                        <span>

                            <i class="bi bi-house"></i>

                            ${local.size}

                        </span>


                        <span>

                            <i class="bi bi-moon"></i>

                            ${local.bed}

                        </span>

                    </div>


                    <div class="room-breakfast">

                        <i class="bi bi-cup-hot"></i>

                        Breakfast Included

                    </div>


                    <div class="room-actions">

                        <button
                            type="button"
                            class="view-room"
                            data-room="${room.roomNumber}"
                        >

                            View Room & Photos

                        </button>

                    </div>


                    ${
                        unavailable
                            ? `
                                <div
                                    style="
                                        margin-top:12px;
                                        color:#d9b56d;
                                        font-size:12px;
                                        letter-spacing:1px;
                                    "
                                >
                                    ROOM CURRENTLY UNAVAILABLE
                                </div>
                            `
                            : ""
                    }

                </div>

            `;


            roomsContainer.appendChild(
                card
            );

        }
    );


    document
        .querySelectorAll(
            ".view-room"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openRoom(
                            button.dataset.room
                        );

                    }
                );

            }
        );

}


/* =========================================================
   LOAD ROOMS
========================================================= */

async function loadRooms() {

    try {

        if (roomsContainer) {

            roomsContainer.innerHTML = `

                <div class="loading">
                    Loading rooms...
                </div>

            `;

        }


        const response =
            await fetch(
                "/api/rooms",
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
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
                "Unable to load rooms."
            );

        }


        allRooms =
            Array.isArray(data.rooms)
                ? data.rooms
                : [];


        /*
         * Only real MongoDB rooms.
         */

        allRooms =
            allRooms.filter(
                room => {

                    return (
                        room &&
                        room._id &&
                        /^[a-fA-F0-9]{24}$/.test(
                            String(
                                room._id
                            )
                        )
                    );

                }
            );


        /*
         * Populate dynamic room selector
         */

        populateRoomSelector();


        renderRooms(
            allRooms
        );


    } catch (error) {

        console.error(
            "ROOM API ERROR:",
            error
        );


        allRooms = [];


        if (roomsContainer) {

            roomsContainer.innerHTML = `

                <div class="loading">

                    Unable to load rooms
                    from the server.

                    <br><br>

                    Please refresh the page.

                </div>

            `;

        }

    }

}


/* =========================================================
   GALLERY
========================================================= */

function showGallery(index) {

    if (
        !currentGallery.length
    ) {
        return;
    }


    currentGalleryIndex =
        (
            index +
            currentGallery.length
        ) %
        currentGallery.length;


    if (modalMainImage) {

        modalMainImage.src =
            currentGallery[
                currentGalleryIndex
            ];

        modalMainImage.alt =
            "Royal DC Hotel room photo";

    }


    if (modalThumbs) {

        [
            ...modalThumbs.children
        ].forEach(
            (
                button,
                buttonIndex
            ) => {

                button.classList.toggle(
                    "active",
                    buttonIndex ===
                    currentGalleryIndex
                );

            }
        );

    }

}


/* =========================================================
   OPEN ROOM
========================================================= */

function openRoom(roomNumber) {

    const room =
        roomData[
            String(roomNumber)
        ];


    if (!room) {
        return;
    }


    selectedRoomNumber =
        String(roomNumber);


    const mongoRoomId =
        findRoomId(
            roomNumber
        );


    if (selectedRoomId) {

        selectedRoomId.value =
            mongoRoomId;

    }


    currentGallery =
        room.images || [];

    currentGalleryIndex =
        0;


    if (modalType) {
        modalType.textContent =
            room.type;
    }


    if (modalTitle) {
        modalTitle.textContent =
            room.title;
    }


    if (modalDescription) {
        modalDescription.textContent =
            room.description;
    }


    if (modalPrice) {

        modalPrice.innerHTML = `

            ${money(room.single)}
            single

            &nbsp; / &nbsp;

            ${money(room.double)}
            double

        `;

    }


    if (modalDetails) {

        modalDetails.innerHTML = `

            <span>
                Up to ${room.maxGuests} Guests
            </span>

            <span>
                ${room.size}
            </span>

            <span>
                ${room.bed}
            </span>

            <span>
                Breakfast Included
            </span>

        `;

    }


    if (modalThumbs) {

        modalThumbs.innerHTML =
            "";


        currentGallery.forEach(
            (src, index) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.innerHTML = `

                    <img
                        src="${src}"
                        alt="${room.title} photo ${index + 1}"
                    >

                `;


                button.addEventListener(
                    "click",
                    () => {

                        showGallery(
                            index
                        );

                    }
                );


                modalThumbs.appendChild(
                    button
                );

            }
        );

    }


    showGallery(0);


    if (modal) {

        modal.classList.add(
            "open"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /*
     * Select same room in booking
     */

    if (roomSelector) {

        roomSelector.value =
            String(roomNumber);

    }


    selectRoomFromDropdown(
    mongoRoomId
);


    /*
     * Copy search dates to booking.
     */

    if (
        checkIn &&
        checkIn.value &&
        bookingCheckIn
    ) {

        bookingCheckIn.value =
            checkIn.value;

    }


    if (
        checkOut &&
        checkOut.value &&
        bookingCheckOut
    ) {

        bookingCheckOut.value =
            checkOut.value;

    }


    updateSelectedPrice();

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


if (modalBackdrop) {

    modalBackdrop.addEventListener(
        "click",
        closeModal
    );

}


/* =========================================================
   GALLERY NAVIGATION
========================================================= */

if (galleryPrev) {

    galleryPrev.addEventListener(
        "click",
        () => {

            showGallery(
                currentGalleryIndex - 1
            );

        }
    );

}


if (galleryNext) {

    galleryNext.addEventListener(
        "click",
        () => {

            showGallery(
                currentGalleryIndex + 1
            );

        }
    );

}


/* =========================================================
   MODAL BOOK BUTTON
========================================================= */

if (modalBook) {

    modalBook.addEventListener(
        "click",
        () => {

            closeModal();


            const bookingSection =
                document.getElementById(
                    "bookingForm"
                );


            if (bookingSection) {

                bookingSection.scrollIntoView({
                    behavior:
                        "smooth"
                });

            }

        }
    );

}


/* =========================================================
   SEARCH DATES
========================================================= */

if (checkIn) {

    checkIn.addEventListener(
        "change",
        () => {

            if (
                checkIn.value &&
                checkOut
            ) {

                checkOut.min =
                    checkIn.value;

            }


            if (
                bookingCheckIn
            ) {

                bookingCheckIn.value =
                    checkIn.value;

            }


            updateSelectedPrice();

        }
    );

}


if (checkOut) {

    checkOut.addEventListener(
        "change",
        () => {

            if (
                bookingCheckOut
            ) {

                bookingCheckOut.value =
                    checkOut.value;

            }


            updateSelectedPrice();

        }
    );

}


/* =========================================================
   BOOKING CHECK-IN
========================================================= */

if (bookingCheckIn) {

    bookingCheckIn.addEventListener(
        "change",
        () => {

            if (
                bookingCheckIn.value &&
                bookingCheckOut
            ) {

                bookingCheckOut.min =
                    bookingCheckIn.value;

            }


            updateSelectedPrice();

        }
    );

}


/* =========================================================
   BOOKING CHECK-OUT
========================================================= */

if (bookingCheckOut) {

    bookingCheckOut.addEventListener(
        "change",
        () => {

            updateSelectedPrice();

        }
    );

}


/* =========================================================
   SEARCH ROOMS
========================================================= */

if (searchRooms) {

    searchRooms.addEventListener(
        "click",
        () => {

            if (
                !checkIn ||
                !checkOut
            ) {
                return;
            }


            if (
                !checkIn.value ||
                !checkOut.value
            ) {

                searchMessage.textContent =
                    "Please select Check-in and Check-out dates.";

                return;

            }


            if (
                checkOut.value <=
                checkIn.value
            ) {

                searchMessage.textContent =
                    "Check-out must be after Check-in.";

                return;

            }


            const selectedGuests =
                Number(
                    guests?.value
                ) || 1;


            const visibleRooms =
                allRooms.filter(
                    room => {

                        const local =
                            getLocalRoom(
                                room
                            );


                        return (
                            local &&
                            local.maxGuests >=
                                selectedGuests &&
                            room.status ===
                                "available"
                        );

                    }
                );


            renderRooms(
                visibleRooms
            );


            searchMessage.textContent =
                `${visibleRooms.length} room option${
                    visibleRooms.length === 1
                        ? ""
                        : "s"
                } available for ${
                    selectedGuests
                } guest${
                    selectedGuests === 1
                        ? ""
                        : "s"
                }.`;

        }
    );

}
/* =========================================================
   BOOKING FORM VALIDATION
========================================================= */

function getBookingSubmitButton() {

    if (!bookingForm) {
        return null;
    }

    return bookingForm.querySelector(
        "button[type='submit']"
    );

}


function validateBookingForm(showMessage = false) {

    const guestName =
        document
            .getElementById("guestName")
            ?.value
            .trim();

    const guestEmail =
        document
            .getElementById("guestEmail")
            ?.value
            .trim();

    const guestPhone =
        document
            .getElementById("guestPhone")
            ?.value
            .trim();

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!guestName) {

        if (showMessage && bookingMessage) {
            bookingMessage.textContent =
                "Please enter your name.";
        }

        return false;
    }


    if (
        !guestEmail ||
        !emailPattern.test(guestEmail)
    ) {

        if (showMessage && bookingMessage) {
            bookingMessage.textContent =
                "Please enter a valid email address.";
        }

        return false;
    }


    if (!guestPhone) {

        if (showMessage && bookingMessage) {
            bookingMessage.textContent =
                "Please enter your phone number.";
        }

        return false;
    }


    if (!selectedRoomNumber) {

        if (showMessage && bookingMessage) {
            bookingMessage.textContent =
                "Please select a room.";
        }

        return false;
    }


    if (!selectedRoomId?.value) {

        if (showMessage && bookingMessage) {
            bookingMessage.textContent =
                "Please select a valid room.";
        }

        return false;
    }


    if (!selectedOccupancy) {

        if (showMessage && bookingMessage) {
            bookingMessage.textContent =
                "Please select occupancy.";
        }

        return false;
    }


    if (
        !bookingCheckIn?.value ||
        !bookingCheckOut?.value
    ) {

        if (showMessage && bookingMessage) {
            bookingMessage.textContent =
                "Please select Check-in and Check-out dates.";
        }

        return false;
    }


    if (
        bookingCheckOut.value <=
        bookingCheckIn.value
    ) {

        if (showMessage && bookingMessage) {
            bookingMessage.textContent =
                "Check-out must be after Check-in.";
        }

        return false;
    }


    if (
        !bookingAdults?.value ||
        Number(bookingAdults.value) < 1
    ) {

        if (showMessage && bookingMessage) {
            bookingMessage.textContent =
                "Please select number of adults.";
        }

        return false;
    }


    return true;
}


/* =========================================================
   BOOKING BUTTON STATE
========================================================= */

function updateBookingButtonState() {

    const submitButton =
        getBookingSubmitButton();

    if (!submitButton) {
        return;
    }

    const isValid =
        validateBookingForm(false);

    submitButton.disabled =
        !isValid;

    submitButton.setAttribute(
        "aria-disabled",
        String(!isValid)
    );

}
function bindBookingValidationEvents() {

    const fields = [
        "guestName",
        "guestEmail",
        "guestPhone",
        "bookingCheckIn",
        "bookingCheckOut",
        "bookingAdults",
        "bookingChildren",
        "specialRequest"
    ];

    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element || element.dataset.validationBound) {
            return;
        }

        element.dataset.validationBound = "true";

        element.addEventListener(
            "input",
            updateBookingButtonState
        );

        element.addEventListener(
            "change",
            updateBookingButtonState
        );

    });

}

/* =========================================================
   BOOKING SUBMIT
========================================================= */

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (bookingMessage) {
                bookingMessage.textContent =
                    "";
            }
            if (!validateBookingForm(true)) {

    updateBookingButtonState();

    return;
}


            /*
             * ROOM
             */

            if (
                !selectedRoomNumber
            ) {

                bookingMessage.textContent =
                    "Please select a room first.";

                return;

            }


            /*
             * REAL MONGODB ID
             */

            const mongoRoomId =
                findRoomId(
                    selectedRoomNumber
                );


            if (
                !mongoRoomId ||
                !/^[a-fA-F0-9]{24}$/.test(
                    mongoRoomId
                )
            ) {

                bookingMessage.textContent =
                    "Room data is not loaded correctly. Please refresh the page and select the room again.";

                console.error(
                    "Invalid room ID:",
                    mongoRoomId
                );

                return;

            }


            /*
             * OCCUPANCY
             */

            if (
                !selectedOccupancy
            ) {

                bookingMessage.textContent =
                    "Please select occupancy.";

                return;

            }


            /*
             * DATES
             */

            if (
                !bookingCheckIn.value ||
                !bookingCheckOut.value
            ) {

                bookingMessage.textContent =
                    "Please select Check-in and Check-out dates.";

                return;

            }


            if (
                bookingCheckOut.value <=
                bookingCheckIn.value
            ) {

                bookingMessage.textContent =
                    "Check-out must be after Check-in.";

                return;

            }


            const nights =
                calculateNights(
                    bookingCheckIn.value,
                    bookingCheckOut.value
                );


            if (
                nights <= 0
            ) {

                bookingMessage.textContent =
                    "Please select valid booking dates.";

                return;

            }


            /*
             * GUEST DETAILS
             */

            const guestName =
                document
                    .getElementById(
                        "guestName"
                    )
                    .value
                    .trim();


            const guestEmail =
                document
                    .getElementById(
                        "guestEmail"
                    )
                    .value
                    .trim();


            const guestPhone =
                document
                    .getElementById(
                        "guestPhone"
                    )
                    .value
                    .trim();


            const children =
                Number(
                    bookingChildren?.value
                ) || 0;


            const specialRequest =
                document
                    .getElementById(
                        "specialRequest"
                    )
                    .value
                    .trim();


            const adults =
                Number(
                    bookingAdults.value
                ) || 1;


            /*
             * FINAL PAYLOAD
             */

            const payload = {

                roomId:
                    mongoRoomId,

                guestName:
                    guestName,

                guestEmail:
                    guestEmail,

                guestPhone:
                    guestPhone,

                checkIn:
                    bookingCheckIn.value,

                checkOut:
                    bookingCheckOut.value,

                adults:
                    adults,

                children:
                    children,

                specialRequest:
                    specialRequest

            };


            console.log(
                "FINAL BOOKING PAYLOAD:",
                payload
            );


            const submitButton =
                bookingForm.querySelector(
                    "button[type='submit']"
                );


            const oldButtonText =
                submitButton
                    ? submitButton.innerHTML
                    : "";


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.innerHTML =
                    "Creating Booking...";

            }


            try {

                const response =
                    await fetch(
                        "/api/bookings",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    payload
                                )

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "BOOKING RESPONSE:",
                    data
                );


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Failed to create booking."
                    );

                }


                /*
                 * SUCCESS
                 */

                bookingMessage.textContent =
                    `Booking created successfully. Booking ID: ${
                        data.booking?.bookingId ||
                        "Created"
                    }`;


                bookingMessage.style.color =
                    "#c9a35d";


                /*
                 * Reset personal fields
                 * but keep selected room.
                 */

                document
                    .getElementById(
                        "guestName"
                    )
                    .value = "";

                document
                    .getElementById(
                        "guestEmail"
                    )
                    .value = "";

                document
                    .getElementById(
                        "guestPhone"
                    )
                    .value = "";

                if (bookingChildren) {
                    bookingChildren.value =
                        "0";
                }

                document
                    .getElementById(
                        "specialRequest"
                    )
                    .value = "";


                /*
                 * Keep room selected.
                 */

                if (roomSelector) {

                    roomSelector.value =
                        selectedRoomNumber;

                }


                if (roomOccupancy) {

                    roomOccupancy.value =
                        selectedOccupancy;

                }


                updateSelectedPrice();


            } catch (error) {

                console.error(
                    "BOOKING ERROR:",
                    error
                );


                bookingMessage.textContent =
                    error.message ||
                    "Failed to create booking.";


                bookingMessage.style.color =
                    "#e07a7a";

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        oldButtonText;

                }

            }

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeRoomsPage() {

    addSummaryStyles();

    createPriceSummary();

    createBookingRoomControls();

    bindBookingValidationEvents();

    updateBookingButtonState();

    setDateDefaults();

    loadRooms();

}


initializeRoomsPage();