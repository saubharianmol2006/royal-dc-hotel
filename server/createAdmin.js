const readline = require("readline");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const Admin = require("./models/Admin");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(text) {
    return new Promise((resolve) => {
        rl.question(text, resolve);
    });
}

async function createAdmin() {
    try {
        console.log("");
        console.log("====================================");
        console.log("     ROYAL DC HOTEL ADMIN SETUP");
        console.log("====================================");
        console.log("");

        await connectDB();

        const name = await question("Admin Name: ");
        const email = await question("Admin Email: ");
        const password = await question("Admin Password: ");

        if (!name.trim() || !email.trim() || !password) {
            console.log("");
            console.log("Name, email and password are required.");
            process.exit(1);
        }

        if (password.length < 8) {
            console.log("");
            console.log("Password must be at least 8 characters.");
            process.exit(1);
        }

        const existingAdmin = await Admin.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingAdmin) {
            console.log("");
            console.log("An admin with this email already exists.");
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const admin = await Admin.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "admin",
            isActive: true
        });

        console.log("");
        console.log("====================================");
        console.log("       ADMIN CREATED SUCCESSFULLY");
        console.log("====================================");
        console.log("");
        console.log("Admin ID:", admin._id.toString());
        console.log("Name:", admin.name);
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);
        console.log("");
        console.log("Password has been securely hashed.");
        console.log("");

        process.exit(0);

    } catch (error) {
        console.error("");
        console.error("Admin creation failed:");
        console.error(error.message);
        process.exit(1);
    }
}

createAdmin();