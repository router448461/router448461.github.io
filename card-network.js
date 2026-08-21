(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene=document.querySelector('.scene');
  if(!scene)return;
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');
  canvas.setAttribute('aria-hidden','true');
  Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'1'});
  scene.appendChild(canvas);
  let dpr=1,w=0,h=0,last=0,pack=[];
  const cards=()=>[...document.querySelectorAll('.card')];
  const resize=()=>{
    dpr=Math.min(devicePixelRatio||1,2);
    w=innerWidth; h=innerHeight;
    canvas.width=w*dpr; canvas.height=h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const refresh=()=>{
    const now=performance.now();
    if(now-last<500)return;
    last=now;
    pack=cards().map((card,i)=>{
      const r=card.getBoundingClientRect();
      return {x:r.left+r.width/2,top:r.top,phase:i*1.73+Math.random()*1.4,speed:.000075+Math.random()*.00006};
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
        ctx.fillStyle='rgba(188,201,150,.68)';
        ctx.shadowBlur=7;
        ctx.shadowColor='rgba(128,148,91,.35)';
        ctx.fillRect(p.x-1,y-1,2,2);
        ctx.shadowBlur=0;
      }
    }
    requestAnimationFrame(frame);
  };
  addEventListener('resize',resize);
  resize();
  requestAnimationFrame(frame);
})();
