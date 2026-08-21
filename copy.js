(()=>{
  const copyCode=async(button)=>{
    const card=button.closest('.card');
    const code=(button.dataset.code||button.textContent||'').trim();
    if(!code)return;
    let ok=false;
    try{
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(code);
        ok=true;
      }
    }catch{}
    if(!ok){
      try{
        const area=document.createElement('textarea');
        area.value=code;
        area.setAttribute('readonly','');
        area.style.position='fixed';
        area.style.opacity='0';
        area.style.pointerEvents='none';
        document.body.appendChild(area);
        area.focus();
        area.select();
        area.setSelectionRange(0,area.value.length);
        ok=document.execCommand('copy');
        area.remove();
      }catch{}
    }
    const original=button.dataset.original||code;
    button.dataset.original=original;
    button.classList.toggle('copied',ok);
    button.classList.toggle('copy-failed',!ok);
    button.textContent=ok?'COPIED':'COPY FAILED';
    if(card){
      card.classList.toggle('copied',ok);
      card.classList.toggle('copy-failed',!ok);
      const status=card.querySelector('.copy-status');
      if(status){status.textContent=ok?'COPIED':'COPY FAILED';}
    }
    clearTimeout(button._copyTimer);
    button._copyTimer=setTimeout(()=>{
      button.textContent=original;
      button.classList.remove('copied','copy-failed');
      if(card){
        card.classList.remove('copied','copy-failed');
        const status=card.querySelector('.copy-status');
        if(status)status.textContent='COPIED';
      }
    },1600);
  };
  document.addEventListener('click',(event)=>{
    const button=event.target.closest('.code');
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    copyCode(button);
  },true);
})();