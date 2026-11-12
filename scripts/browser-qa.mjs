import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const targets = await (await fetch('http://127.0.0.1:9227/json')).json();
const target = targets.find(t => t.type === 'page');
if (!target) throw Error('Start the project-local headless Chrome first.');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
let serial=0;
const pending = new Map();
socket.onmessage = ({data}) => { const message=JSON.parse(data);if(pending.has(message.id)){const {resolve,reject}=pending.get(message.id);pending.delete(message.id);message.error?reject(Error(message.error.message)):resolve(message.result);} };
function cdp(method,params={}){return new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const result=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;}
await cdp('Page.enable');
const report=[];
for(const width of [1440,1024,768,390,320]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:'http://127.0.0.1:4173'});
  await new Promise(r=>setTimeout(r,1000));
  await evaluate('document.fonts.ready');
  await evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>null)}))`);
  const geometry=await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].filter(i=>!i.closest('details:not([open])')).map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})),h1:document.querySelector('h1').getBoundingClientRect().toJSON(),overflows:[...document.querySelectorAll('.sss-project *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&getComputedStyle(e).position!=='fixed'&&!e.closest('.section-nav')&&!e.closest('details:not([open])')}).map(e=>e.className).slice(0,15)})`);
  report.push(geometry);
  if(width===1440||width===390){const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});writeFileSync(`qa/${width===1440?'desktop':'mobile'}.png`,Buffer.from(shot.data,'base64'));}
}
await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
await evaluate(`document.querySelector('#results').scrollIntoView()`);
await new Promise(r=>setTimeout(r,180));
const counterStarted=await evaluate(`!!document.querySelector('.results-grid .counter-value')&&document.querySelector('.results-grid .counter-value').textContent!=='2 376'`);
await new Promise(r=>setTimeout(r,1400));
const counterFinished=await evaluate(`document.querySelector('.results-grid .counter-value').textContent==='2 376'&&document.querySelector('.results-grid .counter-accessible').textContent==='2 376'`);
await evaluate(`document.querySelector('#institutions').scrollIntoView()`);
await new Promise(r=>setTimeout(r,100));
await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await new Promise(r=>setTimeout(r,100));
const counterReduced=await evaluate(`document.querySelector('#institutions .counter-value').textContent==='33'`);
report.push({counterStarted,counterFinished,counterReduced});
await evaluate(`document.querySelector('.menu-toggle').click()`);
const menuOpened=await evaluate(`!document.querySelector('.mobile-nav').hidden&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='true'`);
await evaluate(`document.querySelector('.menu-toggle').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`);
const menuClosed=await evaluate(`document.querySelector('.mobile-nav').hidden`);
await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await evaluate(`document.querySelector('.hero-copy>.button').click()`);
const anchor=await evaluate(`location.hash==='#results'&&Math.abs(document.querySelector('#results').getBoundingClientRect().top-100)<4`);
await evaluate(`document.querySelector('#councils details summary').click()`);
const disclosure=await evaluate(`document.querySelector('#councils details').open&&document.querySelector('#councils .prose').innerText.includes('фасилітаторів')`);
const reducedMotion=await evaluate(`matchMedia('(prefers-reduced-motion: reduce)').matches&&getComputedStyle(document.querySelector('[data-enter]')).animationName==='none'`);
const brokenImages=await evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>null)})).then(()=>[...document.images].filter(i=>i.naturalWidth===0).map(i=>i.src))`);
report.push({menuOpened,menuClosed,anchor,disclosure,reducedMotion,brokenImages});
await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await evaluate(`document.querySelectorAll('details').forEach(d=>d.open=false);document.querySelectorAll('.is-pending').forEach(e=>e.classList.remove('is-pending'));window.scrollTo(0,0)`);
const layout=await cdp('Page.getLayoutMetrics');
const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:1440,height:layout.cssContentSize.height,scale:1}});
writeFileSync('qa/full-page.png',Buffer.from(shot.data,'base64'));
await cdp('Emulation.setScriptExecutionDisabled',{value:true});
await cdp('Page.reload');
await new Promise(r=>setTimeout(r,500));
const noJs=await evaluate(`getComputedStyle(document.querySelector('#about h2')).opacity==='1'&&document.querySelectorAll('details').length===5`);
report.push({noJs});
writeFileSync('qa/browser-report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report.map(item=>item.width?{width:item.width,scrollWidth:item.scrollWidth,overflows:item.overflows,broken:item.images.filter(i=>!i.ok)}:item),null,2));
await cdp('Browser.close').catch(()=>{});
socket.close();
assert(report.filter(r=>r.width).every(r=>r.scrollWidth<=r.width&&r.overflows.length===0&&r.images.every(i=>i.ok)), 'Responsive layout and all image assets');
assert(menuOpened&&menuClosed&&anchor&&disclosure&&reducedMotion&&noJs&&brokenImages.length===0, 'Interactive and reduced-motion checks');
assert(counterStarted&&counterFinished&&counterReduced, 'Counters animate, finish exactly, and stop for reduced motion');
console.log('PASS: five viewports, images, mobile menu, anchors, disclosures, reduced motion, no-JS content.');

