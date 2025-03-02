const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/config.json")["development"];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect
});

const db = {};

// Load all PostgreSQL models
fs.readdirSync(__dirname + "/postgresModels") // Ensure correct path
  .filter(file => file !== "index.js")
  .forEach(file => {
    const model = require(path.join(__dirname, "postgresModels", file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// ✅ Fix MongoDB Model Imports
db.BulkAction = require("./mongoModels/BulkAction");
db.BulkActionLog = require("./mongoModels/BulkActionLog");

// Export Sequelize & MongoDB models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
