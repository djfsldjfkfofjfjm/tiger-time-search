#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Простой скрипт для подготовки CSV файла без pandas
"""

import csv

# Читаем оригинальный файл
with open('tiger.csv', 'r', encoding='utf-8') as infile:
    reader = csv.DictReader(infile, delimiter=';')
    rows = list(reader)

# Новые заголовки
new_headers = ['title', 'photos', 'price', 'gender', 'color', 'strap_type', 'url']

# Подготавливаем данные
prepared_rows = []
stats = {
    'total': 0,
    'with_price': 0,
    'with_photos': 0,
    'male': 0,
    'female': 0,
    'unisex': 0
}

for row in rows:
    # Преобразуем цену
    try:
        price = float(row.get('Price', '0'))
    except (ValueError, TypeError):
        price = 0.0
    
    # Создаём новую строку с английскими заголовками
    new_row = {
        'title': row.get('Title', ''),
        'photos': row.get('Photo', ''),
        'price': price,
        'gender': row.get('Characteristics:Пол', ''),
        'color': row.get('Characteristics:Цвет', ''),
        'strap_type': row.get('Characteristics:Тип ремешка', ''),
        'url': row.get('Url', '')
    }
    
    prepared_rows.append(new_row)
    
    # Собираем статистику
    stats['total'] += 1
    if price > 0:
        stats['with_price'] += 1
    if new_row['photos']:
        stats['with_photos'] += 1
    if new_row['gender'] == 'Мужские':
        stats['male'] += 1
    elif new_row['gender'] == 'Женские':
        stats['female'] += 1
    elif new_row['gender'] == 'Унисекс':
        stats['unisex'] += 1

# Сохраняем подготовленный файл
with open('tiger_prepared.csv', 'w', encoding='utf-8', newline='') as outfile:
    writer = csv.DictWriter(outfile, fieldnames=new_headers)
    writer.writeheader()
    writer.writerows(prepared_rows)

print("✅ CSV файл подготовлен!")
print(f"📊 Статистика:")
print(f"  - Всего товаров: {stats['total']}")
print(f"  - Товаров с ценой: {stats['with_price']}")
print(f"  - Товаров с фото: {stats['with_photos']}")
print(f"  - Мужские: {stats['male']}")
print(f"  - Женские: {stats['female']}")
print(f"  - Унисекс: {stats['unisex']}")
print(f"\n📁 Файл сохранён как: tiger_prepared.csv")
print("📤 Загрузи этот файл в OpenAI Assistant!")