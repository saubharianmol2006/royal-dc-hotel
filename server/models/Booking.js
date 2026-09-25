const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },

        guestName: {
            type: String,
            required: true,
            trim: true
        },

        guestEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        guestPhone: {
            type: String,
            required: true,
            trim: true
        },

        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },

        roomNumber: {
            type: String,
            required: true,
            trim: true
        },

        checkIn: {
            type: Date,
            required: true
        },

        checkOut: {
            type: Date,
            required: true
        },

        adults: {
            type: Number,
            required: true,
            min: 1
        },

        children: {
            type: Number,
            default: 0,
            min: 0
        },

        totalNights: {
            type: Number,
            required: true,
            min: 1
        },

        // Price used for this particular booking
        pricePerNight: {
            type: Number,
            required: true,
            min: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        bookingStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "checked-in",
                "checked-out",
                "cancelled"
            ],
            default: "pending"
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded"
            ],
            default: "pending"
        },

        paymentHoldExpiresAt: {
            type: Date,
            default: null
        },

        paymentMethod: {
            type: String,
            enum: [
                "razorpay",
                "cash",
                "other"
            ],
            default: "razorpay"
        },

        razorpayOrderId: {
            type: String,
            default: null
        },

        razorpayPaymentId: {
            type: String,
            default: null
        },

        razorpaySignature: {
            type: String,
            default: null
        },

        specialRequest: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Booking",
    bookingSchema
);