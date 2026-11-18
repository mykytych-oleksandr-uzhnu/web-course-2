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
    if (box === null) return;
    box.textContent = Array.isArray(value) ? value.join("\n") : value;
};

let toastTimer = null;

// Приймає текст, показує його у блоці #toast на 2,5 секунди.
const showToast = (text) => {
    const toast = document.getElementById("toast");
    if (toast === null) return;
    toast.textContent = text;
    toast.hidden = false;
    // clearTimeout скасовує попередній таймер: інакше після кількох швидких викликів
    // старий таймер сховав би новий тост раніше, ніж мине його власний час.
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.hidden = true;
    }, 2500);
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
if (document.getElementById("cards") !== null) {
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

    // ===== Модалка: одне делегування на весь каталог =====
    const cardsRoot = document.getElementById("cards");
    const detailsDlg = document.getElementById("details");

    // Один слухач на контейнері працює і для карток, створених пізніше: клік спливає від кнопки
    // вгору до .cards, а closest(".card") знаходить картку, навіть якщо її створив renderCards
    // після пошуку. Слухачі, повішені на кнопки, після перемальовування оглухли б.
    cardsRoot.addEventListener("click", (event) => {
        const card = event.target.closest(".card");
        if (!card) return;
        const item = games.find((g) => g.id === Number(card.dataset.id));
        if (!item) return;
        document.getElementById("d-title").textContent = item.title;
        document.getElementById("d-line1").textContent = `Платформа: ${item.platform}, ${item.year}`;
        document.getElementById("d-line2").textContent = `Жанр: ${item.genre}, ціна: $${item.price}`;
        document.getElementById("d-line3").textContent = `Код: ${item.details.code}, стан: ${item.details.condition}`;
        detailsDlg.showModal();
        showToast(`Відкрито: ${item.title}`);
    });

    document.getElementById("d-close").addEventListener("click", () => detailsDlg.close());
    renderCards(games);
}

// ===== Меню: працює на всіх сторінках =====
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");

function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
}

burger.addEventListener("click", () => {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
});

document.addEventListener("click", (event) => {
    if (!event.target.closest("#menu") && !event.target.closest("#burger")) setMenu(false);
});

// ===== Форма замовлення: перевірка і квитанція =====
const orderForm = document.getElementById("order");

if (orderForm !== null) {
    const fieldIds = ["fullname", "email", "phone", "platform", "quantity", "agreement"];
    // Свої тексти помилок українською: стандартні залежать від мови браузера.
    const messages = {
        fullname: "Вкажіть прізвище та ім'я",
        email: "Вкажіть коректну пошту, наприклад name@example.com",
        phone: "Формат: +380 і 9 цифр без пробілів і дефісів",
        platform: "Оберіть платформу",
        quantity: "Кількість від 1 до 5",
        agreement: "Потрібна згода на обробку даних"
    };
    // Перевіряє одне поле: пише текст помилки в його span і ставить/знімає клас invalid.
    function checkField(id) {
        const input = document.getElementById(id);
        const errorBox = document.getElementById("err-" + id);

        // Власна перевірка: ім'я має містити щонайменше два слова.
        // Порожній рядок "" скидає попередню помилку, інакше поле лишилося б невалідним назавжди.
        if (id === "fullname") {
            const value = input.value.trim();
            const tooShort = value !== "" && value.split(/\s+/).length < 2;
            input.setCustomValidity(tooShort ? "Вкажіть прізвище та ім'я через пробіл" : "");
        }

        const ok = input.checkValidity();
                errorBox.textContent = ok ? "" : (input.validity.customError ? input.validationMessage : messages[id]);
        input.classList.toggle("invalid", !ok);
        return ok;
    }

    // Збирає значення з форми й малює квитанцію. Усі дані користувача йдуть тільки через textContent.
    // Це захищає сторінку від виконання чужого HTML, але не є захистом даних:
    // клієнтську перевірку легко обійти, тому справжню перевірку має робити сервер.
    function showReceipt() {
        const platform = document.getElementById("platform");
        const quantity = Number(document.getElementById("quantity").value);
        const condition = orderForm.querySelector('input[name="condition"]:checked');
        const extras = orderForm.querySelectorAll('input[name="extras"]:checked');

        const rows = [
            "Ім'я: " + document.getElementById("fullname").value.trim(),
            "Пошта: " + document.getElementById("email").value.trim(),
            "Телефон: " + document.getElementById("phone").value.trim(),
            "Платформа: " + platform.options[platform.selectedIndex].text,
            "Кількість: " + quantity,
            "Стан: " + (condition === null ? "не обрано" : condition.labels[0].textContent),
                        "Додатково: " + (extras.length > 0
                ? Array.from(extras, (e) => e.labels[0].textContent).join(", ")
                : "нічого"),
            "Згода на обробку даних: " + (document.getElementById("agreement").checked ? "так" : "ні")
        ];

        const list = document.getElementById("receipt-list");
        list.replaceChildren();
        for (const text of rows) {
            const li = document.createElement("li");
            li.textContent = text;
            list.append(li);
        }
        document.getElementById("receipt").hidden = false;
        showToast("Замовлення прийнято");
    }

    orderForm.addEventListener("submit", (event) => {
        event.preventDefault();
        let allOk = true;
        for (const id of fieldIds) {
            if (!checkField(id)) allOk = false;
        }
        if (allOk) showReceipt();
    });

    // Поле, яке вже підсвічене як помилкове, перевіряється на льоту, поки користувач виправляє.
    orderForm.addEventListener("input", (event) => {
        if (event.target.classList.contains("invalid")) checkField(event.target.id);
    });

    orderForm.addEventListener("reset", () => {
        for (const id of fieldIds) {
            document.getElementById("err-" + id).textContent = "";
            document.getElementById(id).classList.remove("invalid");
        }
        document.getElementById("receipt").hidden = true;
    });
}