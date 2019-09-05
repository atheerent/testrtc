'use strict';

addTest(testSuiteName.BANDWIDTH, testCaseName.DOWNLINKTEST, function(test) {
  var imagesLive = [
    {url: 'https://s3.us-east-2.amazonaws.com/atheer-storage-live/speedtest/10mb.jpg', fileSize: 10485760},
    {url: 'https://s3.us-east-2.amazonaws.com/atheer-storage-live/speedtest/15mb.jpg', fileSize: 15728640},
    {url: 'https://s3.us-east-2.amazonaws.com/atheer-storage-live/speedtest/25mb.jpg', fileSize: 17825792},
    {url: 'https://s3.us-east-2.amazonaws.com/atheer-storage-live/speedtest/50mb.jpg', fileSize: 40894464}
  ];
  var imagesEU = [
    {url: 'https://s3.eu-central-1.amazonaws.com/atheer-owncloud-eu-aws/speedtest/10mb.jpg', fileSize: 10485760},
    {url: 'https://s3.eu-central-1.amazonaws.com/atheer-owncloud-eu-aws/speedtest/15mb.jpg', fileSize: 15728640},
    {url: 'https://s3.eu-central-1.amazonaws.com/atheer-owncloud-eu-aws/speedtest/25mb.jpg', fileSize: 17825792},
    {url: 'https://s3.eu-central-1.amazonaws.com/atheer-owncloud-eu-aws/speedtest/50mb.jpg', fileSize: 40894464}
  ];
  var imagesLiveSmall = [
    {url: 'https://s3.us-east-2.amazonaws.com/atheer-storage-live/speedtest/500kb.jpg', fileSize: 524288},
    {url: 'https://s3.us-east-2.amazonaws.com/atheer-storage-live/speedtest/1mb.jpg', fileSize: 1048576},
    {url: 'https://s3.us-east-2.amazonaws.com/atheer-storage-live/speedtest/2mb.jpg', fileSize: 2097152},
    {url: 'https://s3.us-east-2.amazonaws.com/atheer-storage-live/speedtest/2mb.jpg', fileSize: 2097152}
  ];
  var imagesEUSmall = [
    {url: 'https://s3.eu-central-1.amazonaws.com/atheer-owncloud-eu-aws/speedtest/500kb.jpg', fileSize: 524288},
    {url: 'https://s3.eu-central-1.amazonaws.com/atheer-owncloud-eu-aws/speedtest/1mb.jpg', fileSize: 1048576},
    {url: 'https://s3.eu-central-1.amazonaws.com/atheer-owncloud-eu-aws/speedtest/2mb.jpg', fileSize: 2097152},
    {url: 'https://s3.eu-central-1.amazonaws.com/atheer-owncloud-eu-aws/speedtest/2mb.jpg', fileSize: 2097152}
  ];
  var downlinkTest;
  if (env === 'eu') {
    downlinkTest = new DownlinkTest(test, imagesEU, imagesEUSmall);
    downlinkTest.run();
  } else {
    downlinkTest = new DownlinkTest(test, imagesLive, imagesLiveSmall);
    downlinkTest.run();
  }
});

addTest(testSuiteName.BANDWIDTH, testCaseName.UPLINKTEST, function(test) {
  var urlLive = 'https://meet.airsuite-live.atheerair.com';
  var urlEU = 'https://meet.airsuite-next.atheerair.com';
  var uplinkTest;
  if (env === 'eu') {
    uplinkTest = new UplinkTest(test, urlEU, 20);
  } else {
    uplinkTest = new UplinkTest(test, urlLive, 20);
  }
  uplinkTest.run();
});

function DownlinkTest(test, images, imagesSmall) {
  this.test = test;
  this.sum = 0;
  this.success = 0;
  this.imageAddr = [];
  this.imagesSmall = [];
  this.downloadSize = [];
  this.downloadSizeSmall = [];
  for (var i = 0; i < images.length; i++) {
    this.imageAddr.push(images[i].url);
    this.downloadSize.push(images[i].fileSize);
  }
  for (var j = 0; j < images.length; j++) {
    this.imagesSmall.push(imagesSmall[j].url);
    this.downloadSizeSmall.push(imagesSmall[j].fileSize);
  }
  this.max = this.imageAddr.length;
  this.lowbandwidth = 0;
}

function UplinkTest(test, url, sizeMb) {
  this.test = test;
  this.sizeMb = sizeMb;
  this.startProcess = new Date().getTime();
  this.test.setProgress((new Date().getTime() - this.startProcess) / 100);
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnop' +
      'qrstuvwxyz0123456789~!@#$%^&*()_+`-=[]{/}/|;:,./<>?';
  this.iterations = this.sizeMb * 1024 * 1024;
  this.data = '';
  this.uploadSpeed = 0;
  this.url = url + '?cache=' + Math.floor(Math.random() * 10000);
  for (var i = 0; i < this.iterations; i++) {
    this.data += chars.charAt(Math.floor(Math.random() * chars.length));
  }
}

DownlinkTest.prototype = {
  run: function() {
    this.sum = 0;
    this.measureConnectionSpeed(this.imageAddr, this.downloadSize);
  },

  measureConnectionSpeed: function(images, downloadSize) {
    var startTime, endTime;
    var img = new Image();
    var currentTest = this;
    var timeout = 20000; // 20 seconds
    var timer;

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function killHandles() {
      this.onload = this.onerror = function() {};
      clearTimer();
      helper();
    }

    img.onload = function() {
      clearTimer();
      currentTest.success++;
      endTime = new Date().getTime();
      var duration = (endTime - startTime) / 1000;
      var downloadS = downloadSize.shift();
      var bitsLoaded = downloadS * 8;
      var speedBps = (bitsLoaded / duration).toFixed(2);
      var speedKbps = (speedBps / 1024).toFixed(2);
      var speedMbps = (speedKbps / 1024).toFixed(2);
      currentTest.sum = currentTest.sum + parseFloat(speedMbps);
      if (!images.length) {
        var bandwidth = (currentTest.sum / currentTest.success).toFixed(2);
        currentTest.test.reportSuccess('Downlink: ' + bandwidth + ' mbps');
        currentTest.test.done();
      } else {
        currentTest.measureConnectionSpeed(images, downloadSize);
      }
    };

    img.onerror = function(err, msg) {
      clearTimer();
      helper();
    };

    function helper() {
      downloadSize.shift();
      if (!images.length) {
        if (currentTest.success === 0 && currentTest.lowbandwidth === 0) {
          currentTest.lowbandwidth = 1;
          currentTest.measureConnectionSpeed(
              currentTest.imagesSmall, currentTest.downloadSizeSmall);
        } else if (currentTest.success === 0 && currentTest.lowbandwidth === 1) {
          currentTest.test.reportError('Bandwidth Very Low');
          currentTest.test.done();
        } else {
          var bandwidth = (currentTest.sum / currentTest.success).toFixed(2);
          currentTest.test.reportSuccess('Downlink: ' + bandwidth + ' mbps');
          currentTest.test.done();
        }
      } else {
        currentTest.measureConnectionSpeed(images, downloadSize);
      }
    }

    startTime = new Date().getTime();
    var cacheBuster = '?aaa=' + startTime;
    var url = images.shift();
    img.src = url + cacheBuster;
    timer = setTimeout(function(theImg) {
      currentTest.test.setProgress((new Date().getTime() - startTime) / 100);
      return function() {
        killHandles.call(theImg);
      };
    }(img), timeout);
  }
};

UplinkTest.prototype = {
  run: function() {
    this.checkUploadSpeed();
  },

  checkUploadSpeed: function() {
    var currentTest = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(event) {
      if (xhr.readyState === 4) {
        var duration = (new Date().getTime() - currentTest.startUploadTime) / 1000;
        var speed = (currentTest.iterations * 8 / 1024 / 1024 / duration).toFixed(2);
        currentTest.test.reportSuccess('Uplink: ' + speed + ' mbps');
        currentTest.test.done();
      }
    };
    xhr.open('POST', currentTest.url, true);
    currentTest.startUploadTime = new Date().getTime();
    xhr.send(currentTest.data);
  }
};

