const roomData = {
    "101": {
        type: "DELUXE ROOM",
        title: "Deluxe Room",
        description: "Elegant and comfortable accommodation for a relaxing stay.",
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
        description: "A spacious stay offering extra comfort for business and family guests.",
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

const roomsContainer = document.getElementById("roomsContainer");
const checkIn = document.getElementById("checkIn");
const checkOut = document.getElementById("checkOut");
const guests = document.getElementById("guests");
const searchRooms = document.getElementById("searchRooms");
const searchMessage = document.getElementById("searchMessage");

const modal = document.getElementById("roomModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");

const modalMainImage = document.getElementById("modalMainImage");
const modalThumbs = document.getElementById("modalThumbs");

const modalType = document.getElementById("modalType");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const modalDetails = document.getElementById("modalDetails");

const modalBook = document.getElementById("modalBook");

const selectedRoomId = document.getElementById("selectedRoomId");
const selectedRoomName = document.getElementById("selectedRoomName");
const selectedRoomPrice = document.getElementById("selectedRoomPrice");

const bookingCheckIn = document.getElementById("bookingCheckIn");
const bookingCheckOut = document.getElementById("bookingCheckOut");
const bookingAdults = document.getElementById("bookingAdults");

const bookingMessage = document.getElementById("bookingMessage");
const bookingForm = document.getElementById("bookingFormElement");

let allRooms = [];
let currentGallery = [];
let currentGalleryIndex = 0;

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function setDateDefaults() {
    const today = getToday();

    checkIn.min = today;
    checkOut.min = today;

    bookingCheckIn.min = today;
    bookingCheckOut.min = today;

    const params = new URLSearchParams(window.location.search);

    const ci = params.get("checkIn");
    const co = params.get("checkOut");
    const g = params.get("guests");

    if (ci) {
        checkIn.value = ci;
        bookingCheckIn.value = ci;
    }

    if (co) {
        checkOut.value = co;
        bookingCheckOut.value = co;
    }

    if (
        g &&
        [...guests.options].some(option => option.value === g)
    ) {
        guests.value = g;
    }
}

function getLocalRoom(room) {
    return roomData[String(room.roomNumber)] || null;
}

function renderRooms(rooms) {
    roomsContainer.innerHTML = "";

    if (!rooms.length) {
        roomsContainer.innerHTML = `
            <div class="loading">
                No rooms available right now.
            </div>
        `;
        return;
    }

    rooms.forEach(room => {
        const local = getLocalRoom(room);

        if (!local) {
            return;
        }

        const card = document.createElement("article");

        card.className = "room-card";

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

                        <small>single</small>

                        ${money(local.double)}

                        <small>double</small>

                    </div>

                </div>

                <p>
                    ${local.description}
                </p>

                <div class="room-details">

                    <span>
                        <i class="bi bi-people"></i>
                        Up to ${local.maxGuests} Guests
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

            </div>
        `;

        roomsContainer.appendChild(card);
    });

    document.querySelectorAll(".view-room").forEach(button => {

        button.addEventListener("click", () => {

            openRoom(button.dataset.room);

        });

    });
}

async function loadRooms() {

    try {

        const response = await fetch("/api/rooms");

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to load rooms."
            );

        }

        allRooms = data.rooms || [];

        renderRooms(allRooms);

    } catch (error) {

        console.error("Room loading error:", error);

        /*
         * Backend unavailable hone par
         * temporary display ke liye local room data.
         */

        allRooms = [
            {
                roomNumber: "101",
                _id: "101",
                status: "available"
            },
            {
                roomNumber: "201",
                _id: "201",
                status: "available"
            }
        ];

        renderRooms(allRooms);
    }
}

function openRoom(roomNumber) {

    const room = roomData[String(roomNumber)];

    if (!room) {
        return;
    }

    currentGallery = room.images;

    currentGalleryIndex = 0;

    modalType.textContent = room.type;

    modalTitle.textContent = room.title;

    modalDescription.textContent = room.description;

    modalPrice.innerHTML = `
        ${money(room.single)} single
        &nbsp; / &nbsp;
        ${money(room.double)} double
    `;

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

    modalThumbs.innerHTML = "";

    currentGallery.forEach((src, index) => {

        const button = document.createElement("button");

        button.type = "button";

        button.innerHTML = `
            <img
                src="${src}"
                alt="${room.title} photo ${index + 1}"
            >
        `;

        button.addEventListener("click", () => {

            showGallery(index);

        });

        modalThumbs.appendChild(button);

    });

    showGallery(0);

    modal.classList.add("open");

    modal.setAttribute("aria-hidden", "false");

    selectedRoomId.value = findRoomId(roomNumber);

    selectedRoomName.textContent = room.title;

    selectedRoomPrice.textContent =
        `${money(room.single)} / ${money(room.double)}`;

    bookingAdults.innerHTML = "";

    for (let i = 1; i <= room.maxGuests; i++) {

        const option = document.createElement("option");

        option.value = String(i);

        option.textContent =
            `${i} ${i === 1 ? "Adult" : "Adults"}`;

        if (i === Math.min(2, room.maxGuests)) {
            option.selected = true;
        }

        bookingAdults.appendChild(option);
    }
}

function findRoomId(roomNumber) {

    const found = allRooms.find(
        room =>
            String(room.roomNumber) === String(roomNumber)
    );

    return found?._id || roomNumber;
}

function showGallery(index) {

    if (!currentGallery.length) {
        return;
    }

    currentGalleryIndex =
        (index + currentGallery.length) %
        currentGallery.length;

    modalMainImage.src =
        currentGallery[currentGalleryIndex];

    modalMainImage.alt =
        "Royal DC Hotel room photo";

    [...modalThumbs.children].forEach(
        (button, i) => {

            button.classList.toggle(
                "active",
                i === currentGalleryIndex
            );

        }
    );
}

function closeModal() {

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}

document
    .getElementById("galleryPrev")
    .addEventListener(
        "click",
        () => {
            showGallery(
                currentGalleryIndex - 1
            );
        }
    );

document
    .getElementById("galleryNext")
    .addEventListener(
        "click",
        () => {
            showGallery(
                currentGalleryIndex + 1
            );
        }
    );

modalClose.addEventListener(
    "click",
    closeModal
);

modalBackdrop.addEventListener(
    "click",
    closeModal
);

modalBook.addEventListener(
    "click",
    () => {

        closeModal();

        document
            .getElementById("bookingForm")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);

checkIn.addEventListener(
    "change",
    () => {

        if (checkIn.value) {

            checkOut.min =
                checkIn.value;

        }

    }
);

bookingCheckIn.addEventListener(
    "change",
    () => {

        if (bookingCheckIn.value) {

            bookingCheckOut.min =
                bookingCheckIn.value;

        }

    }
);

searchRooms.addEventListener(
    "click",
    () => {

        if (!checkIn.value || !checkOut.value) {

            searchMessage.textContent =
                "Please select Check-in and Check-out dates.";

            return;
        }

        if (checkOut.value <= checkIn.value) {

            searchMessage.textContent =
                "Check-out must be after Check-in.";

            return;
        }

        const selectedGuests =
            Number(guests.value);

        const visible =
            allRooms.filter(room => {

                const local =
                    getLocalRoom(room);

                return (
                    local &&
                    local.maxGuests >= selectedGuests &&
                    room.status === "available"
                );

            });

        renderRooms(visible);

        searchMessage.textContent =
            `${visible.length} room option${
                visible.length === 1 ? "" : "s"
            } available for ${
                selectedGuests
            } guest${
                selectedGuests === 1 ? "" : "s"
            }.`;

        document
            .getElementById("roomsList")
            .scrollIntoView({
                behavior: "smooth"
            });
    }
);

bookingForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        bookingMessage.textContent = "";

        if (
            !selectedRoomId.value ||
            selectedRoomName.textContent ===
                "Please select a room"
        ) {

            bookingMessage.textContent =
                "Please select a room first.";

            return;
        }

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

        const payload = {

            roomId:
                selectedRoomId.value,

            guestName:
                document
                    .getElementById("guestName")
                    .value
                    .trim(),

            guestEmail:
                document
                    .getElementById("guestEmail")
                    .value
                    .trim(),

            guestPhone:
                document
                    .getElementById("guestPhone")
                    .value
                    .trim(),

            checkIn:
                bookingCheckIn.value,

            checkOut:
                bookingCheckOut.value,

            adults:
                Number(bookingAdults.value),

            children:
                Number(
                    document
                        .getElementById(
                            "bookingChildren"
                        )
                        .value
                ),

            specialRequest:
                document
                    .getElementById(
                        "specialRequest"
                    )
                    .value
                    .trim()
        };

        try {

            const response =
                await fetch(
                    "/api/bookings",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
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

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Booking could not be created."
                );
            }

            bookingMessage.textContent =
                `Booking created successfully. Booking ID: ${
                    data.booking?.bookingId ||
                    "Created"
                }`;

            bookingForm.reset();

            selectedRoomId.value = "";

            selectedRoomName.textContent =
                "Please select a room";

            selectedRoomPrice.textContent =
                "—";

        } catch (error) {

            console.error(
                "Booking error:",
                error
            );

            bookingMessage.textContent =
                error.message;
        }
    }
);

setDateDefaults();

loadRooms();