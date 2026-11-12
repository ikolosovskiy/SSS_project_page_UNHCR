import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { geographyMarkup } from './geography.mjs';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const source = readFileSync('research/content.md', 'utf8');
const updated = readFileSync('research/content-updated.html', 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const images = readdirSync('assets/images').sort();
const photo = (n, alt, extra = '') => `<img src="assets/images/${images[n - 1]}" alt="${escape(alt)}" ${extra} width="1024" height="680">`;
const arrow = '<span aria-hidden="true">↗</span>';
function article(index) {
  const id = ['institutions','councils','communities','ombudsman','advocacy'][index];
  const section = updated.match(new RegExp('<section id="' + id + '"[^>]*>([\\s\\S]*?)</section>'));
  if (!section) throw new Error('Missing updated source chapter: ' + id);
  // Photographs are placed in each chapter's dedicated local gallery.
  return section[1].replace(/<div class="chapter-heading">[\s\S]*?<\/div>/, '').replace(/<div class="stats">[^\n]*<\/div>/g, '').replace(/<figure>[\s\S]*?<\/figure>/g, '').replace(/rel="noopener"/g, 'rel="noopener noreferrer"');
}
const chapters = [
  { id: 'institutions', no: '1', tag: 'Установи соціального захисту', title: 'Підтримка установ системи соціального захисту', text: 'Надаємо інституційну, технічну та консультативно-методичну підтримку установам, які працюють у секторі соціального захисту населення.', stats: [['33', 'семінари з кейс-менеджменту'], ['1 125', 'учасниць та учасників семінарів та тренінгів'], ['2 376', 'індивідуальних консультацій і роз’яснень']], image: 2, alt: 'Тренінг із протидії професійному вигоранню для фахівчинь системи соціального захисту Запорізької області', gallery: [3,4] },
  { id: 'councils', no: '2', tag: 'Ради ВПО', title: 'Допомагаємо радам ВПО впливати на рішення', text: 'Підтримуємо розвиток потенціалу та інституційної спроможності рад ВПО, які представляють права та інтереси внутрішньо переміщених людей на локальному рівні.', stats: [['173', 'моніторингові візити для оцінки спроможності рад ВПО'], ['1 159', 'індивідуальних юридичних консультацій для членкинь і членів рад ВПО'], ['27', 'стратегічних сесій']], image: 5, alt: 'Стратегічна сесія для Ради ВПО Олександрівської селищної ради, Миколаївська область', gallery: [6,7,8] },
  { id: 'communities', no: '3', tag: 'Територіальні громади', title: 'Підтримка територіальних громад', text: 'Надаємо системну підтримку територіальним громадам в оновленні та розробці соціальних паспортів і середньострокових планів розвитку соціальних послуг.', stats: [['13', 'громад долучилися до опитування щодо оцінки спроможності та потреб'], ['27', 'громад підтримали в розробці соціальних паспортів'], ['3', 'дводенні семінари для голів територіальних громад']], image: 9, alt: 'Семінар для голів територіальних громад Одеської області, Одеса, 18–19 червня 2026 року', gallery: [10] },
  { id: 'ombudsman', no: '4', tag: 'Офіс Омбудсмана', title: 'Підтримка роботи Офісу Омбудсмана', text: 'Підтримуємо роботу Офісу Омбудсмана у вибраних регіонах для моніторингу дотримання прав ВПО, зокрема в місцях тимчасового проживання, освітніх центрах та укриттях.', stats: [['782', 'моніторингові візити'], ['877', 'консультацій із питань дотримання прав ВПО'], ['126', 'зустрічей із місцевою владою']], image: 12, alt: 'Оновлена кухонна зона у місці тимчасового проживання на базі Благовіщенської лікарні', gallery: [11] }
];
const regionNames = ['Вінницька','Волинська','Дніпропетровська','Донецька','Житомирська','Закарпатська','Запорізька','Івано-Франківська','Кіровоградська','Київська','Львівська','Миколаївська','Одеська','Полтавська','Рівненська','Сумська','Тернопільська','Харківська','Херсонська','Хмельницька','Чернівецька','Черкаська','Чернігівська'];
const resources = [...source.slice(source.indexOf('**КОРИСНІ ІНФОРМАЦІЙНІ МАТЕРІАЛИ')).matchAll(/^\* \[([^\]]+)\]\((https?:\/\/.+)\)\s*$/gm)].map(([,title,url])=>({title,url:url.trim()}));
const news = JSON.parse(readFileSync('research/project-news.json', 'utf8'));
const newsMarkup = `<section class="project-news section" id="project-news" aria-labelledby="project-news-title"><div class="wrap"><div class="news-heading"><h2 id="project-news-title">Новини проєкту</h2><a class="button button--dark" href="${escape(news.allUrl)}">Всі новини проєкту <span aria-hidden="true">↗</span></a></div><div class="news-grid">${news.items.map(item=>`<article class="news-card" data-reveal><a href="${escape(item.url)}"><img src="${item.image}" alt="${escape(item.title)}" width="547" height="318" loading="lazy"><div class="news-card-copy"><time datetime="${escape(item.datetime)}">${escape(item.date)}</time><h3>${escape(item.title)}</h3><span class="news-card-arrow" aria-hidden="true">↗</span></div></a></article>`).join('')}</div></div></section>`;
const chapterMarkup = chapters.map((c, i) => `<section class="chapter section ${i % 2 ? 'chapter--reverse' : ''}" id="${c.id}" aria-labelledby="${c.id}-title">
  <div class="wrap"><div class="chapter-grid"><div class="chapter-copy" data-reveal>
    <div class="eyebrow"><span class="chapter-number">${c.no}</span>${c.tag}</div><h2 id="${c.id}-title">${c.title}</h2><p class="lead">${c.text}</p>

    </div><div class="chapter-photo photo-frame" data-reveal>${photo(c.image,c.alt,'loading="lazy"')}</div></div>
    <div class="chapter-stats">${c.stats.map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join('')}</div>
    <details class="story-details"><summary><span>Докладніше</span><span class="disclosure-hint" aria-hidden="true"></span><span class="disclosure-icon" aria-hidden="true">+</span></summary><div class="story-body"><div class="prose">${i===1?'<p>Ради з питань внутрішньо переміщених осіб (ради ВПО) представляють права та інтереси внутрішньо переміщених людей на локальному рівні.</p>':''}${article(i)}</div><div class="story-gallery">${c.gallery.map(n=>photo(n, ['','','','Форум соціальних змін у Бучі','Передача велосипедів і скутерів соціальним працівникам','','Центральноукраїнський форум рад ВПО у Білій Церкві','Обмінний візит рад ВПО у Полтаві','Нагородження відзнакою «ЗаРади майбутнього»','','Воркшоп для надавачів соціальних послуг у Миколаєві','Кухонна зона у місці тимчасового проживання до ремонту','Моніторинговий візит до місця тимчасового проживання у Кіровоградській області'][n] || c.alt,'loading="lazy"')).join('')}</div></div></details>
  </div></section>${i === 1 ? readFileSync('portal.html', 'utf8') : ''}`).join('');
const priorityTargets = ['institutions','councils','advocacy','ombudsman','ombudsman'];
const priorityItems = [...source.slice(0, source.indexOf('**КЛЮЧОВІ РЕЗУЛЬТАТИ')).matchAll(/^\* (.+)$/gm)].map(match => match[1].trim().replace(/;$/, ''));
if (priorityItems.length !== 5) throw new Error('Expected all five source priorities');
const priorityMarkup = priorityItems.map((text, i) => `<a href="#${priorityTargets[i]}" data-priority><span>${i+1}</span><b>${escape(text.charAt(0).toLocaleUpperCase('uk')+text.slice(1))}</b><span aria-hidden="true">↗</span></a>`).join('');
let html = readFileSync('page.template.html', 'utf8').replace('<!-- CHAPTERS -->', chapterMarkup).replace('<!-- PRIORITIES -->', priorityMarkup).replace('<!-- GEOGRAPHY_MAP -->', geographyMarkup(regionNames)).replace('<!-- ADVOCACY -->', article(4)).replace('<!-- RESOURCES -->', resources.map((r,i)=>`<a class="resource-link" href="${escape(r.url)}" target="_blank" rel="noopener noreferrer"><span class="resource-no">${String(i+1)}</span><span>${escape(r.title)}</span>${arrow}</a>`).join(''));
html = html.replace('<!-- NEWS -->', newsMarkup).replace(/[ \t]+$/gm, '');
writeFileSync('index.html', html);
// The WordPress shortcode uses the same content as the standalone preview.
writeFileSync('page-content.html', html.split('<!-- SSS_PROJECT_START -->')[1].split('<!-- SSS_PROJECT_END -->')[0].trim());
console.log(`Built index.html and page-content.html. ${resources.length} resources, ${chapters.length} chapters, 23 regions.`);
