function listenForClicks() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('reset')) {
      browser.runtime.getBackgroundPage().then((backgroundPage) => {
        removeExistingOffenses();
        backgroundPage.reset();
      });
    }
  });
}

function removeExistingOffenses() {
  hide(document.querySelector('.reset'));
  hide(document.querySelector('.some-offenses'));
  show(document.querySelector('.no-offenses'));
  var offenses = document.querySelector('.offenses');
  if (offenses) {
    offenses.remove();
  }
}

function jsonToElement(elem, data) {
  var list = document.createElement('ul');
  if (elem) {
    elem.appendChild(list);
    list.classList.add('nested', 'scroll');
  } else {
    list.classList.add('offenses');
    list.id = 'myUL';
  }

  for (var i = 0; i < data.length; ++i) {
    var li = document.createElement('li');
    list.appendChild(li);
    if (data[i].data.length) {
      var span = document.createElement('span');
      span.classList.add((data[i].caret)?data[i].caret:'caret');
      span.textContent = data[i].text;
      li.appendChild(span);
      jsonToElement(li, data[i].data);
    } else {
      var pre = document.createElement('pre');
      pre.textContent = data[i].text;
      li.appendChild(pre);
    }
  }

  return list;
}

function addTokenData(name, caret, tokenData, datum) {
  if (tokenData.claims) {
    var idx = datum.data.length;
    datum.data.push({text: name, data: [{text: 'token value', data: []}], caret: caret})
    datum.data[idx].data[0].data.push({text: tokenData.token, data: []})
    datum.data[idx].data.push({text: 'token claims', data: []})
    datum.data[idx].data[1].data.push({text: JSON.stringify(tokenData.claims, null, 2), data: []});
  } else {
    datum.data.push({text: name, data: [{text: tokenData.token, data: []}], caret: caret})
  }
}

function transformOffenses(offenses) {
  var data = [];
  const keys = Object.keys(offenses);
  for (const key of keys) {
    var datum = {text: key, data: []}
    if (offenses[key].idToken) {
      addTokenData('ID Token', 'caret-yellow', offenses[key].idToken, datum);
    }
    if (offenses[key].accessToken) {
      addTokenData('Access Token', 'caret-red', offenses[key].accessToken, datum);
    }
    data.push(datum);
  }
  return data;
}

function setupToggler() {
  ['caret', 'caret-yellow', 'caret-red'].forEach((className) => {
    Array.prototype.forEach.call(document.getElementsByClassName(className), function (toggler) {
      toggler.addEventListener('click', function() {
        this.parentElement.querySelector('.nested').classList.toggle('active');
        this.classList.toggle('caret-down');
      });
    })
  });
}

function refreshExistingOffenses(backgroundPage) {
  removeExistingOffenses();
  var data = transformOffenses(backgroundPage.offenses);
  var sites = document.querySelector('#sites');
  if (sites.childNodes.length > 0) {
    sites.removeChild(sites.childNodes[0]);
  }
  sites.appendChild(jsonToElement(null, data));
  if (data.length) {
    show(document.querySelector('.reset'));
    show(document.querySelector('.some-offenses'));
    hide(document.querySelector('.no-offenses'));
  }
  setupToggler();
}

var show = function (elem) {
  elem.style.display = 'block';
};

var hide = function (elem) {
  elem.style.display = 'none';
};

browser.runtime.getBackgroundPage().then(refreshExistingOffenses);
listenForClicks();