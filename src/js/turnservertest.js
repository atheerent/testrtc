'use strict';

function checkTURNServer(turnConfig, timeout) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      if (promiseResolved) {
        return;
      }
      resolve(false);
      promiseResolved = true;
    }, timeout || 5000);

    var promiseResolved = false,
        MyPeerConnection = window.RTCPeerConnection
          || window.mozRTCPeerConnection
          || window.webkitRTCPeerConnection,
        pc = new MyPeerConnection({
          iceServers: [turnConfig]
        }),
        noop = function() {};
    pc.createDataChannel(''); // create a bogus data channel
    pc.createOffer(function(sdp) {
      if (sdp.sdp.indexOf('typ relay') > -1) {
        // sometimes sdp contains the ice candidates...
        promiseResolved = true;
        resolve(true);
      }
      pc.setLocalDescription(sdp, noop, noop);
    }, noop); // create offer and set local description
    pc.onicecandidate = function(ice) { // listen for candidate events
      if (promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate
        || !(ice.candidate.candidate.indexOf('typ relay') > -1)) {
        return;
      }
      promiseResolved = true;
      resolve(true);
    };
    pc.getStats(function(stats) {});
  });
}

function turntest(FetchUrl) {
  (fetch(FetchUrl)
      .then(function(resp) {
        return resp.text();
      }.bind(this))
      .then(function(data) {
        var obj = JSON.parse(data);
        return obj;
      }.bind(this))
      .then(function(obj) {
        var uris = obj.uris;
        addTest(testSuiteName.CONNECTION, testCaseName.TURNSERVERTEST,
            function(test) {
              var turnServerconnectionTest = new TurnServerConnectionTest(
                  test,
                  uris,
                  obj.username,
                  obj.password
              );
              turnServerconnectionTest.run();
            });
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      }.bind(this)));
}

if (env === 'eu') {
  turntest(connectionURLName.TURN_CONFIG_URL_EU);
} else {
  turntest(connectionURLName.TURN_CONFIG_URL_LIVE);
}


function TurnServerConnectionTest(test, urls, username, password) {
  this.test = test;
  this.urls = urls;
  this.username = username;
  this.password = password;
  this.currentTestId = 0;
  this.max = this.urls.length;
  this.failCount = 0;
}

TurnServerConnectionTest.prototype = {
  run: function() {
    this.callServer(this.urls[this.currentTestId], this.username, this.password)
        .then(function(resp) {
          return resp;
        }.bind(this))
        .then(function(bool) {
          if (!bool) {
            this.failCount++;
          }
          this.successMessage(bool, this.urls[this.currentTestId]);
          this.currentTestId++;
          if (this.currentTestId < this.max) {
            this.run();
          }
          if (this.currentTestId === this.max) {
            if (this.failCount === this.max) {
              this.test.reportError('Error: Turn Server Connection Test');
              this.test.done();
            } else if (this.failCount === 0) {
              this.test.reportSuccess('Success: Turn Server Connection Test');
              this.test.done();
            } else {
              this.test.reportWarning('Warning: Turn Server Connection Test');
              this.test.done();
            }
          }
        }.bind(this))
        .catch(function(error) {
          this.errorMessage(this.urls[this.currentTestId]);
          this.failCount++;
          this.currentTestId++;
          if (this.currentTestId < this.max) {
            this.run();
          }
          if (this.currentTestId === this.max) {
            if (this.failCount > 0 && this.failCount< this.max) {
              this.test.reportWarning('Warning: Turn Server Connection Test');
              this.test.done();
            }
            if (this.failCount === this.max) {
              this.test.reportError('Fail: Turn Server Connection Test');
              this.test.done();
            }
          }
        }.bind(this));
  },

  callServer: function(url, username, password) {
    return checkTURNServer({
      url: url,
      username: username,
      credential: password
    });
  },

  successMessage: function(bool, url) {
    var res = bool ? ' Is Active' : ' Not Active';
    this.test.reportInfo(url + res);
  },

  errorMessage: function(url) {
    this.test.reportInfo('Could not connect to ' + url);
  }
};

