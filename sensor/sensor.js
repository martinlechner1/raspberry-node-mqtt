var wifi = require('Wifi');
wifi.setHostname('iot1');
wifi.connect('<yourwifi>', { password: '<yourwifipw>' });
wifi.save();

// Non tinyMQTT is too big for sensor rom
var tinyMqtt = require('https://github.com/olliephillips/tinyMQTT/blob/master/tinyMQTT.min.js');
var bme;
var mqtt;

function mqttConnect() {
  var options = {
    keep_alive: 270,
    port: 1883,
  };

  mqtt = tinyMqtt.create('<raspberryip>', options);

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
    setTimeout(function() {
      mqtt.connect();
    }, 1000);
  });
  mqtt.connect();
}

function mqttSend() {
  mqtt.publish('sensor', JSON.stringify(bme.getData()));
}

function onInit() {
  var mqttPublishInterval = 30 * 1000;
  I2C1.setup({ scl: NodeMCU.D4, sda: NodeMCU.D5 });
  bme = require('BME280').connect(I2C1);
  mqttConnect();

  setInterval(function() {
    // We want a mqtt connection!
    if (!mqtt) {
      mqttConnect();
      return;
    }
    mqttSend();
  }, mqttPublishInterval);
}

save();
