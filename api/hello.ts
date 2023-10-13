import type { VercelRequest, VercelResponse } from "@vercel/node";
import { slack } from "../lib/slack.js";
import { withSlackApi } from "../lib/api/withSlackApi.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withSlackApi(async function handler(
  _: VercelRequest,
  res: VercelResponse
) {
  await slack.client.chat.postMessage({
    channel: "C060MDTT9QX",
    text: "test message",
  });
  res.json("success");
  return;
});
