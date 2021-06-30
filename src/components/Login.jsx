import { useState } from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';

import { login } from './../backend/auth';
import  { DynamoDB, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

export default function Login(props) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loginStatus, setLoginStatus] = useState(0); // 0 = not submitted, 1 = loading, 2 = success, 3 = error

  async function handleLogin(event) {
    event.preventDefault();
    setLoginStatus(1);
    
    const result = await login(username, password);

    console.log(result);

    if (result.success) {
      const dynamoClient = new DynamoDB({
        region: 'us-east-2', 
        credentials: fromCognitoIdentityPool({
          client: new CognitoIdentityClient({ region: 'us-east-2' }),
          identityPoolId: 'us-east-2:f1368add-2f4b-47fc-8b3c-8b65a1c909cb',
          logins: {
            'cognito-idp.us-east-2.amazonaws.com/us-east-2_ZiUGD7hem': result.result.AuthenticationResult.IdToken,
          },
          // userIdentifier: username,
        })
      });
      console.log('created client');
      try {
        const putParams = {
          TableName: 'chore-web-app-groups',
          Item: {
            'groupID': {S: 'abcdefg'},
            'numUsers': {N : '12'},
          },
        };
    
        const data = await dynamoClient.send(new PutItemCommand(putParams));
        
        console.log('succ', data);
      } catch(err) {
        console.log(err);
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
    </form>
  );
}