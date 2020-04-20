import {
  Box,
  Card,
  CardContent,
  Divider,
  Paper,
  Typography,
} from '@material-ui/core';
import React from 'react';

const lookup = {
  sensor_1: 'Küche',
  sensor_2: 'Keller',
  sensor_3: 'Wohnzimmer',
};

export const SensorView: React.SFC<Data> = ({
  id,
  temp,
  pressure,
  humidity,
  timestamp,
}) => {
  return (
    <Paper key={id} elevation={3}>
      <Card>
        <CardContent>
          <Typography variant="h5" color="primary">
            {lookup[id]}
          </Typography>
          <Divider />
          <Box mb={1} />
          <Typography>Temperatur: {temp.toFixed(2)} ℃</Typography>
          <Typography>Luftfeuchtigkeit: {humidity.toFixed(2)} %</Typography>
          {pressure !== -1 ? (
            <Typography>Luftdruck: {pressure.toFixed(2)} hPa</Typography>
          ) : null}
          <Typography>
            Gemessen vor {Math.floor((Date.now() - timestamp) / 1000)} Sekunden
          </Typography>
        </CardContent>
      </Card>
    </Paper>
  );
};
