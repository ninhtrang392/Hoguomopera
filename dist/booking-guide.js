(() => {
  const section = document.querySelector('#booking-guide');
  if (!section) return;
  const translate = () => {
    const english = document.documentElement.lang === 'en';
    section.querySelectorAll('[data-booking-vi]').forEach(el => {
      el.textContent = english ? el.dataset.bookingEn : el.dataset.bookingVi;
    });
    window.ScrollTrigger?.refresh();
  };
  new MutationObserver(translate).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  translate();
  if (!window.gsap || !window.ScrollTrigger) return;
  const {gsap, ScrollTrigger} = window;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(min-width: 901px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-motion');
    const panels = [...section.querySelectorAll('.booking-panel')];
    const images = panels.map(panel => panel.querySelector('img'));
    const steps = [...section.querySelectorAll('.booking-step')];
    gsap.set(panels.slice(1), {clipPath:'inset(100% 0% 0% 0%)'});
    gsap.set(images, {scale:1.04});
    gsap.set(steps.slice(1), {opacity:.32});
    const timeline = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{
      trigger:section,start:'top top',end:'+=360%',pin:true,scrub:1.1,
      anticipatePin:1,invalidateOnRefresh:true
    }});
    timeline
      .fromTo(section.querySelector('.eyebrow'), {autoAlpha:0,y:14}, {autoAlpha:1,y:0,duration:.24,ease:'power3.out'}, 0)
      .fromTo(section.querySelectorAll('.booking-line-mask > *'), {autoAlpha:0,yPercent:110}, {autoAlpha:1,yPercent:0,duration:.42,stagger:.08,ease:'power4.out'}, .08)
      .fromTo(section.querySelector('.booking-intro'), {autoAlpha:0,y:16}, {autoAlpha:1,y:0,duration:.3,ease:'power3.out'}, .26)
      .to(steps[0], {opacity:1,x:8,duration:.3,ease:'power3.out'}, .32);
    for (let i = 1; i < panels.length; i++) {
      timeline.to(steps[i-1], {opacity:.32,x:0,duration:.28}, i)
        .to(steps[i], {opacity:1,x:8,duration:.32,ease:'power3.out'}, i+.08)
        .to(panels[i], {clipPath:'inset(0% 0% 0% 0%)',duration:.62,ease:'power3.inOut'}, i)
        .to(images[i], {scale:1,duration:.7,ease:'power3.out'}, i);
    }
    timeline.to(section.querySelector('.booking-visual'), {scale:1.08,duration:.7,ease:'power2.inOut'}, 3.72)
      .set({}, {}, 4.5);
    return () => section.classList.remove('is-motion');
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
