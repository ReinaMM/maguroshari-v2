(function () {
  const state = { lang: 'ja' };
  const supported = ['ja', 'en', 'ko'];
  const saved = localStorage.getItem('mts-lang');
  if (supported.includes(saved)) state.lang = saved;

  function textFor(obj, keyBase) {
    if (!obj) return '';
    const suffix = state.lang === 'ja' ? 'Ja' : state.lang === 'ko' ? 'Ko' : 'En';
    return obj[`${keyBase}${suffix}`] || obj[`${keyBase}En`] || '';
  }

  function itemName(item) { return textFor(item, 'name'); }
  function itemDesc(item) { return textFor(item, 'description'); }
  function itemTag(item) { return textFor(item, 'tag'); }

  function setLang(lang) {
    state.lang = lang;
    localStorage.setItem('mts-lang', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en]').forEach((el) => {
      const value = lang === 'ja' ? el.dataset.ja : lang === 'ko' ? (el.dataset.ko || el.dataset.en) : el.dataset.en;
      if (typeof value === 'string') el.textContent = value;
    });
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.langBtn === lang);
    });
    document.dispatchEvent(new CustomEvent('mts:language-change', { detail: { lang } }));
  }

  window.MTS = { state, setLang, textFor, itemName, itemDesc, itemTag };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.langBtn));
    });
    document.querySelectorAll('[data-current-year]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
    setLang(state.lang);
  });
})();
