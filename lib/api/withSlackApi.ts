import { VercelApiHandler, VercelRequest, VercelResponse } from "@vercel/node";
import { isValidSlackRequest } from "../slack.js";
import { isDevelopment } from "../constant.js";
import { validateSlackRequest } from "./validateSlackRequest.js";

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
  return function handler(req: VercelRequest, res: VercelResponse) {
    if (!isDevelopment && !validateSlackRequest(req)) {
      res.status(403).json("Forbidden");
      return;
    }
    return fn(req, res);
  };
}
