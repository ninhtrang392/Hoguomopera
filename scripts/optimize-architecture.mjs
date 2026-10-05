import {execFileSync} from 'node:child_process';
// Preserve the original PNG; generate responsive WebP delivery assets.
for(const [suffix,width,quality] of [['',null,88],['-mobile',900,85]]){
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',
    '-i','dist/assets/hero-architecture.png',
    ...(width?['-vf',`scale=${width}:-1`]:[]),
    '-frames:v','1','-c:v','libwebp','-quality',String(quality),
    '-compression_level','6',`dist/assets/hero-architecture${suffix}.webp`]);
}
