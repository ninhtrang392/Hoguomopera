(() => {
  const shell = document.querySelector('.finale-shell');
  if (!shell) return;
  const section = shell.querySelector('.finale');
  const footer = shell.querySelector('.footer');
  const program = section.querySelector('.finale-program');
  const cta = section.querySelector('.finale-cta');
  const translate = () => {
    const en = document.documentElement.lang === 'en';
    section.querySelectorAll('[data-finale-vi]').forEach(el => {
      el.textContent = en ? el.dataset.finaleEn : el.dataset.finaleVi;
    });
  };
  translate();
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  // Reuse the programme catalogue; the CTA opens the existing booking details.
  if (typeof performancePrograms !== 'undefined' && performancePrograms.hoanca) {
    const event = performancePrograms.hoanca;
    program.querySelector('h3').textContent = event.title;
    program.querySelector('.finale-program-date').textContent = `${event.date} · ${event.time}`;
    program.querySelector('.finale-program-artists').textContent = event.artists;
  }
  if (!window.gsap || !window.ScrollTrigger || !footer) return;
  const {gsap,ScrollTrigger} = window;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference) and (min-height: 520px)', () => {
    shell.classList.add('is-motion');
    const visual = section.querySelector('.finale-visual');
    const background = section.querySelector('.finale-background');
    const artist = section.querySelector('.finale-artist');
    const left = section.querySelector('.finale-curtain.is-left');
    const right = section.querySelector('.finale-curtain.is-right');
    const lines = section.querySelectorAll('.finale-line > *');
    const kicker = section.querySelector('.finale-kicker');
    const hint = section.querySelector('.finale-scroll');
    gsap.set(artist,{autoAlpha:0,scale:.92});
    gsap.set(lines,{yPercent:115});
    gsap.set([kicker,program],{autoAlpha:0,y:20});
    gsap.set(left,{xPercent:-101}); gsap.set(right,{xPercent:101});
    gsap.set(footer,{yPercent:100});
    gsap.set(section.querySelector('.finale-dim'),{opacity:.1});
    const syncAccess = timeline => {
      const time = timeline.time();
      // Hidden controls must not receive keyboard focus during the opening.
      program.inert = time < 5.5;
      footer.inert = time < 8.45;
      if (program.inert && program.contains(document.activeElement)) section.focus({preventScroll:true});
      if (footer.inert && footer.contains(document.activeElement)) section.focus({preventScroll:true});
    };
    section.setAttribute('tabindex','-1');
    const timeline = gsap.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:{
      trigger:shell,start:'top top',end:()=>`+=${Math.round(innerHeight * (innerWidth < 761 ? 4.5 : 5.5))}`,
      pin:true,scrub:1.25,anticipatePin:1,invalidateOnRefresh:true
    },onUpdate(){syncAccess(this);}});
    timeline.to(background,{scale:1.07,duration:3},0)
      .to(section.querySelector('.finale-dim'),{opacity:.7,duration:2.8},0)
      .to(hint,{autoAlpha:0,duration:.5},.5)
      .to(left,{xPercent:0,duration:1.5},.65)
      .to(right,{xPercent:0,duration:1.5},.65)
      .to(artist,{autoAlpha:1,scale:1,duration:1.8},2.3)
      .to(left,{xPercent:-101,duration:2},2.65)
      .to(right,{xPercent:101,duration:2},2.65)
      .to(kicker,{autoAlpha:1,y:0,duration:.7},4.2)
      .to(lines,{yPercent:0,duration:1.1,stagger:.18,ease:'power3.out'},4.45)
      .to(program,{autoAlpha:1,y:0,duration:1},5.5)
      .to(visual,{scale:.94,y:()=>-Math.min(footer.offsetHeight*.8,innerHeight*.27),duration:1.5},7)
      .to(footer,{yPercent:0,duration:1.5},7)
      .to({}, {duration:.5},8.5);
    syncAccess(timeline);
    // Keyboard navigation can expose the CTA/footer without scrolling through hidden states.
    const focus = event => {
      if (event.target === cta) timeline.scrollTrigger.scroll(timeline.scrollTrigger.start + (timeline.scrollTrigger.end - timeline.scrollTrigger.start) * .73);
    };
    section.addEventListener('focusin',focus);
    return () => {
      section.removeEventListener('focusin',focus);
      shell.classList.remove('is-motion');
      program.inert = false; footer.inert = false;
      section.removeAttribute('tabindex');
    };
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  section.querySelectorAll('img').forEach(img => {
    if (!img.complete) img.addEventListener('load',() => ScrollTrigger.refresh(),{once:true});
  });
})();
