class FetchCustomer {
  constructor(options) {
    this.uhtGateway = options.uhtGateway;
  }

  async execute({ biddingNumber }) {
    return await this.uhtGateway.fetchCustomer(biddingNumber);
  }
}

module.exports = FetchCustomer;
