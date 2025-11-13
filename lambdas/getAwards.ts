import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    
    const username = event.requestContext?.authorizer?.claims?.['cognito:username'] ||
                     event.requestContext?.authorizer?.claims?.sub ||
                     'anonymous';
    
    const movieId = event.queryStringParameters?.movie;
    const actorId = event.queryStringParameters?.actor;
    const awardBody = event.queryStringParameters?.awardBody;
    
    const queryParams = [];
    if (movieId) queryParams.push(`movie=${movieId}`);
    if (actorId) queryParams.push(`actor=${actorId}`);
    if (awardBody) queryParams.push(`awardBody=${awardBody}`);
    const queryString = queryParams.join('&');
    
    console.log(`[USER-ACTIVITY] ${new Date().toISOString()} | ${username} | GET /awards${queryString ? '?' + queryString : ''}`);
    
    if (!movieId && !actorId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing required query parameter: movie or actor" }),
      };
    }

    const awards = [];

    if (movieId) {
      if (awardBody) {
        const result = await ddbDocClient.send(
          new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: { pk: `w${movieId}`, sk: awardBody },
          })
        );
        if (result.Item) awards.push(result.Item);
      } else {
        const result = await ddbDocClient.send(
          new QueryCommand({
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: { ":pk": `w${movieId}` },
          })
        );
        awards.push(...(result.Items || []));
      }
    }

    if (actorId) {
      if (awardBody) {
        const result = await ddbDocClient.send(
          new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: { pk: `w${actorId}`, sk: awardBody },
          })
        );
        if (result.Item) awards.push(result.Item);
      } else {
        const result = await ddbDocClient.send(
          new QueryCommand({
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: { ":pk": `w${actorId}` },
          })
        );
        awards.push(...(result.Items || []));
      }
    }

    if (awards.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "No awards found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(awards),
    };

  } catch (error) {
    const username = event.requestContext?.authorizer?.claims?.['cognito:username'] || 
                     event.requestContext?.authorizer?.claims?.sub || 
                     'anonymous';
    console.error(`[ERROR] ${new Date().toISOString()} | ${username} | GET /awards |`, error);
    
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};