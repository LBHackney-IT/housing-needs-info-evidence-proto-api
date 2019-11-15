const FetchCustomer = require('../../lib/use_cases/FetchCustomer');

describe('FetchCustomer', function() {
  it('can fetch the customer from UHT', async function() {
    const biddingNumber = '123';

    const expected = {
      biddingNumber
    };

    const uhtGatewaySpy = {
      fetchCustomer: jest.fn(biddingNumber => {
        return {
          biddingNumber: biddingNumber
        };
      })
    };

    const response = await new FetchCustomer({
      uhtGateway: uhtGatewaySpy
    }).execute({ biddingNumber });

    expect(uhtGatewaySpy.fetchCustomer.mock.calls.length).toBe(1);
    expect(response).toEqual(expected);
  });
});
