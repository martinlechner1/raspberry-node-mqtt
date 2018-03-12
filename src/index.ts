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

interface mqttMessage {
  sid: string;
  data: ISensorData;
}

const state: { [sid: string]: ISensorData } = {};

client.on('connect', () => {
  client.subscribe('sensor');
});

client.on('message', (topic, message) => {
  const { sid, data } = JSON.parse(message.toString());
  state[sid] = data;
});

const buildSensorHtml = (sid: string, data: ISensorData) => {
  return `
    <div>
    <h1>${sid}</h1>
    <p>Temperatur: ${roundToTwoDecimals(data.temp)} °C</p>
    <p>Pressure: ${roundToTwoDecimals(data.pressure)} hPa</p>
    <p>Humidity: ${roundToTwoDecimals(data.humidity)} %</p>
    </div>
  `;
};

router.get('/*', async ctx => {
  const sensorHtml = Object.entries(state)
    .map(([k, v]) => buildSensorHtml(k, v))
    .join('');

  ctx.body = `<html><body>${sensorHtml}</body></html>`;
});

app.use(router.routes());

app.listen(3000);
