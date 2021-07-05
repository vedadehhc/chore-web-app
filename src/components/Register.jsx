import { useState } from 'react';
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
// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormLabel from '@material-ui/core/FormLabel';

import CloseIcon from '@material-ui/icons/Close';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import Copyright from './Copyright';
import { register } from '../utils/auth';
import useApi from '../utils/useApi';

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
}));

export default function Register(props) {
  const classes = useStyles();

  // const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  // const [groupName, setGroupName] = useState('');
  // const [groupCode, setGroupCode] = useState('');

  const [handleRegister, , registerStatus, responseMessage, [,,setResponseMessage]] = useApi(register, () => [username, password, name]);

  // const [registerStatus, setRegisterStatus] = useState(0); // 0 = not submitted, 1 = loading, 2 = success, 3 = error
  // const [responseMessage, setResponseMessage] = useState('');

  // async function handleRegister(event) {
  //   event.preventDefault();
  //   setRegisterStatus(1);
    
  //   const result = await register(username, password, name);

  //   if (result.success) {
  //     setRegisterStatus(2);
  //     // auto login?
  //     // history.push('/login');
  //     setResponseMessage(result.message);
  //   } else {
  //     setRegisterStatus(3);
  //     setResponseMessage(result.message);
  //   }
  // }

  // function handleRoleChange(event) {
  //   setRole(event.target.value);
  // }
  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }
  function handleNameChange(event) {
    setName(event.target.value);
  }
  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }
  // function handleGroupNameChange(event) {
  //   setGroupName(event.target.value);
  // }
  // function handleGroupCodeChange(event) {
  //   setGroupCode(event.target.value);
  // }

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
          Register
        </Typography>
        <div style={{height:10}}/>
        <form className={classes.form} onSubmit={(e) => {e.preventDefault(); handleRegister()}}>
          {/* <RadioGroup 
            row 
            style={{alignItems:'center', justifyContent: 'center'}} 
            name='role' 
            value={role} 
            onChange={handleRoleChange}
          >
            <Typography style={{marginRight: 3}} variant='h6'>I am a:</Typography>
            <FormControlLabel 
              style={{margin: 0}}
              value="parent"
              control={<Radio required disabled={loginStatus === 1 || loginStatus === 2}/>}
              label="Parent"
            />
            <FormControlLabel
              style={{margin: 0}} 
              value="child" 
              control={<Radio required disabled={loginStatus === 1 || loginStatus === 2}/>} 
              label="Child"
            />
          </RadioGroup> */}
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
            disabled={registerStatus === 1 || registerStatus === 2}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name"
            type="name"
            name="name"
            autoComplete="name"
            // error={emailError}
            value={name}
            onInput={handleNameChange}
            disabled={registerStatus === 1 || registerStatus === 2}
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
            disabled={registerStatus === 1 || registerStatus === 2}
          />
          {/* <Collapse in={role==='parent'}>
            <TextField
              variant='outlined'
              margin='normal'
              required={role==='parent'}
              fullWidth
              name='groupName'
              label='Family name'
              type='text'
              id='groupName'
              autoComplete='groupName'
              value={groupName}
              onInput={handleGroupNameChange}
              disabled={registerStatus === 1 || registerStatus === 2}
            /> 
          </Collapse>
          <Collapse in={role==='child'}>
            <TextField
              variant='outlined'
              margin='normal'
              required={role==='child'}
              fullWidth
              name='groupCode'
              label='Family code'
              type='text'
              id='groupCode'
              autoComplete='groupCode'
              value={groupCode}
              onInput={handleGroupCodeChange}
              disabled={registerStatus === 1 || registerStatus === 2}
            /> 
          </Collapse> */}
          <Collapse in={responseMessage}>
            {/* <Alert severity="error">{errorMessage}</Alert> */}
            <Card style={{
              backgroundColor: ['','','#81c784','#e57373'][registerStatus],
            }}>
              <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: 7}}>
                {[null,<HourglassEmptyIcon/>,<DoneIcon/>,<ErrorIcon/>][registerStatus]}
                <div style={{marginLeft: 10, marginRight: 10}}>
                  {responseMessage}
                </div>
                <div style={{flexGrow: 1}}/>
                <IconButton 
                  onClick={() => setResponseMessage('')}
                  aria-label="close"
                  size="small"
                >
                  <CloseIcon fontSize="inherit"/>
                </IconButton>
              </div>
            </Card>
          </Collapse>
          <div className={classes.wrapper}>
            <Collapse in={registerStatus===2}>
              <Button
                fullWidth
                variant='outlined'
                style={{backgroundColor: '#81c784', marginBottom: 5}}
                component={RouterLink}
                to='/login'
              >
                Go to Log in
              </Button>
            </Collapse>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={registerStatus === 1 || registerStatus === 2}
            >
              {registerStatus === 1 ?
              <CircularProgress size={24}/>
              :  "Register"
              }
            </Button>
          </div>
          
          <Grid container justify="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Log in
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