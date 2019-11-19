require('dotenv').config();

const UHTGateway = require('./lib/gateways/UHTGateway');
const FetchHousingRegisterData = require('./lib/use_cases/FetchHousingRegisterData');

// load sql queries
require('./lib/sql').load();

const FetchHousingRegisterDataUseCase = new FetchHousingRegisterData({
  uhtGateway: new UHTGateway()
});

async function fetchData(biddingNumber, callback) {
  let params = {};
  if (biddingNumber) {
    params.biddingNumber = biddingNumber;
  }
  callback(await FetchHousingRegisterDataUseCase.execute(params));
}

exports.handler = (event, context, callback) => {
  fetchData(event, callback);
};
