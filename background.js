// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  // chrome.storage.sync.set({color: '#3aa757'}, function() {
  //   console.log("The color is green.");
  // });

  // chrome.storage.sync.set({attackMode: false}, function() {
  //   console.log('Attack Mode switched off by default');
  // });

  // chrome.storage.sync.set({found: false}, function() {
  //   console.log('Expose on by default');
  // });

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

// chrome.runtime.onMessage.addListener(function(message, _sender, _res) {
//   console.log('HERE');
//   const {type} = message;
//   if (type === 'setBadgeBackgroundColor') {
//     console.log('setting orange bg');
//     const {text, color} = message;
//     chrome.browserAction.setBadgeBackgroundColor({color});
//     chrome.browserAction.setBadgeText({text});
//   }
// });
