# Generala Score Tracker

PWA-приложение для подсчёта очков в настольной игре с кубиками **Generala** (популярна в Латинской Америке).

![Screenshot](screenshot.png)

## Возможности

- Подсчёт очков для 2–10 игроков
- 10 раундов, 10+ категорий (Единицы–Шестёрки, Escalera, Full, Poker, Generala)
- Поддержка Generala servida (мгновенная победа)
- Двойная Generala (опционально)
- Бонус за первый бросок
- История игр с итоговыми таблицами
- Реванш с теми же игроками
- Три языка: русский, испанский, английский
- Тёмная тема, mobile-first дизайн
- Работает полностью офлайн (PWA)
- Нет зависимостей — чистый HTML/CSS/JS

## Запуск локально

Просто откройте `index.html` в браузере. Для PWA-функций (Service Worker, офлайн) нужен локальный HTTP-сервер:

```bash
# Python 3
python3 -m http.server 8000

# или Node.js (npx)
npx serve .
```

Затем откройте `http://localhost:8000` в браузере.

## Деплой на GitHub Pages

1. Создайте репозиторий на GitHub (например, `generala`)
2. Добавьте remote и запушьте:
   ```bash
   git remote add origin https://github.com/USERNAME/generala.git
   git branch -M main
   git push -u origin main
   ```
3. Перейдите в **Settings → Pages**
4. В разделе **Source** выберите **Deploy from a branch**
5. Выберите ветку `main` и папку `/ (root)`
6. Нажмите **Save**
7. Через пару минут приложение будет доступно по адресу:

   **https://USERNAME.github.io/generala/**

## Демо

[https://USERNAME.github.io/generala](https://USERNAME.github.io/generala)

## Технологии

- Vanilla JavaScript (ES6+)
- HTML5 / CSS3
- Service Worker (Cache First)
- localStorage
- Canvas API (генерация иконок)
