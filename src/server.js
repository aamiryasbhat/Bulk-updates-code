require("dotenv").config();  // Load environment variables at the top

const express = require("express");
const connectMongoDB = require("../config/mongodb"); // Ensure correct import
const bulkActionRoutes = require("../routes/bulkActionRoutes");

const app = express();
app.use(express.json({ limit: "50mb" })); 

require("../worker/bulkActionWorker"); // This should start the worker when the server starts

// Connect MongoDB
connectMongoDB();

app.use("/bulk-actions", bulkActionRoutes);

app.listen(3001, () => console.log("🚀 Server running on port 3000"));
