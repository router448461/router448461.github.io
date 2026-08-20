/* ROUTER 448461 stochastic network engine: fixed infrastructure, changing traffic. */
(()=>{
  const scene=document.querySelector('.scene');
  const svg=scene?.querySelector('svg');
  if(!svg)return;
  const old=svg.querySelector('#adaptive-bg');
  if(old)old.remove();
  document.querySelectorAll('.ab-handoff-overlay,.ab-handoff-label').forEach(e=>e.remove());
  const NS='http://www.w3.org/2000/svg';
  const g=document.createElementNS(NS,'g');
  g.id='adaptive-bg';
  g.dataset.engine='v15';
  g.setAttribute('aria-hidden','true');
  svg.appendChild(g);
  const css=document.createElement('style');
  css.textContent=`
    #adaptive-bg .ab-link{fill:none;stroke:#9fb69a;stroke-width:.42;stroke-dasharray:2 19;opacity:.055;transition:opacity .7s}
    #adaptive-bg .ab-link.hot{opacity:.28}
    #adaptive-bg .ab-route{fill:none;stroke-width:.9;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:8 27;opacity:.075;transition:opacity 1.15s}
    #adaptive-bg .ab-route.active{opacity:.72}
    #adaptive-bg .ab-relay{fill:#b8c9b1;opacity:.065}
    #adaptive-bg .ab-relay.hot{fill:#c8ff3d;opacity:.35}
    #adaptive-bg .ab-relay.dim{opacity:.018}
    #adaptive-bg .ab-packet{opacity:.58;filter:url(#blur2)}
    #adaptive-bg .ab-packet.slow{opacity:.38}
    #adaptive-bg .ab-packet.handoff{opacity:1;filter:url(#blur)}
    #adaptive-bg .ab-memory{fill:none;stroke:#d6e2d2;stroke-width:.4;opacity:0}
    #adaptive-bg .ab-memory.show{animation:ab-memory 4.8s ease-out forwards}
    #adaptive-bg .ab-burst{fill:#dce7d9;opacity:0;animation:ab-burst 1.1s ease-out forwards}
    #adaptive-bg .ab-core-ring{fill:none;stroke:#9fb69a;stroke-width:.43;stroke-dasharray:2 21;opacity:.10;transform-origin:800px 450px;animation:ab-spin 32s linear infinite}
    #adaptive-bg .ab-core-ring.r2{stroke:#c8ff3d;stroke-dasharray:1 29;opacity:.13;animation-duration:23s;animation-direction:reverse}
    #adaptive-bg .ab-scan{stroke:#c8ff3d;stroke-width:.55;opacity:0;animation:ab-scan 2.7s ease-out forwards}
    #adaptive-bg .ab-starlink-orbit{fill:none;stroke:#dbe5df;stroke-width:.4;stroke-dasharray:2 20;opacity:.065}
    #adaptive-bg .ab-depth{fill:none;stroke:#9fb69a;stroke-width:.32;opacity:.035;filter:url(#blur2)}
    @keyframes ab-memory{0%{opacity:.22;transform:scale(.55)}100%{opacity:0;transform:scale(2.05)}}
    @keyframes ab-burst{0%{opacity:0;transform:scale(.3)}28%{opacity:.4}100%{opacity:0;transform:scale(2)}}
    @keyframes ab-scan{0%{opacity:0;transform:translateY(-160px)}25%{opacity:.11}76%{opacity:.045}100%{opacity:0;transform:translateY(980px)}}
    @keyframes ab-spin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){#adaptive-bg .ab-memory.show,#adaptive-bg .ab-burst,#adaptive-bg .ab-core-ring,#adaptive-bg .ab-scan{animation:none!important}}
    @media(max-width:740px){#adaptive-bg .ab-relay{opacity:.05}#adaptive-bg .ab-link{opacity:.035}}
  `;
  svg.appendChild(css);
  const rand=()=>{try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}catch{return Math.random()}};
  const make=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e};
  const anchors=[[160,195],[1440,195],[150,790],[1450,790],[800,790]];
  const colours=['#f0c933','#4e8cff','#8ab1ff','#5ca8ff','#dbe5df'];
  const personality=[{bend:76,speed:5.2},{bend:48,speed:5.9},{bend:96,speed:6.7},{bend:62,speed:5.5},{bend:126,speed:7.1}];
  const relayGroup=make('g'),linkGroup=make('g'),routeGroup=make('g'),packetGroup=make('g'),memoryGroup=make('g'),burstGroup=make('g'),depthGroup=make('g'),scanGroup=make('g');
  g.append(depthGroup,relayGroup,linkGroup,routeGroup,packetGroup,memoryGroup,burstGroup,scanGroup);
  const relays=[];
  for(let i=0;i<36;i++){
    let x=90+rand()*1420,y=110+rand()*680;
    if(Math.hypot(x-800,y-450)<135){x+=x<800?-150:150;y+=y<450?-90:90}
    const hot=i%17===0;
    const r=make('rect',{x:x.toFixed(1),y:y.toFixed(1),width:hot?5:3,height:hot?5:3,rx:'1',class:hot?'ab-relay hot':'ab-relay'});
    relayGroup.appendChild(r);
    relays.push({x,y,el:r});
  }
  for(let i=0;i<8;i++){
    const x=120+i*190,y=150+(i%3)*250;
    depthGroup.appendChild(make('path',{d:`M${x} ${y} C${x+80} ${y-55} ${x+150} ${y+65} ${x+235} ${y}`,class:'ab-depth'}));
  }
  g.appendChild(make('ellipse',{cx:800,cy:450,rx:398,ry:158,class:'ab-starlink-orbit'}));
  const pathFor=(i,v)=>{
    const [ex,ey]=anchors[i],sx=800,sy=450,vx=ex-sx,vy=ey-sy,len=Math.hypot(vx,vy)||1,px=-vy/len,py=vx/len;
    const sign=v%2?-1:1,bend=(personality[i].bend+v*22)*sign,skew=(rand()-.5)*26;
    const c1=[sx+vx*.18+px*bend+skew,sy+vy*.18+py*bend-skew*.25];
    const c2=[sx+vx*.47-px*bend*.56-skew,sy+vy*.47-py*bend*.56+skew*.25];
    const c3=[sx+vx*.75+px*bend*.34+skew*.4,sy+vy*.75+py*bend*.34-skew*.2];
    return `M${sx} ${sy} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c3[0].toFixed(1)} ${c3[1].toFixed(1)} S${ex} ${ey} ${ex} ${ey}`;
  };
  const fixedPoints=relays.map(r=>({x:r.x,y:r.y}));
  const linkEls=[];
  function rewire(){
    const shuffled=fixedPoints.slice().sort(()=>rand()-.5);
    if(linkEls.length===0){
      for(let i=0;i<relays.length;i++){
        const l=make('path',{class:'ab-link'});linkGroup.appendChild(l);linkEls.push(l);
      }
    }
    linkEls.forEach((l,i)=>{
      const a=shuffled[i%shuffled.length],b=shuffled[(i*7+3)%shuffled.length],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      const bendA=28+rand()*70,bendB=28+rand()*70,offset=(rand()-.5)*55;
      l.setAttribute('d',`M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${mx.toFixed(1)} ${(my-bendA).toFixed(1)} ${(mx+offset).toFixed(1)} ${(my+bendB).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      l.classList.toggle('hot',rand()>.86);
    });
  }
  const routeVariants=[];
  const packets=[];
  for(let i=0;i<5;i++){
    routeVariants[i]=[];
    for(let v=0;v<5;v++){
      const p=make('path',{class:'ab-route',stroke:colours[i],d:pathFor(i,v)});routeGroup.appendChild(p);routeVariants[i].push(p);
    }
    const count=i===4?2:3;
    for(let k=0;k<count;k++){
      const dot=make('circle',{r:i===4?'3.4':k===0?'3.1':'2.1',class:`ab-packet ${i===4?'slow':''}`,fill:colours[i]});
      const m=make('animateMotion',{repeatCount:'indefinite',dur:(personality[i].speed+rand()*3.2).toFixed(1)+'s',path:pathFor(i,Math.floor(rand()*5)),begin:(rand()*3.8).toFixed(2)+'s'});
      dot.appendChild(m);dot.dataset.route=i;packetGroup.appendChild(dot);packets.push(dot);
    }
  }
  g.append(make('circle',{cx:800,cy:450,r:238,class:'ab-core-ring'}),make('circle',{cx:800,cy:450,r:164,class:'ab-core-ring r2'}));
  const state={focus:-1,activeVariant:[0,0,0,0,0]};
  function rebuildRoutes(){
    for(let i=0;i<5;i++)for(let v=0;v<5;v++)routeVariants[i][v].setAttribute('d',pathFor(i,v));
  }
  function focus(index){
    state.focus=index;
    for(let i=0;i<5;i++)for(let v=0;v<5;v++)routeVariants[i][v].style.opacity=index<0?'.075':(i===index&&v===state.activeVariant[i]?'.72':'.014');
    relays.forEach((r,i)=>r.el.classList.toggle('dim',index>=0&&i%5!==index));
  }
  function packetDecision(){
    rebuildRoutes();
    for(const p of packets){
      const r=Number(p.dataset.route),v=Math.floor(rand()*5),m=p.firstElementChild;
      m.setAttribute('path',pathFor(r,v));m.setAttribute('dur',(personality[r].speed+1+rand()*6).toFixed(1)+'s');m.setAttribute('begin',(rand()*3.5).toFixed(2)+'s');p.style.opacity=(.22+rand()*.62).toFixed(2);
    }
    for(let i=0;i<5;i++)state.activeVariant[i]=Math.floor(rand()*5);
    focus(state.focus);
  }
  function relayPulse(){
    const n=1+Math.floor(rand()*3);
    for(let i=0;i<n;i++){
      const r=relays[Math.floor(rand()*relays.length)];r.el.classList.add('hot');
      setTimeout(()=>r.el.classList.remove('hot'),280+rand()*1300);
      const c=make('circle',{cx:r.x,cy:r.y,r:(5+rand()*9).toFixed(1),class:'ab-memory show'});memoryGroup.appendChild(c);setTimeout(()=>c.remove(),4900);
    }
  }
  function linkPulse(){
    const n=1+Math.floor(rand()*5);
    for(let i=0;i<n;i++){const l=linkEls[Math.floor(rand()*linkEls.length)];l.classList.add('hot');setTimeout(()=>l.classList.remove('hot'),250+rand()*1600)}
  }
  function burst(){
    const n=3+Math.floor(rand()*8);
    for(let i=0;i<n;i++){const r=relays[Math.floor(rand()*relays.length)];const q=make('rect',{x:r.x-2,y:r.y-2,width:'4',height:'4',class:'ab-burst'});burstGroup.appendChild(q);setTimeout(()=>q.remove(),1200)}
  }
  function scan(){const s=make('line',{x1:'0',y1:'0',x2:'1600',y2:'0',class:'ab-scan'});scanGroup.appendChild(s);setTimeout(()=>s.remove(),2850)}
  function split(){const source=packets[Math.floor(rand()*packets.length)],clone=source.cloneNode(true);clone.style.opacity='.26';clone.dataset.route=source.dataset.route;packetGroup.appendChild(clone);const m=clone.firstElementChild;m.setAttribute('path',pathFor(Number(clone.dataset.route),Math.floor(rand()*5)));m.setAttribute('dur',(3.8+rand()*5.6).toFixed(1)+'s');m.setAttribute('begin','0s');setTimeout(()=>clone.remove(),700+rand()*1700)}
  const schedule=()=>setTimeout(()=>{const r=rand();if(r>.18)packetDecision();if(r>.36)relayPulse();if(r>.52)linkPulse();if(r>.67)rewire();if(r>.80)burst();if(r>.88)scan();if(r>.94)split();schedule()},3200+rand()*16500);
  rewire();packetDecision();
  setTimeout(schedule,1400+rand()*2500);
  document.querySelectorAll('.card').forEach((c,i)=>{c.addEventListener('mouseenter',()=>focus(i));c.addEventListener('focusin',()=>focus(i));c.addEventListener('mouseleave',()=>focus(-1))});
  window.__routerSetFocus=focus;
})();