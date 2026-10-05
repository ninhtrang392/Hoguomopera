(() => {
  const section = document.querySelector('#media');
  if (!section) return;
  const $ = selector => section.querySelector(selector);
  const stage = $('.media-stage');
  const films = [...section.querySelectorAll('.media-film')];
  section.style.setProperty('--media-track-height', `${100 + Math.max(0, films.length - 1) * 110}svh`);
  const previews = films.map(film => film.querySelector('video'));
  const selectors = [...section.querySelectorAll('[data-media-select]')];
  const layers = [...section.querySelectorAll('.media-video-layer')];
  const backgroundVideos = layers.map(layer => layer.querySelector('video'));
  const modal = document.querySelector('.media-dialog');
  const player = modal.querySelector('video');
  const playerSurface = player;
  const seek = modal.querySelector('.media-seek');
  const error = modal.querySelector('.media-error');
  const bigPlay = modal.querySelector('.media-big-play');
  const info = modal.querySelector('.media-info');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = 'cubic-bezier(.75,0,.25,1)';
  // Jason Bergh's directional, centre-out video reveal.
  const videoEase = 'cubic-bezier(.75,0,0,1)';
  const openClip = 'inset(0% 0%)', closedClip = 'inset(0% 50%)';
  let active = 0, visible = false, paused = false, busy = false, pending = null;
  let outgoingIndex = null, lastGesture = -Infinity, touchStart = null, touchConsumed = false;
  let frame = 0, scrollIndex = 0, closing = false, opener, idleTimer, playerIndex = 0;
  const english = () => document.documentElement.lang === 'en';
  const text = (vi, en) => english() ? en : vi;
  const animate = (el, keyframes, duration = 800, delay = 0, easing = ease) => {
    if (reduced.matches) return Promise.resolve();
    const animation = el.animate(keyframes, { duration, delay, easing, fill: 'both' });
    return animation.finished.then(() => animation.cancel()).catch(() => {});
  };
  function syncPlayback() {
    const shouldPlay = visible && !paused && !reduced.matches && !modal.open && !document.hidden;
    // Each full-screen layer also supplies the central focus window, keeping
    // the image inside and outside the aperture exactly in sync.
    previews.forEach(video => video.pause());
    backgroundVideos.forEach((video, i) => {
      if (shouldPlay && (i === active || i === outgoingIndex)) {
        const source = previews[i].dataset.src;
        if (video.dataset.activeSrc !== source) {
          video.dataset.activeSrc = source;
          video.poster = previews[i].poster;
          video.src = source;
          video.load();
        }
        video.play().then(() => {
          if (!video.paused) video.classList.add('is-playing');
        }).catch(() => video.classList.remove('is-playing'));
      } else video.pause();
    });
  }
  function syncGallery() {
    selectors.forEach((button, i) => button.setAttribute('aria-current', String(i === active)));
    const poster = previews[(active + 1) % films.length].poster;
    section.querySelectorAll('.media-neighbor img').forEach(img => { img.src = poster; });
    films.forEach((film, i) => { film.inert = i !== active; });
    syncPlayback();
  }
  async function change(index, direction = index > active ? 1 : -1) {
    index = (index + films.length) % films.length;
    if (busy) { pending = { index, direction }; return; }
    if (index === active) return;
    busy = true;
    const previous = active, old = films[previous], next = films[index];
    const oldLayer = layers[previous], nextLayer = layers[index];
    const mobile = innerWidth <= 991;
    const duration = mobile ? 800 : 1350;
    if (old.contains(document.activeElement)) stage.focus({ preventScroll: true });
    old.inert = true;
    outgoingIndex = previous;
    active = index;
    next.classList.add('is-active');
    // Keep the old frame alive beneath the incoming video. Reverse scrolling
    // closes the top layer instead of replaying the forward reveal.
    nextLayer.style.visibility = 'visible';
    nextLayer.style.zIndex = direction > 0 ? '3' : '1';
    oldLayer.style.zIndex = '2';
    nextLayer.style.clipPath = openClip;
    oldLayer.style.clipPath = direction > 0 ? openClip : closedClip;
    old.classList.add('is-outgoing');
    next.style.zIndex = '2';
    old.style.zIndex = '1';
    old.querySelectorAll('.media-meta').forEach(el => { el.style.opacity = '0'; });
    next.querySelectorAll('.media-meta').forEach(el => { el.style.opacity = '1'; });
    syncGallery();
    await Promise.all([
      animate(direction > 0 ? nextLayer : oldLayer,
        [{ clipPath:direction > 0 ? closedClip : openClip }, { clipPath:direction > 0 ? openClip : closedClip }], duration, 0, videoEase),
      ...[...old.querySelectorAll('.media-meta')].map(el => animate(el,
        [{ transform:'translateY(0)', opacity:1 }, { transform:`translateY(${-direction * 100}%)`, opacity:0 }], mobile ? 300 : 400)),
      ...[...next.querySelectorAll('.media-meta')].map(el => animate(el,
        [{ transform:`translateY(${direction * 100}%)`, opacity:0 }, { transform:'translateY(0)', opacity:1 }], mobile ? 800 : 1200, 0, 'cubic-bezier(.65,0,0,1)'))
    ]);
    old.classList.remove('is-active');
    old.classList.remove('is-outgoing');
    oldLayer.style.visibility = 'hidden';
    oldLayer.style.clipPath = closedClip;
    nextLayer.style.zIndex = '2';
    outgoingIndex = null;
    busy = false;
    syncPlayback();
    if (pending) { const queued = pending; pending = null; change(queued.index, queued.direction); }
  }
  function onScroll() {
    frame = 0;
    if (!visible || document.hidden || reduced.matches || modal.open) return;
    const track = $('.media-scroll');
    const progress = -track.getBoundingClientRect().top / Math.max(1, track.offsetHeight - stage.offsetHeight);
    const index = Math.round(Math.max(0, Math.min(1, progress)) * (films.length - 1));
    if (index !== scrollIndex) { scrollIndex = index; change(index); }
  }
  const schedule = () => { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(onScroll); };
  function pinned() {
    const rect = $('.media-scroll').getBoundingClientRect();
    return rect.top <= 1 && rect.bottom >= stage.offsetHeight - 1;
  }
  function navigate(index, direction = index > active ? 1 : -1) {
    index = (index + films.length) % films.length;
    if (pinned() && !reduced.matches) {
      const track = $('.media-scroll');
      scrollIndex = index;
      window.scrollTo({ top:window.scrollY + track.getBoundingClientRect().top +
        index / Math.max(1, films.length - 1) * (track.offsetHeight - stage.offsetHeight), behavior:'instant' });
    }
    change(index, direction);
  }
  function gesture(event, delta) {
    if (reduced.matches || modal.open || !pinned() || Math.abs(delta) <= 1) return;
    const direction = Math.sign(delta), index = active + direction;
    const cooling = Date.now() - lastGesture < (innerWidth <= 991 ? 900 : 1400);
    if (busy || cooling) { event.preventDefault(); return; }
    // Allow the page to continue before the first and after the last film.
    if (index < 0 || index >= films.length) return;
    event.preventDefault();
    lastGesture = Date.now();
    navigate(index, direction);
  }
  stage.addEventListener('wheel', event => {
    if (!event.ctrlKey && Math.abs(event.deltaY) >= Math.abs(event.deltaX || 0)) gesture(event, event.deltaY);
  }, {passive:false});
  stage.addEventListener('touchstart', event => {
    touchConsumed = false;
    touchStart = event.touches.length === 1 ? {x:event.touches[0].clientX,y:event.touches[0].clientY} : null;
  }, {passive:true});
  stage.addEventListener('touchmove', event => {
    if (touchConsumed && event.touches.length === 1) { event.preventDefault(); return; }
    if (!touchStart || event.touches.length !== 1) return;
    const delta = touchStart.y - event.touches[0].clientY;
    if (Math.abs(delta) >= 50 && Math.abs(delta) > Math.abs(touchStart.x - event.touches[0].clientX)) {
      gesture(event, delta);
      if (event.defaultPrevented) { touchConsumed = true; touchStart = null; }
    }
  }, {passive:false});
  selectors.forEach((button, index) => button.addEventListener('click', () => navigate(index)));
  section.querySelectorAll('[data-media-step]').forEach(button => button.addEventListener('click', () => navigate(active + Number(button.dataset.mediaStep), Number(button.dataset.mediaStep))));
  stage.addEventListener('keydown', event => {
    if (!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); const direction = ['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1;
    navigate(active + direction, direction);
  });
  $('.media-motion').addEventListener('click', () => { paused = !paused; translate(); syncPlayback(); });
  function time(value) { return Number.isFinite(value) ? `${String(Math.floor(value / 60)).padStart(2,'0')}:${String(Math.floor(value % 60)).padStart(2,'0')}` : '00:00'; }
  function playerUI() {
    bigPlay.hidden = !player.paused;
    modal.querySelector('.media-toggle').textContent = player.paused ? text('Phát','Play') : text('Dừng','Pause');
    modal.querySelector('.media-mute').textContent = player.muted ? text('Bật tiếng','Unmute') : text('Tắt tiếng','Mute');
    modal.querySelector('.media-time').textContent = `${time(player.currentTime)} · ${time(player.duration)}`;
    seek.value = player.duration ? String(player.currentTime / player.duration * 1000) : '0';
    seek.setAttribute('aria-valuetext', `${time(player.currentTime)} / ${time(player.duration)}`);
    seek.disabled = !Number.isFinite(player.duration) || !player.duration;
  }
  function wake() {
    clearTimeout(idleTimer); modal.classList.remove('is-idle');
    if (!player.paused) idleTimer = setTimeout(() => {
      if (!modal.contains(document.activeElement) || document.activeElement === modal) modal.classList.add('is-idle');
    }, 3000);
  }
  function loadPlayer(index) {
    playerIndex = (index + films.length) % films.length;
    const film = films[playerIndex];
    player.pause(); error.hidden = true;
    player.poster = previews[playerIndex].poster; player.src = film.dataset.video;
    modal.querySelector('h2').textContent = film.dataset.title;
    modal.querySelector('.media-player-category').textContent = film.dataset.category;
    info.textContent = `${film.dataset.title} — ${film.dataset.category} · Hồ Gươm Opera`;
    player.play().catch(() => { playerUI(); }); playerUI(); wake();
  }
  function maskFrom(rect) {
    return `inset(${Math.max(0,rect.top)}px ${Math.max(0,innerWidth-rect.right)}px ${Math.max(0,innerHeight-rect.bottom)}px ${Math.max(0,rect.left)}px round 3px)`;
  }
  films.forEach((film, i) => film.querySelector('.media-play').addEventListener('click', async event => {
    if (busy || closing) return;
    opener = event.currentTarget;
    const rect = film.querySelector('.media-window').getBoundingClientRect();
    modal.showModal(); document.body.classList.add('media-open');
    info.hidden = true; modal.querySelector('.media-info-toggle').setAttribute('aria-expanded','false');
    syncPlayback(); loadPlayer(i);
    await animate(modal, [{ clipPath:maskFrom(rect) }, { clipPath:'inset(0px 0px 0px 0px round 0px)' }], 1000);
  }));
  async function closePlayer() {
    if (closing || !modal.open) return;
    closing = true; player.pause(); clearTimeout(idleTimer);
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    const rect = films[active].querySelector('.media-window').getBoundingClientRect();
    await animate(modal, [{ clipPath:'inset(0px 0px 0px 0px)' }, { clipPath:maskFrom(rect) }], 800);
    modal.close(); closing = false;
  }
  modal.querySelector('.media-dialog-close').addEventListener('click', closePlayer);
  modal.addEventListener('cancel', event => { event.preventDefault(); closePlayer(); });
  modal.addEventListener('close', () => {
    clearTimeout(idleTimer); player.pause();
    player.removeAttribute('src');player.load();
    document.body.classList.remove('media-open'); modal.classList.remove('is-idle');
    opener?.focus({ preventScroll:true }); syncPlayback();
  });
  function togglePlay() { if (player.paused) player.play().catch(() => {}); else player.pause(); wake(); }
  modal.querySelector('.media-toggle').addEventListener('click', togglePlay);
  bigPlay.addEventListener('click', togglePlay); player.addEventListener('click',()=>{if(!modal.classList.contains('has-videojs'))togglePlay();});
  modal.querySelector('.media-mute').addEventListener('click', () => { player.muted = !player.muted; playerUI(); });
  seek.addEventListener('input', () => { if (Number.isFinite(player.duration)) player.currentTime = Number(seek.value) / 1000 * player.duration; wake(); });
  modal.querySelector('.media-fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (modal.requestFullscreen) await modal.requestFullscreen(); else if (player.webkitEnterFullscreen) player.webkitEnterFullscreen(); } catch { /* Fullscreen may be denied by the host browser. */ }
  });
  modal.querySelector('.media-info-toggle').addEventListener('click', event => { info.hidden = !info.hidden; event.currentTarget.setAttribute('aria-expanded', String(!info.hidden)); });
  let navigating = false;
  modal.querySelectorAll('[data-player-step]').forEach(button => button.addEventListener('click', async () => {
    if (navigating || closing) return;
    navigating = true;
    await animate(playerSurface, [{ clipPath:'inset(0 0%)' }, { clipPath:'inset(0 50%)' }], 450);
    if (modal.open && !closing) {
      loadPlayer(playerIndex + Number(button.dataset.playerStep));
      await animate(playerSurface, [{ clipPath:'inset(0 50%)' }, { clipPath:'inset(0 0%)' }], 850);
    }
    navigating = false;
  }));
  ['timeupdate','loadedmetadata','volumechange','play','pause','ended'].forEach(name => player.addEventListener(name, playerUI));
  player.addEventListener('play', wake); player.addEventListener('pause', wake);
  player.addEventListener('error', () => { if (player.hasAttribute('src')) error.hidden = false; });
  modal.addEventListener('pointermove', wake); modal.addEventListener('focusin', wake);
  function translate() {
    [section,modal].forEach(root => root.querySelectorAll('[data-media-vi]').forEach(el => { el.textContent = english() ? el.dataset.mediaEn : el.dataset.mediaVi; }));
    $('.media-motion').textContent = paused ? text('Phát xem trước','Play previews') : text('Dừng xem trước','Pause previews');
    $('.media-motion').setAttribute('aria-pressed', String(paused));
    error.textContent = text('Không thể phát video. Vui lòng thử lại.','Unable to play this video. Please try again.');
    seek.setAttribute('aria-label',text('Tua video','Seek video')); playerUI();
  }
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncPlayback(); if(visible)schedule(); }, { threshold:.05 }).observe(stage);
  new MutationObserver(translate).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  document.addEventListener('visibilitychange', () => { syncPlayback(); if (document.hidden && modal.open) player.pause(); });
  reduced.addEventListener('change', () => { syncPlayback(); schedule(); });
  window.addEventListener('scroll', schedule, { passive:true }); window.addEventListener('resize', schedule);

  layers.forEach((layer, i) => {
    layer.style.visibility = i === active ? 'visible' : 'hidden';
    layer.style.clipPath = i === active ? openClip : closedClip;
    layer.style.zIndex = i === active ? '2' : '1';
  });
  translate(); syncGallery(); schedule();
})();
