require('dotenv').config();

const connectionString = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
};

class PostgresConnection {
  constructor() {
    if (!PostgresConnection.instance) {
      const {Pool} = require('pg');
      this.pool = new Pool(connectionString);
      PostgresConnection.instance = this;
    }
    return PostgresConnection.instance;
  }
}

module.exports = {PostgresConnection};
