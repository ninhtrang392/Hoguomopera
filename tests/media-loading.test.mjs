import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

test('Video.js stays unloaded until Media approaches and shares a single load',async()=>{
  let observe,loads=0,ready=false,disconnected=false,resolve;
  const events={};
  const section={addEventListener:(name,fn)=>events[name]=fn};
  const modal={classList:{add:()=>{ready=true;}}};
  const source=readFileSync('dist/media-videojs.js','utf8')
    .replace("import('./vendor/videojs-v10/video.js')",'importPlayer()');
  vm.runInNewContext(source,{
    document:{querySelector:s=>s==='#media'?section:modal},
    customElements:{whenDefined:()=>Promise.resolve()},
    IntersectionObserver:class{
      constructor(fn){observe=fn;}observe(){}disconnect(){disconnected=true;}
    },
    importPlayer:()=>{loads++;return new Promise(done=>{resolve=done;});},console
  });
  assert.equal(loads,0);
  observe([{isIntersecting:false}]);assert.equal(loads,0);
  observe([{isIntersecting:true}]);assert.equal(loads,1);
  events.click({target:{closest:()=>true}});assert.equal(loads,1);
  resolve();for(let i=0;i<10;i++)await Promise.resolve();
  assert.equal(ready,true);assert.equal(disconnected,true);
});
