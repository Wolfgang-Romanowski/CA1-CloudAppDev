import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    
    const username = event.requestContext?.authorizer?.claims?.['cognito:username'] ||
                     event.requestContext?.authorizer?.claims?.sub ||
                     'anonymous';
    
    const body = event.body ? JSON.parse(event.body) : null;
    
    if (!body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    const { movieId, title, releaseDate, overview } = body;
    
    if (!movieId || !title || !releaseDate || !overview) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Mssing required fields: movieId, title, releaseDate, overview" }),
      };
    }

    console.log(`[USER-ACTIVITY] ${new Date().toISOString()} | ${username} | POST /movies`);

    await ddbDocClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: `m${movieId}`,
          sk: "xxxx",
          entityType: "Movie",
          movieId: Number(movieId),
          title,
          releaseDate,
          overview,
        },
      })
    );

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Movie created successfully", movieId }),
    };
  } catch (error) {
    const username = event.requestContext?.authorizer?.claims?.['cognito:username'] || 
                     event.requestContext?.authorizer?.claims?.sub || 
                     'anonymous';
    console.error(`[ERROR] ${new Date().toISOString()} | ${username} | POST /movies |`, error);
    
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "internal server error" }),
    };
  }
};