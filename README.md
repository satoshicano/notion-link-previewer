# notion-link-previewer

Preview your private Notion page in Slack.

**Please note:** Notion API isn't public yet, so we're getting page information in an informal way. If you want to use official Notion Public API, read [this article](https://www.notion.so/Does-Notion-have-an-API-I-can-use-4541b07a5caa46dba0026624646118c0) and please wait for it.


## Demo

![](https://gyazo.com/2460ac363484a57468a350ce83aec50b.gif)

## Requirement

- Notion API token
  - Log in to Notion and get the value of `token_v2` from the cookie.
- Create Slack App, Slack OAuth Access Token and Slack Signing Secret
  - https://api.slack.com/reference/messaging/link-unfurling

## Deploy

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## LICENSE

[MIT](https://github.com/satoshicano/notion-link-previewer/blob/master/LICENSE)