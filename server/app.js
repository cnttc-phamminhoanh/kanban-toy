
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const database = require("./src/config/connectData");
const databaseMysql = require("./src/config/connectDataMsqls");
var DashboardRouter = require('./src/routes/dashboard')
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ["http://172.18.1.12:8082"],
    credentials: true,
}));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', DashboardRouter);


// Start Server
async function startServer() {
    try {
        // Khởi tạo MySQL Pool
        const mysqlPool = await databaseMysql.CONNECT_IG_DB();

        // Kiểm tra kết nối MySQL thực tế
        await mysqlPool.query("SELECT 1");

        console.log("✅ MySQL connected successfully");

        // Kết nối SQL Server
        await database.getPool();

        console.log("✅ SQL Server connected successfully");

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
