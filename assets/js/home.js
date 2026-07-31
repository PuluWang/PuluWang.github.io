const grid = document.querySelector("#gamesGrid");
const button = document.querySelector("#showGames");
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
let gameList = [];

function localizedGameTitle(title) {
  const match = title.match(/^([^\u3400-\u9fff]*?)([\u3400-\u9fff].*)$/);
  if (!match) return title;
  return currentLanguage === "zh" ? match[2].trim() : match[1].trim();
}

function updateShowButton() {
  if (!gameList.length) return;
  const expanded = grid.classList.contains("expanded");
  if (currentLanguage === "zh") {
    button.textContent = expanded ? "收起游戏列表" : `查看全部 ${gameList.length} 款游戏`;
  } else {
    button.textContent = expanded ? "Show fewer games" : `Show all ${gameList.length} games`;
  }
}

function applyLanguage(language, remember = false) {
  currentLanguage = language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = language === "zh"
    ? "Pulu Network — 独立游戏工作室"
    : "Pulu Network — Independent Game Studio";

  document.querySelectorAll("[data-en][data-zh]").forEach(element => {
    const value = element.dataset[language];
    if (element.hasAttribute("data-html")) element.innerHTML = value;
    else element.textContent = value;
  });

  languageSwitch.textContent = language === "zh" ? "EN" : "中文";
  languageSwitch.setAttribute(
    "aria-label",
    language === "zh" ? "Switch to English" : "切换为中文"
  );
  if (remember) {
    try {
      localStorage.setItem("pulu-language-choice", language);
    } catch {
      // Continue using the selected language for this page.
    }
  }

  if (gameList.length) renderGames(gameList);
}

function parseGames(markdown) {
  const source = markdown.split("## Download Link")[1] || "";
  const lines = source.split(/\r?\n/);
  const games = [];
  let pendingImage = "";
  let current = null;

  for (const line of lines) {
    const image = line.match(/^!\[img\]\(([^)]+)\)/);
    const title = line.match(/^###\s+(.+?)\s*$/);
    if (image) pendingImage = image[1];
    if (title) {
      if (current) games.push(current);
      current = { title: title[1].trim(), image: pendingImage, stores: [] };
      pendingImage = "";
      continue;
    }
    if (!current) continue;
    for (const match of line.matchAll(/\[\[([^\]]+)\]\]\(([^)]+)\)/g)) {
      current.stores.push({ label: match[1], url: match[2] });
    }
  }
  if (current) games.push(current);
  return games;
}

function renderGames(games) {
  grid.innerHTML = games.map((game, index) => {
    const title = localizedGameTitle(game.title);
    const art = game.image
      ? `<img src="${game.image}" alt="" loading="lazy">`
      : `<span>${title.slice(0, 1)}</span>`;
    const stores = game.stores.map(store =>
      `<a href="${store.url}" aria-label="${title} on ${store.label}">${store.label}</a>`
    ).join("");
    return `<article class="game-card${index >= 12 ? " extra" : ""}">
      <div class="game-art">${art}</div>
      <h3>${title}</h3>
      <div class="stores">${stores}</div>
    </article>`;
  }).join("");

  if (games.length > 12) {
    button.hidden = false;
    updateShowButton();
  }
}

if (Array.isArray(window.PULU_GAMES) && window.PULU_GAMES.length) {
  gameList = window.PULU_GAMES;
  renderGames(gameList);
} else {
  fetch("README.md")
    .then(response => {
      if (!response.ok) throw new Error("Unable to load game list");
      return response.text();
    })
    .then(markdown => {
      gameList = parseGames(markdown);
      renderGames(gameList);
    })
    .catch(() => {
      grid.innerHTML = currentLanguage === "zh"
        ? '<p>请查看我们的<a href="README.md#download-link">完整游戏列表</a>。</p>'
        : '<p>Visit our <a href="README.md#download-link">complete game list</a>.</p>';
    });
}

button.addEventListener("click", () => {
  grid.classList.toggle("expanded");
  updateShowButton();
});

languageSwitch.addEventListener("click", () => {
  applyLanguage(currentLanguage === "en" ? "zh" : "en", true);
});

applyLanguage(currentLanguage);
