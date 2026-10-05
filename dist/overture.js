import {mountHeroMotion} from './hero-motion.js';
import {wingPose, crossedDownstroke, repelParticles} from './bird-flight.js';
// Locally vendored Three.js 0.170.0 / GSAP 3.12.5. Static HTML is the fallback.
const section = document.querySelector('.overture');
const words = {
  vi: {skip:'Bỏ qua mở màn',eyebrow:'HỒ GƯƠM OPERA · HÀ NỘI',title:'Nơi nghệ thuật',titleAccent:'thăng hoa',tagline:'DI SẢN TRONG TỪNG NHỊP SỐNG ĐƯƠNG ĐẠI'},
  en: {skip:'Skip overture',eyebrow:'HỒ GƯƠM OPERA · HANOI',title:'Where the arts',titleAccent:'come alive',tagline:'HERITAGE IN THE RHYTHM OF CONTEMPORARY LIFE'}
};
function translate() {
  const copy = words[document.documentElement.lang] || words.vi;
  section.querySelectorAll('[data-overture-i18n]').forEach(el => {el.textContent = copy[el.dataset.overtureI18n];});
}
translate();
const languageObserver = new MutationObserver(translate);
languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

async function startOverture() {
  if (!window.gsap || !window.ScrollTrigger) return;
  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  const host = section.querySelector('.overture-birds');
  const fallback = host.querySelector('img');
  // The artwork is only a particle mask. Render both particle cranes on all
  // screen sizes; mountHeroMotion respects the reduced-motion preference.
  let renderer, geometry, material, resizeObserver, stopMotion, companion, stopFlight, sparkGeometry, sparkMaterial;
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    stopMotion?.();
    stopFlight?.();
    resizeObserver?.disconnect();
    geometry?.dispose(); material?.dispose(); renderer?.dispose(); renderer?.domElement.remove();
    sparkGeometry?.dispose(); sparkMaterial?.dispose();
    companion?.geometry.dispose();
    companion?.material.dispose();
    languageObserver.disconnect();
    window.removeEventListener('pagehide', pageHide);
  };
  const pageHide = event => {if (!event.persisted) cleanup();};
  window.addEventListener('pagehide', pageHide);
  try {
    const THREE = await import('./vendor/three.module.js');
    await Promise.race([
      fallback.decode(),
      new Promise((_,reject) => setTimeout(() => reject(new Error('Image timeout')),5000))
    ]);
    if(disposed) return;
    const source = document.createElement('canvas');
    source.width = 500; source.height = 281;
    const ctx = source.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(fallback,0,0,500,281);
    const pixels = ctx.getImageData(0,0,500,281).data;
    const candidates=[];
    for(let y=0;y<240;y++) for(let x=0;x<395;x++) {
      // Isolate the large crane from the second bird in the supplied artwork.
      if(x>245 && y>185 || x>320 && y>120) continue;
      const i=(y*500+x)*4;
      if(pixels[i+3]>100 && pixels[i]>155 && pixels[i+1]>140) candidates.push([x,y]);
    }
    if(!candidates.length) throw new Error('No particle mask');
    const count=matchMedia('(max-width:760px)').matches || navigator.connection?.saveData?2800:8500;
    const points=[], wingIds=[], pointSeeds=[];
    let seed=137;
    const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
    for(let i=0;i<count;i++) {
      const [x,y]=candidates[Math.floor(random()*candidates.length)];
      // Follow the sloping back rather than cutting a rectangle out of the torso.
      const wing = x >= 115 && x < 250 && y < 142 - Math.max(0,220-x)*.28 ? 1 : 0;
      const point = [(x-200)/220,(135-y)/220,(random()-.5)*.025];
      points.push(...point); wingIds.push(wing); pointSeeds.push(random());
      // Reuse the feather silhouette for the far wing, with its own shoulder pose.
      if (wing) {points.push(...point);wingIds.push(2);pointSeeds.push(random());}
    }
    // A permanent rounded shoulder/torso under both wings prevents a hole when
    // the feather fans lift. Its points never participate in the wing transform.
    for(let i=0;i<Math.round(count*.16);i++) {
      const angle=random()*Math.PI*2, radius=Math.sqrt(random());
      const dx=Math.cos(angle)*radius*.25, dy=Math.sin(angle)*radius*.075;
      points.push(.08+dx,-.095+dy+dx*.28,(random()-.5)*.025);
      wingIds.push(0);pointSeeds.push(random());
    }
    const resting = new Float32Array(points);
    const positions = new Float32Array(points);
    const seeds = new Float32Array(pointSeeds);
    const wingTips = wingIds.map((wing,i)=>wing && resting[i*3+1]>.15 ? i : -1).filter(i=>i>=0);
    geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
    const uniforms={uTime:{value:0},uAssemble:{value:1},uDissolve:{value:0},uOpacity:{value:1},uRatio:{value:Math.min(devicePixelRatio,1.5)}};
    material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:`attribute float aSeed;
        uniform float uTime,uAssemble,uDissolve,uRatio,uOpacity; varying float vAlpha;
        void main(){vec3 p=position;
          vAlpha=(.35+aSeed*.5)*(1.-uDissolve)*uOpacity;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
          gl_PointSize=(1.1+aSeed*1.5)*uRatio;}`,
      fragmentShader:`varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);
        float a=(1.-smoothstep(.05,.5,d))*vAlpha;
        gl_FragColor=vec4(1.,.94,.79,a);}`
    });
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});
    renderer.setPixelRatio(uniforms.uRatio.value);
    renderer.setClearColor(0x000000,0);
    renderer.domElement.className='overture-flight';
    host.append(renderer.domElement);
    const scene=new THREE.Scene(), camera=new THREE.OrthographicCamera(-1.2,1.2,.8,-.8,.1,10);
    camera.position.z=3;
    const bird=new THREE.Points(geometry,material);bird.frustumCulled=false;scene.add(bird);
    bird.position.set(.12,0,0);
    companion=new THREE.Points(geometry.clone(),material.clone());
    companion.material.uniforms.uOpacity.value=.3;
    companion.frustumCulled=false;
    companion.scale.setScalar(.58);
    companion.position.set(-1,.12,-.1);
    scene.add(companion);
    const smallPositions=companion.geometry.attributes.position.array;
    const pointer={x:0,y:0,active:false};
    const trackPointer=event=>{if(event.pointerType==='touch')return;pointer.x=event.clientX;pointer.y=event.clientY;pointer.active=true;};
    const clearPointer=()=>{pointer.active=false;};
    section.addEventListener('pointermove',trackPointer,{passive:true});
    section.addEventListener('pointerleave',clearPointer);
    window.addEventListener('blur',clearPointer);
    const fields=[bird,companion].map(mesh=>({mesh,offsets:new Float32Array(resting.length),velocities:new Float32Array(resting.length)}));
    const applyRepulsion=dt=>{
      const rect=renderer.domElement.getBoundingClientRect();
      const active=pointer.active&&rect.width>0&&rect.height>0;
      const worldX=camera.left+(pointer.x-rect.left)/rect.width*(camera.right-camera.left);
      const worldY=camera.top-(pointer.y-rect.top)/rect.height*(camera.top-camera.bottom);
      const radius=45/Math.max(rect.width,1)*(camera.right-camera.left);
      for(const field of fields){
        const {mesh,offsets,velocities}=field;
        const local=active?{x:(worldX-mesh.position.x)/mesh.scale.x,y:(worldY-mesh.position.y)/mesh.scale.y}:null;
        repelParticles(mesh.geometry.attributes.position.array,offsets,velocities,local,radius/mesh.scale.x,dt);
        mesh.geometry.attributes.position.needsUpdate=true;
      }
    };
    const poseWings = (time, target=geometry, coordinates=positions) => {
      coordinates.set(resting);
      for(let i=0;i<wingIds.length;i++) {
        if (!wingIds[i]) continue;
        coordinates.set(wingPose(resting[i*3],resting[i*3+1],resting[i*3+2],wingIds[i],time),i*3);
      }
      target.attributes.position.needsUpdate=true;
    };
    const sparkCount = count < 8500 ? 360 : 900;
    const sparkPositions = new Float32Array(sparkCount*3);
    const sparkAlphas = new Float32Array(sparkCount);
    const sparks = Array.from({length:sparkCount},()=>({age:10,life:1,vx:0,vy:0}));
    let sparkCursor=0;
    sparkGeometry=new THREE.BufferGeometry();
    sparkGeometry.setAttribute('position',new THREE.BufferAttribute(sparkPositions,3).setUsage(THREE.DynamicDrawUsage));
    sparkGeometry.setAttribute('aAlpha',new THREE.BufferAttribute(sparkAlphas,1).setUsage(THREE.DynamicDrawUsage));
    sparkMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      uniforms:{uRatio:uniforms.uRatio},
      vertexShader:`attribute float aAlpha; uniform float uRatio; varying float vAlpha;
        void main(){vAlpha=aAlpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        gl_PointSize=(2.5+3.*aAlpha)*uRatio;}`,
      fragmentShader:`varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);
        gl_FragColor=vec4(1.,.91,.65,(1.-smoothstep(0.,.5,d))*vAlpha);}`});
    const sparkCloud=new THREE.Points(sparkGeometry,sparkMaterial);
    sparkCloud.frustumCulled=false;sparkCloud.position.copy(bird.position);scene.add(sparkCloud);
    const emitSparks=(sourceBird=bird, coordinates=positions)=>{
      if (!wingTips.length) return;
      const burst=Math.round((count<8500?65:160)*sourceBird.scale.x);
      for(let j=0;j<burst;j++) {
        const i=wingTips[Math.floor(random()*wingTips.length)];
        const slot=sparkCursor++%sparkCount;
        for(let axis=0;axis<3;axis++) {
          const key=['x','y','z'][axis];
          sparkPositions[slot*3+axis]=coordinates[i*3+axis]*sourceBird.scale[key]
            +sourceBird.position[key]-sparkCloud.position[key];
        }
        Object.assign(sparks[slot],{age:0,life:2+random()*1.5,vx:-.3-random()*.65,vy:(random()-.5)*.85});
      }
    };
    const resize=()=>{
      const {width,height}=host.getBoundingClientRect();
      renderer.setSize(width*3,height*3,false);
      const aspect=width/Math.max(height,1);
      camera.left=-2.4*aspect;camera.right=2.4*aspect;
      camera.top=2.4;camera.bottom=-2.4;camera.updateProjectionMatrix();
      renderer.render(scene,camera);
    };
    resize(); resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
    poseWings(0);
    poseWings(0,companion.geometry,smallPositions);
    renderer.render(scene,camera);fallback.hidden=true;
    // Flight enters from the left once; the torso then rests while wings flap.
    stopMotion = mountHeroMotion(section, null, null);
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const startX=-camera.right-1;
    if(!reducedMotion.matches) {bird.position.x=startX;companion.position.x=startX;companion.visible=false;}
    renderer.render(scene,camera);
    let visible = false;
    const visibilityObserver = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting;});
    visibilityObserver.observe(section);
    const flap = (_time, delta) => {
      if (disposed || !visible || document.hidden || reducedMotion.matches) return;
      const dt=Math.min(delta,50)/1000;
      const previous=uniforms.uTime.value;
      uniforms.uTime.value += dt;
      const arrival=Math.min(1,uniforms.uTime.value/3.2);
      bird.position.x=startX+(.12-startX)*(1-Math.pow(1-arrival,3));
      // Slow, small vertical drift; ease its amplitude in during arrival.
      bird.position.y=Math.sin(uniforms.uTime.value*Math.PI*2/5.6)*.035
        *arrival*arrival*(3-2*arrival);
      poseWings(uniforms.uTime.value);
      if(crossedDownstroke(previous,uniforms.uTime.value)) emitSparks();
      const smallTime=Math.max(0,uniforms.uTime.value-.7);
      const smallArrival=Math.min(1,smallTime/3.6);
      companion.visible=uniforms.uTime.value>=.7;
      companion.position.x=startX+(-1-startX)*(1-Math.pow(1-smallArrival,3));
      companion.position.y=.12+Math.sin(smallTime*Math.PI*2/5.6)*.025
        *smallArrival*smallArrival*(3-2*smallArrival);
      poseWings(smallTime,companion.geometry,smallPositions);
      if(companion.visible && crossedDownstroke(Math.max(0,previous-.7),smallTime)) emitSparks(companion,smallPositions);
      applyRepulsion(dt);
      sparks.forEach((spark,i)=>{
        spark.age+=dt;
        const life=Math.max(0,1-spark.age/spark.life);
        sparkAlphas[i]=life*life;
        if(!life)return;
        sparkPositions[i*3]+=spark.vx*dt;
        sparkPositions[i*3+1]+=spark.vy*dt;
        spark.vy-=.055*dt;
      });
      sparkGeometry.attributes.position.needsUpdate=true;
      sparkGeometry.attributes.aAlpha.needsUpdate=true;
      renderer.render(scene,camera);
    };
    gsap.ticker.add(flap);
    stopFlight = () => {gsap.ticker.remove(flap);visibilityObserver.disconnect();section.removeEventListener('pointermove',trackPointer);section.removeEventListener('pointerleave',clearPointer);window.removeEventListener('blur',clearPointer);};
    renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      stopFlight();
      stopMotion?.();
      renderer.domElement.style.opacity = '0';
      stopMotion = mountHeroMotion(section, null, null);
    }, {once:true});
    document.fonts.ready.then(() => {if (!disposed) ScrollTrigger.refresh();});
  } catch(error) {cleanup();console.warn('Overture: particle cranes unavailable.',error);}
}
startOverture();
