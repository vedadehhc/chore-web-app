import  { DynamoDB, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { getValidTokens, IDENTITY_POOL_ID, COGNITO_ID, REGION } from './auth';
import { getNewDynamoClient } from './dynamo';


// generates a group id using only numbers and upper case letters 
// 36^6 = 2*10^9 codes
function generateGroupID() {
  const length = 6;
  let id = '';
  for(let i = 0; i < length; i++) {
    const dig = Math.floor(Math.random()*36);
    let chr =''
    if (dig < 10) {
      chr = dig.toString();
    } else {
      chr = String.fromCharCode(dig - 10 + 65);
    }
    id = id.concat(chr);
  }

  return id;
}

export async function generateValidGroupID() {
  const client = await getNewDynamoClient();
  if (!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;

  let groupCode = generateGroupID();
  console.log('trying id:', groupCode);

  try {
    const getParams ={
      TableName: 'chore-web-app-groups',
      Key: {
        groupID: {'S': groupCode},
      },
    }

    const response = await dynamoClient.send(new GetItemCommand(getParams));

    console.log(response);
  } catch (err) {
    console.log(err);
  }

}



// add random id, owner user, group name, metadata?
export async function createGroup(groupName, ownerID) {
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
        'users': {SS: [ownerID]},
      },
    };

    const data = await dynamoClient.send(new PutItemCommand(putParams));

    return data;
  } catch(err) {
    console.log(err);
  }
}