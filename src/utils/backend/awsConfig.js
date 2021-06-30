import  { DynamoDB } from '@aws-sdk/client-dynamodb';
import { SNSClient } from "@aws-sdk/client-sns";
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

import { IDENTITY_POOL_ID } from './auth';

export const REGION = "us-east-2";

// export const dynamoClient = new DynamoDB({
//   region: REGION, 
//   credentials: fromCognitoIdentityPool({
//     client: new CognitoIdentityClient({ region: REGION }),
//     identityPoolId: IDENTITY_POOL_ID,
//   }),
// });

// export const snsClient = new SNSClient({
//   region: REGION,
//   credentials: fromCognitoIdentityPool({
//     client: new CognitoIdentityClient({ region: REGION }),
//     identityPoolId: IDENTITY_POOL_ID,
//   }),
// });

export const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
});