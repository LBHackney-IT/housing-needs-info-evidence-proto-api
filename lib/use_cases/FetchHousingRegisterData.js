class FetchHousingRegisterData {
  constructor(options) {
    this.uhtGateway = options.uhtGateway;
  }

  async execute({ biddingNumber }) {
    await this.uhtGateway.connect();

    let output = {};
    output.listState = await this.uhtGateway.fetchCurrentListState();
    output.newMembers = await this.uhtGateway.fetchNewMemberData();
    output.newProperties = await this.uhtGateway.fetchNewPropertyData();

    if (biddingNumber) {
      output.customerData = await this.uhtGateway.fetchCustomerData(
        biddingNumber
      );
    }

    await this.uhtGateway.disconnect();

    return output;
  }
}

module.exports = FetchHousingRegisterData;
