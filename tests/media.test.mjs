import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';

// A small DOM adapter exercises the gallery/player lifecycle without a browser.
class Element {
  constructor(dataset = {}) {
    this.dataset = dataset; this.handlers = {}; this.attrs = {}; this.nodes = {}; this.groups = {};
    this.style = {setProperty(name,value){this[name]=value;}}; this.animations = []; this.hidden = false; this.paused = true; this.currentTime = 0; this.duration = 120;
    this.offsetHeight = 800; this.top = 0; this.classNames = new Set();
    this.classList = { add: n => this.classNames.add(n), remove: n => this.classNames.delete(n), toggle: n => {
      if (this.classNames.has(n)) { this.classNames.delete(n); return false; }
      this.classNames.add(n); return true;
    }};
  }
  querySelector(selector) { return this.nodes[selector] ||= new Element(); }
  querySelectorAll(selector) { return this.groups[selector] ||= []; }
  addEventListener(name, fn) { (this.handlers[name] ||= []).push(fn); }
  async emit(name, extra = {}) { for (const fn of this.handlers[name] || []) await fn({ currentTarget:this, preventDefault(){}, ...extra }); }
  setAttribute(name, value) { this.attrs[name] = value; }
  hasAttribute(name) { return name in this.attrs; }
  removeAttribute(name) { delete this.attrs[name]; }
  set src(value) { this.attrs.src = value; } get src() { return this.attrs.src; }
  play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; }
  load() {} contains() { return false; } focus() { this.focused = true; }
  getBoundingClientRect() { return { top:this.top,left:100,right:600,bottom:this.top + this.offsetHeight }; }
  animate(keyframes, options) { this.animations.push({keyframes,options}); const animation = { cancel(){} }; return { finished:Promise.resolve(animation) }; }
  showModal() { this.open = true; } close() { this.open = false; this.emit('close'); }
}
function setup({width = 1440, count = 2, visible = true} = {}) {
  const section = new Element(), modal = new Element(), document = new Element(), window = new Element();
  const films = Array.from({length:count}, (_,i) => {
    const el = new Element({ title:`Film ${i}`,category:'Concert',video:`film-${i}.mp4` });
    el.querySelector('video').poster = `poster-${i}.jpg`;
    el.querySelector('video').dataset.src = `preview-${i}.mp4`;
    el.groups['.media-name span'] = [new Element(),new Element()];
    el.groups['.media-meta'] = [new Element(),new Element()]; return el;
  });
  section.groups['.media-film'] = films;
  section.groups['.media-video-layer'] = films.map(() => new Element());
  section.groups['[data-media-select]'] = films.map(() => new Element());
  section.groups['[data-media-step]'] = [-1,1].map(n => new Element({mediaStep:String(n)}));
  section.groups['.media-neighbor'] = [new Element(),new Element()];
  section.groups['.media-neighbor img'] = [new Element(),new Element()];
  modal.groups['[data-player-step]'] = [-1,1].map(n => new Element({playerStep:String(n)}));
  document.nodes['#media'] = section; document.nodes['.media-dialog'] = modal;
  document.body = new Element(); document.documentElement = new Element(); document.documentElement.lang = 'vi';
  const reduced = new Element(); reduced.matches = false;
  window.scrollY = 0;
  window.scrollTo = ({top}) => { window.scrollY = top; section.querySelector('.media-scroll').top = -top; };
  const frames = [];
  let now = 2000, observeVisibility;
  const context = { document,window,innerWidth:width,innerHeight:900,matchMedia:()=>reduced,Date:{now:()=>now},
    requestAnimationFrame:fn=>{frames.push(fn);return frames.length;},setTimeout:()=>1,clearTimeout(){},
    MutationObserver:class{observe(){}},IntersectionObserver:class{constructor(fn){this.fn=fn;observeVisibility=fn;}observe(){this.fn([{isIntersecting:visible}]);}} };
  vm.runInNewContext(readFileSync('dist/media.js','utf8'),context);
  const flush = async () => { for(let i=0;i<40;i++) await Promise.resolve(); };
  return {section,modal,films,document,reduced,window,frames,flush,setVisible:value=>observeVisibility([{isIntersecting:value}]),advance:ms=>{now+=ms;}};
}
test('gallery keeps independent full-screen videos behind the central focus window', async () => {
  const {section,films,flush} = setup();
  const layers = section.groups['.media-video-layer'];
  const background = layers[0].querySelector('video');
  assert.ok(films.every(film => film.querySelector('video').paused));
  assert.equal(background.src,'preview-0.mp4');
  assert.equal(background.paused,false);
  await section.groups['[data-media-select]'][1].emit('click'); await flush();
  assert.equal(films[1].inert,false); assert.equal(films[0].inert,true);
  assert.ok(films.every(film => film.querySelector('video').paused));
  assert.equal(background.src,'preview-0.mp4');
  assert.equal(background.paused,true);
  assert.equal(layers[1].querySelector('video').src,'preview-1.mp4');
  assert.equal(layers[1].querySelector('video').paused,false);
  await section.querySelector('.media-motion').emit('click');
  assert.equal(films[1].querySelector('video').paused,true);
  assert.equal(background.paused,true);
  assert.equal(layers[1].querySelector('video').paused,true);
});

test('forward opens the incoming layer; reverse closes the outgoing layer', async () => {
  const {section,flush} = setup();
  const layers = section.groups['.media-video-layer'];
  await section.groups['[data-media-select]'][1].emit('click'); await flush();
  const forward = layers[1].animations[0];
  assert.equal(forward.keyframes[0].clipPath,'inset(0% 50%)');
  assert.equal(forward.keyframes[1].clipPath,'inset(0% 0%)');
  assert.equal(forward.options.duration,1350);
  assert.equal(forward.options.easing,'cubic-bezier(.75,0,0,1)');
  await section.groups['[data-media-select]'][0].emit('click'); await flush();
  const reverse = layers[1].animations[1];
  assert.equal(reverse.keyframes[0].clipPath,'inset(0% 0%)');
  assert.equal(reverse.keyframes[1].clipPath,'inset(0% 50%)');
  assert.equal(layers[0].style.visibility,'visible');
  assert.equal(layers[1].style.visibility,'hidden');
});

test('one wheel gesture changes the film and locks repeated input during transition', async () => {
  const {section,films,flush,advance} = setup();
  const track = section.querySelector('.media-scroll'); track.offsetHeight = 1800;
  const stage = section.querySelector('.media-stage');
  let prevented = 0;
  await stage.emit('wheel',{deltaY:60,preventDefault(){prevented++;}});
  await stage.emit('wheel',{deltaY:60,preventDefault(){prevented++;}});
  await flush();
  assert.equal(prevented,2);
  assert.equal(films[1].inert,false);
  assert.equal(track.top,-1000);
  advance(1500);
  await stage.emit('wheel',{deltaY:60,preventDefault(){prevented++;}});
  assert.equal(prevented,2,'scroll is released at the final film');
  await stage.emit('wheel',{deltaY:-60,preventDefault(){prevented++;}}); await flush();
  assert.equal(films[0].inert,false);
  advance(1500);
  await stage.emit('wheel',{deltaY:-60,preventDefault(){prevented++;}});
  assert.equal(prevented,3,'scroll is released before the first film');
});

test('mobile transition uses 800 ms and respects reduced motion', async () => {
  const {section,reduced,flush} = setup({width:390});
  await section.groups['[data-media-select]'][1].emit('click'); await flush();
  const layers = section.groups['.media-video-layer'];
  assert.equal(layers[1].animations[0].options.duration,800);
  reduced.matches = true;
  await reduced.emit('change');
  await section.groups['[data-media-select]'][0].emit('click'); await flush();
  assert.equal(layers[1].animations.length,1);
  assert.ok(layers.every(layer => layer.querySelector('video').paused));
});
test('player opens selected source, seeks, changes film and cleans up on Escape', async () => {
  const {films,modal,document,flush} = setup(); const player = modal.querySelector('video');
  await films[0].querySelector('.media-play').emit('click');
  assert.equal(modal.open,true); assert.equal(player.src,'film-0.mp4');
  assert.equal(films[0].querySelector('video').paused,true);
  const seek = modal.querySelector('.media-seek'); seek.value = '500'; await seek.emit('input');
  assert.equal(player.currentTime,60);
  await modal.groups['[data-player-step]'][1].emit('click'); assert.equal(player.src,'film-1.mp4');
  await modal.emit('cancel'); await flush(); assert.equal(modal.open,false); assert.equal(player.src,undefined);
  assert.equal(document.body.classNames.has('media-open'),false);
  assert.equal(films[0].querySelector('.media-play').focused,true);
});
test('scroll changes at the midpoint; reduced motion disables preview autoplay', async () => {
  const {section,films,window,frames,flush,reduced} = setup();
  const track = section.querySelector('.media-scroll'); track.offsetHeight=1800;track.top=-800;
  await window.emit('scroll');frames.splice(0).forEach(fn=>fn()); await flush();
  assert.equal(films[1].inert,false);
  reduced.matches=true;await reduced.emit('change');
  assert.ok(films.every(f=>f.querySelector('video').paused));
});
test('media assets resolve and markup has no duplicate IDs', () => {
  const html = readFileSync('dist/index.html','utf8');
  for (const [,path] of html.matchAll(/(?:data-video|data-src|src|poster)="(assets\/media\/[^"]+)"/g)) assert.ok(existsSync(`dist/${path}`),path);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  assert.ok(html.includes('Niềm tin'));
  assert.equal([...html.matchAll(/class="media-film(?: is-active)?"/g)].length,3);
  assert.equal([...html.matchAll(/class="media-video-layer"/g)].length,3);
  assert.ok(html.includes('data-media-select="2"'));
});

test('third film supports scrolling, direct selection and full player navigation', async () => {
  const {section,films,modal,frames,flush} = setup({count:3});
  assert.equal(section.style['--media-track-height'],'320svh');
  const track = section.querySelector('.media-scroll');
  track.offsetHeight=2560; track.top=-1760;
  frames.splice(0).forEach(fn=>fn()); await flush();
  assert.equal(films[2].inert,false);
  assert.equal(section.groups['.media-video-layer'][2].querySelector('video').src,'preview-2.mp4');
  await films[2].querySelector('.media-play').emit('click');
  assert.equal(modal.querySelector('video').src,'film-2.mp4');
  await modal.groups['[data-player-step]'][1].emit('click');
  assert.equal(modal.querySelector('video').src,'film-0.mp4');
  await modal.emit('cancel'); await flush();
  await section.groups['[data-media-select]'][1].emit('click'); await flush();
  await section.groups['[data-media-select]'][2].emit('click'); await flush();
  assert.equal(films[2].inert,false);
});

test('offscreen media defers video sources and pauses when leaving the viewport', () => {
  const {section,setVisible} = setup({visible:false});
  const videos = section.groups['.media-video-layer'].map(layer=>layer.querySelector('video'));
  assert.ok(videos.every(video=>!video.src && video.paused));
  setVisible(true);
  assert.equal(videos[0].src,'preview-0.mp4');
  assert.equal(videos[0].paused,false);
  assert.equal(videos[1].src,undefined);
  setVisible(false);
  assert.ok(videos.every(video=>video.paused));
});
