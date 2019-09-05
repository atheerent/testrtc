'use strict';

addTest(testSuiteName.CONNECTION, testCaseName.JABBERTEST, function(test) {
  var jabberTest = new JabberTest(test);
  jabberTest.run();
});

function JabberTest(test) {
  this.test = test;
}

JabberTest.prototype = {
  run: function() {
    fetch(connectionURLName.JABBER, {mode: 'no-cors'})
        .then(function(resp) {
          return resp.text();
        }.bind(this))
        .then(function(data) {
          this.test.reportSuccess('XMPP connection succeeded');
          this.test.done();
        }.bind(this))
        .catch(function(error) {
          this.test.reportError('Could not connect to ' +
              connectionURLName.JABBERERRORURL);
          this.test.done();
        }.bind(this));
  },
};
