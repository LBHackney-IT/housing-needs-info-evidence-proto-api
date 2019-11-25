const sql = require('mssql');

class UHTGateway {
  async _sqlClient() {
    if (!this.pool) {
      this.pool = new sql.ConnectionPool({
        user: process.env.UHT_user,
        password: process.env.UHT_password,
        server: process.env.UHT_server,
        database: process.env.UHT_database
      });

      this.pool.on('error', err => {
        this._error(err);
      });
    }

    return await this.pool;
  }

  async connect() {
    let client = await this._sqlClient();
    let lastError;

    for (const _ of [1, 2, 3]) {
      try {
        await client.connect();
        return true;
      } catch (err) {
        if (err.code === 'EALREADYCONNECTED') {
          return true;
        }
        lastError = err;
        this.pool = null;
        client = await this._sqlClient();
      }
    }

    this._error(lastError);
    return false;
  }

  _error(err) {
    console.log(err);
  }

  static groupList(list) {
    return list.reduce((acc, res) => {
      if (!acc[res.band]) acc[res.band] = {};
      acc[res.band][res.bedrooms] = res.count;
      return acc;
    }, {});
  }

  async fetchCurrentListState() {
    try {
      let client = await this._sqlClient();
      let request = client.request();
      const result = await request.query(
        global.sqlQueries.fetchCurrentListState
      );
      return UHTGateway.groupList(result.recordset);
    } catch (err) {
      this._error(err);
      return null;
    }
  }

  async fetchNewMemberData() {
    try {
      let client = await this._sqlClient();
      let request = client.request();
      const result = await request.query(global.sqlQueries.fetchNewMemberData);
      return UHTGateway.groupList(result.recordset);
    } catch (err) {
      this._error(err);
      return null;
    }
  }

  async fetchNewPropertyData() {
    try {
      let client = await this._sqlClient();
      let request = client.request();
      const result = await request.query(
        global.sqlQueries.fetchNewPropertyData
      );

      return result.recordset.reduce((acc, res) => {
        acc[res.bedrooms] = res.count;
        return acc;
      }, {});
    } catch (err) {
      this._error(err);
      return null;
    }
  }

  async fetchCustomer(biddingNumber) {
    try {
      let client = await this._sqlClient();
      let request = client.request();
      request.input('biddingNumber', sql.Int, biddingNumber);
      let customer = await request.query(global.sqlQueries.fetchCustomer);
      return customer.recordset[0];
    } catch (err) {
      this._error(err);
      return null;
    }
  }

  async fetchCustomerData(biddingNumber) {
    try {
      let client = await this._sqlClient();
      let request = client.request();
      let customer = await this.fetchCustomer(biddingNumber);

      if (!customer) {
        return null;
      }

      let output = {
        band: customer.app_band,
        bedrooms: parseInt(customer.bedrooms.trim())
      };

      request.input('bandDate', sql.DateTime, customer.u_eff_band_date);
      request.input('appBand', sql.NVarChar, customer.app_band);
      request.input('bedrooms', sql.NVarChar, customer.bedrooms);

      const result = await request.query(global.sqlQueries.fetchCustomerData);
      output.position = result.recordset[0].position;
      return output;
    } catch (err) {
      this._error(err);
      return null;
    }
  }
}

module.exports = UHTGateway;
