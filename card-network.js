(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene=document.querySelector('.scene');
  const cards=[...document.querySelectorAll('.card')];
  if(!scene||!cards.length)return;
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');
  canvas.setAttribute('aria-hidden','true');
  Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'1'});
  scene.appendChild(canvas);

  const domains=['binance.com','coinbase.com','advanced.coinbase.com','crypto.com','starlink.com'];
  cards.forEach((card,i)=>{
    card.dataset.providerDomain=domains[i]||'';
    if(!card.querySelector('.destination')){
      const label=document.createElement('span');
      label.className='destination';
      label.textContent=`OPENS · ${domains[i]||'provider'}`;
      card.appendChild(label);
    }
  });

  const style=document.createElement('style');
  style.textContent=`
    .branch{z-index:0;opacity:.92}
    .inner{position:relative;z-index:2}
    .destination{position:absolute;right:10px;top:10px;z-index:3;padding:4px 6px;border:1px solid rgba(82,97,69,.65);background:rgba(5,7,6,.9);color:#8d9878;font:6px/1 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Courier New",monospace;letter-spacing:.08em;text-transform:uppercase;opacity:0;transform:translateY(-3px);transition:opacity .2s ease,transform .2s ease}
    .card:hover .destination,.card.proximity .destination,.card:focus-visible .destination{opacity:1;transform:translateY(0)}
    .card.proximity:before{animation:cardscan 1.8s ease-out}
    .qrplate span:after{display:none!important}
    .trustbar{white-space:nowrap;overflow:hidden;text-overflow:clip}
    @media(max-width:920px){.trustbar{white-space:normal}}
    @media(max-width:600px){.destination{position:static;display:block;width:max-content;max-width:calc(100% - 20px);margin:8px auto 0;opacity:.8;transform:none}.card:hover .destination,.card.proximity .destination,.card:focus-visible .destination{opacity:1}}
  `;
  document.head.appendChild(style);

  let dpr=1,w=0,h=0,last=0,pack=[];
  const resize=()=>{
    dpr=Math.min(devicePixelRatio||1,2);
    w=innerWidth;h=innerHeight;
    canvas.width=w*dpr;canvas.height=h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const refresh=()=>{
    const now=performance.now();
    if(now-last<180)return;
    last=now;
    pack=cards.map((card,i)=>{
      const r=card.getBoundingClientRect();
      return {x:r.left+r.width/2,top:r.top,phase:i*.73,speed:.00009+i*.000009};
    });
  };
  const frame=(t)=>{
    refresh();
    ctx.clearRect(0,0,w,h);
    if(!reduce){
      for(const p of pack){
        const start=p.top-66,end=p.top;
        const q=(t*p.speed+p.phase)%1;
        const y=start+(end-start)*q;
        ctx.fillStyle='rgba(188,201,150,.72)';
        ctx.shadowBlur=7;ctx.shadowColor='rgba(128,148,91,.35)';
        ctx.fillRect(p.x-1,y-1,2,2);ctx.shadowBlur=0;
      }
    }
    requestAnimationFrame(frame);
  };
  addEventListener('resize',resize);
  resize();requestAnimationFrame(frame);
})();
