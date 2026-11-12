# Альтернативна мапа України · 1.6.0

Картографічна основа: Natural Earth 1:10m Admin 1. Дані — public domain, обов’язкова атрибуція відсутня.

Джерело: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/
Умови: https://www.naturalearthdata.com/about/terms-of-use/
Завантаження: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson

ukraine-regions.json — спроєктовані контури 24 областей, усього Криму та міста Києва. Українські одиниці обрано за кодами UA, включно з Кримом; атрибути контролю території з джерела не використовуються. Севастополь геометрично об’єднано з Кримом: спільну межу вилучено, берегову лінію зшито в один контур без внутрішнього отвору.

23 області роботи визначає regionNames у scripts/build.mjs. Київ має окремий маркер. Назви — лише при взаємодії, без постійних підписів. Палітра — тональні варіанти погодженого Лісу, кремові межі, темний стан наведення. Під мапою немає легенди, інструкцій чи credit-блоку.

Звичайна збірка: node scripts/build.mjs. Працює без мережі та залежностей.

Повторна підготовка: збережіть GeoJSON за URL завантаження в .cache/natural-earth-admin1.geojson, відберіть features з iso_3166_2, що починаються на UA-, у .cache/natural-earth-ukraine.geojson; запустіть node scripts/prepare-map.mjs і node scripts/build.mjs. Модуль dissolve у prepare-map об’єднує лише Крим і Севастополь за спільними ребрами Natural Earth. Старі дані geoBoundaries/OSM більше не використовуються в мапі.
