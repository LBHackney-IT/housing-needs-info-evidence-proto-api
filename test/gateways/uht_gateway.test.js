const UHTGateway = require('../../lib/gateways/UHTGateway');

describe('UHTGateway', function() {
  const fakeSqlClient = { connect: jest.fn(), end: jest.fn() };

  beforeAll(() => {
    UHTGateway.prototype.sqlClient = () => fakeSqlClient;
  });

  it('can fetch the customer', async function() {
    const gateway = new UHTGateway();
    await gateway.fetchCustomer();

    expect(fakeSqlClient.connect).toHaveBeenCalledTimes(1);

    expect(fakeSqlClient.end).toHaveBeenCalledTimes(1);
  });
});
