let changeColor = document.getElementById('changeColor');
let red = document.getElementById('red');

let exposeSwitch = document.getElementById('exposeSwitch');
let attackSwitch = document.getElementById('attackSwitch');
let disclaimer = document.getElementById('attackDisclaimer');

exposeSwitch.onchange = function(e) {
  console.log('expose toggled', e, exposeSwitch.checked);
  let state = exposeSwitch.checked;
  chrome.browserAction.setBadgeBackgroundColor({color: '#ff8857'});
  let text = '';
  if (!state) {
    attackSwitch.checked = false;
  } else {
    text = '☀';
  }
  chrome.browserAction.setBadgeText({text});
}

attackSwitch.onchange = function(e) {
  console.log('attack toggled', e, attackSwitch.checked);
  attackDisclaimer.classList.toggle('is-hidden');
  let state = attackSwitch.checked;
  if (state) {
    exposeSwitch.checked = state;
    chrome.browserAction.setBadgeBackgroundColor({color: '#ff3860'});
    chrome.browserAction.setBadgeText({text: 'A'});
  } else {
    chrome.browserAction.setBadgeText({text: ''});
  }



  // send message to contentScript
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {attackMode: true});

  });

};

chrome.storage.sync.get('color', function(data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});


changeColor.onclick = function(element) {
  let color = element.target.value;
  let code = `document.body.style.backgroundColor = "${color}";`
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: code});
  });
};

red.onclick = function(element) {
  let workerCode = `
onmessage = function(e) {
  console.log('Worker: Message received from main script');
  let result = e.data[0] * e.data[1];
  console.log('result...', result);
  if (isNaN(result)) {
    console.log('NaN warning');
    postMessage('Please write two numbers');
  } else {
    let workerResult = 'Result: ' + result;
    console.log('Worker: Posting message back to main script');
    postMessage(workerResult);
  }
}
`;

  let code = `
if (window.Worker) {
  let URL = window.webkitURL || window.URL;
  let bb = new Blob([${workerCode}], {type: 'text/javascript'});
  let workerCode = URL.createObjectURL(bb);
  let myWorker = new Worker(workerCode);
  myWorker.postMessage([10, 20]);
  console.log('Message posted to worker');

  myWorker.onmessage = function(e) {
    result.textContent = e.data;
    console.log('Message received from worker');
    myWorker.terminate();
  };
}
`;
  chrome.windows.getCurrent({populate: true}, function(win) {
    console.log('current win');
    console.log(win);
  });
  /*
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: code});
  }); */
  chrome.runtime.onMessage.addListener((message, _sender, _res) => {
    const {type} = message;
    if (type === 'setBadgeBackgroundColor') {
      console.log('setting yellow bg');
      const {color} = message;
      chrome.browserAction.setBadgeBackgroundColor({color});
    }
  });
};
