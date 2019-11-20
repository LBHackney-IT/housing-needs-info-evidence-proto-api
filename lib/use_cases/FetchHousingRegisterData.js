class FetchHousingRegisterData {
  constructor(options) {
    this.uhtGateway = options.uhtGateway;
  }

  async execute({ biddingNumber }) {
    if (!(await this.uhtGateway.connect())) {
      return {
        error: 'Error connecting to db.'
      };
    }

    let output = {};
    let queries = [
      this.uhtGateway.fetchCurrentListState(),
      this.uhtGateway.fetchNewMemberData(),
      this.uhtGateway.fetchNewPropertyData()
    ];
    if (biddingNumber) {
      queries.push(this.uhtGateway.fetchCustomerData(biddingNumber));
    }
    const results = await Promise.all(queries);

    output.listState = results[0];
    output.newMembers = results[1];
    output.newProperties = results[2];

    if (biddingNumber) {
      output.customerData = results[3];
    }

    return output;
  }
}

module.exports = FetchHousingRegisterData;
