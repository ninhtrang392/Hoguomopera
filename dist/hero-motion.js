/* Each DOM layer has one transform writer; timelines animate separate state. */
export function composeLayer(base, intro, scroll, ambient, mouse, weight) {
  return {
    x: base.x + intro.x + scroll.x + (ambient.x + mouse.x) * weight,
    y: base.y + intro.y + scroll.y + (ambient.y + mouse.y) * weight,
    rotation: base.rotation + intro.rotation + scroll.rotation + ambient.rotation * weight,
    scaleX: base.scaleX * intro.scale * scroll.scale * (1 + (ambient.scale - 1) * weight),
    scaleY: base.scaleY * intro.scale * scroll.scale * (1 + (ambient.scale - 1) * weight),
    opacity: base.opacity * intro.opacity * scroll.opacity
  };
}

export function mountHeroMotion(section, white, companion) {
  const {gsap, ScrollTrigger} = window;
  const media = gsap.matchMedia();
  let destroyed = false;
  const state = () => ({x:0, y:0, rotation:0, scale:1, opacity:1});

  media.add({all:'all', desktop:'(min-width: 761px) and (hover: hover) and (pointer: fine)',
    mobile:'(max-width: 760px)', reduce:'(prefers-reduced-motion: reduce)'}, context => {
    if (context.conditions.reduce) return;
    const mobile = context.conditions.mobile;
    const entries = {
      sky:section.querySelector('.overture-sky'),
      theatre:section.querySelector('.overture-theatre'),
      drum:section.querySelector('.overture-drum'),
      white, companion,
      eyebrow:section.querySelector('.overture-copy > p'),
      title:section.querySelector('#overture-title'),
      cta:section.querySelector('.overture-links')
    };
    const layers = Object.fromEntries(Object.entries(entries).filter(([,el]) => el).map(([key, el]) => {
      const number = property => Number(gsap.getProperty(el, property)) || 0;
      return [key, {el, write:gsap.quickSetter(el,'css'), savedStyle:el.getAttribute('style'),
        base:{x:number('x'), y:number('y'), rotation:number('rotation'),
          scaleX:number('scaleX'), scaleY:number('scaleY'), opacity:number('opacity')},
        intro:state(), scroll:state(), ambient:state(), mouse:{x:0,y:0}, hover:{amount:0}}];
    }));
    layers.sky.base.opacity = 1;
    let dirty = true, disposed = false, complete = false, visible = true;
    const mark = () => {dirty = true;};
    const clock = {progress:0};
    const spin = {rotation:0};
    const draw = () => {
      if (!dirty || disposed) return;
      dirty = false;
      // Ambient/parallax fade out during the first 15% of scrolling.
      const weight = complete ? Math.max(0, 1 - clock.progress / .15) : 0;
      Object.entries(layers).forEach(([name, layer]) => {
        const pose = composeLayer(layer.base, layer.intro, layer.scroll, layer.ambient, layer.mouse, weight);
        if (name === 'drum') {pose.rotation += spin.rotation;pose.transformOrigin = '50% 50%';}
        if (name === 'white' || name === 'companion') {
          const hover = layer.hover.amount * weight;
          pose.scaleX *= 1 + hover * .08;pose.scaleY *= 1 + hover * .08;
          pose.y -= hover * 8;
          pose.rotation += hover * (name === 'white' ? -2 : 2);
          pose.opacity *= .9 + hover * .1;
        }
        layer.write(pose);
      });
    };
    const ambient = gsap.timeline({paused:true, repeat:-1, yoyo:true, defaults:{ease:'sine.inOut'}, onUpdate:mark});
    if (layers.white) ambient.to(layers.white.ambient, {y:-4, x:-2, duration:5.5}, 0);
    if (layers.companion) ambient.to(layers.companion.ambient, {y:5, x:2, duration:6.5}, 0);
    const drumTurn = gsap.to(spin,{rotation:360,duration:150,repeat:-1,ease:'none',paused:true,onUpdate:mark});
    const syncAmbient = () => {
      if (complete && visible && !document.hidden && clock.progress < .15) ambient.resume();
      else ambient.pause();
      if (complete && visible && !document.hidden) drumTurn.resume();else drumTurn.pause();
    };
    const intro = gsap.timeline({paused:true, defaults:{ease:'power2.out'}, onUpdate:mark,
      onComplete:() => {complete = true; mark(); syncAmbient();}});
    intro.fromTo(layers.sky.intro, {scale:1.05}, {scale:1, duration:2}, 0)
      .fromTo(layers.theatre.intro, {y:40, scale:1.03}, {y:0, scale:1, duration:2.4}, .25)
      .fromTo(layers.drum.intro, {opacity:0, scale:1.1, rotation:-4}, {opacity:1, scale:1, rotation:0, duration:2.5}, .35);
    if (layers.white) intro.fromTo(layers.white.intro, {opacity:0,x:mobile ? -100 : -180,y:30}, {opacity:1,x:0,y:0,duration:2.1}, .65);
    // Quadratic Bezier flight; only its resulting x/y/opacity reach the image.
    const flight = {progress:0};
    if (layers.companion) {
      layers.companion.intro.opacity = 0;
      intro.to(layers.companion.intro, {opacity:1,duration:.8}, 1.2);
      intro.to(flight, {progress:1,duration:2.15,ease:'power1.inOut',onUpdate:() => {
        const t = flight.progress, u = 1 - t, amount = mobile ? .55 : 1;
        layers.companion.intro.x = (-u*u*220 - 2*u*t*70) * amount;
        layers.companion.intro.y = (u*u*90 - 2*u*t*65) * amount;
        mark();
      }}, 1.2);
      layers.companion.intro.x = mobile ? -121 : -220;
      layers.companion.intro.y = mobile ? 49.5 : 90;
    }
    intro.fromTo(layers.eyebrow.intro, {opacity:0,y:24}, {opacity:1,y:0,duration:1}, 1.9)
      .fromTo(layers.title.intro, {opacity:0,y:32}, {opacity:1,y:0,duration:1.2}, 2.1);
    if (layers.cta) intro.fromTo(layers.cta.intro, {opacity:0,y:15}, {opacity:1,y:0,duration:1}, 2.6);
    const finish = () => {if (!complete) {intro.progress(1).pause(); complete = true; mark();}};
    const click = event => {if (event.target.closest('a')) finish();};
    const scroll = gsap.timeline({paused:true, defaults:{ease:'none'}, onUpdate:() => {mark(); syncAmbient();}});
    scroll.to(clock, {progress:1,duration:1}, 0)
      .to(layers.theatre.scroll, {scale:1.08,duration:1}, 0)
      .to(layers.sky.scroll, {scale:1.035,duration:1}, 0)
      .to(layers.drum.scroll, {opacity:0,duration:.85}, 0)
      .to(layers.eyebrow.scroll, {y:-55,opacity:0,duration:.65}, 0)
      .to(layers.title.scroll, {y:-70,opacity:0,duration:.65}, 0);
    if (layers.cta) scroll.to(layers.cta.scroll, {y:-55,opacity:0,duration:.6}, .05);
    if (layers.white) scroll.to(layers.white.scroll, {x:mobile ? -90 : -220,y:mobile ? -120 : -240,opacity:0,duration:.85}, 0);
    if (layers.companion) scroll.to(layers.companion.scroll, {x:mobile ? 100 : 240,y:mobile ? -130 : -220,opacity:0,duration:.9}, 0);
    const trigger = ScrollTrigger.create({trigger:section,start:'top top',end:'bottom top',scrub:1,
      animation:scroll,onUpdate:self => {if (self.progress > 0) finish();},invalidateOnRefresh:true});
    const quick = [];
    const hoverTargets = [];
    if (context.conditions.desktop) {
      // Distant sky moves least; the nearer theatre and birds move further.
      Object.entries({sky:3,theatre:11,white:15,companion:19}).forEach(([name, depth]) => {
        if (!layers[name]) return;
        quick.push({depth,
          x:gsap.quickTo(layers[name].mouse,'x',{duration:1.3,ease:'power2.out',onUpdate:mark}),
          y:gsap.quickTo(layers[name].mouse,'y',{duration:1.3,ease:'power2.out',onUpdate:mark})});
      });
      ['white','companion'].forEach(name => {
        if (!layers[name]) return;
        hoverTargets.push({el:layers[name].el,active:false,
          to:gsap.quickTo(layers[name].hover,'amount',{duration:.65,ease:'power2.out',onUpdate:mark})});
      });
    }
    const pointer = event => {
      if (!complete || clock.progress >= .15) return;
      const rect = section.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      quick.forEach(layer => {layer.x(x * layer.depth);layer.y(y * layer.depth);});
      // Test the bird's central silhouette area, not the transparent canvas edges.
      // Listening on the section preserves click-through for links beneath the art.
      hoverTargets.forEach(target => {
        const bounds = target.el.getBoundingClientRect();
        const dx = (event.clientX - bounds.left - bounds.width * .5) / (bounds.width * .24);
        const dy = (event.clientY - bounds.top - bounds.height * .5) / (bounds.height * .43);
        const active = dx * dx + dy * dy <= 1;
        if (active !== target.active) {target.active = active;target.to(active ? 1 : 0);}
      });
    };
    const resetPointer = () => {
      quick.forEach(layer => {layer.x(0);layer.y(0);});
      hoverTargets.forEach(target => {target.active = false;target.to(0);});
    };
    if (quick.length) {section.addEventListener('pointermove',pointer,{passive:true});section.addEventListener('pointerleave',resetPointer);}
    const visibility = () => {
      if (document.hidden) {intro.pause();ambient.pause();drumTurn.pause();resetPointer();}
      else {if (!complete && visible) intro.resume();syncAmbient();}
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) intro.pause(); else if (!complete && !document.hidden) intro.resume();
      syncAmbient();
    });
    observer.observe(section);
    document.addEventListener('visibilitychange',visibility);
    section.addEventListener('click',click);
    gsap.ticker.add(draw);
    if (trigger.progress > 0 || section.getBoundingClientRect().bottom <= 0) {
      finish();scroll.progress(trigger.progress);
    } else intro.play();
    draw();
    return () => {
      disposed = true;
      gsap.ticker.remove(draw);
      observer.disconnect();
      document.removeEventListener('visibilitychange',visibility);
      section.removeEventListener('pointermove',pointer);
      section.removeEventListener('pointerleave',resetPointer);
      section.removeEventListener('click',click);
      quick.forEach(layer => {layer.x.tween.kill();layer.y.tween.kill();});
      hoverTargets.forEach(target => target.to.tween.kill());
      trigger.kill();scroll.kill();intro.kill();ambient.kill();drumTurn.kill();
      Object.values(layers).forEach(({el,savedStyle}) => {
        // Invalidate GSAP's transform cache before the next responsive setup.
        gsap.set(el,{clearProps:'transform,opacity'});
        savedStyle === null ? el.removeAttribute('style') : el.setAttribute('style',savedStyle);
      });
    };
  });
  const restore = () => {if (!destroyed) ScrollTrigger.refresh();};
  window.addEventListener('pageshow',restore);
  return () => {destroyed = true;window.removeEventListener('pageshow',restore);media.revert();};
}
