// --- CONTENT -----------------------------------------------------------

const SECTIONS = [
  {
    title: "Vulnerability Map",
    body: `
<strong>Fuel:</strong> 100% shipped; short buffers; highest exposure.<br>
<strong>Food:</strong> Net exporter; strong water; limited by fuel.<br>
<strong>Medicine:</strong> Import‑dependent; weeks–months of stock.<br>
<strong>Industry:</strong> Strong minerals; weak heavy steel; import‑linked.`,
    risk: "warn"
  },
  {
    title: "Survival Time If Cut Off",
    body: `
<strong>Fuel:</strong> Weeks before logistics degrade.<br>
<strong>Food & Water:</strong> Months+ if distribution holds.<br>
<strong>Medicine:</strong> Early stress; chronic care hit first.<br>
<strong>Energy:</strong> Hydro + wind = medium‑term resilience.`,
    risk: "warn"
  },
  {
    title: "Order of Collapse",
    body: `
1. Fuel‑intensive logistics.<br>
2. Medicine + import retail.<br>
3. Advanced manufacturing.<br>
4. Export industries.<br>
5. Core food/water/power.`,
    risk: "warn"
  },
  {
    title: "WWII vs Modern Supply Chains",
    body: `
WWII: Tasmania was a support node (zinc, industry).<br>
Modern: Globalised, fast, fragile; medicine + fuel highly exposed.`,
    risk: "warn"
  },
  {
    title: "Future Importance",
    body: `
<strong>Refuge strengths:</strong> water, food, renewables, distance.<br>
<strong>Weakness:</strong> fuel, medicine, heavy industry.<br>
Tasmania = resilient refuge, not sealed fortress.`,
    risk: "warn"
  }
];

// --- DOM ---------------------------------------------------------------

const stream = document.getElementById("stream");
const nextBtn = document.getElementById("next");
const allBtn = document.getElementById("all");

const INTERVAL = 9000;

// --- DAILY UNLOCK ------------------------------------------------------

let index = dailyUnlockInit(SECTIONS.length);

// Render initial unlocked cards
for (let i = 0; i < index; i++) revealNext();

// --- AUTO REVEAL -------------------------------------------------------

let timer = setInterval(revealNext, INTERVAL);

// --- FUNCTIONS ---------------------------------------------------------

function revealNext() {
  if (index >= SECTIONS.length) {
    clearInterval(timer);
    return;
  }

  const s = SECTIONS[index++];
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="card-title">${s.title}</div>
    <div class="card-body">${s.body}</div>
    <div class="risk ${s.risk}">${s.risk.toUpperCase()} RISK</div>
  `;

  stream.appendChild(card);
  stream.scrollTop = stream.scrollHeight;
}

function revealAll() {
  clearInterval(timer);
  while (index < SECTIONS.length) revealNext();
}

// --- EVENTS ------------------------------------------------------------

nextBtn.onclick = () => {
  clearInterval(timer);
  revealNext();
};

allBtn.onclick = revealAll;
