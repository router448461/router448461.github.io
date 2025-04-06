export function initSensorModeToggle() {
  const btn = document.createElement('button');
  btn.id = 'sensorToggle';
  btn.innerText = 'Toggle Sensor Mode';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => {
    const map = document.getElementById('map');
    map.classList.toggle('infrared-mode');
  });
}
