import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

type AppApiProps = {
  userPoolId: string;
  userPoolClientId: string;
  moviesTable: dynamodb.Table;
};

export class AppApi extends Construct {
  constructor(scope: Construct, id: string, props: AppApiProps) {
    super(scope, id);

    const { userPoolId, userPoolClientId, moviesTable } = props;

    const api = new apig.RestApi(this, "AppRestApi", 
      {
      description: "Movies App RestApi",
      deployOptions: 
      {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: 
      {
        allowOrigins: apig.Cors.ALL_ORIGINS,
      },
    });

    const apiKey = api.addApiKey("ApiKey", {
      apiKeyName: "MoviesApiKey",
      description: "API Key for Movies API",
    });

    const usagePlan = api.addUsagePlan("UsagePlan", {
      name: "MoviesUsagePlan",
      description: "Usage plan for Movies API",
      throttle: { rateLimit: 10, burstLimit: 20 },
    });

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({ stage: api.deploymentStage });

    const appCommonFnProps = {
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLE_NAME: moviesTable.tableName,
        REGION: cdk.Aws.REGION,
      },
    };

    const getMovieFn = new node.NodejsFunction(this, "GetMovieFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../../lambdas/getMovie.ts`,
    });

    const getMovieActorsFn = new node.NodejsFunction(this, "GetMovieActorsFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../../lambdas/getMovieActors.ts`,
    });

    const getMovieCastMemberFn = new node.NodejsFunction(this, "GetMovieCastMemberFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../../lambdas/getMovieCastMember.ts`,
    });

    const getAwardsFn = new node.NodejsFunction(this, "GetAwardsFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../../lambdas/getAwards.ts`,
    });

    const addMovieFn = new node.NodejsFunction(this, "AddMovieFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../../lambdas/addMovie.ts`,
    });

    const deleteMovieFn = new node.NodejsFunction(this, "DeleteMovieFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../../lambdas/deleteMovie.ts`,
    });

    const streamHandlerFn = new node.NodejsFunction(this, "StreamHandlerFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
      entry: `${__dirname}/../../lambdas/processStreamRecords.ts`,
      environment: { REGION: cdk.Aws.REGION },
    });

    moviesTable.grantReadData(getMovieFn);
    moviesTable.grantReadData(getMovieActorsFn);
    moviesTable.grantReadData(getMovieCastMemberFn);
    moviesTable.grantReadData(getAwardsFn);
    moviesTable.grantWriteData(addMovieFn);
    moviesTable.grantWriteData(deleteMovieFn);
    moviesTable.grantStreamRead(streamHandlerFn);

    streamHandlerFn.addEventSourceMapping("StreamEventSource", {
      eventSourceArn: moviesTable.tableStreamArn!,
      startingPosition: lambda.StartingPosition.LATEST,
      batchSize: 10,
      retryAttempts: 2,
    });

    const authorizerFn = new node.NodejsFunction(this, "AuthorizerFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      entry: `${__dirname}/../../lambdas/auth/authorizer.ts`,
      environment: {
        USER_POOL_ID: userPoolId,
        CLIENT_ID: userPoolClientId,
        REGION: cdk.Aws.REGION,
      },
    });

    const requestAuthorizer = new apig.RequestAuthorizer(this, "RequestAuthorizer", {
      identitySources: [apig.IdentitySource.header("cookie")],
      handler: authorizerFn,
      resultsCacheTtl: cdk.Duration.seconds(0),
    });

    const userMethodOptions: apig.MethodOptions = {
      authorizer: requestAuthorizer,
      authorizationType: apig.AuthorizationType.CUSTOM,
    };

    const adminMethodOptions: apig.MethodOptions = {
      authorizer: requestAuthorizer,
      authorizationType: apig.AuthorizationType.CUSTOM,
      apiKeyRequired: true,
    };

    const moviesResource = api.root.addResource("movies");
    moviesResource.addMethod("POST", new apig.LambdaIntegration(addMovieFn), adminMethodOptions);

    const movieResource = moviesResource.addResource("{movieId}");
    movieResource.addMethod("GET", new apig.LambdaIntegration(getMovieFn), userMethodOptions);
    movieResource.addMethod("DELETE", new apig.LambdaIntegration(deleteMovieFn), adminMethodOptions);

    const actorsResource = movieResource.addResource("actors");
    actorsResource.addMethod("GET", new apig.LambdaIntegration(getMovieActorsFn), userMethodOptions);

    const actorResource = actorsResource.addResource("{actorId}");
    actorResource.addMethod("GET", new apig.LambdaIntegration(getMovieCastMemberFn), userMethodOptions);

    const awardsResource = api.root.addResource("awards");
    awardsResource.addMethod("GET", new apig.LambdaIntegration(getAwardsFn), userMethodOptions);

    new cdk.CfnOutput(this, "APIUrl", {
      value: api.url,
      description: "App API gateway url",
    });

    new cdk.CfnOutput(this, "APIKey", {
      value: apiKey.keyId,
      description: "API Key ID",
    });
  }}