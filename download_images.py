#!/usr/bin/env python3
# ==============================================================================
# Скрипт для викачування всіх фотографій з CDN wfolio на власний сервер/диск
# Запуск: python3 download_images.py
# ==============================================================================

import os
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib

IMG_DIR = 'images'
os.makedirs(IMG_DIR, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
print(f'Знайдено {len(html_files)} HTML файлів.')

# Збір усіх URL зображень
url_map = {} # full_url -> local_filename

pattern = re.compile(r'https://i\.wfolio\.com/[^\s"'\<>]+?\.(?:jpg|jpeg|png)')

for hf in html_files:
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = pattern.findall(content)
    for url in matches:
        if url not in url_map:
            # Створюємо унікальне локальне ім'я на основі хешу та розширення
            ext = url.split('.')[-1].lower()
            url_hash = hashlib.md5(url.encode('utf-8')).hexdigest()
            local_name = f'{url_hash}.{ext}'
            url_map[url] = local_name

print(f'Знайдено {len(url_map)} унікальних фотографій для завантаження.')

def download_one(item):
    url, local_name = item
    dest_path = os.path.join(IMG_DIR, local_name)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return True, url, 'вже існує'
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        with open(dest_path, 'wb') as f:
            f.write(data)
        return True, url, 'завантажено'
    except Exception as e:
        return False, url, str(e)

# Завантаження у 10 потоків
print('Початок завантаження...')
success_count = 0
failed_count = 0

with ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(download_one, item) for item in url_map.items()]
    for i, future in enumerate(as_completed(futures), 1):
        ok, url, msg = future.result()
        if ok:
            success_count += 1
        else:
            failed_count += 1
        if i % 100 == 0 or i == len(url_map):
            print(f'Прогрес: {i}/{len(url_map)} ({success_count} успішно, {failed_count} помилок)')

print(f'
Завантаження завершено! Успішно: {success_count}, Помилок: {failed_count}')

# Оновлення HTML-файлів (заміна посилань на локальні)
if success_count > 0:
    print('
Оновлення HTML файлів на локальні шляхи images/...')
    for hf in html_files:
        with open(hf, 'r', encoding='utf-8') as f:
            content = f.read()
        for url, local_name in url_map.items():
            content = content.replace(url, f'{IMG_DIR}/{local_name}')
        with open(hf, 'w', encoding='utf-8') as f:
            f.write(content)
    print('Всі HTML файли успішно оновлено на локальні зображення!')
