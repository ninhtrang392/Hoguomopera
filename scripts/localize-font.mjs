import {writeFileSync} from 'node:fs';
const url='https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap';
const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});
if(!response.ok)throw Error(response.status);
let css=await response.text();let index=0;
for(const url of new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))){
 const res=await fetch(url);if(!res.ok)throw Error(res.status);
 const name=`lora-${index++}.${url.includes('.woff2')?'woff2':'ttf'}`;
 writeFileSync('dist/assets/fonts/'+name,Buffer.from(await res.arrayBuffer()));
 css=css.replaceAll(url,'assets/fonts/'+name);
}
writeFileSync('dist/lora.css',css);console.log(`Saved Lora with ${index} font files.`);
