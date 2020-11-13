// build Jitsi Meet URL
const buildJitsiUrl = (config) => {
  const base = config.base.endsWith("/") ? config.base : `${config.base}/`;
  let params = "?analytics.disabled=true";
  if (config.jwt && config.jwt !== "") {
    params = `${params}&jwt=${config.jwt}`;
  }
  return `${base}${config.room}${params}`;
};

// prepend a string with credentials
const prependUrlWithCredentials = (url, credentials) => {
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
const basicAuthUrl = (url, credentials) => {
  const splitted = url.split("//");
  if (splitted.length === 0) {
    // something went wrong
    return url;
  } else if (splitted.length === 1) {
    // url do not have specified protocol, assume http
    const authenticatedUrl = prependUrlWithCredentials(url, credentials);
    return `http://${authenticatedUrl}`;
  } else {
    // url has a defined protocol
    const protocol = splitted.shift();
    const authenticatedUrl = prependUrlWithCredentials(
      splitted.join("//"),
      credentials
    );
    return `${protocol}//${authenticatedUrl}`;
  }
};

// censors sensitive information from a URL
const cencorsSensitiveUrlInformations = (url) => {
  // remove authentication informations
  let cencoredUrl = url.replace(/(\/\/).*@/, "$1");

  // hide JWT tokens
  cencoredUrl = cencoredUrl.replace(/jwt=[a-zA-Z0-9-_.]+/g, "jwt=********");

  return cencoredUrl;
};

module.exports = {
  buildJitsiUrl,
  basicAuthUrl,
  cencorsSensitiveUrlInformations,
};
