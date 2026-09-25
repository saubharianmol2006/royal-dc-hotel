/* =========================================================
   ROYAL DC HOTEL
   MAIN JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ================= MOBILE MENU ================= */

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenuBtn && mobileMenu) {

        mobileMenuBtn.addEventListener("click", () => {

            mobileMenu.classList.toggle("show");

            const icon = mobileMenuBtn.querySelector("i");

            if (mobileMenu.classList.contains("show")) {
                icon.classList.remove("bi-list");
                icon.classList.add("bi-x-lg");
            } else {
                icon.classList.remove("bi-x-lg");
                icon.classList.add("bi-list");
            }

        });


        /* Close mobile menu after clicking a link */

        const mobileLinks = mobileMenu.querySelectorAll("a");

        mobileLinks.forEach((link) => {

            link.addEventListener("click", () => {

                mobileMenu.classList.remove("show");

                const icon = mobileMenuBtn.querySelector("i");

                icon.classList.remove("bi-x-lg");
                icon.classList.add("bi-list");

            });

        });

    }


    /* ================= HOME BOOKING BAR ================= */

    const homeSearchBtn = document.getElementById("homeSearchBtn");
    const homeCheckIn = document.getElementById("homeCheckIn");
    const homeCheckOut = document.getElementById("homeCheckOut");
    const homeGuests = document.getElementById("homeGuests");


    if (
        homeSearchBtn &&
        homeCheckIn &&
        homeCheckOut &&
        homeGuests
    ) {

        /* Set today's date as minimum check-in */

        const today = new Date();

        const todayString =
            today.toISOString().split("T")[0];

        homeCheckIn.min = todayString;
        homeCheckOut.min = todayString;


        /* Check-in change */

        homeCheckIn.addEventListener("change", () => {

            if (homeCheckIn.value) {

                homeCheckOut.min = homeCheckIn.value;

                if (
                    homeCheckOut.value &&
                    homeCheckOut.value <= homeCheckIn.value
                ) {
                    homeCheckOut.value = "";
                }

            }

        });


        /* Search availability */

        homeSearchBtn.addEventListener("click", () => {

            const checkIn = homeCheckIn.value;
            const checkOut = homeCheckOut.value;
            const guests = homeGuests.value;


            if (!checkIn || !checkOut) {

                alert(
                    "Please select your check-in and check-out dates."
                );

                return;

            }


            if (checkOut <= checkIn) {

                alert(
                    "Check-out date must be after check-in date."
                );

                return;

            }


            /*
             * Send selected information to booking page.
             */

            const params = new URLSearchParams({

                checkIn: checkIn,

                checkOut: checkOut,

                guests: guests

            });


            window.location.href =
                `booking.html?${params.toString()}`;

        });

    }


    /* ================= SMOOTH ANCHOR LINKS ================= */

    const anchorLinks =
        document.querySelectorAll('a[href^="#"]');


    anchorLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }


            const target =
                document.querySelector(targetId);


            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* ================= CURRENT YEAR ================= */

    const yearElement =
        document.querySelector(".footer-bottom p");

    if (yearElement) {

        const currentYear =
            new Date().getFullYear();

        yearElement.innerHTML =
            `© ${currentYear} Royal DC Hotel. All Rights Reserved.`;

    }

});