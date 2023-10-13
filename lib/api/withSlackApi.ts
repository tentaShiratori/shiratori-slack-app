import { VercelApiHandler, VercelRequest, VercelResponse } from "@vercel/node";
import { isValidSlackRequest } from "../slack.js";
import { isDevelopment } from "../constant.js";
import { steamToBuffer } from "../stream.js";

/**
 * slackからのrequestか検証する
 *
 * リクエストがparseされてると検証に失敗するので、リクエストハンドラーを定義するファイルに次のコードを加える必要がある
 * ```ts
 * export const config = {
 *   api: {
 *     bodyParser: false,
 *   },
 * };
 * ```
 * @param fn
 * @returns
 */
export function withSlackApi(fn: VercelApiHandler) {
  return async function handler(req: VercelRequest, res: VercelResponse) {
    const body = await steamToBuffer(req);
    req.body = body;
    if (!isDevelopment && !isValidSlackRequest(req)) {
      res.status(403).json("Forbidden");
      return;
    }
    req.body = body.toString();
    fn(req, res);
    return;
  };
}
