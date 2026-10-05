export class BookingError extends Error {
  constructor(code, message, status = 0) { super(message); this.code = code; this.status = status; }
}

// All inventory, money, holds and tickets are authoritative server data.
export function createBookingAPI(fetcher = globalThis.fetch.bind(globalThis)) {
  async function request(path, {method = 'GET', body, key} = {}) {
    let response;
    try {
      response = await fetcher(`/api/booking${path}`, {
        method, credentials: 'same-origin', cache: 'no-store',
        headers: {Accept: 'application/json', ...(body ? {'Content-Type': 'application/json'} : {}), ...(key ? {'Idempotency-Key': key} : {})},
        ...(body ? {body: JSON.stringify(body)} : {}), signal: AbortSignal.timeout(15000)
      });
    } catch { throw new BookingError('connection_error', 'Chưa thể kết nối dịch vụ đặt vé. Vui lòng thử lại.'); }
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new BookingError('service_unavailable', 'Đặt vé trực tuyến chưa được kết nối. Vui lòng quay lại sau.', response.status);
    }
    const data = await response.json();
    if (!response.ok) throw new BookingError(data.code || 'request_failed', data.message || 'Không thể hoàn tất thao tác. Vui lòng thử lại.', response.status);
    return data;
  }
  const id = encodeURIComponent;
  return {
    programme: program => request(`/programmes/${id(program)}`),
    inventory: performance => request(`/performances/${id(performance)}/inventory`),
    session: () => request('/session'),
    select: (performanceId, seatIds, revision, key) => request('/session/seats', {method:'PUT', body:{performanceId, seatIds, revision}, key}),
    buyer: (buyer, revision) => request('/session/buyer', {method:'PUT', body:{buyer, revision}}),
    pay: (methodId, revision, key) => request('/session/payments', {method:'POST', body:{methodId, revision}, key}),
    release: revision => request('/session', {method:'DELETE', body:{revision}}),
    resend: key => request('/session/tickets/email', {method:'POST', key})
  };
}

export const money = value => Number.isSafeInteger(value) && value >= 0
  ? new Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND', maximumFractionDigits:0}).format(value) : 'Chưa công bố';
export const remaining = (expiresAt, now = Date.now()) => Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000)) || 0;
export const isPaid = session => session?.status === 'PAID' || session?.status === 'TICKET_ISSUED';
export const isPending = session => session?.status === 'PENDING_PAYMENT';
export const categoryNames = ['DIAMOND','SAPPHIRE','RUBY','PLATINUM','GOLD','SILVER'];
export function sellable(seat, categories) {
  return seat.availability === 'AVAILABLE' && categories.some(c => c.id === seat.categoryId && categoryNames.includes(c.name) && Number.isSafeInteger(c.price) && c.price > 0);
}
export function safeURL(value, {external = false} = {}) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try { const url = new URL(value, globalThis.location?.href || 'http://localhost/');
    const origin = globalThis.location?.origin || 'http://localhost';
    return ((url.origin === origin && ['http:','https:'].includes(url.protocol)) || (external && url.protocol === 'https:')) ? url.href : null;
  } catch { return null; }
}
