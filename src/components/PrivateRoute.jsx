import { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import Header from "./Header";

import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Toolbar from '@material-ui/core/Toolbar';

import { getValidTokens } from '../utils/auth';
import { listGroups } from '../utils/groups';
import useApi from '../utils/useApi';

export default function PrivateRoute({
  component: Component, 
  selected, 
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

  

  // groups
  const [handleLoadGroups, groups, groupsStatus, groupsError] = useApi(listGroups);

  // const [groups, setGroups] = useState([]);
  // const [groupsStatus, setGroupsStatus] = useState(0); // 0 = nothing, 1 = loading, 2 = success, 3 = error
  // const [groupsError, setGroupsError] = useState('');

  // async function handleLoadGroups() {
  //   setGroupsStatus(1);
  //   const result = await listGroups();
    
  //   // console.log(result);

  //   if (result.success) {
  //     setGroups(result.response.Items);
  //     setGroupsStatus(2);
  //   } else {
  //     setGroupsStatus(3);
  //     setGroupsError(result.message);
  //   }
  // }

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
          <div style={{display: 'flex'}}>
            <Header 
              selected={selected} 
              groups={groups}
              groupsStatus={groupsStatus}
              groupsError={groupsError}
              handleLoadGroups={() => handleLoadGroups()}
            />
            <main style={{flexGrow: 1, padding: '2rem'}}>
              <Toolbar/>
              <Component 
                {...props}
                handleLoadGroups={() => handleLoadGroups()}
                groups={groups}
                groupsStatus={groupsStatus}
              />
            </main>
          </div>
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      )
    }/>
  );
}