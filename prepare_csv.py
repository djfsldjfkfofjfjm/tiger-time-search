#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Скрипт для подготовки CSV файла для загрузки в OpenAI Assistant
Преобразует заголовки в английские для удобной работы с pandas
"""

import pandas as pd
import sys

# Читаем оригинальный CSV
df = pd.read_csv('tiger.csv', sep=';', encoding='utf-8')

# Переименовываем колонки на английский
column_mapping = {
    'Title': 'title',
    'Photo': 'photos', 
    'Price': 'price',
    'Characteristics:Пол': 'gender',
    'Characteristics:Цвет': 'color',
    'Characteristics:Тип ремешка': 'strap_type',
    'Url': 'url'
}

df = df.rename(columns=column_mapping)

# Очищаем данные
# Заменяем пустые значения на пустые строки
df = df.fillna('')

# Преобразуем цены в числа (убираем нечисловые значения)
def clean_price(price):
    try:
        return float(price)
    except:
        return 0.0

df['price'] = df['price'].apply(clean_price)

# Сохраняем подготовленный файл
df.to_csv('tiger_prepared.csv', index=False, encoding='utf-8')

print("✅ CSV файл подготовлен!")
print(f"📊 Статистика:")
print(f"  - Всего товаров: {len(df)}")
print(f"  - Товаров с ценой: {len(df[df['price'] > 0])}")
print(f"  - Товаров с фото: {len(df[df['photos'] != ''])}")
print(f"  - Мужские: {len(df[df['gender'] == 'Мужские'])}")
print(f"  - Женские: {len(df[df['gender'] == 'Женские'])}")
print(f"  - Унисекс: {len(df[df['gender'] == 'Унисекс'])}")
print(f"\n📁 Файл сохранён как: tiger_prepared.csv")
print("📤 Загрузи этот файл в OpenAI Assistant!")