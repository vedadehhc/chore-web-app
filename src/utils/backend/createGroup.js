import {  } from '../backend/awsConfig';
import  { DynamoDB, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { getCredentials } from './auth';

const REGION = 'us-east-2';

export default async function createGroup() {
  const creds = getCredentials();
  console.log(creds);

  const dynamoClient = new DynamoDB({
    region: REGION, 
    credentials: creds,
  });

  try {
    const putParams = {
      TableName: 'chore-web-app-groups',
      Item: {
        'groupID': {S: 'abcde'},
        'numUsers': {N : '12'},
      },
    };

    const data = await dynamoClient.send(new PutItemCommand(putParams));

    return data;
  } catch(err) {
    console.log(err);
  }
}