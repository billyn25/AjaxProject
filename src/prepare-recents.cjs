'use strict';

// Regla del gestor: hoy y los 29 días anteriores, según fecha del presupuesto.
// Se aplica al JS publicado; el original y los datos guardados no se reescriben.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

function pmRecentBounds(now = new Date()) {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  return [from, to];
}

function pmRecentDay(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const raw = value.trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.+)?$/);
  const es = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (!iso && !es) return null;
  if (iso && raw.includes('T') && !Number.isFinite(Date.parse(raw))) return null;
  const year = Number(iso ? iso[1] : es[3]);
  const month = Number(iso ? iso[2] : es[2]);
  const day = Number(iso ? iso[3] : es[1]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date : null;
}

function pmIsRecent(p, bounds = pmRecentBounds()) {
  if (!p || typeof p !== 'object') return false;
  // Una fecha explícita manda aunque hoy se abra, exporte o renombre el documento.
  const hasDate = p.fecha !== undefined && p.fecha !== null && String(p.fecha).trim() !== '';
  let day = hasDate ? pmRecentDay(p.fecha) : null;
  if (!hasDate) {
    // Compatibilidad con registros antiguos sin fecha: creación antes que edición.
    for (const key of ['createdAt', 'guardado', 'updatedAt']) {
      day = pmRecentDay(p[key]);
      if (day) break;
    }
  }
  return !!day && day >= bounds[0] && day <= bounds[1];
}

function replaceOne(source, before, after, label) {
  if (source.split(before).length !== 2) {
    throw new Error(`Recientes: no se encuentra un único punto de cambio (${label})`);
  }
  return source.replace(before, () => after);
}

function transformApp(source) {
  new vm.Script(source);
  const anchor = '  function pmDayStart(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}';
  const policy = [pmRecentBounds, pmRecentDay, pmIsRecent].map(fn => fn.toString()).join('\n');
  let result = replaceOne(source, anchor, `${policy}\n${anchor}`, 'regla de fechas');
  result = replaceOne(result,
    '    if(recent)recent.textContent=`(${Math.min(20,all.length)})`;',
    '    const recentBounds=pmRecentBounds();\n    if(recent)recent.textContent=`(${all.filter(p=>pmIsRecent(p,recentBounds)).length})`;',
    'contador');
  result = replaceOne(result,
    "    if(pmView.type==='recent')list=list.slice(0,20);",
    "    if(pmView.type==='recent'){const bounds=pmRecentBounds();list=list.filter(p=>pmIsRecent(p,bounds));}",
    'lista reciente');
  result = replaceOne(result,
    "    if(pmView.type==='recent')parts.push('Recientes');",
    "    if(pmView.type==='recent')parts.push('Recientes · últimos 30 días');",
    'etiqueta del filtro');
  result = replaceOne(result,
    "    if(!active){box.innerHTML='';return}",
    `    if(!active){
      const [from,to]=pmRecentBounds();
      box.hidden=false;
      box.innerHTML=\`<span>Recientes: <strong>últimos 30 días</strong> · \${date(from)} – \${date(to)}</span><button type="button" id="pmShowAllDates">Ver todos</button>\`;
      byId('pmShowAllDates')?.addEventListener('click',()=>{pmView={type:'all',value:''};clearSelection();render()});
      return;
    }`,
    'aviso de antigüedad');
  // Un rango de fechas explícito debe poder consultar históricos, no intersectarse
  // sin avisar con la carpeta inicial de 30 días. Conserva tienda y comercial.
  result = replaceOne(result,
    '      pmSyncDateRange();clearSelection();render();',
    "      if(pmView.type==='recent' && byId('pmFilterDate')?.value)pmView={type:'all',value:''};\n      pmSyncDateRange();clearSelection();render();",
    'rango de fechas explícito');
  new vm.Script(result);
  return result;
}

function renderIndex(html, filename) {
  const original = /<script src="app\.js(?:\?[^"<>]*)?"><\/script>/g;
  const generated = /<script id="hx-recents-app" src="\.\/app-recents-[a-f0-9]{16}\.js"><\/script>/g;
  const originalCount = [...html.matchAll(original)].length;
  const generatedCount = [...html.matchAll(generated)].length;
  if (originalCount + generatedCount !== 1) throw new Error('Recientes: carga de app.js inesperada');
  const tag = `<script id="hx-recents-app" src="./${filename}"></script>`;
  return html.replace(originalCount ? original : generated, () => tag);
}

async function build(root = __dirname) {
  const [source, html] = await Promise.all([
    fs.readFile(path.join(root, 'app.js'), 'utf8'),
    fs.readFile(path.join(root, 'index.html'), 'utf8')
  ]);
  const output = transformApp(source);
  const digest = crypto.createHash('sha256').update(output).digest('hex').slice(0, 16);
  const filename = `app-recents-${digest}.js`;
  const index = renderIndex(html, filename);
  // Valida todos los puntos antes de escribir. Si cambia el gestor, el build falla
  // y no publica una aplicación con un filtro aplicado solo a medias.
  await fs.writeFile(path.join(root, filename), output);
  await fs.writeFile(path.join(root, 'index.html'), index);
  console.log('[Recientes] OK: últimos 30 días, contador por fecha y acceso a Todos.');
  return { filename };
}

module.exports = { pmRecentBounds, pmRecentDay, pmIsRecent, transformApp, renderIndex, build };
if (require.main === module) {
  build().catch(error => { console.error(error.message); process.exitCode = 1; });
}
