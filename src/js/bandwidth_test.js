/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';

// Creates a loopback via relay candidates and tries to send as many packets
// with 1024 chars as possible while keeping dataChannel bufferedAmmount above
// zero.
var uris = null;

function bandwidthTest(turnJsonUrl, callback) {
  (fetch(turnJsonUrl)
      .then(function(resp) {
        return resp.text();
      }.bind(this))
      .then(function(data) {
        var obj = JSON.parse(data);
        return obj;
      }.bind(this))
      .then(function(obj) {
        uris = obj.uris;
        callback();
      }.bind(this))
      .catch(function(error) {
        console.log(error);
      }.bind(this)));
}

if (env === 'eu') {
  bandwidthTest(connectionURLName.TURN_CONFIG_URL_EU, runBandwidthTest);
} else {
  bandwidthTest(connectionURLName.TURN_CONFIG_URL_LIVE, runBandwidthTest);
}

function runBandwidthTest() {
  addTest(testSuiteName.THROUGHPUT, testCaseName.DATATHROUGHPUT,
      function(test) {
        var dataChannelThroughputTest =
            new DataChannelThroughputTest(test, uris);
        dataChannelThroughputTest.run();
      });
}

function DataChannelThroughputTest(test, servers) {
  this.test = test;
  this.servers = servers;
  this.max = this.servers.length;
  this.failCount = 0;
  this.warningCount = 0;
  this.testDurationSeconds = 10.0;
  this.startTime = null;
  this.sentPayloadBytes = 0;
  this.receivedPayloadBytes = 0;
  this.stopSending = false;
  this.samplePacket = '';
  this.currentServer = null;
  this.currentTestId = 0;
  this.race = true;
  this.maxNumberOfPacketsToSend = 1;
  this.bytesToKeepBuffered = 1024 * this.maxNumberOfPacketsToSend;
  this.lastBitrateMeasureTime = null;
  this.lastReceivedPayloadBytes = 0;
  this.killtimeout = null;
  this.call = null;
  this.senderChannel = null;
  this.receiveChannel = null;
  this.checkTestSucceeded = [];

  for (var i=0; i< this.max; i++) {
    this.checkTestSucceeded.push(false);
  }
}

DataChannelThroughputTest.prototype = {
  run: function() {
    this.testDurationSeconds = 10.0;
    this.startTime = null;
    this.sentPayloadBytes = 0;
    this.receivedPayloadBytes = 0;
    this.stopSending = false;
    this.samplePacket = '';
    this.maxNumberOfPacketsToSend = 1;
    this.bytesToKeepBuffered = 1024 * this.maxNumberOfPacketsToSend;
    this.lastBitrateMeasureTime = null;
    this.lastReceivedPayloadBytes = 0;
    this.killtimeout = null;
    this.call = null;
    this.senderChannel = null;
    this.receiveChannel = null;

    for (var i = 0; i !== 10000; ++i) {
      this.samplePacket += 'h';
    }

    BandwidthCall.asyncCreateTurnConfig(this.servers[this.currentTestId],
        this.start.bind(this),
        this.test.reportFatal.bind(this.test));
  },

  start: function(config, timeout) {
    this.call = new BandwidthCall(config, this.test);

    this.call.setIceCandidateFilter(BandwidthCall.isRelay);

    this.senderChannel = this.call.pc1.createDataChannel(null);

    this.senderChannel.addEventListener('open', this.sendingStep.bind(this));

    this.call.pc2.addEventListener('datachannel',
        this.onReceiverChannel.bind(this));

    this.call.establishConnection();

    this.killtimeout = setTimeout(this.OnConnectionFailed.bind(this), 15000);
  },

  onReceiverChannel: function(event) {
    this.receiveChannel = event.channel;
    this.receiveChannel.addEventListener('message',
        this.onMessageReceived.bind(this));
  },

  sendingStep: function() {
    var now = new Date();
    if (!this.startTime) {
      this.startTime = now;
      this.lastBitrateMeasureTime = now;
    }
    for (var i = 0; i !== this.maxNumberOfPacketsToSend; ++i) {
      if (this.senderChannel.bufferedAmount >= this.bytesToKeepBuffered) {
        break;
      }
      this.sentPayloadBytes += this.samplePacket.length;
      this.senderChannel.send(this.samplePacket);
    }

    if (now - this.startTime >= 1000 * this.testDurationSeconds) {
      this.test.setProgress(100);
      this.stopSending = true;
    } else {
      this.test.setProgress((now - this.startTime) /
          (10 * this.testDurationSeconds));
      setTimeout(this.sendingStep.bind(this), 1);
    }
  },

  onMessageReceived: function(event) {
    this.receivedPayloadBytes += event.data.length;
    var now = new Date();
    if (now - this.lastBitrateMeasureTime >= 1000) {
      this.lastReceivedPayloadBytes = this.receivedPayloadBytes;
      this.lastBitrateMeasureTime = now;
    }
    if (this.stopSending &&
        this.sentPayloadBytes === this.receivedPayloadBytes) {
      this.call.close();
      this.checkTestSucceeded[this.currentTestId] = true;
      var elapsedTime = Math.round((now - this.startTime) * 10) / 10000.0;
      var receivedKBits = this.receivedPayloadBytes * 8 / 1000;
      var bandwidth = receivedKBits / elapsedTime;
      var bandwidthMBPS = bandwidth / 1000;
      var result = Math.round((bandwidthMBPS + 0.00001) * 100) / 100;
      if (result < 1.5) {
        this.failCount++;
      }
      if (result > 1.5 && result < 3.0) {
        this.warningCount++;
      }
      this.test.reportInfo('Total Bandwidth: ' + result +' mbps. '
        + 'server:' + this.servers[this.currentTestId]
        + ' elapsedTime time:' + elapsedTime);
      this.currentTestId++;
      clearTimeout(this.killtimeout);
      if (this.currentTestId < this.max) {
        this.run();
      }
      if (this.currentTestId === this.max) {
        if (this.failCount === this.max) {
          this.test.reportError('Failed: Bandwidth test');
        } else if (this.failCount === 0 && this.warningCount === 0) {
          this.test.reportSuccess('Success: Bandwidth test');
        } else {
          this.test.reportWarning('Warning: Bandwidth test');
        }
        this.test.done();
      }
    }
  },

  OnConnectionFailed: function() {
    this.stopSending = true;
    this.failCount++;
    if (!this.checkTestSucceeded[this.currentTestId]) {
      this.test.reportInfo('Could not connect to: '
        + this.servers[this.currentTestId]);
    }
    this.currentTestId++;
    if (this.currentTestId < this.max) {
      this.run();
    }
    if (this.currentTestId === this.max) {
      if (this.failCount === this.max) {
        this.test.reportError('Failed: Bandwidth test');
      } else if (this.failCount === 0 && this.warningCount === 0) {
        this.test.reportSuccess('Success: Bandwidth test');
      } else {
        this.test.reportWarning('Warning: Bandwidth test');
      }
      this.test.done();
    }
  }
};