const languageSwitch = document.querySelector("#languageSwitch");
const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
const savedLanguage = (() => {
  try {
    return localStorage.getItem("pulu-language-choice");
  } catch {
    return null;
  }
})();
const systemLanguage = (() => {
  try {
    const language = navigator.languages?.[0] || navigator.language || "";
    return /^zh(?:[-_]|$)/i.test(language) ? "zh" : "en";
  } catch {
    return "en";
  }
})();
let currentLanguage = requestedLanguage === "zh" || requestedLanguage === "en"
  ? requestedLanguage
  : (savedLanguage === "zh" || savedLanguage === "en" ? savedLanguage : systemLanguage);

function applyLanguage(language, remember = false) {
  currentLanguage = language;
  const isChinese = language === "zh";
  document.documentElement.lang = isChinese ? "zh-CN" : "en";
  document.title = isChinese
    ? "Google Ads API 使用说明 — Pulu Network"
    : "Google Ads API Use — Pulu Network";

  document.querySelectorAll("[data-en][data-zh]").forEach(element => {
    element.textContent = element.dataset[language];
  });
  document.querySelectorAll("[data-language]").forEach(element => {
    element.hidden = element.dataset.language !== language;
  });

  languageSwitch.textContent = isChinese ? "EN" : "中文";
  languageSwitch.setAttribute("aria-label", isChinese ? "Switch to English" : "切换为中文");
  if (remember) {
    try {
      localStorage.setItem("pulu-language-choice", language);
    } catch {
      // Continue using the selected language for this page.
    }
  }
}

languageSwitch.addEventListener("click", () => {
  applyLanguage(currentLanguage === "en" ? "zh" : "en", true);
});
applyLanguage(currentLanguage);
