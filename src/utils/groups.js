import  { PutItemCommand, GetItemCommand, UpdateItemCommand, QueryCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

import { getNewDynamoClient } from './dynamo';
import parseJwt from './parseJwt';
import { listGroupTasks, listUserGroupTasks, listUserTasks } from './tasks';


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

  const parsedToken = parseJwt(client.tokens.idToken);
  const ownerName = parsedToken['name'];
  const ownerID = parsedToken['cognito:username']

  try {
    const putGroupParams = {
      TableName: 'chore-web-app-groups',
      Item: {
        'groupID': {S: groupID.groupCode},
        'groupName': {S: groupName},
        'numUsers': {N : '1'},
        'ownerID': {S: ownerID},
        'ownerName': {S: ownerName},
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
      ConditionExpression: 'attribute_exists(#u)', // AND NOT contains(#u, :userID)
      UpdateExpression: 'ADD #u :userIDSet, numUsers :one',
      ExpressionAttributeNames: {
        '#u':'users',
      },
      ExpressionAttributeValues: {
        // ':userID': {S: userID},
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

    return {success: true, response: response.Items};
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

    return {success: true, response: response.Items};
  } catch (err) {
    return {success: false, message: err.message};
  }
}

export async function removeUserFromGroup(group, user) {
  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;
  let userID;

  if(!user) {
    userID = parseJwt(client.tokens.idToken)['cognito:username'];
    if (group.role.S === 'owner') {
      return {success: false, message: 'owner cannot leave group, delete instead'};
    }
  } else {
    userID = user.userID.S;
    if (group.role.S !== 'owner') {
      return {success: false, message: 'insufficient permissions'};
    } else if (user.role.S === 'owner') {
      return {success: false, message: 'owner cannot leave group, delete instead'};
    }
  }

  const groupID = group.groupID.S;

  const getTasks = await listUserGroupTasks(groupID, userID);
  if(!getTasks.success) {
    return {success: false, message: getTasks.message};
  }
  const tasks = getTasks.response;

  try {
    const deleteParams = {
      TableName: 'chore-web-app-usergroups',
      Key: {
        'userID': {S: userID},
        'groupID': {S: groupID},
      },
    };

    const response = await dynamoClient.send(new DeleteItemCommand(deleteParams));

    const taskResponses = [];
    for (const task of tasks) {
      const deleteTaskParams = {
        TableName: 'chore-web-app-tasks',
        Key: {
          'userID': {S : userID},
          'groupID#taskID': {S: task['groupID#taskID'].S},
        },
      };
      const taskResponse = await dynamoClient.send(new DeleteItemCommand(deleteTaskParams));
      taskResponses.push(taskResponse);
    }

    const updateGroupParams = {
      TableName: 'chore-web-app-groups',
      Key: {
        groupID: {'S': groupID},
      },
      ConditionExpression: 'attribute_exists(#u) AND contains(#u, :userID)',
      UpdateExpression: 'ADD numUsers :one DELETE #u :userIDSet',
      ExpressionAttributeNames: {
        '#u':'users',
      },
      ExpressionAttributeValues: {
        ':userID': {S: userID},
        ':userIDSet': {SS: [userID]},
        ':one': {N: '-1'},
      },
    };

    const response2 = await dynamoClient.send(new UpdateItemCommand(updateGroupParams));

    return {success: true, response, response2, taskResponses};
  } catch (err) {
    return {success: false, message: err.message};
  }
}


export async function deleteGroup(group) {
  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;

  if(group.role.S !== 'owner') {
    return {success: false, message: 'insufficient permissions'};
  }
  const groupID = group.groupID.S;

  const userID = parseJwt(client.tokens.idToken)['cognito:username'];

  const getTasks = await listGroupTasks(group);
  if(!getTasks.success) {
    return {success: false, message: getTasks.message};
  }
  const tasks = getTasks.response.Items;

  try {
    const deleteGroupParams = {
      TableName: 'chore-web-app-groups',
      Key: {
        groupID: {S: groupID},
      },
      ConditionExpression: 'ownerID = :user',
      ExpressionAttributeValues: {
        ':user': {'S' : userID},
      },
      ReturnValues: 'ALL_OLD',
    };

    const response = await dynamoClient.send(new DeleteItemCommand(deleteGroupParams));
    const users = response.Attributes.users.SS;

    const userResponses = [];
    for (const user of users) {
      const deleteUserGroupParams = {
        TableName: 'chore-web-app-usergroups',
        Key: {
          'userID': {S: user},
          'groupID': {S: groupID},
        },
      };

      const userResponse = await dynamoClient.send(new DeleteItemCommand(deleteUserGroupParams));
      userResponses.push(userResponse);
    }

    const taskResponses = [];
    for (const task of tasks) {
      const deleteTaskParams = {
        TableName: 'chore-web-app-tasks',
        Key: {
          'userID': {S : task.userID.S},
          'groupID#taskID': {S: task['groupID#taskID'].S},
        },
      };
      const taskResponse = await dynamoClient.send(new DeleteItemCommand(deleteTaskParams));
      taskResponses.push(taskResponse);
    }

    return {success: true, response, userResponses, taskResponses};
  } catch (err) {
    return {success: false, message: err.message};
  }
}