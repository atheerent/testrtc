'use strict';

addTest(testSuiteName.CONNECTION, testCaseName.APITEST, function(test) {
  var apiTest = new ApiTest(test);
  apiTest.run();
});

function ApiTest(test) {
  this.test = test;
}

ApiTest.prototype = {
  run: function() {
    fetch(connectionURLName.API, {mode: 'no-cors'})
        .then(function(resp) {
          return resp.text();
        }.bind(this))
        .then(function(data) {
          this.test.reportSuccess('API connection succeeded');
          this.test.done();
        }.bind(this))
        .catch(function(error) {
          this.test.reportError('Could not connect to '
            + connectionURLName.APIERRORURL);
          this.test.done();
        }.bind(this));
  },
};
