// @ts-ignore
import Notion from "notion-api-js";

import INotion from "notion-api-js/dist/notion"
import { Attributes } from "notion-api-js/dist/lib/types";
import { pipe, toLastPath, toNonDashId, toDashId } from "./utils";

const { NOTION_TOKEN } = process.env
const notion: INotion = new Notion({ token: NOTION_TOKEN!, options: {} });

function getPageIdByURL(url: URL): string {
  return pipe(
    () => url,
    toLastPath,
    toNonDashId,
    toDashId
  );
}
export async function getPageInfo(pageUrl: URL): Promise<Attributes | undefined> {
  try {
    const pageId = getPageIdByURL(pageUrl);
    const page = await notion.getPageById(pageId);
    return page.Attributes;
  } catch (error) {
    console.error(error);
  }
}
