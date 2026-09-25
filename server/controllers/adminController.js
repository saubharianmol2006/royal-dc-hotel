const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/*
=========================================================
ADMIN LOGIN
=========================================================
*/

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Find admin
        const admin = await Admin.findOne({
            email: email.toLowerCase().trim()
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check active status
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "Admin account is inactive."
            });
        }

        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // JWT secret check
        if (!process.env.JWT_SECRET) {
            console.error(
                "JWT_SECRET is missing in .env"
            );

            return res.status(500).json({
                success: false,
                message: "Server configuration error."
            });
        }

        // Create token
        const token = jwt.sign(
            {
                adminId: admin._id.toString(),
                role: admin.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Admin login successful.",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to login admin."
        });
    }
};


/*
=========================================================
GET CURRENT ADMIN
=========================================================
*/

const getCurrentAdmin = async (req, res) => {
    try {

        const admin = await Admin.findById(
            req.admin.adminId
        ).select("-password");

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found."
            });
        }

        return res.status(200).json({
            success: true,
            admin
        });

    } catch (error) {

        console.error(
            "Get current admin error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch admin details."
        });
    }
};


module.exports = {
    loginAdmin,
    getCurrentAdmin
};