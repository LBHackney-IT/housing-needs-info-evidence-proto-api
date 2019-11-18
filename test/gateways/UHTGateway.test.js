const UHTGateway = require('../../lib/gateways/UHTGateway');
const sql = require('mssql');

describe('UHTGateway', function() {
  let fakeSqlClient;

  beforeEach(() => {
    fakeSqlClient = {
      connect: jest.fn(),
      close: jest.fn(),
      request: jest.fn(() => {
        return {
          input: jest.fn(),
          query: jest.fn()
        };
      })
    };

    UHTGateway.prototype._error = () => {};
    UHTGateway.prototype._sqlClient = () => fakeSqlClient;
    global.sqlQueries = {
      fetchCustomer: 'fetchCustomer'
    };
  });

  it('can fetch the customer', async function() {
    const expected = {
      app_band: 'URG',
      bedrooms: '1                   ',
      u_eff_band_date: new Date()
    };

    const input = jest.fn();
    const query = jest.fn(() => {
      return { recordset: [expected] };
    });

    fakeSqlClient.request = jest.fn(() => {
      return {
        input,
        query
      };
    });

    const biddingNumber = '123';

    const gateway = new UHTGateway();
    const response = await gateway.fetchCustomer(biddingNumber);

    expect(input).toHaveBeenCalledWith('biddingNumber', sql.Int, biddingNumber);
    expect(query).toHaveBeenCalledWith(global.sqlQueries.fetchCustomer);

    expect(response).toEqual(expected);
  });

  it('can returns null if error fetching customer', async function() {
    const input = jest.fn();
    const query = jest.fn(() => {
      throw new Error();
    });

    fakeSqlClient.request = jest.fn(() => {
      return {
        input,
        query
      };
    });

    const gateway = new UHTGateway();
    const response = await gateway.fetchCustomer('invalid');

    expect(response).toBeNull();
  });
});
