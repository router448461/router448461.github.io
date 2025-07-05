// script.js

// full cycle is 1.5s, we divide into two: 750ms each
const halfCycle = 1500 / 2;
const body = document.body;
const overlay = document.getElementById('region-overlay');
const pulseWord = document.getElementById('pulse-word');

// four quadrants
const regions = ['region1','region2','region3','region4'];

// sequence of words to pulse
const words = ['BLACK','&','WHITE'];
let wordIndex = 0;

setInterval(() => {
  if (body.classList.contains('black')) {
    // switch to white flash
    body.classList.replace('black','white');

    // pick random region to highlight
    const choice = regions[Math.floor(Math.random() * regions.length)];
    overlay.className = choice;

    // show next word in center
    pulseWord.textContent = words[wordIndex];
    wordIndex = (wordIndex + 1) % words.length;
  } else {
    // back to black background, hide word/overlay
    body.classList.replace('white','black');
  }
}, halfCycle);
