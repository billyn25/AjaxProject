'use strict';
// Exercise the REAL manager shipped in app.js, not a rewritten fixture.
// Only the DOM and stored list are isolated; tests never contact MongoDB.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const start = source.indexOf("(function(){\n  let pmSelectedId='';");
const endMarker = '  window.HX_PM_RENDER=render;';
const end = source.indexOf(endMarker, start);
assert.ok(start >= 0 && end > start, 'Locate the actual budget-manager closure');
const expose = `window.__managerTest={filtered,syncFilters,updateFilterNotice,pmRecentBounds,pmIsRecent,setView(type,value=''){pmView={type,value}}};`;
const manager = source.slice(start, end) + expose + '\n})();';
const fixedNow = new Date(2026, 9, 15, 16, 20);

function harness(items, mobile=false) {
  const elements = {};
  function element(id) {
    return elements[id] ||= {
      value:'', textContent:'', innerHTML:'', hidden:false, disabled:false, dataset:{},
      classList:{add(){},remove(){},toggle(){}}, style:{removeProperty(){},setProperty(){}},
      setAttribute(){}, querySelector(){return null}, querySelectorAll(){return []},
      addEventListener(type, fn){this['on'+type]=fn;}
    };
  }
  for(const id of ['pmFolderRecentCount','pmFolderAllCount','pmFilterNotice','pmShowAllDates','pmFilterStore','pmFilterCommercial','pmFilterDate','pmSearch','pmSort'])element(id);
  class Clock extends Date {constructor(...args){super(...(args.length?args:[+fixedNow]));}}
  const scope = {
    Date:Clock, console, Intl, setTimeout, clearTimeout,
    leerListaPresupuestos:()=>items,
    escapeHtml:value=>String(value??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    fmt:new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}),
    matchMedia:()=>({matches:mobile}),
    document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[],addEventListener(){}},
    window:{addEventListener(){}}
  };
  vm.runInNewContext(manager,scope,{timeout:5000});
  return {api:scope.window.__managerTest,elements};
}
function dataset() {
  // Same visible date pattern as the reported screen, plus two historical dates.
  return ['2026-10-15','2026-10-14','2026-10-07','2026-09-16','2026-09-14','2026-09-01','2026-08-20','2026-08-01']
    .map((fecha,i)=>Object.freeze({id:String(i),fecha,cliente:'Prueba '+i,tienda:i%2?'B':'A',comercial:'Luis',updatedAt:'2026-10-15T14:00:00Z',lineas:[]}));
}
function ids(list){return Array.from(list,p=>p.id).sort();}

test('source is syntactically valid and index loads it directly with a new version',()=>{
  new vm.Script(source);
  assert.match(html,/<script src="app\.js\?v=recientes-30d-20261015-2"><\/script>/);
  assert.match(html,/<span>Últimos 30 días<\/span>/);
  assert.ok(!html.includes('app-recents-'));
  assert.ok(!source.includes("if(pmView.type==='recent')list=list.slice(0,20);"));
});
for(const mobile of [false,true])test(`actual ${mobile?'mobile':'desktop'} manager: 4 recent of 8, with matching counters`,()=>{
  const all=Object.freeze(dataset());const before=JSON.stringify(all);
  const {api,elements}=harness(all,mobile);
  assert.deepEqual(ids(api.filtered()),['0','1','2','3']);
  api.syncFilters();assert.equal(elements.pmFolderRecentCount.textContent,'(4)');assert.equal(elements.pmFolderAllCount.textContent,'(8)');
  api.setView('all');assert.equal(api.filtered().length,8);
  assert.equal(JSON.stringify(all),before,'Never change any saved document');
});
test('actual notice exposes the date interval and the Ver todos action',()=>{
  const {api,elements}=harness(dataset());api.updateFilterNotice();
  assert.equal(elements.pmFilterNotice.hidden,false);
  assert.match(elements.pmFilterNotice.innerHTML,/últimos 30 días/);
  assert.match(elements.pmFilterNotice.innerHTML,/16\/09\/2026/);
  assert.match(elements.pmFilterNotice.innerHTML,/15\/10\/2026/);
  elements.pmShowAllDates.onclick();assert.equal(api.filtered().length,8);
});
test('real filter excludes yesterday-before-cutoff, future and invalid dates despite current updatedAt',()=>{
  const all=['2026-09-15','2026-10-16','2026-02-30','bad'].map(fecha=>({fecha,updatedAt:'2026-10-15T14:00:00Z'}));
  const {api,elements}=harness(all);assert.equal(api.filtered().length,0);
  api.syncFilters();assert.equal(elements.pmFolderRecentCount.textContent,'(0)');
  api.setView('all');assert.equal(api.filtered().length,4);
});
test('more than 20 recent records are all included; no quantity cap remains',()=>{
  const all=Array.from({length:25},(_,i)=>({id:String(i),fecha:'2026-10-15'}));
  const {api,elements}=harness(all);assert.equal(api.filtered().length,25);
  api.syncFilters();assert.equal(elements.pmFolderRecentCount.textContent,'(25)');
});
test('all/store/commercial folders retain older records; search respects the selected folder',()=>{
  const {api,elements}=harness(dataset());
  api.setView('store','A');assert.equal(api.filtered().length,4);
  api.setView('commercial','Luis');assert.equal(api.filtered().length,8);
  elements.pmSearch.value='Prueba 5';api.setView('recent');assert.equal(api.filtered().length,0);
  api.setView('all');assert.deepEqual(ids(api.filtered()),['5']);
});
test('explicit date filters still use their real date predicate',()=>{
  const {api,elements}=harness(dataset());api.setView('all');
  elements.pmFilterDate.value='prevmonth';assert.deepEqual(ids(api.filtered()),['3','4','5']);
  elements.pmFilterDate.value='today';assert.deepEqual(ids(api.filtered()),['0']);
});
