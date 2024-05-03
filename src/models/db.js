require('dotenv').config();

const connectionString = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  max: 10,
  allowExitOnIdle: true,
  idle_in_transaction_session_timeout: 1000,
  connectionTimeoutMillis: 1000,
};

const connectionStringLocal = {
  user: process.env.DB_USER,
  password: 'p@ssw0rd',
  database: process.env.DB_NAME,
  host: 'localhost',
  max: 50,
  allowExitOnIdle: true,
  idle_in_transaction_session_timeout: 1000,
  connectionTimeoutMillis: 1000,
};

class PostgresConnection {
  constructor() {
    if (!PostgresConnection.instance) {
      const {Pool} = require('pg');
      this.pool = new Pool(connectionStringLocal);
      PostgresConnection.instance = this;
    }
    return PostgresConnection.instance;
  }
}

module.exports = {PostgresConnection};
