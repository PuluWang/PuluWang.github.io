const grid = document.querySelector("#gamesGrid");
const button = document.querySelector("#showGames");

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
    const art = game.image
      ? `<img src="${game.image}" alt="" loading="lazy">`
      : `<span>${game.title.slice(0, 1)}</span>`;
    const stores = game.stores.map(store =>
      `<a href="${store.url}" aria-label="${game.title} on ${store.label}">${store.label}</a>`
    ).join("");
    return `<article class="game-card${index >= 12 ? " extra" : ""}">
      <div class="game-art">${art}</div>
      <h3>${game.title}</h3>
      <div class="stores">${stores}</div>
    </article>`;
  }).join("");

  if (games.length > 12) {
    button.hidden = false;
    button.textContent = `Show all ${games.length} games`;
  }
}

fetch("README.md")
  .then(response => {
    if (!response.ok) throw new Error("Unable to load game list");
    return response.text();
  })
  .then(markdown => renderGames(parseGames(markdown)))
  .catch(() => {
    grid.innerHTML = '<p>Visit our <a href="README.md#download-link">complete game list</a>.</p>';
  });

button.addEventListener("click", () => {
  const expanded = grid.classList.toggle("expanded");
  button.textContent = expanded ? "Show fewer games" : `Show all ${grid.children.length} games`;
});
