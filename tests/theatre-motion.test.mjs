import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { revealFrame, galleryFrame } from '../dist/theatre-motion.js';

test('semicircle reveal grows monotonically into a full-height ellipse', () => {
  const start = revealFrame(0);
  const middle = revealFrame(.5);
  const end = revealFrame(1);
  const radii = [start,middle,end].map(frame => Number(frame.clip.match(/ellipse\([^ ]+ ([\d.]+)/)[1]));
  assert.ok(radii[0] < radii[1] && radii[1] < radii[2]);
  assert.equal(start.scale,1.16);
  assert.ok(Math.abs(end.scale - 1) < Number.EPSILON);
  assert.equal(start.copyOpacity,1);
  assert.equal(end.captionOpacity,1);
});

test('semicircle reveal clamps values outside the scroll range', () => {
  assert.deepEqual(revealFrame(-2),revealFrame(0));
  assert.deepEqual(revealFrame(3),revealFrame(1));
});

test('vertical scroll maps to four horizontal panels', () => {
  assert.deepEqual(galleryFrame(-20,1000,4),{offset:0,index:0,progress:.25});
  assert.equal(galleryFrame(1499,1000,4).index,1);
  assert.equal(galleryFrame(1501,1000,4).index,2);
  assert.deepEqual(galleryFrame(9000,1000,4),{offset:3000,index:3,progress:1});
});

test('section markup references every optimized theatre image', () => {
  const html = readFileSync('dist/index.html','utf8');
  const section = html.match(/<section id="theatre"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(section.includes('theatre-intro'));
  assert.equal((section.match(/class="theatre-panel"/g) || []).length,4);
  const sources = [...new Set([...section.matchAll(/src="(assets\/theatre\/[^"]+)"/g)].map(match => match[1]))];
  assert.equal(sources.filter(source => !source.endsWith('-background.webp')).length,7);
  assert.equal(sources.filter(source => source.endsWith('-background.webp')).length,4);
  sources.forEach(source => assert.ok(existsSync(`dist/${source}`),source));
});
