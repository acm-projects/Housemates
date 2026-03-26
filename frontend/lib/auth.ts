import { CognitoUserPool } from 'amazon-cognito-identity-js';
import awsConfig from './awsConfig';

let userPool: CognitoUserPool | null = null;

export function configureAuthOnce() {
  if (!userPool) {
    userPool = new CognitoUserPool({
      UserPoolId: awsConfig.userPoolId,
      ClientId: awsConfig.userPoolClientId,
    });
  }
}

export function getUserPool() {
  if (!userPool) {
    configureAuthOnce();
  }
  return userPool;
}