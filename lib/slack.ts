import pkg from "@slack/bolt";
import { VercelRequest } from "@vercel/node";
import { createHmac } from "crypto";
import tsscmp from "tsscmp";

const { App } = pkg;

export const slack = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// ------------------------------
// HTTP module independent methods
// ------------------------------

const verifyErrorPrefix = "Failed to verify authenticity";

export interface SlackRequestVerificationOptions {
  signingSecret: string;
  body: string;
  headers: {
    "x-slack-signature": string;
    "x-slack-request-timestamp": number;
  };
  nowMilliseconds?: number;
}

/**
 * Verifies the signature of an incoming request from Slack.
 * If the request is invalid, this method throws an exception with the error details.
 */
export function verifySlackRequest(req: VercelRequest): void {
  const requestTimestampSecHeader = req.headers["x-slack-request-timestamp"];
  const signature = req.headers["x-slack-signature"];
  if (Number.isNaN(requestTimestampSecHeader)) {
    throw new Error(
      `${verifyErrorPrefix}: header x-slack-request-timestamp did not have the expected type (${requestTimestampSecHeader})`
    );
  }
  if (signature == null || Array.isArray(signature)) {
    throw new Error(
      `${verifyErrorPrefix}: header x-slack-signature did not have the expected type (${signature})`
    );
  }

  const requestTimestampSec = Number(requestTimestampSecHeader);

  // Calculate time-dependent values
  const nowMs = Date.now();
  const requestTimestampMaxDeltaMin = 5;
  const fiveMinutesAgoSec =
    Math.floor(nowMs / 1000) - 60 * requestTimestampMaxDeltaMin;

  // Enforce verification rules

  // Rule 1: Check staleness
  if (requestTimestampSec < fiveMinutesAgoSec) {
    throw new Error(
      `${verifyErrorPrefix}: x-slack-request-timestamp must differ from system time by no more than ${requestTimestampMaxDeltaMin} minutes or request is stale`
    );
  }

  // Rule 2: Check signature
  // Separate parts of signature
  const [signatureVersion, signatureHash] = signature.split("=");
  // Only handle known versions
  if (signatureVersion !== "v0") {
    throw new Error(`${verifyErrorPrefix}: unknown signature version`);
  }
  // Compute our own signature hash
  const hmac = createHmac("sha256", process.env.SLACK_SIGNING_SECRET ?? "");
  hmac.update(
    `${signatureVersion}:${requestTimestampSec}:${JSON.stringify(req.body)}`
  );
  const ourSignatureHash = hmac.digest("hex");
  if (!signatureHash || !tsscmp(signatureHash, ourSignatureHash)) {
    throw new Error(`${verifyErrorPrefix}: signature mismatch`);
  }
}

/**
 * Verifies the signature of an incoming request from Slack.
 * If the request is invalid, this method returns false.
 */
export function isValidSlackRequest(req: VercelRequest): boolean {
  try {
    verifySlackRequest(req);
    return true;
  } catch (e) {
    console.log(`Signature verification error: ${e}`);
    if (e instanceof Error) {
      console.log(e.stack);
    }
  }
  return false;
}
