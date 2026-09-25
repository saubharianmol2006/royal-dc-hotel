const express = require("express");

const {
    loginAdmin,
    getCurrentAdmin
} = require("../controllers/adminController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Admin Login
router.post(
    "/login",
    loginAdmin
);

// Protected Admin Profile
router.get(
    "/me",
    adminAuth,
    getCurrentAdmin
);

module.exports = router;