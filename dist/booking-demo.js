import {qrcode} from './vendor/qrcode.js';
export function demoQR(value){const qr=qrcode(0,'M');qr.addData(value);qr.make();return qr.createDataURL(4,8);}
// Isolated, browser-only demonstration. Never calls a payment or email service.
export function createDemoBookingAPI(reference, programId, storage=globalThis.sessionStorage, program={date:'24–25.10.2026',time:'20:00 - 23:00'}) {
  const key=`hgo-demo-v${reference.layoutVersion||1}:${programId}`;
  let current=null;
  try{current=JSON.parse(storage.getItem(key)||'null');}catch{}
  const copy=value=>JSON.parse(JSON.stringify(value));
  const save=()=>{if(current)current.serverTime=new Date(Date.now()).toISOString();try{storage.setItem(key,JSON.stringify(current));}catch{}return copy(current);};
  const categories=reference.categories.map(c=>({...c,price:c.referencePrice}));
  const seats=reference.seats.map(s=>({...s,availability:s.number&&s.categoryId?'AVAILABLE':'SOLD'}));
  const [,first,last,month,year]=/^(\d{2})(?:[–-](\d{2}))?\.(\d{2})\.(\d{4})$/.exec(program.date)||[];
  const weekdays=['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
  const performances=first?Array.from({length:Number(last||first)-Number(first)+1},(_,index)=>{
    const day=String(Number(first)+index).padStart(2,'0');
    return {id:`demo-${day}`,dateLabel:`${day}.${month}.${year}`,weekday:weekdays[new Date(Date.UTC(Number(year),Number(month)-1,Number(day))).getUTCDay()],time:program.time,availability:'AVAILABLE'};
  }):[];
  if(current?.performance){const show=performances.find(p=>p.id===current.performance.id);if(show)current.performance=copy(show);}
  const methods=[{id:'demo-card',label:'Thẻ ngân hàng',description:'Visa, MasterCard, JCB, Napas'},{id:'demo-wallet',label:'Ví điện tử',description:'MoMo, ZaloPay, VNPay'},{id:'demo-qr',label:'QR / Chuyển khoản',description:'Quét mã QR hoặc chuyển khoản ngân hàng'}];
  if(current)current.paymentMethods=copy(methods);
  const error=(code,message)=>Object.assign(new Error(message),{code});
  function issue(){if(current.status==='TICKET_ISSUED')return;current.status='TICKET_ISSUED';current.revision++;current.tickets=current.seats.map((s,i)=>{const code=`DEMO-HGO-${current.id}-${i+1}`;return {seatId:s.id,code,qrImageUrl:demoQR(code)};});current.emailStatus='DEMO';save();}
  function check(){
    if(!current||['TICKET_ISSUED','CANCELLED','EXPIRED'].includes(current.status))return;
    const attempt=current.attempt;
    if(Date.parse(current.expiresAt)<=Date.now()){
      current.status='EXPIRED';current.tickets=[];if(attempt)attempt.status='EXPIRED';save();return;
    }
    if(current.status==='PENDING_PAYMENT'&&attempt?.status==='PROCESSING'&&Date.now()>=attempt.resolveAt){
      // The simulated processor checks the active attempt and inventory before issuing.
      const available=current.seats.every(s=>seats.some(v=>v.id===s.id&&v.availability==='AVAILABLE'));
      if(!available){attempt.status='UNKNOWN';save();return;}
      attempt.status=attempt.scenario==='failed'?'FAILED':'SUCCEEDED';
      if(attempt.status==='FAILED'){current.status='FAILED';current.revision++;save();}else issue();
    }
  }
  function active(){check();if(!current||current.status==='EXPIRED'||current.status==='CANCELLED')throw error('hold_expired','Phiên giữ ghế demo đã hết hạn.');}
  return {
    async programme(){return {demo:true,performances,termsUrl:'#demo-info',privacyUrl:'#demo-info'};},
    async inventory(){check();return {demo:true,floors:copy(reference.floors),categories:copy(categories),seats:seats.map(s=>({...s,availability:current?.status==='TICKET_ISSUED'&&current.seats.some(v=>v.id===s.id)?'SOLD':s.availability}))};},
    async session(){check();return current?{...copy(current),serverTime:new Date(Date.now()).toISOString()}:null;},
    async select(performanceId,seatIds){
      check();if(['PENDING_PAYMENT','AUTHORIZING','TICKET_ISSUED'].includes(current?.status))throw error('pending','Vui lòng hoàn tất giao dịch hiện tại.');
      const selected=seatIds.map(id=>seats.find(s=>s.id===id));
      if(selected.some(s=>!s||s.availability!=='AVAILABLE'))throw error('seat_unavailable','Ghế này đã bán trong bản demo.');
      const reusable=current?.status==='SEAT_HELD'||current?.status==='FAILED';
      const selectedSeats=selected.map(s=>({...s,floorLabel:reference.floors.find(f=>f.id===s.floorId).label,categoryName:categories.find(c=>c.id===s.categoryId).name,price:categories.find(c=>c.id===s.categoryId).price}));
      const subtotal=selectedSeats.reduce((sum,s)=>sum+s.price,0),serviceFee=Math.round(subtotal*.02);
      current={id:reusable?current.id:crypto.randomUUID(),programmeId:programId,status:'SEAT_HELD',revision:(current?.revision||0)+1,serverTime:new Date().toISOString(),expiresAt:reusable?current.expiresAt:new Date(Date.now()+600000).toISOString(),performance:performances.find(p=>p.id===performanceId),seats:selectedSeats,quote:{subtotal,serviceFee,total:subtotal+serviceFee},buyer:reusable?current.buyer:null,paymentMethods:methods,demo:true};
      return save();
    },
    async buyer(buyer){active();if(['AUTHORIZING','PENDING_PAYMENT','TICKET_ISSUED'].includes(current.status))throw error('pending','Giao dịch đang được xử lý.');current.buyer=buyer;current.revision++;return save();},
    async pay(methodId,revision,key,scenario='success'){
      active();if(['AUTHORIZING','PENDING_PAYMENT','TICKET_ISSUED'].includes(current.status)||current.attempt?.key===key&&key)return {session:copy(current)};
      if(!current.seats.length||!current.buyer?.consent)throw error('invalid_order','Vui lòng chọn ghế và nhập thông tin demo.');
      if(!methods.some(m=>m.id===methodId))throw error('invalid_method','Chọn phương thức thanh toán demo.');
      current.attempt={id:crypto.randomUUID(),key,methodId,scenario:['success','failed','slow','expired'].includes(scenario)?scenario:'success',status:'AUTHORIZING',stage:'choose'};
      current.status='AUTHORIZING';current.revision++;return {session:save()};
    },
    async prepare(id,choice){active();if(current.attempt?.id!==id||current.status!=='AUTHORIZING')throw error('stale_attempt','Lần thanh toán này không còn hiệu lực.');current.attempt.stage='confirm';current.attempt.choice=choice;return save();},
    async confirm(id,code){
      active();const attempt=current.attempt;
      if(attempt?.id!==id)throw error('stale_attempt','Lần thanh toán này không còn hiệu lực.');
      if(['PENDING_PAYMENT','TICKET_ISSUED','FAILED'].includes(current.status))return save();
      if(current.status!=='AUTHORIZING'||attempt.stage!=='confirm')throw error('invalid_stage','Vui lòng mở bước xác nhận mô phỏng.');
      if(attempt.methodId==='demo-card'&&code!=='123456')throw error('invalid_code','Nhập mã demo 123456 hiển thị trên màn hình.');
      current.status='PENDING_PAYMENT';attempt.status='PROCESSING';attempt.resolveAt=Date.now()+(attempt.scenario==='slow'?12000:2500);
      if(attempt.scenario==='expired')current.expiresAt=new Date(Date.now()+1000).toISOString();
      current.revision++;return save();
    },
    async cancel(id){active();if(current.attempt?.id!==id||current.status!=='AUTHORIZING')throw error('pending','Không thể hủy khi đang xác nhận.');current.attempt.status='CANCELLED';current.status='SEAT_HELD';current.revision++;return save();},
    async release(){check();if(current?.status==='PENDING_PAYMENT')throw error('pending','Đang kiểm tra giao dịch.');current=null;save();return {status:'CANCELLED'};},
    async resend(){return {status:'DEMO'};}
  };
}
