import { last } from 'lodash';

export function pipe<T>(first: Function, ...args: Function[]): T {
  return args && args.length ? args.reduce((result, next) => next(result), first()) : first()
}

const insertStr = (insert: string, index: number) => (str: string) => {
  return str.slice(0, index) + insert + str.slice(index, str.length);
}

export function toLastPath(url: URL) {
  return url.pathname.includes("/") ? last(url.pathname.split("/")) : url.pathname
}

export function toNonDashId(lastPath: string) {
  return lastPath.includes("-") ? last(lastPath.split("-")) : lastPath;
}

export function toDashId(nonDashId: string) {
  return pipe<string>(
    () => nonDashId,
    insertStr("-", 8),
    insertStr("-", 13),
    insertStr("-", 18),
    insertStr("-", 23)
  );
}

export function removeHash(urlStr: string) {
  return urlStr.includes("#") ? urlStr.split("#")[0] : urlStr;
}