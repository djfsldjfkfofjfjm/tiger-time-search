import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Инициализация OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Функция парсинга CSV (используем ту же, что в search.js)
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(';');
  
  return lines.slice(1).map(line => {
    const values = line.split(';');
    
    return {
      title: values[0] || '',
      photos: values[1] ? values[1].split(' ').filter(Boolean) : [],
      price: parseFloat(values[2]) || 0,
      gender: values[3] || '',
      color: values[4] || '',
      strap: values[5] || '',
      url: values[6] || ''
    };
  }).filter(item => item.title);
}

// Функция поиска товаров
function searchProducts(params) {
  const { query, max_price, min_price, gender, color, strap, limit = 5 } = params;
  
  // Читаем CSV файл
  const csvPath = path.join(process.cwd(), 'tiger.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const products = parseCSV(csvContent);
  
  // Фильтруем продукты
  let results = products.filter(product => {
    if (query) {
      const searchQuery = query.toLowerCase();
      const titleMatch = product.title.toLowerCase().includes(searchQuery);
      const colorMatch = product.color && product.color.toLowerCase().includes(searchQuery);
      const genderMatch = product.gender && product.gender.toLowerCase().includes(searchQuery);
      
      if (!titleMatch && !colorMatch && !genderMatch) {
        return false;
      }
    }
    
    if (max_price && product.price > max_price) return false;
    if (min_price && product.price < min_price) return false;
    if (gender && product.gender && !product.gender.includes(gender)) return false;
    if (color && product.color && !product.color.toLowerCase().includes(color.toLowerCase())) return false;
    if (strap && product.strap && !product.strap.toLowerCase().includes(strap.toLowerCase())) return false;
    
    return true;
  });
  
  // Сортируем результаты
  if (query) {
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(query.toLowerCase());
      const bExact = b.title.toLowerCase().includes(query.toLowerCase());
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.price - b.price;
    });
  } else {
    results.sort((a, b) => a.price - b.price);
  }
  
  // Берём топ N результатов
  const topResults = results.slice(0, limit);
  
  // Форматируем результаты
  return {
    success: true,
    найдено_всего: results.length,
    показано: topResults.length,
    товары: topResults.map(product => ({
      название: product.title,
      цена: product.price ? `${product.price.toLocaleString('ru-RU')} руб.` : 'Цена не указана',
      характеристики: {
        пол: product.gender || 'Не указан',
        цвет: product.color || 'Не указан',
        ремешок: product.strap || 'Не указан'
      },
      фото: product.photos.slice(0, 3),
      ссылка: product.url
    }))
  };
}

// Главный обработчик
export default async function handler(req, res) {
  // CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, assistant_id, thread_id } = req.body;
    
    // Проверяем обязательные параметры
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!assistant_id) {
      return res.status(400).json({ 
        error: 'assistant_id is required',
        hint: 'Создайте Assistant на https://platform.openai.com/assistants и передайте его ID'
      });
    }
    
    // Создаём или используем существующий thread
    let threadId = thread_id;
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    }
    
    // Добавляем сообщение пользователя
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message
    });
    
    // Запускаем Assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistant_id
    });
    
    // Ждём завершения
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    while (runStatus.status !== 'completed' && runStatus.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      
      // Обрабатываем вызовы функций
      if (runStatus.status === 'requires_action') {
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];
        
        for (const toolCall of toolCalls) {
          if (toolCall.function.name === 'search_tiger_watches') {
            const args = JSON.parse(toolCall.function.arguments);
            const searchResult = searchProducts(args);
            
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify(searchResult)
            });
          }
        }
        
        // Отправляем результаты функций
        await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
          tool_outputs: toolOutputs
        });
      }
    }
    
    if (runStatus.status === 'failed') {
      return res.status(500).json({ 
        error: 'Assistant run failed',
        details: runStatus.last_error 
      });
    }
    
    // Получаем ответ Assistant
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data[0];
    
    return res.status(200).json({
      success: true,
      thread_id: threadId,
      response: lastMessage.content[0].text.value,
      usage: runStatus.usage
    });
    
  } catch (error) {
    console.error('Error in assistant API:', error);
    return res.status(500).json({
      success: false,
      error: 'Произошла ошибка при обработке запроса',
      details: error.message
    });
  }
}