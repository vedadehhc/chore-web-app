import { InitiateAuthCommand, RevokeTokenCommand, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

import { getRefreshToken, getTokens, setRefreshToken, setTokens } from '../tokens';

export const IDENTITY_POOL_ID = 'us-east-2:f1368add-2f4b-47fc-8b3c-8b65a1c909cb';
export const USER_POOL_ID = 'us-east-2_ZiUGD7hem';
export const REGION ='us-east-2';
export const COGNITO_ID = 'cognito-idp.'+REGION+'.amazonaws.com/'+USER_POOL_ID;
const COGNITO_CLIENT_ID = 'deg51c9v98amenr0il094snqc';

export const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
});

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

export async function register(username, password, name, role) {
  try {
    const response = await cognitoClient.send(new SignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        {Name: 'name', Value: name},
        {Name: 'custom:group-role', Value: role},
      ],
    }));

    // log in auto after regsistering? 
    // need to add user to dynamo table...
    // admin user: create group, regular: add to group

    return {success: true, message: 'success', response};
  } catch (err) {
    console.log(err);
    return {success: false, message: ''};
  }
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return {success: true, message: 'no tokens to revoke'};
  }

  try {
    const response = await cognitoClient.send(new RevokeTokenCommand({
      ClientId: COGNITO_CLIENT_ID,
      Token: refreshToken,
    }));

    return {success: true, message: 'logged out succesfully', response};
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
