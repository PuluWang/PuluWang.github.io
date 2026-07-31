const languageSwitch = document.querySelector("#languageSwitch");
const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
let currentLanguage = requestedLanguage === "zh" || requestedLanguage === "en"
  ? requestedLanguage
  : (localStorage.getItem("pulu-language") === "zh" ? "zh" : "en");

function applyLanguage(language) {
  currentLanguage = language;
  const isChinese = language === "zh";
  document.documentElement.lang = isChinese ? "zh-CN" : "en";
  document.title = isChinese ? "隐私政策 — Pulu Network" : "Privacy Policy — Pulu Network";

  document.querySelectorAll("[data-en][data-zh]").forEach(element => {
    element.textContent = element.dataset[language];
  });
  document.querySelectorAll("[data-language]").forEach(element => {
    element.hidden = element.dataset.language !== language;
  });

  languageSwitch.textContent = isChinese ? "EN" : "中文";
  languageSwitch.setAttribute("aria-label", isChinese ? "Switch to English" : "切换为中文");
  localStorage.setItem("pulu-language", language);
}

languageSwitch.addEventListener("click", () => {
  applyLanguage(currentLanguage === "en" ? "zh" : "en");
});
applyLanguage(currentLanguage);
