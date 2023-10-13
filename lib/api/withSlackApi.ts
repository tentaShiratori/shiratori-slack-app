import { VercelApiHandler, VercelRequest, VercelResponse } from "@vercel/node";
import { isValidSlackRequest } from "../slack.js";
import { isDevelopment } from "../constant.js";

export function withSlackApi(fn: VercelApiHandler) {
  return function handler(req: VercelRequest, res: VercelResponse) {
    if (!isDevelopment && !isValidSlackRequest(req)) {
      res.status(403).json("Forbidden");
      return;
    }
    return fn(req, res);
  };
}
