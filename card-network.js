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
  cards.forEach((card,i)=>{card.dataset.providerDomain=domains[i]||'';});

  const style=document.createElement('style');
  style.textContent=`
    .branch{z-index:3!important;opacity:.96;top:-70px;bottom:auto!important;height:70px;}
    .inner{position:relative;z-index:4}
    .destination{display:none!important}
    .card:hover .qrplate{transform:none!important}
    .qrplate span,.qrplate span:after{display:none!important}
    .network .card{will-change:transform}
  `;
  document.head.appendChild(style);

  let dpr=1,w=0,h=0,last=0,pack=[],startTime=performance.now();
  const resize=()=>{
    dpr=Math.min(devicePixelRatio||1,2);
    w=innerWidth;h=innerHeight;
    canvas.width=w*dpr;canvas.height=h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const refresh=()=>{
    const now=performance.now();
    if(now-last<120)return;
    last=now;
    pack=cards.map((card,i)=>{
      const r=card.getBoundingClientRect();
      return {x:r.left+r.width/2,top:r.top,phase:i*.16};
    });
  };
  const ease=p=>1-Math.pow(1-p,3);
  const drawBranch=(x,start,end,p,active)=>{
    if(p<=0)return;
    const q=ease(Math.min(1,p));
    const y=start+(end-start)*q;
    ctx.beginPath();
    ctx.moveTo(x,start);
    ctx.lineTo(x,y);
    ctx.strokeStyle=active?'rgba(140,157,103,.72)':'rgba(82,97,69,.46)';
    ctx.lineWidth=active?1.2:1;
    ctx.stroke();
    if(q<1){
      ctx.fillStyle='rgba(188,201,150,.78)';
      ctx.shadowBlur=8;ctx.shadowColor='rgba(128,148,91,.34)';
      ctx.fillRect(x-1.25,y-1.25,2.5,2.5);
      ctx.shadowBlur=0;
    }
  };
  const frame=(t)=>{
    refresh();
    ctx.clearRect(0,0,w,h);
    const elapsed=t-startTime;
    const duration=1500;
    const trunkP=reduce?1:Math.min(1,elapsed/500);
    const branchStart=reduce?1:Math.max(0,(elapsed-350)/1150);

    if(pack.length){
      const first=pack[0].x,lastX=pack[pack.length-1].x,cy=pack[0].top-70;
      const hubX=w/2;
      ctx.beginPath();
      ctx.moveTo(Math.min(first,hubX),cy);
      ctx.lineTo(Math.max(lastX,hubX),cy);
      ctx.strokeStyle='rgba(82,97,69,.46)';
      ctx.lineWidth=1;
      ctx.stroke();

      for(let i=0;i<pack.length;i++){
        const p=reduce?1:Math.min(1,Math.max(0,(elapsed-350-i*85)/900));
        const active=!reduce&&elapsed>1900&&i===Math.floor((elapsed/850)%pack.length);
        drawBranch(pack[i].x,cy,pack[i].top,p,active);
      }

      ctx.beginPath();ctx.arc(hubX,cy,3.5,0,Math.PI*2);
      ctx.strokeStyle='rgba(120,132,90,.86)';ctx.stroke();
      ctx.fillStyle='rgba(5,7,6,1)';ctx.fill();
      ctx.beginPath();ctx.arc(hubX,cy,1.5,0,Math.PI*2);ctx.fillStyle='rgba(157,174,119,.82)';ctx.fill();

      if(!reduce && elapsed>1900){
        const pulseIndex=Math.floor(elapsed/5200)%pack.length;
        const s=pack[pulseIndex];
        const q=((elapsed%1200)/1200);
        const y=cy+(s.top-cy)*q;
        ctx.fillStyle='rgba(198,210,160,.85)';
        ctx.shadowBlur=10;ctx.shadowColor='rgba(128,148,91,.38)';
        ctx.fillRect(s.x-1.5,y-1.5,3,3);ctx.shadowBlur=0;
      }
    }

    requestAnimationFrame(frame);
  };
  addEventListener('resize',resize);
  resize();requestAnimationFrame(frame);
})();
