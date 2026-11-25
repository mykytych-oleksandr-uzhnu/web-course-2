// ===== Дані =====
// Масив заповнюється у loadData() після завантаження data.json. До LR10 він був зашитий у код.
let games = [];

// ===== Допоміжні функції =====

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

// Приймає тег, текст і клас, повертає створений елемент (текст іде тільки через textContent).
function createEl(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
}

// Приймає масив чисел, повертає середнє значення (0 для порожнього масиву).
const average = (numbers) =>
    numbers.length === 0 ? 0 : numbers.reduce((sum, n) => sum + n, 0) / numbers.length;

// Читає список id обраного зі сховища. Повертає [], якщо ключа немає або вміст зіпсований.
function loadFavorites() {
    let raw = null;
    try {
        raw = localStorage.getItem("favorites");
    } catch (error) {
        return [];
    }
    if (!raw) return [];
    try {
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
    } catch (error) {
        return [];
    }
}

// Приймає масив id і записує його у сховище як JSON-рядок.
function saveFavorites(list) {
    try {
        localStorage.setItem("favorites", JSON.stringify(list));
    } catch (error) {
        // сховище недоступне: обране працює до перезавантаження
    }
}

let favorites = loadFavorites();

// ===== Завантаження даних =====

// Завантажує data.json і повертає масив ігор із доданим id.
// response.ok потрібна, бо fetch не кидає помилку на 404: запит "вдався", просто відповідь погана.
// Без перевірки .json() спробував би розібрати сторінку помилки, і користувач побачив би незрозумілу помилку.
async function loadData() {
    const response = await fetch("data.json");
    if (!response.ok) {
        throw new Error("HTTP " + response.status);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Файл даних порожній або має неправильну структуру");
    }
    // У файлі немає id, а файл змінювати не можна, тому id додаємо тут (1, 2, 3, ...).
    return data.map((game, index) => ({ ...game, id: index + 1 }));
}

// Приймає помилку і показує людині зрозуміле повідомлення на сторінці.
function showLoadError(error) {
    const box = document.getElementById("load-error");
    box.hidden = false;
    box.textContent = "Не вдалося завантажити каталог. Перевірте з'єднання і "
        + "оновіть сторінку. Технічні подробиці: " + error.message;
}

// ===== Каталог: виконується тільки на сторінці з #cards =====
if (document.getElementById("cards") !== null) {
    const searchInput = document.getElementById("q");
    const platformSelect = document.getElementById("filter");
    const sortSelect = document.getElementById("sort");
    const onlyFav = document.getElementById("only-fav");
    const emptyMsg = document.getElementById("empty");
    const countBox = document.getElementById("count");
    const cardsRoot = document.getElementById("cards");
    const detailsDlg = document.getElementById("details");
    const loader = document.querySelector(".loader");

    // Малює картки з масиву list. Усі дані йдуть тільки через textContent.
    function renderCards(list) {
        cardsRoot.replaceChildren();

        for (const item of list) {
            const card = document.createElement("article");
            card.className = "card";
            card.dataset.id = item.id;

            const rating = average(item.critics);
            const badge = createEl("span", "★ " + rating.toFixed(1), "card__badge");

            const img = document.createElement("img");
            img.className = "card__img";
            img.src = "https://picsum.photos/seed/" + item.id + "/600/400";
            img.alt = "Ілюстрація до гри " + item.title;
            img.width = 600;
            img.height = 400;

            const body = createEl("div", undefined, "card__body");
            const title = createEl("h3", item.title, "card__title");
            const meta = createEl("p",
                item.developer + " · " + item.year + " · " + item.platforms.join(", "), "card__meta");
            const code = createEl("p",
                "Місце на диску: " + item.requirements.storage_gb.toLocaleString("uk-UA") + " ГБ", "card__id");
            body.append(title, meta, code);

            const actions = createEl("div", undefined, "card__actions");

            const isFav = favorites.includes(item.id);
            const fav = createEl("button", isFav ? "❤️" : "🤍", "fav");
            fav.type = "button";
            fav.dataset.id = item.id;
            fav.setAttribute("aria-pressed", String(isFav));
            fav.setAttribute("aria-label", isFav ? "Прибрати з обраного" : "Додати до обраного");

            const button = createEl("button", "Детальніше", "card__action");
            button.type = "button";

            actions.append(button, fav);
            card.append(badge, img, body, actions);
            cardsRoot.append(card);
        }
    }

    // Збирає унікальні платформи з даних і додає їх як <option> у фільтр.
    function fillPlatformOptions() {
        const platforms = new Set();
        for (const game of games) {
            for (const name of game.platforms) platforms.add(name);
        }
        for (const name of [...platforms].sort()) {
            const option = createEl("option", name);
            option.value = name;
            platformSelect.append(option);
        }
    }

    // Читає всі елементи керування разом, фільтрує, сортує і перемальовує список.
    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        const platform = platformSelect.value;
        const order = sortSelect.value;

        const result = games.filter((g) => {
            const textOk = g.title.toLowerCase().includes(query)
                || g.developer.toLowerCase().includes(query);
            const platformOk = platform === "all" || g.platforms.includes(platform);
            const favOk = !onlyFav.checked || favorites.includes(g.id);
            return textOk && platformOk && favOk;
        });

        if (order === "year") result.sort((a, b) => a.year - b.year);
        if (order === "rating") result.sort((a, b) => average(b.critics) - average(a.critics));
        if (order === "title") result.sort((a, b) => a.title.localeCompare(b.title, "uk"));

        renderCards(result);
        emptyMsg.hidden = result.length > 0;
        countBox.textContent = "Показано " + result.length + " із " + games.length;
    }

    // Додає в контейнер заголовок і список рядків (або текст, якщо масив порожній).
    function addListSection(container, heading, values) {
        container.append(createEl("h4", heading));
        if (values.length === 0) {
            container.append(createEl("p", "Даних поки немає"));
            return;
        }
        const ul = document.createElement("ul");
        for (const value of values) ul.append(createEl("li", value));
        container.append(ul);
    }

    // Заповнює вікно деталей даними однієї гри. Кожен контейнер спершу очищається.
    function fillDetails(item) {
        document.getElementById("d-title").textContent = item.title;

        const main = document.getElementById("d-main");
        main.replaceChildren();
        const pairs = [
            ["Розробник", item.developer],
            ["Видавець", item.publisher],
            ["Рік", String(item.year)],
            ["Середня оцінка", average(item.critics).toFixed(1)]
        ];
        const dl = document.createElement("dl");
        for (const [label, value] of pairs) {
            dl.append(createEl("dt", label), createEl("dd", value));
        }
        main.append(dl);

        const objectBox = document.getElementById("d-object");
        objectBox.replaceChildren();
        objectBox.append(createEl("h4", "Системні вимоги"));
        const reqList = document.createElement("dl");
        for (const [key, value] of Object.entries(item.requirements)) {
            reqList.append(createEl("dt", key), createEl("dd", String(value)));
        }
        objectBox.append(reqList);

        const listBox = document.getElementById("d-list");
        listBox.replaceChildren();
        addListSection(listBox, "Платформи", item.platforms);
        addListSection(listBox, "Жанри", item.genres);
        addListSection(listBox, "Режими гри", item.modes);

        const tableBox = document.getElementById("d-table");
        tableBox.replaceChildren();
        tableBox.append(createEl("h4", "Оцінки критиків"));
        if (item.critics.length === 0) {
            tableBox.append(createEl("p", "Оцінок поки немає"));
        } else {
            const wrap = createEl("div", undefined, "table-wrap");
            const table = document.createElement("table");
            const headRow = document.createElement("tr");
            headRow.append(createEl("th", "№"), createEl("th", "Оцінка"));
            const thead = document.createElement("thead");
            thead.append(headRow);
            const tbody = document.createElement("tbody");
            item.critics.forEach((score, index) => {
                const row = document.createElement("tr");
                row.append(createEl("td", String(index + 1)), createEl("td", score.toFixed(1)));
                tbody.append(row);
            });
            table.append(thead, tbody);
            wrap.append(table);
            tableBox.append(wrap);
        }
    }

    searchInput.addEventListener("input", applyFilters);
    platformSelect.addEventListener("change", applyFilters);
    sortSelect.addEventListener("change", applyFilters);
    onlyFav.addEventListener("change", applyFilters);

    // Один слухач на контейнері працює і для карток, створених пізніше: клік спливає від кнопки
    // вгору до .cards, а closest знаходить картку, навіть якщо її створив renderCards після пошуку.
    cardsRoot.addEventListener("click", (event) => {
        const favBtn = event.target.closest(".fav");
        if (favBtn) {
            const id = Number(favBtn.dataset.id);
            if (favorites.includes(id)) {
                favorites = favorites.filter((f) => f !== id);
                showToast("Прибрано з обраного");
            } else {
                favorites.push(id);
                showToast("Додано до обраного");
            }
            saveFavorites(favorites);
            applyFilters();
            return;
        }
        const card = event.target.closest(".card");
        if (!card) return;
        const item = games.find((g) => g.id === Number(card.dataset.id));
        if (!item) return;
        fillDetails(item);
        detailsDlg.showModal();
    });

    document.getElementById("d-close").addEventListener("click", () => detailsDlg.close());

    // Запускає завантаження: спінер показується до запиту і ховається у finally (і після успіху, і після помилки).
    // Ховати його в кінці try не можна: після помилки він лишився б крутитися вічно.
    async function init() {
        loader.hidden = false;
        try {
            games = await loadData();
            fillPlatformOptions();
            applyFilters();
        } catch (error) {
            showLoadError(error);
        } finally {
            loader.hidden = true;
        }
    }

    init();
}

// ===== Тема =====
const themeBtn = document.getElementById("theme");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

// Чи темна сторінка зараз: явний клас має пріоритет над системною схемою.
function isDarkNow() {
    const root = document.documentElement;
    if (root.classList.contains("dark-theme")) return true;
    if (root.classList.contains("light-theme")) return false;
    return systemDark.matches;
}

// Ставить клас теми на <html> ("" прибирає обидва) і оновлює підпис кнопки.
function applyTheme(name) {
    const root = document.documentElement;
    root.classList.toggle("dark-theme", name === "dark");
    root.classList.toggle("light-theme", name === "light");
    themeBtn.textContent = isDarkNow() ? "Світла тема" : "Темна тема";
}

if (themeBtn !== null) {
    // Збережений вибір перевіряємо раніше за системну схему: це вибір самого користувача.
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem("theme");
    } catch (error) {
        savedTheme = null;
    }
    applyTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : "");

    // Перемикає тему на протилежну і запам'ятовує вибір.
    themeBtn.addEventListener("click", () => {
        const next = isDarkNow() ? "light" : "dark";
        applyTheme(next);
        try {
            localStorage.setItem("theme", next);
        } catch (error) {
            // Сховище недоступне: тема діє лише до перезавантаження.
        }
        showToast(next === "dark" ? "Темна тема" : "Світла тема");
    });
}