import { VercelRequest } from "@vercel/node";
import crypto from "crypto";

export function validateSlackRequest(event: VercelRequest) {
  const requestBody = JSON.stringify(event["body"]);

  const headers = event.headers;

  const timestamp = headers["x-slack-request-timestamp"];
  const slackSignature = headers["x-slack-signature"];
  const baseString = "v0:" + timestamp + ":" + requestBody;

  const hmac = crypto
    .createHmac("sha256", process.env.SLACK_SIGNING_SECRET ?? "")
    .update(baseString)
    .digest("hex");
  const computedSlackSignature = "v0=" + hmac;
  const isValid = computedSlackSignature === slackSignature;

  return isValid;
}
