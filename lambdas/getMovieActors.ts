import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    
    const username = event.requestContext?.authorizer?.claims?.['cognito:username'] ||
                     event.requestContext?.authorizer?.claims?.sub ||
                     'anonymous';
    
    const movieId = event.pathParameters?.movieId;
    
    if (!movieId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing movieId" }),
      };
    }

    console.log(`[USER-ACTIVITY] ${new Date().toISOString()} | ${username} | GET /movies/${movieId}/actors`);

    const castResult = await ddbDocClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": `c${movieId}` },
      })
    );

    if (!castResult.Items || castResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "No cast found for this movie" }),
      };
    }

    const actorIds = castResult.Items.map(cast => cast.actorId);
    const actors = [];

    for (const actorId of actorIds) {
      const actorResult = await ddbDocClient.send(
        new QueryCommand({
          TableName: process.env.TABLE_NAME,
          KeyConditionExpression: "pk = :pk AND sk = :sk",
          ExpressionAttributeValues: {
            ":pk": `a${actorId}`,
            ":sk": "xxxx",
          },
        })
      );
      
      if (actorResult.Items && actorResult.Items.length > 0) {
        actors.push(actorResult.Items[0]);
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actors),
    };

  } catch (error) {
    const username = event.requestContext?.authorizer?.claims?.['cognito:username'] || 
                     event.requestContext?.authorizer?.claims?.sub || 
                     'anonymous';
    const movieId = event.pathParameters?.movieId || 'unknown';
    console.error(`[error] ${new Date().toISOString()} | ${username} | GET /movies/${movieId}/actors |`, error);
    
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};