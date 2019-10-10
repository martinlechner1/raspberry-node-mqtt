/**
* Use this instead of the js version. It's more reliable in case of disconnects
*
*/

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>
 
const char* SSID = "ssid";
const char* PSK = "wifi key";
const char* MQTT_BROKER = "mqtt ip";

// Temperature Sensor
Adafruit_BME280 bme;
int bmeDetected = 0;
#define I2C_ADDRESS (0x76))

// MQTT
WiFiClient espClient;
PubSubClient client(espClient);
 
void setup() {
    Serial.begin(115200);
    setup_wifi();
    client.setServer(MQTT_BROKER, 1883);
    if (!bme.begin(I2C_ADDRESS) {   
      Serial.println("SENSOR NOT CONNECTED");
      while (1);
    }
}
 
void setup_wifi() {
    delay(10);
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(SSID);
 
    WiFi.begin(SSID, PSK);
 
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
 
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

void ensureWifiConnection() {
  int wifi_retry = 0;
  while(WiFi.status() != WL_CONNECTED && wifi_retry < 5 ) {
      wifi_retry++;
      Serial.println("WiFi not connected. Try to reconnect");
      WiFi.disconnect();
      WiFi.mode(WIFI_OFF);
      WiFi.mode(WIFI_STA);
      WiFi.begin(SSID, PSK);
      delay(100);
  }
  if(wifi_retry >= 5) {
      Serial.println("\nReboot");
      ESP.restart();
  }
}
 
void reconnect() {
    while (!client.connected()) {
        Serial.print("Reconnecting...");
        if (!client.connect("ESP8266Client")) {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" retrying in 5 seconds");
            delay(5000);
        }
    }
}
void loop() {
    bme.takeForcedMeasurement();
    
    const int capacity = JSON_OBJECT_SIZE(2) + JSON_OBJECT_SIZE(4);
    StaticJsonDocument<capacity> doc;
    doc["sid"] = "sensor_1";

    JsonObject data = doc.createNestedObject("data");
    data["temp"] = bme.readTemperature();
    data["pressure"] = bme.readPressure() / 100.0;
    data["humidity"] = bme.readHumidity();

    char buffer[512];
    size_t n = serializeJson(doc, buffer);
    
    ensureWifiConnection();
    
    if (!client.connected()) {
        reconnect();
    }
    client.loop();
    client.publish("sensor", buffer, n);
    delay(5000);
}
