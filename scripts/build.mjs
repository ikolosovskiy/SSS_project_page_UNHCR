import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { geographyMarkup } from './geography.mjs';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const source = readFileSync('research/content.md', 'utf8');
const updated = readFileSync('research/content-updated.html', 'utf8');
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const images = readdirSync('assets/images').sort();
const photo = (n,alt,extra='') => `<img src="assets/images/${images[n-1]}" alt="${escape(alt)}" ${extra} width="1024" height="680">`;
const captions = [...updated.matchAll(/<figcaption>([\s\S]*?)<\/figcaption>/g)].map(m=>m[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim());
const captionFor = n => n<=10 ? captions[n-1] : n===11 ? 'Кухонна зона до оновлення. Благовіщенська лікарня, Кіровоградська область, червень 2026 року' : 'Кухонна зона після оновлення. Благовіщенська лікарня, Кіровоградська область, червень 2026 року';
const figure = (n,caption=captionFor(n)) => `<figure class="project-photo"><div class="photo-frame gallery-image${[6,7,8].includes(n)?' crop-artifact':''}">${photo(n,caption,'loading="lazy"')}</div><figcaption class="photo-caption">${escape(caption)}</figcaption></figure>`;
const comparison = `<div class="before-after">${figure(11,'До оновлення кухонної зони')}${figure(12,'Після оновлення кухонної зони')}</div><p class="photo-caption comparison-caption">${escape(captions[10])}</p>`;
const arrow = '<span aria-hidden="true">↗</span>';
function article(index) {
 const id=['institutions','councils','communities','ombudsman','advocacy'][index];
 const section=updated.match(new RegExp('<section id="'+id+'"[^>]*>([\\s\\S]*?)</section>'));
 if(!section)throw Error('Missing chapter '+id);
 let content=section[1].replace(/<div class="chapter-heading">[\s\S]*?<\/div>/,'').replace(/<div class="stats">[^\n]*<\/div>/g,'').replace(/<figure>[\s\S]*?<\/figure>/g,'').replace(/rel="noopener"/g,'rel="noopener noreferrer"');
 if(index===1){const begin=content.indexOf('<p>Підтримуємо та розвиваємо');const end=content.indexOf('<p>Для визнання роботи рад',begin);if(begin<0||end<0)throw Error('Missing portal block');content=content.slice(0,begin)+content.slice(end)}
 if(index===4)content=content.replace(/<li>([\s\S]*?)<\/li>/g,(_,text)=>'<li>'+text.charAt(0).toLocaleUpperCase('uk')+text.slice(1).trim().replace(/[;.]$/,'')+'.</li>');
 return content;
}
const chapters=[
 {id:'institutions',no:'1',title:'Підтримка установ системи соціального захисту',text:'Надаємо інституційну, технічну та консультативно-методичну підтримку установам, які працюють у секторі соціального захисту населення.',stats:[['33','семінари з кейс-менеджменту'],['1 125','учасниць та учасників семінарів та тренінгів'],['2 376','індивідуальних консультацій і роз’яснень']],image:2,gallery:[3,4]},
 {id:'councils',no:'2',title:'Посилюємо спроможність рад ВПО',text:'Підтримуємо розвиток потенціалу та інституційної спроможності рад ВПО, які представляють права та інтереси внутрішньо переміщених людей на локальному рівні.',stats:[['173','моніторингові візити для оцінки спроможності рад ВПО'],['1 159','індивідуальних юридичних консультацій для членкинь і членів рад ВПО'],['27','стратегічних сесій']],image:5,gallery:[6,7,8]},
 {id:'communities',no:'4',title:'Підтримка територіальних громад',text:'Надаємо системну підтримку територіальним громадам в оновленні та розробці соціальних паспортів і середньострокових планів розвитку соціальних послуг.',stats:[['13','громад долучилися до опитування щодо оцінки спроможності та потреб'],['27','громад підтримали в розробці соціальних паспортів'],['3','дводенні семінари для голів територіальних громад']],image:9,gallery:[10]},
 {id:'ombudsman',no:'5',title:'Підтримка роботи Офісу Омбудсмана',text:'Підтримуємо роботу Офісу Омбудсмана у вибраних регіонах для моніторингу дотримання прав ВПО, зокрема в місцях тимчасового проживання, освітніх центрах та укриттях.',stats:[['782','моніторингові візити'],['877','консультацій із питань дотримання прав ВПО'],['126','зустрічей із місцевою владою']],gallery:[]}
];
const regionNames=['Вінницька','Волинська','Дніпропетровська','Донецька','Житомирська','Закарпатська','Запорізька','Івано-Франківська','Кіровоградська','Київська','Львівська','Миколаївська','Одеська','Полтавська','Рівненська','Сумська','Тернопільська','Харківська','Херсонська','Хмельницька','Чернівецька','Черкаська','Чернігівська'];
const resources=[...source.slice(source.indexOf('**КОРИСНІ ІНФОРМАЦІЙНІ МАТЕРІАЛИ')).matchAll(/^\* \[([^\]]+)\]\((https?:\/\/.+)\)\s*$/gm)].map(([,title,url])=>({title,url:url.trim()}));
const news=JSON.parse(readFileSync('research/project-news.json','utf8'));
const newsMarkup=`<section class="project-news section" id="project-news" aria-labelledby="project-news-title"><div class="wrap"><div class="news-heading"><h2 id="project-news-title">Новини проєкту</h2><a class="button button--dark" href="${escape(news.allUrl)}">Всі новини проєкту ${arrow}</a></div><div class="news-grid">${news.items.map(item=>`<article class="news-card" data-reveal><a href="${escape(item.url)}"><img src="${item.image}" alt="${escape(item.title)}" width="547" height="318" loading="lazy"><div class="news-card-copy"><time datetime="${escape(item.datetime)}">${escape(item.date)}</time><h3>${escape(item.title)}</h3><span class="news-card-arrow" aria-hidden="true">↗</span></div></a></article>`).join('')}</div></div></section>`;
const chapterMarkup=chapters.map((c,i)=>`<section class="chapter section ${i%2?'chapter--reverse':''}" id="${c.id}" aria-labelledby="${c.id}-title"><div class="wrap"><div class="chapter-grid${i===3?' chapter-grid--text':''}"><div class="chapter-copy" data-reveal><div class="chapter-title-row"><span class="chapter-number">${c.no}</span><h2 id="${c.id}-title">${c.title}</h2></div><p class="lead">${c.text}</p></div>${i===3?'':`<div class="chapter-photo" data-reveal>${figure(c.image)}</div>`}</div>${i===3?comparison:''}<div class="chapter-stats">${c.stats.map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join('')}</div><details class="story-details"><summary><span>Докладніше</span><span class="disclosure-hint" aria-hidden="true"></span><span class="disclosure-icon" aria-hidden="true">+</span></summary><div class="story-body"><div class="prose">${i===1?'<p>Ради з питань внутрішньо переміщених осіб (ради ВПО) представляють права та інтереси внутрішньо переміщених людей на локальному рівні.</p>':''}${article(i)}</div>${i===3?'':`<div class="story-gallery">${c.gallery.map(n=>figure(n)).join('')}</div>`}</div></details></div></section>${i===1?readFileSync('portal.html','utf8'):''}`).join('');
const priorityTargets=['institutions','councils','advocacy','ombudsman','ombudsman'];
const priorityItems=[...source.slice(0,source.indexOf('**КЛЮЧОВІ РЕЗУЛЬТАТИ')).matchAll(/^\* (.+)$/gm)].map(m=>m[1].trim().replace(/;$/,''));
if(priorityItems.length!==5)throw Error('Expected five priorities');
priorityItems[4]=priorityItems[4].replace('фахівців','фахівчинь і фахівців').replace('для здійснення моніторингу','для моніторингу');
const priorityMarkup=priorityItems.map((text,i)=>{const tag=i===4?'div':'a';return `<${tag} class="priority-item" ${i===4?'':`href="#${priorityTargets[i]}"`} data-priority><span class="priority-bullet" aria-hidden="true">•</span><b>${escape(text.charAt(0).toLocaleUpperCase('uk')+text.slice(1))}</b>${i===4?'':arrow}</${tag}>`}).join('');
let html=readFileSync('page.template.html','utf8').replace('<!-- CHAPTERS -->',chapterMarkup).replace('<!-- PRIORITIES -->',priorityMarkup).replace('<!-- GEOGRAPHY_MAP -->',geographyMarkup(regionNames)).replace('<!-- ADVOCACY -->',article(4)).replace('<!-- RESOURCES -->',resources.map((r,i)=>`<a class="resource-link" href="${escape(r.url)}" target="_blank" rel="noopener noreferrer"><span class="resource-no">${i+1}</span><span>${escape(r.title)}</span>${arrow}</a>`).join(''));
html=html.replace('<!-- NEWS -->',newsMarkup).replace(/[ \t]+$/gm,'');
const fingerprint = file => createHash('sha256').update(readFileSync(file)).digest('hex').slice(0,12);
html=html.replace('href="style.css"',`href="style.css?v=${fingerprint('style.css')}"`).replace('src="main.js"',`src="main.js?v=${fingerprint('main.js')}"`);
writeFileSync('index.html',html);
writeFileSync('page-content.html',html.split('<!-- SSS_PROJECT_START -->')[1].split('<!-- SSS_PROJECT_END -->')[0].trim());
console.log(`Built index.html and page-content.html. ${resources.length} resources, ${chapters.length} chapters, 23 regions.`);
