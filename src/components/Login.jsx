import { useState } from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';

import { login, getCredentials, refreshTokens } from '../utils/backend/auth';
import createGroup from '../utils/backend/createGroup';
import { getRefreshToken } from '../utils/tokens';

export default function Login(props) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loginStatus, setLoginStatus] = useState(0); // 0 = not submitted, 1 = loading, 2 = success, 3 = error

  async function handleLogin(event) {
    event.preventDefault();
    setLoginStatus(1);
    
    const result = await login(username, password);

    console.log(result);

    if(result.success) {
      // console.log("idToken: ", parseJwt(result.response.AuthenticationResult.IdToken));
      // console.log("accessToken: ", parseJwt(result.response.AuthenticationResult.AccessToken));
      // console.log("refreshToken: " + parseJwt(result.response.AuthenticationResult.RefreshToken));

      const creds = getCredentials(username);
      console.log('got creds',creds);
      if (creds) {
        const res = await createGroup(creds);
        console.log(res);
      }
    }

    setLoginStatus(2);
    setTimeout(() => setLoginStatus(0), 500);
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
      <Button
        onClick={async () => {
          await refreshTokens();

          console.log('refresh finished');
          console.log(getRefreshToken());

          const creds = getCredentials(username);

          if (creds) {
            const res = await createGroup(creds);
            console.log(res);
          }
        }}
      >
        refresh
      </Button>
    </form>
  );
}