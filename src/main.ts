
import { createEventAdapter, errorCodes } from '@slack/events-api';
import { WebClient, MessageAttachment } from '@slack/web-api';
import { keyBy, omit, mapValues, last } from 'lodash';

import { PageDTO } from "notion-api-js/dist/lib/types";
import { getPageInfo } from './notion';

const { SLACK_SIGNING_SECRET, SLACK_CLIENT_TOKEN } = process.env

const slackEvents = createEventAdapter(SLACK_SIGNING_SECRET!);
const slack = new WebClient(SLACK_CLIENT_TOKEN!);

function createMessageAttachMentFromPage(page: PageDTO, url: string) {
  const { title, teaser, cover } = page.Attributes!;
  const attachment: MessageAttachment = {
    fallback: title + (teaser ? `: ${teaser}` : ''),
    color: '#87CEFA',
    title: title!,
    title_link: url,
    image_url: cover ? cover : ""
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
    return createMessageAttachMentFromPage((page!), url);
  }))
    .then(attachments => keyBy(attachments, 'url'))
    .then(unfurls => mapValues(unfurls, attachment => omit(attachment, 'url')))
    .then(unfurls => slack.chat.unfurl({
      ts: event.message_ts,
      channel: event.channel,
      unfurls
    }))
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
  await slackEvents.start(3000);
  console.log("Listening for events");
})();

