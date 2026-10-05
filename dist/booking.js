import {createBookingAPI, money, remaining, isPaid, isPending, safeURL} from './booking-api.js';
import {mountSeatMap, validInventory} from './seat-map.js';
import {createDemoBookingAPI, demoQR} from './booking-demo.js';
let api=createBookingAPI();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const programId=new URLSearchParams(location.search).get('program') || 'hoanca';
const program=performancePrograms[programId];
let programme, performance, inventory, session, busy=false, syncing=false, screen='seats', methodId='', serverOffset=0, leaveURL='index.html#programs', paymentUncertain=false;
let lastPoll=0, expiredShown=false;
let stateVersion=0;
const paymentKeys=new Map();
let referenceInventory;
const ids=()=>session?.seats?.map(s=>s.id)||[];
const held=()=>session?.seats?.length && !isPaid(session) && session.status!=='EXPIRED' && (isPending(session)||remaining(session.expiresAt,Date.now()+serverOffset)>0);
const notice=message=>{$('#booking-notice').textContent=message;$('#booking-notice').hidden=!message;};
const text=(tag,value,className)=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
const performanceText=p=>p?`${p.dateLabel} · ${p.time} · Nhà hát Hồ Gươm`:'Nhà hát Hồ Gươm · 40 Hàng Bài, Hà Nội';
function setScreen(next,{history=true,focus=true}={}) {
  if(next==='dates')next='seats';
  if(next==='payment')next='buyer';
  screen=next;$$('[data-screen]').forEach(el=>el.hidden=el.dataset.screen!==next);
  const step=next==='dates'?1:next==='seats'?2:3;
  $$('[data-progress]').forEach(el=>{const current=Number(el.dataset.progress);el.classList.toggle('complete',current<step);if(current===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  $('#mobile-booking-bar').hidden=next!=='seats';
  if(history)window.history.pushState({booking:true,screen:next},'',`#${next}`);
  if(focus)$(`[data-screen="${next}"] h2`)?.focus({preventScroll:true});
  if(next==='seats')requestAnimationFrame(()=>map.reset());
  renderSummary();
}
const map=mountSeatMap({viewport:$('#seat-viewport'),map:$('#seat-map'),categoryList:$('#category-list'),detail:$('#seat-detail'),onSelect:seat=>changeSeats(ids().includes(seat.id)?ids().filter(id=>id!==seat.id):[...ids(),seat.id],seat)});
function totals(quote) {
  const box=document.createElement('div');box.className='totals';
  for(const [label,value] of [['Tạm tính',quote?.subtotal],['Phí dịch vụ',quote?.serviceFee],['Tổng cộng',quote?.total]]){const row=document.createElement('div');row.append(text('span',label),text('strong',money(value)));box.append(row);}return box;
}
function selectionList(removable=true) {
  const list=document.createElement('ul');list.className='selected-seats';
  if(!ids().length)list.append(text('li','Chưa có ghế được chọn.'));
  for(const seat of session?.seats||[]) {
    const li=document.createElement('li');li.append(text('strong',`${seat.floorLabel} · Hàng ${seat.row} · Ghế ${seat.number}`),text('small',seat.categoryName),text('span',money(seat.price)));
    if(removable){const remove=text('button','×','remove-seat');remove.setAttribute('aria-label',`Bỏ ghế ${seat.row}${seat.number}`);remove.disabled=busy||isPending(session);remove.onclick=()=>changeSeats(ids().filter(id=>id!==seat.id));li.append(remove);}list.append(li);
  }return list;
}
function ticket(seats,{issued=false,ticketData=null}={}) {
  const el=document.createElement('article');el.className='admission-ticket';
  const top=document.createElement('div');top.className='ticket-top';
  const brand=document.createElement('div');brand.className='ticket-masthead';
  const logo=document.createElement('img');logo.src='assets/logo.png';logo.alt='Nhà hát Hồ Gươm';
  brand.append(logo,text('span','VÉ XEM BIỂU DIỄN\nHỒ GƯƠM OPERA','ticket-edition'));top.append(brand);
  const art=document.createElement('div');art.className=programId==='hoanca'?'ticket-art-panel ticket-art-banner':'ticket-art-panel';
  const artwork=document.createElement('img');artwork.className='ticket-artwork';artwork.src=programId==='hoanca'?'assets/booking/hoanca-cover.png':program.image;artwork.alt=program.title;
  art.append(artwork,text('h3',program?.title||session?.programmeTitle||''));top.append(art);
  const date=document.createElement('div');date.className='ticket-date';date.append(text('span',`▦  ${performance?.weekday?performance.weekday+', ':''}${performance?.dateLabel||''}`),text('span',`◷  ${performance?.time||''}`));
  top.append(date,text('p','Nhà hát Hồ Gươm','ticket-venue'),text('p','40 Hàng Bài, Hà Nội','ticket-address'));
  const middle=document.createElement('div');middle.className='ticket-middle';
  const facts=document.createElement('dl');facts.className='ticket-facts';
  const addFact=(label,value)=>{const row=document.createElement('div');row.append(text('dt',label),text('dd',value));facts.append(row);};
  addFact('HẠNG VÉ',[...new Set(seats.map(s=>s.categoryName))].join(' · ')||'Chưa chọn');
  const groups=new Map();for(const seat of seats){const key=`${seat.floorLabel} · Hàng ${seat.row}`;groups.set(key,[...(groups.get(key)||[]),seat.number]);}
  addFact('VỊ TRÍ',[...groups].map(([label,numbers])=>`${label} · Ghế ${numbers.join(', ')}`).join('\n')||'—');
  addFact('SỐ LƯỢNG',`${seats.length} vé`);
  const prices=[...new Set(seats.map(s=>s.price))];
  addFact('ĐƠN GIÁ',prices.length===1?`${money(prices[0])} / vé`:seats.length?seats.map(s=>`${s.categoryName}: ${money(s.price)}`).filter((s,i,a)=>a.indexOf(s)===i).join('\n'):'—');
  middle.append(facts);
  const amount=document.createElement('div');amount.className='ticket-amount';amount.append(text('span',issued?'GIÁ VÉ':'TỔNG THANH TOÁN'),text('strong',money(issued?seats.reduce((sum,s)=>sum+s.price,0):session?.quote?.total)));
  if(!issued&&session?.quote?.serviceFee)amount.append(text('small',`Đã gồm phí dịch vụ ${money(session.quote.serviceFee)}`));middle.append(amount);
  const bottom=document.createElement('div');bottom.className='ticket-bottom';
  const codes=document.createElement('div');codes.className='ticket-codes';
  const url=issued&&ticketData?(session?.demo?demoQR(ticketData.code):safeURL(ticketData.qrImageUrl)):null;
  if(url){const image=document.createElement('img');image.src=url;image.alt=session?.demo?'Mã minh họa DEMO, không dùng vào cửa':`Mã QR vé ${ticketData.code}`;codes.append(image);}else codes.append(text('div','QR\nCHƯA PHÁT HÀNH','ticket-code-placeholder'));
  const codeCopy=document.createElement('div');codeCopy.append(text('small',issued?'MÃ VÉ':'BẢN XEM TRƯỚC'),text('p',ticketData?.code||'Chờ xác nhận thanh toán','ticket-code'));
  if(session?.demo){const bars=document.createElement('div');bars.className='ticket-barcode';bars.setAttribute('aria-hidden','true');codeCopy.append(bars,text('small','MÃ MINH HỌA · DEMO'));}
  codes.append(codeCopy);bottom.append(codes,text('p','CẢM ƠN BẠN ĐÃ ĐỒNG HÀNH CÙNG\nNHÀ HÁT HỒ GƯƠM','ticket-thanks'));
  if(session?.demo)bottom.append(text('p','VÉ DEMO · KHÔNG CÓ GIÁ TRỊ VÀO CỬA','ticket-demo-note'));
  else if(!issued)bottom.append(text('p','Chưa có giá trị vào cửa','ticket-demo-note'));
  el.append(top,middle,bottom);return el;
}
function renderSummary() {
  const count=ids().length;
  const quote=session?.quote||(programme?.demo?{subtotal:0,serviceFee:0,total:0}:undefined);
  $('#seat-count').textContent=`(${count})`;$('#selected-seats').replaceChildren(...selectionList().childNodes);$('#seat-totals').replaceChildren(totals(quote));
  $('#mobile-total').textContent=`${count} vé · ${count?money(session?.quote?.total):money(0)}`;
  const canContinue=count>0 && held() && !busy && !isPending(session) && !paymentUncertain;
  $('#to-buyer').disabled=$('#mobile-continue').disabled=!canContinue;
  $$('.hold-label').forEach(el=>el.hidden=!count);
  $('#sheet-content').replaceChildren(selectionList(),totals(session?.quote));
  $$('[data-ticket-preview]').forEach(el=>el.replaceChildren(ticket(session?.seats||[])));
  $('#payment-totals').replaceChildren(totals(session?.quote));
  $('#pay').textContent=busy?'Đang xử lý…':`Thanh toán ${money(session?.quote?.total)}`;
  $('#pay').disabled=!canContinue||!methodId||!Number.isSafeInteger(session?.quote?.total);
  if(inventory)map.set(inventory,ids(),busy||isPending(session)||paymentUncertain);

  $('#choose-seats').disabled=!performance||busy;
  $('#clear-seats').disabled=!count||busy||isPending(session)||!!inventory?.reference;
  $('#seat-legend').hidden=!!inventory?.reference;
  $('#seat-performance-label').textContent=performanceText(performance);
  for(const button of $$('.performance-card')){
    const item=programme?.performances?.find(p=>p.id===button.dataset.performanceId);
    button.disabled=busy||!!held()||!!item&&(item.availability!=='AVAILABLE'&&!programme.reference);
  }
  if(inventory?.reference){
    $('#selected-seats').replaceChildren(text('li','Chạm vào ghế để xem vị trí trong ảnh. Chưa thể chọn hoặc giữ ghế.'));
    $('#seat-totals').replaceChildren(text('p','Giá trong chú giải lấy từ ảnh tham chiếu, chưa phải báo giá mở bán.','muted'));
  }
}
function acceptSession(next) {
  session=next;
  if(next?.serverTime){const offset=Date.parse(next.serverTime)-Date.now();if(Number.isFinite(offset))serverOffset=offset;}
  if(next?.performance){performance=next.performance;$('#performance-label').textContent=performanceText(performance);}
  if(next?.buyer){for(const name of ['name','phone','email'])if(document.activeElement!==$('#buyer-form').elements[name])$('#buyer-form').elements[name].value=next.buyer[name]||'';$('#buyer-form').elements.consent.checked=!!next.buyer.consent;$('#buyer-form').elements.marketing.checked=!!next.buyer.marketing;}
  renderSummary();tick();
}
async function getInventory() {
  if(!performance)return;
  const data=programme?.reference?referenceInventory:await api.inventory(performance.id);
  if(!validInventory(data))throw Error('Sơ đồ khán phòng chưa sẵn sàng. Vui lòng thử lại sau.');
  inventory=data;map.set(inventory,ids(),busy);return data;
}
function renderPerformances() {
  for(const selector of ['#performance-list','#seat-performance-list']){
    const list=$(selector);if(!list)continue;list.replaceChildren();
    for(const item of programme.performances||[]){
      const button=document.createElement('button');button.className='performance-card';
      button.dataset.performanceId=item.id;
      button.disabled=(item.availability!=='AVAILABLE'&&!programme.reference)||busy&&screen==='seats'||!!held();
      button.setAttribute('aria-pressed',String(performance?.id===item.id));
      button.append(text('small',item.weekday||'Suất diễn'),text('strong',item.dateLabel),text('span',item.time),text('small',programme.reference?'Xem sơ đồ tham khảo':item.availability==='AVAILABLE'?'Chọn suất diễn':'Chưa mở bán / Hết vé'));
      button.onclick=async()=>{
        if(busy||held())return;
        performance=item;$('#performance-label').textContent=performanceText(item);renderPerformances();renderSummary();
        if(screen==='seats'){busy=true;try{await getInventory();notice(inventory.reference?'Sơ đồ tham khảo · Chưa xác nhận giá và tình trạng mở bán.':'');}catch(error){notice(error.message);}finally{busy=false;renderSummary();renderPerformances();}}
      };
      list.append(button);
    }
  }
  $('#booking-empty').hidden=!!programme.performances?.length;
}
function methods() {
  $('#demo-scenarios').hidden=!session?.demo;
  const list=$('#payment-methods');list.replaceChildren();
  const available=session?.paymentMethods||[];
  if(!available.some(m=>m.id===methodId))methodId=available[0]?.id||'';
  for(const method of available){const label=document.createElement('label');label.className='payment-method';const radio=document.createElement('input');radio.type='radio';radio.name='payment-method';radio.value=method.id;radio.checked=methodId===method.id;radio.disabled=busy;radio.onchange=()=>{if(busy)return;methodId=method.id;methods();renderSummary();};const icon=text('span','▤','payment-method-icon');icon.setAttribute('aria-hidden','true');const iconName={'demo-card':'card','demo-wallet':'wallet','demo-qr':'qr'}[method.id];if(iconName){const image=document.createElement('img');image.src=`assets/booking/payment-${iconName}.svg`;image.alt='';image.width=32;image.height=32;icon.textContent='';icon.append(image);}label.append(radio,icon,text('strong',method.label),text('small',method.description||''));list.append(label);}
  $('#payment-description').textContent=available.find(m=>m.id===methodId)?.description||'Chưa có phương thức thanh toán khả dụng.';
  $('#payment-provider-note').hidden=!!session?.demo;
}
function success() {
  paymentUncertain=false;$('#continue-payment').hidden=true;
  setScreen('success',{history:false,focus:screen!=='success'});$('#issued-tickets').replaceChildren();
  const tickets=session?.tickets||[];
  $('#success-order').textContent=`Mã đơn: ${session.id} · ${program.title} · ${performanceText(performance)} · ${ids().length} vé · ${money(session.quote?.total)}`;
  $('#view-demo-tickets').hidden=$('#download-demo-tickets').hidden=!session?.demo;
  for(const item of tickets){const seat=session.seats.find(s=>s.id===item.seatId);if(seat)$('#issued-tickets').append(ticket([seat],{issued:true,ticketData:item}));}
  $('#ticket-status').textContent=tickets.length===ids().length&&tickets.length>0?(session.emailStatus==='SENT'?`Vé đã được gửi tới ${session.buyer?.email||'email của bạn'}.`:'Vé điện tử đã sẵn sàng. Bạn có thể tải vé hoặc gửi lại qua email.'):'Đã xác nhận thanh toán. Vé điện tử đang được phát hành, vui lòng chờ.';
  const pdf=safeURL(session.ticketsPdfUrl);$('#download-tickets').hidden=!pdf;if(pdf)$('#download-tickets').href=pdf;
  $('#resend-tickets').disabled=!tickets.length;
  if(session?.demo){$('#ticket-status').textContent='Thanh toán demo thành công. Vé mẫu không có giá trị vào cửa; không gửi email hoặc thu tiền.';$('#resend-tickets').disabled=true;$('#print-demo-ticket').hidden=false;$('#restart-demo').hidden=false;}
}
async function sync({restore=false}={}) {
  if(syncing||busy)return;syncing=true;
  const version=stateVersion;
  try {
    const next=await api.session();
    if(version!==stateVersion)return;
    if(next?.programmeId&&next.programmeId!==programId)return;
    acceptSession(next);
    if(isPaid(session)){success();return;}
    if(session?.status==='AUTHORIZING'&&session.demo){showDemoPayment();return;}
    if(isPending(session)){if(session.demo)$('#pending-description').textContent=session.attempt?.scenario==='slow'||session.attempt?.status==='UNKNOWN'?'Đang kiểm tra giao dịch. Vui lòng chờ, không thanh toán lại.':'Đang xác nhận thanh toán demo…';setScreen('pending',{history:false,focus:restore});return;}
    if(session?.status==='FAILED'&&held()){paymentUncertain=false;setScreen('failed',{history:false,focus:restore});return;}
    if(session?.status==='EXPIRED'||session?.status==='CANCELLED'){expire();return;}
    if(restore&&held()){await getInventory();methods();setScreen(session.buyer?'payment':'seats',{history:false});}
    else if(paymentUncertain && session && !isPending(session)) {paymentUncertain=false;methods();setScreen('payment',{history:false});notice('Chưa ghi nhận thanh toán thành công. Bạn có thể thử lại; yêu cầu cũ được đối chiếu để tránh thanh toán trùng.');}
  } catch(error){if(restore)notice(error.message);}finally{syncing=false;}
}
async function load() {
  if(!program){$('#booking-title').textContent='Không tìm thấy chương trình';$('#booking-empty').hidden=false;$('#empty-description').textContent='Vui lòng chọn lại chương trình từ lịch biểu diễn.';$('#choose-seats').hidden=true;return;}
  busy=true;notice('Đang tải lịch mở bán…');$('#retry-load').disabled=true;
  try {
    const [catalogue,current]=await Promise.allSettled([api.programme(programId),api.session()]);
    if(current.status==='fulfilled'&&current.value?.programmeId&&current.value.programmeId!==programId&&!isPaid(current.value)&&(isPending(current.value)||remaining(current.value.expiresAt)>0)){
      $('#booking-empty').hidden=false;$('#empty-description').textContent='Bạn đang có một phiên đặt vé khác. Vui lòng hoàn tất hoặc thoát phiên đó trước khi chọn chương trình mới.';$('#retry-load').hidden=true;
      const resume=text('a','Quay lại phiên đặt vé','primary');resume.href=`dat-ve.html?program=${encodeURIComponent(current.value.programmeId)}`;$('#booking-empty').append(resume);notice('');return;
    }
    if(catalogue.status==='fulfilled'){programme=catalogue.value;renderPerformances();for(const [selector,key] of [['#terms-link','termsUrl'],['#privacy-link','privacyUrl']]){const url=safeURL(programme[key],{external:true});if(url)$(selector).href=url;}}
    else if(!(current.status==='fulfilled'&&current.value))throw catalogue.reason;
    notice('');
    if(current.status==='fulfilled'&&current.value&&current.value.programmeId===programId){acceptSession(current.value);busy=false;await sync({restore:true});}
    else if(current.status==='rejected'&&!['no_session'].includes(current.reason.code))throw current.reason;
  } catch(error){
    $('#booking-empty').hidden=false;$('#empty-description').textContent=error.message;notice('');
    if(program){
      try{
        if(typeof bundledSeatReference!=='undefined')referenceInventory=bundledSeatReference;
        else {const response=await fetch('seat-layout.json');if(!response.ok)throw Error('Reference unavailable');referenceInventory=await response.json();}
        if(!validInventory(referenceInventory))throw Error('Invalid reference');
        api=createDemoBookingAPI(referenceInventory,programId,globalThis.sessionStorage,program);
        programme=await api.programme();performance=programme.performances[0];renderPerformances();
        $('#terms-link').href=$('#privacy-link').href='#demo-info';
        $('#terms-link').textContent='Điều kiện demo';$('#privacy-link').textContent='Thông tin thử nghiệm';
        $('#terms-link').removeAttribute('target');$('#privacy-link').removeAttribute('target');
        $('#choose-seats').textContent='Tiếp tục chọn ghế →';
        const restored=await api.session();if(restored){acceptSession(restored);busy=false;await sync({restore:true});}
        notice('');
      }catch{ /* Keep the existing service-unavailable state if the reference cannot load. */ }
    }
  }
  finally{
    if(screen==='seats'&&programme){
      performance ||= programme.performances?.find(item=>item.availability==='AVAILABLE');
      renderPerformances();
      if(performance&&!inventory){
        try{await getInventory();setScreen('seats',{history:false,focus:false});}
        catch(error){notice(error.message);$('#booking-empty').hidden=false;$('#empty-description').textContent=error.message;}
      }
      $('#performance-label').textContent=performanceText(performance);
    }
    busy=false;$('#retry-load').disabled=false;renderSummary();
  }
}
async function changeSeats(nextIds,seat) {
  if(busy||isPending(session)||paymentUncertain||inventory?.reference)return;
  stateVersion++;
  busy=true;notice('Đang xác nhận ghế…');renderSummary();
  try{const next=await api.select(performance.id,nextIds,session?.revision??null,crypto.randomUUID());acceptSession(next);expiredShown=false;notice('');}
  catch(error){notice(error.code==='seat_unavailable'?`Ghế ${seat?seat.row+seat.number:'vừa chọn'} vừa được người khác đặt. Vui lòng chọn một ghế khác.`:error.message);try{const current=await api.session();if(current)acceptSession(current);}catch{}}
  finally{try{await getInventory();}catch(error){notice(error.message);}busy=false;renderSummary();}
}
async function chooseSeats() {
  if(!performance||busy)return;busy=true;renderSummary();notice('Đang tải sơ đồ khán phòng…');
  try{await getInventory();notice(inventory.reference?'Sơ đồ tham khảo · Chạm vào ghế để xem vị trí. Giá và tình trạng ghế chưa được xác nhận mở bán.':'');setScreen('seats');}catch(error){notice(error.message);}finally{busy=false;renderSummary();}
}
function toBuyer() {
  if(!held()||busy)return;
  if(!$('#terms-link').href||!$('#privacy-link').href){notice('Điều khoản dịch vụ và chính sách bảo mật chưa được công bố. Chưa thể tiếp tục thanh toán.');return;}
  methods();setScreen('buyer');notice('');
}
function expire() {
  if(isPaid(session)||isPending(session)||paymentUncertain)return;
  if(!session?.seats?.length||expiredShown)return;
  expiredShown=true;$('#expired-dialog').showModal();$('#selected-sheet').close();renderSummary();
}
function tick() {
  const seconds=remaining(session?.expiresAt,Date.now()+serverOffset);
  $$('[data-countdown]').forEach(el=>el.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`);
  if(session?.seats?.length&&!seconds&&!isPaid(session)&&!isPending(session)&&!paymentUncertain)expire();
}
function paymentKey() {
  const slot=`hgo-payment:${session.id}:${session.revision}:${methodId}`;
  if(paymentKeys.has(slot))return paymentKeys.get(slot);
  let key;
  try{key=sessionStorage.getItem(slot);if(!key){key=crypto.randomUUID();sessionStorage.setItem(slot,key);}}catch{key=session.paymentIdempotencyKey||crypto.randomUUID();}
  paymentKeys.set(slot,key);return key;
}
function resetFailedPayment() {
  if(session?.status!=='FAILED')return;
  const slot=`hgo-payment:${session.id}:${session.revision}:${methodId}`;
  paymentKeys.delete(slot);try{sessionStorage.removeItem(slot);}catch{}
}
async function pay() {
  if(busy||!held()||!methodId||isPending(session)||paymentUncertain)return;
  stateVersion++;
  busy=true;renderSummary();notice('Đang tạo yêu cầu thanh toán…');
  try {
    const result=await api.pay(methodId,session.revision,paymentKey(),$('#demo-scenario').value||'success');acceptSession(result.session);notice('');
    if(session?.demo&&session.status==='AUTHORIZING'){showDemoPayment();return;}
    if(isPaid(session)){success();return;}
    if(session?.status==='FAILED'){setScreen('failed');return;}
    setScreen('pending');
    const redirect=safeURL(result.redirectUrl,{external:true});$('#continue-payment').hidden=!redirect;
    if(redirect){$('#continue-payment').href=redirect;location.assign(redirect);}
  }catch(error){
    if(error.code==='hold_expired'){session.status='EXPIRED';session.expiresAt=new Date(0).toISOString();expire();}
    else if(error.code==='connection_error'){paymentUncertain=true;setScreen('pending');notice('Kết nối bị gián đoạn. Đang kiểm tra kết quả thanh toán trước khi thử lại.');}
    else notice(error.message);
  }finally{busy=false;renderSummary();}
}
function showDemoPayment(){
  const attempt=session?.attempt;if(!attempt)return;
  const card=attempt.methodId==='demo-card',wallet=attempt.methodId==='demo-wallet',confirm=attempt.stage==='confirm';
  $('#demo-payment-title').textContent=card?'Thẻ ngân hàng mô phỏng':wallet?'Ví điện tử mô phỏng':'QR ngân hàng mô phỏng';
  $('#demo-order').textContent=`Mã đơn: ${session.id}`;$('#demo-amount').textContent=money(session.quote.total);
  $('#demo-card-choice').hidden=!card||confirm;$('#demo-wallet-choice').hidden=!wallet||confirm;$('#demo-qr-panel').hidden=card||wallet;
  if(!card&&!wallet)$('#demo-payment-qr').src=demoQR(`DEMO-NO-PAYMENT:${session.id}`);
  $('#demo-otp-panel').hidden=!card||!confirm;$('#demo-confirm').hidden=!confirm;$('#demo-prepare').hidden=confirm;
  $('#demo-prepare').textContent=card?'Thanh toán bằng thẻ thử nghiệm':wallet?'Mở ví mô phỏng':'Mở ngân hàng mô phỏng';
  $('#demo-confirm-copy').hidden=!confirm;
  $('#demo-confirm-copy').textContent=`${attempt.choice||'Ngân hàng demo'} · Xác nhận số tiền ${money(session.quote.total)}. Không thu tiền.`;
  setScreen('demo-payment',{history:screen!=='demo-payment',focus:screen!=='demo-payment'});
}
async function demoAction(action){
  if(busy||!session?.demo)return;busy=true;stateVersion++;
  for(const id of ['demo-prepare','demo-confirm','demo-cancel'])$('#'+id).disabled=true;
  try{
    acceptSession(await action());notice('');
    if(session.status==='AUTHORIZING')showDemoPayment();
    else if(isPending(session)){$('#pending-description').textContent='Đang xác nhận thanh toán demo…';setScreen('pending');lastPoll=0;}
    else if(isPaid(session))success();
    else {methods();setScreen('buyer');}
  }catch(error){notice(error.message);if(error.code==='hold_expired'){acceptSession(await api.session());expire();}}
  finally{busy=false;for(const id of ['demo-prepare','demo-confirm','demo-cancel'])$('#'+id).disabled=false;renderSummary();}
}
$('#demo-prepare').onclick=()=>demoAction(()=>api.prepare(session.attempt.id,session.attempt.methodId==='demo-card'?$('#demo-card').value:session.attempt.methodId==='demo-wallet'?$('#demo-wallet').value:'Ngân hàng demo'));
$('#demo-confirm').onclick=()=>demoAction(()=>api.confirm(session.attempt.id,$('#demo-otp').value.trim()));
$('#demo-cancel').onclick=()=>demoAction(()=>api.cancel(session.attempt.id));
$('#view-demo-tickets').onclick=()=>$('#issued-tickets').scrollIntoView({behavior:'smooth',block:'start'});
$('#download-demo-tickets').onclick=()=>{
  if(!session?.demo||!isPaid(session))return;
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const tickets=session.tickets.map(t=>{const seat=session.seats.find(s=>s.id===t.seatId);return `<article><h2>${escape(program.title)}</h2><p>${escape(performanceText(performance))}</p><p>${escape(seat.floorLabel)} · Hàng ${escape(seat.row)} · Ghế ${escape(seat.number)}</p><p>${escape(t.code)}</p><img width="180" height="180" src="${demoQR(t.code)}" alt="QR vé demo"><p>VÉ DEMO — KHÔNG CÓ GIÁ TRỊ VÀO CỬA</p></article>`;}).join('');
  const html=`<!doctype html><html lang="vi"><meta charset="utf-8"><title>Vé demo</title><style>body{font-family:Arial;background:#f3e6cc;color:#49311f;padding:24px}article{padding:24px;border:1px solid #795638;margin:20px 0;break-inside:avoid}</style><h1>Vé demo — Hồ Gươm Opera</h1><p>Mã đơn: ${escape(session.id)} · Tổng tiền: ${escape(money(session.quote.total))}</p>${tickets}</html>`;
  const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`ve-demo-${session.id}.html`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
async function checkout(event){
  event?.preventDefault();if(busy||!held()||!methodId||isPending(session)||paymentUncertain)return;const form=$('#buyer-form');if(!form.reportValidity())return;
  const values=new FormData(form);const buyer={name:values.get('name').trim(),phone:values.get('phone').trim(),email:values.get('email').trim(),consent:values.has('consent'),marketing:values.has('marketing')};
  if(!buyer.name){notice('Vui lòng nhập họ và tên.');return;}
  stateVersion++;
  busy=true;renderSummary();
  let saved=false;
  try{acceptSession(await api.buyer(buyer,session.revision));methods();saved=true;notice('');}catch(error){notice(error.message);}finally{busy=false;renderSummary();}
  if(saved)await pay();
}
$('#buyer-form').addEventListener('submit',checkout);
$$('[data-back]').forEach(button=>button.onclick=()=>{if(busy)return;const next=button.dataset.back;if(next==='dates'&&held()){leaveURL='dates';$('#leave-dialog').showModal();return;}setScreen(next);});
$('#retry-load').onclick=load;$('#choose-seats').onclick=chooseSeats;$('#to-buyer').onclick=$('#mobile-continue').onclick=toBuyer;$('#pay').onclick=checkout;
$('#clear-seats').onclick=()=>changeSeats([]);
$('#print-demo-ticket').onclick=()=>window.print();
$('#restart-demo').onclick=async()=>{if(!session?.demo)return;await api.release();session=null;inventory=null;expiredShown=false;await load();setScreen('seats');};
$('#show-selected').onclick=()=>$('#selected-sheet').showModal();$('[data-close-sheet]').onclick=()=>$('#selected-sheet').close();
$('#retry-payment').onclick=$('#change-method').onclick=()=>{if(!held()){expire();return;}resetFailedPayment();methods();setScreen('payment');};
$('#check-payment').onclick=()=>sync();
$('#reselect-seats').onclick=async()=>{$('#expired-dialog').close();session=null;expiredShown=false;renderSummary();setScreen('seats');try{await getInventory();}catch(error){notice(error.message);}};
$('#expired-dialog').addEventListener('cancel',event=>event.preventDefault());
$('#resend-tickets').onclick=async()=>{const button=$('#resend-tickets');button.disabled=true;try{const result=await api.resend(crypto.randomUUID());$('#ticket-status').textContent=result.status==='SENT'?'Vé đã được gửi lại qua email.':'Yêu cầu gửi lại vé đã được tiếp nhận.';}catch(error){$('#ticket-status').textContent=error.message;}finally{button.disabled=false;}};
function requestLeave(url){if(held()||paymentUncertain){leaveURL=url;$('#leave-dialog').showModal();}else location.href=url;}
document.addEventListener('click',event=>{const link=event.target.closest('[data-booking-exit],.site-logo,#booking-programme-details');if(link){event.preventDefault();requestLeave(link.href);}});
$('#stay-booking').onclick=()=>$('#leave-dialog').close();
$('#leave-booking').onclick=async()=>{
  if(busy)return;
  stateVersion++;
  const button=$('#leave-booking');button.disabled=true;
  try{
    if(isPending(session)||paymentUncertain){$('#leave-dialog').close();notice('Thanh toán đang được đối chiếu. Vui lòng chờ kết quả trước khi đổi suất diễn.');return;}
    if(session)await api.release(session.revision);
    session=null;$('#leave-dialog').close();if(leaveURL==='dates'){inventory=null;performance=null;setScreen('seats');await load();}else location.href=leaveURL;
  }catch(error){$('#leave-dialog').close();notice(error.message);}finally{button.disabled=false;}
};
window.addEventListener('beforeunload',event=>{if(held()&&!isPending(session)&&!paymentUncertain){event.preventDefault();event.returnValue='';}});
window.addEventListener('popstate',event=>{
  if(isPaid(session)){setScreen('success',{history:false});return;}
  if(isPending(session)||paymentUncertain){setScreen('pending',{history:false});return;}
  if(session?.demo&&session.status==='AUTHORIZING'){showDemoPayment();return;}
  const next=event.state?.screen;
  if(held()&&(!next||next==='dates')){history.pushState({booking:true,screen},'',`#${screen}`);leaveURL=next==='dates'?'dates':'index.html#programs';$('#leave-dialog').showModal();return;}
  if(['seats','buyer','payment'].includes(next)&&held()){if(next==='payment')methods();setScreen(next,{history:false});}else setScreen('dates',{history:false});
});
  if(program){$('#booking-title').textContent=program.title;document.title=`Đặt vé ${program.title} — Hồ Gươm Opera`;$('#booking-poster').src=program.image;$('#booking-poster').alt=`Ảnh bìa ${program.title}`;$('#booking-poster').hidden=false;$('#booking-programme-details').href=`chuong-trinh.html?program=${encodeURIComponent(programId)}`;}
history.replaceState({booking:true,screen:'seats'},'',location.href);
load();
setInterval(()=>{tick();const interval=session?.demo&&isPending(session)?1000:isPending(session)||paymentUncertain||isPaid(session)&&(!session.tickets?.length||session.emailStatus==='PENDING')?4000:15000;if(session&&!document.hidden&&Date.now()-lastPoll>interval){lastPoll=Date.now();sync();}},1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();sync();}});
