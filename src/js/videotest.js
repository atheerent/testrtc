'use strict';
addTest(testSuiteName.CONNECTION, testCaseName.VIDEOTEST, function(test) {
  var domainTest = new VideoDomainTest(test, connectionURLName.VIDEODOMAIN);
  domainTest.run();
});

function VideoDomainTest(test, url) {
  this.test = test;
  this.url = url;
}

VideoDomainTest.prototype = {
  run: function() {
    fetch(this.url, {mode: 'no-cors'})
        .then(function(resp) {
          return resp.text();
        }.bind(this))
        .then(function(data) {
          this.test.reportSuccess('Video connection succeeded (Domain)');
          this.test.done();
        }.bind(this))
        .catch(function(error) {
          this.test.reportError(
              'Could not connect to ' + connectionURLName.VIDEODOMAINERRORURL
          );
          this.test.done();
        }.bind(this));
  },
};

