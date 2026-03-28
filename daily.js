// --- DAILY UNLOCK SYSTEM ---------------------------------------------

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function loadProgress() {
  return JSON.parse(localStorage.getItem("tsurvival-progress") || "{}");
}

function saveProgress(p) {
  localStorage.setItem("tsurvival-progress", JSON.stringify(p));
}

function dailyUnlockInit(totalCards) {
  const key = getTodayKey();
  const progress = loadProgress();

  if (!progress[key]) {
    progress[key] = true;
    progress.count = (progress.count || 0) + 1;
    saveProgress(progress);
  }

  return Math.min(progress.count || 1, totalCards);
}
