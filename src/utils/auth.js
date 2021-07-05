import { InitiateAuthCommand, RevokeTokenCommand, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient, GetIdCommand } from '@aws-sdk/client-cognito-identity';

import { clearTokens, getRefreshToken, getTokens, setRefreshToken, setTokens } from './tokens';

export const IDENTITY_POOL_ID = 'us-east-2:f1368add-2f4b-47fc-8b3c-8b65a1c909cb';
export const USER_POOL_ID = 'us-east-2_ZiUGD7hem';
export const REGION ='us-east-2';
export const COGNITO_ID = 'cognito-idp.'+REGION+'.amazonaws.com/'+USER_POOL_ID;
const COGNITO_CLIENT_ID = 'deg51c9v98amenr0il094snqc';

const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
});

let authCognitoClient;

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
    
    
    authCognitoClient = new CognitoIdentityProviderClient({
      region: REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: IDENTITY_POOL_ID,
        logins: {
          [COGNITO_ID]: response.AuthenticationResult.IdToken,
        },
        // userIdentifier: username,
      }),
    });

    setTokens(response.AuthenticationResult.IdToken, response.AuthenticationResult.AccessToken);
    setRefreshToken(response.AuthenticationResult.RefreshToken);

    return {success: true, message: 'Logged in successfully!', response};
  } catch (err) {
    return {success: false, message: err.message};
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
      ],
      ClientMetadata: {
        'secretKey': process.env.REACT_APP_AUTO_CONFIRM_KEY,
      },
    }));

    // log in auto after regsistering? 
    // need to add user to dynamo table...
    // admin user: create group, regular: add to group

    return {success: true, message: 'Registered successfully!', response};
  } catch (err) {
    return {success: false, message: err.message};
  }
}

export async function logout() {

  if (!authCognitoClient) {
    authCognitoClient = new CognitoIdentityProviderClient({
      region: REGION,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region: REGION }),
        identityPoolId: IDENTITY_POOL_ID,
        logins: {
          [COGNITO_ID]: (await getValidTokens()).idToken,
        },
        // userIdentifier: username,
      }),
    });
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return {success: true, message: 'Already logged out!'};
  }

  clearTokens();

  try {
    const response = await authCognitoClient.send(new RevokeTokenCommand({
      ClientId: COGNITO_CLIENT_ID,
      Token: refreshToken,
    }));

    authCognitoClient = null;
    
    return {success: true, message: 'Logged out succesfully!', response};
  } catch (err) {
    return {success: false, message: err.message};
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
    return {success: false, message: 'No refresh token found.'};
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
    return {success: false, message: err.message};
  }
}

// export async function getValidIdentityID() {
//   let identityID = getIdentityID();
//   if (identityID) {
//     return {success: true, identityID};
//   }

//   const tokens = await getValidTokens();

//   if (!tokens) {
//     return {success: false, message: 'no valid tokens'};
//   }

//   try {
//     const identityClient = new CognitoIdentityClient({ region: REGION });

//     const response = await identityClient.send(new GetIdCommand({
//       IdentityPoolId: IDENTITY_POOL_ID,
//       Logins: {
//         [COGNITO_ID]: tokens.idToken,
//       },
//     }));

//     setIdentityID(response.identityID);
//     return {success: true, identityID: response.identityID};
//   } catch (err) {
//     return {success: false, message: err.message};
//   }
// }
