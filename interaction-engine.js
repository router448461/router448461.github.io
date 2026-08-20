/* ROUTER 448461 interaction layer: native browser controls, fixed infrastructure, visible QR. */
(()=>{
  if(window.__routerInteractionEngineV3)return;
  window.__routerInteractionEngineV3=true;
  const style=document.createElement('style');
  style.textContent=`
    .primary,.secondary{cursor:pointer!important}
    .copy{cursor:copy!important}
    .inspect{cursor:help!important}
    .qr{display:none!important}
    .card{cursor:default!important}
    .scene{transform:none!important}
    .scene .node{animation:none!important;transform:none!important}
    .mini-qr{width:58px;height:58px;display:block;flex:none;object-fit:contain;background:#fff;border:1px solid #34453b;padding:2px;border-radius:2px}
    .row{align-items:center}
    .row .code{min-width:0}
    .row .mini-qr-wrap{display:flex;align-items:center;justify-content:center}
    @media(max-width:740px){.mini-qr{width:50px;height:50px}}
  `;
  document.head.appendChild(style);
  const cards=[...document.querySelectorAll('.card')];
  cards.forEach(card=>{
    const primary=card.querySelector('.primary');
    if(primary){
      primary.onclick=null;
      primary.href=card.dataset.u||'#';
      primary.target='_blank';
      primary.rel='noopener noreferrer';
      primary.textContent='USE REFERRAL';
    }
    const codeRow=card.querySelector('.row');
    const qrPath=card.dataset.q;
    if(codeRow&&qrPath&&!codeRow.querySelector('.mini-qr')){
      const wrap=document.createElement('span');wrap.className='mini-qr-wrap';
      const img=document.createElement('img');img.className='mini-qr';img.src=qrPath;img.alt=`${card.dataset.n||'Referral'} QR code`;img.loading='lazy';
      wrap.appendChild(img);codeRow.appendChild(wrap);
    }
    if(card.dataset.n==='COINBASE ADVANCED'){
      const foot=card.querySelector('.foot b');if(foot)foot.textContent='COINBASE ADVANCED';
    }
  });
  document.querySelectorAll('.router-cursor,.ab-handoff-overlay,.ab-handoff-label').forEach(e=>e.remove());
})();