const { Contact } = require('../models');
const { BulkAction, BulkActionLog } = require('../models/mongoModels');
const bulkQueue = require('../queues/bulkQueue');

const BATCH_SIZE = 1000;

bulkQueue.process("process-bulk", async (job) => {
  const { actionId, accountId, entityType, updates } = job.data;
  console.log(`\n🚀 Starting bulk action ${actionId}`);
  console.log(`📦 Total updates to process: ${updates.length}`);

  try {
    const bulkAction = await BulkAction.findOne({ actionId });
    if (!bulkAction) throw new Error("Bulk action not found");

    await BulkAction.updateOne({ actionId }, { status: "PROCESSING" });

    let totalSuccessCount = 0;
    let totalFailureCount = 0;
    let totalSkippedCount = 0;

    const totalBatches = Math.ceil(updates.length / BATCH_SIZE);
    console.log(`\n📊 Will process in ${totalBatches} batches of ${BATCH_SIZE} updates each`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, updates.length);
      const currentBatch = updates.slice(start, end);
      let successCount = 0;
      let failureCount = 0;
      let skippedCount = 0;
      console.log(`\n🔄 Processing Batch ${batchIndex + 1}/${totalBatches}`);
      //console.log(`📑 Updates ${start + 1} to ${end} of ${updates.length}`);

      
      const contactIds = currentBatch.map((u) => u.contactId).filter(Boolean);
      const contactsMap = await Contact.findAll({ where: { id: contactIds },logging: false, }).then((contacts) =>
        contacts.reduce((acc, contact) => {
          acc[contact.id] = contact;
          return acc;
        }, {})
      );

      const bulkLogs = [];

     
      const results = await Promise.allSettled(
        currentBatch.map(async (update) => {
          if (!update.contactId) {
            //console.log(`⏩ Skipping update - Invalid contactId provided`);
            bulkLogs.push({
              bulkActionId: actionId,
              accountId,
              contactId: null,
              status: "SKIPPED",
              previousValues: null,
              errorMessage: "Invalid contactId provided",
            });
            skippedCount++;
            return;
          }

          const contact = contactsMap[update.contactId];
          if (!contact) {
            //console.log(`❌ Contact not found: ${update.contactId}`);
            bulkLogs.push({
              bulkActionId: actionId,
              accountId,
              contactId: update.contactId,
              status: "FAILED",
              previousValues: null,
              errorMessage: "Contact not found",
            });
            failureCount++;
            return;
          }

          try {
            await Contact.update(update.updates, { where: { id: update.contactId } });

            bulkLogs.push({
              bulkActionId: actionId,
              accountId,
              contactId: update.contactId,
              status: "SUCCESS",
              previousValues: contact.toJSON(),
              errorMessage: null,
            });

            successCount++;
           // console.log(`✅ Successfully updated contact: ${update.contactId}`);
          } catch (error) {
            bulkLogs.push({
              bulkActionId: actionId,
              accountId,
              contactId: update.contactId,
              status: "FAILED",
              previousValues: contact.toJSON(),
              errorMessage: error.message,
            });

            failureCount++;
            //console.error(`❌ Error updating contact ${update.contactId}:`, error.message);
          }
        })
      );

      if (bulkLogs.length > 0) {
        await BulkActionLog.insertMany(bulkLogs);
      }

      console.log(`\n📊 Batch ${batchIndex + 1} Complete:`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${failureCount}`);
      console.log(`   ⏩ Skipped: ${skippedCount}`);
      totalFailureCount+=failureCount;
      totalSuccessCount+=successCount;
      totalSkippedCount+=skippedCount;
      await BulkAction.updateOne(
        { actionId },
        {
          $inc: {
            successCount: successCount,
            failureCount: failureCount,
            skippedCount: skippedCount,
          },
        }
      );
    }

    const finalStatus = totalFailureCount > 0 || totalSkippedCount > 0 ? "PARTIALLY_UPDATED" : "COMPLETED";
    await BulkAction.updateOne({ actionId }, { status: finalStatus });

    console.log(`\n🏁 Bulk Action ${actionId} Complete`);
    console.log(`📊 Final Statistics:`);
    console.log(`   ✅ Total Successful: ${totalSuccessCount}`);
    console.log(`   ❌ Total Failed: ${totalFailureCount}`);
    console.log(`   ⏩ Total Skipped: ${totalSkippedCount}`);
    console.log(`   📋 Final Status: ${finalStatus}`);
  } catch (error) {
    console.error(`\n❌ Fatal Error in bulk action ${actionId}:`, error);
    await BulkAction.updateOne({ actionId }, { status: "FAILED" });
    throw error;
  }
});

bulkQueue.on("completed", async (job) => {
  console.log(`\n✅ Job ${job.id} completed successfully`);
});

bulkQueue.on("failed", async (job, err) => {
  console.error(`\n❌ Job ${job.id} failed:`, err.message);
  try {
    const { actionId } = job.data;
    await BulkAction.updateOne({ actionId }, { status: "FAILED" });
  } catch (error) {
    console.error("❌ Error updating BulkAction status on failure:", error);
  }
});
