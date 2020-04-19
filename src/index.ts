import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as cors from '@koa/cors';
import * as mqtt from 'mqtt';

const app = new Koa();
app.use(cors());
const router = new Router();
const mqttHost = process.env.MQTT_HOST || 'pinas';
const client = mqtt.connect(`mqtt://${mqttHost}`);

const PORT = 3000;
const HOST = '0.0.0.0';

const roundToTwoDecimals = (x: number) => {
  return Math.round(x * 100) / 100;
};

const timestampDiffInSeconds = (x: number) =>
  Math.round((Date.now() - x) / 1000);

interface ISensorData {
  temp: number;
  pressure: number;
  humidity: number;
  timestamp: number;
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
  console.log(`New message: ${message.toString()}`);
  const { sid, data } = JSON.parse(message.toString());
  data.timestamp = Date.now();
  state[sid] = data;
});

const sensorMeta: { [sid: string]: string } = {
  sensor_1: 'Wohnzimmer',
  sensor_2: 'Schlafzimmer',
  sensor_3: 'Keller',
};

const buildSensorHtml = (sid: string, data: ISensorData) => {
  return `
    <div>
    <h1>${sensorMeta[sid]}</h1>
    <p>Temperatur: ${roundToTwoDecimals(data.temp)} °C</p>
    <p>Pressure: ${roundToTwoDecimals(data.pressure)} hPa</p>
    <p>Humidity: ${roundToTwoDecimals(data.humidity)} %</p>
    <p>Last datapoint: ${timestampDiffInSeconds(data.timestamp)} seconds ago</p>
    </div>
  `;
};

router.get('/api/data', async ctx => {
  ctx.body = state;
});

router.get('/*', async ctx => {
  const fiveMinutes = 5 * 60 * 1000;
  const sensorHtml = Object.entries(state)
    .filter(([k, v]) => Date.now() - v.timestamp < fiveMinutes)
    .map(([k, v]) => buildSensorHtml(k, v))
    .join('');

  ctx.body = `<html><body>${sensorHtml}</body></html>`;
});

app.use(router.routes());

app.listen(PORT, HOST);

console.log(`Running on http://${HOST}:${PORT}`);
