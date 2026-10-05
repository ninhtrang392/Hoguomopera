import test from 'node:test';
import assert from 'node:assert/strict';
import {wingPose, crossedDownstroke, WING_PERIOD, WING_TILT, repelParticles} from '../dist/bird-flight.js';

test('pointer pushes nearby particles outward and springs back after leaving',()=>{
  for(const fps of [30,60,120]){
    const base=new Float32Array([.05,0,0,2,2,0,0,0,0]);
    const offsets=new Float32Array(base.length),velocity=new Float32Array(base.length);
    let coordinates;
    for(let i=0;i<fps;i++){
      coordinates=base.slice();repelParticles(coordinates,offsets,velocity,{x:0,y:0},.4,1/fps);
    }
    assert.ok(coordinates[0]>.12,'nearby point moves away');
    assert.equal(coordinates[3],2,'distant point stays in place');
    assert.ok(coordinates.every(Number.isFinite),'exact pointer overlap remains finite');
    assert.ok(Math.hypot(offsets[6],offsets[7])>.01,'exact overlap scatters too');
    for(let i=0;i<fps*4;i++){
      coordinates=base.slice();repelParticles(coordinates,offsets,velocity,null,.4,1/fps);
    }
    assert.ok(offsets.every(v=>Math.abs(v)<.0001),'particles return to their current wing pose');
  }
});

test('body and head remain exactly stationary throughout every beat',()=>{
  for(let t=0;t<5;t+=.05) assert.deepEqual(wingPose(.35,-.1,.02,0,t),[.35,-.1,.02]);
});

test('both wings rise and fall, stay separate, and return to the initial pose',()=>{
  for(const wing of [1,2]) {
    const up=wingPose(-.2,.55,0,wing,0);
    const down=wingPose(-.2,.55,0,wing,WING_PERIOD/2);
    assert.ok(up[1]>0 && down[1]<0);
    wingPose(-.2,.55,0,wing,WING_PERIOD).forEach((value,i)=>assert.ok(Math.abs(value-up[i])<1e-12));
    assert.deepEqual(wingPose(.205,-.068,0,wing,.4).slice(0,2),[.205,-.068]);
  }
  assert.notDeepEqual(wingPose(-.2,.55,0,1,.4),wingPose(-.2,.55,0,2,.4));
});

test('wing bends along its span instead of moving as a rigid straight panel',()=>{
  const root=wingPose(.205,-.068,0,1,.7);
  const middle=wingPose(.205,.242,0,1,.7);
  const tip=wingPose(.205,.552,0,1,.7);
  const deviation=Math.hypot(middle[1]-(root[1]+tip[1])/2,middle[2]-(root[2]+tip[2])/2);
  assert.ok(deviation>.01,'mid-wing must leave the straight root-to-tip line');
  for(let t=0;t<WING_PERIOD;t+=.02) {
    const a=wingPose(-.2,.55,0,1,t), b=wingPose(-.2,.55,0,1,t+.001);
    assert.ok(Math.hypot(...a.map((value,i)=>value-b[i]))<.005,'no snapping between frames');
  }
});

test('light particles emit once per downstroke, independent of frame rate',()=>{
  for(const fps of [30,60,120]) {
    let bursts=0;
    for(let i=1;i<=Math.round(fps*WING_PERIOD*5);i++) if(crossedDownstroke((i-1)/fps,i/fps)) bursts++;
    assert.equal(bursts,5);
  }
});

test('wing pair mirrors the same stroke around the body',()=>{
  for(let t=0;t<WING_PERIOD;t+=.05) {
    const a=wingPose(-.2,.55,0,1,t), b=wingPose(-.2,.55,0,2,t);
    const unrotate=p=>[(p[0]-.205)*Math.cos(WING_TILT)+(p[1]+.068)*Math.sin(WING_TILT),
      -(p[0]-.205)*Math.sin(WING_TILT)+(p[1]+.068)*Math.cos(WING_TILT)];
    const localA=unrotate(a),localB=unrotate(b);
    assert.ok(Math.abs(localA[0]+localB[0]+.81)<1e-12);
    assert.ok(Math.abs(localA[1]-localB[1])<1e-12);
    assert.ok(Math.abs(a[2]+b[2])<1e-12);
  }
});
