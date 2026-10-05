import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync, existsSync} from 'node:fs';

function mount({motion = true} = {}) {
  const nodes = new Map();
  const node = key => {
    if (!nodes.has(key)) nodes.set(key, {
      key, dataset:{}, classList:{add(){},remove(){}}, offsetHeight:180,
      querySelector:selector=>node(selector), querySelectorAll:()=>[],
      setAttribute(){},removeAttribute(){},addEventListener(){},removeEventListener(){},
      contains:()=>false,focus(){}
    });
    return nodes.get(key);
  };
  let config, cleanup, currentTime = 0;
  const tweens = [], initial = [];
  const timeline = {to(target,vars,at){tweens.push({target,vars,at});return this;},time:()=>currentTime};
  const gsap = {
    registerPlugin(){},set(target,vars){initial.push({target,vars});},
    matchMedia:()=>({add(query,build){if(motion) cleanup=build();}}),
    timeline(options){config=options;return timeline;}
  };
  vm.runInNewContext(readFileSync('dist/finale.js','utf8'),{
    document:{querySelector:()=>node('shell'),documentElement:{lang:'vi'},fonts:{ready:Promise.resolve()}},
    window:{gsap,ScrollTrigger:{refresh(){}}},innerWidth:1440,innerHeight:900,
    MutationObserver:class{observe(){}},
    performancePrograms:{hoanca:{title:'Khúc hoan ca',date:'24–25.10.2026',time:'20:00',artists:'Orchestra'}}
  });
  return {node,tweens,initial,config,cleanup,seek(time){currentTime=time;config.onUpdate.call(timeline);}};
}

test('finale pins with scrub and reversibly gates hidden interactive content',()=>{
  const scene=mount();
  assert.equal(scene.config.scrollTrigger.pin,true);
  assert.equal(scene.config.scrollTrigger.scrub,1.25);
  assert.equal(scene.node('.finale-program').inert,true);
  scene.seek(6.6);
  assert.equal(scene.node('.finale-program').inert,false);
  assert.equal(scene.node('.footer').inert,true);
  scene.seek(9);
  assert.equal(scene.node('.footer').inert,false);
  scene.seek(1);
  assert.equal(scene.node('.finale-program').inert,true);
  assert.equal(scene.node('.footer').inert,true);
  scene.cleanup();
  assert.equal(scene.node('.footer').inert,false);
  assert.equal(scene.node('.finale-program').inert,false);
});

test('curtains close before opening and artist settles before programme reveal',()=>{
  const scene=mount();
  const left=scene.tweens.filter(t=>t.target.key==='.finale-curtain.is-left');
  assert.deepEqual(left.map(t=>t.vars.xPercent),[0,-101]);
  assert.ok(left[0].at+left[0].vars.duration < left[1].at);
  const artist=scene.tweens.find(t=>t.target.key==='.finale-artist');
  const info=scene.tweens.find(t=>t.target.key==='.finale-program');
  assert.equal(scene.initial.find(t=>t.target.key==='.finale-artist').vars.scale,.92);
  assert.equal(artist.vars.scale,1);
  assert.ok(artist.at+artist.vars.duration < info.at);
  assert.equal(scene.tweens.find(t=>t.target.key==='.finale-visual').vars.scale,.94);
});

test('reduced motion leaves static content and booking available',()=>{
  const scene=mount({motion:false});
  assert.equal(scene.tweens.length,0);
  assert.notEqual(scene.node('.finale-program').inert,true);
  assert.equal(scene.node('h3').textContent,'Khúc hoan ca');
});

test('finale uses supplied assets and the existing programme action',()=>{
  const html=readFileSync('dist/index.html','utf8');
  const finale=html.match(/<section id="finale"[\s\S]*?<\/section>/)[0];
  const sources=[...finale.matchAll(/src="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(sources.length,4);
  sources.forEach(src=>assert.ok(existsSync(`dist/${src}`),src));
  assert.ok(finale.includes('data-program="hoanca"'));
  assert.equal((html.match(/<footer\b/g)||[]).length,1);
});
