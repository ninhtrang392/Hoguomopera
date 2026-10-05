(() => {
  const footer = document.querySelector('.opera-footer');
  if (!footer) return;
  const backTop = footer.querySelector('.footer-back-top');
  backTop.addEventListener('click', () => {
    document.querySelector('[data-site-header] .site-logo')?.focus({preventScroll:true});
    window.scrollTo({top:0, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  const form = footer.querySelector('.footer-subscribe');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = footer.querySelector('.footer-subscribe-status');
    status.hidden = false;
    status.textContent = document.documentElement.lang === 'en'
      ? 'Newsletter signup is not available yet. Please contact info@hoguomopera.vn.'
      : 'Đăng ký nhận tin hiện chưa mở. Vui lòng liên hệ info@hoguomopera.vn để được hỗ trợ.';
  });
  const dialog = footer.querySelector('.footer-info-dialog');
  footer.querySelectorAll('[data-footer-social], [data-footer-policy]').forEach(button => {
    button.addEventListener('click', () => {
      dialog.querySelector('h2').textContent = button.dataset.footerSocial || button.dataset.footerPolicy;
      dialog.querySelector('p').textContent = button.dataset.footerSocial
        ? 'Kênh chính thức đang được cập nhật. Vui lòng liên hệ info@hoguomopera.vn để biết thêm thông tin.'
        : 'Nội dung đang được cập nhật. Vui lòng liên hệ info@hoguomopera.vn nếu bạn cần hỗ trợ.';
      dialog.showModal();
    });
  });
  const language = footer.querySelector('.footer-language');
  const syncLanguage = () => {
    const topLabel = document.documentElement.lang === 'en' ? 'Back to top' : 'Về đầu trang';
    backTop.setAttribute('aria-label', topLabel);
    backTop.title = topLabel;
    footer.querySelector('.footer-language-label').textContent = document.documentElement.lang === 'en' ? 'English' : 'Tiếng Việt';
    language.open = false;
  };
  new MutationObserver(syncLanguage).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  syncLanguage();
})();
