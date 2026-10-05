(() => {
  const collections = [
    {id:'ballet',title:'Vũ điệu ballet',category:'Biểu diễn',description:'Những chuyển động thanh thoát và cảm xúc được kể bằng ngôn ngữ múa. Khám phá vẻ đẹp của nghệ thuật ballet qua từng khoảnh khắc.',images:['assets/ballet.webp'],note:'Ảnh minh họa'},
    {id:'orchestra',title:'Thanh âm giao hưởng',category:'Biểu diễn',description:'Sân khấu, nhạc cụ và những nghệ sĩ cùng tạo nên không gian của một đêm giao hưởng.',images:['assets/theatre/hall-main.webp','assets/theatre/stage.webp'],note:'Không gian biểu diễn'},
    {id:'architecture',title:'Kiến trúc Hồ Gươm Opera',category:'Kiến trúc',description:'Những hàng cột và ánh sáng trên mặt tiền nhà hát tạo nên một điểm nhấn kiến trúc giữa phố Hàng Bài.',images:['assets/theatre/Building.webp','assets/theatre/exterior-night.webp'],note:'40 Hàng Bài, Hà Nội'},
    {id:'backstage',title:'Trước giờ mở màn',category:'Hậu trường',description:'Khán phòng và sân khấu trong những khoảnh khắc chờ đón khán giả, trước khi âm nhạc cất lên.',images:['assets/theatre/hall-detail.webp','assets/theatre/hall-main.webp'],note:'Không gian sân khấu'},
    {id:'foyer',title:'Không gian bên trong',category:'Kiến trúc',description:'Ánh sáng ấm, cầu thang và những đường nét của sảnh đón dẫn bước khán giả vào thế giới nghệ thuật.',images:['assets/theatre/foyer-main.webp','assets/theatre/foyer-detail.webp'],note:'Sảnh nhà hát'},
    {id:'caroline',title:'Caroline Campbell',category:'Nghệ sĩ',description:'Khoảnh khắc nghệ sĩ vĩ cầm Caroline Campbell trên sân khấu Nhà hát Hồ Gươm.',images:['assets/theatre/performance-original.webp'],note:'Nghệ sĩ vĩ cầm'},
    {id:'audience',title:'Nghệ thuật và khán giả',category:'Cộng đồng',description:'Khi khoảng cách giữa sân khấu và khán phòng được nối bằng âm nhạc và những cảm xúc chung.',images:['assets/theatre/audience-original.webp'],note:'Khoảnh khắc đồng điệu'},
    {id:'italia',title:'Italia Mistero',category:'Sự kiện',description:'Nhìn lại những khoảnh khắc biểu diễn và dấu ấn Teatro Massimo trong Italia Mistero.',images:['assets/media/italia-mistero.jpg'],video:'assets/media/italia-mistero.mp4',note:'Recap · Teatro Massimo'},
    {id:'hanoi',title:'Hà Nội — Niềm tin và hy vọng',category:'Biểu diễn',description:'Những thanh âm giao hưởng và cảm xúc dành cho Hà Nội trong chương trình Niềm tin và hy vọng.',images:['assets/media/hanoi-niem-tin.jpg'],video:'assets/media/hanoi-niem-tin.mp4',note:'Hòa nhạc · Giao hưởng'},
    {id:'traviata',title:'La Traviata',category:'Biểu diễn',description:'Khám phá sức sống của La Traviata qua thước phim về tác phẩm opera vẫn chinh phục khán giả sau 170 năm.',images:['assets/media/la-traviata.jpg'],video:'assets/media/la-traviata.mp4',note:'Opera · Giuseppe Verdi'}
  ];
  const $ = selector => document.querySelector(selector);
  const list = $('#collection-list'), viewer = $('#viewer'), video = $('#viewer-video');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let type='photo',category='all',selected=collections[0],filtered=[],imageIndex=0,timer=0,toastTimer=0;
  let favorites = new Set();
  try {const saved=JSON.parse(localStorage.getItem('opera-library-favorites')||'[]');if(Array.isArray(saved))favorites=new Set(saved.filter(id=>collections.some(item=>item.id===id)));} catch {}
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
  function notify(message){$('#status').textContent=message;$('#status').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#status').classList.remove('visible'),3500);}
  function stop(){clearInterval(timer);timer=0;$('#play-art').setAttribute('aria-pressed','false');}
  function select(item,updateHash=true){
    stop();selected=item;imageIndex=0;
    $('#featured-image').src=item.images[0];$('#featured-image').alt=item.title;
    $('#collection-title').textContent=item.title;
    $('.collection-category').textContent=item.category;
    $('.collection-description').textContent=item.description;
    $('#collection-group').textContent=item.category;
    $('#collection-count').textContent=type==='video'?'1 video':`${item.images.length} hình ảnh`;
    $('#favorite-art').setAttribute('aria-pressed',String(favorites.has(item.id)));
    $('#favorite-art').setAttribute('aria-label',favorites.has(item.id)?'Bỏ yêu thích bộ sưu tập':'Yêu thích bộ sưu tập');
    $('.video-badge').hidden=type!=='video';
    $('#open-art').setAttribute('aria-label',`${type==='video'?'Phát video':'Xem ảnh lớn'}: ${item.title}`);
    $('#play-art').setAttribute('aria-label',type==='video'?'Phát video':'Trình chiếu các bộ sưu tập');
    list.querySelectorAll('button').forEach(button=>button.setAttribute('aria-current',String(button.dataset.id===item.id)));
    if(updateHash){const url=new URL(location.href);url.hash=item.id;url.searchParams.set('media',type);history.replaceState(null,'',url);}
  }
  function render(){
    stop();const query=normalize($('#query').value.trim());
    filtered=collections.filter(item=>(type==='photo'||item.video)&&(category==='all'||item.category===category)&&(!$('#favorites-only').checked||favorites.has(item.id))&&normalize(`${item.title} ${item.category} ${item.description}`).includes(query));
    if($('#sort').value!=='default')filtered.sort((a,b)=>a.title.localeCompare(b.title,'vi')*($('#sort').value==='za'?-1:1));
    list.replaceChildren();
    filtered.forEach(item=>{
      const button=document.createElement('button');button.type='button';button.className='collection-card';button.dataset.id=item.id;button.setAttribute('aria-label',`Xem ${item.title}`);
      const img=document.createElement('img');img.src=item.images[0];img.alt='';img.loading='lazy';
      const copy=document.createElement('span');copy.className='card-copy';
      const title=document.createElement('strong');title.textContent=item.title;
      const meta=document.createElement('span');meta.className='card-meta';
      const label=document.createElement('span');label.textContent=item.category;
      const count=document.createElement('span');count.textContent=type==='video'?'▷ Video':`▧ ${item.images.length}`;
      meta.append(label,count);copy.append(title,meta);button.append(img,copy);button.addEventListener('click',()=>select(item));list.append(button);
    });
    $('.exhibition').hidden=!filtered.length;$('.empty-message').hidden=!!filtered.length;
    if(filtered.length)select(filtered.find(item=>item.id===selected.id)||filtered[0]);
    requestAnimationFrame(updateArrows);
  }
  function setType(next){type=next;document.querySelectorAll('[data-type]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.type===type)));render();}
  document.querySelectorAll('[data-type]').forEach(button=>button.addEventListener('click',()=>setType(button.dataset.type)));
  document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;document.querySelectorAll('[data-category]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));render();}));
  $('#query').addEventListener('input',render);$('#sort').addEventListener('change',render);$('#favorites-only').addEventListener('change',render);
  $('#focus-search').addEventListener('click',()=>$('#query').focus());
  $('.filter-toggle').addEventListener('click',()=>{const panel=$('#filter-panel');panel.hidden=!panel.hidden;$('.filter-toggle').setAttribute('aria-expanded',String(!panel.hidden));});
  $('#reset').addEventListener('click',()=>{$('#query').value='';$('#favorites-only').checked=false;category='all';$('#sort').value='default';document.querySelectorAll('[data-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category==='all')));render();});
  document.addEventListener('click',event=>{if(!event.target.closest('.search-tools')){$('#filter-panel').hidden=true;$('.filter-toggle').setAttribute('aria-expanded','false');}});
  $('#favorite-art').addEventListener('click',()=>{const id=selected.id;if(favorites.has(id))favorites.delete(id);else favorites.add(id);let saved=true;try{localStorage.setItem('opera-library-favorites',JSON.stringify([...favorites]));}catch{saved=false;}render();notify(saved?(favorites.has(id)?'Đã lưu vào mục yêu thích':'Đã bỏ yêu thích'):'Đã cập nhật yêu thích trong phiên này.');});
  $('#share-art').addEventListener('click',async()=>{const url=new URL(location.href);url.hash=selected.id;try{await navigator.clipboard.writeText(url.href);notify('Đã sao chép liên kết bộ sưu tập');}catch{window.prompt('Sao chép liên kết bộ sưu tập:',url.href);}});
  function updateArrows(){$('.shelf-arrow.previous').disabled=list.scrollLeft<2;$('.shelf-arrow.next').disabled=list.scrollLeft>=list.scrollWidth-list.clientWidth-2;}
  function moveShelf(direction){list.scrollBy({left:direction*list.clientWidth*.75,behavior:reduced.matches?'instant':'smooth'});}
  $('.shelf-arrow.previous').addEventListener('click',()=>moveShelf(-1));$('.shelf-arrow.next').addEventListener('click',()=>moveShelf(1));list.addEventListener('scroll',updateArrows,{passive:true});new ResizeObserver(updateArrows).observe(list);
  list.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key)||!filtered.length)return;event.preventDefault();const index=filtered.findIndex(item=>item.id===selected.id);const next=filtered[(index+(event.key==='ArrowRight'?1:-1)+filtered.length)%filtered.length];select(next);const button=list.querySelector(`[data-id="${next.id}"]`);button.focus({preventScroll:true});button.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced.matches?'instant':'smooth'});});
  function displayImage(){const img=$('#viewer-image');img.src=selected.images[imageIndex];img.alt=`${selected.title} — ảnh ${imageIndex+1}`;$('#viewer-count').textContent=`${imageIndex+1} / ${selected.images.length}`;$('#viewer-prev').disabled=imageIndex===0;$('#viewer-next').disabled=imageIndex===selected.images.length-1;}
  function open(){stop();imageIndex=0;$('#viewer-title').textContent=selected.title;const isVideo=type==='video';video.hidden=!isVideo;$('#viewer-image').hidden=isVideo;$('.viewer-footer').hidden=isVideo;
    viewer.showModal();document.body.classList.add('viewer-open');
    if(isVideo){video.poster=selected.images[0];video.src=selected.video;video.play().catch(()=>{});}else displayImage();
  }
  $('#open-art').addEventListener('click',open);$('#expand-art').addEventListener('click',open);$('#close-viewer').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.load();document.body.classList.remove('viewer-open');});
  viewer.addEventListener('click',event=>{if(event.target===viewer){const rect=viewer.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)viewer.close();}});
  function nextImage(delta){imageIndex=Math.max(0,Math.min(selected.images.length-1,imageIndex+delta));displayImage();}
  $('#viewer-prev').addEventListener('click',()=>nextImage(-1));$('#viewer-next').addEventListener('click',()=>nextImage(1));
  viewer.addEventListener('keydown',event=>{if(type!=='photo'||!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();nextImage(event.key==='ArrowLeft'?-1:1);});
  video.addEventListener('error',()=>{if(video.hasAttribute('src'))notify('Không thể phát video. Vui lòng thử lại.');});
  $('#play-art').addEventListener('click',()=>{if(type==='video'){open();return;}if(timer){stop();return;}if(filtered.length<2){open();return;}
    const start=()=>{timer=setInterval(()=>{const next=filtered[(filtered.findIndex(item=>item.id===selected.id)+1)%filtered.length];select(next);start();},5000);$('#play-art').setAttribute('aria-pressed','true');};start();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();video.pause();}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#filter-panel').hidden=true;$('.filter-toggle').setAttribute('aria-expanded','false');stop();}});
  const initial=collections.find(item=>item.id===location.hash.slice(1));if(initial){selected=initial;if(initial.video&&new URL(location.href).searchParams.get('media')!=='photo')type='video';}
  setType(type);
})();
