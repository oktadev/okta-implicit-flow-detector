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
  var offenses = document.querySelector('.offenses');
  if (offenses) {
    offenses.remove();
  }
}

function json_tree(data, isNested) {
  var json = (isNested) ? '<ul class="nested">' : '<ul class="offenses" id="myUL">';

  for(var i = 0; i < data.length; ++i) {
    if(data[i].data.length) {
      json += '<li><span class="' + ((data[i].caret)?data[i].caret:'caret') + '">' + data[i].text + '</span>';
      json += json_tree(data[i].data, true);
    } else {
      json += '<li>' + data[i].text;
    }
    json += '</li>';
  }
  return json + '</ul>';
}

function addTokenData(name, caret, tokenData, datum) {
  if (tokenData.claims) {
    var idx = datum.data.length;
    datum.data.push({text: name, data: [{text: 'token value', data: []}], caret: caret})
    datum.data[idx].data[0].data.push({text: tokenData.token, data: []})
    datum.data[idx].data.push({text: 'token claims', data: []})
    datum.data[idx].data[1].data.push({text: '<pre>' + JSON.stringify(tokenData.claims,2) + '</pre>', data: []});
  } else {
    datum.data.push({text: name, data: [{text: tokenData.token, data: []}, caret]})
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
  document.querySelector('#sites').innerHTML = json_tree(data, false);
  setupToggler();
}

browser.runtime.getBackgroundPage().then(refreshExistingOffenses);
listenForClicks();