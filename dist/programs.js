/* Native poster gallery: vertical scrolling never pins or repeats this section. */
(() => {
 const section=document.querySelector('#programs'); if(!section)return;
 const viewport=section.querySelector('.collection-viewport');
 const cards=[...section.querySelectorAll('.collection-card')];
 const prev=section.querySelector('.collection-prev'),next=section.querySelector('.collection-next');
 const dots=section.querySelector('.collection-dots');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const visible=()=>cards.filter(card=>!card.hidden);
 const step=()=>{const items=visible();return items.length>1?items[1].offsetLeft-items[0].offsetLeft:viewport.clientWidth;};
 const track=section.querySelector('.collection-track');
 let loopStart=0,loopWidth=0,clones=[];
 const max=()=>Math.max(0,viewport.scrollWidth-viewport.clientWidth);
 const move=left=>viewport.scrollTo({left:Math.max(0,Math.min(max(),left)),behavior:reduced.matches?'instant':'smooth'});
 const normalize=()=>{
   if(!loopWidth)return;
   const left=viewport.scrollLeft;
   if(left<loopStart-1||left>=loopStart+loopWidth-1){
     const offset=((left-loopStart)%loopWidth+loopWidth)%loopWidth;
     viewport.scrollTo({left:loopStart+offset,behavior:'instant'});
   }
 };
 const update=()=>{
   prev.disabled=next.disabled=max()<2;
   const count=visible().length;
   const index=count?((Math.round((viewport.scrollLeft-loopStart)/Math.max(1,step()))%count)+count)%count:0;
   [...dots.children].forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)));
 };
 const rebuild=()=>{
   const items=visible();
   const index=Math.max(0,Math.round((viewport.scrollLeft-loopStart)/Math.max(1,step())))%Math.max(1,items.length);
   clones.forEach(clone=>clone.remove());clones=[];loopStart=loopWidth=0;
   if(items.length>1&&max()>2){
     const copy=card=>{
       const clone=card.cloneNode(true);clone.dataset.loopClone='';clone.removeAttribute('data-category');clone.setAttribute('aria-hidden','true');
       clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
       clone.querySelectorAll('a,button,[tabindex]').forEach(el=>el.tabIndex=-1);
       clones.push(clone);return clone;
     };
     const before=items.map(copy),after=items.map(copy);
     track.prepend(...before);track.append(...after);
     loopStart=items[0].offsetLeft-before[0].offsetLeft;
     loopWidth=after[0].offsetLeft-items[0].offsetLeft;
   }
   viewport.scrollTo({left:loopStart+index*step(),behavior:'instant'});
   dots.replaceChildren();
   const count=loopWidth?items.length:Math.ceil(max()/Math.max(1,step()))+1;
   for(let i=0;i<count;i++){
     const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label',(document.documentElement.lang==='en'?'Page':'Trang')+' '+(i+1));
     dot.addEventListener('click',()=>move(loopStart+i*step()));dots.append(dot);
   }
   update();
 };
 const advance=direction=>{normalize();move(viewport.scrollLeft+direction*step());};
 prev.addEventListener('click',()=>advance(-1));next.addEventListener('click',()=>advance(1));
 let drag=null,suppressClick=false;
 viewport.addEventListener('pointerdown',event=>{
   if(event.pointerType!=='mouse'||event.button!==0||max()<2)return;
   suppressClick=false;
   drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:viewport.scrollLeft,active:false};
 });
 viewport.addEventListener('pointermove',event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
   if(!drag.active){
     if(Math.abs(dx)<6||Math.abs(dx)<Math.abs(dy))return;
     drag.active=true;suppressClick=true;
     viewport.classList.add('is-dragging');
     viewport.setPointerCapture(event.pointerId);
   }
   event.preventDefault();
   viewport.scrollTo({left:drag.left-dx,behavior:'instant'});
 });
 const endDrag=event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const {active,id}=drag;drag=null;
   if(viewport.hasPointerCapture(id))viewport.releasePointerCapture(id);
   viewport.classList.remove('is-dragging');
   if(active){normalize();move(loopStart+Math.round((viewport.scrollLeft-loopStart)/Math.max(1,step()))*step());}
 };
 window.addEventListener('pointerup',endDrag);
 window.addEventListener('pointercancel',endDrag);
 viewport.addEventListener('lostpointercapture',endDrag);
 viewport.addEventListener('dragstart',event=>event.preventDefault());
 viewport.addEventListener('click',event=>{
   if(!suppressClick||event.detail===0)return;
   event.preventDefault();event.stopImmediatePropagation();suppressClick=false;
 },true);
 viewport.addEventListener('scrollend',()=>{if(!drag?.active)normalize();update();});
 viewport.addEventListener('scroll',update,{passive:true});
 viewport.addEventListener('keydown',event=>{if(event.target!==viewport||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();advance(event.key==='ArrowRight'?1:-1);});
 const all=section.querySelector('.collection-all'),filters=section.querySelector('.filters');
 all.addEventListener('click',()=>{filters.hidden=!filters.hidden;all.setAttribute('aria-expanded',String(!filters.hidden));});
 document.addEventListener('programs:filter',()=>{viewport.scrollLeft=loopStart;rebuild();window.ScrollTrigger?.refresh();});
 new ResizeObserver(rebuild).observe(viewport);document.fonts.ready.then(rebuild);rebuild();
 // Advance only while the gallery is visible and the visitor is not interacting.
 let autoplayTimer, inView=false, hovered=false, touching=false;
 const stopAutoplay=()=>{clearTimeout(autoplayTimer);};
 const startAutoplay=()=>{
   stopAutoplay();
   if(!inView||reduced.matches||document.hidden||hovered||touching||section.contains(document.activeElement))return;
   autoplayTimer=setTimeout(()=>{
     if(!document.querySelector('dialog[open]')&&max()>2){
       advance(1);
     }
     startAutoplay();
   },2000);
 };
 const visibilityObserver=new IntersectionObserver(entries=>{
   inView=entries[0].isIntersecting;startAutoplay();
 },{threshold:0});
 visibilityObserver.observe(viewport);
 section.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;stopAutoplay();}});
 section.addEventListener('pointerleave',()=>{hovered=false;startAutoplay();});
 section.addEventListener('pointerdown',()=>{touching=true;stopAutoplay();});
 window.addEventListener('pointerup',()=>{if(touching){touching=false;startAutoplay();}});
 window.addEventListener('pointercancel',()=>{touching=false;startAutoplay();});
 section.addEventListener('focusin',stopAutoplay);
 section.addEventListener('focusout',()=>queueMicrotask(startAutoplay));
 viewport.addEventListener('scroll',startAutoplay,{passive:true});
 document.addEventListener('programs:filter',startAutoplay);
 document.addEventListener('visibilitychange',startAutoplay);
 reduced.addEventListener('change',startAutoplay);
 window.addEventListener('pagehide',stopAutoplay);
 window.addEventListener('pageshow',startAutoplay);
})();
