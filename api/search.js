import fs from 'fs';
import path from 'path';

// Функция парсинга CSV
function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(';');
  
  return lines.slice(1).map(line => {
    // Используем regex для правильного разбора CSV с учётом кавычек
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
  }).filter(item => item.title); // Фильтруем пустые строки
}

// Главный обработчик API
export default async function handler(req, res) {
  // CORS заголовки для работы с OpenAI
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Обработка OPTIONS запроса для CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Получаем параметры поиска
    const { query, max_price, min_price, gender, color, strap, limit = 5 } = req.body;
    
    // Читаем CSV файл
    const csvPath = path.join(process.cwd(), 'tiger.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const products = parseCSV(csvContent);
    
    // Фильтруем продукты
    let results = products.filter(product => {
      // Поиск по названию (если указан query)
      if (query) {
        const searchQuery = query.toLowerCase();
        const titleMatch = product.title.toLowerCase().includes(searchQuery);
        
        // Также ищем в характеристиках
        const colorMatch = product.color && product.color.toLowerCase().includes(searchQuery);
        const genderMatch = product.gender && product.gender.toLowerCase().includes(searchQuery);
        
        if (!titleMatch && !colorMatch && !genderMatch) {
          return false;
        }
      }
      
      // Фильтр по цене
      if (max_price && product.price > max_price) return false;
      if (min_price && product.price < min_price) return false;
      
      // Фильтр по полу
      if (gender && product.gender && !product.gender.includes(gender)) return false;
      
      // Фильтр по цвету
      if (color && product.color && !product.color.toLowerCase().includes(color.toLowerCase())) return false;
      
      // Фильтр по типу ремешка
      if (strap && product.strap && !product.strap.toLowerCase().includes(strap.toLowerCase())) return false;
      
      return true;
    });
    
    // Сортируем по релевантности и цене
    if (query) {
      results.sort((a, b) => {
        // Точное совпадение в приоритете
        const aExact = a.title.toLowerCase().includes(query.toLowerCase());
        const bExact = b.title.toLowerCase().includes(query.toLowerCase());
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // Затем по цене
        return a.price - b.price;
      });
    } else {
      // Если нет query, сортируем по цене
      results.sort((a, b) => a.price - b.price);
    }
    
    // Берём топ N результатов
    const topResults = results.slice(0, limit);
    
    // Форматируем результаты для ответа
    const formattedResults = topResults.map(product => ({
      название: product.title,
      цена: product.price ? `${product.price.toLocaleString('ru-RU')} руб.` : 'Цена не указана',
      характеристики: {
        пол: product.gender || 'Не указан',
        цвет: product.color || 'Не указан',
        ремешок: product.strap || 'Не указан'
      },
      фото: product.photos.slice(0, 3), // Максимум 3 фото
      ссылка: product.url
    }));
    
    // Формируем ответ
    const response = {
      success: true,
      найдено_всего: results.length,
      показано: formattedResults.length,
      товары: formattedResults
    };
    
    // Добавляем сообщение, если ничего не найдено
    if (formattedResults.length === 0) {
      response.message = 'К сожалению, по вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.';
    }
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in search API:', error);
    return res.status(500).json({
      success: false,
      error: 'Произошла ошибка при поиске',
      details: error.message
    });
  }
}