import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const html = readFileSync('index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(ids).size, ids.length, 'Unique IDs');
assert.equal((html.match(/<h1\b/g)||[]).length, 1, 'One H1');
for (const [,href] of html.matchAll(/href="#([^"]*)"/g)) assert(ids.includes(href), `Missing anchor: ${href}`);
for (const [,asset] of html.matchAll(/(?:src|href)="((?:assets\/|style\.css|main\.js)[^"]*)"/g)) assert(existsSync(asset), `Missing asset: ${asset}`);
assert.equal((html.match(/class="resource-link"/g)||[]).length, 8, 'Eight source resources');
for (const stat of ['2 376','1 159','1 125','782','877','126','27','173','167']) assert(html.includes(stat), `Missing source result: ${stat}`);
assert(!/lorem ipsum|\[object Object\]|undefined|href="#"/i.test(html), 'No placeholders');
assert(readFileSync('style.css','utf8').includes('prefers-reduced-motion:reduce'), 'Reduced motion');
assert.equal((html.match(/<details\b/g)||[]).length, 8, 'Eight disclosures');
assert.equal(html.split('<!-- SSS_PROJECT_START -->')[1].split('<!-- SSS_PROJECT_END -->')[0].trim(), readFileSync('page-content.html','utf8'), 'WP / preview parity');
console.log('PASS: assets, IDs, anchors, source results, resources, eight disclosures, reduced motion, WordPress markup parity.');

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
assert(html.includes('data-label="Луганська"')&&html.includes('data-label="АР Крим"')&&html.includes('м. Київ'),'All regions and separate capital marker');
assert(!html.includes('about-support')&&!html.includes('about-context'),'Removed screenshot block');
const priorities=[...html.matchAll(/data-priority><span>\d<\/span><b>([^<]+)/g)].map(m=>m[1]);
assert.equal(priorities.length,5);
assert(priorities.every(t=>t[0]===t[0].toLocaleUpperCase('uk')),'Priority first letters are uppercase');
