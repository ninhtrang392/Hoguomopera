import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {composeLayer, mountHeroMotion} from '../dist/hero-motion.js';

const neutral = () => ({x:0,y:0,rotation:0,scale:1,opacity:1});
const base = {x:-650,y:-228,rotation:0,scaleX:1,scaleY:1,opacity:.18};

test('particle birds initialize when the optional tagline is absent', t => {
  const element = () => ({getAttribute:()=>null, setAttribute(){}, removeAttribute(){}});
  const elements = new Map(['.overture-sky','.overture-theatre','.overture-drum',
    '.overture-copy > p','#overture-title'].map(selector => [selector, element()]));
  const section = {querySelector:selector=>elements.get(selector) ?? null,
    addEventListener(){}, removeEventListener(){}, getBoundingClientRect:()=>({bottom:800})};
  let revert, writes = 0;
  const timeline = () => {
    const chain = {to(){return chain;}, fromTo(){return chain;},
      play(){return chain;}, pause(){return chain;}, resume(){return chain;},
      progress(){return chain;}, kill(){}};
    return chain;
  };
  const gsap = {
    matchMedia:()=>({add:(_,callback)=>{revert=callback({conditions:{mobile:false,desktop:false,reduce:false}});},revert:()=>revert?.()}),
    getProperty:(_,property)=>['scaleX','scaleY','opacity'].includes(property)?1:0,
    quickSetter:()=>()=>{writes++;}, timeline, to:timeline, set(){},
    ticker:{add(){},remove(){}}
  };
  const scrollTrigger = {create:()=>({progress:0,kill(){}}),refresh(){}};
  for (const [key,value] of Object.entries({
    window:{gsap,ScrollTrigger:scrollTrigger,addEventListener(){},removeEventListener(){}},
    ScrollTrigger:scrollTrigger,
    document:{hidden:false,addEventListener(){},removeEventListener(){}},
    IntersectionObserver:class {observe(){} disconnect(){}}
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis,key);
    Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});
    t.after(()=>{if(original) Object.defineProperty(globalThis,key,original);else delete globalThis[key];});
  }
  const stop = mountHeroMotion(section,element(),element());
  assert.equal(writes,7,'both particle canvases and the five existing layers receive a pose');
  stop();
});

test('neutral animation preserves existing canvas placement and drum opacity', () => {
  assert.deepEqual(composeLayer(base,neutral(),neutral(),neutral(),{x:0,y:0},1),base);
});

test('scroll owns the final pose without residual float or pointer offsets', () => {
  const scroll = {...neutral(),x:-180,scale:1.08,opacity:0};
  const ambient = {...neutral(),x:2,y:-4,scale:1.006,rotation:.35};
  const actual = composeLayer(base,neutral(),scroll,ambient,{x:19,y:11},0);
  assert.deepEqual(actual,{x:-830,y:-228,rotation:0,scaleX:1.08,scaleY:1.08,opacity:0});
});

test('intro and scroll combine without overwriting independent state', () => {
  const intro = {...neutral(),x:-70,y:30,scale:1.03,opacity:.5};
  const scroll = {...neutral(),x:-20,y:-10,scale:1.02,opacity:.8};
  const ambient = {...neutral(),x:2,y:4,rotation:.4,scale:1.01};
  const actual = composeLayer(base,intro,scroll,ambient,{x:8,y:6},.5);
  assert.equal(actual.x,-735);
  assert.equal(actual.y,-203);
  assert.equal(actual.rotation,.2);
  assert.ok(Math.abs(actual.scaleX - 1.03*1.02*1.005) < 1e-12);
  assert.ok(Math.abs(actual.opacity - .072) < 1e-12);
  assert.equal(intro.x,-70);
  assert.equal(scroll.x,-20);
});

test('programs remains a native gallery independent of hero motion', () => {
  const heroSource = readFileSync('dist/hero-motion.js','utf8');
  const programsSource = readFileSync('dist/programs.js','utf8');
  assert.equal(heroSource.includes("document.querySelector('#programs')"),false);
  assert.equal(heroSource.includes('writeNext'),false);
  assert.equal(programsSource.includes('pin:true'),false);
  assert.equal(programsSource.includes('gsap.fromTo'),false);
  assert.match(programsSource,/viewport\.scrollTo/);
  assert.equal(programsSource.includes('innerHeight * .75'),false);
  assert.equal(programsSource.includes('scrub:1'),false);
});
