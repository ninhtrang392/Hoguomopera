import {categoryNames, money, sellable} from './booking-api.js';
export const categoryColors = {DIAMOND:'#ad3732', SAPPHIRE:'#164aa6', RUBY:'#87359c', PLATINUM:'#478d48', GOLD:'#bf6929', SILVER:'#baa13b'};
export function validInventory(data) {
  if (!data || !Array.isArray(data.floors) || !data.floors.length || !Array.isArray(data.seats) || !Array.isArray(data.categories)) return false;
  const floors = new Set(data.floors.map(f => f.id));
  const seats = new Set(data.seats.map(s => s.id));
  return floors.size === data.floors.length && seats.size === data.seats.length &&
    data.floors.some(f=>f.stage) && data.floors.every(f => typeof f.id === 'string' && Number.isFinite(f.width) && f.width > 0 && Number.isFinite(f.height) && f.height > 0 && (!f.stage || ['x','y','width','height'].every(k => Number.isFinite(f.stage[k])))) &&
    data.seats.every(s => typeof s.id === 'string' && floors.has(s.floorId) && ['x','y','width','height'].every(k => Number.isFinite(s[k])) && s.width > 0 && s.height > 0);
}

export function mountSeatMap({viewport, map, categoryList, detail, onSelect}) {
  let data, categoryId = null, selected = new Set(), disabled = false;
  let fit = 1;
  const offsets=()=>{let offset=0;return data.floors.map(f=>{const result={...f,offset};offset+=f.height;return result;});};
  const currentFloor = () => data?{width:Math.max(...data.floors.map(f=>f.width)),height:data.floors.reduce((sum,f)=>sum+f.height,0)}:null;
  function reset() {
    const floor=currentFloor();if(!floor||!viewport.clientWidth)return;
    fit=viewport.clientWidth/floor.width;
    viewport.style.height=`${Math.ceil(floor.height*fit)}px`;
    map.style.transform=`scale(${fit})`;
  }
  function place(node, geometry) {
    for (const key of ['x','y','width','height']) node.style[{x:'left',y:'top'}[key] || key] = `${geometry[key]}px`;
  }
  function draw() {
    const floor = currentFloor(); if (!floor) return;
    map.replaceChildren(); map.style.width=`${floor.width}px`; map.style.height=`${floor.height}px`;
    const visibleFloors=offsets();
    for(const view of visibleFloors){
    if(view.stage){const stage = document.createElement('div'); stage.className='stage-label'; stage.textContent='Sân khấu'; place(stage,{...view.stage,y:view.stage.y+view.offset}); map.append(stage);}
    if(view.offset){const line=document.createElement('div');line.className='floor-divider';line.style.top=`${view.offset}px`;map.append(line);}
    for (const label of view.labels || []) {
      if (!Number.isFinite(label.x) || !Number.isFinite(label.y)) continue;
      const el=document.createElement('span'); el.className='map-label'; el.textContent=label.text; el.style.left=`${label.x}px`; el.style.top=`${label.y+view.offset}px`;map.append(el);
    }
    }
    for (const original of data.seats) {
      const view=visibleFloors.find(f=>f.id===original.floorId);
      const seat={...original,y:original.y+(view?.offset||0)};
      const category = data.categories.find(c => c.id === seat.categoryId && categoryNames.includes(c.name));
      const active=selected.has(seat.id), available=sellable(seat,data.categories);
      const button=document.createElement('button');button.type='button';button.className='seat';
      // Preserve seat positions and the full clickable area.
      place(button,seat);
      button.style.setProperty('--category',categoryColors[category?.name] || '#77736e');
      const label = `${view?.label||floor.label} · Hàng ${seat.row} · ${seat.number?'Ghế '+seat.number:'Số ghế chưa đọc được từ ảnh'}`;
      const description = data.reference?`${label}${category?' · '+category.name:''} · Chưa xác nhận mở bán`:active || available ? `${label} · ${category?.name || ''} · ${money(category?.price)}` : `${label} · Ghế không khả dụng`;
      button.textContent=seat.number||'–';button.title=description;button.setAttribute('aria-label',description);button.setAttribute('aria-pressed',String(active));
      button.classList.toggle('reference-seat',!!data.reference);
      button.disabled=disabled || (!data.reference && !active && !available);
      button.classList.toggle('filtered',!!categoryId && category?.id!==categoryId);
      button.addEventListener('focus',()=>{detail.textContent=description;});
      button.addEventListener('pointerenter',()=>{if(available||active||data.reference)detail.textContent=description;});
      button.addEventListener('click',event=>{detail.textContent=description;if(!data.reference)onSelect(original);});map.append(button);
    }
  }
  function drawControls() {
    categoryList.replaceChildren();
    for (const category of data.categories.filter(c => categoryNames.includes(c.name) && (data.reference||Number.isSafeInteger(c.price) && c.price>0))) {
      const button=document.createElement('button');button.className='category-chip';button.style.setProperty('--category',categoryColors[category.name]);button.setAttribute('aria-pressed',String(category.id===categoryId));
      button.append(document.createTextNode(category.name+' '));const price=document.createElement('small');price.textContent=money(data.reference?category.referencePrice:category.price);button.append(price);
      button.addEventListener('click',()=>{categoryId=categoryId===category.id?null:category.id;drawControls();draw();});categoryList.append(button);
    }
  }
  new ResizeObserver(reset).observe(viewport);
  return {set(next,ids=[],busy=false){const changed=data!==next;data=next;selected=new Set(ids);disabled=busy;drawControls();draw();if(changed)reset();},reset};
}
