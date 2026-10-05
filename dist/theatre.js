import { clamp, revealFrame, galleryFrame } from './theatre-motion.js';

const section = document.querySelector('#theatre');
if (section) {
  const $ = selector => section.querySelector(selector);
  const intro = $('.theatre-intro');
  const introStage = $('.theatre-intro-stage');
  const dome = $('.theatre-dome');
  const photo = dome.querySelector('img');
  const copy = $('.theatre-intro-copy');
  const caption = $('.theatre-intro-caption');
  const gallery = $('.theatre-gallery');
  const stage = $('.theatre-gallery-stage');
  const viewport = $('.theatre-viewport');
  const track = $('.theatre-track');
  const panels = [...section.querySelectorAll('.theatre-panel')];
  const previous = $('[data-theatre-prev]');
  const next = $('[data-theatre-next]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 650px)');
  let motion = false, width = 0, frame = 0, index = -1;

  function setIndex(nextIndex, progress) {
    $('.theatre-progress span').style.transform = `scaleX(${clamp(progress)})`;
    if (index === nextIndex) return;
    index = nextIndex;
    previous.disabled = index === 0;
    next.disabled = index === panels.length - 1;
    $('.theatre-current').textContent = String(index + 1).padStart(2,'0');
    $('.theatre-next-number').textContent = String(Math.min(panels.length,index + 2)).padStart(2,'0');
    $('.theatre-gallery-status').textContent = `${index + 1} / ${panels.length} — ${panels[index].querySelector('h3').textContent}`;
    panels.forEach((panel,i) => {
      // Keep all content available to assistive technology in the native carousel.
      panel.inert = motion && Math.abs(i - index) > 0;
    });
  }
  function render() {
    frame = 0;
    if (!motion) {
      setIndex(clamp(Math.round(viewport.scrollLeft / Math.max(1,width)),0,panels.length-1), (viewport.scrollLeft / Math.max(1,width)+1)/panels.length);
      return;
    }
    const introRect = intro.getBoundingClientRect();
    const reveal = revealFrame(-introRect.top / Math.max(1,intro.offsetHeight-introStage.offsetHeight));
    dome.style.clipPath = reveal.clip;
    dome.style.opacity = clamp(-introRect.top / Math.max(1,intro.offsetHeight-introStage.offsetHeight) * 8);
    introStage.style.setProperty('--intro-details-opacity', reveal.copyOpacity);
    photo.style.transform = `scale(${reveal.scale})`;
    copy.style.opacity = reveal.copyOpacity;
    copy.style.transform = `translateY(${reveal.copyY}px)`;
    caption.style.opacity = reveal.captionOpacity;
    const state = galleryFrame(-gallery.getBoundingClientRect().top,width,panels.length);
    track.style.transform = `translate3d(${-state.offset}px,0,0)`;
    setIndex(state.index,state.progress);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function measure() {
    const enabled = !reduced.matches && !shortScreen.matches;
    const previousMotion = motion;
    motion = enabled;
    section.classList.toggle('is-motion',motion);
    width = viewport.clientWidth;
    if (motion) {
      viewport.scrollLeft = 0;
      gallery.style.height = `${stage.offsetHeight + width * (panels.length - 1)}px`;
    } else {
      gallery.style.removeProperty('height');
      [dome,photo,copy,caption,track].forEach(el => el.removeAttribute('style'));
      panels.forEach(panel => { panel.inert = false; });
      if (previousMotion) viewport.scrollLeft = Math.max(0,index) * width;
    }
    // Refresh button state and inert flags even if the selected panel is unchanged.
    index = -1;
    render();
  }
  function goTo(target) {
    const i = clamp(target,0,panels.length - 1);
    if (motion) window.scrollTo({ top:gallery.getBoundingClientRect().top + window.scrollY + i * width, behavior:'smooth' });
    else viewport.scrollTo({ left:i * width, behavior:reduced.matches?'auto':'smooth' });
  }
  previous.addEventListener('click', () => goTo(index - 1));
  next.addEventListener('click', () => goTo(index + 1));
  viewport.addEventListener('keydown', event => {
    if (event.target !== viewport || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? panels.length-1 : index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  viewport.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure);
  reduced.addEventListener('change',measure);
  shortScreen.addEventListener('change',measure);
  // Images have a fixed display area, so downloads do not alter scroll distances.
  const observer = new ResizeObserver(measure);
  observer.observe(stage);
  function translate() {
    const en = document.documentElement.lang === 'en';
    section.querySelectorAll('[data-theatre-vi]').forEach(el => { el.innerHTML = en ? el.dataset.theatreEn : el.dataset.theatreVi; });
    viewport.setAttribute('aria-label',en?'Explore the theatre. Use left and right arrow keys.':'Khám phá nhà hát. Dùng phím mũi tên trái và phải.');
    previous.setAttribute('aria-label',en?'Previous space':'Không gian trước');
    next.setAttribute('aria-label',en?'Next space':'Không gian tiếp theo');
    index = -1; schedule();
  }
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  translate(); measure();
}
