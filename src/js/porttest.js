/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

addTest(testSuiteName.CONNECTION, testCaseName.PORTTEST, function(test) {
  var portTest = new PortTest(test, 'https://meet.airsuite-live.atheerair.com');
  portTest.run();
});

function PortTest(test, url) {
  this.test = test;
  this.url = url;
}

PortTest.prototype = {
  run: function() {
    fetch(this.url)
        .then(function(resp) {
          return resp.text();
        }.bind(this))
        .then(function(data) {
          this.test.reportSuccess('Got Data' + data);
          this.test.done();
        }.bind(this))
        .catch(function(error) {
          this.test.reportError(error);
          this.test.done();
        }.bind(this));
  },
};

function DownloadTest(test, url) {
  this.test = test;
  this.url = url;
}

DownloadTest.prototype = {
  run: function() {
    fetch(this.url)
        .then(function(resp) {
          return resp.text();
        }.bind(this))
        .then(function(data) {
          this.test.done();
        }.bind(this))
        .catch(function(error) {
          this.test.reportError(error);
          this.test.done();
        }.bind(this));
    setTimeoutWithProgressBar(this.endCall_.bind(), 8000);
  },

  endCall_: function() {
    this.isShuttingDown = true;
  },
};