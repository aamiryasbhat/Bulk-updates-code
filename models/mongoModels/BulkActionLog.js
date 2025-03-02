const mongoose = require("mongoose");

const BulkActionLogSchema = new mongoose.Schema({
  bulkActionId: { type: String, required: true },
  accountId: { type: String, required: true },
  contactId: { type: String, required: false },  // Some might fail before reaching Contact ID
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED", "SKIPPED"],
    required: true,
  },
  previousValues: { type: Object },  // Null for failures
  errorMessage: { type: String },  // Only for failed actions
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BulkActionLog", BulkActionLogSchema);
