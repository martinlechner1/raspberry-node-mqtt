#include <ESP8266WiFi.h>
#include <PubSubClient.h>
// Install Adafruit DHT library
#include "DHT.h"
#include <ArduinoJson.h>

const char *SSID = "wifi ssid";
const char *PSK = "wifi pass";
const char *MQTT_BROKER = "mqttip";
const char *SENSOR_ID = "sensor_1";

#define DHTPIN 4
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

// MQTT
WiFiClient espClient;
PubSubClient client(espClient);

void setup()
{
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(MQTT_BROKER, 1883);
}

void setup_wifi()
{
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(SSID);

  WiFi.begin(SSID, PSK);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void ensureWifiConnection()
{
  int wifi_retry = 0;
  while (WiFi.status() != WL_CONNECTED && wifi_retry < 5)
  {
    wifi_retry++;
    Serial.println("WiFi not connected. Try to reconnect");
    WiFi.disconnect();
    WiFi.mode(WIFI_OFF);
    WiFi.mode(WIFI_STA);
    WiFi.begin(SSID, PSK);
    delay(100);
  }
  if (wifi_retry >= 5)
  {
    Serial.println("\nReboot");
    ESP.restart();
  }
}

void reconnect()
{
  while (!client.connected())
  {
    Serial.print("Connecting MQTT...");
    if (!client.connect(SENSOR_ID))
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}
void loop()
{
  const int capacity = JSON_OBJECT_SIZE(2) + JSON_OBJECT_SIZE(4);
  StaticJsonDocument<capacity> doc;
  doc["sid"] = SENSOR_ID;

  JsonObject data = doc.createNestedObject("data");
  data["temp"] = dht.readTemperature();
  data["pressure"] = -1;
  data["humidity"] = dht.readHumidity();

  char buffer[512];
  size_t n = serializeJson(doc, buffer);

  float hic = dht.computeHeatIndex(data["temp"], data["humidity"], false);

  ensureWifiConnection();

  if (!client.connected())
  {
    reconnect();
  }
  client.loop();
  client.publish("sensor", buffer, n);
  Serial.println(buffer);
  delay(5000);
}