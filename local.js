require('dotenv').config();
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

app.get('/housing_register', async (req, res) => {
  let params = {};
  if (req.query.biddingNumber) {
    params.biddingNumber = req.query.biddingNumber;
  }
  res.send(await FetchHousingRegisterDataUseCase.execute(params));
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
