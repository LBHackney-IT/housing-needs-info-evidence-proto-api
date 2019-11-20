const FetchHousingRegisterData = require('../../lib/use_cases/FetchHousingRegisterData');

describe('FetchHousingRegisterData', function() {
  let uhtGatewaySpy;

  beforeEach(() => {
    uhtGatewaySpy = {
      connect: jest.fn(() => {
        return true;
      }),
      fetchCurrentListState: jest.fn(() => {
        return {};
      }),
      fetchNewMemberData: jest.fn(() => {
        return {};
      }),
      fetchNewPropertyData: jest.fn(() => {
        return {};
      }),
      fetchCustomerData: jest.fn(biddingNumber => {
        if (biddingNumber === 'invalid') {
          return null;
        }
        return {};
      })
    };
  });

  it('can fetch the housing register data from UHT', async function() {
    const response = await new FetchHousingRegisterData({
      uhtGateway: uhtGatewaySpy
    }).execute({});

    expect(uhtGatewaySpy.fetchCurrentListState.mock.calls.length).toBe(1);
    expect(uhtGatewaySpy.fetchNewMemberData.mock.calls.length).toBe(1);
    expect(uhtGatewaySpy.fetchNewPropertyData.mock.calls.length).toBe(1);

    expect(response.listState).toBeDefined();
    expect(response.newMembers).toBeDefined();
    expect(response.newProperties).toBeDefined();
  });

  it('can return customer data when given a valid bidding number', async function() {
    const response = await new FetchHousingRegisterData({
      uhtGateway: uhtGatewaySpy
    }).execute({ biddingNumber: 'valid' });

    expect(uhtGatewaySpy.fetchCustomerData.mock.calls.length).toBe(1);

    expect(response.customerData).not.toBeNull();
  });

  it('can not return customer data when given a invalid bidding number', async function() {
    const response = await new FetchHousingRegisterData({
      uhtGateway: uhtGatewaySpy
    }).execute({ biddingNumber: 'invalid' });

    expect(uhtGatewaySpy.fetchCustomerData.mock.calls.length).toBe(1);

    expect(response.customerData).toBeNull();
  });
});
