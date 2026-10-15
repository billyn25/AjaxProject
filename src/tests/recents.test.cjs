'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { pmRecentBounds, pmRecentDay, pmIsRecent, transformApp, renderIndex, build } = require('../prepare-recents.cjs');
const now = new Date(2026, 9, 15, 16, 20);
const bounds = pmRecentBounds(now);
const ymd = d => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

// Puntos de integración del gestor original. filtered() conserva su cuerpo real.
// Los demás servicios se sustituyen por dobles: ninguna prueba accede a MongoDB.
const fixture = `
  function pmDayStart(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
  function syncCount(){const all=listAll();const recent=byId('recent'),total=byId('total');
    if(recent)recent.textContent=\`(\${Math.min(20,all.length)})\`;
    if(total)total.textContent=\`(\${all.length})\`;
  }
  function filtered(){
    let list=listAll().slice();
    if(pmView.type==='store')list=list.filter(p=>String(p.tienda||'').trim()===pmView.value);
    else if(pmView.type==='commercial')list=list.filter(p=>String(p.comercial||'').trim()===pmView.value);
    else if(pmView.type==='missing-store')list=list.filter(p=>!String(p.tienda||'').trim());
    const s=byId('pmFilterStore')?.value||'',c=byId('pmFilterCommercial')?.value||'';
    if(s==='__NONE__')list=list.filter(p=>!String(p.tienda||'').trim());else if(s)list=list.filter(p=>String(p.tienda||'').trim()===s);
    if(c==='__NONE__')list=list.filter(p=>!String(p.comercial||'').trim());else if(c)list=list.filter(p=>String(p.comercial||'').trim()===c);
    list=list.filter(pmMatchesDate);
    const q=String(byId('pmSearch')?.value||'').trim().toLowerCase();if(q.length>=2)list=list.filter(p=>q.split(/\\s+/).every(part=>searchText(p).includes(part)));
    const sort=byId('pmSort')?.value||'recent';
    if(sort==='identifier')list.sort((a,b)=>title(a).localeCompare(title(b),'es',{numeric:true}));
    else if(sort==='client')list.sort((a,b)=>String(a.cliente||'').localeCompare(String(b.cliente||''),'es'));
    else if(sort==='total')list.sort((a,b)=>calc(b).total-calc(a).total);
    else list.sort((a,b)=>modified(b).localeCompare(modified(a)));
    if(pmView.type==='recent')list=list.slice(0,20);
    return list;
  }
  function notice(active){const box=byId('notice');const parts=[];
    if(pmView.type==='recent')parts.push('Recientes');
    if(!active){box.innerHTML='';return}
    return parts;
  }
  function dateChanged(){
      pmSyncDateRange();clearSelection();render();
  }
  // Centinelas: otras acciones no deben ser sustituidas por el transformador.
  function pdf(){return 'PDF SIN CAMBIOS'}
  function guardar(){return 'DATOS SIN CAMBIOS'}
`;
const originalIndex = '<html><script id="hx-pdf-runtime" src="./pdf-runtime-123.js"></script><script src="app.js?v=4.2.33"></script><script src="explorer.js?v=2"></script></html>';
function harness(list) {
  const elements = { recent:{}, total:{}, notice:{}, pmShowAllDates:{addEventListener:(name, fn)=>{elements.showAll=fn;}} };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [+now])); } }
  const scope = {
    Date: Clock, pmView: {type:'recent',value:''}, byId:id=>elements[id], listAll:()=>list,
    pmMatchesDate:()=>true, searchText:p=>String(p.cliente||'').toLowerCase(), title:p=>p.identificador||'',
    calc:p=>({total:p.total||0}), modified:p=>p.updatedAt||p.fecha||'',
    date:d=>d.toLocaleDateString('es-ES'), pmSyncDateRange(){}, clearSelection(){}, render(){}
  };
  vm.createContext(scope);
  vm.runInContext(transformApp(fixture), scope);
  return {scope,elements};
}

test('30 días naturales: hoy y los 29 anteriores',()=>{
  assert.deepEqual(bounds.map(ymd), [[2026,9,16],[2026,10,15]]);
});
test('incluye ambos extremos y excluye anteriores y futuras',()=>{
  for(const fecha of ['2026-10-15','2026-10-14','2026-09-16'])assert.equal(pmIsRecent({fecha},bounds),true);
  for(const fecha of ['2026-09-15','2026-09-01','2026-10-16'])assert.equal(pmIsRecent({fecha},bounds),false);
});
test('abrir, exportar, renombrar o guardar hoy no rejuvenece la fecha antigua',()=>{
  assert.equal(pmIsRecent({fecha:'2026-09-01',updatedAt:now.toISOString(),guardado:now.toISOString()},bounds),false);
});
test('fecha explícita inválida o futura no se sustituye por edición reciente',()=>{
  for(const fecha of ['2026-02-30','2026-10-16','incorrecta',20261015])assert.equal(pmIsRecent({fecha,updatedAt:now.toISOString()},bounds),false);
});
test('fechas ISO y españolas equivalentes; no convierte días inexistentes',()=>{
  for(const v of ['2026-10-15','2026-10-15T23:59:59.999Z','15/10/2026','15-10-2026','15.10.2026'])assert.deepEqual(ymd(pmRecentDay(v)),[2026,10,15]);
  for(const v of ['2026-13-01','2026-02-29','31/09/2026','2026-00-15','2026-10-00','2026-10-15Terror','',null,{}])assert.equal(pmRecentDay(v),null);
  assert.deepEqual(ymd(pmRecentDay('2024-02-29')),[2024,2,29]);
});
test('sin fecha usa creación antes que edición; sin fechas no es reciente',()=>{
  assert.equal(pmIsRecent({createdAt:'2026-09-01',updatedAt:'2026-10-15'},bounds),false);
  assert.equal(pmIsRecent({createdAt:'2026-10-14T12:00:00Z'},bounds),true);
  assert.equal(pmIsRecent({fecha:'',guardado:'2026-10-15T01:00:00Z'},bounds),true);
  for(const v of [{},null,{fecha:''}])assert.equal(pmIsRecent(v,bounds),false);
});
test('límites de año, bisiesto y cambios horarios usan el calendario local',()=>{
  assert.deepEqual(pmRecentBounds(new Date(2026,0,10)).map(ymd),[[2025,12,12],[2026,1,10]]);
  assert.deepEqual(pmRecentBounds(new Date(2024,2,1)).map(ymd),[[2024,2,1],[2024,3,1]]);
  assert.deepEqual(pmRecentBounds(new Date(2026,10,1)).map(ymd),[[2026,10,3],[2026,11,1]]);
  assert.deepEqual(pmRecentBounds(new Date(2026,9,15,0,0)).map(ymd),pmRecentBounds(new Date(2026,9,15,23,59)).map(ymd));
});
test('Recientes muestra más de 20 si cumplen el plazo y su contador coincide',()=>{
  const list=Array.from({length:25},(_,i)=>Object.freeze({fecha:'2026-10-15',id:String(i)}));
  list.push(Object.freeze({fecha:'2026-09-01',updatedAt:'2026-10-15'}),Object.freeze({fecha:'2026-10-16'}),Object.freeze({}));
  Object.freeze(list);
  const before=JSON.stringify(list),{scope,elements}=harness(list);
  assert.equal(scope.filtered().length,25);
  scope.syncCount();assert.equal(elements.recent.textContent,'(25)');assert.equal(elements.total.textContent,'(28)');
  assert.equal(JSON.stringify(list),before);
  scope.pmView={type:'all',value:''};assert.equal(scope.filtered().length,28);
});
test('con solo antiguos Recientes está vacío y Todos conserva los documentos',()=>{
  const {scope,elements}=harness([{fecha:'2026-09-01'},{fecha:'2026-09-14'}]);
  assert.equal(scope.filtered().length,0);scope.syncCount();assert.equal(elements.recent.textContent,'(0)');
  scope.pmView={type:'all'};assert.equal(scope.filtered().length,2);
});
test('tienda, comercial, búsqueda y orden siguen funcionando',()=>{
  const {scope,elements}=harness([
    {fecha:'2026-10-15',tienda:'A',comercial:'Luis',cliente:'Ana',total:20},
    {fecha:'2026-10-14',tienda:'B',cliente:'Bea',total:50},
    {fecha:'2026-09-01',tienda:'A',cliente:'Antiguo',total:90}
  ]);
  elements.pmFilterStore={value:'A'};assert.equal(scope.filtered().length,1);
  elements.pmFilterStore.value='';elements.pmFilterCommercial={value:'Luis'};assert.equal(scope.filtered().length,1);
  elements.pmFilterCommercial.value='';elements.pmSort={value:'total'};assert.equal(scope.filtered()[0].cliente,'Bea');
  elements.pmSearch={value:'Antiguo'};assert.equal(scope.filtered().length,0);
  scope.pmView={type:'all'};assert.equal(scope.filtered()[0].cliente,'Antiguo');
  elements.pmSearch.value='';scope.pmView={type:'store',value:'A'};assert.equal(scope.filtered().length,2);
});
test('el aviso explica 30 días y Ver todos sale del límite sin borrar nada',()=>{
  const {scope,elements}=harness([{fecha:'2026-09-01'}]);scope.notice(false);
  assert.match(elements.notice.innerHTML,/últimos 30 días/);assert.match(elements.notice.innerHTML,/16\/9\/2026/);assert.equal(elements.notice.hidden,false);
  elements.showAll();assert.equal(scope.pmView.type,'all');assert.equal(scope.filtered().length,1);
});
test('un rango explícito permite consultar el histórico desde la vista inicial',()=>{
  const {scope,elements}=harness([]);elements.pmFilterDate={value:'prevmonth'};scope.dateChanged();assert.equal(scope.pmView.type,'all');
  scope.pmView={type:'store',value:'A'};scope.dateChanged();assert.equal(scope.pmView.type,'store');
});
test('el transformador conserva otras acciones y falla si la base cambia',()=>{
  const out=transformApp(fixture);assert.match(out,/PDF SIN CAMBIOS/);assert.match(out,/DATOS SIN CAMBIOS/);
  assert.throws(()=>transformApp(fixture.replace("    if(pmView.type==='recent')list=list.slice(0,20);",'')),/lista reciente/);
  assert.throws(()=>transformApp(fixture+fixture),/único/);
  assert.throws(()=>transformApp('function {'),SyntaxError);
});
test('cambia solo el script de la app; preserva PDF, explorer y orden',()=>{
  const file='app-recents-1234567890abcdef.js';const out=renderIndex(originalIndex,file);
  assert.equal(out,originalIndex.replace('<script src="app.js?v=4.2.33"></script>',`<script id="hx-recents-app" src="./${file}"></script>`));
  assert.equal(renderIndex(out,file),out);assert.throws(()=>renderIndex(originalIndex+originalIndex,file),/inesperada/);
});
test('build repetible: conserva app.js original y usa nombre con hash',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'ajax-recents-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.writeFile(path.join(root,'app.js'),fixture);await fs.writeFile(path.join(root,'index.html'),originalIndex);
  const result=await build(root);assert.match(result.filename,/^app-recents-[a-f0-9]{16}\.js$/);
  const after=await fs.readFile(path.join(root,'index.html'),'utf8');assert.equal(await fs.readFile(path.join(root,'app.js'),'utf8'),fixture);
  assert.equal((await build(root)).filename,result.filename);assert.equal(await fs.readFile(path.join(root,'index.html'),'utf8'),after);
});
test('un cambio incompatible cancela el build antes de escribir',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'ajax-recents-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.writeFile(path.join(root,'app.js'),'function original(){}');await fs.writeFile(path.join(root,'index.html'),originalIndex);
  await assert.rejects(build(root),/regla de fechas/);assert.equal(await fs.readFile(path.join(root,'index.html'),'utf8'),originalIndex);
  assert.deepEqual((await fs.readdir(root)).sort(),['app.js','index.html']);
});
