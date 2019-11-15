require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000
const uhtGateway = require('./lib/gateways/UHTGateway');
const FetchHousingRegisterData = require('./lib/use_cases/FetchHousingRegisterData');

const FetchHousingRegisterDataUseCase = new FetchHousingRegisterData({uhtGateway});

app.get('/housing_register', async (req, res) => {
  let biddingNumber = req.query.biddingNumber;
  res.send(await FetchHousingRegisterDataUseCase.execute(biddingNumber));
});

app.listen(port, () => console.log(`App listening on port ${port}!`))
