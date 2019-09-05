function ConnectionURLName() {
  var server = null;
  if (env !== 'eu') {
    server = 'live';
  }
  if (env === 'eu') {
    server = 'next';
  }
  this.URLs = {
    ANALYTICS: 'https://analytics.airsuite-live.atheerair.com',
    API: 'https://api.airsuite-' + server + '.atheerair.com/api/help/version',
    JABBER: 'https://jabber.airsuite-' + server + '.atheerair.com/http-bind',
    VIDEODOMAIN: 'https://meet.airsuite-' + server + '.atheerair.com',
    VIDEOIP: 'https://52.37.226.111',
    STORAGE: 'https://fileserver.airsuite-' + server + '.atheerair.com/index.php/s/0XBWwEJcc6ENbae/download',
    WEBSOCKETCONNECTION: 'wss://ws.airsuite-' + server + '.atheerair.com/ws',
    WEBSOCKET: 'https://ws.airsuite-' + server + '.atheerair.com/webrtc',
    ANALYTICSERRORURL: 'analytics.airsuite-live.atheerair.com:443 tcp',
    APIERRORURL: 'api.airsuite-' + server + '.atheerair.com:443 tcp',
    STORAGEERRORURL: 'fileserver.airsuite-' + server + '.atheerair.com:443 tcp',
    WEBSOCKETERRORURL: 'ws.airsuite-' + server + '.atheerair.com:443 tcp',
    JABBERERRORURL: 'jabber.airsuite-' + server + '.atheerair.com:443 tcp',
    VIDEODOMAINERRORURL: 'meet.airsuite-' + server + '.atheerair.com:443 tcp',
    TURN_CONFIG_URL_LIVE: 'https://airsuite.atheerair.com/webrtc/json/turn.json',
    TURN_CONFIG_URL_EU: 'https://airsuite-next.atheerair.com/webrtc/json/turn.json'
  };
  return this.URLs;
}

var connectionURLName = new ConnectionURLName();