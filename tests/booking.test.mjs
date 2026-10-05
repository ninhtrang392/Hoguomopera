import test from 'node:test';
import assert from 'node:assert/strict';
import {createBookingAPI, BookingError, money, remaining, isPaid, isPending, sellable, safeURL} from '../dist/booking-api.js';
import {validInventory} from '../dist/seat-map.js';
import {readFileSync} from 'node:fs';

test('booking HTML contains every directly queried controller element',()=>{
  const html=readFileSync('dist/dat-ve.html','utf8');
  const source=readFileSync('dist/booking.js','utf8');
  const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  const required=new Set([...source.matchAll(/\$\('#([\w-]+)'\)/g)].map(m=>m[1]));
  for(const id of required)assert.ok(ids.has(id),`Missing #${id} prevents booking initialization`);
  assert.ok(html.indexOf('booking-screen.css')<html.indexOf('site-header.css'));
});

test('only confirmed payments unlock issued tickets',()=>{
  for(const status of ['DRAFT','SEAT_HELD','PENDING_PAYMENT','FAILED','EXPIRED','CANCELLED'])assert.equal(isPaid({status}),false);
  assert.equal(isPaid({status:'PAID'}),true);assert.equal(isPaid({status:'TICKET_ISSUED'}),true);
  assert.equal(isPending({status:'PENDING_PAYMENT'}),true);
});
test('hold timer uses absolute expiry and handles invalid/missing deadlines',()=>{
  const now=Date.parse('2026-10-24T12:00:00Z');
  assert.equal(remaining('2026-10-24T12:10:00Z',now),600);
  assert.equal(remaining('2026-10-24T11:59:59Z',now),0);
  assert.equal(remaining(undefined,now),0);
});
test('invitation, unknown, free and sold seats never become sellable',()=>{
  const categories=[{id:'diamond',name:'DIAMOND',price:3000000},{id:'invitation',name:'COMPLIMENTARY',price:0}];
  assert.equal(sellable({categoryId:'diamond',availability:'AVAILABLE'},categories),true);
  for(const availability of ['SOLD','HELD','UNAVAILABLE'])assert.equal(sellable({categoryId:'diamond',availability},categories),false);
  for(const categoryId of ['invitation','unknown'])assert.equal(sellable({categoryId,availability:'AVAILABLE'},categories),false);
});
test('ticket URLs reject missing, script, external QR and insecure redirects',()=>{
  for(const value of [undefined,null,'','javascript:alert(1)','data:text/html,test','https://elsewhere.test/qr'])assert.equal(safeURL(value),null);
  assert.equal(safeURL('/api/booking/ticket.pdf'),'http://localhost/api/booking/ticket.pdf');
  assert.equal(safeURL('https://payment.test/pay',{external:true}),'https://payment.test/pay');
  assert.equal(safeURL('http://payment.test/pay',{external:true}),null);
});
test('API mutations carry server revision and idempotency and never place buyer data in URL',async()=>{
  const calls=[];const api=createBookingAPI(async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({status:'SEAT_HELD'}),{headers:{'content-type':'application/json'}});});
  await api.select('show/1',['G12'],8,'hold-key');await api.pay('bank',9,'payment-key');await api.buyer({name:'A',email:'a@example.test'},10);
  assert.equal(calls[0].options.headers['Idempotency-Key'],'hold-key');
  assert.deepEqual(JSON.parse(calls[0].options.body),{performanceId:'show/1',seatIds:['G12'],revision:8});
  assert.equal(calls[1].options.headers['Idempotency-Key'],'payment-key');
  assert.equal(calls[2].url,'/api/booking/session/buyer');
  assert.equal(calls[2].options.credentials,'same-origin');assert.equal(calls[2].options.cache,'no-store');
});
test('conflicts preserve machine-readable errors; absent backend fails closed',async()=>{
  const conflict=createBookingAPI(async()=>new Response(JSON.stringify({code:'seat_unavailable',message:'Seat taken'}),{status:409,headers:{'content-type':'application/json'}}));
  await assert.rejects(conflict.select('p',['G12'],1,'key'),error=>error instanceof BookingError&&error.code==='seat_unavailable'&&error.status===409);
  const offline=createBookingAPI(async()=>new Response('<html>Not found</html>',{status:404,headers:{'content-type':'text/html'}}));
  await assert.rejects(offline.programme('hoanca'),{code:'service_unavailable'});
  const timeout=createBookingAPI(async()=>{throw Error('timeout');});await assert.rejects(timeout.pay('bank',1,'key'),{code:'connection_error'});
});
test('venue geometry must exist; no generated rows or seats are substituted',()=>{
  assert.equal(validInventory({floors:[],categories:[],seats:[]}),false);
  const floor={id:'official-floor',width:900,height:600,stage:{x:100,y:0,width:700,height:60}};
  const seat={id:'official-seat',floorId:floor.id,x:135,y:240,width:24,height:24};
  const fixture={floors:[floor],categories:[],seats:[seat]};
  assert.equal(validInventory(fixture),true);
  assert.equal(validInventory({...fixture,seats:[seat,seat]}),false);
  assert.equal(validInventory({...fixture,seats:[{...seat,floorId:'invented-floor'}]}),false);
});
test('money rejects missing and invalid prices',()=>{
  assert.equal(money(undefined),'Chưa công bố');assert.equal(money(-1),'Chưa công bố');assert.equal(money(1.5),'Chưa công bố');assert.match(money(3000000),/3\.000\.000/);
});
test('supplied reference keeps both floors and hidden numbers without exposing sellable inventory',()=>{
  const data=JSON.parse(readFileSync('dist/seat-reference.json','utf8'));
  assert.equal(validInventory(data),true);assert.equal(data.reference,true);
  assert.deepEqual(data.floors.map(f=>f.label),['Tầng 1','Tầng 2']);
  assert.equal(data.floors[1].stage,undefined,'do not invent a second stage');
  assert.ok(data.seats.some(s=>s.number===null));
  assert.ok(data.seats.every(s=>s.availability==='UNVERIFIED'&&!sellable(s,data.categories)));
  assert.ok(data.categories.every(c=>c.price===undefined&&Number.isInteger(c.referencePrice)));
  for(const floor of data.floors){const seats=data.seats.filter(s=>s.floorId===floor.id);assert.ok(seats.every(s=>s.x>=0&&s.y>=0&&s.x+s.width<=floor.width&&s.y+s.height<=floor.height));}
});
