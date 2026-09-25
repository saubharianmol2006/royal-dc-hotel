const express = require("express");
const crypto = require("crypto");

const Booking = require("../models/Booking");
const Room = require("../models/Room");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// --------------------------------------------------
// Constants
// --------------------------------------------------

const PAYMENT_HOLD_MINUTES = 10;

// --------------------------------------------------
// Generate unique booking ID
// --------------------------------------------------

const generateBookingId = () => {
    return `RDH-${Date.now()}-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;
};

// --------------------------------------------------
// Calculate total nights
// --------------------------------------------------

const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference =
        end.getTime() - start.getTime();

    return Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );
};

// --------------------------------------------------
// Create payment hold expiry
// --------------------------------------------------

const getPaymentHoldExpiry = () => {
    return new Date(
        Date.now() +
        PAYMENT_HOLD_MINUTES * 60 * 1000
    );
};

// --------------------------------------------------
// Get occupancy-based room price
// --------------------------------------------------

const getRoomPrice = (room, adults) => {
    const guestCount = Number(adults);

    if (guestCount === 1) {
        return room.singleOccupancyPrice;
    }

    return room.doubleOccupancyPrice;
};

// --------------------------------------------------
// CREATE BOOKING
// POST /api/bookings
// --------------------------------------------------

router.post("/", async (req, res) => {
    try {
        const {
            guestName,
            guestEmail,
            guestPhone,
            roomId,
            checkIn,
            checkOut,
            adults,
            children,
            specialRequest
        } = req.body;

        // ------------------------------------------
        // Required fields
        // ------------------------------------------

        if (
            !guestName ||
            !guestEmail ||
            !guestPhone ||
            !roomId ||
            !checkIn ||
            !checkOut ||
            !adults
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required booking details"
            });
        }

        // ------------------------------------------
        // Validate adults
        // ------------------------------------------

        const adultCount = Number(adults);

        if (
            !Number.isInteger(adultCount) ||
            adultCount < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "At least 1 adult is required"
            });
        }

        // ------------------------------------------
        // Find room
        // ------------------------------------------

        const room =
            await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        // ------------------------------------------
        // Check room status
        // ------------------------------------------

        if (room.status !== "available") {
            return res.status(400).json({
                success: false,
                message:
                    "This room is currently unavailable"
            });
        }

        // ------------------------------------------
        // Validate dates
        // ------------------------------------------

        const startDate =
            new Date(checkIn);

        const endDate =
            new Date(checkOut);

        if (
            Number.isNaN(
                startDate.getTime()
            ) ||
            Number.isNaN(
                endDate.getTime()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid check-in or check-out date"
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Check-out date must be after check-in date"
            });
        }

        // ------------------------------------------
        // Calculate nights
        // ------------------------------------------

        const nights =
            calculateNights(
                startDate,
                endDate
            );

        if (nights < 1) {
            return res.status(400).json({
                success: false,
                message:
                    "Minimum stay is 1 night"
            });
        }

        // ------------------------------------------
        // Validate guests
        // ------------------------------------------

        const childCount =
            Number(children || 0);

        const totalGuests =
            adultCount + childCount;

        if (
            totalGuests >
            room.maxGuests
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `This room allows maximum ${room.maxGuests} guests`
            });
        }

        // ------------------------------------------
        // Room pricing
        //
        // 1 adult  = Single occupancy price
        // 2+ adults = Double occupancy price
        // ------------------------------------------

        const pricePerNight =
            getRoomPrice(
                room,
                adultCount
            );

        if (
            typeof pricePerNight !== "number" ||
            pricePerNight < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Room pricing is not configured correctly"
            });
        }

        // ------------------------------------------
        // Check room availability
        //
        // A room is blocked only when:
        //
        // 1. Booking is confirmed
        // 2. Booking is checked-in
        // 3. Booking is pending AND its
        //    payment hold has not expired
        //
        // Cancelled and checked-out bookings
        // do not block availability.
        // ------------------------------------------

        const now = new Date();

        const overlappingBooking =
            await Booking.findOne({
                room: room._id,

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

        if (overlappingBooking) {
            return res.status(409).json({
                success: false,
                message:
                    "This room is already unavailable for the selected dates. Please choose different dates or another room."
            });
        }

        // ------------------------------------------
        // Calculate total amount
        // ------------------------------------------

        const totalAmount =
            nights * pricePerNight;

        // ------------------------------------------
        // Create temporary payment hold
        // ------------------------------------------

        const paymentHoldExpiresAt =
            getPaymentHoldExpiry();

        // ------------------------------------------
        // Create booking
        // ------------------------------------------

        const booking =
            await Booking.create({
                bookingId:
                    generateBookingId(),

                guestName,

                guestEmail,

                guestPhone,

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
                    childCount,

                totalNights:
                    nights,

                pricePerNight,

                totalAmount,

                bookingStatus:
                    "pending",

                paymentStatus:
                    "pending",

                paymentHoldExpiresAt,

                paymentMethod:
                    "razorpay",

                specialRequest:
                    specialRequest || ""
            });

        // ------------------------------------------
        // Response
        // ------------------------------------------

        res.status(201).json({
            success: true,

            message:
                "Booking created successfully. Room is temporarily held for payment.",

            booking
        });

    } catch (error) {
        console.error(
            "Create booking error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create booking"
        });
    }
});

// --------------------------------------------------
// GET ALL BOOKINGS
// GET /api/bookings
// --------------------------------------------------

router.get("/", async (req, res) => {
    try {
        const bookings =
            await Booking.find()
                .populate(
                    "room",
                    "roomNumber roomType title"
                )
                .sort({
                    createdAt: -1
                });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings
        });

    } catch (error) {
        console.error(
            "Get bookings error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch bookings"
        });
    }
});

// --------------------------------------------------
// GET SINGLE BOOKING
// GET /api/bookings/:id
// --------------------------------------------------

router.get("/:id", async (req, res) => {
    try {
        const booking =
            await Booking.findById(
                req.params.id
            ).populate(
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

        res.status(200).json({
            success: true,
            booking
        });

    } catch (error) {
        console.error(
            "Get booking error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch booking"
        });
    }
});

// --------------------------------------------------
// UPDATE BOOKING STATUS
// PATCH /api/bookings/:id/status
//
// ADMIN ONLY
// --------------------------------------------------

router.patch(
    "/:id/status",
    adminAuth,
    async (req, res) => {
        try {
            const {
                bookingStatus
            } = req.body;

            // --------------------------------------
            // Allowed booking statuses
            // --------------------------------------

            const allowedStatuses = [
                "pending",
                "confirmed",
                "checked-in",
                "checked-out",
                "cancelled"
            ];

            if (
                !allowedStatuses.includes(
                    bookingStatus
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid booking status"
                });
            }

            // --------------------------------------
            // Prepare update
            // --------------------------------------

            const updateData = {
                bookingStatus
            };

            // --------------------------------------
            // Confirmed booking
            //
            // Temporary payment hold is no longer
            // needed once booking is confirmed.
            // --------------------------------------

            if (
                bookingStatus === "confirmed"
            ) {
                updateData.paymentHoldExpiresAt =
                    null;
            }

            // --------------------------------------
            // Cancelled booking
            //
            // Release temporary room hold.
            // --------------------------------------

            if (
                bookingStatus === "cancelled"
            ) {
                updateData.paymentHoldExpiresAt =
                    null;
            }

            // --------------------------------------
            // Update booking
            // --------------------------------------

            const booking =
                await Booking.findByIdAndUpdate(
                    req.params.id,
                    updateData,
                    {
                        new: true,
                        runValidators: true
                    }
                );

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Booking not found"
                });
            }

            // --------------------------------------
            // Response
            // --------------------------------------

            res.status(200).json({
                success: true,
                message:
                    "Booking status updated successfully",
                booking
            });

        } catch (error) {
            console.error(
                "Update booking status error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update booking status"
            });
        }
    }
);

// --------------------------------------------------
// CANCEL BOOKING
// PATCH /api/bookings/:id/cancel
//
// ADMIN ONLY
// --------------------------------------------------

router.patch(
    "/:id/cancel",
    adminAuth,
    async (req, res) => {
        try {
            const booking =
                await Booking.findByIdAndUpdate(
                    req.params.id,
                    {
                        bookingStatus:
                            "cancelled",

                        paymentHoldExpiresAt:
                            null
                    },
                    {
                        new: true,
                        runValidators: true
                    }
                );

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Booking not found"
                });
            }

            res.status(200).json({
                success: true,
                message:
                    "Booking cancelled successfully",
                booking
            });

        } catch (error) {
            console.error(
                "Cancel booking error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to cancel booking"
            });
        }
    }
);

module.exports = router;