// Extract seat geometry from the supplied PNG, never infer hidden seat numbers.
import {readFileSync,writeFileSync} from 'node:fs';
import {inflateSync} from 'node:zlib';
const png=readFileSync('dist/assets/booking/seat-reference.png');
let width,height,channels;const chunks=[];
for(let i=8;i<png.length;){const length=png.readUInt32BE(i),type=png.toString('ascii',i+4,i+8),data=png.subarray(i+8,i+8+length);if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);channels=data[9]===6?4:data[9]===2?3:0;if(data[8]!==8||!channels||data[12])throw Error('Unsupported PNG format');}if(type==='IDAT')chunks.push(data);i+=length+12;}
const raw=inflateSync(Buffer.concat(chunks)),pixels=Buffer.alloc(width*height*channels),stride=width*channels;
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){const index=y*stride+x,a=x>=channels?pixels[index-channels]:0,b=y?pixels[index-stride]:0,c=y&&x>=channels?pixels[index-stride-channels]:0;pixels[index]=(raw[y*(stride+1)+x+1]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;}}
const mask=new Uint8Array(width*height);
for(let y=135;y<=666;y++)for(let x=70;x<=657;x++){const i=(y*width+x)*channels;const [r,g,b]=pixels.subarray(i,i+3);if(r+g+b>155)mask[y*width+x]=1;}
const parts=[];
for(let y=135;y<=666;y++)for(let x=70;x<=657;x++){
  const start=y*width+x;if(!mask[start])continue;mask[start]=0;const queue=[start];let minX=x,maxX=x,minY=y,maxY=y,sumX=0,sumY=0;
  for(let j=0;j<queue.length;j++){const p=queue[j],px=p%width,py=Math.floor(p/width);sumX+=px;sumY+=py;minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);for(const next of [p-1,p+1,p-width,p+width])if(mask[next]){mask[next]=0;queue.push(next);}}
  if(maxX-minX>=9&&maxX-minX<=20&&maxY-minY>=9&&maxY-minY<=20&&queue.length>55)parts.push({x:Math.round((minX+maxX)/2),y:Math.round((minY+maxY)/2),pixels:queue.length});
}
parts.sort((a,b)=>a.y-b.y||a.x-b.x);
const rows=[];for(const part of parts){let row=rows.find(r=>Math.abs(r.y-part.y)<=3);if(!row){row={y:part.y,seats:[]};rows.push(row);}row.seats.push(part.x);}
rows.forEach(row=>row.seats.sort((a,b)=>a-b));
// The selected-seat halo joins adjacent components. These centers were checked
// against the original image. The component at (349,475) is the floor heading.
rows.find(r=>r.y===225).seats.push(525,543);
rows.find(r=>r.y===241).seats.push(507,525,543,559);
rows.find(r=>r.y===475).seats=rows.find(r=>r.y===475).seats.filter(x=>x!==349);
rows.forEach(row=>row.seats.sort((a,b)=>a-b));
writeFileSync('scripts/seat-reference-points.json',JSON.stringify({width,height,rows},null,2)+'\n');
const names1=['A','B','C','D','E','F','G','H','I','K','L','M','N','P','Q','R','S','LG','T','LG','U','LG'];
const names2=['LG','AA','BB','CC','A','B','C','D','E','F','G','H','I'];
const known={
  '241:110':'1','241:452':'20','241:470':'18','241:489':'16','241:507':'14','241:525':'12','241:559':'10','241:576':'8','241:594':'6','241:612':'4',
  '299:135':'3','299:154':'5','299:172':'7','299:190':'9','299:537':'10','299:555':'8','299:573':'6','299:592':'4',
  '315:294':'19','315:312':'21','315:385':'26','315:403':'24','315:421':'22','315:439':'20',
  '331:231':'13','331:248':'15','331:267':'17','331:285':'19','331:303':'21','331:321':'23','331:393':'26','331:411':'24','331:451':'18','331:469':'16','331:487':'14',
  '397:113':'1','397:130':'3','397:148':'5','397:469':'18','397:488':'16','397:574':'6','397:592':'4','397:609':'2',
  '429:451':'20','429:469':'18','429:487':'16','429:506':'14','429:524':'12','429:542':'10'
};
function colorAt(x,y){const counts={DIAMOND:0,GOLD:0,SAPPHIRE:0,PLATINUM:0};for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){const i=((y+dy)*width+x+dx)*channels;const [r,g,b]=pixels.subarray(i,i+3);if(r>120&&r>g*1.8&&r>b*1.8)counts.DIAMOND++;else if(r>105&&g>40&&r>g*1.3&&g>b*1.4)counts.GOLD++;else if(b>90&&b>r*1.5&&b>g*1.1)counts.SAPPHIRE++;else if(g>70&&g>r*1.5&&g>b*1.4)counts.PLATINUM++;}const [name,count]=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];return count>12?name:null;}
const seats=[];let first=0,second=0;
for(const row of rows){const upper=row.y<464, floorId=upper?'floor-1':'floor-2',label=upper?names1[first++]:names2[second++],offsetY=upper?85:464;for(const [index,x] of row.seats.entries()){
  const categoryId=row.y===241?'DIAMOND':colorAt(x,row.y);
  seats.push({id:`reference-${floorId}-${row.y}-${x}`,floorId,row:label,number:known[`${row.y}:${x}`]||null,position:index+1,x:x-8-7,y:row.y-offsetY-7,width:14,height:14,categoryId,availability:'UNVERIFIED'});
}}
const rowLabels=(upper)=>rows.filter(r=>(r.y<464)===upper).map((r,i)=>({text:(upper?names1:names2)[i],x:24,y:r.y-(upper?85:464)-7})).filter(l=>l.text!=='LG');
const data={reference:true,source:'assets/booking/seat-reference.png',note:'Bản tham chiếu theo ảnh cung cấp; số ghế bị che và trạng thái bán chưa được xác minh.',floors:[
  {id:'floor-1',label:'Tầng 1',width:704,height:379,stage:{x:175,y:0,width:348,height:27},labels:[{text:'Tầng 1',x:335,y:32},...rowLabels(true),{text:'LG',x:64,y:308},{text:'LG',x:628,y:308}]},
  {id:'floor-2',label:'Tầng 2',width:704,height:210,labels:[{text:'Tầng 2',x:335,y:0},...rowLabels(false)]}
],categories:[['DIAMOND',4500000],['GOLD',3500000],['SAPPHIRE',2500000],['PLATINUM',1800000],['RUBY',1200000],['SILVER',800000]].map(([name,referencePrice])=>({id:name,name,referencePrice})),seats};
writeFileSync('dist/seat-reference.json',JSON.stringify(data,null,2)+'\n');
console.log(`Traced ${seats.length} reference positions, ${seats.filter(s=>s.number).length} readable numbers. Unreadable numbers remain null.`);
