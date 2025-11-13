import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as custom from 'aws-cdk-lib/custom-resources';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { AuthApi } from './constructs/auth-api';
import { AppApi } from './constructs/app-api';
import { movies, actors, cast, awards } from '../seed/movies';
import { 
  movieToDynamoItem, 
  actorToDynamoItem, 
  castToDynamoItem, 
  awardToDynamoItem
} from '../shared/util';

export class Ca1CloudDevStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const moviesTable = new dynamodb.Table(this, 'MoviesTable', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: 'Movies',
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // Seed database
    new custom.AwsCustomResource(this, 'SeedDatabaseCustomResource', {
      onCreate: {
        service: 'DynamoDB',
        action: 'batchWriteItem',
        parameters: {
          RequestItems: {
            [moviesTable.tableName]: [
              ...movies.map(movieToDynamoItem),
              ...actors.map(actorToDynamoItem),
              ...cast.map(castToDynamoItem),
              ...awards.map(awardToDynamoItem),
            ],
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of('moviesddbInitData'),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [moviesTable.tableArn],
      }),
    });

    // Cognito user pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'MoviesUserPool',
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = userPool.addClient('UserPoolClient', {
      authFlows: { userPassword: true, userSrp: true },
      generateSecret: false,
    });

    // Instantiate auth API construct
    new AuthApi(this, 'AuthServiceApi', {
      userPoolId: userPool.userPoolId,
      userPoolClientId: userPoolClient.userPoolClientId,
    });

    new AppApi(this, 'AppApi', {
      userPoolId: userPool.userPoolId,
      userPoolClientId: userPoolClient.userPoolClientId,
      moviesTable: moviesTable,
    });

    // Stack Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito user pool id',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito pool client id',
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: moviesTable.tableName,
      description: 'DynamoDB table name',
    });
  }
}