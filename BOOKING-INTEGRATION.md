# Luồng mua vé Hồ Gươm Opera

## Demo tương tác được người dùng yêu cầu

Khi chưa có API, Khúc Hoan Ca chạy adapter `booking-demo.js` trong trình duyệt. Các ghế có số đọc được và hạng màu có thể chọn, vị trí dấu × bị khóa là đã bán trong kịch bản demo. Không suy diễn số ghế bị che. Giá dùng dữ liệu ảnh; phí dịch vụ **giả lập 2%**, giữ ghế demo 10 phút. Có ba kết quả thử: thành công, thất bại, chờ 5 giây rồi thành công. Người dùng nhập thông tin giả, nhận vé có mã `DEMO-`, ảnh bìa và hình mã minh họa không dùng vào cửa, có thể in/lưu PDF qua trình duyệt. Không gọi gateway, không thu tiền, không gửi email. Phiên demo lưu trong sessionStorage theo chương trình, có nút thử lại để xóa phiên. Đây thay thế chế độ chỉ xem tham khảo trước đó; dữ liệu `seat-reference.json` gốc vẫn không phải inventory bán thật.

## Đã triển khai

- `chuong-trinh.html?program=hoanca`: chi tiết chương trình, poster có sẵn, nghệ sĩ, CTA.
- `dat-ve.html?program=hoanca`: chọn suất → sơ đồ ghế → thông tin khách → kiểm tra/thanh toán → kết quả và vé điện tử.
- Header dùng chung; giao diện giao dịch không tải GSAP, video nền hoặc Three.js.
- Sơ đồ 2D nhận tọa độ nguyên bản; nhiều tầng, màu 6 hạng, zoom, pan, pinch, bàn phím; panel sticky và danh sách vé trên mobile.
- Chọn/bỏ ghế chỉ cập nhật sau phản hồi server; xung đột 409 cập nhật sơ đồ, không tải lại trang.
- Khôi phục phiên qua cookie HttpOnly; countdown theo thời gian server; không lưu thông tin người mua ở localStorage.
- Guest checkout, consent bắt buộc, marketing riêng không tick sẵn; kiểm tra đơn hàng dạng vé.
- Payment pending/failed/success tách riêng. Không tạo QR, vé, số tiền hoặc xác nhận thanh toán giả trên client.
- PDF, QR và email sử dụng dữ liệu và dịch vụ server.

## Chưa thể vận hành bán vé thật

Repository hiện là website tĩnh. Đã nhận ảnh `assets/booking/seat-reference.png`, nhưng phần lớn số ghế bị dấu × che khuất. Chưa có backend tồn kho/giữ ghế, giá và lịch mở bán, cổng thanh toán, dịch vụ email và chính sách chính thức. `server.mjs` trả JSON 503 có chủ đích cho API chưa triển khai.

Ảnh đã được trích xuất thành `seat-reference.json` bằng `scripts/trace-seat-reference.mjs`: 718 vị trí hình tròn được nhận diện/đối chiếu, chia hai tầng, giữ tọa độ và khoảng trống theo ảnh. Đây **không phải xác nhận sức chứa chính thức**. Có 49 nhãn số được chép từ phần đọc được; số bị che là `null`, ID có tiền tố `reference-`, không dùng làm ID ghế bán. Các hàng LG không được suy diễn số ghế. Cần bản không che số hoặc bảng ghế để đối chiếu trước khi gắn inventory thật.

Khi API chưa có, chương trình Khúc Hoan Ca cho chọn hai ngày trong ảnh để **xem sơ đồ tham khảo**. Có zoom/pan, chọn tầng hoặc xem toàn bộ khán phòng, lọc màu hạng và chạm/hover xem vị trí. Không cho giữ ghế, tính đơn hay thanh toán. Giá trong ảnh được lưu dưới `referencePrice`, không phải `price`; trạng thái tất cả vị trí là `UNVERIFIED`. Dữ liệu tham khảo không được gửi lên API giữ ghế. Khi API hoạt động, luồng live dùng inventory server như cũ.

## Hợp đồng API đề xuất (chưa phải backend đã triển khai)

Same-origin `/api/booking`. JSON, VND nguyên đồng, `Cache-Control: no-store`. Session guest bằng cookie `HttpOnly; Secure; SameSite=Lax`, không dùng ID đơn hàng đơn lẻ làm quyền truy cập. Backend kiểm tra Origin/CSRF, giới hạn tần suất, xác thực dữ liệu người mua và quyền truy cập PDF/QR/email. Các giá trị bên dưới mô tả cấu trúc, không phải dữ liệu bán vé chính thức.

### Catalogue và sơ đồ

- `GET /programmes/:programmeId` → `{id, description?, durationMinutes?, priceFrom?, notes?, termsUrl, privacyUrl, performances:[{id,dateLabel,weekday,time,startsAt,availability}]}`. Chỉ `availability: AVAILABLE` mới chọn được.
- `GET /performances/:performanceId/inventory` → `{floors, categories, seats}`.
  - `floors`: `{id,label,width,height,stage:{x,y,width,height},labels:[{text,x,y}]}`. Tọa độ sân khấu và nhãn/lối đi từ bản vẽ chính thức.
  - `categories`: `{id,name,price}`; `name` thuộc DIAMOND/SAPPHIRE/RUBY/PLATINUM/GOLD/SILVER. Giá có thể thay đổi theo suất.
  - `seats`: `{id,floorId,row,number,x,y,width,height,categoryId,availability}`. Giá trị hiển thị có thể AVAILABLE, HELD, SOLD hoặc UNAVAILABLE. Giữ nguyên số ghế và tọa độ, không tự sinh hàng.
  - Vé mời và dữ liệu nội bộ phải được loại bỏ ở server, chỉ trả UNAVAILABLE, không trả tên khách, chủ sở hữu hoặc lý do nội bộ.

### Session

- `GET /session` → session hiện hành, hoặc `null` / JSON 404 `{code:"no_session"}` khi chưa có phiên.
- `PUT /session/seats` body `{performanceId,seatIds,revision}` + `Idempotency-Key`. Tạo phiên nếu chưa có. Thay thế **toàn bộ tập ghế** nguyên tử: bỏ ghế cũ và giữ ghế mới trong cùng transaction; kiểm tra revision, inventory và expiry. Trả session chuẩn.
- `PUT /session/buyer` body `{buyer:{name,phone,email,consent,marketing},revision}` → session. Không cho lưu buyer khi chưa giữ ghế hoặc đã hết hạn. Server lưu phiên bản chính sách và thời điểm đồng ý.
- `DELETE /session` body `{revision}` → `{status:"CANCELLED"}`. Giải phóng giữ ghế; từ chối hủy nếu thanh toán còn chưa xác định. Không hủy vé đã thanh toán.

Session chuẩn:

```js
{
  id, revision, programmeId, programmeTitle,
  status, // DRAFT | SEAT_HELD | PENDING_PAYMENT | FAILED | EXPIRED | CANCELLED | PAID | TICKET_ISSUED
  serverTime, expiresAt, // ISO 8601, hold duration cấu hình ở server
  performance: {id,dateLabel,time,startsAt},
  seats: [{id,floorLabel,row,number,categoryName,price}],
  quote: {subtotal,serviceFee,total}, // server tính; không chấp nhận tổng từ client
  buyer: {name,phone,email,consent,marketing},
  paymentMethods: [{id,label,description}],
  tickets: [{seatId,code,qrImageUrl}],
  ticketsPdfUrl, emailStatus // PENDING | SENT | FAILED
}
```

### Thanh toán và phát hành vé

- `POST /session/payments` body `{methodId,revision}` + `Idempotency-Key` → `{session,redirectUrl?}`.
- Backend tạo giao dịch, whitelist URL chuyển hướng HTTPS của gateway, truyền callback tới `dat-ve.html?program=...`. Frontend **không đọc query success để xác nhận trả tiền**; luôn GET session.
- Cùng idempotency key trả lại cùng giao dịch. Server phải đảm bảo tối đa một thanh toán active/paid trên cùng đơn kể cả khác key; thay đổi revision phù hợp. Retry sau lỗi mạng đối chiếu giao dịch cũ trước.
- Xác minh chữ ký webhook, số tiền, tiền tệ, ID giao dịch, trạng thái và sự kiện trùng lặp ở backend. Chỉ webhook/kết quả kiểm tra server đáng tin mới chuyển PAID → SOLD → phát hành từng vé.
- PENDING không đồng nghĩa thành công; không tự giải phóng ghế khi đang đối chiếu giao dịch. Xử lý late-success/expiry một cách nguyên tử ở backend.
- Mỗi ghế một token ngẫu nhiên không đoán được, QR tạo ở backend. `qrImageUrl` và `ticketsPdfUrl` cùng origin, có kiểm tra quyền guest session.
- `POST /session/tickets/email` + `Idempotency-Key` → `{status:"SENT"|"QUEUED"}`; gửi lại chỉ sau PAID/TICKET_ISSUED, tới email đã xác nhận của đơn, có cooldown/rate limit. Email tự động gửi khi phát hành vé.

### Lỗi JSON

`{code,message}` với 409 `seat_unavailable` / `revision_conflict`, 410 `hold_expired`, 400 validation, 429 rate limit, 503 `service_unavailable`. Không đưa dữ liệu nội bộ vào message. Backend làm nguồn sự thật cho expiry và concurrency; đồng hồ trình duyệt chỉ phục vụ hiển thị.

## Kiểm tra

Hai trang mới tải `booking.bundle.js` / `programme.bundle.js` dưới dạng script `defer` thông thường, không phụ thuộc tải ES module khi mở bằng `file://`. Catalogue và sơ đồ tham khảo được đóng gói cùng entrypoint. Sau khi sửa `booking.js`, `booking-api.js`, `seat-map.js`, `programme.js`, catalogue hoặc JSON tham khảo, chạy `npm run build:booking`. Nguồn module vẫn dùng cho kiểm tra độc lập; kiểm tra controller cũng chạy bundle thực tế trong trường hợp API không kết nối.

`node tests/booking.test.mjs` và `node tests/booking-flow.test.mjs` đã đạt 9 kiểm tra: chặn ghế mời/đã bán, expiry, trạng thái payment, URL vé, lỗi API, revision/idempotency, yêu cầu hình học và toàn bộ controller từ chọn ghế đến phát hành vé/hết hạn bằng API test double. Các fixture hình học là dữ liệu test, không được xuất bản làm sơ đồ khán phòng. Chưa kiểm tra giao diện bằng trình duyệt.

Các trang, CSS và module mới trả HTTP 200 trên máy; API chưa kết nối trả 503 như thiết kế. Bộ kiểm tra toàn dự án có hai lỗi hiện hữu trong `tests/opera-journey.test.mjs` vì trang chủ hiện không có section `#story.opera-journey`; phần này không được thay đổi trong tác vụ mua vé.

Sau khi có backend: kiểm thử hai phiên cạnh tranh cùng ghế, đổi ghế nguyên tử, refresh/back, hết hạn, webhook trùng/chậm, lỗi mạng trong payment, email lỗi, PDF/QR không truy cập chéo phiên. Chưa kiểm thử giao dịch gateway hoặc gửi email thật.
