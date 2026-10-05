import {execFileSync} from 'node:child_process';
for(const [name,width] of [['hero-sky',768],['hero-theatre',900],['hero-cranes',500],['hero-drum',900]]){
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',`dist/assets/${name}.png`,'-vf',`scale=${width}:-1`,'-frames:v','1','-c:v','libwebp','-quality','78','-compression_level','6',`dist/assets/${name}-mobile.webp`]);
}
