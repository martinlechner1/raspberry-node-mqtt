# Espruino Weather Network
This is part of a small hobby iot project where BME-280 sensors are distributed in the house. The Node app is just the mvp for me, which is not storing data and showing the current value of my single sensor in the most easy way. In later commits I plan to support storing the data and also supporting multiple sensors.

## Hardware
* BME-280 breakout board
* ESP8266 NodeMCU Lua with esp-12e and cp2102
* Raspberry Pi 3

## Quickstart

* Run the server locally: `docker-compose up`
* Rebuild the app container: `docker-compose up -d --no-deps --build app`
* Test the server app, e.g. with MQTT fx. 
* send the following payload to localhost:1883
```
{
  "sid":"sensor_2",
  "data": {
  "temp": 187,
  "pressure": 1500,
  "humidity": 99,
  "timestamp": 123
}
}
```
* Visit localhost:3000 and see if the stats show up

## Setup
### Raspberry Pi
* Download Raspbian Strech
* Use Etcher to flash
* Re-insert sd card and add an empty file called `ssh` in sd root
* Add `wpa_supplicant.conf` to the root folder with:
```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
network={
    ssid="YOUR_NETWORK_NAME"
    psk="YOUR_PASSWORD"
    key_mgmt=WPA-PSK
}
```
* Boot the pi and `ssh pi@<ipofpi>` Default password is `raspberry`.
* Change the password `passwd`
* Install Docker https://withblue.ink/2017/12/31/yes-you-can-run-docker-on-raspbian.html
* You might need sudo for docker-compose installation
* clone project on pi
* `sudo docker-compose up`
* edit home-stats.service to match the folder to the project
* copy `home-stats.service` to `/etc/systemd/system/`
* `sudo systemctl enable home-stats`

### ESP8266 NodeMCU Lua

#### Prequisites
First we need to flash Espruino onto the `ESP-8266`. You will need and usb driver to connect to the board. Assuming you use MacOS X it's epending on the vendor of the board either [CSP2102 to UART](https://www.silabs.com/Support%20Documents/Software/Mac_OSX_VCP_Driver.zip) or [WCH](http://www.wch.cn/download/CH341SER_MAC_ZIP.html). The following commands assume the `CSP2102` version. For the other one you have to figure out the serial address. It looks like: `/dev/cu.wc...`.   

Have `python` and `pip` installed.

#### Flash Espruino
```
$ pip install esptool
```
```
$ cd espruino_1v95/espruino_1v95_esp8266_4mb
```
```
$ esptool.py --port /dev/tty.SLAB_USBtoUART --baud 115200 erase_flash
```
```
$ esptool.py --port /dev/tty.SLAB_USBtoUART --baud 115200 \
  write_flash --flash_freq 80m --flash_mode qio --flash_size 4MB-c1 \
  0x0000 "boot_v1.6.bin" 0x1000 espruino_esp8266_user1.bin \
  0x3FC000 esp_init_data_default.bin 0x3FE000 blank.bin
```
#### Upload Javascript code
Use `Espruino WebIDE` to deliver the js code to the board. Copy and paste the wifi code in `sensor/sensor.js` first and execute it. Disconnect the device from USB, reconnect and verify that the wifi connection worked. Mark the rest of the code and click the `Send to Espruino` button.

## References
* [Getting started guide](http://tech.sparkfabrik.com/2017/03/01/espruino-nodemcu-step-by-step/)
