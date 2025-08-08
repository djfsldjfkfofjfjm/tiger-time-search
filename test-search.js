import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция парсинга CSV (та же, что в API)
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

// Функция поиска
function searchProducts(products, params) {
  const { query, max_price, min_price, gender, color, strap, limit = 5 } = params;
  
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
  
  return results.slice(0, limit);
}

// Тесты
console.log('🚀 Запуск тестов поиска часов Tiger Time\n');
console.log('=' . repeat(50));

// Читаем CSV
const csvPath = path.join(__dirname, 'tiger.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const products = parseCSV(csvContent);

console.log(`✅ Загружено товаров: ${products.length}\n`);

// Тест 1: Поиск Daytona
console.log('📌 Тест 1: Поиск "Daytona"');
const test1 = searchProducts(products, { query: 'Daytona', limit: 3 });
console.log(`Найдено: ${test1.length} товаров`);
test1.forEach(p => {
  console.log(`  - ${p.title}: ${p.price} руб.`);
});
console.log();

// Тест 2: Мужские часы до 150000
console.log('📌 Тест 2: Мужские часы до 150000 руб');
const test2 = searchProducts(products, { gender: 'Мужские', max_price: 150000, limit: 3 });
console.log(`Найдено: ${test2.length} товаров`);
test2.forEach(p => {
  console.log(`  - ${p.title}: ${p.price} руб.`);
});
console.log();

// Тест 3: Золотые часы
console.log('📌 Тест 3: Золотые часы');
const test3 = searchProducts(products, { color: 'Золот', limit: 3 });
console.log(`Найдено: ${test3.length} товаров`);
test3.forEach(p => {
  console.log(`  - ${p.title}: ${p.price} руб. (${p.color})`);
});
console.log();

// Тест 4: Женские Datejust
console.log('📌 Тест 4: Женские Datejust');
const test4 = searchProducts(products, { query: 'Datejust', gender: 'Женские', limit: 3 });
console.log(`Найдено: ${test4.length} товаров`);
test4.forEach(p => {
  console.log(`  - ${p.title}: ${p.price} руб.`);
});
console.log();

// Тест 5: Часы с каучуковым ремешком
console.log('📌 Тест 5: Часы с каучуковым ремешком');
const test5 = searchProducts(products, { strap: 'Каучук', limit: 3 });
console.log(`Найдено: ${test5.length} товаров`);
test5.forEach(p => {
  console.log(`  - ${p.title}: ${p.price} руб. (${p.strap})`);
});
console.log();

// Тест 6: Самые дешевые часы
console.log('📌 Тест 6: Топ-3 самых дешевых часов');
const test6 = searchProducts(products, { limit: 3 });
console.log(`Найдено: ${test6.length} товаров`);
test6.forEach(p => {
  console.log(`  - ${p.title}: ${p.price} руб.`);
});
console.log();

// Статистика по базе
console.log('=' . repeat(50));
console.log('📊 Статистика базы данных:');

const stats = {
  total: products.length,
  withPrice: products.filter(p => p.price > 0).length,
  withPhotos: products.filter(p => p.photos.length > 0).length,
  male: products.filter(p => p.gender === 'Мужские').length,
  female: products.filter(p => p.gender === 'Женские').length,
  unisex: products.filter(p => p.gender === 'Унисекс').length,
  avgPrice: Math.round(products.filter(p => p.price > 0).reduce((sum, p) => sum + p.price, 0) / products.filter(p => p.price > 0).length),
  minPrice: Math.min(...products.filter(p => p.price > 0).map(p => p.price)),
  maxPrice: Math.max(...products.filter(p => p.price > 0).map(p => p.price))
};

console.log(`  Всего товаров: ${stats.total}`);
console.log(`  С ценой: ${stats.withPrice}`);
console.log(`  С фото: ${stats.withPhotos}`);
console.log(`  Мужские: ${stats.male}`);
console.log(`  Женские: ${stats.female}`);
console.log(`  Унисекс: ${stats.unisex}`);
console.log(`  Средняя цена: ${stats.avgPrice.toLocaleString('ru-RU')} руб.`);
console.log(`  Мин. цена: ${stats.minPrice.toLocaleString('ru-RU')} руб.`);
console.log(`  Макс. цена: ${stats.maxPrice.toLocaleString('ru-RU')} руб.`);

console.log('\n✅ Все тесты завершены!');