import { DynamoDBStreamHandler } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log("[STREAM EVENT]", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const eventName = record.eventName;
      const timestamp = new Date().toISOString();

      if (eventName === "INSERT" || eventName === "REMOVE") {
        const newImage = record.dynamodb?.NewImage 
          ? unmarshall(record.dynamodb.NewImage as Record<string, AttributeValue>)
          : null;
        
        const oldImage = record.dynamodb?.OldImage
          ? unmarshall(record.dynamodb.OldImage as Record<string, AttributeValue>)
          : null;

        const item = newImage || oldImage;

        if (!item) {
          console.log("[SKIP] No image data available");
          continue;
        }

        const entityType = item.entityType || 'Unknown';
        const pk = item.pk || 'Unknown';

        if (eventName === "INSERT") {
          console.log(`[STATE-CHANGE] ${timestamp} | INSERT | ${entityType} | pk: ${pk} | ${JSON.stringify(item)}`);
        } else if (eventName === "REMOVE") {
          console.log(`[STATE-CHANGE] ${timestamp} | DELETE | ${entityType} | pk: ${pk} | ${JSON.stringify(item)}`);
        }
      }

    } catch (error) {
      console.error("[ERROR] Processing stream record:", error);
    }
  }

  return { batchItemFailures: [] };
};