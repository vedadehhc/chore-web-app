import  { DynamoDB, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { getValidTokens, IDENTITY_POOL_ID, COGNITO_ID, REGION } from './auth';

// add random id, owner user, group name, metadata?
export default async function createGroup(groupName, ownerID) {
  // const creds = getCredentials();
  // console.log(creds);

  const tokens = await getValidTokens();
  if (!tokens) {
    return {success: false, message: 'no valid tokens'};
  }

  const dynamoClient = new DynamoDB({
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

  try {
    const putParams = {
      TableName: 'chore-web-app-groups',
      Item: {
        'groupID': {S: '12345123'},
        'groupName': {S: groupName},
        'numUsers': {N : '1'},
        'owner': {S: ownerID},
        'users': {L: [ownerID]},
      },
    };

    const data = await dynamoClient.send(new PutItemCommand(putParams));

    return data;
  } catch(err) {
    console.log(err);
  }
}