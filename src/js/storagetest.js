'use strict';

addTest(testSuiteName.CONNECTION, testCaseName.STORAGETEST, function(test) {
  var fileServerTest = new FileServerTest(test);
  fileServerTest.run();
});

function FileServerTest(test) {
  this.test = test;
}

FileServerTest.prototype = {
  run: function() {
    fetch(connectionURLName.STORAGE, {mode: 'no-cors'})
        .then(function(resp) {
          return resp.text();
        }.bind(this))
        .then(function(data) {
          this.test.reportSuccess('Storage Connection Succeeded');
          this.test.done();
        }.bind(this))
        .catch(function(error) {
          this.test.reportError('could not connect to '
            + connectionURLName.STORAGEERRORURL);
          this.test.done();
        }.bind(this));
  },
};