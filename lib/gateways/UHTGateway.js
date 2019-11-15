const sql = require('mssql');

class UHTGateway {
  async sqlClient() {
    if (!this.pool) {
      this.pool = new sql.ConnectionPool({
        user: process.env.UHT_user,
        password: process.env.UHT_password,
        server: process.env.UHT_server,
        database: process.env.UHT_database
      });

      this.pool.on('error', err => {
        console.log(err);
      });

      await this.pool.connect();
    }

    return this.pool;
  }

  async disconnect() {
    await this.sqlClient().end();
  }

  static groupList(list) {
    return list.reduce((acc, res) => {
      if (!acc[res.band]) acc[res.band] = {};
      acc[res.band][res.bedrooms] = res.count;
      return acc;
    }, {});
  }

  async fetchCurrentListState() {
    let client = await this.sqlClient();
    let request = client.request();
    let query = `WITH wlaneeds_cte AS (
      SELECT
        wlaneeds.app_ref,
        RTRIM(MAX(r_to)) AS bedrooms
      FROM
        wlaneeds
      WHERE
        field_ref = 'num_bedrooms'
      GROUP BY
        wlaneeds.app_ref
    )
    SELECT
      app_band as band,
      wlaneeds_cte.bedrooms as bedrooms,
      count(*) AS count
    FROM
      wlapp
      LEFT JOIN wlaneeds_cte ON wlaneeds_cte.app_ref = wlapp.app_ref
      LEFT JOIN lookup ON lookup.lu_ref = wlapp.wl_status
        AND lookup.lu_type = 'WLS'
    WHERE
      lookup.lu_desc LIKE 'Active%'
      AND wlaneeds_cte.bedrooms IS NOT NULL
    GROUP BY
      app_band,
      wlaneeds_cte.bedrooms
    ORDER BY
      app_band DESC,
      wlaneeds_cte.bedrooms`;

    const result = await request.query(query);
    return UHTGateway.groupList(result.recordset);
  }

  async fetchNewMemberData() {
    let client = await this.sqlClient();
    let request = client.request();
    let query = `WITH wlaneeds_cte AS (
      SELECT
        wlaneeds.app_ref,
        MAX(r_to) AS bedrooms
      FROM
        wlaneeds
      WHERE
        field_ref = 'num_bedrooms'
      GROUP BY
        wlaneeds.app_ref
    )
    SELECT
      app_band as band,
      wlaneeds_cte.bedrooms as bedrooms,
      COUNT(*) as count
    FROM
      wlapp
      LEFT JOIN wlaneeds_cte ON wlaneeds_cte.app_ref = wlapp.app_ref
      LEFT JOIN lookup ON lookup.lu_ref = wlapp.wl_status
        AND lookup.lu_type = 'WLS'
    WHERE
      app_date > DateAdd (yy, - 1, GetDate ())
      AND app_date < GetDate ()
      AND lookup.lu_desc LIKE 'Active%'
      AND wlaneeds_cte.bedrooms IS NOT NULL
    GROUP BY
      app_band,
      wlaneeds_cte.bedrooms
    ORDER BY
      app_band,
      bedrooms`;

    const result = await request.query(query);
    return UHTGateway.groupList(result.recordset);
  }

  async fetchNewPropertyData() {
    let client = await this.sqlClient();
    let request = client.request();
    let query = `WITH offers_cte AS (
      SELECT DISTINCT
        app_ref,
        prop_ref
      FROM
        wloffers
      WHERE
        wloffers.offer_date > DateAdd (yy,
          - 1,
          GetDate ())
        AND wloffers.offer_date < GetDate ()
        AND wloffers.response = 'ACC'
    )
    SELECT
      property.num_bedrooms AS bedrooms, COUNT(*) AS count
    FROM
      offers_cte
      JOIN property ON offers_cte.prop_ref = property.prop_ref
    GROUP BY
      property.num_bedrooms
    ORDER BY
      bedrooms DESC;`;

    const result = await request.query(query);

    return result.recordset.reduce((acc, res) => {
      acc[res.bedrooms] = res.count;
      return acc;
    }, {});
  }

  async fetchCustomer(biddingNumber) {
    let client = await this.sqlClient();
    let request = client.request();
    request.input('biddingNumber', sql.Int, biddingNumber);
    let query = `WITH wlaneeds_cte AS (
      SELECT
        wlaneeds.app_ref,
        MAX(r_to) AS bedrooms
      FROM
        wlaneeds
      WHERE
        field_ref = 'num_bedrooms'
      GROUP BY
        wlaneeds.app_ref
    )
    SELECT
      app_band,
      u_eff_band_date,
      wlaneeds_cte.bedrooms
    FROM
      wlapp
      JOIN wlaneeds_cte ON wlapp.app_ref = wlaneeds_cte.app_ref
    WHERE u_novalet_ref = @biddingNumber`;
    let customer = await request.query(query);
    return customer.recordset[0];
  }

  async fetchCustomerData(biddingNumber) {
    let client = await this.sqlClient();
    let request = client.request();
    let customer = await this.fetchCustomer(biddingNumber);
    let output = {
      band: customer.app_band,
      bedrooms: customer.bedrooms
    }

    request.input('bandDate', sql.DateTime, customer.u_eff_band_date);
    request.input('appBand', sql.NVarChar, customer.app_band);
    request.input('bedrooms', sql.NVarChar, customer.bedrooms);

    let query = `WITH wlaneeds_cte AS (
      SELECT
        wlaneeds.app_ref,
        MAX(r_to) AS bedrooms
      FROM
        wlaneeds
      WHERE
        field_ref = 'num_bedrooms'
      GROUP BY
        wlaneeds.app_ref
    )
    SELECT
        COUNT(*) as position
      FROM
        wlapp
      LEFT JOIN lookup ON lookup.lu_ref = wlapp.wl_status
        AND lookup.lu_type = 'WLS'
      LEFT JOIN wlaneeds_cte ON wlaneeds_cte.app_ref = wlapp.app_ref
      WHERE
        u_eff_band_date < @bandDate
        AND app_band = @appBand
        AND lookup.lu_desc LIKE 'Active%'
        AND wlaneeds_cte.bedrooms = @bedrooms`;

    const result = await request.query(query);
    output.position = result.recordset[0].position;
    return output;
  }
}

module.exports = UHTGateway;
