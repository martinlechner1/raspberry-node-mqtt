import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as cors from '@koa/cors';
import * as serve from 'koa-static';
import * as mqtt from 'mqtt';

const app = new Koa();
app.use(cors());
app.use(serve('./webapp/wetterstation/build'));
const router = new Router();
const mqttHost = process.env.MQTT_HOST || 'pinas';
const client = mqtt.connect(`mqtt://${mqttHost}`);

const PORT = 3000;
const HOST = '0.0.0.0';

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

router.get('/api/data', async ctx => {
  ctx.body = state;
});

app.use(router.routes());

app.listen(PORT, HOST);

console.log(`Running on http://${HOST}:${PORT}`);
