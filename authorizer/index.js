require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.jwtsecret;

const allow = {
  principalId: 'user',
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: process.env.RESOURCE
      }
    ]
  }
};

function extractTokenFromHeader(e) {
  if (e.authorizationToken && e.authorizationToken.split(' ')[0] === 'Bearer') {
    return e.authorizationToken.split(' ')[1];
  } else {
    return e.authorizationToken;
  }
}

function validateToken(token, callback) {
  try {
    const payload = jwt.verify(token, jwt_secret);
    // need to add groups
    if (payload) {
      console.log(JSON.stringify(allow));
      callback(null, allow);
    } else {
      callback('Unauthorized');
    }
  } catch (err) {
    console.log(err);
    callback('Unauthorized');
  }
}

exports.handler = (event, context, callback) => {
  let token = extractTokenFromHeader(event) || '';
  validateToken(token, callback);
};
