import {readFileSync,writeFileSync} from 'node:fs';
// Preserve every original position and row label; style/number the demo only.
const data=JSON.parse(readFileSync('dist/seat-reference.json','utf8'));
data.layoutVersion=3;
const bands={
 'floor-1':{A:'DIAMOND',B:'DIAMOND',C:'DIAMOND',D:'DIAMOND',E:'DIAMOND',F:'DIAMOND',G:'DIAMOND',H:'SILVER',I:'SILVER',K:'SILVER',L:'SILVER',M:'SILVER',N:'RUBY',P:'RUBY',Q:'GOLD',R:'GOLD',S:'PLATINUM',T:'PLATINUM',U:'PLATINUM',LG:'PLATINUM'},
 'floor-2':{AA:'SAPPHIRE',BB:'SAPPHIRE',CC:'RUBY',A:'SAPPHIRE',B:'SAPPHIRE',C:'RUBY',D:'GOLD',E:'GOLD',F:'GOLD',G:'PLATINUM',H:'PLATINUM',I:'PLATINUM',LG:'SAPPHIRE'}
};
for(const floor of data.floors){
 const rows=Object.groupBy(data.seats.filter(s=>s.floorId===floor.id),s=>s.row);
 for(const [row,seats] of Object.entries(rows)){
  seats.sort((a,b)=>a.x-b.x||a.y-b.y);
  const middle=floor.width/2;
  const left=seats.filter(s=>s.x+s.width/2<middle),right=seats.filter(s=>s.x+s.width/2>=middle);
  for(const [side,list] of [left,right].entries())list.forEach((seat,i)=>{
   seat.id='numbered-'+seat.id;seat.number=String(i*2+(side===0?1:2));
   seat.categoryId=bands[floor.id][row];
   if(floor.id==='floor-1'&&row==='N'&&seat.x>180&&seat.x<510)seat.categoryId='SAPPHIRE';
  });
 }
}
writeFileSync('dist/seat-layout.json',JSON.stringify(data,null,2)+'\n');
console.log('Built numbered demo retaining all '+data.seats.length+' original seat positions');
