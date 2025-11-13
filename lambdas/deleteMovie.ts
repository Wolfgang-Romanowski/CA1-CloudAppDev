import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

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

    console.log(`[USER-ACTIVITY] ${new Date().toISOString()} | ${username} | DELETE /movies/${movieId}`);

    await ddbDocClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: { pk: `m${movieId}`, sk: "xxxx" },
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Movie deleted" }),
    };

  } catch (error) {
    const username = event.requestContext?.authorizer?.claims?.['cognito:username'] || 
                     event.requestContext?.authorizer?.claims?.sub || 
                     'anonymous';
    const movieId = event.pathParameters?.movieId || 'unknown';
    console.error(`[ERROR] ${new Date().toISOString()} | ${username} | DELETE /movies/${movieId} |`, error);
    
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};