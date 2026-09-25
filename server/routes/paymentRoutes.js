const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Razorpay Configuration
|--------------------------------------------------------------------------
*/

if (!process.env.RAZORPAY_KEY_ID) {
    console.error("ERROR: RAZORPAY_KEY_ID is missing in .env");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error("ERROR: RAZORPAY_KEY_SECRET is missing in .env");
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/*
|--------------------------------------------------------------------------
| Create Razorpay Order
|--------------------------------------------------------------------------
*/

router.post("/create-order", async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required"
            });
        }

        const booking = await Booking.findOne({
            bookingId
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        if (booking.bookingStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "This booking has been cancelled"
            });
        }

        if (booking.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "This booking is already paid"
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Check Payment Hold
        |--------------------------------------------------------------------------
        */

        if (
            booking.paymentHoldExpiresAt &&
            new Date() > new Date(booking.paymentHoldExpiresAt)
        ) {
            booking.bookingStatus = "cancelled";
            booking.paymentStatus = "failed";
            booking.paymentHoldExpiresAt = null;

            await booking.save();

            return res.status(409).json({
                success: false,
                message:
                    "Payment time expired. Please create a new booking."
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Amount
        |--------------------------------------------------------------------------
        */

        const amountInPaise =
            Math.round(Number(booking.totalAmount) * 100);

        if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking amount"
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Razorpay Order Options
        |--------------------------------------------------------------------------
        */

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: booking.bookingId,

            notes: {
                bookingId: booking.bookingId,
                guestName: booking.guestName,
                roomNumber: booking.roomNumber
            }
        };

        console.log(
            `Creating Razorpay order for ${booking.bookingId}`
        );

        /*
        |--------------------------------------------------------------------------
        | Create Razorpay Order
        |--------------------------------------------------------------------------
        */

        const order = await razorpay.orders.create(options);

        if (!order || !order.id) {
            throw new Error(
                "Razorpay returned an invalid order response"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Save Razorpay Order
        |--------------------------------------------------------------------------
        */

        booking.razorpayOrderId = order.id;
        booking.paymentStatus = "pending";

        await booking.save();

        console.log(
            `Razorpay order created successfully: ${order.id}`
        );

        res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",

            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },

            booking: {
                bookingId: booking.bookingId,
                guestName: booking.guestName,
                guestEmail: booking.guestEmail,
                guestPhone: booking.guestPhone,
                totalAmount: booking.totalAmount
            },

            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        /*
        |--------------------------------------------------------------------------
        | Detailed Safe Error Logging
        |--------------------------------------------------------------------------
        */

        console.error("====================================");
        console.error("CREATE RAZORPAY ORDER FAILED");
        console.error("====================================");

        console.error("Message:", error?.message);
        console.error("Status Code:", error?.statusCode);

        if (error?.error) {
            console.error(
                "Razorpay Error:",
                JSON.stringify(error.error, null, 2)
            );
        }

        console.error("Full Error:", error);

        console.error("====================================");

        res.status(500).json({
            success: false,
            message: "Failed to create Razorpay order"
        });
    }
});

/*
|--------------------------------------------------------------------------
| Verify Razorpay Payment
|--------------------------------------------------------------------------
*/

router.post("/verify", async (req, res) => {
    try {
        const {
            bookingId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        } = req.body;

        if (
            !bookingId ||
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment verification details are incomplete"
            });
        }

        const booking = await Booking.findOne({
            bookingId
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Check Razorpay Order
        |--------------------------------------------------------------------------
        */

        if (
            booking.razorpayOrderId &&
            booking.razorpayOrderId !== razorpayOrderId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Razorpay order does not match booking"
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Generate Signature
        |--------------------------------------------------------------------------
        */

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpayOrderId}|${razorpayPaymentId}`
                )
                .digest("hex");

        /*
        |--------------------------------------------------------------------------
        | Verify Signature
        |--------------------------------------------------------------------------
        */

        if (
            generatedSignature !==
            razorpaySignature
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment signature verification failed"
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Payment Successful
        |--------------------------------------------------------------------------
        */

        booking.razorpayOrderId =
            razorpayOrderId;

        booking.razorpayPaymentId =
            razorpayPaymentId;

        booking.razorpaySignature =
            razorpaySignature;

        booking.paymentStatus =
            "paid";

        booking.bookingStatus =
            "confirmed";

        booking.paymentHoldExpiresAt =
            null;

        await booking.save();

        res.status(200).json({
            success: true,
            message:
                "Payment verified successfully",
            booking
        });
    } catch (error) {
        console.error(
            "Payment verification error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Payment verification failed"
        });
    }
});

module.exports = router;