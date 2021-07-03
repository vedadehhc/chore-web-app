import { v4 as uuidv4 } from 'uuid';
import  { PutItemCommand, GetItemCommand, UpdateItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

import { getNewDynamoClient } from './dynamo';
import parseJwt from './parseJwt';

// get all of a user's tasks. if no user provided, use current user
export async function listUserTasks(userID) {
  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;

  if(!userID) {
    userID = parseJwt(client.tokens.idToken)['cognito:username'];
  }

  try {
    const queryParams = {
      TableName: 'chore-web-app-tasks',
      KeyConditionExpression: 'userID = :user',
      ExpressionAttributeValues: {
        ':user': {S: userID},
      },
    };

    const response = await dynamoClient.send(new QueryCommand(queryParams));

    return {success: true, response};
  } catch(err) {
    return {success: false, message: err.message};
  }
}

// get all of a user's tasks in a specific group. if no user provided, use current user
export async function listUserGroupTasks(groupID, userID) {
  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;

  if(!userID) {
    userID = parseJwt(client.tokens.idToken)['cognito:username'];
  }

  try {
    const queryParams = {
      TableName: 'chore-web-app-tasks',
      KeyConditionExpression: 'userID = :user AND begins_with(#g, :group)',
      ExpressionAttributeValues: {
        ':user': {S: userID},
        ':group': {S: groupID},
      },
      ExpressionAttributeNames: {
        '#g' : 'groupID#taskID',
      },
    };

    const response = await dynamoClient.send(new QueryCommand(queryParams));

    return {success: true, response};
  } catch(err) {
    return {success: false, message: err.message};
  }
}

// get all tasks in a group - use gsi
export async function listGroupTasks(groupID) {

}

// get all tasks in a group assigned to a specific user - use gsi
export async function listGroupUserTasks(groupID, userID) {

}

// create a new task with specified information
export async function createTask(groupID, userID, taskName, taskDescription, taskDays) {
  if(!groupID || !userID || !taskName || !taskDays || taskDays.length === 0) {
    return {success: false, message: 'missing required parameters'};
  }
  if(!taskDescription) {
    taskDescription = '';
  }

  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;

  const taskID = uuidv4();

  try {
    const putParams = {
      TableName: 'chore-web-app-tasks',
      Item: {
        'groupID': {S: groupID},
        'userID': {S: userID},
        'taskName': {S: taskName},
        'taskDescription': {S: taskDescription},
        'taskDays': {SS: taskDays},
        'groupID#taskID': {S: `${groupID}#${taskID}`},
        'taskID': {S: taskID},
      },
    };

    const response = await dynamoClient.send(new PutItemCommand(putParams));

    return {success: true, response};
  } catch (err) {
    return {success: false, message: err.message};
  }
}

export async function deleteTask(userID, groupID, taskID) {

}