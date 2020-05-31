
import { createEventAdapter, errorCodes } from '@slack/events-api';
import { WebClient, MessageAttachment } from '@slack/web-api';
import { keyBy, omit, mapValues } from 'lodash';

import { Attributes } from "notion-api-js/dist/lib/types";
import { getPageInfo } from './notion';
import { AddressInfo } from 'net';

const { SLACK_SIGNING_SECRET, SLACK_CLIENT_TOKEN } = process.env

const slackEvents = createEventAdapter(SLACK_SIGNING_SECRET!);
const slack = new WebClient(SLACK_CLIENT_TOKEN!);

function createMessageAttachMentFromPage(page: Attributes, url: string) {
  const { title, teaser, cover } = page;
  const attachment = {
    fallback: title + (teaser ? `: ${teaser}` : ''),
    color: '#87CEFA',
    title: title,
    title_link: url,
    image_url: cover ? cover : "",
    url
  };

  const fields = [];
  if (teaser) {
    fields.push({
      title: 'Description',
      value: teaser,
    });
  }

  if (fields.length > 0) {
    attachment.fields = fields;
  }
  return attachment;
}

slackEvents.on('link_shared', (event) => {
  Promise.all(event.links.map(async ({ url }: { url: string }) => {
    const pageUrl = new URL(url);
    const page = await getPageInfo(pageUrl);
    if(page.title === "") {
      throw new Error("this block type is not page");
    }
    return createMessageAttachMentFromPage(page!, url);
  }))
    .then(attachments => keyBy(attachments, 'url'))
    .then(unfurls => mapValues(unfurls, attachment => omit(attachment, 'url')))
    .then(unfurls => {
      slack.chat.unfurl({
        ts: event.message_ts,
        channel: event.channel,
        unfurls
      });
    })
    .catch(console.error);
});

slackEvents.on('error', (error) => {
  if (error.code === errorCodes.SIGNATURE_VERIFICATION_FAILURE) {
    console.warn(`An unverified request was sent to the Slack events request URL: ${error.body}`);
  } else {
    console.error(error);
  }
});


(async () => {
  const server = await slackEvents.start(Number(process.env.PORT) || 3000);
  const addressInfo: AddressInfo = server.address()
  console.log(`Listening for events in port: ${addressInfo.port}`);
})();

