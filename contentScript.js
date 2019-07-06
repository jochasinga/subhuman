chrome.storage.local.clear();

chrome.storage.local.set({green: true}, () => {
  console.log('green is go');
});
chrome.storage.local.set({red: false}, () => {
  console.log('red is no');
});

let pixelTag = document.querySelector("img[width='1'], img[height='1']");
const sourceURL = pixelTag.src;
const replaceURL = chrome.runtime.getURL("images/drone.png");
const width = '4rem';
const height = 'auto';
const className = 'hvr-bob';

function showDrone() {
  console.log('show');
  pixelTag.src = replaceURL;
  pixelTag.style.width = width;
  pixelTag.style.height = height;
  pixelTag.classList.add(className);

  pixelTag.onclick = (_e) => {
    chrome.storage.local.get(['red'], (data) => {
      if (data.red) {
        console.log('ATTACKING');
        let n = 0;
        let interval = setInterval(() => {
          if (n >= 50) {
            console.debug('done');
            clearInterval(interval);
            setTimeout(() => {
              pixelTag.className = "hvr-bob";
              pixelTag.style.filter = "hue-rotate(0deg)";
            }, 1000);
          }
          let val = getRandomAngle(0, 360);
          console.log(val);
          if (pixelTag.className !== 'hvr-buzz') {
            pixelTag.className = 'hvr-buzz';
          }
          if (val % 3 === 0) {
            pixelTag.style.filter = `brightness(${val / 360 + 0.3})`;
          } else {
            pixelTag.style.filter = `hue-rotate(${val}deg)`;
          }
          console.log(pixelTag.style.filter);
          n++;
        }, 200);

        let workerCode = `
        onmessage = function(e) {
          console.log('Worker: Message received');
          fetch(e.data[0]).then((data) => {
            this.postMessage('done fetching');
            console.log(data);
          });
        }
        `;

        /* Attack */
        if (window.Worker) {
          let URL = window.webkitURL || window.URL;
          let bb = new Blob([workerCode], {type: 'text/javascript'});
          let workerfile = URL.createObjectURL(bb);

          // Three workers for now
          // TODO: This should be configurable by the user.
          for (let n in [1, 2, 3]) {
            let myworker = new Worker(workerfile);
            myworker.postMessage([sourceURL]);
            console.log('Message posted to worker');

            myworker.onmessage = function(e) {
              let result = e.data;
              console.log('Message received from worker: ' + result);
              myworker.terminate();
            };
          }
        }
      }
    });
  };
}

function hideDrone() {
  console.log('hide');
  pixelTag.src = sourceURL;
  pixelTag.style.width = '1px';
  pixelTag.style.height = '1px';
  pixelTag.classList.remove(className);
}

// Checked
chrome.runtime.onMessage.addListener((message) => {
  console.log('receiving');
  const {type, data} = message;
  if (type === 'show') {
    if (data) {
      showDrone();
    } else {
      hideDrone();
    }
  }
});

if (pixelTag) {
  console.log('found a pixel');
  chrome.runtime.sendMessage({found: true}, () => {
    console.log('found one');
    chrome.storage.local.set({found: true});
  });
  chrome.storage.local.get(['green'], (data) => {
    if (data.green) {
      showDrone();
    }
  });
}

function getRandomAngle(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

/* Subscription to storage */
/*
chrome.storage.local.onChanged.addListener(function(changes) {
  console.log(`localStorage changing...`);
  console.log(changes);
});
*/

// chrome.runtime.onMessage.addListener((message, _sender, _res) => {
//   const {attackMode} = message;
//   console.log(`got message attack moder: ${attackMode}`);
//   chrome.storage.local.set({attackMode}, function() {
//     console.debug(`attack mode is now ${attackMode}`);
//   });
// });