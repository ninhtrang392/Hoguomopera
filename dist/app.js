/* Programme catalogue is shared with the booking pages. */
const translations = {
  vi: {
    skip:'Đến nội dung chính',navPrograms:'Lịch diễn',navExperience:'Trải nghiệm',navAbout:'Về chúng tôi',navContact:'Liên hệ',book:'Đặt vé',heroTitle:'MỘT ĐÊM<br>NGHỆ THUẬT<br>ĐÁNG NHỚ.',heroSubtitle:'Khám phá mùa biểu diễn mới',discoverBook:'Khám phá & đặt vé',artConnects:'NGHỆ THUẬT<br>KẾT NỐI<br>CON NGƯỜI',scroll:'KÉO XUỐNG',programEyebrow:'CHƯƠNG TRÌNH BIỂU DIỄN',programTitle:'Chương trình biểu diễn',programDescription:'Những tác phẩm vượt thời gian, những trải nghiệm thăng hoa<br>tại trái tim nghệ thuật của Thủ đô.',allPrograms:'Xem tất cả chương trình',programFooter:'NGHỆ THUẬT VÌ CUỘC SỐNG TƯƠI ĐẸP HƠN',programSignature:'MỘT DI SẢN · VẠN CẢM XÚC',all:'Tất cả',concert:'Hòa nhạc',concertTitle:'Đêm giao hưởng',operaTitle:'Thanh âm bất tận',balletTitle:'Vũ điệu ánh sáng',illustrative:'Chương trình minh họa',viewProgram:'Xem chương trình',experienceEyebrow:'TRẢI NGHIỆM KHÔNG GIAN',experienceTitle:'Bước vào<br>khán phòng',experienceDescription:'Khám phá không gian nhà hát HỒ GƯƠM OPERA, từ sân khấu, khu ghế đến những tầng ban công.',viewSchedule:'Xem lịch diễn',exploreHint:'Chạm vào từng điểm để khám phá',stage:'Sân khấu',balcony:'Ban công',seats:'Khu ghế',spaceIllustration:'Không gian minh họa',peopleExtraordinary:'NHỮNG<br>CON NGƯỜI<br>TẠO NÊN<br>ĐIỀU PHI THƯỜNG',storyEyebrow:'CÂU CHUYỆN HỒ GƯƠM OPERA',storyTitle:'Phía sau một<br>đêm đáng nhớ',storyDescription:'Là những con người tận tụy, những buổi tập miệt mài và khát vọng mang nghệ thuật đỉnh cao đến gần hơn với công chúng Việt Nam.',discoverStory:'Khám phá câu chuyện',visitEyebrow:'THÔNG TIN DÀNH CHO KHÁCH THAM DỰ',visitTitle:'Sẵn sàng cho đêm diễn',directionsTitle:'Đường đến nhà hát',directionsSubtitle:'Vị trí, phương tiện, bãi đỗ xe',guideTitle:'Hướng dẫn tham dự',guideSubtitle:'Quy định, tiện ích, dịch vụ',supportTitle:'Hỗ trợ đặt vé',supportSubtitle:'Liên hệ, câu hỏi thường gặp',closingTitle:'Hẹn bạn tại nhà hát.',closingDescription:'Nơi những cảm xúc thăng hoa cùng nghệ thuật.',chooseProgram:'Chọn chương trình',betterLife:'NGHỆ THUẬT<br>VÌ MỘT CUỘC SỐNG<br>TỐT ĐẸP HƠN',footerTagline:'HÀ NỘI. NGHỆ THUẬT. MUÔN ĐỜI GẮN BỀN.',close:'Đóng'
  },
  en: {
    skip:'Skip to main content',navPrograms:'What’s on',navExperience:'Experience',navAbout:'Our story',navContact:'Contact',book:'Book tickets',heroTitle:'A NIGHT<br>OF ART.<br>UNFORGETTABLE.',heroSubtitle:'Discover a new season of performance',discoverBook:'Explore & book',artConnects:'ART<br>CONNECTS<br>US',scroll:'SCROLL DOWN',programEyebrow:'PERFORMANCES',programTitle:'Performances',programDescription:'Timeless masterpieces, unforgettable experiences<br>at the artistic heart of Hanoi.',allPrograms:'View all performances',programFooter:'ART FOR A MORE BEAUTIFUL LIFE',programSignature:'ONE HERITAGE · COUNTLESS EMOTIONS',all:'All',concert:'Concert',concertTitle:'A symphonic evening',operaTitle:'The endless voice',balletTitle:'A dance of light',illustrative:'Illustrative programme',viewProgram:'Explore programme',experienceEyebrow:'EXPLORE THE SPACE',experienceTitle:'Step inside<br>the auditorium',experienceDescription:'Explore the world of HỒ GƯƠM OPERA, from the stage and stalls to the sweeping balconies.',viewSchedule:'Explore performances',exploreHint:'Select a point to explore',stage:'Stage',balcony:'Balconies',seats:'Stalls',spaceIllustration:'Illustrative space',peopleExtraordinary:'THE PEOPLE<br>BEHIND THE<br>EXTRAORDINARY',storyEyebrow:'THE HỒ GƯƠM OPERA STORY',storyTitle:'Behind an<br>unforgettable night',storyDescription:'Dedicated people, tireless rehearsals, and a shared desire to bring exceptional performing arts closer to audiences in Vietnam.',discoverStory:'Discover our story',visitEyebrow:'PLAN YOUR VISIT',visitTitle:'Ready for your evening',directionsTitle:'Getting here',directionsSubtitle:'Location, transport & parking',guideTitle:'Your visit',guideSubtitle:'Guidelines, facilities & services',supportTitle:'Ticket support',supportSubtitle:'Contact & common questions',closingTitle:'See you at the opera.',closingDescription:'Where art moves you, and moments stay with you.',chooseProgram:'Choose a performance',betterLife:'ART<br>FOR A MORE<br>BEAUTIFUL LIFE',footerTagline:'HANOI. ART. AN ENDURING CONNECTION.',close:'Close'
  }
};
Object.assign(translations.vi, {viewDetails:'Xem chi tiết',musical:'Nhạc kịch', opera:'Opera', programScroll:'Cuộn để khám phá'});
Object.assign(translations.en, {viewDetails:'View details',musical:'Musical', opera:'Opera', programScroll:'Scroll to explore'});
let language='vi';
const t=key=>translations[language][key];
const dialog=document.querySelector('#detail-dialog');
let dialogType=null;

function setLanguage(lang){
  if(!translations[lang])return;
  language=lang;document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.innerHTML=t(el.dataset.i18n)});
  document.querySelectorAll('[data-lang]').forEach(el=>{const selected=el.dataset.lang===lang;el.classList.toggle('active',selected);el.setAttribute('aria-pressed',String(selected))});
  document.title=lang==='vi'?'Hồ Gươm Opera — Một đêm nghệ thuật đáng nhớ':'Hồ Gươm Opera — An unforgettable night';
  document.querySelector('.site-menu-toggle').setAttribute('aria-label',lang==='vi'?'Menu điều hướng':'Navigation menu');
  document.querySelector('.dialog-close').setAttribute('aria-label',t('close'));
  document.querySelector('.filters').setAttribute('aria-label',lang==='vi'?'Lọc chương trình':'Filter performances');
  document.querySelectorAll('.image-button').forEach(el=>el.setAttribute('aria-label',t('viewProgram')+': '+(performancePrograms[el.dataset.program]?.title || t(el.dataset.program+'Title'))));
  if(dialog.open&&dialogType)renderDialog(dialogType.kind,dialogType.key);
}
document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(el=>{const selected=el===button;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected))});
  document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter});
  document.dispatchEvent(new Event('programs:filter'));
}));

function closeMenu(){window.closeSiteMenu?.();}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});

const programmeCopy={
  vi:{concert:'Đắm mình trong những lớp thanh âm của dàn nhạc giao hưởng. Từ tiếng violin tinh tế đến âm hưởng đầy nội lực, mỗi khoảnh khắc là một cuộc gặp gỡ với cảm xúc.',opera:'Một hành trình qua những giọng hát và câu chuyện giàu cảm xúc. Để thanh âm opera dẫn lối, chạm đến những điều khó diễn tả bằng lời.',ballet:'Khi chuyển động trở thành ngôn ngữ. Những bước múa, âm nhạc và ánh sáng cùng kể một câu chuyện về vẻ đẹp và cảm xúc.'},
  en:{concert:'Immerse yourself in the layers of a symphony orchestra. From delicate violin lines to powerful orchestral passages, every moment is an encounter with emotion.',opera:'A journey through remarkable voices and moving stories. Let opera guide you to the feelings that words alone cannot express.',ballet:'When movement becomes a language. Dance, music, and light come together to tell a story of beauty and emotion.'}
};
const information={
  vi:{
    story:{title:'Phía sau một đêm đáng nhớ',label:'CÂU CHUYỆN HỒ GƯƠM OPERA',body:'<p>Một đêm diễn bắt đầu từ rất lâu trước khi tấm màn sân khấu mở ra. Đó là những giờ tập luyện, những lần điều chỉnh ánh sáng, và sự lắng nghe giữa người nghệ sĩ với dàn nhạc.</p><p>Trên sân khấu hay phía sau hậu trường, mỗi người đều góp một phần để tạo nên trải nghiệm trọn vẹn cho khán giả. Bởi nghệ thuật được tạo nên bằng tài năng, và được nuôi dưỡng bằng sự tận tâm.</p>'},
    directions:{title:'Đường đến nhà hát',label:'LÊN KẾ HOẠCH CHO ĐÊM DIỄN',body:'<p>Hãy kiểm tra địa chỉ đón khách và hướng dẫn di chuyển trên vé hoặc thông báo chính thức của từng chương trình trước khi khởi hành.</p><p>Dành thêm thời gian cho việc di chuyển, gửi xe và tìm chỗ ngồi. Thông tin bãi đỗ xe và lối vào sẽ được cập nhật cùng lịch biểu diễn.</p><p class="dialog-note">Thông tin chỉ đường chính thức chưa được kết nối trong bản giới thiệu này.</p>'},
    guide:{title:'Để tận hưởng trọn vẹn',label:'HƯỚNG DẪN THAM DỰ',body:'<ul><li>Kiểm tra giờ mở cửa và giờ bắt đầu trên vé.</li><li>Chuẩn bị vé hoặc mã xác nhận để xuất trình khi vào cửa.</li><li>Chuyển điện thoại sang chế độ im lặng khi buổi diễn bắt đầu.</li><li>Tuân theo hướng dẫn chụp ảnh, ghi hình của từng chương trình.</li><li>Nếu cần hỗ trợ tiếp cận hoặc di chuyển, hãy liên hệ đơn vị tổ chức trước buổi diễn.</li></ul><p class="dialog-note">Quy định cụ thể sẽ được công bố theo từng chương trình.</p>'},
    support:{title:'Hỗ trợ đặt vé',label:'CHÚNG TÔI CÓ THỂ GIÚP GÌ?',body:'<p><strong>Tôi có thể mua vé ở đâu?</strong><br>Liên kết đặt vé chính thức sẽ xuất hiện tại trang chi tiết khi chương trình mở bán.</p><p><strong>Có thể chọn chỗ ngồi không?</strong><br>Sơ đồ ghế, hạng vé và mức giá sẽ được cập nhật theo từng đêm diễn.</p><p><strong>Tôi muốn đổi hoặc hoàn vé?</strong><br>Vui lòng tham khảo chính sách của đơn vị bán vé được ghi trên xác nhận đặt chỗ.</p><p class="dialog-note">Đây là bản giới thiệu. Hiện chưa hỗ trợ mua vé hoặc thanh toán trực tuyến.</p>'}
  },
  en:{
    story:{title:'Behind an unforgettable night',label:'THE HỒ GƯƠM OPERA STORY',body:'<p>A performance begins long before the curtain rises. It starts with hours of rehearsal, careful lighting adjustments, and the shared attention of the artists and orchestra.</p><p>On stage and behind the scenes, every person contributes to a complete experience for the audience. Art is created through talent, and sustained by dedication.</p>'},
    directions:{title:'Getting to the theatre',label:'PLAN YOUR EVENING',body:'<p>Before setting off, check the arrival address and transport directions on your ticket or the official announcement for your performance.</p><p>Allow time for travel, parking, and finding your seat. Parking and entrance details will be provided with the performance schedule.</p><p class="dialog-note">Official travel information is not yet connected in this preview.</p>'},
    guide:{title:'Make the most of your visit',label:'YOUR VISIT',body:'<ul><li>Check the door opening and performance times on your ticket.</li><li>Have your ticket or confirmation code ready on arrival.</li><li>Silence your phone before the performance begins.</li><li>Follow the photography and recording guidelines for your event.</li><li>Contact the organiser in advance if you need accessibility assistance.</li></ul><p class="dialog-note">Specific visitor policies will be announced for each performance.</p>'},
    support:{title:'Ticket support',label:'HOW CAN WE HELP?',body:'<p><strong>Where can I buy tickets?</strong><br>The official booking link will appear in the programme details when ticket sales open.</p><p><strong>Can I choose my seat?</strong><br>Seating plans, ticket categories, and prices will be provided for each performance.</p><p><strong>Can I exchange or refund a ticket?</strong><br>Please consult the ticket provider’s policy on your booking confirmation.</p><p class="dialog-note">This is a preview. Online ticket purchases and payments are not yet available.</p>'}
  }
};
function renderDialog(kind,key){
  const image=document.querySelector('.dialog-image');
  image.classList.remove('dialog-poster');
  dialog.classList.toggle('programme-dialog',kind==='program');
  document.querySelector('.dialog-done').hidden=kind==='program';
  if(kind==='program'){
    const program=performancePrograms[key];
    if(!program)return;
    image.src=program.image;image.alt='Poster '+program.title;image.hidden=false;
    image.classList.add('dialog-poster');
    document.querySelector('.dialog-eyebrow').textContent=t(program.category);
    document.querySelector('#dialog-title').textContent=program.title;
    const vi=language==='vi';
    const body=document.querySelector('#dialog-body');body.replaceChildren();
    const intro=document.createElement('p');intro.className='programme-intro';
    intro.textContent=vi?program.description:program.title+' at Ho Guom Opera. '+program.artists+'.';
    const facts=document.createElement('dl');facts.className='dialog-programme-facts';
    for(const [label,value] of [[vi?'Ngày biểu diễn':'Date',program.date],[vi?'Thời gian':'Time',program.time],[vi?'Khán phòng':'Auditorium',vi?'Khán phòng chính':'Main Auditorium'],[vi?'Địa điểm':'Venue',(vi?'Nhà hát Hồ Gươm':'Ho Guom Opera')+' · 40 Hàng Bài, Hà Nội']]){
      const row=document.createElement('div'),term=document.createElement('dt'),detail=document.createElement('dd');
      term.textContent=label;detail.textContent=value;row.append(term,detail);facts.append(row);
    }
    const book=document.createElement('a');book.className='button dialog-book';book.href='dat-ve.html?program='+encodeURIComponent(key);book.textContent=vi?'Đặt vé ↗':'Book tickets ↗';
    body.append(intro,facts,book);
  }else{
    const content=information[language][key];image.hidden=key!=='story';if(key==='story'){image.src='assets/conductor.webp';image.alt=language==='vi'?'Nhạc trưởng dẫn dắt dàn nhạc':'Conductor leading an orchestra';}
    document.querySelector('.dialog-eyebrow').textContent=content.label;
    document.querySelector('#dialog-title').textContent=content.title;
    document.querySelector('#dialog-body').innerHTML=content.body;
  }
}
function openDialog(kind,key){if(kind==='program'&&!performancePrograms[key])return;dialogType={kind,key};renderDialog(kind,key);dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;}
document.querySelectorAll('button[data-program]').forEach(el=>el.addEventListener('click',()=>openDialog('program',el.dataset.program)));
document.querySelectorAll('[data-info]').forEach(el=>el.addEventListener('click',()=>openDialog('info',el.dataset.info)));
document.querySelectorAll('.dialog-close,.dialog-done').forEach(el=>el.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');dialogType=null;});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});

document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.target==='_blank')return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||!url.pathname.endsWith('/chuong-trinh.html'))return;
  const key=url.searchParams.get('program');if(!performancePrograms[key])return;
  event.preventDefault();openDialog('program',key);
});
