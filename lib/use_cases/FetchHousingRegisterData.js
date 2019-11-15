class FetchHousingRegisterData {
  constructor(options) {
    this.uhtGateway = new options.uhtGateway();
  }

  async execute(biddingNumber) {
    let output = {};
    output.listState = await this.uhtGateway.fetchCurrentListState();
    output.newMembers = await this.uhtGateway.fetchNewMemberData();
    output.newProperties = await this.uhtGateway.fetchNewPropertyData();


    if (biddingNumber) {
      output.customerData = await this.uhtGateway.fetchCustomerData(biddingNumber);
    }
    return output;
  }
}

module.exports = FetchHousingRegisterData;
