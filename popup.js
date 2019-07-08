let changeColor = document.getElementById('changeColor');
let red = document.getElementById('red');
let exposeSwitch = document.getElementById('exposeSwitch');
let exposeLabel = document.getElementById('exposeLabel');
let attackSwitch = document.getElementById('attackSwitch');
let blockSwitch = document.getElementById('blockSwitch');
let disclaimer = document.getElementById('attackDisclaimer');

chrome.storage.local.get('green', (data) => {
  exposeSwitch.checked = data.green;
  exposeSwitchOn();
});

chrome.storage.local.get('red', (data) => {
  if (data.red) {
    attackSwitchOn();
  } else {
    attackSwitchOff();
  }
});

chrome.storage.sync.get('blue', (data) => {
  if (data.blue) {
    blockSwitchOn();
  } else {
    blockSwitchOff();
  }
});

const ORANGE = '#ff8857';
const RED = '#ff3860';
const O = '●';

/* Helpers */

// Send message to the active current tab.
function messageContentScript(type, data) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log('sending data to content script at tab ' + tabs[0].id);
    chrome.tabs.sendMessage(tabs[0].id, {type, data});
  });
}

function messageBackground(type, data) {
  chrome.runtime.sendMessage({type, data});
}

function hideBadge() {
  chrome.browserAction.setBadgeText({text: ''});
}

function showFoundBadge() {
  chrome.browserAction.setBadgeBackgroundColor({color: ORANGE});
  chrome.browserAction.setBadgeText({text: O});
  chrome.browserAction.setTitle({title: "Found a possible pixel tag"});
}

function showAttackBadge() {
  chrome.browserAction.setBadgeBackgroundColor({color: RED});
  chrome.browserAction.setBadgeText({text: O});
  chrome.browserAction.setTitle({title: "Ready for retaliation"});
}

function hideAttackBadge() {
  chrome.storage.local.get(['found'], (data) => {
    if (data.found) {
      showFoundBadge();
    } else {
      hideBadge();
    }
  });
}

chrome.runtime.onMessage.addListener((message) => {
  console.log('message did receive');
  if (message.found) {
    console.log('found one, better light up');
    showFoundBadge();
  }
});

/* Switch handlers */
exposeSwitch.onchange = (e) => {
  let isChecked = exposeSwitch.checked;
  console.log('exposeSwitch ', isChecked);
  if (isChecked) {
    exposeSwitchOn();
  } else {
    exposeSwitchOff();
  }
}

function exposeSwitchOff() {
  exposeSwitch.checked = false;
  attackSwitchOff();
  messageContentScript('show', false);
  chrome.storage.local.set({green: false});
}

function exposeSwitchOn() {
  exposeSwitch.checked = true;
  messageContentScript('show', true);
  chrome.storage.local.set({green: true});
}

function blockSwitchOn() {
  blockSwitch.checked = true;
  chrome.storage.sync.set({blue: true});
  messageBackground('block', true);

}

function blockSwitchOff() {
  blockSwitch.checked = false;
  chrome.storage.sync.set({blue: false});
  messageBackground('block', false);
}

function attackSwitchOff() {
  console.log('attackSwitchOff');
  attackSwitch.checked = false;
  attackDisclaimer.classList.add('is-hidden');
  hideAttackBadge();
  chrome.storage.local.set({red: false});
  messageContentScript('attacking', false);
}

function attackSwitchOn() {
  console.log('attackSwitchOn');
  attackSwitch.checked = true;
  attackDisclaimer.classList.remove('is-hidden');
  exposeSwitchOn();
  showAttackBadge();
  chrome.storage.local.set({red: true});
  messageContentScript('attacking', true);
}

attackSwitch.onchange = function(e) {
  // Toggle more info
  let isChecked = attackSwitch.checked;
  console.log('red: ', isChecked);
  if (isChecked) {
    attackSwitchOn();
  } else {
    attackSwitchOff();
  }
};

blockSwitch.onchange = function(e) {
  let isChecked = blockSwitch.checked;
  if (isChecked) {
    blockSwitchOn();
  } else {
    blockSwitchOff();
  }
}

/* Init */

// Set the switch label
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  let URL = webkitURL || URL;
  let currentURL = new URL(tabs[0].url);
  exposeLabel.innerText = 'Expose tracked pixel on ' + currentURL.hostname;
});
