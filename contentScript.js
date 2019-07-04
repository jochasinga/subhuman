if (window.Worker) {
  console.log('Worker ok');
}

let pixelTag = document.querySelector("img[width='1'], img[height='1']");

chrome.runtime.sendMessage(undefined, {
  type: 'setBadgeBackgroundColor',
  color: '#ffdb4a'
});

let sourceURL = pixelTag.src;
let sentinelImg = chrome.runtime.getURL("images/drone.png");
pixelTag.src = sentinelImg;
// pixelTag.src = 'https://i.imgur.com/dVcJU0Y.png';
pixelTag.style.width = '4rem';
pixelTag.style.height = 'auto';
pixelTag.className = "hvr-bob";

pixelTag.onclick = function(e) {
  /* Attack action */
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
};

function getRandomAngle(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

chrome.runtime.onMessage.addListener((message, _sender, _res) => {
  const {attackMode} = message;
  console.log(`got message attack moder: ${attackMode}`);
  chrome.storage.sync.set({attackMode}, function() {
    console.debug(`attack mode is now ${attackMode}`);
  });
});