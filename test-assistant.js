#!/usr/bin/env node

// Тестовый скрипт для проверки работы Assistant
// Использование: node test-assistant.js "Ваш вопрос"

const ASSISTANT_ID = 'asst_GjedhDznvddK2H1ZcvfMMr3C';
const API_URL = 'https://tiger-time-search.vercel.app/api/assistant';

async function testAssistant(message) {
  console.log('🤖 Отправляю запрос Assistant...');
  console.log('📝 Сообщение:', message);
  console.log('🔗 URL:', API_URL);
  console.log('🆔 Assistant ID:', ASSISTANT_ID);
  console.log('-'.repeat(50));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        assistant_id: ASSISTANT_ID
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Ошибка:', response.status);
      console.error('Детали:', JSON.stringify(data, null, 2));
      
      if (data.hint) {
        console.log('\n💡 Подсказка:', data.hint);
      }
      return;
    }

    console.log('\n✅ Успешный ответ!');
    console.log('-'.repeat(50));
    console.log('\n📢 Ответ Assistant:');
    console.log(data.response);
    
    if (data.thread_id) {
      console.log('\n🔄 Thread ID для продолжения диалога:', data.thread_id);
    }
    
    if (data.usage) {
      console.log('\n📊 Использование токенов:', data.usage);
    }

  } catch (error) {
    console.error('❌ Ошибка сети:', error.message);
    console.log('\n💡 Проверь:');
    console.log('1. Vercel деплой обновился');
    console.log('2. OPENAI_API_KEY добавлен в переменные окружения Vercel');
    console.log('3. Assistant ID правильный');
  }
}

// Получаем сообщение из аргументов командной строки
const message = process.argv[2] || 'Покажи самые популярные часы Rolex';

// Запускаем тест
testAssistant(message);

console.log('\n📌 Примеры использования:');
console.log('node test-assistant.js "Покажи Daytona"');
console.log('node test-assistant.js "Что есть для мужчин до 150000?"');
console.log('node test-assistant.js "Хочу золотые часы"');
console.log('node test-assistant.js "Покажи женские Datejust"');