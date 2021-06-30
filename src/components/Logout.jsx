import { useState, useEffect } from 'react';
import { useHistory} from 'react-router-dom';

import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { logout } from '../utils/auth';

export default function Logout() {
  const history = useHistory();
  
  const [logoutStatus, setLogoutStatus] = useState(0); // 0 = not clicked, 1 = loading, 2 = success, 3 = error

  useEffect(() => {
    handleLogout();
  }, []);

  async function handleLogout() {
    setLogoutStatus(1);

    const result = await logout();

    console.log(result);

    if (result.success) {
      history.push('/login');
    } else {
      setLogoutStatus(3);
      // error handling
      console.log('error logging out');
    }
  }

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: '100vh' }}
    >
      <Grid item xs={3}>
        {logoutStatus === 0 && 
          <Button onClick={handleLogout}>
            Logout
          </Button>
        }
        {logoutStatus === 1 &&
          <CircularProgress/>
        }
        {logoutStatus === 2 &&
          'Logout successful.'
        }
        {logoutStatus === 3 &&
          <div>
            Logout failed.
            <br/>
            <Button onClick={handleLogout}>
              Try again
            </Button>
          </div>
        }
      </Grid>
    </Grid>
  );
}