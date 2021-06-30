import { InitiateAuthCommand, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

import { cognitoClient } from './awsConfig';
import { getRefreshToken, getTokens, setRefreshToken, setTokens } from '../tokens';

export const IDENTITY_POOL_ID = 'us-east-2:f1368add-2f4b-47fc-8b3c-8b65a1c909cb';
export const USER_POOL_ID = 'us-east-2_ZiUGD7hem';

const REGION ='us-east-2';
const COGNITO_CLIENT_ID = 'deg51c9v98amenr0il094snqc';
const COGNITO_ID = 'cognito-idp.'+REGION+'.amazonaws.com/'+USER_POOL_ID;


export async function getCredentials(username) {
  const tokens = await getValidTokens();
  if (!tokens) {
    return null;
  }

  console.log(tokens);

  return fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
    logins: {
      [COGNITO_ID]: tokens.idToken,
    },
    // userIdentifier: username,
  });
}

export async function login(username, password) {
  try {
    const response = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    }));

    setTokens(response.AuthenticationResult.IdToken, response.AuthenticationResult.AccessToken);
    setRefreshToken(response.AuthenticationResult.RefreshToken);

    return {success: true, message: 'success', response};
  } catch (err) {
    console.log(err);
    return {success: false, message: ''};
  }
}

export async function register(username, password, name) {
  try {
    const response = await cognitoClient.send(new SignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        {Name: 'name', Value: name},
        {Name: 'custom:group-role', Value: 'regular'},
      ],
    }));

    return {success: true, message: 'success', response};
  } catch (err) {
    console.log(err);
    return {success: false, message: ''};
  }
}

export async function getValidTokens() {
  const curTokens = getTokens();

  if (curTokens.idToken && curTokens.accessToken) {
    return curTokens;
  }

  const result = await refreshTokens();

  if (result.success) {
    return getTokens();
  }

  return null;
}

export async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return {success: false, message: 'no refresh token found.'};
  }

  try {
    const response = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    }));

    setTokens(response.AuthenticationResult.IdToken, response.AuthenticationResult.AccessToken);

    return {success: true, message: 'success'};
  } catch (err) {
    console.log(err);
    return {success: false, message: err};
  }
}
