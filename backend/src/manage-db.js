import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import FileShare from "./models/fileShare.js";
import OTP from "./models/otp.js";

dotenv.config();

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
};

class DatabaseManager {
    constructor() {
        this.connected = false;
    }

    async connect() {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            this.connected = true;
            console.log(`${colors.green}✅ Connected to MongoDB${colors.reset}`);
            console.log(`${colors.cyan}📊 Database: ${mongoose.connection.db.databaseName}${colors.reset}`);
            console.log(`${colors.cyan}🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}${colors.reset}\n`);
        } catch (error) {
            console.error(`${colors.red}❌ Connection failed:${colors.reset}`, error.message);
            process.exit(1);
        }
    }

    async disconnect() {
        if (this.connected) {
            await mongoose.connection.close();
            console.log(`\n${colors.yellow}👋 Disconnected from MongoDB${colors.reset}`);
        }
    }

    async showStats() {
        console.log(`${colors.bright}📈 Database Statistics${colors.reset}`);
        console.log("─".repeat(50));

        const userCount = await User.countDocuments();
        const fileShareCount = await FileShare.countDocuments();
        const otpCount = await OTP.countDocuments();

        console.log(`${colors.blue}👥 Users:${colors.reset} ${userCount}`);
        console.log(`${colors.blue}📁 File Shares:${colors.reset} ${fileShareCount}`);
        console.log(`${colors.blue}🔐 Active OTPs:${colors.reset} ${otpCount}`);
        console.log("─".repeat(50) + "\n");
    }

    async listCollections() {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`${colors.bright}📁 Collections (${collections.length})${colors.reset}`);
        console.log("─".repeat(50));

        if (collections.length === 0) {
            console.log(`${colors.yellow}No collections yet. They will be created when you insert data.${colors.reset}`);
        } else {
            for (const col of collections) {
                const stats = await mongoose.connection.db.collection(col.name).stats();
                console.log(`${colors.cyan}${col.name}${colors.reset}`);
                console.log(`  Documents: ${stats.count}`);
                console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
                console.log(`  Indexes: ${stats.nindexes}`);
            }
        }
        console.log("─".repeat(50) + "\n");
    }

    async listUsers() {
        const users = await User.find().select("-__v").limit(10);
        console.log(`${colors.bright}👥 Recent Users (max 10)${colors.reset}`);
        console.log("─".repeat(50));

        if (users.length === 0) {
            console.log(`${colors.yellow}No users found${colors.reset}`);
        } else {
            users.forEach((user, index) => {
                console.log(`${colors.cyan}${index + 1}. ${user.name}${colors.reset}`);
                console.log(`   ID: ${user._id}`);
                console.log(`   Auth Method: ${user.authMethod}`);
                if (user.email) console.log(`   Email: ${user.email}`);
                if (user.phoneNumber) console.log(`   Phone: ${user.phoneNumber}`);
                console.log(`   Created: ${user.createdAt.toLocaleString()}`);
                console.log();
            });
        }
        console.log("─".repeat(50) + "\n");
    }

    async listFileShares() {
        const shares = await FileShare.find()
            .populate("uploadedBy", "name email phoneNumber")
            .select("-__v")
            .sort({ createdAt: -1 })
            .limit(10);

        console.log(`${colors.bright}📁 Recent File Shares (max 10)${colors.reset}`);
        console.log("─".repeat(50));

        if (shares.length === 0) {
            console.log(`${colors.yellow}No file shares found${colors.reset}`);
        } else {
            shares.forEach((share, index) => {
                console.log(`${colors.cyan}${index + 1}. ${share.fileName}${colors.reset}`);
                console.log(`   Share ID: ${share.shareId}`);
                console.log(`   Uploader: ${share.uploaderName}`);
                console.log(`   Receiver: ${share.receiverPhone}`);
                console.log(`   Size: ${(share.fileSize / 1024 / 1024).toFixed(2)} MB`);
                console.log(`   Downloads: ${share.downloadCount}`);
                console.log(`   Created: ${share.createdAt.toLocaleString()}`);
                console.log();
            });
        }
        console.log("─".repeat(50) + "\n");
    }

    async clearAllData() {
        console.log(`${colors.red}⚠️  WARNING: This will delete ALL data!${colors.reset}`);

        await User.deleteMany({});
        await FileShare.deleteMany({});
        await OTP.deleteMany({});

        console.log(`${colors.green}✅ All data cleared${colors.reset}\n`);
    }

    async showIndexes() {
        console.log(`${colors.bright}📑 Database Indexes${colors.reset}`);
        console.log("─".repeat(50));

        const collections = ["users", "fileshares", "otps"];

        for (const collectionName of collections) {
            try {
                const indexes = await mongoose.connection.db.collection(collectionName).indexes();
                console.log(`${colors.cyan}${collectionName}:${colors.reset}`);
                indexes.forEach(index => {
                    console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
                });
                console.log();
            } catch (error) {
                console.log(`${colors.yellow}  Collection not found${colors.reset}\n`);
            }
        }
        console.log("─".repeat(50) + "\n");
    }
}

// Main execution
const manager = new DatabaseManager();

const command = process.argv[2] || "stats";

(async () => {
    await manager.connect();

    switch (command) {
        case "stats":
            await manager.showStats();
            break;

        case "collections":
            await manager.listCollections();
            break;

        case "users":
            await manager.listUsers();
            break;

        case "shares":
            await manager.listFileShares();
            break;

        case "indexes":
            await manager.showIndexes();
            break;

        case "all":
            await manager.showStats();
            await manager.listCollections();
            await manager.listUsers();
            await manager.listFileShares();
            break;

        case "clear":
            await manager.clearAllData();
            await manager.showStats();
            break;

        default:
            console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
            console.log("\nAvailable commands:");
            console.log("  stats       - Show database statistics (default)");
            console.log("  collections - List all collections with details");
            console.log("  users       - List recent users");
            console.log("  shares      - List recent file shares");
            console.log("  indexes     - Show database indexes");
            console.log("  all         - Show everything");
            console.log("  clear       - Clear all data (WARNING: destructive!)");
    }

    await manager.disconnect();
})();
