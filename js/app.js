// ===== Дані =====
// const фіксує лише посилання на масив, а не його вміст, тому games.push(...) працює;
// заборонено тільки перепризначення games = ...
// Ціна вказана в доларах.
// Дані каталогу: 8 ігор з моєї таблиці. У LR10 цей масив переїде в зовнішній JSON-файл і завантажуватиметься через fetch.
const games = [
    {
        id: 1,
        title: "Persona 5 Royal",
        year: 2020,
        price: 45,
        platform: "PlayStation 4",
        genre: "JRPG",
        available: true,
        details: { code: "GM-2020-0001", condition: "як новий" },
        tags: ["jrpg", "стиль"]
    },
    {
        id: 2,
        title: "Dishonored",
        year: 2012,
        price: 12,
        platform: "PlayStation 4",
        genre: "Immersive sim",
        available: true,
        details: { code: "GM-2012-0002", condition: "як новий" },
        tags: ["стелс", "сюжет", "магія"]
    },
    {
        id: 3,
        title: "Deus Ex: Human Revolution",
        year: 2011,
        price: 15,
        platform: "Xbox 360",
        genre: "Immersive sim",
        available: false,
        details: { code: "GM-2011-0003", condition: "дуже добрий" },
        tags: ["кіберпанк", "стелс", "рпг", "сюжет"]
    },
    {
        id: 4,
        title: "The Legend of Zelda: Ocarina of Time",
        year: 1998,
        price: 60,
        platform: "Nintendo 64",
        genre: "Action-adventure",
        available: true,
        details: { code: "GM-1998-0004", condition: "повний комплект" },
        tags: ["класика", "пригоди"]
    },
    {
        id: 5,
        title: "Hollow Knight",
        year: 2017,
        price: 15,
        platform: "Nintendo Switch",
        genre: "Metroidvania",
        available: true,
        details: { code: "GM-2017-0005", condition: "як новий" },
        tags: ["інді", "платформер", "складна"]
    },
    {
        id: 6,
        title: "Half-Life 2",
        year: 2004,
        price: 10,
        platform: "PC",
        genre: "Шутер",
        available: true,
        details: { code: "GM-2004-0006", condition: "коробкове видання" },
        tags: ["шутер", "класика", "фізика", "сюжет"]
    },
        {
        id: 7,
        title: "Final Fantasy VII",
        year: 1997,
        price: 25,
        platform: "PlayStation",
        genre: "JRPG",
        available: true,
        details: { code: "GM-1997-0007", condition: "три диски, повний комплект" },
        tags: ["jrpg", "класика", "сюжет"]
    },
    {
        id: 8,
        title: "Halo 3",
        year: 2007,
        price: 8,
        platform: "Xbox 360",
        genre: "Шутер",
        available: true,
        details: { code: "GM-2007-0008", condition: "дуже добрий" },
        tags: ["шутер", "кооператив"]
    }
];

// ===== Допоміжні функції =====

// Малює картки каталогу з масиву list. Усі дані йдуть тільки через textContent.
function renderCards(list) {
const container = document.getElementById("cards");
container.replaceChildren();

for (const item of list) {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = item.id;

    const badge = document.createElement("span");
    badge.className = item.available ? "card__badge" : "card__badge card__badge--out";
    badge.textContent = item.available ? "В наявності" : "Немає";

    const img = document.createElement("img");
    img.className = "card__img";
    img.src = "https://picsum.photos/seed/" + item.id + "/600/400";
    img.alt = "Обкладинка " + item.title + " для " + item.platform;
    img.width = 600;
    img.height = 400;

    const body = document.createElement("div");
    body.className = "card__body";

    const title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = item.title;

    const meta = document.createElement("p");
    meta.className = "card__meta";
    meta.textContent = item.platform + " · " + item.genre + " · " + item.details.condition;

    const code = document.createElement("p");
    code.className = "card__id";
    code.textContent = "Код: " + item.details.code;

    body.append(title, meta, code);

    const actions = document.createElement("div");
    actions.className = "card__actions";

    const button = document.createElement("button");
    button.className = "card__action";
    button.type = "button";
    button.textContent = "Детальніше";

    actions.append(button);

    card.append(badge, img, body, actions);
    container.append(card);
}
}

// Приймає id елемента й значення (рядок або масив рядків), записує текст у елемент.
const show = (id, value) => {
    const box = document.getElementById(id);
    if (box === null) {
        console.error("Немає елемента з id:", id);
        return;
    }
    box.textContent = Array.isArray(value) ? value.join("\n") : value;
};

// Приймає гру, повертає рядок "Назва (рік)".
const line = (game) => `${game.title} (${game.year})`;

// Приймає масив ігор, повертає рядки зі списком або текст "нічого не знайдено".
const listOrEmpty = (items) =>
    items.length > 0 ? items.map((g) => `  • ${g.title}`).join("\n") : "  нічого не знайдено";

// ===== Функції обробки =====

// Приймає гру, повертає назву групи за платформою.
function categoryOf(game) {
    switch (game.platform) {
        case "PlayStation 4":
            return "Консолі Sony";
        case "Xbox 360":
            return "Консолі Microsoft";
        case "Nintendo 64":
        case "Nintendo Switch":
            return "Консолі Nintendo";
        default:
            return "Інші платформи";
    }
}

// Приймає масив ігор, повертає масив рядків "1. Назва — платформа, рік (код)".
const numberedList = (items) => {
    const lines = [];
    for (let i = 0; i < items.length; i++) {
        const g = items[i];
        lines.push(`${i + 1}. ${g.title} — ${g.platform}, ${g.year} (код ${g.details.code})`);
    }
    return lines;
};

// Приймає масив і платформу, повертає ігри цієї платформи.
const filterByCategory = (items, value) => items.filter((g) => g.platform === value);

// Приймає масив і мінімальний рік, повертає ігри не старші за цей рік.
const filterByYearFrom = (items, minYear) => items.filter((g) => g.year >= minYear);

// Приймає масив, повертає копію, відсортовану за роком (оригінал не змінюється).
const sortByYear = (items) => [...items].sort((a, b) => a.year - b.year);

// Приймає масив, повертає копію, відсортовану за назвою в українській абетці.
const sortByName = (items) => [...items].sort((a, b) => a.title.localeCompare(b.title, "uk"));

// Приймає масив ігор, повертає об'єкт зі статистикою за цінами.
const statsForGames = (items) => {
    // 0 — початкове значення суми: без нього першим sum став би об'єкт гри, і результат зіпсувався б.
    const total = items.reduce((sum, g) => sum + g.price, 0);
    const max = items.reduce((best, g) => (g.price > best.price ? g : best));
    return {
        count: items.length,
        total: total,
        average: (total / items.length).toFixed(1),
        max: max,
        categories: new Set(items.map((g) => g.platform)).size
    };
};

// ===== Виклики show =====

show("out-count", `Записів у каталозі: ${games.length}`);
show("out-numbered", numberedList(games));
show("out-categories", games.map((g) => `${g.title} → ${categoryOf(g)}`));

const sony = filterByCategory(games, "PlayStation 4");
const recent = filterByYearFrom(games, 2010);
const none = filterByCategory(games, "Sega Dreamcast");
show("out-filter", [
    `Платформа PlayStation 4: знайдено ${sony.length}`,
    listOrEmpty(sony),
    `Від 2010 року: знайдено ${recent.length}`,
    listOrEmpty(recent),
    `Платформа Sega Dreamcast: знайдено ${none.length}`,
    listOrEmpty(none)
]);

show("out-sorted", [
    "За роком (зростання):",
    ...sortByYear(games).map(line),
    "",
    "За назвою (А–Я):",
    ...sortByName(games).map(line),
    "",
    "Вихідний порядок:",
    ...games.map(line)
]);
const searchInput = document.getElementById("q");
const platformSelect = document.getElementById("filter");
const emptyMsg = document.getElementById("empty");

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const platform = platformSelect.value;

  const byPlatform = platform === "all" ? games : filterByCategory(games, platform);

  const result = byPlatform.filter(g =>
    g.title.toLowerCase().includes(query) ||
    g.genre.toLowerCase().includes(query)
  );

  renderCards(result);
  emptyMsg.hidden = result.length > 0;
}

// input спрацьовує на кожну введену літеру, а change лише коли поле втрачає фокус,
// тож для пошуку "на льоту" потрібен саме input.
searchInput.addEventListener("input", applyFilters);
platformSelect.addEventListener("change", applyFilters);
const stats = statsForGames(games);
show("out-stats", [
    `Кількість ігор: ${stats.count}`,
    `Сума цін: $${stats.total}`,
    `Середня ціна: $${stats.average}`,
    `Найдорожча: ${stats.max.title} ($${stats.max.price})`,
    `Різних платформ: ${stats.categories}`
]);
console.log(games.length)
renderCards(games);