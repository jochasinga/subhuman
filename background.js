// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const ORANGE = '#ff8857';
const RED = '#ff3860';
const O = '●';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({green: true});
  chrome.storage.local.set({red: false});
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        // pageUrl: {hostEquals: 'developer.chrome.com'},
        pageUrl: {hostEquals: 'localhost'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.tabs.onActivated.addListener((info) => {
  console.log(info);
  chrome.storage.local.clear();
  hideBadge();
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const activeTabID = tabs[0].id;
    chrome.tabs.sendMessage(activeTabID, 'findTag', () => {
      console.log('sent a findTag message');
    });
  })
});

chrome.runtime.onMessage.addListener((message) => {
  console.log('background received message ' + message);
  if (message.found !== undefined) {
    if (message.found) {
      showFoundBadge();
      // chrome.runtime.sendMessage(message, () => {
      //   console.log('background sent to popup');
      // });
    } else {
      hideBadge();
    }
    // chrome.runtime.Port.disconnect();
  }
});

function showFoundBadge() {
  chrome.browserAction.setBadgeBackgroundColor({color: ORANGE});
  chrome.browserAction.setBadgeText({text: O});
  chrome.browserAction.setTitle({title: "Found a possible pixel tag"});
}

function hideBadge() {
  chrome.browserAction.setBadgeText({text: ''});
}