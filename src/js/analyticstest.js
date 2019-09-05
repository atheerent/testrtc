'use strict';

addTest(testSuiteName.CONNECTION, testCaseName.ANALYTICSTEST, function(test) {
  var analyticsTest = new AnalyticsTest(test);
  analyticsTest.run();
});

function AnalyticsTest(test) {
  this.test = test;
}

AnalyticsTest.prototype = {
  run: function() {
    fetch(connectionURLName.ANALYTICS, {mode: 'no-cors'})
        .then(function(resp) {
          return resp.text();
        }.bind(this))
        .then(function(data) {
          this.test.reportSuccess('Analytics connection succeeded');
          this.test.done();
        }.bind(this))
        .catch(function(error) {
          this.test.reportError('Could not connect to '
            + connectionURLName.ANALYTICSERRORURL);
          this.test.done();
        }.bind(this));
  },
};