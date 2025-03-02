const bulkQueue = require("../queues/bulkQueue");
const { BulkAction, BulkActionLog } = require("../models/mongoModels");
const crypto = require("crypto");
const { getISTTime, getUTCTime } = require("../utils/helper");

// Create bulk action
exports.createBulkAction = async (req, res) => {
  const { accountId, entityType, updates, scheduledAt } = req.body;

  try {
    // Validate required fields
    if (!accountId) {
      return res.status(400).json({ error: "accountId is required" });
    }

    if (!entityType) {
      return res.status(400).json({ error: "entityType is required" });
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: "Updates must be a non-empty array" });
    }

    // Validate scheduledAt
    let scheduledTimeIST = null;
    let scheduledTimeUTC = null;
    
    if (scheduledAt) {
      scheduledTimeIST = new Date(scheduledAt);
      const nowIST = getISTTime(new Date());
      
      if (isNaN(scheduledTimeIST.getTime())) {
        return res.status(400).json({ error: "Invalid scheduledAt date format" });
      }
      
      if (scheduledTimeIST <= nowIST) {
        return res.status(400).json({ error: "scheduledAt must be in the future" });
      }

      // Convert IST to UTC for storage and queue
      scheduledTimeUTC = getUTCTime(scheduledTimeIST);

      // Log times for debugging
      //console.log('Current time (IST):', nowIST.toISOString());
      //console.log('Scheduled time (IST):', scheduledTimeIST.toISOString());
      //console.log('Scheduled time (UTC):', scheduledTimeUTC.toISOString());
    }

    // Transform updates
    const transformedUpdates = updates.map(update => {
      if (!update.contactId || typeof update.contactId !== 'string') {
        throw new Error("Each update must have a valid contactId");
      }
      if (!update.updates || typeof update.updates !== 'object') {
        throw new Error("Each update must have an updates object");
      }

      return {
        contactId: update.contactId,
        ...update.updates
      };
    });

    const actionId = crypto.randomUUID();
    //console.log("Creating bulk action:", actionId, "with updates:", transformedUpdates);

    // Create bulk action record
    const bulkAction = await BulkAction.create({
      actionId,
      accountId,
      entityType,
      status: scheduledTimeUTC ? "SCHEDULED" : "QUEUED",
      totalRecords: transformedUpdates.length,
      scheduledAt: scheduledTimeUTC,
      updates: scheduledTimeUTC ? transformedUpdates : undefined
    });

    // Add to queue with delay if scheduled
    const queueOptions = {
      removeOnComplete: false
    };

    if (scheduledTimeUTC) {
      const now = Date.now();
      const delay = scheduledTimeUTC.getTime() - now;
      
      // Log delay calculation in minutes
     // console.log('Delay in minutes:', Math.round(delay / (1000 * 60)));
      
      if (delay > 0) {
        queueOptions.delay = delay;
      } else {
        console.warn('Scheduled time is too close to current time');
      }
    }

    await bulkQueue.add(
      "process-bulk",
      { 
        actionId,
        accountId,
        entityType,
        updates: transformedUpdates 
      },
      queueOptions
    );

    const currentTimeIST = getISTTime(new Date());

    return res.json({ 
      message: scheduledTimeUTC ? "Bulk action scheduled" : "Bulk action queued",
      actionId,
      status: bulkAction.status,
      totalUpdates: transformedUpdates.length,
      scheduledAt: scheduledTimeIST ? scheduledTimeIST.toISOString() : null,
      currentTimeIST: currentTimeIST.toISOString(),
      delayInMinutes: queueOptions.delay ? Math.round(queueOptions.delay / (1000 * 60)) : 0
    });

  } catch (error) {
    console.error("Error creating bulk action:", error);
    return res.status(400).json({ 
      error: error.message,
      details: "Please ensure each update has a valid contactId and updates object"
    });
  }
};

// Get bulk action status
exports.getBulkActionStatus = async (req, res) => {
  try {
    const { actionId } = req.params;
    //console.log("This is the actionId",actionId)
    //console.log("✅ Route Hit! Params:", req.params);
    const bulkAction = await BulkAction.findOne({ actionId });

    if (!bulkAction) {
      return res.status(404).json({ error: "Bulk action not found" });
    }

    res.json({ status: bulkAction.status });
  } catch (error) {
    console.error("❌ Error fetching bulk action status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get all bulk actions
exports.getAllBulkActions = async (req, res) => {
  try {
    //console.log("✅ Route Hit: GET /bulk-actions");

    const bulkActions = await BulkAction.find({}, "actionId status"); // Fetch only actionId and status

    res.json(bulkActions);
  } catch (error) {
    console.error("❌ Error fetching bulk actions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get bulk action stats
exports.getBulkActionStats = async (req, res) => {
  try {
    const { actionId } = req.params;
    //console.log("✅ Route Hit: GET /bulk-actions/:actionId/stats", { actionId });

    const bulkAction = await BulkAction.findOne({ actionId }, "successCount failureCount skippedCount");

    if (!bulkAction) {
      return res.status(404).json({ error: "Bulk action not found" });
    }

    res.json({
      successCount: bulkAction.successCount,
      failureCount: bulkAction.failureCount,
      skippedCount: bulkAction.skippedCount,
    });
  } catch (error) {
    console.error("❌ Error fetching bulk action stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


