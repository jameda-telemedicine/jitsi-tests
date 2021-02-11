import { InternalJitsiInstance, InternalInstance } from '../types/instances';
import { Credentials } from '../types/providers';

// build Jitsi Meet URL
export const buildJitsiUrl = (instance: InternalJitsiInstance): string => {
  const base = instance.url.endsWith('/') ? instance.url : `${instance.url}/`;
  let params = '?analytics.disabled=true';

  if (instance.jwt && instance.jwt !== '') {
    params = `${params}&jwt=${instance.jwt}`;
  }

  return `${base}${instance.room}${params}`;
};

// build standard URL
export const buildStandardUrl = (instance: InternalInstance): string => {
  const base = instance.url.endsWith('/') ? instance.url : `${instance.url}/`;
  let params = '';
  if (instance.jwt && instance.jwt !== '') {
    params = `?jwt=${instance.jwt}`;
  }
  return `${base}${instance.room}${params}`;
};

// prepend a string with credentials
export const prependUrlWithCredentials = (url: string, credentials?: Credentials): string => {
  if (!credentials || !credentials.username) {
    return url;
  }
  let auth = credentials.username;
  if (credentials.password) {
    auth = `${auth}:${credentials.password}`;
  }
  return `${auth}@${url}`;
};

// add basic authentication to url
export const basicAuthUrl = (url: string, credentials?: Credentials): string => {
  const splitted = url.split('//');
  if (splitted.length === 0) {
    // something went wrong
    return url;
  } if (splitted.length === 1) {
    // url do not have specified protocol, assume http
    const authenticatedUrl = prependUrlWithCredentials(url, credentials);
    return `http://${authenticatedUrl}`;
  }
  // url has a defined protocol
  const protocol = splitted.shift();
  const authenticatedUrl = prependUrlWithCredentials(
    splitted.join('//'),
    credentials,
  );
  return `${protocol}//${authenticatedUrl}`;
};

// censors sensitive information from a URL
export const cencorsSensitiveUrlInformations = (url: string): string => {
  // remove authentication informations
  let cencoredUrl = url.replace(/(\/\/).*@/, '$1');

  // hide JWT tokens
  cencoredUrl = cencoredUrl.replace(/jwt=[a-zA-Z0-9-_.]+/g, 'jwt=********');

  return cencoredUrl;
};

export const buildInstanceUrl = (instance: InternalInstance): string => {
  switch (instance.type) {
    case 'jitsi':
      return buildJitsiUrl(instance);

    default:
  }

  return buildStandardUrl(instance);
};
