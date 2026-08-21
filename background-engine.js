/* ROUTER 448461 background: fixed infrastructure, stochastic traffic, no cursor or node movement. */
(()=>{
  const scene=document.querySelector('.scene'),svg=scene?.querySelector('svg');
  if(!svg)return;
  const old=svg.querySelector('#adaptive-bg');if(old)old.remove();
  const NS='http://www.w3.org/2000/svg',g=document.createElementNS(NS,'g');g.id='adaptive-bg';g.setAttribute('aria-hidden','true');svg.appendChild(g);
  const style=document.createElement('style');style.textContent=`
    .scene{transform:none!important}
    .scene .node{animation:none!important;transform:none!important}
    #adaptive-bg .wire{fill:none;stroke:#91a58a;stroke-width:.42;stroke-dasharray:2 20;opacity:.055;transition:opacity 700ms}
    #adaptive-bg .wire.hot{opacity:.28}
    #adaptive-bg .path{fill:none;stroke-width:.85;stroke-linecap:round;stroke-dasharray:7 28;opacity:.075;transition:opacity 900ms}
    #adaptive-bg .path.hot{opacity:.64}
    #adaptive-bg .relay{fill:#b9c8b3;opacity:.07}
    #adaptive-bg .relay.hot{fill:#c8ff3d;opacity:.34}
    #adaptive-bg .packet{opacity:.5;filter:url(#blur2)}
    #adaptive-bg .memory{fill:none;stroke:#d6e2d2;stroke-width:.36;opacity:0}
    #adaptive-bg .memory.show{animation:mem 4.6s ease-out forwards}
    #adaptive-bg .burst{fill:#dce7d9;opacity:0;animation:burst 1.15s ease-out forwards}
    #adaptive-bg .ring{fill:none;stroke:#9fb69a;stroke-width:.42;stroke-dasharray:2 21;opacity:.1;transform-origin:800px 450px;animation:spin 31s linear infinite}
    #adaptive-bg .ring.r2{stroke:#c8ff3d;opacity:.13;animation-duration:22s;animation-direction:reverse}
    #adaptive-bg .scan{stroke:#c8ff3d;stroke-width:.55;opacity:0;animation:scan 2.7s ease-out forwards}
    #adaptive-bg .orbit{fill:none;stroke:#dbe5df;stroke-width:.4;stroke-dasharray:2 20;opacity:.065}
    @keyframes mem{0%{opacity:.22;transform:scale(.5)}100%{opacity:0;transform:scale(2)}}
    @keyframes burst{0%{opacity:0;transform:scale(.3)}28%{opacity:.4}100%{opacity:0;transform:scale(2)}}
    @keyframes scan{0%{opacity:0;transform:translateY(-160px)}25%{opacity:.11}78%{opacity:.04}100%{opacity:0;transform:translateY(980px)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){#adaptive-bg .memory.show,#adaptive-bg .burst,#adaptive-bg .ring,#adaptive-bg .scan{animation:none!important}}
    @media(max-width:740px){#adaptive-bg .relay{opacity:.045}#adaptive-bg .wire{opacity:.03}}
  `;svg.appendChild(style);
  const rand=()=>{try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}catch{return Math.random()}};
  const el=(tag,a={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(a))e.setAttribute(k,v);return e};
  const anchors=[[160,195],[1440,195],[150,790],[1450,790],[800,790]],colors=['#f0c933','#4e8cff','#8ab1ff','#5ca8ff','#dbe5df'];
  const relays=[];const wires=el('g'),paths=el('g'),packetsG=el('g'),mem=el('g'),bursts=el('g'),scans=el('g');g.append(wires,paths,packetsG,mem,bursts,scans);
  for(let i=0;i<38;i++){let x=80+rand()*1440,y=105+rand()*690;if(Math.hypot(x-800,y-450)<130){x+=x<800?-150:150;y+=y<450?-90:90}const r=el('rect',{x:x.toFixed(1),y:y.toFixed(1),width:i%17===0?5:3,height:i%17===0?5:3,rx:1,class:i%17===0?'relay hot':'relay'});wires.appendChild(r);relays.push({x,y,r});}
  const fixed=relays.map(r=>({x:r.x,y:r.y})),wireEls=[];
  for(let i=0;i<fixed.length;i++){const w=el('path',{class:'wire'});wires.appendChild(w);wireEls.push(w)}
  function rewire(){const order=fixed.slice().sort(()=>rand()-.5);wireEls.forEach((w,i)=>{const a=order[i%order.length],b=order[(i*7+5)%order.length],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,off=(rand()-.5)*80;w.setAttribute('d',`M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${(mx+off).toFixed(1)} ${(my-32-rand()*65).toFixed(1)} ${(mx-off).toFixed(1)} ${(my+32+rand()*65).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);w.classList.toggle('hot',rand()>.9);});}
  const personality=[5.0,5.7,6.5,5.4,7.0],routeSets=[[],[],[],[],[]],packets=[];
  function route(i,v){const [ex,ey]=anchors[i],sx=800,sy=450,vx=ex-sx,vy=ey-sy,len=Math.hypot(vx,vy)||1,px=-vy/len,py=vx/len,b=(40+v*18)*(v%2?-1:1),j=(rand()-.5)*30,c1=[sx+vx*.18+px*b+j,sy+vy*.18+py*b],c2=[sx+vx*.5-px*b*.55-j,sy+vy*.5-py*b*.55],c3=[sx+vx*.78+px*b*.28+j*.4,sy+vy*.78+py*b*.28];return `M${sx} ${sy} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c3[0].toFixed(1)} ${c3[1].toFixed(1)} S${ex} ${ey} ${ex} ${ey}`;}
  for(let i=0;i<5;i++){for(let v=0;v<6;v++){const p=el('path',{class:'path',stroke:colors[i],d:route(i,v)});paths.appendChild(p);routeSets[i].push(p)}for(let k=0;k<(i===4?2:3);k++){const p=el('circle',{r:k===0?3:2,class:'packet',fill:colors[i]});const m=el('animateMotion',{repeatCount:'indefinite',dur:(personality[i]+rand()*3).toFixed(1)+'s',path:route(i,Math.floor(rand()*6)),begin:(rand()*3).toFixed(2)+'s'});p.appendChild(m);packetsG.appendChild(p);packets.push({p,m,r:i})}}
  g.append(el('circle',{cx:800,cy:450,r:238,class:'ring'}),el('circle',{cx:800,cy:450,r:164,class:'ring r2'}),el('ellipse',{cx:800,cy:450,rx:400,ry:158,class:'orbit'}));
  function decide(){for(let i=0;i<5;i++)for(let v=0;v<6;v++)routeSets[i][v].style.opacity=rand()>.7?(.015+rand()*.13).toFixed(2):'.075';for(const q of packets){const v=Math.floor(rand()*6);q.m.setAttribute('path',route(q.r,v));q.m.setAttribute('dur',(personality[q.r]+1+rand()*6).toFixed(1)+'s');q.m.setAttribute('begin',(rand()*3.5).toFixed(2)+'s');q.p.style.opacity=(.2+rand()*.6).toFixed(2)}}
  function activity(){const count=1+Math.floor(rand()*4);for(let i=0;i<count;i++){const r=relays[Math.floor(rand()*relays.length)];r.r.classList.add('hot');setTimeout(()=>r.r.classList.remove('hot'),250+rand()*1400);const c=el('circle',{cx:r.x,cy:r.y,r:(5+rand()*9).toFixed(1),class:'memory show'});mem.appendChild(c);setTimeout(()=>c.remove(),4700)}}
  function linkPulse(){for(let i=0,n=1+Math.floor(rand()*5);i<n;i++){const w=wireEls[Math.floor(rand()*wireEls.length)];w.classList.add('hot');setTimeout(()=>w.classList.remove('hot'),300+rand()*1600)}}
  function burst(){for(let i=0,n=3+Math.floor(rand()*7);i<n;i++){const r=relays[Math.floor(rand()*relays.length)],b=el('rect',{x:r.x-2,y:r.y-2,width:4,height:4,class:'burst'});bursts.appendChild(b);setTimeout(()=>b.remove(),1200)}}
  function scan(){const s=el('line',{x1:0,y1:0,x2:1600,y2:0,class:'scan'});scans.appendChild(s);setTimeout(()=>s.remove(),2900)}
  function pulse(){const r=rand();if(r>.12)decide();if(r>.32)activity();if(r>.52)linkPulse();if(r>.68)rewire();if(r>.8)burst();if(r>.9)scan();setTimeout(pulse,3000+rand()*17000)}
  rewire();decide();setTimeout(pulse,1200+rand()*3000);
})();