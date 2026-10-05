// Defer the player graph until the visitor approaches Media or opens a film.
const section=document.querySelector('#media');
const modal=document.querySelector('.media-dialog');
let pending;
function loadPlayer(){
  if(pending)return pending;
  pending=import('./vendor/videojs-v10/video.js').then(async()=>{
    await Promise.all(['video-player','video-skin'].map(name=>customElements.whenDefined(name)));
    modal?.classList.add('has-videojs');
    observer?.disconnect();
  }).catch(error=>{
    pending=null;
    console.warn('Video.js could not load; native controls remain available.',error);
  });
  return pending;
}
const observer=section?new IntersectionObserver(entries=>{
  if(entries.some(entry=>entry.isIntersecting))loadPlayer();
},{rootMargin:'400px'}):null;
observer?.observe(section);
section?.addEventListener('pointerover',event=>{if(event.target.closest('.media-play'))loadPlayer();},{passive:true});
section?.addEventListener('focusin',event=>{if(event.target.closest('.media-play'))loadPlayer();});
section?.addEventListener('click',event=>{if(event.target.closest('.media-play'))loadPlayer();},{capture:true});
