# Shared website header

All existing and new pages in `dist/` must use the shared header:

- Add `<header data-site-header data-page="home"></header>` (use `library` for the digital library, or the page's navigation key for future pages).
- Load `site-header.css` after page styles and `site-header.js` as a deferred script before page scripts.
- Maintain navigation, logo, tools, responsive behavior and header styling only in `dist/site-header.js` and `dist/site-header.css`. Do not create another page-specific header.
- The logo links to `index.html`. Do not add a “Trang chủ” navigation item or text beside the logo.
- `header.js` supplies the home page's search dialog and language integration; `site-header.js` owns shared markup and mobile navigation.
- Keep the header background transparent and omit the “Giới thiệu” navigation item.
