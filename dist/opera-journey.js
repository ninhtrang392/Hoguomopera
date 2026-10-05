(() => {
  const section = document.querySelector('#story.opera-journey');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  const {gsap,ScrollTrigger} = window;
  gsap.registerPlugin(ScrollTrigger);
  const q = selector => section.querySelector(selector);
  const scenes = [...section.querySelectorAll('.journey-scene')];
  const captions = [...section.querySelectorAll('.journey-caption')];
  const progress = q('.journey-progress-line span');
  const counter = q('.journey-counter');
  const sceneNames = ['Intro','Exterior','Columns','Entrance','Lobby','Stair','Auditorium','Stage'];
  const labels={vi:['Hành trình không gian','Từ phố Hàng Bài','Nhịp điệu mặt đứng','Qua ngưỡng cửa','Sảnh lớn','Dòng chảy kiến trúc','Không gian trình diễn','Ánh sáng sân khấu'],en:['Spatial journey','From Hang Bai Street','The rhythm of the façade','Across the threshold','The grand lobby','Architecture in motion','The performance chamber','Stage light']};
  function translate(){
    const en=document.documentElement.lang==='en';
    section.querySelectorAll('[data-journey-vi]').forEach(el=>{el.innerHTML=en?el.dataset.journeyEn:el.dataset.journeyVi;});
    captions.forEach((caption,i)=>caption.setAttribute('aria-label',(en?labels.en:labels.vi)[i+1]||''));
  }
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});translate();

  const showScene = (tl, scene, at, duration=.65) => {
    tl.set(scene,{visibility:'visible'},at)
      .fromTo(scene,{opacity:0,filter:'blur(8px)',clipPath:'inset(5% 5% 5% 5%)'},
        {opacity:1,filter:'blur(0px)',clipPath:'inset(0% 0% 0% 0%)',duration,ease:'power2.inOut'},at);
  };
  const hideScene = (tl, scene, at, duration=.55) => {
    tl.to(scene,{opacity:0,filter:'blur(7px)',duration,ease:'power1.inOut'},at)
      .set(scene,{visibility:'hidden'},at+duration);
  };
  const revealCaption = (tl, scene, at) => {
    const parts = scene.querySelectorAll('.journey-caption > *');
    tl.fromTo(parts,{y:25,opacity:0},{y:0,opacity:1,duration:.65,stagger:.08,ease:'power2.out'},at);
  };

  function build({mobile}) {
    scenes.forEach(scene => gsap.set(scene,{autoAlpha:0,visibility:'hidden',clearProps:'filter,clipPath'}));
    gsap.set(q('.journey-intro'),{autoAlpha:1});
    gsap.set(q('.journey-final'),{autoAlpha:0,visibility:'hidden'});
    gsap.set(progress,{scaleX:0});
    const tl=gsap.timeline({paused:true,defaults:{ease:'power1.inOut'}});
    const intro=q('.journey-intro'), exterior=q('.journey-exterior'), facade=q('.journey-facade');
    const entrance=q('.journey-entrance'), lobby=q('.journey-lobby'), stair=q('.journey-stair');
    const auditorium=q('.journey-auditorium'), stage=q('.journey-stage-scene'), final=q('.journey-final');
    tl.to(intro.querySelectorAll('.journey-intro-inner > *'),{y:-35,opacity:0,stagger:.06,duration:.65},.25)
      .to(intro,{autoAlpha:0,duration:.2},.8);
    showScene(tl,exterior,.55,.9); revealCaption(tl,exterior,.95);
    tl.fromTo(exterior.querySelector('.sky'),{scale:1.08,yPercent:3},{scale:1.02,yPercent:-3,duration:1.45,ease:'none'},.55)
      .fromTo(exterior.querySelector('.building'),{scale:.93,yPercent:5},{scale:1.11,yPercent:-2,duration:1.45,ease:'none'},.55)
      .fromTo(exterior.querySelector('.tree-left'),{xPercent:-5,scale:1.05},{xPercent:mobile?-3:-13,scale:1.16,duration:1.45,ease:'none'},.55)
      .fromTo(exterior.querySelector('.tree-right'),{xPercent:5,scale:1.05},{xPercent:mobile?3:13,scale:1.16,duration:1.45,ease:'none'},.55)
      .fromTo(exterior.querySelector('.foreground'),{opacity:.15,yPercent:8},{opacity:1,yPercent:0,scale:1.08,duration:1.15},.75);
    hideScene(tl,exterior,1.8,.5); showScene(tl,facade,1.72,.72); revealCaption(tl,facade,2.02);
    tl.fromTo(facade.querySelector('.roof'),{yPercent:-9,scale:.94},{yPercent:-2,scale:1.18,duration:1.15,ease:'none'},1.72)
      .fromTo(facade.querySelector('.columns-left'),{xPercent:-8,scale:.92},{xPercent:mobile?-3:-15,scale:1.16,duration:1.2,ease:'none'},1.72)
      .fromTo(facade.querySelector('.columns-right'),{xPercent:8,scale:.92},{xPercent:mobile?3:15,scale:1.16,duration:1.2,ease:'none'},1.72)
      .fromTo(facade.querySelector('.entrance'),{scale:.9},{scale:1.34,duration:1.2,ease:'none'},1.72);
    hideScene(tl,facade,2.82,.52); showScene(tl,entrance,2.72,.72); revealCaption(tl,entrance,2.98);
    tl.fromTo(entrance.querySelector('.entrance'),{scale:1},{scale:mobile?1.25:1.75,duration:1.28,ease:'power1.in'},2.72)
      .to(entrance.querySelector('.column-left'),{xPercent:mobile?-12:-42,scale:mobile?1.1:1.3,duration:1.2,ease:'power1.in'},2.72)
      .to(entrance.querySelector('.column-right'),{xPercent:mobile?12:42,scale:mobile?1.1:1.3,duration:1.2,ease:'power1.in'},2.72)
      .to(entrance.querySelector('.column-middle'),{scale:1.2,opacity:.25,duration:1.2,ease:'none'},2.72)
      .fromTo(entrance.querySelector('.door-mask'),{opacity:0,clipPath:'inset(0 42%)'},{opacity:.82,clipPath:'inset(0 0%)',duration:.75},3.28);
    hideScene(tl,entrance,3.88,.42); showScene(tl,lobby,3.76,.78); revealCaption(tl,lobby,4.08);
    tl.fromTo(lobby.querySelector('.lobby'),{scale:1.12,filter:'brightness(.55)'},{scale:1.02,filter:'brightness(1)',duration:1.25,ease:'none'},3.76)
      .fromTo(lobby.querySelector('.stair'),{yPercent:10,scale:.93,opacity:0},{yPercent:0,scale:1.05,opacity:1,duration:1.05},3.94)
      .fromTo(lobby.querySelector('.stars'),{opacity:0,filter:'brightness(.5) blur(5px)'},{opacity:.9,filter:'brightness(1.35) blur(0px)',duration:1.1},4.05);
    hideScene(tl,lobby,4.92,.48); showScene(tl,stair,4.82,.72); revealCaption(tl,stair,5.1);
    tl.fromTo(stair.querySelector('.stair'),{scale:.95,yPercent:6},{scale:mobile?1.12:1.42,yPercent:mobile?3:8,duration:1.2,ease:'none'},4.82)
      .fromTo(stair.querySelector('.balcony'),{scale:1.02,yPercent:-3,opacity:.2},{scale:1.16,yPercent:-8,opacity:1,duration:1.2,ease:'none'},4.82)
      .to(stair.querySelector('.stars'),{scale:1.12,filter:'brightness(1.45)',duration:1.2,ease:'none'},4.82);
    hideScene(tl,stair,5.95,.48); showScene(tl,auditorium,5.84,.78); revealCaption(tl,auditorium,6.18);
    tl.fromTo(auditorium.querySelector('.shell'),{scale:.94,filter:'brightness(.55)'},{scale:1.04,filter:'brightness(1)',duration:1.3,ease:'none'},5.84)
      .fromTo(auditorium.querySelector('.middle'),{scale:.9,yPercent:3,opacity:0},{scale:1.1,yPercent:0,opacity:1,duration:1.18,ease:'none'},5.96)
      .fromTo(auditorium.querySelector('.seats'),{scale:.88,yPercent:13},{scale:mobile?1.06:1.2,yPercent:mobile?5:20,duration:1.3,ease:'none'},5.84);
    hideScene(tl,auditorium,6.98,.45); showScene(tl,stage,6.86,.72); revealCaption(tl,stage,7.2);
    tl.fromTo(stage.querySelector('.stage'),{scale:.92,filter:'brightness(.5)'},{scale:1.06,filter:'brightness(1)',duration:1.35,ease:'none'},6.86)
      .fromTo(stage.querySelector('.lights'),{opacity:0,filter:'brightness(.45) blur(4px)'},{opacity:1,filter:'brightness(1.45) blur(0px)',duration:1.05},7.1)
      .to(stage.querySelector('.journey-curtain.is-left'),{xPercent:-96,duration:1.15,ease:'power2.inOut'},6.96)
      .to(stage.querySelector('.journey-curtain.is-right'),{xPercent:96,duration:1.15,ease:'power2.inOut'},6.96);
    tl.to(stage.querySelector('.journey-caption'),{y:-25,opacity:0,duration:.45},8.05)
      .to(q('.journey-end-shade'),{opacity:.72,duration:.7},8.05)
      .set(final,{visibility:'visible'},8.12)
      .fromTo(final,{opacity:0},{opacity:1,duration:.75},8.12)
      .fromTo(final.querySelectorAll('*'),{y:30,opacity:0},{y:0,opacity:1,duration:.75,stagger:.12},8.18);
    tl.eventCallback('onUpdate',()=>{
      const p=tl.progress();
      gsap.set(progress,{scaleX:p});
      const sceneIndex=[0,.55,1.72,2.72,3.76,4.82,5.84,6.86].filter(at=>tl.time()>=at).length-1;
      counter.textContent=`${String(sceneIndex+1).padStart(2,'0')} / 08`;
      counter.setAttribute('aria-label',sceneNames[sceneIndex]);
    });
    return tl;
  }

  const mm=gsap.matchMedia();
  mm.add({desktop:'(min-width: 801px)',mobile:'(max-width: 800px)',reduced:'(prefers-reduced-motion: reduce)'},context=>{
    if(context.conditions.reduced) return;
    const tl=build({mobile:context.conditions.mobile});
    const trigger=ScrollTrigger.create({
      trigger:section,start:'top top',end:()=>`+=${innerHeight*(context.conditions.mobile?6.2:8.4)}`,
      pin:true,pinSpacing:true,scrub:context.conditions.mobile ? .7 : 1.15,anticipatePin:0,
      animation:tl,invalidateOnRefresh:true
    });
    return()=>{trigger.kill();tl.kill();};
  });
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
  window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
})();
