import React, { useState } from 'react';
import { Link as RouterLink, useHistory } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Collapse from '@material-ui/core/Collapse';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import Copyright from './Copyright';
import { login } from '../utils/auth';


const useStyles = makeStyles((theme) => ({
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  title: {
      margin: theme.spacing(0, 0, 2),
  },
  buttonProgress: {
    color: blue[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -8,
    marginLeft: -12,
  },
}));

export default function Login(props) {
  const history = useHistory();
  const classes = useStyles();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loginStatus, setLoginStatus] = useState(0); // 0 = not submitted, 1 = loading, 2 = success, 3 = error
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    setLoginStatus(1);
    
    const result = await login(username, password);

    console.log(result);

    // TODO: add error handling
    if(result.success) {
      setLoginStatus(2);
      history.push('/');
    } else {
      setLoginStatus(3);
      setErrorMessage(result.message);
      // allow resubmission after 5 seconds
      setTimeout(() => setLoginStatus(0), 5000);
    }
  }

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }
  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        {/*TODO: fix logo */}
        {/* <img alt="K&M Tax Document Upload" src={logo}/> */}
        <Typography component="h1" variant="h4" className={classes.title}>
            Chore App
        </Typography>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon/>
        </Avatar>
        <Typography component="h1" variant="h5">
          Log In
        </Typography>
        <form className={classes.form} onSubmit={handleLogin}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            type="username"
            name="username"
            autoComplete="username"
            // error={emailError}
            value={username}
            onInput={handleUsernameChange}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onInput={handlePasswordChange}
          />
          <Collapse in={errorMessage}>
            {/* <Alert severity="error">{errorMessage}</Alert> */}
            <Card style={{backgroundColor: '#e57373'}}>
              <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: 7}}>
                <ErrorIcon/>
                <div style={{marginLeft: 10, marginRight: 10}}>
                  {errorMessage}
                </div>
                <div style={{flexGrow: 1}}/>
                <IconButton 
                  onClick={() => setErrorMessage('')}
                  aria-label="close"
                  size="small"
                >
                  <CloseIcon fontSize="inherit"/>
                </IconButton>
              </div>
            </Card>
          </Collapse>
          <div className={classes.wrapper}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loginStatus === 1 || loginStatus === 2}
            >
              {loginStatus === 1 ?
              <CircularProgress size={24}/>
              :  "Login"
              }
            </Button>
          </div>
          
          <Grid container justify="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                Don't have an account? Register
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright name="MAD Mobile Apps" link="https://madmobileapps.com"/>
      </Box>
    </Container>
  );
}