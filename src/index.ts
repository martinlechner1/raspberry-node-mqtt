import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as mqtt from 'mqtt';

const app = new Koa();
const router = new Router();
const client = mqtt.connect('mqtt://localhost');

const roundToTwoDecimals = (x: number) => {
  return Math.round(x * 100) / 100;
};

interface ISensorData {
  temp: number;
  pressure: number;
  humidity: number;
}
let data: ISensorData = { temp: 0, pressure: 0, humidity: 0 };

client.on('connect', () => {
  client.subscribe('sensor');
});

client.on('message', (topic, message) => {
  data = JSON.parse(message.toString());
});

router.get('/*', async ctx => {
  ctx.body = `<html><body><h1>Wohnzimmer</h1>
  <p>
   Temperatur: ${roundToTwoDecimals(data.temp)} °C</p>
   <p>Pressure: ${roundToTwoDecimals(data.pressure)} hPa</p>
   <p>Humidity: ${roundToTwoDecimals(data.humidity)} %</p>
   </body></html>`;
});

app.use(router.routes());

app.listen(3000);
