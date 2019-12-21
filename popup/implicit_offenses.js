function listenForClicks() {
  document.addEventListener("click", (e) => {

    if (e.target.classList.contains("reset")) {
      browser.runtime.getBackgroundPage().then((backgroundPage) => {
        removeExistingOffenses();
        backgroundPage.reset();
      });
    }
  });
}

function removeExistingOffenses() {
  if (document.querySelector(".offenses")) {
    document.querySelector(".offenses").remove();
  }
}

function refreshExistingOffenses(backgroundPage) {
  removeExistingOffenses();
  let ul = document.createElement("ul");
  ul.className = "offenses";
  const keys = Object.keys(backgroundPage.offenses);
  for (const key of keys) {
    let li = document.createElement("li");
    li.innerHTML = key;
    ul.appendChild(li);
  }
  document.querySelector('#sites').appendChild(ul);
}

browser.runtime.getBackgroundPage().then(refreshExistingOffenses);
listenForClicks();