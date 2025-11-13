import {
  APIGatewayRequestAuthorizerEvent,
  APIGatewayAuthorizerResult,
  PolicyDocument,
} from "aws-lambda";
import { CookieMap, JwtToken, parseCookies, verifyToken } from "../utils";

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log("[AUTH-EVENT]", JSON.stringify(event));

  const cookies: CookieMap = parseCookies(event);

  if (!cookies) {
    return generateAuthResponse("user", "Deny", event.methodArn);
  }

  const verifiedJwt: JwtToken = await verifyToken(
    cookies.token,
    process.env.USER_POOL_ID,
    process.env.REGION!
  );

  if (!verifiedJwt) {
    return generateAuthResponse("user", "Deny", event.methodArn);
  }

  return generateAuthResponse(verifiedJwt.sub, "Allow", event.methodArn, {
    email: verifiedJwt.email,
    "cognito:username": verifiedJwt.sub,
    sub: verifiedJwt.sub,
  });
};

function generateAuthResponse(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string,
  context?: any
): APIGatewayAuthorizerResult {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: createPolicy(resource, effect),
    context,
  };
  return authResponse;
}

function createPolicy(resource: string, effect: "Allow" | "Deny"): PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: effect,
        Action: "execute-api:Invoke",
        Resource: resource,
      },
    ],
  };
}