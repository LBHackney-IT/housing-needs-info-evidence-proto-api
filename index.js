function doSomething(callback) {
  callback('response');
}

exports.handler = (event, context, callback) => {
  doSomething(callback);
};
