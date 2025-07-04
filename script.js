// 1.5s full cycle → 0.75s per half
const halfCycle = 1500 / 2;
const body = document.body;
const overlay = document.getElementById('region-overlay');

// All four quadrant classes
const regions = ['region1','region2','region3','region4'];

// Toggle body between .black/.white and pick a random region on white
setInterval(() => {
  if (body.classList.contains('black')) {
    body.classList.replace('black','white');
    const choice = regions[Math.floor(Math.random() * regions.length)];
    overlay.className = choice;
  } else {
    body.classList.replace('white','black');
  }
}, halfCycle);
