const Queue = require("bull");

// Queue definition only
const bulkQueue = new Queue("bulk-actions", {
  redis: { host: "localhost", port: 6380 }
});

module.exports = bulkQueue;
