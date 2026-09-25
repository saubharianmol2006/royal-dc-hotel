const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        roomType: {
            type: String,
            required: true,
            enum: [
                "Deluxe Room",
                "Executive Room"
            ]
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        // Single occupancy price
        singleOccupancyPrice: {
            type: Number,
            required: true,
            min: 0
        },

        // Double occupancy price
        doubleOccupancyPrice: {
            type: Number,
            required: true,
            min: 0
        },

        maxGuests: {
            type: Number,
            required: true,
            min: 1
        },

        bedType: {
            type: String,
            required: true,
            trim: true
        },

        size: {
            type: String,
            required: true,
            trim: true
        },

        amenities: {
            type: [String],
            default: []
        },

        images: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: [
                "available",
                "maintenance",
                "inactive"
            ],
            default: "available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Room",
    roomSchema
);