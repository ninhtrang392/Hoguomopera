import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createDemoBookingAPI} from '../dist/booking-demo.js';
const reference=JSON.parse(readFileSync('dist/seat-reference.json','utf8'));
test('demo prices, sold seats, hold, retry and individually marked tickets',async()=>{
 const saved=new Map(),storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
 const api=createDemoBookingAPI(reference,'hoanca',storage);
 const inventory=await api.inventory(),programme=await api.programme();
 const available=inventory.seats.filter(s=>s.availability==='AVAILABLE'),sold=inventory.seats.find(s=>s.availability==='SOLD');
 assert.ok(available.length>2);await assert.rejects(api.select(programme.performances[0].id,[sold.id]),{code:'seat_unavailable'});
 let session=await api.select(programme.performances[0].id,available.slice(0,2).map(s=>s.id));
 assert.equal(session.quote.total,session.quote.subtotal*1.02);assert.equal(session.seats.length,2);
 assert.equal((await createDemoBookingAPI(reference,'hoanca',storage).session()).id,session.id);
 await api.buyer({name:'Khách demo',email:'demo@example.test',phone:'0900000000',consent:true,marketing:false});
 const clock=Date.now;let now=clock();Date.now=()=>now;
 try{
 session=(await api.pay('demo-card',session.revision,'failed','failed')).session;
 assert.equal(session.status,'AUTHORIZING');
 assert.equal((await api.pay('demo-card',session.revision,'duplicate')).session.attempt.id,session.attempt.id);
 await api.prepare(session.attempt.id,'Visa demo');
 await assert.rejects(api.confirm(session.attempt.id,'000000'),{code:'invalid_code'});
 await api.confirm(session.attempt.id,'123456');now+=2600;
 assert.equal((await api.session()).status,'FAILED');assert.equal((await api.session()).seats.length,2);
 session=(await api.pay('demo-qr',null,'success')).session;await api.prepare(session.attempt.id,'Ngân hàng demo');await api.confirm(session.attempt.id);now+=2600;
 session=await api.session();assert.equal(session.status,'TICKET_ISSUED');assert.equal(session.tickets.length,2);assert.ok(session.tickets.every(t=>t.code.startsWith('DEMO-')));assert.notEqual(session.tickets[0].code,session.tickets[1].code);assert.notEqual(session.tickets[0].qrImageUrl,session.tickets[1].qrImageUrl);assert.equal(session.emailStatus,'DEMO');
 assert.deepEqual((await api.confirm(session.attempt.id)).tickets,session.tickets,'duplicate confirmation cannot issue more tickets');
 }finally{Date.now=clock;}
 await api.release();assert.equal(await api.session(),null);
});

test('demo cancellation, delayed restoration and expiry invalidate old attempts',async()=>{
 const saved=new Map(),storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
 const clock=Date.now;let now=clock();Date.now=()=>now;
 try{
 let api=createDemoBookingAPI(reference,'hoanca',storage);
 const show=(await api.programme()).performances[0],seat=(await api.inventory()).seats.find(s=>s.availability==='AVAILABLE');
 await api.select(show.id,[seat.id]);await api.buyer({name:'Demo',email:'test@example.test',consent:true});
 const cancelled=(await api.pay('demo-wallet',null,'cancel')).session.attempt.id;
 await api.cancel(cancelled);assert.equal((await api.session()).seats.length,1);
 let session=(await api.pay('demo-wallet',null,'slow','slow')).session;
 await assert.rejects(api.confirm(cancelled),{code:'stale_attempt'});
 await api.prepare(session.attempt.id,'MoMo demo');await api.confirm(session.attempt.id);
 now+=3000;api=createDemoBookingAPI(reference,'hoanca',storage);
 assert.equal((await api.session()).status,'PENDING_PAYMENT');await assert.rejects(api.release(),{code:'pending'});
 now+=10000;assert.equal((await api.session()).status,'TICKET_ISSUED');
 await api.release();await api.select(show.id,[seat.id]);await api.buyer({name:'Demo',consent:true});
 session=(await api.pay('demo-qr',null,'expiry','expired')).session;await api.prepare(session.attempt.id,'Bank');await api.confirm(session.attempt.id);
 now+=3000;session=await api.session();assert.equal(session.status,'EXPIRED');assert.equal(session.tickets.length,0);
 await assert.rejects(api.confirm(session.attempt.id),{code:'hold_expired'});
 assert.equal((await api.inventory()).seats.find(s=>s.id===seat.id).availability,'AVAILABLE');
 }finally{Date.now=clock;}
});
