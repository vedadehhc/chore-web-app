import  { PutItemCommand, GetItemCommand, UpdateItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { getValidTokens } from './auth';
import { getNewDynamoClient } from './dynamo';
import parseJwt from './parseJwt';


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

export async function generateValidGroupID(dynamoClient=null) {

  if(!dynamoClient) {
    const client = await getNewDynamoClient();
    if (!client.success) {
      return {success: false, message: client.message};
    }

    dynamoClient = client.dynamoClient;
  }

  let works = false;
  let groupCode='';

  const startTime = Date.now(); // cur time in ms

  while(!works) {
    // timeout after 5 secs
    if (Date.now() - startTime > 5000){
      return {success: false, message: 'timed out before valid id was found'};
    }

    groupCode = generateGroupID();
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
      if(response.Item) {
        works = false;
      } else {
        works = true;
      }
    } catch (err) {
      console.log(err);
      return {success: false, message: err.message};
    }
  }

  console.log('found valid id:', groupCode);
  return {success: true, groupCode};
}


export async function createGroup(groupName) {

  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;


  const groupID = await generateValidGroupID(dynamoClient);
  if (!groupID.success) {
    return {success: false, message: groupID.message};
  }

  const parsedToken = parseJwt(client.tokens.idToken)
  const ownerID = parsedToken['cognito:username'];
  const ownerName = parsedToken['name'];

  try {
    const putGroupParams = {
      TableName: 'chore-web-app-groups',
      Item: {
        'groupID': {S: groupID.groupCode},
        'groupName': {S: groupName},
        'numUsers': {N : '1'},
        'owner': {S: ownerID},
        'users': {SS: [ownerID]},
      },
    };

    const response = await dynamoClient.send(new PutItemCommand(putGroupParams));
    
    const putUserGroupParams = {
      TableName: 'chore-web-app-usergroups',
      Item: {
        'userID': {S: ownerID},
        'groupID': {S: groupID.groupCode},
        'userName': {S: ownerName},
        'groupName': {S: groupName},
        'role': {S: 'owner'},
      },
    };

    const response2 = await dynamoClient.send(new PutItemCommand(putUserGroupParams));

    return {success: true, response, response2};
  } catch(err) {
    console.log(err);
    return {success: false, message: err.message};
  }
}

export async function joinGroup(groupCode) {
  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;

  const parsedToken = parseJwt(client.tokens.idToken)
  const userID = parsedToken['cognito:username'];
  const userName = parsedToken['name'];

  try {

    const getGroupParams = {
      TableName: 'chore-web-app-groups',
      Key: {
        groupID: {'S': groupCode},
      },
    }

    const response = await dynamoClient.send(new GetItemCommand(getGroupParams));

    if (!response.Item) {
      return {success: false, message: 'Invalid group code'};
    }

    const updateGroupParams = {
      TableName: 'chore-web-app-groups',
      Key: {
        groupID: {'S': groupCode},
      },
      ConditionExpression: 'attribute_exists(#u) AND NOT contains(#u, :userID)',
      UpdateExpression: 'ADD #u :userIDSet, numUsers :one',
      ExpressionAttributeNames: {
        '#u':'users',
      },
      ExpressionAttributeValues: {
        ':userID': {S: userID},
        ':userIDSet': {SS: [userID]},
        ':one': {N: '1'},
      },
    };

    const response2 = await dynamoClient.send(new UpdateItemCommand(updateGroupParams));

    const putUserGroupParams = {
      TableName: 'chore-web-app-usergroups',
      Item: {
        'userID': {S: userID},
        'groupID': {S: groupCode},
        'userName': {S: userName},
        'groupName': {S: response.Item.groupName.S},
        'role': {S: 'regular'},
      },
    };

    const response3 = await dynamoClient.send(new PutItemCommand(putUserGroupParams));

    return {success: true, response, response2, response3};
  } catch (err) {
    if(err.message === 'The conditional request failed') {
      err.message = 'You are already in this group';
    }
    return {success: false, message: err.message};
  }
}

export async function listGroups() {
  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;

  const userID = parseJwt(client.tokens.idToken)['cognito:username'];

  try {
    const queryParams = {
      TableName: 'chore-web-app-usergroups',
      KeyConditionExpression: 'userID = :user',
      ExpressionAttributeValues: {
        ':user': {S: userID},
      },
    }

    const response = await dynamoClient.send(new QueryCommand(queryParams));

    return {success: true, response};
  } catch (err) {
    return {success: false, message: err.message};
  }

}

export async function listUsersInGroup(groupID){
  if(!groupID) {
    return {success: false, message: 'group id requried'};
  }

  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;

  try {
    const queryParams = {
      TableName: 'chore-web-app-usergroups',
      IndexName: 'groupID-userID-index',
      KeyConditionExpression: 'groupID = :group',
      ExpressionAttributeValues: {
        ':group': {S: groupID},
      },
    }

    const response = await dynamoClient.send(new QueryCommand(queryParams));

    return {success: true, response};
  } catch (err) {
    return {success: false, message: err.message};
  }
}