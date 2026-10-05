/* HEADER - TRANSLATIONS AND MENU PANELS */
Object.assign(translations.vi, {
  headerLibrary: 'Thư viện số',
  headerPrograms: 'Chương trình biểu diễn',
  headerNews: 'Tin tức nghệ thuật',
  headerMedia: 'Media',
  headerOffers: 'Ưu đãi',
  headerSearch: 'Tìm kiếm',
  headerLogin: 'Đăng nhập',
  headerTickets: 'Đặt vé'
});

Object.assign(translations.en, {
  headerLibrary: 'Digital library',
  headerPrograms: 'Performances',
  headerNews: 'Arts news',
  headerMedia: 'Media',
  headerOffers: 'Offers',
  headerSearch: 'Search',
  headerLogin: 'Sign in',
  headerTickets: 'Book tickets'
});

const headerDialog = document.querySelector('#header-dialog');
const headerTitle = document.querySelector('#header-dialog-title');
const headerBody = document.querySelector('#header-dialog-body');
const languageSelect = document.querySelector('.language-select');
let headerPanel = null;

const headerMessages = {
  vi: {
    news: 'Tin tức nghệ thuật đang được cập nhật. Bạn có thể khám phá các chương trình biểu diễn tại trang chủ.',
    offers: 'Hiện chưa có thông tin ưu đãi được công bố. Các ưu đãi sẽ được cập nhật khi chương trình mở bán.',
    login: 'Chức năng đăng nhập chưa được kết nối trong bản giới thiệu. Bạn vẫn có thể khám phá các chương trình mà không cần tài khoản.',
    tickets: 'Tra cứu vé đã đặt sẽ khả dụng khi hệ thống tài khoản và đặt vé được kết nối.',
    placeholder: 'Tìm tên chương trình hoặc thể loại…',
    empty: 'Không tìm thấy chương trình phù hợp.',
    illustration: 'Poster chương trình biểu diễn'
  },
  en: {
    news: 'Arts news is being updated. Explore our featured performances on the home page.',
    offers: 'No offers have been announced yet. Offers will be updated when ticket sales open.',
    login: 'Sign-in is not connected in this preview. You can still explore performances without an account.',
    tickets: 'Your booked tickets will be available here once account and booking services are connected.',
    placeholder: 'Search by programme or genre…',
    empty: 'No matching performances found.',
    illustration: 'Performance posters'
  }
};

const searchableProgrammes = Object.entries(performancePrograms).map(([key, program]) => ({key, ...program, words: program.artists+' '+program.category}));

function normalizeSearch(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().trim();
}

function renderSearchResults(query, container) {
  container.replaceChildren();
  const matches = searchableProgrammes.filter(item =>
    normalizeSearch(item.title + ' ' + item.words).includes(normalizeSearch(query))
  );

  if (!matches.length) {
    container.textContent = headerMessages[language].empty;
    return;
  }

  for (const item of matches) {
    const button = document.createElement('button');
    button.className = 'header-result';
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = '';
    const name = document.createElement('span');
    name.textContent = item.title;
    button.append(image, name);
    button.addEventListener('click', () => {
      headerDialog.close();
      openDialog('program', item.key);
    });
    container.append(button);
  }
}

function renderHeaderPanel() {
  const keys = { news: 'headerNews', media: 'headerMedia', offers: 'headerOffers', search: 'headerSearch', login: 'headerLogin', tickets: 'headerTickets' };
  headerTitle.textContent = t(keys[headerPanel]);
  headerBody.replaceChildren();

  if (headerPanel === 'search') {
    const input = document.createElement('input');
    input.type = 'search';
    input.className = 'header-search-input';
    input.placeholder = headerMessages[language].placeholder;
    input.setAttribute('aria-label', t('headerSearch'));
    const results = document.createElement('div');
    results.className = 'header-results';
    results.setAttribute('aria-live', 'polite');
    input.addEventListener('input', () => renderSearchResults(input.value, results));
    headerBody.append(input, results);
    renderSearchResults('', results);
  } else if (headerPanel === 'media') {
    const note = document.createElement('p');
    note.textContent = headerMessages[language].illustration;
    const gallery = document.createElement('div');
    gallery.className = 'header-gallery';
    for (const item of searchableProgrammes) {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.src = item.image;
      image.alt = item.title;
      const caption = document.createElement('figcaption');
      caption.textContent = image.alt;
      figure.append(image, caption);
      gallery.append(figure);
    }
    headerBody.append(note, gallery);
  } else {
    const message = document.createElement('p');
    message.textContent = headerMessages[language][headerPanel];
    headerBody.append(message);
  }
}

document.querySelectorAll('[data-header-panel]').forEach(button => {
  button.addEventListener('click', () => {
    closeMenu();
    headerPanel = button.dataset.headerPanel;
    renderHeaderPanel();
    headerDialog.showModal();
    document.body.classList.add('modal-open');
    if (headerPanel === 'search') headerBody.querySelector('input').focus();
  });
});

headerDialog.querySelector('.header-dialog-close').addEventListener('click', () => headerDialog.close());
headerDialog.addEventListener('close', () => {
  if (!dialog.open) document.body.classList.remove('modal-open');
  headerPanel = null;
});
headerDialog.addEventListener('click', event => {
  if (event.target !== headerDialog) return;
  const rect = headerDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) headerDialog.close();
});

function syncHeaderLanguage() {
  languageSelect.value = language;
  document.querySelectorAll('[data-header-label]').forEach(element => {
    element.setAttribute('aria-label', t(element.dataset.headerLabel));
  });
  headerDialog.querySelector('.header-dialog-close').setAttribute('aria-label', t('close'));
  if (headerDialog.open) renderHeaderPanel();
}

languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
new MutationObserver(syncHeaderLanguage).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang']
});
syncHeaderLanguage();
