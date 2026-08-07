import "dotenv/config";
import { db } from "./index";
import { categories, gameServer, posts, sessions, topics, users } from "./schema";
import { hashPassword } from "../lib/auth";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Cleaning tables...");
  await db.delete(sessions);
  await db.delete(posts);
  await db.delete(topics);
  await db.delete(categories);
  await db.delete(users);
  await db.delete(gameServer);
  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE categories_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE topics_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE posts_id_seq RESTART WITH 1`);

  console.log("Seeding users...");
  const mk = (username: string, password: string, role: string, color: string, bio: string, daysAgo: number) => ({
    username,
    passwordHash: hashPassword(password),
    role,
    color,
    bio,
    createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  });
  const [owner, danya, kira, marat, lucky, tyoma, nyx, stas] = await db
    .insert(users)
    .values([
      mk("owner", "blackowner", "owner", "#ff5c39", "Владелец проекта PHANTOM RP. По всем вопросам — в ЛС.", 420),
      mk("Даня_Black", "qwerty123", "member", "#38bdf8", "Играю с первого дня. Люблю ночные рейсы по набережной.", 310),
      mk("KIRA", "qwerty123", "member", "#e879f9", "Семья LCS. Не пишите по поводу должностей.", 260),
      mk("Марат_СЗ", "qwerty123", "member", "#4ade80", "Санитарный вертолёт — моя стихия.", 200),
      mk("Lucky", "qwerty123", "member", "#facc15", "Барыга со стажем. Лучшие цены на Чёрном.", 150),
      mk("Тёма777", "qwerty123", "member", "#fb923c", "Новичок, но стараюсь.", 60),
      mk("Nyx", "qwerty123", "member", "#a78bfa", "Стримерша. Заходите на эфиры с RP-отыгровками.", 30),
      mk("Стас_Крутов", "qwerty123", "member", "#f87171", "Коллекционирую редкие авто.", 10),
    ])
    .returning();

  console.log("Seeding categories...");
  const [news, rules, complaints, factions, tech, flood, market] = await db
    .insert(categories)
    .values([
      { name: "Новости проекта", description: "Обновления, анонсы ивентов и официальные заявления администрации", icon: "news", sortOrder: 1 },
      { name: "Правила и гайды", description: "Правила сервера, наказания и полезные руководства для новичков", icon: "rules", sortOrder: 2 },
      { name: "Жалобы на игроков", description: "Нарушили правила? Подавайте жалобу строго по форме", icon: "complaint", sortOrder: 3 },
      { name: "Заявки в организации", description: "Наборы в семьи, гос. структуры и бизнес-фракции Чёрного сервера", icon: "faction", sortOrder: 4 },
      { name: "Технический раздел", description: "Баги, проблемы с лаунчером и помощь по подключению", icon: "tech", sortOrder: 5 },
      { name: "Флудилка", description: "Общение на свободные темы вне игровой вселенной", icon: "flood", sortOrder: 6 },
      { name: "Торговая площадка", description: "Продажа и покупка имущества, транспорта и бизнеса", icon: "market", sortOrder: 7 },
    ])
    .returning();

  console.log("Seeding topics and posts...");
  const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  type TopicSeed = {
    cat: typeof categories.$inferSelect;
    author: typeof users.$inferSelect;
    title: string;
    pinned?: boolean;
    closed?: boolean;
    views: number;
    createdH: number;
    posts: { author: typeof users.$inferSelect; content: string; h: number }[];
  };

  const seed: TopicSeed[] = [
    {
      cat: news, author: owner, title: "Открытие Чёрного сервера — старт уже в эту пятницу", pinned: true, views: 4821, createdH: 240,
      posts: [
        { author: owner, h: 240, content: "Друзья, свершилось! В эту пятницу в 20:00 МСК мы открываем Чёрный сервер — первый сервер проекта PHANTOM RP.\n\nЧто вас ждёт на старте:\n— уникальный центральный район с небоскрёбами;\n— 12 стартовых работ с прокачкой;\n— экономика без донатного дисбаланса.\n\nIP появится в шапке форума за час до запуска. Следите за новостями!" },
        { author: danya, h: 230, content: "Наконец-то! Ждал с момента первого тизера. Будет ли вайп после ОБТ или прогресс сохранится?" },
        { author: owner, h: 228, content: "Прогресс ОБТ полностью сохраняется. Более того, все участники теста получат уникальный номерной знак на первое авто." },
        { author: kira, h: 200, content: "Топ! Семья уже собрала состав под Чёрный, ждём пятницу." },
        { author: tyoma, h: 90, content: "А лимит слотов какой? Боюсь не успеть зайти в первый день." },
      ],
    },
    {
      cat: news, author: owner, title: "Обновление 2.4: новый район, бизнесы и транспорт", views: 2140, createdH: 120,
      posts: [
        { author: owner, h: 120, content: "Вышло обновление 2.4!\n\n• Добавлен промышленный район «Заводской» с 8 новыми работами.\n• 3 новых вида бизнеса: автомойка, тир и ночной клуб.\n• 6 транспортных средств, включая редкий «Чёрный Ворон».\n• Переработана система штрафов ГИБДД.\n\nОбновление скачается автоматически при запуске лаунчера." },
        { author: lucky, h: 100, content: "Ночной клуб — это моё. Уже прицениваюсь к точке у набережной." },
        { author: nyx, h: 80, content: "«Чёрный Ворон» выглядит шикарно, сегодня же попробую выбить с ивента." },
      ],
    },
    {
      cat: news, author: owner, title: "Итоги ивента «Чёрная пятница»", views: 1322, createdH: 48,
      posts: [
        { author: owner, h: 48, content: "Ивент завершён! Поздравляем победителей:\n\n1 место — Nyx (редкий спорткар)\n2 место — Даня_Black (500.000 вирт. монет)\n3 место — Стас_Крутов (набор тюнинга)\n\nСпасибо всем за участие, следующий ивент — уже через две недели." },
        { author: nyx, h: 40, content: "Не ожидала! Спасибо администрации, эмоции на стриме были неподдельные :)" },
      ],
    },
    {
      cat: rules, author: owner, title: "Правила сервера «Чёрный» — читать всем обязательно", pinned: true, closed: true, views: 9530, createdH: 500,
      posts: [
        { author: owner, h: 500, content: "Основные правила сервера «Чёрный»:\n\n1.1 Запрещён DM (убийство без причины).\n1.2 Запрещён MG (использование информации не из RP).\n1.3 Запрещены читы, моды и любые сторонние программы.\n1.4 Уважайте игроков и администрацию.\n1.5 Никакой рекламы сторонних проектов.\n\nПолный список правил — в закреплённом сообщении Discord. Незнание правил не освобождает от ответственности." },
        { author: owner, h: 499, content: "Таблица наказаний:\n\n— DM: предупреждение → мут 24ч → бан 3 дня.\n— Читы: перманентный бан без предупреждения.\n— Оскорбления: мут от 6 часов.\n\nАпелляции принимаются в разделе жалоб в течение 48 часов." },
      ],
    },
    {
      cat: rules, author: danya, title: "Гайд для новичков: первые шаги на Чёрном", views: 3407, createdH: 300,
      posts: [
        { author: danya, h: 300, content: "Решил собрать гайд для тех, кто только зашёл на сервер.\n\n1. Пройдите обучение у NPC на вокзале — даст 10.000 на старт.\n2. Устройтесь на работу курьера (зелёная метка «Почта»).\n3. Купите первый велосипед, потом копите на скутер.\n4. Вступите в чат района — там подскажут по любым вопросам.\n\nЕсли что-то упустил — пишите в теме, дополню." },
        { author: tyoma, h: 250, content: "Спасибо! По гайду за вечер поднял первые 50к." },
        { author: marat, h: 210, content: "Добавлю от себя: на 5 уровне открывается работа санитара, платит заметно лучше курьера." },
      ],
    },
    {
      cat: complaints, author: tyoma, title: "Жалоба на игрока (ID 2481) — DM в зелёной зоне", views: 412, createdH: 26,
      posts: [
        { author: tyoma, h: 26, content: "1. Ваш ник: Тёма777\n2. Ник нарушителя: ID 2481\n3. Дата и время: сегодня, ~18:40 МСК\n4. Суть нарушения: игрок открыл огонь в зелёной зоне у больницы без какой-либо RP-причины, убил меня и ещё двоих игроков.\n5. Доказательства: клип прикреплён, таймкод 12:05." },
        { author: kira, h: 22, content: "Подтверждаю, стояла рядом — стрельба началась вообще без предупреждения." },
        { author: danya, h: 20, content: "В зелёной зоне DM — это уже наглость. Ждём решения администрации." },
        { author: owner, h: 5, content: "Жалоба принята в работу. Проверим логи и примем решение в течение 24 часов. Спасибо за подробное описание." },
      ],
    },
    {
      cat: complaints, author: stas, title: "Жалоба отклонена: недостаточно доказательств", closed: true, views: 198, createdH: 70,
      posts: [
        { author: stas, h: 70, content: "Жалоба на игрока за якобы угон авто. Скриншот размытый, время не видно." },
        { author: owner, h: 66, content: "Отклонено: по скриншоту невозможно идентифицировать нарушителя. Напоминаем: принимается видео с видимым ником и временем." },
      ],
    },
    {
      cat: factions, author: kira, title: "Набор в семью La Cosa Nostra [Чёрный] — 20+ мест", views: 1801, createdH: 150,
      posts: [
        { author: kira, h: 150, content: "Семья LCN открывает набор на Чёрном сервере!\n\nТребования:\n— возраст от 14 лет;\n— опыт RP от 3 месяцев;\n— стабильный онлайн от 3 часов в день.\n\nЧто даём: сплочённый коллектив, еженедельные сходки, склад семьи и защиту. Заявки — в ЛС с рассказом о персонаже." },
        { author: danya, h: 130, content: "Слышал о вас только хорошее. Заявку кинул, ник Даня_Black." },
        { author: nyx, h: 90, content: "А со стримерами сотрудничаете? Могу делать эфиры с семейных мероприятий." },
      ],
    },
    {
      cat: factions, author: marat, title: "Заявка на создание организации «Скорая помощь+»", views: 640, createdH: 95,
      posts: [
        { author: marat, h: 95, content: "Прошу рассмотреть заявку на создание медицинской организации с расширенным функционалом: вертолёты, полевые госпитали на ивентах и обучение новичков первой помощи.\n\nСостав уже собран — 15 активных игроков с мед. отыгровками." },
        { author: owner, h: 80, content: "Инициатива отличная. Пришлите устав и график дежурств — вынесем на обсуждение администрации на этой неделе." },
      ],
    },
    {
      cat: tech, author: lucky, title: "Не запускается лаунчер после обновления 2.4", views: 933, createdH: 44,
      posts: [
        { author: lucky, h: 44, content: "После обновления лаунчер висит на «Проверка файлов» и закрывается. Windows 11, антивирус отключал, не помогло. У кого-то ещё так?" },
        { author: danya, h: 40, content: "Было такое. Помогла полная очистка кэша: папка %appdata%/phantom, удалить cache, потом запуск от имени администратора." },
        { author: lucky, h: 38, content: "Сработало! Спасибо, можно закрывать тему." },
      ],
    },
    {
      cat: tech, author: stas, title: "Баг: пропадают предметы из багажника после рестарта", views: 512, createdH: 30,
      posts: [
        { author: stas, h: 30, content: "После рестарта сервера из багажника пропали 2 аптечки и канистра. Логи есть, могу прислать в ЛС. Воспроизвёл дважды." },
        { author: owner, h: 12, content: "Спасибо за репорт! Баг подтверждён, связан с сохранением инвентаря транспорта. Фикс выйдет с патчем 2.4.1, предметы восстановим вручную." },
      ],
    },
    {
      cat: flood, author: nyx, title: "Какую музыку слушаете в поездках по городу?", views: 1104, createdH: 60,
      posts: [
        { author: nyx, h: 60, content: "Обожаю ночные покатушки по набережной под synthwave. А что играет у вас в наушниках во время гринда?" },
        { author: danya, h: 55, content: "Только фонк. Под него и грузчиком работается бодрее." },
        { author: stas, h: 50, content: "Подкасты про автомобили — и полезно, и не скучно." },
        { author: kira, h: 30, content: "У нас в семье традиция: на сходках кто-то всегда включает ретро-волну, уже мем стал." },
      ],
    },
    {
      cat: flood, author: danya, title: "Скриншоты с сервера — делимся лучшими моментами", views: 768, createdH: 40,
      posts: [
        { author: danya, h: 40, content: "Поймал вчера шикарный закат с крыши больницы. Кидайте свои кадры — соберём галерею для паблика проекта!" },
        { author: nyx, h: 34, content: "Есть кадр с гонок на «Воронах», скинула в личку. Публикуй смело." },
        { author: tyoma, h: 20, content: "Я пока только скрин своего первого велосипеда могу показать... но он честный!" },
      ],
    },
    {
      cat: market, author: stas, title: "Продам особняк в Центральном районе, 4.000.000", views: 350, createdH: 18,
      posts: [
        { author: stas, h: 18, content: "Продаётся особняк в Центральном районе: 6 комнат, гараж на 4 места, бассейн. Полностью меблирован. Цена 4.000.000, торг у капота. Связь в ЛС." },
        { author: lucky, h: 10, content: "Интересует под бизнес-офис. 3.6 млн — и по рукам?" },
      ],
    },
    {
      cat: market, author: lucky, title: "Куплю бизнес на набережной — рассмотрю варианты", views: 214, createdH: 8,
      posts: [
        { author: lucky, h: 8, content: "Ищу бар, кафе или автомойку на набережной Чёрного сервера. Бюджет до 6 млн. Продавцам — писать в ЛС с ценой и скриншотом точки." },
      ],
    },
  ];

  for (const t of seed) {
    const [topic] = await db
      .insert(topics)
      .values({
        categoryId: t.cat.id,
        authorId: t.author.id,
        title: t.title,
        pinned: t.pinned ?? false,
        closed: t.closed ?? false,
        views: t.views,
        createdAt: h(t.createdH),
      })
      .returning();
    await db.insert(posts).values(
      t.posts.map((p) => ({
        topicId: topic.id,
        authorId: p.author.id,
        content: p.content,
        createdAt: h(p.h),
      })),
    );
  }

  console.log("Seeding server...");
  await db.insert(gameServer).values({
    name: "Чёрный",
    address: "black.phantom-rp.ru:7777",
    online: true,
    players: 214,
    maxPlayers: 500,
    motd: "Добро пожаловать на Чёрный сервер! x2 опыт и зарплата до конца недели.",
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    restarts: 12,
  });

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
