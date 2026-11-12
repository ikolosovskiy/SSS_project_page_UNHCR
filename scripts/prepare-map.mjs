import {readFileSync,writeFileSync} from 'node:fs';
const source=JSON.parse(readFileSync('.cache/natural-earth-ukraine.geojson','utf8'));
const names={'UA-74':'Чернігівська','UA-07':'Волинська','UA-56':'Рівненська','UA-18':'Житомирська','UA-32':'Київська','UA-21':'Закарпатська','UA-77':'Чернівецька','UA-26':'Івано-Франківська','UA-51':'Одеська','UA-05':'Вінницька','UA-46':'Львівська','UA-59':'Сумська','UA-63':'Харківська','UA-09':'Луганська','UA-14':'Донецька','UA-43':'АР Крим','UA-65':'Херсонська','UA-23':'Запорізька','UA-48':'Миколаївська','UA-53':'Полтавська','UA-68':'Хмельницька','UA-61':'Тернопільська','UA-12':'Дніпропетровська','UA-71':'Черкаська','UA-35':'Кіровоградська','UA-30':'м. Київ'};
const project=([lon,lat])=>[+(34+(lon-22)*62).toFixed(2),+(35+(52.4-lat)*94).toFixed(2)];
const polygons=f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
// Adjacent Natural Earth polygons share vertices. Cancel their shared edges,
// then stitch the coastline so Crimea has no Sevastopol boundary or seam.
function dissolve(features){
 const pointKey=p=>p.map(n=>n.toFixed(6)).join(',');const edges=new Map();
 for(const f of features)for(const poly of polygons(f))for(const ring of poly)for(let i=1;i<ring.length;i++){
  const a=pointKey(ring[i-1]),b=pointKey(ring[i]);if(a===b)continue;const key=[a,b].sort().join('|');if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);
 }
 const remaining=[...edges.values()],adj=new Map();remaining.forEach(([a,b],i)=>{for(const p of [a,b]){if(!adj.has(p))adj.set(p,[]);adj.get(p).push(i)}});
 const used=new Set(),rings=[];
 for(let i=0;i<remaining.length;i++){
  if(used.has(i))continue;const [start,next]=remaining[i];used.add(i);const ring=[start,next];let p=next;
  while(p!==start){const edge=adj.get(p)?.find(e=>!used.has(e));if(edge===undefined)throw Error('Unclosed Crimea coastline');used.add(edge);const [a,b]=remaining[edge];p=a===p?b:a;ring.push(p)}
  rings.push(ring.map(p=>p.split(',').map(Number)));
 }
 if(rings.length!==1)throw Error('Expected one merged Crimea outline, got '+rings.length);
 return [rings];
}
const crimea=source.features.filter(f=>['UA-43','UA-40'].includes(f.properties.iso_3166_2));
const regions=source.features.filter(f=>names[f.properties.iso_3166_2]).map(f=>{
 const iso=f.properties.iso_3166_2,name=names[iso];const coords=iso==='UA-43'?dissolve(crimea):polygons(f);
 return {name,kind:iso==='UA-30'?'city':iso==='UA-43'?'republic':'oblast',...(iso==='UA-30'?{label:project([30.523,50.45])}:{}),paths:coords.map(poly=>poly.map(ring=>ring.map(project)))};
});
if(regions.length!==26)throw Error('Expected 24 oblasts, Crimea and Kyiv');
writeFileSync('assets/maps/ukraine-regions.json',JSON.stringify({source:'Natural Earth 1:10m Admin 1',download:'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson',license:'Public domain',licenseURL:'https://www.naturalearthdata.com/about/terms-of-use/',note:'Ukraine selected by UA ISO codes, including all of Crimea. Sevastopol dissolved into the single Crimea outline. Geometry only; source country-control attributes are not used.',viewBox:'0 0 1220 825',regions}));
console.log('Prepared Natural Earth alternative:',regions.length,'shapes; one Crimea outline.');
