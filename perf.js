(()=>{
  const nativeRAF=window.requestAnimationFrame.bind(window);
  const nativeCAF=window.cancelAnimationFrame.bind(window);
  const pending=new Map();
  let seq=0;
  window.requestAnimationFrame=cb=>{
    const id=++seq;
    if(document.hidden){pending.set(id,cb);return id}
    const nativeId=nativeRAF(ts=>{pending.delete(id);cb(ts)});
    pending.set(id,{cb,nativeId});
    return id;
  };
  window.cancelAnimationFrame=id=>{
    const item=pending.get(id);
    if(item&&typeof item==='object'&&item.nativeId)nativeCAF(item.nativeId);
    pending.delete(id);
  };
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden){
      for(const [id,item] of [...pending]){
        if(typeof item!=='function')continue;
        const nativeId=nativeRAF(ts=>{pending.delete(id);item(ts)});
        pending.set(id,{cb:item,nativeId});
      }
    }
  });
})();
