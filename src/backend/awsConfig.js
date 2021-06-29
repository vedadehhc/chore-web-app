import  { DynamoDB } from '@aws-sdk/client-dynamodb';
import { SNSClient } from "@aws-sdk/client-sns";
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

export const REGION = "us-east-2";
export const IDENTITY_POOL_ID = 'us-east-2:b05bf792-94ce-484b-94ed-dba2e934eab2'; // CHANGE THIS!

export const dynamoClient = new DynamoDB({
  region: REGION, 
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
  }),
});

export const snsClient = new SNSClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: IDENTITY_POOL_ID,
  }),
});

export const cognitoClient = new CognitoIdentityProviderClient({
  region: REGION,
});