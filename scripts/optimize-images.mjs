import {readdirSync,readFileSync,existsSync,statSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
// Generate smaller web assets without altering the supplied originals.
const sources=readdirSync('dist').filter(n=>/\.(html|css|js)$/.test(n));
const assets=new Set(existsSync('performance-assets.json') ? JSON.parse(readFileSync('performance-assets.json','utf8')).map(asset=>asset.from) : []);
for(const name of sources) for(const match of readFileSync(join('dist',name),'utf8').matchAll(/assets\/[\w./-]+\.(?:png|jpg|jpeg)/g)) assets.add(match[0]);
const results=[];
for(const asset of assets){
 const input=join('dist',asset); if(!existsSync(input)||statSync(input).size<100000)continue;
 const output=input.replace(/\.(png|jpe?g)$/,'.webp');
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-frames:v','1','-c:v','libwebp','-quality','82','-compression_level','6',output]);
 if(statSync(output).size<statSync(input).size)results.push({from:asset,to:asset.replace(/\.(png|jpe?g)$/,'.webp'),before:statSync(input).size,after:statSync(output).size});
}
writeFileSync('performance-assets.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({images:results.length,before:results.reduce((n,x)=>n+x.before,0),after:results.reduce((n,x)=>n+x.after,0)}));
