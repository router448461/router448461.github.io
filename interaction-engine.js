/* ROUTER 448461 interaction layer: clean hierarchy, native controls, transparent footer. */
(()=>{
  if(window.__routerInteractionEngineV4)return;
  window.__routerInteractionEngineV4=true;
  const style=document.createElement('style');
  style.textContent=`
    .primary,.secondary{cursor:pointer!important}
    .copy{cursor:copy!important}
    .inspect{cursor:help!important}
    .qr{display:none!important}
    .card{cursor:default!important}
    .scene{transform:none!important}
    .mini-qr{width:58px;height:58px;display:block;flex:none;object-fit:contain;background:#fff;border:1px solid #34453b;padding:2px;border-radius:2px}
    .row{align-items:center}
    .row .code{min-width:0}
    .row .mini-qr-wrap{display:flex;align-items:center;justify-content:center}
    .bottom{gap:12px;white-space:nowrap}
    .bottom span{opacity:.82}
    @media(max-width:740px){.mini-qr{width:50px;height:50px}.bottom{font-size:3px;white-space:normal;line-height:1.5}}
  `;
  document.head.appendChild(style);
  const cards=[...document.querySelectorAll('.card')];
  cards.forEach(card=>{
    const primary=card.querySelector('.primary');
    if(primary){primary.onclick=null;primary.href=card.dataset.u||'#';primary.target='_blank';primary.rel='noopener noreferrer';primary.textContent='USE REFERRAL'}
    const codeRow=card.querySelector('.row'),qrPath=card.dataset.q;
    if(codeRow&&qrPath&&!codeRow.querySelector('.mini-qr')){
      const wrap=document.createElement('span');wrap.className='mini-qr-wrap';
      const img=document.createElement('img');img.className='mini-qr';img.src=qrPath;img.alt=`${card.dataset.n||'Referral'} QR code`;img.loading='lazy';wrap.appendChild(img);codeRow.appendChild(wrap)
    }
    if(card.dataset.n==='COINBASE ADVANCED'){const foot=card.querySelector('.foot b');if(foot)foot.textContent='COINBASE ADVANCED'}
  });
  const heroCount=document.querySelector('.count');if(heroCount)heroCount.textContent=`${cards.length.toString().padStart(2,'0')} / ACCESS NODES`;
  const bottom=document.querySelector('.bottom');
  if(bottom){
    bottom.innerHTML='<span>INDEPENDENT DIRECTORY · AUSTRALIA</span><span>REFERRAL DISCLOSURE · DIRECT ACCESS AVAILABLE</span>';
    bottom.setAttribute('aria-label','Independent directory. Referral relationships disclosed. Direct access available.');
  }
  const head=document.querySelector('.head span');if(head)head.textContent='DIRECT // REFERRAL // QR';
})();
