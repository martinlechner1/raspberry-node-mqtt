# Espruino Weather Network
This is part of a small hobby iot project where BME-280 sensors are distributed in the house. The Node app is just the mvp for me, which is not storing data and showing the current value of my single sensor in the most easy way. In later commits I plan to support storing the data and also supporting multiple sensors.

## Hardware
* BME-280 breakout board
* ESP8266 NodeMCU Lua with esp-12e and cp2102
* Raspberry Pi 3

## Setup
### Raspberry Pi
* Install Mosquitto 
  * `sudo apt-get install -y mosquitto mosquitto-clients`
* Install Node 
  * `curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -`
  * `sudo apt install nodejs`

#### Deploying to pi
* clone repo
* build
* Follow [this guide](https://blog.cloudboost.io/how-to-run-a-nodejs-web-server-on-a-raspberry-pi-for-development-3ef9ac0fc02c) to run the app on autostart.

### ESP8266 NodeMCU Lua
Follow [this guide](http://tech.sparkfabrik.com/2017/03/01/espruino-nodemcu-step-by-step/).
Use `Espruino WebIDE` to deliver the js code to the board.