# Study 01 — Công nghệ và hướng dẫn chỉnh sửa trang chủ Hồ Gươm Opera

Ngày rà soát: 01/10/2026. Phạm vi chính: `dist/index.html` và những CSS/JavaScript mà trang này sử dụng. Tài liệu mô tả mã nguồn hiện tại, không phải thiết kế dự kiến hoặc kết quả kiểm thử trên trình duyệt.

## 1. Tổng quan kiến trúc

Website sử dụng **HTML, CSS và JavaScript thuần**. Trang chủ không sử dụng React, Vue hay Next.js. Nội dung chủ yếu được khai báo trong HTML; JavaScript bổ sung chuyển động, lọc chương trình, đổi ngôn ngữ và hộp thoại.

| Công nghệ | Vai trò thực tế | File tiêu biểu |
| --- | --- | --- |
| HTML semantic | Chia nội dung thành header, main, section, article, footer; khai báo biểu mẫu và dialog | `index.html` |
| CSS | Bố cục, responsive, lớp ảnh, typography, sticky, màu sắc và trạng thái | `styles.css`, CSS từng section |
| JavaScript DOM API | Gắn sự kiện, đọc `data-*`, thay nội dung và điều khiển trạng thái | `app.js`, `programs.js`, `footer.js` |
| ES Modules | Chia hàm chuyển động thành module; tải thư viện khi cần | `overture.js`, `theatre.js`, `media-videojs.js` |
| GSAP + ScrollTrigger | Timeline, parallax, ghim section và đồng bộ animation với cuộn | `hero-motion.js`, `booking-guide.js`, `finale.js` |
| Three.js / WebGL | Render chim bằng các điểm sáng và shader | `overture.js`, `vendor/three.module.js` |
| Canvas 2D | Đọc pixel ảnh chim để tạo dữ liệu hạt cho WebGL | `overture.js` |
| Web Animations API | Chuyển cảnh video, clip-path, transform, opacity | `media.js` |
| HTML video + Video.js | Video preview và trình phát trong dialog | `media.js`, `media-videojs.js`, `vendor/videojs-v10/` |
| Node.js HTTP | Phục vụ file tĩnh và hỗ trợ byte range cho video | `server.mjs` |
| Node.js test runner | Kiểm tra logic chuyển động và các luồng đã có test | `tests/*.test.mjs` |

Các thư viện giao diện được lưu trong `dist/vendor/`. Chú thích trong `overture.js` ghi Three.js 0.170.0 và GSAP 3.12.5; thư mục trình phát là `videojs-v10`. Không suy ra phiên bản thư viện từ phiên bản ứng dụng trong `package.json`.

## 2. Bản đồ section và file cần sửa

Các đường dẫn trong bảng tính từ thư mục `dist/`.

| Khu vực | Selector chính | CSS | JavaScript | Trạng thái |
| --- | --- | --- | --- | --- |
| Header dùng chung | `[data-site-header]` | `site-header.css` | `site-header.js`, tích hợp trang chủ trong `header.js` | Đang dùng |
| Mở màn | `.overture` | `overture.css` | `overture.js`, `hero-motion.js`, `bird-flight.js` | Đang dùng |
| Hero kiến trúc cũ | `#main-hero` | `hero.css` | `hero.js` | Có thuộc tính `hidden` |
| Chương trình biểu diễn | `#programs` | `programs.css` | `programs.js`, `app.js`, `programme-data.js` | Đang dùng |
| Media | `#media` | `media.css`, CSS Video.js | `media.js`, `media-videojs.js` | Đang dùng |
| Khám phá nhà hát | `#theatre` | `theatre.css` | `theatre.js`, `theatre-motion.js` | Đang dùng |
| Hành trình không gian | `#story.opera-journey` | `opera-journey.css` | `opera-journey.js` | File được nạp nhưng không có section tương ứng trong HTML hiện tại |
| Hướng dẫn đặt vé | `#booking-guide` | `booking-guide.css` | `booking-guide.js` | Đang dùng |
| Thông tin khách tham dự | `#visit` | Quy tắc liên quan trong CSS nền | `app.js` | HTML đang nằm trong comment |
| Kết màn | `#finale`, `.finale-shell` | `finale.css` | `finale.js` | Đang dùng |
| Footer | `.opera-footer` | `footer.css` | `footer.js`, ngôn ngữ qua `app.js` | Đang dùng |
| Hộp thoại | `#detail-dialog`, `#header-dialog`, `.media-dialog` | CSS nền và CSS tương ứng | `app.js`, `header.js`, `media.js` | Mở theo tương tác |

Ngoài CSS từng section, cần kiểm tra `typography.css` và `home-layout.css` khi một thay đổi bị ghi đè. `be-vietnam-pro.css` và `lora.css` khai báo font dùng trong trang.

## 3. Cách khởi chạy và thứ tự tải

Từ thư mục gốc dự án:

```powershell
cd D:\Hoguomopera
npm run dev
```

Mở `http://127.0.0.1:3000`. `npm start` cũng chạy `node server.mjs`. Nếu cổng 3000 đã có server dự án đang chạy, dùng server đó hoặc dừng tiến trình cũ trước khi khởi chạy lại.

Nên xem trang chủ qua HTTP vì trang có ES Modules và dynamic import. Mở trực tiếp bằng `file://` có thể gặp giới hạn tải module của trình duyệt.

Những quan hệ tải quan trọng:

1. CSS nền và CSS từng section được tải trước `site-header.css`.
2. `site-header.js` tạo markup header trước khi các script trang chủ gắn sự kiện vào các nút đó.
3. GSAP được tải trước ScrollTrigger; các script animation cần cả hai.
4. `programme-data.js` cung cấp `performancePrograms` trước `app.js` và `finale.js`.
5. `header.js` và `hero.js` mở rộng cơ chế dịch của `app.js`.
6. Script có `defer` chạy sau khi HTML được parse; script `type="module"` cũng trì hoãn thực thi theo cơ chế module, còn các import bất đồng bộ cần được chờ riêng.

`npm run check` hiện chỉ kiểm tra cú pháp `dist/app.js`, không kiểm tra toàn website. Trang chủ không có bước build bắt buộc trong `package.json`.

## 4. Header dùng chung

### Công nghệ và cách hoạt động

HTML chỉ khai báo điểm gắn:

```html
<header data-site-header data-page="home"></header>
```

`site-header.js` tạo logo, menu, nút tìm kiếm, tài khoản, đặt vé và menu mobile. Mảng `entries` là nơi quản lý các mục điều hướng. Script xác định đường dẫn từ vị trí chính file JavaScript, dùng `aria-expanded` cho menu và cập nhật `aria-current` cho mục đang chọn.

Theo dõi cuộn được gom bằng `requestAnimationFrame`; trạng thái `is-scrolled` có ngưỡng chuyển để hạn chế thay đổi liên tục. `MutationObserver` theo dõi thuộc tính `lang` để cập nhật nhãn.

`header.js` phụ trách dialog tìm kiếm và tích hợp ngôn ngữ của trang chủ. Tìm kiếm dùng danh mục `performancePrograms`, chuẩn hóa chuỗi rồi lọc tại trình duyệt; đây không phải công cụ tìm kiếm từ server.

### Hướng dẫn chỉnh sửa

- Thêm/sửa menu: sửa `entries` trong `site-header.js`.
- Sửa logo, tools, menu mobile: sửa `site-header.js` và `site-header.css`.
- Sửa giao diện/nội dung tìm kiếm trang chủ: xem `header.js` và `header.css`.
- Trang mới phải dùng header chung; thư viện dùng `data-page="library"`.
- Giữ nền header trong suốt, logo dẫn tới `index.html`; không thêm mục “Trang chủ”, chữ cạnh logo hoặc mục “Giới thiệu” vào header.
- Không tạo bản header riêng trong CSS/HTML từng trang.

Dialog tài khoản hiện kiểm tra dữ liệu đầu vào và hiển thị thông báo dịch vụ chưa sẵn sàng. Chưa có luồng xác thực tài khoản thật trong phần này.

## 5. Mở màn `.overture`: ảnh nhiều lớp và chim hạt

### Các thành phần

- `index.html`: lớp trời, trống đồng, kiến trúc nhà hát, vùng chim và slogan.
- `overture.css`: vị trí, kích thước, thứ tự xếp lớp và responsive.
- `overture.js`: khởi tạo WebGL, sinh hạt, cập nhật chim và quản lý vòng đời.
- `hero-motion.js`: intro, chuyển động theo cuộn và theo con trỏ của các lớp DOM.
- `bird-flight.js`: tính tư thế cánh, thời điểm đập cánh và lực đẩy hạt.

### Quy trình dựng chim

1. Tải Three.js bằng `import()`.
2. Đọc ảnh chim vào canvas 500 × 281.
3. Chọn pixel theo độ trong suốt và màu để lấy hình dáng chim.
4. Tạo tọa độ bằng `Float32Array`, đưa vào `BufferGeometry`.
5. Dùng `THREE.Points` và `ShaderMaterial` để vẽ chấm sáng; additive blending giúp chồng ánh sáng.
6. Dùng camera trực giao để giữ bố cục gần với tranh nhiều lớp.
7. Mỗi nhịp GSAP ticker cập nhật cánh, vị trí bay và tia sáng rồi render lại.

Biến `count` chọn 2.800 mẫu trên mobile hoặc khi bật tiết kiệm dữ liệu, 8.500 mẫu ở trường hợp còn lại. Đây không phải tổng số điểm cuối cùng: mã còn thêm cánh xa và phần thân. Chim thứ hai được tạo từ geometry/material sao chép.

Con trỏ chuột tạo lực đẩy cục bộ lên các hạt. Touch được bỏ qua ở thao tác đẩy hạt. `IntersectionObserver`, `document.hidden` và `prefers-reduced-motion` giúp hạn chế cập nhật khi không cần.

### Cách chỉnh

| Muốn thay đổi | Vị trí chỉnh |
| --- | --- |
| Ảnh trời, trống, nhà hát | Các `picture` trong `.overture` và `assets/hero-*.webp` |
| Slogan | `assets/hero-slogan.png`, thuộc tính `alt` trong HTML |
| Kích thước/vị trí lớp | `overture.css` |
| Thời gian xuất hiện | Timeline `intro` trong `hero-motion.js` |
| Trống quay nhanh/chậm | Tween `drumTurn`, hiện có `duration:150` |
| Độ parallax theo chuột | Các giá trị `depth` trong `hero-motion.js` |
| Độ dày hạt, độ sáng, kích thước hạt | `count`, uniforms và shader trong `overture.js` |
| Biên độ/chu kỳ cánh | Các hàm trong `bird-flight.js` |

`composeLayer()` cộng các thành phần vị trí và nhân các thành phần scale/opacity. Chỉ một nơi ghi transform cuối cùng vào mỗi lớp. Khi thêm hiệu ứng, nên đưa nó vào trạng thái được tổng hợp để tránh hai timeline cùng ghi đè `transform`.

Ảnh chim làm nguồn lấy mẫu hiện có `hidden`. Nhánh lỗi WebGL dọn tài nguyên và ghi cảnh báo; không nên mặc định rằng mọi lỗi đều tự hiện ảnh chim thay thế. Khi kiểm tra fallback, cần quan sát thực tế trường hợp WebGL không khả dụng.

## 6. Hero cũ `#main-hero`

Section vẫn có markup, ảnh và CTA nhưng đang `hidden`; phần mở màn hiện thấy là `.overture`. `hero.js` bổ sung chuỗi dịch và cập nhật mô tả ảnh, không dựng chim Three.js.

Muốn khôi phục hero này cần xem lại thuộc tính `hidden`, bố cục với overture và các CSS liên quan. Không nên sửa riêng `hero.css` rồi kỳ vọng phần mở màn hiện tại thay đổi.

## 7. Chương trình biểu diễn `#programs`

### Công nghệ và luồng dữ liệu

Đây là gallery cuộn ngang native, không dùng Swiper. `programs.js` điều khiển `scrollLeft`, nút trước/sau, chấm trang, kéo chuột và tự chuyển. Gallery nhân bản thẻ ở hai đầu để tạo vòng lặp; bản sao bị loại khỏi thứ tự Tab và ẩn với công nghệ hỗ trợ.

`app.js` xử lý `data-filter`, đặt `hidden` cho thẻ không phù hợp rồi phát sự kiện `programs:filter`. `programs.js` nhận sự kiện để dựng lại vòng lặp và chấm trang.

Autoplay dùng timeout 2.000 ms và chỉ chạy khi gallery hiện trên màn hình, tab đang hoạt động, người dùng không hover/chạm/focus trong section và không bật giảm chuyển động. Khi dialog mở, gallery không tự tiến sang thẻ tiếp theo.

### Thêm một chương trình

1. Thêm bản ghi có khóa duy nhất vào `programme-data.js`, theo cấu trúc chương trình đã có.
2. Thêm poster vào `assets/posters/`.
3. Sao chép một `.program-card` trong `index.html`.
4. Sửa tên, ngày giờ, ảnh, `alt`, `data-category`, `data-program` và các URL `?program=...`.
5. Nếu thêm thể loại, bổ sung nút lọc và chuỗi dịch tương ứng.
6. Kiểm tra mở chi tiết, lọc, kéo ngang và đường dẫn đặt vé.

Thẻ HTML chưa tự sinh hoàn toàn từ danh mục. Khi sửa ngày hoặc tên, cần đồng bộ cả HTML và `programme-data.js`.

Click thông thường vào link `chuong-trinh.html?program=...` được `app.js` bắt để mở dialog chi tiết. Mở tab mới hoặc truy cập URL trực tiếp vẫn dùng trang chi tiết độc lập. Link `dat-ve.html?program=...` dẫn tới trang đặt vé.

## 8. Media `#media`

### Công nghệ và cách hoạt động

`media.js` dùng `Element.animate()` — Web Animations API — để chuyển cảnh với clip-path, scale, opacity và easing. Section này không dựa vào GSAP để chuyển video. Vùng cuộn và phần sân khấu sticky tạo trải nghiệm đổi phim theo cuộn.

Mỗi `.media-film` khai báo:

```html
<article class="media-film"
         data-index="0"
         data-title="Tên phim"
         data-category="Thể loại"
         data-video="assets/media/ten-phim.mp4">
  <!-- Bên trong còn có bố cục, preview và nút .media-play -->
</article>
```

`data-video` là phim đầy đủ. `data-src` trên video preview là clip xem trước. Script lấy nguồn preview để phát trên video ở lớp nền tương ứng, giữ hình trong và ngoài ô xem nhất quán; các video preview trong thẻ được pause.

Dialog dùng HTML `<video>` bên trong các custom element `<video-player>` và `<video-skin>`. `media-videojs.js` tải Video.js khi section đến gần viewport (root margin 400 px), hoặc khi người dùng hover, focus hay click nút phát.

Player có play/pause, mute, seek, toàn màn hình, đổi video và thông tin. `preload="none"`, lazy import và việc pause khi ra khỏi vùng nhìn giảm tải ban đầu.

### Thêm hoặc thay video

1. Chuẩn bị poster, preview ngắn và video đầy đủ trong `assets/media/`.
2. Sửa `data-video`, `data-src`, `poster`, tiêu đề, thể loại và nhãn truy cập.
3. Khi thêm phim, thêm `.media-video-layer` tương ứng; thứ tự lớp nền phải khớp thứ tự `.media-film`.
4. Cập nhật các nút chọn phim, số thứ tự và tổng số hiển thị trong HTML.
5. Kiểm tra cuộn, wheel/touch, phím mũi tên, mở/đóng player, tua và trường hợp video không tải được.

Chiều cao vùng cuộn được tính từ số phim qua `--media-track-height`. Những số thứ tự viết trực tiếp trong HTML vẫn cần sửa thủ công.

`server.mjs` hỗ trợ HTTP Range, trả 206 cho đoạn dữ liệu hợp lệ. Điều này phục vụ tải/tua MP4 mà không bắt buộc lấy lại cả file.

## 9. Khám phá nhà hát `#theatre`

### Công nghệ và cách hoạt động

Section dùng CSS sticky và JavaScript thuần với `requestAnimationFrame`, không dùng timeline GSAP. `theatre-motion.js` tách riêng các hàm tính toán:

- `revealFrame(progress)`: tạo mặt nạ ellipse mở dần, scale ảnh và độ hiện chữ.
- `galleryFrame(distance, width, count)`: đổi quãng cuộn dọc thành độ dịch ngang và chỉ số panel.
- `clamp()`: giới hạn giá trị trong khoảng hợp lệ.

`theatre.js` đo kích thước bằng `ResizeObserver`, dịch `.theatre-track` bằng `translate3d`, cập nhật tiến độ, nút điều hướng và `inert` cho panel chưa hoạt động.

Khi bật giảm chuyển động hoặc chiều cao màn hình không quá 650 px, gallery chuyển sang cuộn ngang native. Bàn phím hỗ trợ ArrowLeft, ArrowRight, Home và End khi focus ở viewport.

### Chỉnh sửa

1. Sửa `.theatre-panel` trong HTML để thay tiêu đề, mô tả và ảnh.
2. Mỗi panel có thể gồm ảnh nền, ảnh chính và ảnh chi tiết trong `assets/theatre/`.
3. Chỉnh bố cục và tỷ lệ ảnh trong `theatre.css`.
4. Muốn thay hình dáng mở màn, sửa `revealFrame()`.
5. Muốn thay quy luật di chuyển, sửa `galleryFrame()` và kiểm tra `theatre-motion.test.mjs`.

Hiện có bốn panel. Nhãn `.theatre-photo-number` còn có mẫu `01 / 08`…`04 / 08`, trong khi trạng thái gallery dùng tổng số panel thực tế. Nếu chuẩn hóa số đếm, cần sửa các nhãn tĩnh này.

## 10. Hành trình không gian và thông tin khách tham dự

`opera-journey.js` có sẵn timeline GSAP gồm intro, ngoại thất, mặt đứng, cửa vào, sảnh, cầu thang, khán phòng và sân khấu. ScrollTrigger dùng pin/scrub, thời lượng cuộn khác nhau cho desktop/mobile; ảnh được chuyển bằng blur, clip-path và transform.

Tuy nhiên, `index.html` hiện không có `#story.opera-journey`. Script gặp kiểm tra đầu vào sẽ thoát. Chỉ sửa file này sẽ không tạo ra section mới trên trang.

`#visit` đang nằm trong comment HTML. `app.js` còn dữ liệu hướng dẫn đường đi, tham dự và hỗ trợ, nhưng các nút trong section comment chưa tồn tại trong DOM. Muốn đưa trở lại cần phục hồi markup và kiểm tra liên kết neo, CSS, nội dung dialog.

## 11. Hướng dẫn đặt vé `#booking-guide`

Section trình bày bốn bước bằng danh sách `<ol>`, ảnh `.booking-panel` và chữ song ngữ `data-booking-vi/en`.

`booking-guide.js` dùng GSAP + ScrollTrigger. Chế độ animation chỉ bật khi đồng thời:

- Chiều rộng ít nhất 901 px.
- Chiều cao ít nhất 680 px.
- Người dùng không yêu cầu giảm chuyển động.

Timeline ghim section, mở ảnh bằng `clip-path: inset(...)`, phóng ảnh nhẹ và thay độ sáng của các bước. `end:'+=360%'` xác định quãng cuộn, `scrub:1.1` làm mượt việc bám theo cuộn.

Để sửa nội dung, cập nhật cả `data-booking-vi`, `data-booking-en` và chữ ban đầu. Để sửa ảnh, cập nhật `.booking-panel`. Vòng lặp đổi bước chạy theo số panel; không mặc định mỗi bước đều có một ảnh riêng. Khi tăng/giảm panel, cần rà soát ánh xạ với `.booking-step` và các mốc cuối timeline.

Đây là phần hướng dẫn trên trang chủ. Chức năng chọn ghế và giao dịch thuộc trang đặt vé riêng.

## 12. Kết màn `#finale`

### Công nghệ và trình tự

GSAP + ScrollTrigger điều khiển toàn `.finale-shell`, bao gồm section kết màn và footer:

1. Phóng nền khán phòng, tăng độ tối.
2. Đóng hai lớp rèm rồi mở ra.
3. Hiện nghệ sĩ, tiêu đề và thông tin chương trình.
4. Thu nhỏ/đẩy phần hình lên, đưa footer vào màn hình.

Ảnh nằm trong `assets/finale/`: nền, nghệ sĩ và hai rèm. Dữ liệu chương trình nổi bật được lấy từ `performancePrograms.hoanca` khi có.

Animation chỉ bật khi không yêu cầu giảm chuyển động và chiều cao ít nhất 520 px. `inert` ngăn focus vào CTA/footer khi chúng chưa được hiển thị trong timeline.

### Chỉnh sửa

- Thay hình: sửa `src` trong HTML và kiểm tra vùng trong suốt của ảnh nghệ sĩ/rèm.
- Thay chương trình: sửa khóa truy cập trong `finale.js`, đồng thời sửa HTML dự phòng, `data-program` và `href` CTA.
- Thay nhịp chuyển: sửa vị trí thời gian và `duration` trong timeline.
- Sau khi sửa timeline, kiểm tra lại ngưỡng `syncAccess()` (hiện 5.5 và 8.45) để thời điểm nhận focus khớp thời điểm hiển thị.

Footer nằm trong cùng shell nên đổi chiều cao footer có thể ảnh hưởng bố cục kết màn.

## 13. Footer và nút về đầu trang

`footer.css` quản lý bố cục; `footer.js` xử lý nút về đầu trang, form nhận tin và các dialog thông tin.

Nút về đầu trang hiện thực hiện:

```javascript
document.querySelector('[data-site-header] .site-logo')
  ?.focus({preventScroll:true});
window.scrollTo({
  top:0,
  behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'instant'
    : 'smooth'
});
```

Focus được chuyển tới logo. Trước đó focus đặt vào `.skip-link` làm ô trắng “Đến nội dung chính” xuất hiện. Không đặt lại focus về skip link trong handler này nếu muốn tránh lỗi cũ.

Skip link vẫn có ích khi điều hướng bằng bàn phím; việc sửa nút về đầu trang không yêu cầu xóa nó.

Form newsletter hiện chỉ ngăn submit và báo chưa mở đăng ký, chưa gửi email tới dịch vụ nào. Các nút mạng xã hội/chính sách mở nội dung thông báo, chưa phải tất cả đều dẫn đến trang thật. Địa chỉ, điện thoại và email được khai báo bằng link trong HTML.

## 14. Ngôn ngữ, dialog và dữ liệu dùng chung

### Hai cách khai báo bản dịch

`app.js` dùng từ điển `translations` và `data-i18n`:

```html
<span data-i18n="book">Đặt vé</span>
```

Nhiều section dùng cặp dữ liệu ngay trong HTML:

```html
<p data-booking-vi="Nội dung tiếng Việt"
   data-booking-en="English content">Nội dung tiếng Việt</p>
```

Thuộc tính `lang` trên `<html>` là tín hiệu để các `MutationObserver` cập nhật section. Khi sửa chữ, cần sửa nguồn dịch tương ứng, nếu không chữ sẽ bị ghi đè khi chuyển ngôn ngữ. Không phải toàn bộ chữ tĩnh trong HTML đều đã có bản dịch.

### Hộp thoại

Trang dùng `<dialog>` native với `showModal()`/`close()`. `app.js` quản lý chi tiết chương trình; `header.js` quản lý tìm kiếm; `media.js` quản lý player; `site-header.js` tạo dialog tài khoản; `footer.js` mở thông tin footer.

Khi thêm dialog, kiểm tra tiêu đề qua `aria-labelledby`, nút đóng, phím Escape, trạng thái cuộn và focus sau khi đóng. Với nội dung thuần văn bản, ưu tiên `textContent`; các vùng đang dùng `innerHTML` chỉ nên nhận nội dung đã kiểm soát.

## 15. Trang liên quan và giới hạn dịch vụ

| Trang/chức năng | File chính để đọc tiếp |
| --- | --- |
| Chi tiết chương trình | `chuong-trinh.html`, `programme.js`, `programme-data.js` |
| Đặt vé | `dat-ve.html`, `booking.js`, `booking-api.js`, `booking-demo.js` |
| Sơ đồ ghế | `seat-map.js`, `seat-layout.json` |
| Thư viện số | `thu-vien-so.html`, `library.css`, `library.js` |

Mục này chỉ chỉ dẫn sang các phần liên quan, không phải tài liệu đầy đủ của toàn bộ quy trình đặt vé/thư viện.

Server local hiện trả HTTP 503 cho `/api/booking/`; không có backend bán vé thật trong `server.mjs`. Không đồng nhất giao diện đặt vé/demo với việc đã giữ ghế, thu tiền hoặc phát hành vé thật. Tài liệu tích hợp riêng nằm ở `BOOKING-INTEGRATION.md` tại gốc dự án.

Nếu sửa nguồn đặt vé/chi tiết chương trình, tạo lại bundle bằng:

```powershell
npm run build:booking
```

Lệnh tạo `dist/booking.bundle.js` và `dist/programme.bundle.js`. Sửa module nguồn trước, không dùng bundle sinh tự động làm nơi chỉnh sửa chính.

## 16. Responsive, hiệu năng và khả năng truy cập

Các section có breakpoint riêng, không có một breakpoint duy nhất cho toàn trang. Ví dụ: overture dùng 760 px, Media xét 991 px ở chuyển cảnh, booking guide dùng 901 px kèm điều kiện chiều cao.

Những cơ chế đã có trong mã:

- `<picture>` chọn ảnh mobile/desktop; WebP dùng nhiều cho ảnh trang trí.
- Preload ảnh kiến trúc đầu trang, `fetchpriority` cho một số tài nguyên đầu trang.
- `loading="lazy"` cho nhiều ảnh bên dưới.
- Dynamic import cho Three.js và trình phát Video.js.
- `IntersectionObserver` theo dõi phần đang nhìn thấy.
- `requestAnimationFrame` gom cập nhật cuộn trong một số section.
- `ResizeObserver` đo lại khi kích thước thay đổi.
- `document.fonts.ready` và `ScrollTrigger.refresh()` đo lại sau khi font sẵn sàng.
- `prefers-reduced-motion` giảm hoặc bỏ chuyển động theo thiết lập người dùng.
- `aria-*`, `inert`, trạng thái focus và các nút native hỗ trợ bàn phím.

Khi tối ưu, đo riêng ảnh/video, tải thư viện và chi phí render. Không tăng số hạt hoặc thêm nhiều listener cuộn chỉ để tạo hiệu ứng nhỏ. Không cho hai đoạn mã cùng điều khiển transform một phần tử nếu chưa có cơ chế tổng hợp.

## 17. Quy trình chỉnh sửa và kiểm tra

1. Xác định đúng selector trong bảng section.
2. Sửa nội dung ở HTML/dữ liệu, hình thức ở CSS section, hành vi ở JavaScript tương ứng.
3. Kiểm tra CSS nạp sau có ghi đè không bằng tab Computed trong DevTools.
4. Mở Console và Network để tìm lỗi JavaScript, file 404 hoặc video không tải.
5. Kiểm tra desktop, mobile, màn hình thấp và chế độ giảm chuyển động.
6. Kiểm tra bàn phím: Tab, Enter, Escape, phím mũi tên ở gallery.
7. Đổi VI/EN, mở dialog rồi cuộn về đầu trang.

Các lệnh kiểm tra mẫu, chạy từ gốc dự án:

```powershell
# Kiểm tra cú pháp file vừa sửa
node --check dist/footer.js

# Kiểm tra logic chuyển động liên quan
node --test tests/hero-motion.test.mjs tests/bird-flight.test.mjs
node --test tests/theatre-motion.test.mjs
node --test tests/media.test.mjs tests/media-loading.test.mjs
node --test tests/finale.test.mjs
```

Đây là các lệnh hướng dẫn, không phải tuyên bố rằng toàn bộ test đã được chạy khi viết tài liệu. Test logic không thay thế việc xem ảnh, cuộn, video và responsive trên trình duyệt.

### Tra cứu nhanh khi gặp lỗi

| Hiện tượng | Kiểm tra trước |
| --- | --- |
| Sửa mở màn nhưng giao diện không đổi | Có đang sửa hero bị `hidden` thay vì overture không? |
| Animation không chạy | Thư viện tải thành công, selector tồn tại, điều kiện kích thước/reduced motion |
| Chim biến mất | WebGL, ảnh nguồn lấy mẫu, Console trong `startOverture()` |
| Sửa chữ xong bị đổi lại | `data-i18n`, `data-*-vi/en`, từ điển dịch |
| Tên/ngày chương trình không khớp | HTML tĩnh, `programme-data.js`, dữ liệu finale |
| Gallery lệch sau lọc | Sự kiện `programs:filter`, kích thước thẻ, vòng lặp clone |
| Video nền sai phim | Thứ tự `.media-film` và `.media-video-layer`, nguồn preview |
| Tua video lỗi | File MP4, response Range của server, Console/Network |
| Footer chưa nhận được Tab | Trạng thái `inert` và mốc thời gian trong `finale.js` |
| Ô trắng xuất hiện khi về đầu trang | Focus không được chuyển tới `.skip-link` trong `footer.js` |

## 18. Thứ tự học đề xuất

1. Đọc `index.html` để hiểu cấu trúc và tên class.
2. Đọc `styles.css`, `typography.css`, `home-layout.css` để hiểu CSS cascade.
3. Đọc `footer.js` và `booking-guide.js` để làm quen sự kiện, dịch và timeline ngắn.
4. Đọc `app.js` + `programs.js` để hiểu dữ liệu, lọc và carousel.
5. Đọc `theatre-motion.js` + `theatre.js` để hiểu ánh xạ cuộn thành chuyển động.
6. Đọc `media.js` + `media-videojs.js` để hiểu video, animation bất đồng bộ và lazy loading.
7. Đọc `hero-motion.js`, `bird-flight.js`, `overture.js` để hiểu tổng hợp chuyển động, hạt và WebGL.
8. Đọc `finale.js` để hiểu timeline phối hợp nhiều vùng giao diện và quản lý focus.
