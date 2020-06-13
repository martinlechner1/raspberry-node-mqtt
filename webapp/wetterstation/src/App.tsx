import { fold } from '@devexperts/remote-data-ts';
import {
  AppBar,
  Box,
  Container,
  Grid,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import './App.css';
import { SensorView } from './SensorView';
import { useData } from './useData';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#ef5350',
    },
    secondary: {
      main: '#ffa726',
    },
  },
});

function App() {
  const { data } = useData();
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" noWrap>
            Weather Station
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Box mb={3}></Box>
        <Grid container spacing={3}>
          {fold<Error, Data[], React.ReactElement>(
            () => <p>Initial</p>,
            _ => <p>Loading</p>,
            _ => <p>Error while loading</p>,
            succ => (
              <>
                {succ.map(d => (
                  <Grid item xs={12} md={6} key={d.id}>
                    <SensorView {...d} />
                  </Grid>
                ))}
              </>
            )
          )(data!)}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
