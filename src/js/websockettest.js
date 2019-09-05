'use strict';

addTest(testSuiteName.CONNECTION, testCaseName.WEBSOCKETTEST, function(test) {
  var webSocketTest = new WebSocketTest(test);
  webSocketTest.run();

  webSocketTest = new WebSocketConnectionTest(test);

  webSocketTest.onopen = function() {
    test.reportSuccess('WS connection succeeded');
    test.done();
  };

  webSocketTest.onerror = function(error) {
    test.reportError('Could not connect to' +
      connectionURLName.WEBSOCKETERRORURL + ' (1)');
    test.done();
  };
});

function WebSocketConnectionTest(test) {
  this.test = test;
  return new WebSocket(connectionURLName.WEBSOCKETCONNECTION);
}

function WebSocketTest(test) {
  this.test = test;
}

WebSocketTest.prototype = {
  run: function() {
    fetch(connectionURLName.WEBSOCKET, {mode: 'no-cors'})
        .then(function(resp) {
          return resp.text();
        }.bind(this))
        .then(function(data) {
          this.test.reportSuccess('Connection succeeded');
          this.test.done();
        }.bind(this))
        .catch(function(error) {
          this.test.reportError('Could not connect to ' +
            connectionURLName.WEBSOCKETERRORURL + ' (2)');
          this.test.done();
        }.bind(this));
  },
};
