// models/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'EnergyManagement',
  password: 'XXXXXX'
});

module.exports = pool.promise();

