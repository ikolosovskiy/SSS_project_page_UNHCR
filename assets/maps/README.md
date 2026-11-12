# Межі областей України

ukraine-regions.json — спрощені й спроєктовані межі 27 адміністративних одиниць (24 області, АР Крим, міста Київ та Севастополь). Дані отримано через geoBoundaries gbOpen, boundaryID UKR-ADM1-14850775; джерело: OpenStreetMap / Wambacher. Рік представлених меж: 2017.

Джерело та метадані: https://www.geoboundaries.org/api/current/gbOpen/UKR/ADM1/

© OpenStreetMap contributors. Географічні дані та їхня похідна база поширюються на умовах ODbL 1.0: https://opendatacommons.org/licenses/odbl/1-0/ . Атрибуція OSM: https://www.openstreetmap.org/copyright . Ці умови стосуються геоданих, а не всього програмного коду сайту.

Збережені контури та координати підписів дозволяють звичайну збірку без мережевих запитів. scripts/geography.mjs створює SVG і вставляє його в HTML. Виділення 23 областей визначається переліком regionNames у scripts/build.mjs; м. Київ має окремий маркер і не додається до кількості областей.

Для повторної підготовки контурів завантажте URL download із метаданих ukraine-regions.json до .cache/ukraine-adm1.geojson, запустіть node scripts/prepare-map.mjs, потім node scripts/build.mjs. Повторна підготовка не потрібна для звичайної збірки сторінки.
