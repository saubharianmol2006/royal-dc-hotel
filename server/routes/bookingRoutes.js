const express = require("express");
const mongoose = require("mongoose");

const Room = require("../models/Room");
const Booking = require("../models/Booking");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();


// =====================================================
// HELPER: Calculate number of nights
// =====================================================

function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference =
        end.getTime() - start.getTime();

    return Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );
}


// =====================================================
// HELPER: Generate Booking ID
// =====================================================

function generateBookingId() {
    return `RDH-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;
}


// =====================================================
// CREATE BOOKING
// POST /api/bookings
// =====================================================

router.post("/", async (req, res) => {
    try {

        const {
            roomId,
            guestName,
            guestEmail,
            guestPhone,
            checkIn,
            checkOut,
            adults,
            children = 0,
            specialRequest = ""
        } = req.body;


        // -------------------------------------------------
        // Validate required fields
        // -------------------------------------------------

        if (
            !roomId ||
            !guestName ||
            !guestEmail ||
            !guestPhone ||
            !checkIn ||
            !checkOut ||
            !adults
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required booking fields."
            });
        }


        // -------------------------------------------------
        // Validate MongoDB Room ID
        // -------------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid room selected."
            });
        }


        // -------------------------------------------------
        // Find Room
        // -------------------------------------------------

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Selected room was not found."
            });
        }


        // -------------------------------------------------
        // Check Room Status
        // -------------------------------------------------

        if (room.status !== "available") {
            return res.status(400).json({
                success: false,
                message:
                    "This room is currently not available for booking."
            });
        }


        // -------------------------------------------------
        // Convert numbers
        // -------------------------------------------------

        const adultCount = Number(adults);
        const childrenCount = Number(children);

        const totalGuests =
            adultCount + childrenCount;


        // -------------------------------------------------
        // Validate Adults
        // -------------------------------------------------

        if (
            !Number.isInteger(adultCount) ||
            adultCount < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "At least 1 adult is required."
            });
        }


        // -------------------------------------------------
        // Validate Children
        // -------------------------------------------------

        if (
            !Number.isInteger(childrenCount) ||
            childrenCount < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid number of children."
            });
        }


        // -------------------------------------------------
        // Check Maximum Guests
        // -------------------------------------------------

        if (totalGuests > room.maxGuests) {
            return res.status(400).json({
                success: false,
                message:
                    `This room allows maximum ${room.maxGuests} guests.`
            });
        }


        // -------------------------------------------------
        // Validate Dates
        // -------------------------------------------------

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid check-in or check-out date."
            });
        }


        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Check-out date must be after check-in date."
            });
        }


        // -------------------------------------------------
        // Calculate Nights
        // -------------------------------------------------

        const totalNights =
            calculateNights(
                checkIn,
                checkOut
            );


        if (totalNights < 1) {
            return res.status(400).json({
                success: false,
                message: "Booking must be at least 1 night."
            });
        }


        // =================================================
        // IMPORTANT:
        // PRICE BASED ON OCCUPANCY
        //
        // 1 Adult  = Single Occupancy
        // 2+ Adults = Double Occupancy
        // =================================================

        const pricePerNight =
            adultCount === 1
                ? Number(room.singleOccupancyPrice)
                : Number(room.doubleOccupancyPrice);


        // -------------------------------------------------
        // Check Room Pricing
        // -------------------------------------------------

        if (
            !Number.isFinite(pricePerNight) ||
            pricePerNight < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Room pricing is not configured correctly."
            });
        }


        // -------------------------------------------------
        // Calculate Total Amount
        // -------------------------------------------------

        const totalAmount =
            totalNights *
            pricePerNight;


        // =================================================
        // CHECK ROOM AVAILABILITY
        // =================================================

        const now = new Date();


        const overlappingBookings =
            await Booking.find({
                room: room._id,

                bookingStatus: {
                    $in: [
                        "pending",
                        "confirmed",
                        "checked-in"
                    ]
                },

                $or: [
                    {
                        bookingStatus: {
                            $in: [
                                "confirmed",
                                "checked-in"
                            ]
                        }
                    },

                    {
                        bookingStatus: "pending",

                        paymentStatus: "pending",

                        paymentHoldExpiresAt: {
                            $gt: now
                        }
                    }
                ],

                checkIn: {
                    $lt: endDate
                },

                checkOut: {
                    $gt: startDate
                }
            });


        if (overlappingBookings.length > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "This room is already booked for the selected dates."
            });
        }


        // =================================================
        // CREATE BOOKING
        // =================================================

        const bookingId =
            generateBookingId();


        // Payment hold for 10 minutes
        const paymentHoldExpiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        const booking =
            new Booking({

                bookingId,

                guestName:
                    guestName.trim(),

                guestEmail:
                    guestEmail
                        .trim()
                        .toLowerCase(),

                guestPhone:
                    guestPhone.trim(),

                room:
                    room._id,

                roomNumber:
                    room.roomNumber,

                checkIn:
                    startDate,

                checkOut:
                    endDate,

                adults:
                    adultCount,

                children:
                    childrenCount,

                totalNights:
                    totalNights,

                pricePerNight:
                    pricePerNight,

                totalAmount:
                    totalAmount,

                bookingStatus:
                    "pending",

                paymentStatus:
                    "pending",

                paymentHoldExpiresAt:
                    paymentHoldExpiresAt,

                paymentMethod:
                    "razorpay",

                specialRequest:
                    specialRequest.trim()
            });


        await booking.save();


        // =================================================
        // SUCCESS RESPONSE
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Booking created successfully.",

            booking: {

                bookingId:
                    booking.bookingId,

                roomNumber:
                    booking.roomNumber,

                roomType:
                    room.roomType,

                guestName:
                    booking.guestName,

                guestEmail:
                    booking.guestEmail,

                guestPhone:
                    booking.guestPhone,

                checkIn:
                    booking.checkIn,

                checkOut:
                    booking.checkOut,

                adults:
                    booking.adults,

                children:
                    booking.children,

                totalNights:
                    booking.totalNights,

                pricePerNight:
                    booking.pricePerNight,

                totalAmount:
                    booking.totalAmount,

                bookingStatus:
                    booking.bookingStatus,

                paymentStatus:
                    booking.paymentStatus
            }
        });


    } catch (error) {

        console.error(
            "CREATE BOOKING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create booking"
        });
    }
});


// =====================================================
// GET ALL BOOKINGS
// GET /api/bookings
// =====================================================

router.get("/", async (req, res) => {

    try {

        const bookings =
            await Booking.find()
                .populate(
                    "room",
                    "roomNumber roomType title singleOccupancyPrice doubleOccupancyPrice"
                )
                .sort({
                    createdAt: -1
                });


        return res.json({

            success: true,

            bookings
        });


    } catch (error) {

        console.error(
            "GET BOOKINGS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch bookings"
        });
    }
});


// =====================================================
// GET SINGLE BOOKING
// GET /api/bookings/:bookingId
// =====================================================

router.get(
    "/:bookingId",
    async (req, res) => {

        try {

            const booking =
                await Booking.findOne({
                    bookingId:
                        req.params.bookingId
                })
                .populate(
                    "room",
                    "roomNumber roomType title singleOccupancyPrice doubleOccupancyPrice"
                );


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found"
                });
            }


            return res.json({

                success: true,

                booking
            });


        } catch (error) {

            console.error(
                "GET SINGLE BOOKING ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch booking"
            });
        }
    }
);


// =====================================================
// UPDATE BOOKING STATUS
// PATCH /api/bookings/:bookingId/status
// ADMIN ONLY
// =====================================================

router.patch(
    "/:bookingId/status",
    adminAuth,
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [
                "pending",
                "confirmed",
                "checked-in",
                "checked-out",
                "cancelled"
            ];


            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid booking status"
                });
            }


            const booking =
                await Booking.findOne({
                    bookingId:
                        req.params.bookingId
                });


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found"
                });
            }


            booking.bookingStatus =
                status;


            // If booking is cancelled,
            // release payment hold

            if (status === "cancelled") {

                booking.paymentHoldExpiresAt =
                    null;

                if (
                    booking.paymentStatus ===
                    "pending"
                ) {
                    booking.paymentStatus =
                        "failed";
                }
            }


            await booking.save();


            return res.json({

                success: true,

                message:
                    "Booking status updated successfully.",

                booking
            });


        } catch (error) {

            console.error(
                "UPDATE BOOKING STATUS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to update booking status"
            });
        }
    }
);


// =====================================================
// CANCEL BOOKING
// PATCH /api/bookings/:bookingId/cancel
// ADMIN ONLY
// =====================================================

router.patch(
    "/:bookingId/cancel",
    adminAuth,
    async (req, res) => {

        try {

            const booking =
                await Booking.findOne({
                    bookingId:
                        req.params.bookingId
                });


            if (!booking) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found"
                });
            }


            booking.bookingStatus =
                "cancelled";

            booking.paymentHoldExpiresAt =
                null;


            await booking.save();


            return res.json({

                success: true,

                message:
                    "Booking cancelled successfully.",

                booking
            });


        } catch (error) {

            console.error(
                "CANCEL BOOKING ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to cancel booking"
            });
        }
    }
);


module.exports = router;