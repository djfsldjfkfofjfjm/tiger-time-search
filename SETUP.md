# 🚀 НАСТРОЙКА TIGER TIME BOT

## Вариант 1: БЕЗ КОДА (только OpenAI Platform)

### Шаг 1: Создай Assistant
1. Открой https://platform.openai.com/assistants
2. Нажми **"+ Create"**
3. Дай имя: **Tiger Time Consultant**
4. В **Instructions** вставь текст из файла `assistant-instructions.md`

### Шаг 2: Добавь функцию
1. В разделе **"Functions"** нажми **"+ Add function"**
2. В поле **"Definition"** вставь JSON из файла `openai-function.json`
3. Сохрани Assistant и скопируй его **ID** (начинается с asst_...)

### Шаг 3: Используй API endpoint
Твой endpoint на Vercel: `https://tiger-time-search.vercel.app/api/assistant`

Отправляй POST запросы:
```json
{
  "message": "Покажи мужские часы до 150000",
  "assistant_id": "asst_xxxxxx",  // ID твоего Assistant
  "thread_id": "thread_xxx"       // Опционально, для продолжения диалога
}
```

---

## Вариант 2: ПРЯМОЙ ПОИСК (без Assistant)

Endpoint: `https://tiger-time-search.vercel.app/api/search`

POST запрос:
```json
{
  "query": "Daytona",
  "max_price": 200000,
  "gender": "Мужские"
}
```

---

## 🔑 Настройка переменных окружения в Vercel

1. Открой проект на Vercel
2. Перейди в **Settings → Environment Variables**
3. Добавь:
   - `OPENAI_API_KEY` = твой ключ OpenAI

---

## 📱 Пример использования в коде

### JavaScript/Node.js:
```javascript
const response = await fetch('https://tiger-time-search.vercel.app/api/assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Покажи самые дорогие Rolex',
    assistant_id: 'asst_xxxxx'
  })
});

const data = await response.json();
console.log(data.response); // Ответ ассистента
```

### Python:
```python
import requests

response = requests.post(
    'https://tiger-time-search.vercel.app/api/assistant',
    json={
        'message': 'Какие есть женские часы?',
        'assistant_id': 'asst_xxxxx'
    }
)

print(response.json()['response'])
```

### cURL:
```bash
curl -X POST https://tiger-time-search.vercel.app/api/assistant \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Найди Daytona золотые",
    "assistant_id": "asst_xxxxx"
  }'
```

---

## ❓ Частые вопросы

### Где взять assistant_id?
1. Создай Assistant на https://platform.openai.com/assistants
2. ID будет в URL или в настройках (начинается с `asst_`)

### Как сохранить контекст диалога?
Используй `thread_id` из ответа для продолжения разговора:
```json
{
  "message": "А что подешевле?",
  "assistant_id": "asst_xxxxx",
  "thread_id": "thread_abc123"  // из предыдущего ответа
}
```

### Ошибка 401 Unauthorized?
Добавь `OPENAI_API_KEY` в переменные окружения Vercel

### Как изменить поведение бота?
Отредактируй Instructions в настройках Assistant на OpenAI Platform

---

## 📞 Поддержка

Если что-то не работает:
1. Проверь логи в Vercel Dashboard
2. Убедись что API ключ правильный
3. Проверь что Assistant ID корректный

---

## 🎯 Быстрый тест

```bash
# Тест поиска напрямую
curl https://tiger-time-search.vercel.app/api/search \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "Daytona"}'

# Тест через Assistant (замени asst_xxxxx на свой ID)
curl https://tiger-time-search.vercel.app/api/assistant \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "Покажи Daytona", "assistant_id": "asst_xxxxx"}'
```