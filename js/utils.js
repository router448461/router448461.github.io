// small helpers
export function $q(sel, ctx=document){ return ctx.querySelector(sel) }
export function $qa(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)) }
export function on(el, ev, fn){ el.addEventListener(ev, fn) }
export function debounce(fn, wait=200){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait) }
}
