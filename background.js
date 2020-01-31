var offenses = {};

function reset() {
  offenses = {};
  setIcon();
}

function parseUrl(urlStr) {
  // cheat - replace # with ? to take advantage of searchParams
  const url = new URL(urlStr.replace('#','?'));
  const idToken = url.searchParams.get('id_token');
  const accessToken = url.searchParams.get('access_token')
  if (idToken || accessToken) {
    offenses[url.origin] = {};
    if (idToken) {
      offenses[url.origin].idToken = {
        token: idToken,
        claims: parseClaims(idToken)
      }
    }
    if (accessToken) {
      offenses[url.origin].accessToken = {
        token: accessToken,
        claims: parseClaims(accessToken)
      }
    } 
  }
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
  var options = {path: 'icons/hash-green-32.png'};
  if (Object.keys(offenses).length) {
    options.path = 'icons/hash-red-32.png'
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