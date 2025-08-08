# Tiger Time Search API

API для поиска часов Rolex в каталоге Tiger Time для интеграции с OpenAI Assistant.

## 🚀 Быстрый старт

### 1. Деплой на Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/tiger-time-search)

Или вручную:

```bash
# Клонировать репозиторий
git clone https://github.com/YOUR_USERNAME/tiger-time-search.git
cd tiger-time-search

# Установить Vercel CLI
npm i -g vercel

# Задеплоить
vercel
```

### 2. Настройка OpenAI Assistant

1. Откройте [OpenAI Platform](https://platform.openai.com/assistants)
2. Создайте нового ассистента или откройте существующего
3. Добавьте функцию из файла `openai-function.json`
4. Скопируйте инструкции из `assistant-instructions.md`
5. В URL функции укажите: `https://YOUR-PROJECT.vercel.app/api/search`

## 📁 Структура проекта

```
tiger-time-search/
├── api/
│   └── search.js          # API endpoint для поиска
├── tiger.csv              # База данных товаров (5000 часов)
├── openai-function.json   # Определение функции для OpenAI
├── assistant-instructions.md # Инструкции для ассистента
├── test-search.js         # Тесты поиска
├── package.json          # Конфигурация проекта
└── vercel.json           # Настройки Vercel
```

## 🔍 API Endpoint

### POST /api/search

Поиск часов в каталоге.

**Параметры запроса:**

```json
{
  "query": "Daytona",        // Поисковый запрос
  "max_price": 150000,       // Максимальная цена
  "min_price": 50000,        // Минимальная цена
  "gender": "Мужские",       // Пол: Мужские/Женские/Унисекс
  "color": "Золотой",        // Цвет
  "strap": "Стальной",       // Тип ремешка
  "limit": 5                 // Количество результатов
}
```

**Ответ:**

```json
{
  "success": true,
  "найдено_всего": 25,
  "показано": 5,
  "товары": [
    {
      "название": "Rolex Daytona 40mm",
      "цена": "209 990 руб.",
      "характеристики": {
        "пол": "Мужские",
        "цвет": "Золотой",
        "ремешок": "Стальной"
      },
      "фото": ["https://..."],
      "ссылка": "https://tigertime.online/..."
    }
  ]
}
```

## 🧪 Тестирование

```bash
# Локальное тестирование
node test-search.js

# Запуск dev сервера
vercel dev
```

## 📊 База данных

База содержит **4997 товаров** со следующей структурой:
- Title - название модели
- Photo - ссылки на изображения
- Price - цена в рублях
- Characteristics:Пол - мужские/женские/унисекс
- Characteristics:Цвет - цвет часов
- Characteristics:Тип ремешка - материал ремешка
- Url - ссылка на товар

### Статистика:
- Всего товаров: 4997
- С ценой: 3987
- С фото: 4839
- Мужские: 848
- Женские: 262
- Унисекс: 20
- Средняя цена: 87 300 руб.

## 💬 Примеры запросов

**Клиент:** "Покажи Daytona"
```json
{ "query": "Daytona" }
```

**Клиент:** "Что есть для мужчин до 150 тысяч?"
```json
{ "gender": "Мужские", "max_price": 150000 }
```

**Клиент:** "Хочу золотые часы"
```json
{ "color": "Золотой" }
```

**Клиент:** "Женские Datejust"
```json
{ "query": "Datejust", "gender": "Женские" }
```

## 📝 Лицензия

MIT