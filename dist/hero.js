/* Architectural hero translations. */
Object.assign(translations.vi, {
  heroExplore: 'KHÁM PHÁ NHÀ HÁT',
  heroSchedule: 'LỊCH BIỂU DIỄN',
  heroEvening: 'Một đêm cùng nghệ thuật'
});
Object.assign(translations.en, {
  heroExplore: 'EXPLORE THE THEATRE',
  heroSchedule: 'WHAT’S ON',
  heroEvening: 'An evening with the arts'
});
function syncHeroLanguage() {
  document.querySelector('.hero-theatre').alt = language === 'vi'
    ? 'Kiến trúc nhà hát Hồ Gươm rực sáng dưới bầu trời đêm'
    : 'Ho Guom Opera House illuminated beneath the night sky';
}
new MutationObserver(syncHeroLanguage).observe(document.documentElement, {
  attributes: true, attributeFilter: ['lang']
});