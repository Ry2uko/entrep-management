const Database = require('better-sqlite3');
const db = new Database('orders.db');

module.exports = db;