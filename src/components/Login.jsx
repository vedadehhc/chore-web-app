import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';

import { login } from '../utils/auth';

export default function Login(props) {
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loginStatus, setLoginStatus] = useState(0); // 0 = not submitted, 1 = loading, 2 = success, 3 = error

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
    <form onSubmit={handleLogin}>
      <input 
        autoComplete='username'
        type='text'
        required
        placeholder='Username'
        value={username}
        onChange={handleUsernameChange} 
      />
      <br/>
      <input 
        autoComplete="password"
        type='password'
        required
        placeholder='Password'
        value={password}
        onChange={handlePasswordChange} 
      />
      <br/>
      <Button
        component="button" 
        type='submit' 
        variant='contained' 
        color='secondary' 
        disabled={loginStatus === 1 || loginStatus === 2}
      >
        {loginStatus === 0 ? 
        "Login" 
        : loginStatus === 1 ?
        <CircularProgress size={25}/>
        : loginStatus === 2 ?
        <DoneIcon/>
        : loginStatus === 3 ?
        <ErrorIcon/>
        : "Login"
        }
      </Button>
    </form>
  );
}