const express = require("express");
const router = express.Router();
const bulkActionController = require("../controllers/bulkActionController");
//const rateLimiter =require("../middleware/rateLimiter");
router.post("/", bulkActionController.createBulkAction); // Create bulk action
router.get("/:actionId", bulkActionController.getBulkActionStatus); // Get bulk action status
router.get("/", bulkActionController.getAllBulkActions);// Get All Bulk Actions
router.get("/:actionId/stats", bulkActionController.getBulkActionStats);
module.exports = router;
