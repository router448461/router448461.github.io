/* ROUTER 448461 background: distributed adaptive network, non-linear traffic field. */
(()=>{
  const scene=document.querySelector('.scene'),svg=scene?.querySelector('svg');
  if(!svg)return;
  const old=svg.querySelector('#adaptive-bg');if(old)old.remove();
  const NS='http://www.w3.org/2000/svg';
  const g=document.createElementNS(NS,'g');g.id='adaptive-bg';g.setAttribute('aria-hidden','true');svg.appendChild(g);
  const style=document.createElementNS(NS,'style');
  style.textContent=`
    .scene{transform:none!important}
    .scene .node,.scene .route,.scene .net,.scene .falcon,.scene .core,.scene .ai,.scene .orb{animation:none!important}
    #adaptive-bg .link{fill:none;stroke:#91a58a;stroke-width:.52;opacity:.075;stroke-linecap:round;transition:opacity 500ms}
    #adaptive-bg .link.long{stroke:#7f9d8d;opacity:.035}
    #adaptive-bg .link.hot{opacity:.3}
    #adaptive-bg .nodeDot{fill:#b7c6b1;opacity:.15}
    #adaptive-bg .nodeDot.hot{fill:#c8ff3d;opacity:.55}
    #adaptive-bg .hubDot{fill:#dce7d9;opacity:.25}
    #adaptive-bg .packet{opacity:.55}
    #adaptive-bg .pulse{fill:none;stroke:#c8ff3d;stroke-width:.45;opacity:0;transform-box:fill-box;transform-origin:center;animation:routerPulse 3.8s ease-out forwards}
    #adaptive-bg .scan{stroke:#c8ff3d;stroke-width:.45;opacity:0;animation:routerScan 3.2s ease-out forwards}
    #adaptive-bg .ring{fill:none;stroke:#92a98f;stroke-width:.35;stroke-dasharray:2 24;opacity:.055;transform-origin:800px 450px;animation:routerSpin 38s linear infinite}
    #adaptive-bg .ring.r2{stroke:#c8ff3d;opacity:.06;animation-duration:27s;animation-direction:reverse}
    @keyframes routerPulse{0%{opacity:0;transform:scale(.35)}22%{opacity:.26}100%{opacity:0;transform:scale(2.7)}}
    @keyframes routerScan{0%{opacity:0;transform:translateY(-180px)}15%{opacity:.075}78%{opacity:.025}100%{opacity:0;transform:translateY(1080px)}}
    @keyframes routerSpin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){#adaptive-bg .pulse,#adaptive-bg .scan,#adaptive-bg .ring{animation:none!important}}
  `;
  svg.appendChild(style);
  const rand=()=>{try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}catch{return Math.random()}};
  const el=(tag,a={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);return e};
  const W=1600,H=900,N=72,colors=['#c8ff3d','#f0c933','#4e8cff','#8ab1ff','#5ca8ff','#dbe5df'];
  const nodes=[];
  const relax=()=>{
    for(let pass=0;pass<5;pass++){
      for(const n of nodes){
        let fx=0,fy=0;
        for(const m of nodes){if(n===m)continue;const dx=n.x-m.x,dy=n.y-m.y,d2=dx*dx+dy*dy;if(d2<9000&&d2>20){const f=(95-d2**.5)/95;fx+=(dx/(d2**.5))*f*9;fy+=(dy/(d2**.5))*f*9}}
        n.x=Math.max(35,Math.min(W-35,n.x+fx));n.y=Math.max(75,Math.min(H-35,n.y+fy));
      }
    }
  };
  for(let i=0;i<N;i++){nodes.push({x:70+rand()*1460,y:95+rand()*750,r:rand()>.88?2.3:1.25,links:[]})}
  relax();
  const linksG=el('g'),nodesG=el('g'),packetsG=el('g'),effectsG=el('g');g.append(linksG,nodesG,packetsG,effectsG);
  const links=[];
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  for(let i=0;i<N;i++){
    const near=nodes.filter((_,j)=>j!==i).sort((a,b)=>distance(nodes[i],a)-distance(nodes[i],b));
    const degree=2+(rand()>.45?1:0)+(rand()>.85?1:0);
    for(let k=0;k<degree;k++){
      const b=near[k];if(!b||nodes[i].links.includes(b))continue;
      const already=b.links.includes(nodes[i]);if(already)continue;
      nodes[i].links.push(b);b.links.push(nodes[i]);
      const long=distance(nodes[i],b)>360;
      const p=el('path',{class:long?'link long':'link',stroke:colors[(i+k)%colors.length]});
      linksG.appendChild(p);links.push({a:nodes[i],b,p,long});
    }
  }
  const redraw=()=>{
    for(const q of links){
      const mx=(q.a.x+q.b.x)/2,my=(q.a.y+q.b.y)/2,dx=q.b.x-q.a.x,dy=q.b.y-q.a.y,len=Math.hypot(dx,dy)||1,px=-dy/len,py=dx/len,curve=(rand()-.5)*(q.long?90:44);
      q.p.setAttribute('d',`M${q.a.x.toFixed(1)} ${q.a.y.toFixed(1)} Q${(mx+px*curve).toFixed(1)} ${(my+py*curve).toFixed(1)} ${q.b.x.toFixed(1)} ${q.b.y.toFixed(1)}`);
    }
  };
  redraw();
  for(const n of nodes)nodesG.appendChild(el('circle',{cx:n.x,cy:n.y,r:n.r,class:'nodeDot'}));
  const packets=[];
  const routePath=(a,b)=>{const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,px=-dy/len,py=dx/len,curve=(rand()-.5)*44;return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${(mx+px*curve).toFixed(1)} ${(my+py*curve).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`};
  for(let i=0;i<22;i++){
    const a=nodes[Math.floor(rand()*N)],b=a.links[Math.floor(rand()*a.links.length)];if(!b)continue;
    const p=el('circle',{r:1.25,class:'packet',fill:colors[i%colors.length]});
    const m=el('animateMotion',{repeatCount:'indefinite',dur:(3.8+rand()*8.5).toFixed(1)+'s',begin:(rand()*6).toFixed(2)+'s',path:routePath(a,b)});
    p.appendChild(m);packetsG.appendChild(p);packets.push({p,m,a});
  }
  g.append(el('circle',{cx:800,cy:450,r:280,class:'ring'}),el('circle',{cx:800,cy:450,r:170,class:'ring r2'}));
  function retarget(){
    for(const q of packets){const a=nodes[Math.floor(rand()*N)],b=a.links[Math.floor(rand()*a.links.length)];if(b){q.a=a;q.m.setAttribute('path',routePath(a,b));q.m.setAttribute('dur',(3.5+rand()*9).toFixed(1)+'s');q.m.setAttribute('begin',(rand()*5).toFixed(2)+'s')}}
  }
  function activity(){
    const count=1+Math.floor(rand()*5);
    for(let i=0;i<count;i++){
      const idx=Math.floor(rand()*N),n=nodes[idx],dot=nodesG.children[idx];
      if(dot){dot.classList.add('hot');setTimeout(()=>dot.classList.remove('hot'),350+rand()*1500)}
      const pulse=el('circle',{cx:n.x,cy:n.y,r:4+rand()*7,class:'pulse'});effectsG.appendChild(pulse);setTimeout(()=>pulse.remove(),3900);
      const candidates=links.filter(q=>q.a===n||q.b===n);for(let k=0;k<Math.min(candidates.length,2+Math.floor(rand()*3));k++){const q=candidates[Math.floor(rand()*candidates.length)];q.p.classList.add('hot');setTimeout(()=>q.p.classList.remove('hot'),300+rand()*1200)}
    }
  }
  function scan(){const s=el('line',{x1:0,y1:0,x2:W,y2:0,class:'scan'});effectsG.appendChild(s);setTimeout(()=>s.remove(),3300)}
  function jitter(){
    for(const n of nodes){if(rand()<.18){n.x=Math.max(30,Math.min(W-30,n.x+(rand()-.5)*14));n.y=Math.max(70,Math.min(H-30,n.y+(rand()-.5)*14))}}
    redraw();retarget();
  }
  function pulse(){
    retarget();if(rand()>.18)activity();if(rand()>.82)scan();if(rand()>.58)jitter();setTimeout(pulse,1800+rand()*9000)
  }
  setTimeout(pulse,900+rand()*2000);
})();
