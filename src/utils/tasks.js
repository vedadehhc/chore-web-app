import { v4 as uuidv4 } from 'uuid';
import  { PutItemCommand, GetItemCommand, QueryCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

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

    return {success: true, message: 'Tasks listed!', response: response.Items};
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

    return {success: true, message: 'Tasks for this group listed!', response: response.Items};
  } catch(err) {
    return {success: false, message: err.message};
  }
}

// get all tasks in a group - use gsi
// TODO - modify gsi to use less attributes
export async function listGroupTasks(group) {

  if (!group) {
    return {success: false, message: 'no group provided'};
  }
  if (group.role.S !== 'owner') {
    return {success: false, message: 'insufficient permissions'};
  }
  const groupID = group.groupID.S;

  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;
  try {
    const queryParams = {
      TableName: 'chore-web-app-tasks',
      IndexName: 'groupID-taskID-index',
      KeyConditionExpression: 'groupID = :group',
      ExpressionAttributeValues: {
        ':group': {S: groupID},
      },
    };

    const response = await dynamoClient.send(new QueryCommand(queryParams));

    return {success: true, message: 'Tasks for this group listed!', response: response.Items};
  } catch(err) {
    return {success: false, message: err.message};
  }
}


// get all tasks in a group assigned to a specific user - use gsi
// export async function listGroupUserTasks(groupID, userID) {
//   const client = await getNewDynamoClient();
//   if(!client.success) {
//     return {success: false, message: client.message};
//   }

//   const dynamoClient = client.dynamoClient;
//   try {
//     const queryParams = {
//       TableName: 'chore-web-app-tasks',
//       IndexName: 'groupID-userID-index',
//       KeyConditionExpression: 'groupID = :group AND userID = :user',
//       ExpressionAttributeValues: {
//         ':group': {S: groupID},
//         ':user': {S: userID},
//       },
//     };

//     const response = await dynamoClient.send(new QueryCommand(queryParams));

//     return {success: true, response};
//   } catch(err) {
//     return {success: false, message: err.message};
//   }
// }

// create a new task with specified information
export async function createTask(group, user, taskName, taskDescription, taskDays) {
  if(!group || !user || !taskName || !taskDays || taskDays.length === 0) {
    return {success: false, message: 'missing required parameters'};
  }
  if(!taskDescription) {
    taskDescription = '';
  }
  if(group.role.S !== 'owner') {
    return {success: false, message: 'insufficient permissions'};
  }

  const groupID = group.groupID.S;
  const userID = user.userID.S;
  const userName = user.userName.S;

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
        'userName': {S: userName},
        'taskName': {S: taskName},
        'taskDescription': {S: taskDescription},
        'taskDays': {SS: taskDays},
        'groupID#taskID': {S: `${groupID}#${taskID}`},
        'taskID': {S: taskID},
      },
    };

    const response = await dynamoClient.send(new PutItemCommand(putParams));

    return {success: true, message: 'Task created successfully!', response};
  } catch (err) {
    return {success: false, message: err.message};
  }
}

// if not group owner, use current user id
export async function getTask(group, taskID) {
  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;

  const userID = parseJwt(client.tokens.idToken)['cognito:username'];
  const groupID = group.groupID.S

  try {
    if(group.role.S === 'owner') {
      const queryParams = {
        TableName: 'chore-web-app-tasks',
        IndexName: 'groupID-taskID-index',
        KeyConditionExpression: 'groupID = :group AND taskID = :task',
        ExpressionAttributeValues: {
          ':group': {S: groupID},
          ':task': {S: taskID},
        }
      };
      
      const response = await dynamoClient.send(new QueryCommand(queryParams));

      if (response.Count === 0) {
        return {success: false, message: 'no such item exists'};
      } else if (response.Count > 1) {
        return {success: false, message: 'more than one item matched these details'};
      }

      return {success: true, message: 'Got task.', response: response.Items[0]};
    } else {
      const getParams = {
        TableName: 'chore-web-app-tasks',
        Key: {
          'userID': {S: userID},
          'groupID#taskID': {S: `${groupID}#${taskID}`},
        }
      };

      const response = await dynamoClient.send(new GetItemCommand(getParams));

      return {success: true, message: 'Got task.', response: response.Item};
    }
  } catch (err) {
    return {success: false, message: err.message};
  }
}

// delete the given task
export async function deleteTask(userID, group, taskID) {
  if(group.role.S !== 'owner') {
    return {success: false, message: 'insufficient permissions'};
  }

  const groupID = group.groupID.S;

  const client = await getNewDynamoClient();
  if(!client.success) {
    return {success: false, message: client.message};
  }

  const dynamoClient = client.dynamoClient;
  try {
    const deleteParams = {
      TableName: 'chore-web-app-tasks',
      Key: {
        'userID': {S: userID},
        'groupID#taskID': {S: `${groupID}#${taskID}`},
      },
    };

    const response = await dynamoClient.send(new DeleteItemCommand(deleteParams));

    return {success: true, message: 'Task deleted successfully!', response};
  } catch(err) {
    return {success: false, message: err.message};
  }
}