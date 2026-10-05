/* Shared navigation for every page. Load before page-specific deferred scripts. */
(() => {
  const host = document.querySelector('[data-site-header]');
  if (!host) return;
  const root = new URL('.', document.currentScript.src);
  const link = path => new URL(path, root).href;
  const page = host.dataset.page || 'home';
  const entries = [
    ['programs','index.html#programs','Lịch diễn','Performances'],
    ['events','index.html#media','Sự kiện','Events'],
    ['library','thu-vien-so.html','Thư viện số','Digital library'],
    ['contact','index.html#visit','Liên hệ','Contact']
  ];
  host.className = 'site-header';
  host.innerHTML = `<div class="site-header-inner">
    <a class="site-logo" href="${link('index.html')}" aria-label="Hồ Gươm Opera — Trang chủ"><img src="${link('assets/logo.png')}" alt="Hồ Gươm Opera" width="592" height="297"></a>
    <nav class="site-navigation" id="site-navigation" aria-label="Điều hướng chính">${entries.map(([id,url,vi,en])=>`<a href="${link(url)}" data-nav-id="${id}" data-nav-vi="${vi}" data-nav-en="${en}">${vi}</a>`).join('')}</nav>
    <div class="site-header-tools">
      <button class="site-account" type="button" aria-label="Đăng nhập" aria-haspopup="dialog" aria-controls="site-auth-dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg></button>
      <button class="site-search" ${page==='home'?'data-header-panel="search" data-header-label="headerSearch"':page==='library'?'id="focus-search"':''} aria-label="Tìm kiếm"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button>
      <label class="site-language"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/></svg><select class="language-select" aria-label="Ngôn ngữ / Language"><option value="vi">VI</option>${page==='home'?'<option value="en">EN</option>':''}</select></label>
      <a class="site-ticket" href="${link('dat-ve.html?program=hoanca')}" data-nav-vi="Đặt vé" data-nav-en="Book tickets">Đặt vé</a>
      <button class="site-menu-toggle" aria-label="Mở menu" aria-expanded="false" aria-controls="site-navigation"><span></span><span></span></button>
    </div></div>`;
  const toggle = host.querySelector('.site-menu-toggle');
  const account = host.querySelector('.site-account');
  const auth = document.createElement('dialog');
  auth.id='site-auth-dialog';auth.className='site-auth-dialog';
  auth.setAttribute('aria-labelledby','site-auth-title');
  auth.innerHTML=`<button type="button" class="site-auth-close" aria-label="Đóng">×</button>
    <p class="site-auth-brand">HỒ GƯƠM OPERA</p><h2 id="site-auth-title"></h2>
    <form class="site-auth-form">
      <label for="site-auth-identity" data-auth-copy="identity"></label>
      <input id="site-auth-identity" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required maxlength="254">
      <label for="site-auth-password" data-auth-copy="password"></label>
      <input id="site-auth-password" name="password" type="password" autocomplete="current-password" required>
      <div class="site-auth-confirm" hidden><label for="site-auth-confirm" data-auth-copy="confirm"></label>
        <input id="site-auth-confirm" name="confirmPassword" type="password" autocomplete="new-password" disabled></div>
      <p class="site-auth-status" role="status" hidden></p>
      <button type="submit" class="site-auth-submit"></button>
    </form>
    <p class="site-auth-switch"><span></span> <button type="button"></button></p>`;
  document.body.append(auth);
  const form=auth.querySelector('form'),identity=auth.querySelector('#site-auth-identity');
  const password=auth.querySelector('#site-auth-password'),confirm=auth.querySelector('#site-auth-confirm');
  const notice=auth.querySelector('.site-auth-status');
  let registering=false;
  const authCopy=()=>document.documentElement.lang==='en'?{
    login:'Sign in',register:'Sign up',identity:'Email or phone number',password:'Password',confirm:'Confirm password',
    newAccount:'Don’t have an account?',existing:'Already have an account?',close:'Close',
    invalid:'Enter a valid email address or phone number.',mismatch:'Passwords do not match.',
    unavailable:'Account services are not connected yet. Please try again later.'
  }:{
    login:'Đăng nhập',register:'Đăng ký',identity:'Email hoặc số điện thoại',password:'Mật khẩu',confirm:'Nhập lại mật khẩu',
    newAccount:'Bạn chưa có tài khoản?',existing:'Bạn đã có tài khoản?',close:'Đóng',
    invalid:'Vui lòng nhập email hoặc số điện thoại hợp lệ.',mismatch:'Mật khẩu nhập lại chưa khớp.',
    unavailable:'Dịch vụ tài khoản chưa được kết nối. Vui lòng quay lại sau.'
  };
  function syncAuth(){
    const copy=authCopy();account.setAttribute('aria-label',copy.login);
    auth.querySelector('#site-auth-title').textContent=registering?copy.register:copy.login;
    auth.querySelectorAll('[data-auth-copy]').forEach(el=>el.textContent=copy[el.dataset.authCopy]);
    auth.querySelector('.site-auth-close').setAttribute('aria-label',copy.close);
    auth.querySelector('.site-auth-submit').textContent=registering?copy.register:copy.login;
    auth.querySelector('.site-auth-switch span').textContent=registering?copy.existing:copy.newAccount;
    auth.querySelector('.site-auth-switch button').textContent=registering?copy.login:copy.register;
    auth.querySelector('.site-auth-confirm').hidden=!registering;
    confirm.disabled=!registering;confirm.required=registering;
    password.autocomplete=registering?'new-password':'current-password';
    identity.setCustomValidity('');confirm.setCustomValidity('');notice.hidden=true;
  }
  account.addEventListener('click',()=>{
    close();registering=false;syncAuth();auth.showModal();document.body.classList.add('site-auth-open');identity.focus();
  });
  auth.querySelector('.site-auth-close').addEventListener('click',()=>auth.close());
  auth.addEventListener('click',event=>{
    if(event.target!==auth)return;
    const r=auth.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)auth.close();
  });
  auth.addEventListener('close',()=>{form.reset();notice.hidden=true;document.body.classList.remove('site-auth-open');account.focus({preventScroll:true});});
  auth.querySelector('.site-auth-switch button').addEventListener('click',()=>{
    registering=!registering;password.value='';confirm.value='';syncAuth();identity.focus();
  });
  form.addEventListener('input',()=>{identity.setCustomValidity('');confirm.setCustomValidity('');notice.hidden=true;});
  form.addEventListener('submit',event=>{
    event.preventDefault();const copy=authCopy(),value=identity.value.trim();
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const validPhone=/^\+?[\d\s().-]+$/.test(value)&&/^\d{9,15}$/.test(value.replace(/\D/g,''));
    identity.setCustomValidity(validEmail||validPhone?'':copy.invalid);
    confirm.setCustomValidity(registering&&password.value!==confirm.value?copy.mismatch:'');
    if(!form.reportValidity())return;
    notice.textContent=copy.unavailable;notice.hidden=false;
  });
  // Keep the shared header visible after the opening, without animating every scroll event.
  let scrollFrame = 0;
  const syncScroll = () => {
    scrollFrame = 0;
    const pinned = host.classList.contains('is-scrolled');
    const threshold = pinned ? 24 : host.offsetHeight + 24;
    host.classList.toggle('is-scrolled', window.scrollY > threshold);
  };
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll);
  }, {passive:true});
  window.addEventListener('pageshow', syncScroll);
  syncScroll();
  const close = () => {toggle.setAttribute('aria-expanded','false');host.classList.remove('menu-open');};
  window.closeSiteMenu = close;
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));host.classList.toggle('menu-open',open);});
  host.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const open=toggle.getAttribute('aria-expanded')==='true';close();if(open)toggle.focus();}});
  document.addEventListener('click',event=>{if(!host.contains(event.target))close();});
  matchMedia('(min-width: 901px)').addEventListener('change',close);
  if(!['home','library'].includes(page))host.querySelector('.site-search').addEventListener('click',()=>{location.href=link('thu-vien-so.html');});
  function sync(){
    syncAuth();
    const en=document.documentElement.lang==='en';
    host.querySelectorAll('[data-nav-vi]').forEach(el=>{el.textContent=en?el.dataset.navEn:el.dataset.navVi;});
    host.querySelector('.site-search').setAttribute('aria-label',en?'Search':'Tìm kiếm');
    toggle.setAttribute('aria-label',en?'Toggle navigation':'Mở menu');
    const hash=location.hash;
    const active=page==='home'?({ '#theatre':'about','#programs':'programs','#media':'events','#visit':'contact' }[hash]):page;
    host.querySelectorAll('[data-nav-id]').forEach(a=>{if(a.dataset.navId===active)a.setAttribute('aria-current',page==='home'?'location':'page');else a.removeAttribute('aria-current');});
  }
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  window.addEventListener('hashchange',sync);sync();
  if (page === 'booking') {
    host.querySelector('.site-navigation').hidden = true;
    host.querySelector('.site-header-tools').hidden = true;
    const exit = document.createElement('a');
    exit.className = 'site-booking-exit';
    exit.href = link('index.html#programs');
    exit.dataset.bookingExit = '';
    exit.textContent = 'Thoát đặt vé ↗';
    host.querySelector('.site-header-inner').append(exit);
  }
})();
