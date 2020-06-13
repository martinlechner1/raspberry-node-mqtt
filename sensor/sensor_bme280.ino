/* In arduino IDE use esp32 Dev Module as board 
   Install Libraries used here via Arduino IDE
*/

#include <WiFi.h>
#include <esp_wifi.h>
#include <esp_bt.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>
#include "driver/adc.h"

const char* SSID = "yourssid";
const char* PSK = "yourpw";
const char* MQTT_BROKER = "mqttIp";
const char* SENSOR_ID = "sensor_2";

#define uS_TO_S_FACTOR 1000000  //Conversion factor for micro seconds to seconds
#define TIME_TO_SLEEP  600       //Time ESP32 will go to sleep (in seconds)
#define I2C_ADDRESS (0x76))
#define WIFI_TIMEOUT 10000
#define MQTT_TIMEOUT 10000


// Temperature Sensor
Adafruit_BME280 bme;

// MQTT
WiFiClient espClient;
PubSubClient client(espClient);
 

void setup(){
  Serial.begin(115200);
//  adc_power_on();
  connect_wifi();
  takeMeasurement();
  sendToMQTT();
  goToDeepSleep();  
}

void loop(){}

void takeMeasurement() {
   if (!bme.begin(I2C_ADDRESS) {   
     Serial.println("SENSOR NOT CONNECTED");
     goToDeepSleep();
   }
   bme.setSampling(Adafruit_BME280::MODE_FORCED,
                Adafruit_BME280::SAMPLING_X1, // temperature
                Adafruit_BME280::SAMPLING_X1, // pressure
                Adafruit_BME280::SAMPLING_X1, // humidity
                Adafruit_BME280::FILTER_OFF   );
    bme.takeForcedMeasurement();
}

void sendToMQTT() {
    const int capacity = JSON_OBJECT_SIZE(2) + JSON_OBJECT_SIZE(4);
    StaticJsonDocument<capacity> doc;
    doc["sid"] = SENSOR_ID;

    JsonObject data = doc.createNestedObject("data");
    data["temp"] = bme.readTemperature();
    data["pressure"] = bme.readPressure() / 100.0;
    data["humidity"] = bme.readHumidity();

    char buffer[512];
    size_t n = serializeJson(doc, buffer);
    connectMQTT();
    client.loop();
    client.publish("sensor", buffer, n);
}

void goToDeepSleep() {
  esp_sleep_pd_config(ESP_PD_DOMAIN_MAX, ESP_PD_OPTION_OFF);
  esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_PERIPH, ESP_PD_OPTION_OFF);
  esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_SLOW_MEM, ESP_PD_OPTION_OFF);
  esp_sleep_pd_config(ESP_PD_DOMAIN_RTC_FAST_MEM, ESP_PD_OPTION_OFF);  

  bme.setSampling(Adafruit_BME280::MODE_SLEEP,
                  Adafruit_BME280::SAMPLING_X1, // temperature
                  Adafruit_BME280::SAMPLING_X1, // pressure
                  Adafruit_BME280::SAMPLING_X1, // humidity
                  Adafruit_BME280::FILTER_OFF   );
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  // Stop wifi
  esp_wifi_stop();
  adc_power_off();
  esp_bt_controller_disable();
  
  //Deep Sleep
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  Serial.println("Setup ESP32 to sleep for every " + String(TIME_TO_SLEEP) +
  " Seconds");
  //Go to sleep now
  esp_deep_sleep_start();
}

void connectMQTT() {
    client.setServer(MQTT_BROKER, 1883);
    unsigned long startAttemptTime = millis();
    
    while (!client.connected() && millis() - startAttemptTime < MQTT_TIMEOUT) {
        Serial.print("Connecting MQTT...");
        if (!client.connect(SENSOR_ID)) {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" retrying in 5 seconds");
            delay(5000);
        }
    }

    if (!client.connected()) {
      Serial.println("MQTT failed");
      goToDeepSleep();
    }
}

void connect_wifi() {
    delay(10);
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(SSID);
    WiFi.mode(WIFI_STA);
    WiFi.begin(SSID, PSK);

    unsigned long startAttemptTime = millis();
 
    while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < WIFI_TIMEOUT) {
        delay(100);
    }

    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WIFI FAILED");
      goToDeepSleep();
    }
}