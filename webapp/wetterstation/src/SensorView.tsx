import React from 'react';
import { Card, CardHeader, CardContent, Paper } from '@material-ui/core';

const lookup = {
  sensor_1: 'Küche',
  sensor_2: 'Keller',
  sensor_3: 'Wohnzimmer',
};

export const SensorView: React.SFC<Data> = ({
  id,
  temp,
  pressure,
  timestamp,
}) => {
  return (
    <Paper key={id}>
      <Card>
        <CardHeader title={lookup[id]}>Header</CardHeader>
        <CardContent>
          <ul>
            <li>Temperatur: {temp} C</li>
            <li>Luftdruck: {pressure} hPa</li>
            <li>Gemessen {new Date(timestamp).toLocaleString()}</li>
          </ul>
        </CardContent>
      </Card>
    </Paper>
  );
};
