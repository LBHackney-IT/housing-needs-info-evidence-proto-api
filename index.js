require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

const UHTGateway = require('./lib/gateways/UHTGateway');
const FetchHousingRegisterData = require('./lib/use_cases/FetchHousingRegisterData');

// load sql queries
require('./lib/sql').load();

const FetchHousingRegisterDataUseCase = new FetchHousingRegisterData({
  uhtGateway: new UHTGateway()
});

app.use(function(req, res, next) {
  // had to rewrite the path to get it playing nice with a not-root resource in api gateway
  req.url = req.url.replace('/hn-infoevidence', '');
  next();
});

app.get('/housing_register', async (req, res) => {
  let params = {};
  if (req.query.biddingNumber) {
    params.biddingNumber = req.query.biddingNumber;
  }
  console.log('Fetching data...');
  const response = await FetchHousingRegisterDataUseCase.execute(params);
  console.log('Finished fetching data.');
  console.log(JSON.stringify(response));
  res.send(response);
});

app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports.handler = serverless(app);
