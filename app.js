const utcTime = document.getElementById("utc-time");
const probeCount = document.getElementById("probe-count");
const latency = document.getElementById("latency");
const threatLevel = document.getElementById("threat-level");
const channelCount = document.getElementById("channel-count");
const nodeCount = document.getElementById("node-count");
const incidentFeed = document.getElementById("incident-feed");

const incidents = [
  {
    time: "03:14:22Z",
    title: "Unauthorized enumeration attempt blocked",
    desc: "Remote probe path rejected at edge inspection layer."
  },
  {
    time: "04:08:11Z",
    title: "Relay path normalized",
    desc: "Transient uplink jitter returned to baseline operational range."
  },
  {
    time: "05:41:03Z",
    title: "DNS integrity verified",
    desc: "Resolver chain remained consistent across current observation window."
  },
  {
    time: "06:12:47Z",
    title: "Secure route re-established",
    desc: "Protected transit profile restored after temporary path degradation."
  },
  {
    time: "07:03:29Z",
    title: "Mesh heartbeat confirmed",
    desc: "Private overlay endpoints continued normal response cadence."
  },
  {
    time: "08:16:54Z",
    title: "External scan rate subsided",
    desc: "Background probing dropped below incident threshold window."
  }
];

function updateUtcClock() {
  const now = new Date();
  const time = now.toISOString().slice(11, 19);
  utcTime.textContent = `${time} UTC`;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateStats() {
  probeCount.textContent = String(randomBetween(18, 37));
  latency.textContent = `${randomBetween(14, 23)} ms`;
  channelCount.textContent = String(randomBetween(12, 18)).padStart(2, "0");
  nodeCount.textContent = String(randomBetween(5, 8)).padStart(2, "0");
}

function rotateThreatLevel() {
  const levels = ["LOW", "LOW", "LOW", "ELEVATED"];
  const next = levels[randomBetween(0, levels.length - 1)];
  threatLevel.textContent = next;
  threatLevel.classList.toggle("ok", next === "LOW");
}

function renderIncidents() {
  const picked = [...incidents].sort(() => Math.random() - 0.5).slice(0, 4);

  incidentFeed.innerHTML = picked
    .map(
      (item) => `
        <li>
          <span class="feed-time">${item.time}</span>
          <div>
            <div class="feed-title">${item.title}</div>
            <div class="feed-desc">${item.desc}</div>
          </div>
        </li>
      `
    )
    .join("");
}

updateUtcClock();
updateStats();
rotateThreatLevel();
renderIncidents();

setInterval(updateUtcClock, 1000);
setInterval(updateStats, 9000);
setInterval(rotateThreatLevel, 12000);
setInterval(renderIncidents, 15000);
