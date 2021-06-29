import { InitiateAuthCommand, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './awsConfig';

const COGNITO_CLIENT_ID = 'deg51c9v98amenr0il094snqc';

export async function login(username, password) {
  try {
    const result = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    }));

    return {success: true, message: 'success', result};
  } catch (err) {
    console.log(err);
    return {success: false, message: ''};
  }
}


export async function register(username, password, name) {
  try {
    const result = await cognitoClient.send(new SignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        {Name: 'name', Value: name},
        {Name: 'custom:group-role', Value: 'regular'},
      ],
    }));

    return {success: true, message: 'success', result};
  } catch (err) {
    console.log(err);
    return {success: false, message: ''};
  }
}
