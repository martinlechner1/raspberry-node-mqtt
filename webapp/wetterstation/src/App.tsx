import React from 'react';
import { fold } from '@devexperts/remote-data-ts';
import { Container, Grid } from '@material-ui/core';
import './App.css';
import { SensorView } from './SensorView';
import { useData } from './useData';

function App() {
  const { data } = useData();
  return (
    <Container maxWidth="sm">
      <Grid container spacing={3}>
        {fold<Error, Data[], React.ReactElement>(
          () => <p>Initial</p>,
          _ => <p>Loading</p>,
          _ => <p>Error while loading</p>,
          data => (
            <>
              {data.map(d => (
                <Grid item xs={12} md={6} key={d.id}>
                  <SensorView {...d} />
                </Grid>
              ))}
            </>
          )
        )(data!)}
      </Grid>
    </Container>
  );
}

export default App;
