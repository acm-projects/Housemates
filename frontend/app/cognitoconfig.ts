import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

/*
Values you copy from AWS Cognito
User Pool → Overview
App Client → Client ID
*/

export const REGION = "us-east-2";           // your AWS region
export const USER_POOL_ID = "us-east-2_7wDH1MWnH"; 
export const CLIENT_ID = "22fiai4ujv7oi54lk6o6btq4vu";

/*
Create Cognito client
This is what actually sends requests to Cognito
*/

export const cognito = new CognitoIdentityProviderClient({
  region: REGION,
});