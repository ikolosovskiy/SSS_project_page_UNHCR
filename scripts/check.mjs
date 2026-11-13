import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const html = readFileSync('index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(ids).size, ids.length, 'Unique IDs');
assert.equal((html.match(/<h1\b/g)||[]).length, 1, 'One H1');
for (const [,href] of html.matchAll(/href="#([^"]*)"/g)) assert(ids.includes(href), `Missing anchor: ${href}`);
for (const [,asset] of html.matchAll(/(?:src|href)="((?:assets\/|style\.css|main\.js)[^"]*)"/g)) assert(existsSync(asset.split('?')[0]), `Missing asset: ${asset}`);
assert.equal((html.match(/class="resource-link"/g)||[]).length, 8, 'Eight source resources');
for (const stat of ['2 376','1 159','1 125','782','877','126','27','173','167']) assert(html.includes(stat), `Missing source result: ${stat}`);
assert(!/lorem ipsum|\[object Object\]|undefined|href="#"/i.test(html), 'No placeholders');
assert(readFileSync('style.css','utf8').includes('prefers-reduced-motion:reduce'), 'Reduced motion');
assert.equal((html.match(/<details\b/g)||[]).length, 9, 'Nine disclosures');
assert.equal(html.split('<!-- SSS_PROJECT_START -->')[1].split('<!-- SSS_PROJECT_END -->')[0].trim(), readFileSync('page-content.html','utf8'), 'WP / preview parity');
console.log('PASS: assets, IDs, anchors, source results, resources, nine disclosures, reduced motion, WordPress markup parity.');

const news=JSON.parse(readFileSync('research/project-news.json','utf8'));
assert.equal((html.match(/class="news-card"/g)||[]).length,6,'Six source news stories');
for(const item of news.items){assert(html.includes(item.title)&&html.includes(item.url)&&html.includes(item.datetime),'Source news title, link and date');}
assert(html.includes(news.allUrl),'All project news link');
const colors=[...new Set(readFileSync('style.css','utf8').match(/#[0-9a-f]{6}\b/gi).map(c=>c.toUpperCase()))];
assert.deepEqual(colors.sort(),['#314C2C','#F6B93B','#FBF6EC'].sort(),'Exactly three interface colors');

assert.equal((html.match(/data-priority/g)||[]).length,5,'Five scroll-revealed source priorities');
assert(!html.includes('about-details'),'About summary is always visible');

const mapData=JSON.parse(readFileSync('assets/maps/ukraine-regions.json','utf8'));
assert.equal(mapData.regions.filter(r=>r.kind==='oblast').length,24,'All oblast boundaries');
assert.equal((html.match(/data-covered="true"/g)||[]).length,23,'Exactly 23 highlighted oblasts');
assert(html.includes('data-region-name="Луганська область"')&&html.includes('data-region-name="АР Крим"')&&html.includes('м. Київ'),'All regions and separate capital marker');
assert(!html.includes('about-support')&&!html.includes('about-context'),'Removed screenshot block');
const priorities=[...html.matchAll(/class="priority-item"[^>]*data-priority>[\s\S]*?<b>([^<]+)/g)].map(m=>m[1]);
assert.equal(priorities.length,5);
assert(priorities.every(t=>t[0]===t[0].toLocaleUpperCase('uk')),'Priority first letters are uppercase');

assert(!/<text\b/.test(readFileSync('assets/maps/project-geography.svg','utf8')),'No permanent labels on map');
assert(!/ради ВПО/i.test(html.match(/<figure class="project-map">[\s\S]*?<\/figure>/)[0]),'No council information in map');

assert(!html.includes('data-region="м. Севастополь"'),'Sevastopol is not separate');
assert.equal(mapData.regions.find(r=>r.name==='АР Крим').paths.length,1,'Single merged Crimea outline');
assert.equal(mapData.regions.find(r=>r.name==='АР Крим').paths[0].length,1,'No Sevastopol hole or boundary');
assert.equal(mapData.license,'Public domain','Alternative data source');
assert(!/map-legend|map-help|map-credit|<figcaption>/.test(html.match(/<figure class="project-map">[\s\S]*?<\/figure>/)[0]),'No map captions or legend');

assert(!html.includes('photo-moment'),'Removed standalone forum photo');
assert(!html.includes('portal-card'),'Unified portal statistics');
assert(html.includes('assets/documents/roadmap-shyrokivska.pdf'),'Correct road map PDF');
assert(html.includes('Від ініціатив до змін')&&html.includes('постраждалих від війни'),'PDF wording');
assert.equal((html.match(/class="chapter-number"/g)||[]).length,10,'Ten numbered sections');
assert(html.includes('href="https://www.unhcr.org/ua"'),'Direct donor website');

assert.equal((html.match(/class="priority-bullet"/g)||[]).length,5,'Bulleted priorities');
assert(/<div class="priority-item"[^>]*data-priority>[\s\S]*?Фахів/i.test(html)||html.includes('Підтримка фахівчинь і фахівців'),'Inclusive final priority');
const resultBlock=html.match(/<div class="results-grid"[\s\S]*?<div class="results-bottom">/)[0];
assert(resultBlock.includes('<b>10</b>')&&resultBlock.includes('громад підтримали в розробці соціальних паспортів'),'Added source-backed result metrics');
assert(!html.match(/<section class="chapter section[^>]*id="councils"[\s\S]*?<\/section>/)[0].includes('portal-results'),'Portal metrics are not duplicated in councils chapter');
assert.equal((html.match(/class="project-photo"/g)||[]).length,11,'Captioned chapter and comparison photographs');
assert(!html.includes('assets/images/sssp-uvkb-2026-13-1024x735.jpg'),'Unrelated roadmap image removed');

const sectionNumbers=[...html.matchAll(/class="chapter-number">(\d+)</g)].map(m=>Number(m[1]));
assert.deepEqual(sectionNumbers,[1,2,3,4,5,6,7,8,9,10],'Section numbers match contents order');
assert(html.includes('Портал рад ВПО — джерело повної'),'Updated portal heading');
assert(html.includes('<p>6 інформаційних дайджестів для рад ВПО і громад. Охоплення — понад 850 рад ВПО.</p>'),'Digest explanation is regular text');
