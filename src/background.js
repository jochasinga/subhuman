// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const ORANGE = '#ff8857';
const RED = '#ff3860';
const O = '●';

let blockAll = false;

chrome.storage.sync.get('blue', (data) => {
  if (data.blue) {
    blockAll = true;
  } else {
    blockAll = false;
  }
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({green: true});
  chrome.storage.local.set({red: false});
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: '*'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.tabs.onActivated.addListener((info) => {
  chrome.storage.local.clear();
  hideBadge();
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const activeTabID = tabs[0].id;
    chrome.tabs.sendMessage(activeTabID, 'findTag');
  })
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.found !== undefined) {
    if (message.found) {
      showFoundBadge();
    } else {
      hideBadge();
    }
  } else if (message.type !== undefined) {
    const {type, data} = message;
    if (type === 'block') {
      blockAll = data;
    }
  }
  sendResponse();
  return true;
});

chrome.webRequest.onBeforeRequest.addListener((requestInfo) => {
  const drone = chrome.runtime.getURL("images/drone.png");
  if (!blockAll) {
    return {cancel: false};
  } else if (requestInfo.type === "image" && requestInfo.url !== drone) {
    return {cancel: true};
  }
}, {urls: ["<all_urls>"]}, ["blocking"]);


function showFoundBadge() {
  chrome.browserAction.setBadgeBackgroundColor({color: ORANGE});
  chrome.browserAction.setBadgeText({text: O});
  chrome.browserAction.setTitle({title: "Found a possible pixel tag"});
}

function hideBadge() {
  chrome.browserAction.setBadgeText({text: ''});
}