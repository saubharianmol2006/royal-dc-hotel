const express = require("express");
const Room = require("../models/Room");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/*
    GET ALL ROOMS
    GET /api/rooms
*/
router.get("/", async (req, res) => {
    try {
        const rooms = await Room.find().sort({ roomNumber: 1 });

        res.status(200).json({
            success: true,
            count: rooms.length,
            rooms
        });
    } catch (error) {
        console.error("Get rooms error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch rooms"
        });
    }
});


/*
    GET SINGLE ROOM
    GET /api/rooms/:id
*/
router.get("/:id", async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        res.status(200).json({
            success: true,
            room
        });
    } catch (error) {
        console.error("Get room error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch room"
        });
    }
});


/*
    CREATE ROOM
    POST /api/rooms
*/
router.post("/", async (req, res) => {
    try {
        const {
            roomNumber,
            roomType,
            title,
            description,
            pricePerNight,
            maxGuests,
            bedType,
            size,
            amenities,
            images,
            status
        } = req.body;

        const existingRoom = await Room.findOne({
            roomNumber
        });

        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: "Room number already exists"
            });
        }

        const room = await Room.create({
            roomNumber,
            roomType,
            title,
            description,
            pricePerNight,
            maxGuests,
            bedType,
            size,
            amenities,
            images,
            status
        });

        res.status(201).json({
            success: true,
            message: "Room created successfully",
            room
        });

    } catch (error) {
        console.error(
            "Create room error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to create room"
        });
    }
});


/*
    UPDATE ROOM STATUS
    PATCH /api/rooms/:id/status

    ADMIN ONLY
*/
router.patch(
    "/:id/status",
    adminAuth,
    async (req, res) => {
        try {

            const { status } = req.body;

            /*
                Only these statuses are allowed
            */
            const allowedStatuses = [
                "available",
                "maintenance",
                "inactive"
            ];

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: "Room status is required"
                });
            }

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid room status"
                });
            }


            const room =
                await Room.findByIdAndUpdate(
                    req.params.id,
                    {
                        status
                    },
                    {
                        new: true,
                        runValidators: true
                    }
                );


            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: "Room not found"
                });
            }


            res.status(200).json({
                success: true,
                message:
                    `Room status changed to ${status}`,
                room
            });

        } catch (error) {

            console.error(
                "Update room status error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update room status"
            });
        }
    }
);


/*
    UPDATE ROOM
    PUT /api/rooms/:id
*/
router.put("/:id", async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Room updated successfully",
            room
        });

    } catch (error) {
        console.error(
            "Update room error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to update room"
        });
    }
});


/*
    DELETE ROOM
    DELETE /api/rooms/:id
*/
router.delete("/:id", async (req, res) => {
    try {
        const room =
            await Room.findByIdAndDelete(
                req.params.id
            );

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Room deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete room error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete room"
        });
    }
});


module.exports = router;