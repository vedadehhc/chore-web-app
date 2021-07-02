import  { DynamoDB } from '@aws-sdk/client-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { getValidTokens, IDENTITY_POOL_ID, COGNITO_ID, REGION } from './auth';

let dynamoClient;

export async function getNewDynamoClient() {
  const tokens = await getValidTokens();
  if (!tokens) {
    return {success: false, message: 'no valid tokens'};
  }

  dynamoClient = new DynamoDB({
    region: REGION, 
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: REGION }),
      identityPoolId: IDENTITY_POOL_ID,
      logins: {
        [COGNITO_ID]: tokens.idToken,
      },
      // userIdentifier: username,
    }),
  });

  return {success: true, dynamoClient, tokens};
}