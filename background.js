var offenses = {};

function reset() {
  offenses = {};
  setIcon();
}

function parseUrl(urlStr) {
  const idToken = findToken(urlStr, 'id_token');
  const accessToken = findToken(urlStr, 'access_token')
  if (idToken || accessToken) {
    const origin = new URL(urlStr).origin;
    offenses[origin] = {};
    if (idToken) {
      offenses[origin].idToken = {
        token: idToken,
        claims: parseClaims(idToken)
      }
    }
    if (accessToken) {
      offenses[origin].accessToken = {
        token: accessToken,
        claims: parseClaims(accessToken)
      }
    } 
  }
}

function findToken(str, search) {
  search += '=';
  var begIdx = str.indexOf(search);
  if (begIdx < 0) {
    return null;
  }
  begIdx += search.length;
  var endIdx = str.indexOf('&', begIdx)
  return (endIdx < 0) ? str.substring(begIdx) : str.substring(begIdx, endIdx)
}

function parseClaims(tokenStr) {
  let ret = undefined;
  if ((tokenStr.match(/\./g) || []).length === 2) {
    try {
      ret = JSON.parse(atob(tokenStr.substring(tokenStr.indexOf('.')+1, tokenStr.lastIndexOf('.'))));
    } catch (error) {
      // in case there's two dots in the access token, but it's NOT a jwt
      console.log(error);
    }
  }
  return ret;
}

function setIcon() {
  var options = {path: 'icons/icon-blue-32.png'};
  if (Object.keys(offenses).length) {
    options.path = 'icons/icon-red-32.png'
  }
  browser.browserAction.setIcon(options);
}

function listener(details) {
  parseUrl(details.url);
  setIcon();
  return {};
}

browser.webRequest.onBeforeRequest.addListener(
  listener,
  {urls: ["https://*/*"], types: ["main_frame"]},
  ["blocking"]
);