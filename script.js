// generate a bunch of flame spikes
const fire = document.getElementById("fire");
const COUNT = 120;

for (let i = 0; i < COUNT; i++) {
  const f = document.createElement("div");
  f.className = "flame";
  // random horizontal position
  f.style.left = Math.random() * 100 + "%";
  // random width 2–6px
  f.style.width = 2 + Math.random() * 4 + "px";
  // random height up to 120% of container
  f.style.height = 50 + Math.random() * 100 + "%";
  // random rise duration 0.8–1.5s
  const d = 0.8 + Math.random() * 0.7;
  f.style.animationDuration = `${d}s, ${d}s`;
  // random negative delay so they start at different phases
  f.style.animationDelay = `-${Math.random() * d}s, -${Math.random() * d}s`;
  fire.appendChild(f);
}
