const mongoose = require("mongoose");

const BulkActionSchema = new mongoose.Schema({
  actionId: { type: String, required: true, unique: true },  // UUID
  accountId: { type: String, required: true },
  entityType: { type: String, required: true },
  status: {
    type: String,
    enum: ["SCHEDULED", "QUEUED", "PROCESSING", "COMPLETED", "PARTIALLY_COMPLETED", "FAILED"],
    default: "SCHEDULED",
  },
  totalRecords: { type: Number, required: true },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  skippedCount: { type: Number, default: 0 },
  scheduledAt: { type: Date },  // Null if immediate
  createdAt: { type: Date, default: Date.now },
  updates: {
    type: [{
      id: String,
      name: String,
      email: String,
      age: Number,
      // Add other fields as needed
    }],
    default: undefined // Only save if explicitly set
  },
  completedAt: { 
    type: Date 
  }
});

module.exports = mongoose.model("BulkAction", BulkActionSchema);
