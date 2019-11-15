const sql = require('mssql');

class UHTGateway {
  sqlClient() {
    if (!this.pool) {
      this.pool = new this._sqlClient().ConnectionPool({
        user: process.env.UHT_user,
        password: process.env.UHT_password,
        server: process.env.UHT_server,
        database: process.env.UHT_database
      });

      this.pool.on('error', err => {
        console.log(err);
      });
    }

    return this.pool;
  }

  async connect() {
    this.sqlClient().connect();
    await this.pool;
  }

  async disconnect() {
    this.sqlClient().end();
  }

  async fetchCustomer() {
    await this.connect();

    // do the work

    await this.disconnect();
  }
}

module.exports = UHTGateway;
