import type { VercelRequest, VercelResponse } from '@vercel/node'
import pkg from '@slack/bolt';
const { App } = pkg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = new App({
    token:process.env.SLACK_BOT_TOKEN,
    signingSecret:process.env.SLACK_SIGNING_SECRET
  })

  await app.client.chat.postMessage({
    channel:"C060MDTT9QX",
    text:"test message"
  })
  return res.json("Hello World")
}