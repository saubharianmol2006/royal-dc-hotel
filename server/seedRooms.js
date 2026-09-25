const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db");
const Room = require("./models/Room");

const rooms = [
    {
        roomNumber: "101",
        roomType: "Deluxe Room",
        title: "Deluxe King Room",
        description:
            "Elegant and comfortable accommodation for a relaxing stay.",
        singleOccupancyPrice: 2000,
        doubleOccupancyPrice: 2500,
        maxGuests: 2,
        bedType: "King Bed",
        size: "350 sq ft",
        amenities: [
            "Free Wi-Fi",
            "Air Conditioning",
            "Smart TV",
            "Room Service",
            "Attached Bathroom",
            "Breakfast Included"
        ],
        images: [
            "assets/images/Deluxe King Room1.jpeg",
            "assets/images/Deluxe King Room2.jpeg",
            "assets/images/Deluxe King bathroom.jpeg"
        ],
        status: "available"
    },

    {
        roomNumber: "201",
        roomType: "Executive Room",
        title: "Royal Executive Room",
        description:
            "A spacious stay offering extra comfort for business and family guests.",
        singleOccupancyPrice: 3000,
        doubleOccupancyPrice: 3500,
        maxGuests: 3,
        bedType: "King Bed",
        size: "450 sq ft",
        amenities: [
            "Free Wi-Fi",
            "Air Conditioning",
            "Smart TV",
            "Room Service",
            "Mini Bar",
            "Attached Bathroom",
            "Breakfast Included"
        ],
        images: [
            "assets/images/Royal Executive Room1.jpeg",
            "assets/images/Royal Executive Room2.jpeg",
            "assets/images/Royal Executive Room3.jpeg"
        ],
        status: "available"
    }
];

const seedRooms = async () => {
    try {
        await connectDB();

        // Remove old/wrong room records
        await Room.deleteMany({});

        console.log("Old room data deleted.");

        // Insert the correct Royal DC Hotel rooms
        await Room.insertMany(rooms);

        console.log("Royal DC Hotel rooms added successfully.");
        console.log("Total rooms:", rooms.length);

        process.exit(0);
    } catch (error) {
        console.error(
            "Room seed failed:",
            error.message
        );

        process.exit(1);
    }
};

seedRooms();