import { $q, on } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const btn = $q('#demoBtn');
  if(!btn) return;

  // add entrance animation
  const card = document.querySelector('.card');
  if(card) card.classList.add('animate-float');

  // demo click: pulse and temporary state
  on(btn, 'click', () => {
    btn.classList.add('btn--pulse');
    btn.disabled = true;
    setTimeout(() => {
      btn.classList.remove('btn--pulse');
      btn.disabled = false;
    }, 1200);
  });
});
