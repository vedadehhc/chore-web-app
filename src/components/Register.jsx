import { useState } from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';

import { register } from './../backend/auth';

export default function Register(props) {

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const [loginStatus, setLoginStatus] = useState(0); // 0 = not submitted, 1 = loading, 2 = success, 3 = error

  async function handleLogin(event) {
    event.preventDefault();
    setLoginStatus(1);
    
    const result = await register(username, password, name);

    console.log(result);
    setLoginStatus(2);
    setTimeout(() => setLoginStatus(0), 500);
  }

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }
  function handleNameChange(event) {
    setName(event.target.value);
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
        autoComplete="name"
        type='text'
        required
        placeholder='Name'
        value={name}
        onChange={handleNameChange} 
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