import { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import Header from "./Header";

import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Toolbar from '@material-ui/core/Toolbar';

export default function PrivateRoute({
  component: Component, 
  selected, 
  ...rest
}) {

  const [authenticated, setAuthenticated] = useState(0); // 0 = awaiting, 1 = authenticated, -1 = failed
  const [authUser, setAuthUser] = useState(null);
  const [authUserInfo, setAuthUserInfo] = useState(null);
  
  
  function authenticateUser(user) {
    setAuthUser(user);
  }

  function setUserInfo(userInfo) {
    setAuthUserInfo(userInfo);
  }

  if(authenticated === 0) {
    // Add your own authentication on the below line.
    setTimeout(() => setAuthenticated(1), 500);
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
        (authenticated === 1) ? (
          <div>
            <Header selected={selected} />
            <main>
              <Toolbar/>
              <Component {...props} userInfo={authUserInfo}/>
            </main>
          </div>
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      )
    }/>
  );
}