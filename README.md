## Implicit Flow Detector

This browser extension detects websites that use the implicit flow. It does this by scanning urls and looking for `id_token` and/or `access_token` in the url.

It works on both Firefox and Chrome. It should work on chromium variants. It doesn't work on Safari.

Currently, it just shows an unordered list of sites that it detected the implicit flow on.

The code is vanilla javascript. There is one dependency: `browser-polyfill.js`, which makes chrome adhere to the standard for browser extensions that mozilla has proposed. This enables it to be a single codebase that works in both chrome and firefox.

### Run locally

Install `web-ext` with:

```
npm install --global web-ext
```

Launch firefox and chrome to test:

```
web-ext run -t chromium -t firefox-desktop
```

To see it in action:

1. The icon for the extension is a white hash symbol. Navigate to: [https://okta-oidc-fun.herokuapp.com](https://okta-oidc-fun.herokuapp.com)
2. Uncheck `code` and check `id token` and `access token`
3. Click the link the at the bottom of the page
4. Notice that the extension icon changes from white to blue to indicate that an implicit flow has been detected
5. Click the blue hash icon and you'll see `https://okta-oidc-fun.herokuapp.com` in the list

**NOTE**: This has also been tested with the implicit flow from the playground section of oauth.com. it *should* work with any site that uses the implicit flow.

### Next Steps

* cleanup iconography and style
* show the raw tokens and the parsed claims in popup
    * some sort of expandable tree interface
* show "yellow alert" icon if *only* id token is detected
* show "red alert" icons if access token is detected
* if token(s) are jwts, show claims