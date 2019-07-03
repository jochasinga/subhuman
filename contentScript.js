if (window.Worker) {
  console.log('Worker ok');
}

let pixelTag = document.querySelector("img[width='1'], img[height='1']")
let src = pixelTag.src;
console.log(src);
// let chromeLogo = document.querySelector("img[alt='Chrome: developer']");
let sentinelImg = chrome.runtime.getURL("images/drone.png");
pixelTag.src = 'https://i.imgur.com/dVcJU0Y.png';
// pixelTag.src = sentinelImg;
pixelTag.style.width = '4rem';
pixelTag.style.height = 'auto';
pixelTag.className = "hvr-bob";


pixelTag.onclick = function(e) {
  console.log(e);
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

  // fetch(src).then((img) => {
  //   console.log(img);
  // });
};

function getRandomAngle(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}