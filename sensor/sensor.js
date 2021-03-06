var wifi = require('Wifi');

function wifiConnect() {
  wifi.setHostname('iot1');
  wifi.connect('<yourwifi>', { password: '<yourwifipw>' });
  wifi.save();
}

wifiConnect();

// Non tinyMQTT is too big for sensor rom
var tinyMqtt = require('https://github.com/olliephillips/tinyMQTT/blob/master/tinyMQTT.min.js');
var bme;
var mqtt;
var sensorId = '<yoursid>';
var mqttIp = '<raspberryip>';

function mqttConnect() {
  var options = {
    keep_alive: 270,
    port: 1883,
  };

  mqtt = tinyMqtt.create(mqttIp, options);

  // DEBUG
  mqtt.on('connected', function() {
    console.log('MQTT connected');
  });

  // DEBUG
  mqtt.on('published', function() {
    console.log('message sent');
  });

  mqtt.on('disconnected', function() {
    console.log('MQTT disconnected... reconnecting.');
    mqtt.connect();
  });
  mqtt.connect();
}

function mqttSend() {
  var message = JSON.stringify({
    data: bme.getData(),
    sid: sensorId,
  });
  mqtt.publish('sensor', message);
}

function onInit() {
  var mqttPublishInterval = 30 * 1000;
  I2C1.setup({ scl: NodeMCU.D4, sda: NodeMCU.D5 });
  bme = require('BME280').connect(I2C1);
  mqttConnect();

  setInterval(function() {
    var wifiStatus = wifi.getDetails().status;
    if (wifiStatus !== 'connected' && wifiStatus !== 'connecting') {
      wifiConnect();
    }

    // We want a mqtt connection!
    if (!mqtt) {
      mqttConnect();
      return;
    }
    mqttSend();
  }, mqttPublishInterval);
}

save();
