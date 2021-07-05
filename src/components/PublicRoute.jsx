import { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getValidTokens } from '../utils/auth';

export default function PublicRoute({
  component: Component,
  ...rest
}) {

  const [authenticated, setAuthenticated] = useState(0); // 0 = awaiting, 1 = authenticated, -1 = failed

  if(authenticated === 0) {
    // Add your own authentication on the below line.
    getValidTokens().then((result) => {
      if (result) {
        setAuthenticated(1);
      } else {
        setAuthenticated(-1);
      }
    }).catch((err) => {
      console.log(err);
      setAuthenticated(-1);
    });
  }

  return (
    <Route
     {...rest} 
     render={props =>
      (authenticated === 0) ? (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: '100vh' }}
        >
          <Grid item xs={3}>
            <CircularProgress/>
          </Grid>
        </Grid>
      ) : (
        (authenticated === -1) ? (
          <div>
            <main>
              <Component {...props}/>
            </main>
          </div>
        ) : (
          <Redirect to={{ pathname: '/', state: { from: props.location } }} />
        )
      )
    }/>
  );
}