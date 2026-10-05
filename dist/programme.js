import {createBookingAPI, money} from './booking-api.js';
const id = new URLSearchParams(location.search).get('program') || 'hoanca';
const program = performancePrograms[id];
const $ = selector => document.querySelector(selector);
if (!program) {
  $('#programme-title').textContent = 'Không tìm thấy chương trình';
  $('#book-programme').hidden = true;
  $('#programme-status').textContent = 'Vui lòng trở lại lịch biểu diễn để chọn chương trình khác.';
} else {
  document.title = `${program.title} — Hồ Gươm Opera`;
  $('#programme-title').textContent = program.title;
  $('#programme-date').textContent = program.date;
  $('#programme-time').textContent = program.time;
  $('#programme-description').textContent = program.description;
  $('#programme-image').src = program.image;
  $('#programme-image').alt = `Poster ${program.title}`;
  $('#programme-image').hidden = false;
  $('#book-programme').href = `dat-ve.html?program=${encodeURIComponent(id)}`;
  createBookingAPI().programme(id).then(data => {
    if (data.durationMinutes) $('#programme-duration').textContent = `${data.durationMinutes} phút`;
    if (Number.isSafeInteger(data.priceFrom)) $('#programme-price').textContent = `Giá từ ${money(data.priceFrom)}`;
    if (!data.performances?.length) $('#programme-status').textContent = 'Chưa có suất diễn đang mở bán.';
  }).catch(error => {$('#programme-status').textContent = error.message;});
}
