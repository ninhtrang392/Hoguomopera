import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// DOM test doubles exercise the full controller with a server-authoritative fixture.
// This geometry is test-only and never shipped as the venue's seat plan.
test('guest flow confirms a hold, restores buyer, retries failure, waits for backend and issues one ticket per seat',async()=>{
  const previous=new Map();
  const install=(key,value)=>{previous.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});};
  class Element {
    constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.hidden=false;this.disabled=false;this.attributes={};this.events={};this.textContent='';this.style={setProperty(){}};this.classList={toggle(){},add(){},remove(){}};this.clientWidth=900;this.clientHeight=500;this.value='';}
    get childNodes(){return this.children;}
    append(...nodes){this.children.push(...nodes);}prepend(...nodes){this.children.unshift(...nodes);}replaceChildren(...nodes){this.children=[...nodes];}
    setAttribute(k,v){this.attributes[k]=v;}removeAttribute(k){delete this.attributes[k];}
    addEventListener(name,fn){this.events[name]=fn;}focus(){}showModal(){this.open=true;}close(){this.open=false;}
    getBoundingClientRect(){return {left:0,top:0,width:900,height:500};}
  }
  const elements=new Map();const node=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s);};
  const screens=['dates','seats','buyer','payment','demo-payment','pending','failed','success'].map(screen=>{const el=node(`[data-screen="${screen}"]`);el.dataset.screen=screen;return el;});
  const progress=[1,2,3].map(step=>{const el=new Element();el.dataset.progress=String(step);return el;});
  const form=node('#buyer-form');form.elements={};for(const key of ['name','phone','email','consent','marketing'])form.elements[key]=new Element('input');form.reportValidity=()=>true;
  const document={querySelector:node,querySelectorAll:s=>s==='[data-screen]'?screens:s==='[data-progress]'?progress:s==='[data-ticket-preview]'?[node('preview1'),node('preview2')]:s==='[data-countdown]'?[node('countdown')]:s==='.hold-label'?[node('hold-label')]:[],createElement:tag=>new Element(tag),createTextNode:value=>({textContent:value}),addEventListener(){},activeElement:null,hidden:false};
  let current=null,paymentResult='FAILED',selectConflict=false;
  const requests=[],tickers=[];
  const show={id:'show',dateLabel:'24.10.2026',time:'20:00',weekday:'Thứ Bảy',availability:'AVAILABLE'};
  const seat={id:'seat-1',floorId:'floor-1',floorLabel:'Tầng kiểm thử',row:'G',number:'12',x:200,y:200,width:30,height:30,categoryId:'diamond',categoryName:'DIAMOND',price:3000000,availability:'AVAILABLE'};
  const inventory={floors:[{id:'floor-1',label:'Tầng kiểm thử',width:900,height:600,stage:{x:100,y:0,width:700,height:50}}],categories:[{id:'diamond',name:'DIAMOND',price:3000000}],seats:[seat]};
  const respond=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
  install('document',document);install('window',{addEventListener(){},history:{pushState(){},replaceState(){}}});install('history',window.history);
  install('location',{href:'http://localhost/dat-ve.html?program=hoanca',origin:'http://localhost',search:'?program=hoanca',assign(){}});
  install('performancePrograms',{hoanca:{title:'Khúc hoan ca',image:'assets/posters/hoanca.webp'}});
  install('ResizeObserver',class{observe(){}});install('requestAnimationFrame',fn=>fn());install('setInterval',fn=>{tickers.push(fn);return 1;});
  const storage=new Map();install('sessionStorage',{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)});
  install('FormData',class{get(k){return form.elements[k].value;}has(k){return !!form.elements[k].checked;}});
  install('fetch',async(url,options)=>{
    requests.push({url,options});const body=options.body?JSON.parse(options.body):{};
    if(url.includes('/programmes/'))return respond({performances:[show],termsUrl:'/terms',privacyUrl:'/privacy'});
    if(url.includes('/inventory'))return respond(inventory);
    if(url.endsWith('/session/seats')){
      if(selectConflict)return respond({code:'seat_unavailable',message:'Taken'},409);
      current={id:'order',programmeId:'hoanca',status:'SEAT_HELD',revision:1,serverTime:new Date().toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),performance:show,seats:body.seatIds.length?[seat]:[],quote:{subtotal:3000000,serviceFee:0,total:3000000},paymentMethods:[{id:'bank',label:'Ngân hàng',description:'Cổng ngân hàng'}]};return respond(current);
    }
    if(url.endsWith('/session/buyer')){current={...current,buyer:body.buyer,revision:2};return respond(current);}
    if(url.endsWith('/session/payments')){current={...current,status:paymentResult};return respond({session:current});}
    if(url.endsWith('/session'))return respond(current);
    throw Error('Unexpected request '+url);
  });
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  try {
    await import(`../dist/booking.js?flow-test=${Date.now()}`);await flush();await flush();
    assert.equal(node('#booking-empty').hidden,true);
    assert.ok(requests.some(call=>call.url.includes('/inventory')), 'seat inventory loads without an intermediate date step');
    assert.equal(node('[data-screen="seats"]').hidden,false);
    const seatButton=()=>node('#seat-map').children.find(el=>el.tagName==='BUTTON');
    selectConflict=true;seatButton().events.click({preventDefault(){}});await flush();await flush();
    assert.equal(node('#seat-count').textContent,'(0)');assert.match(node('#booking-notice').textContent,/vừa được người khác đặt/);
    selectConflict=false;
    seatButton().events.click({preventDefault(){}});await flush();await flush();
    assert.equal(node('#seat-count').textContent,'(1)');assert.equal(node('#to-buyer').disabled,false);
    node('#to-buyer').onclick();assert.equal(node('[data-screen="buyer"]').hidden,false);
    assert.equal(node('#payment-methods').children.length,1,'payment choices appear alongside buyer fields');
    form.reportValidity=()=>false;
    await node('#pay').onclick();
    assert.ok(!requests.some(r=>r.url.endsWith('/session/buyer')||r.url.endsWith('/payments')),'invalid buyer form cannot save or pay');
    form.reportValidity=()=>true;
    form.elements.name.value='Test Buyer';form.elements.phone.value='0900000000';form.elements.email.value='test@example.test';form.elements.consent.checked=true;
    await form.events.submit({preventDefault(){},currentTarget:form});
    assert.equal(current.buyer.email,'test@example.test');assert.equal(current.buyer.marketing,false);
    assert.equal(node('[data-screen="failed"]').hidden,false);assert.equal(current.seats.length,1);
    node('#retry-payment').onclick();assert.equal(node('[data-screen="buyer"]').hidden,false);paymentResult='PENDING_PAYMENT';await node('#pay').onclick();
    assert.equal(node('[data-screen="pending"]').hidden,false);assert.equal(node('#issued-tickets').children.length,0);
    current={...current,status:'TICKET_ISSUED',tickets:[{seatId:'seat-1',code:'TEST-ONLY',qrImageUrl:'/api/booking/qr'}],ticketsPdfUrl:'/api/booking/pdf',emailStatus:'SENT'};
    await node('#check-payment').onclick();assert.equal(node('[data-screen="success"]').hidden,false);assert.equal(node('#issued-tickets').children.length,1);assert.equal(node('#download-tickets').hidden,false);
    const payments=requests.filter(r=>r.url.endsWith('/payments'));assert.equal(payments.length,2);assert.ok(payments.every(r=>r.options.headers['Idempotency-Key']));
    assert.notEqual(payments[0].options.headers['Idempotency-Key'],payments[1].options.headers['Idempotency-Key'],'confirmed failure permits an explicit new payment attempt');
    current={...current,status:'EXPIRED',expiresAt:new Date(Date.now()-1000).toISOString()};await node('#check-payment').onclick();
    assert.equal(node('#expired-dialog').open,true);await node('#reselect-seats').onclick();
    assert.equal(node('[data-screen="seats"]').hidden,false);assert.match(node('#performance-label').textContent,/24.10.2026/);assert.equal(node('#seat-count').textContent,'(0)');
    // An absent backend uses the explicitly labelled demo without backend mutations.
    const reference=JSON.parse(readFileSync('dist/seat-layout.json','utf8'));
    const offlineCalls=[];
    globalThis.fetch=async(url,options)=>{offlineCalls.push({url,options});return url==='seat-layout.json'?respond(reference):respond({code:'service_unavailable',message:'Offline'},503);};
    new vm.Script(readFileSync('dist/booking.bundle.js','utf8'),{filename:'booking.bundle.js'}).runInThisContext();await flush();await flush();
    assert.equal(node('#booking-title').textContent,'Khúc hoan ca','production script initializes programme without module loading');
    assert.equal(node('#performance-list').children.length,2);
    await node('#choose-seats').onclick();
    assert.equal(node('#seat-map').children.filter(el=>el.tagName==='BUTTON').length,reference.seats.length);
    assert.equal(node('#to-buyer').disabled,true);assert.equal(node('#seat-count').textContent,'(0)');
    assert.ok(!offlineCalls.some(call=>call.url.endsWith('/session/seats')));
    assert.ok(!offlineCalls.some(call=>call.url==='seat-layout.json'),'production reference does not require a file:// fetch');
    const demoSeat=node('#seat-map').children.find(el=>el.tagName==='BUTTON'&&!el.disabled);
    assert.ok(demoSeat,'demo exposes selectable numbered seats');
    demoSeat.events.click({preventDefault(){}});await flush();await flush();
    assert.equal(node('#seat-count').textContent,'(1)');assert.equal(node('#to-buyer').disabled,false);
    const completeDemo=async()=>{
      assert.equal(node('[data-screen="demo-payment"]').hidden,false);
      await node('#demo-prepare').onclick();node('#demo-otp').value='123456';await node('#demo-confirm').onclick();
      assert.equal(node('[data-screen="pending"]').hidden,false);
      const clock=Date.now;const now=clock();Date.now=()=>now+3000;
      try{await node('#check-payment').onclick();}finally{Date.now=clock;}
    };
    node('#to-buyer').onclick();await form.events.submit({preventDefault(){},currentTarget:form});await completeDemo();
    assert.equal(node('[data-screen="success"]').hidden,false);
    assert.equal(node('#issued-tickets').children.length,1);
    assert.equal(node('#print-demo-ticket').hidden,false);
    assert.match(node('#ticket-status').textContent,/demo/);
    // Every programme must reach seat selection and issue its own demo ticket
    // when the production API is unavailable, using the catalogue's dates.
    const expectedDates={symphony:['10.07.2026'],musical:['23.05.2026','24.05.2026'],loi:['17.09.2026'],traviata:['30.07.2026','31.07.2026'],hoanca:['24.10.2026','25.10.2026'],tinhyeu:['12.10.2026']};
    for(const [id,dates] of Object.entries(expectedDates)){
      storage.clear();location.search=`?program=${id}`;
      new vm.Script(readFileSync('dist/booking.bundle.js','utf8')).runInThisContext();await flush();await flush();
      assert.equal(node('#booking-empty').hidden,true,id);
      assert.deepEqual(node('#performance-list').children.map(button=>button.children[1].textContent),dates,id);
      assert.equal(node('[data-screen="seats"]').hidden,false,id);
      const availableSeat=node('#seat-map').children.find(el=>el.tagName==='BUTTON'&&!el.disabled);
      assert.ok(availableSeat,id);availableSeat.events.click({preventDefault(){}});await flush();await flush();
      assert.equal(node('#to-buyer').disabled,false,id);
      node('#to-buyer').onclick();await form.events.submit({preventDefault(){},currentTarget:form});await completeDemo();
      assert.equal(node('[data-screen="success"]').hidden,false,id);
      assert.equal(node('#issued-tickets').children.length,1,id);
      const saved=JSON.parse([...storage.values()].find(value=>value?.includes('TICKET_ISSUED')));
      assert.equal(saved.programmeId,id);assert.equal(saved.performance.dateLabel,dates[0]);
    }
  } finally {for(const [key,descriptor] of previous){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
