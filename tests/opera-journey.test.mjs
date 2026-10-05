import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';

const html=readFileSync('dist/index.html','utf8');
const css=readFileSync('dist/opera-journey.css','utf8');
const js=readFileSync('dist/opera-journey.js','utf8');
const section=html.match(/<section id="story" class="opera-journey"[\s\S]*?<\/section>/)?.[0] ?? '';

test('deferred journey initializes after both animation dependencies',()=>{
  const scripts=[...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*>/g)].map(m=>m[1]);
  const journey=scripts.indexOf('opera-journey.js');
  assert.ok(scripts.indexOf('vendor/gsap.min.js')>=0);
  assert.ok(scripts.indexOf('vendor/gsap.min.js')<scripts.indexOf('vendor/ScrollTrigger.min.js'));
  assert.ok(scripts.indexOf('vendor/ScrollTrigger.min.js')<journey);
  assert.equal(scripts.filter(s=>s==='opera-journey.js').length,1);
});

test('cinematic story follows the requested eight-part narrative',()=>{
  assert.ok(section);
  for(const label of ['journey-intro','journey-exterior','journey-facade','journey-entrance','journey-lobby','journey-stair','journey-auditorium','journey-stage-scene']) assert.ok(section.includes(label),label);
  assert.ok(section.includes('Từ kiến trúc<br>đến nghệ thuật.'));
});

test('all cinematic images resolve to optimized local assets',()=>{
  const sources=[...new Set([...section.matchAll(/src="(assets\/cinematic\/[^"]+)"/g)].map(match=>match[1]))];
  assert.ok(sources.length>=16);
  sources.forEach(source=>assert.ok(existsSync(`dist/${source}`),source));
  assert.equal(/https?:\/\//.test(section),false);
});

test('journey pins once and uses only 2D compositing properties',()=>{
  assert.equal((js.match(/ScrollTrigger\.create/g)||[]).length,1);
  assert.match(js,/pin:true/);
  assert.match(js,/scrub:/);
  assert.match(js,/clipPath/);
  assert.match(js,/filter:/);
  assert.equal(/THREE|WebGL|model-viewer|\.glb|\.gltf/i.test(js+section),false);
});

test('mobile and reduced-motion fallbacks lower visual complexity',()=>{
  assert.match(css,/\[data-mobile-hide\]\{display:none\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/\.journey-curtain\{display:none\}/);
  assert.match(js,/mobile:\'\(max-width: 800px\)\'/);
});
