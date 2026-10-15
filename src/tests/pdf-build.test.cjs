'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { LIBRARIES, gitBlobSha, downloadLibrary, smokeTest, renderIndex, build } = require('../prepare-pdf.cjs');

// Fixtures de infraestructura, no sustituyen a las librerias reales en produccion.
// Cada build verifica los archivos reales y genera un PDF con ellos en smokeTest().
const core = Buffer.from(`self.jspdf = { jsPDF: function () {
  this.text = function () {};
  this.autoTable = function (options) { return self.jspdf.jsPDF.API.autoTable.call(this, options); };
  this.output = function () { return '%PDF-1.3\\nfixture\\n%%EOF'; };
}}; self.jspdf.jsPDF.API = {};`);
const table = Buffer.from(`window.jspdf.jsPDF.API.autoTable = function () {
  this.lastAutoTable = { finalY: 30 };
};`);
const fixtureSpecs = [core, table].map((bytes, index) => ({ ...LIBRARIES[index], sha: gitBlobSha(bytes) }));
const response = bytes => ({ ok: true, arrayBuffer: async () => bytes });
const fetchFixture = async url => response(url.includes('jspdf-autotable') ? table : core);
const coreTag = `<script src="https://cdnjs.cloudflare.com/ajax/libs/${LIBRARIES[0].cdnPath}"></script>`;
const tableTag = `<script src="https://cdnjs.cloudflare.com/ajax/libs/${LIBRARIES[1].cdnPath}"></script>`;
const html = `<!doctype html><head>\n  ${coreTag}\n  ${tableTag}\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>\n</head><body><input id="cliente"><script src="app.js?v=4.2.32"></script></body>`;
const localTag = '<script id="hx-pdf-runtime" src="./pdf-runtime-test.js"></script>';

async function project(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ajax-pdf-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, 'index.html'), html);
  await fs.writeFile(path.join(root, 'app.js'), '/* Presupuestos, importes y exportacion original: no tocar. */');
  return root;
}

test('Git blob usa el formato oficial (incluye longitud y byte NUL)', () => {
  assert.equal(gitBlobSha(Buffer.alloc(0)), 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391');
});
test('acepta el archivo exacto verificado', async () => {
  assert.deepEqual(await downloadLibrary(fixtureSpecs[0], async () => response(core)), core);
});
test('recurre al espejo cuando falla CDN', async () => {
  const urls = [];
  const result = await downloadLibrary(fixtureSpecs[0], async url => {
    urls.push(url);
    if (urls.length === 1) throw new Error('CDN bloqueado');
    return response(core);
  });
  assert.deepEqual(result, core);
  assert.equal(urls.length, 2);
  assert.match(urls[1], /^https:\/\/raw\.githubusercontent\.com\//);
});
test('rechaza contenido alterado aunque responda HTTP 200', async () => {
  await assert.rejects(downloadLibrary(fixtureSpecs[0], async () => response(Buffer.from('<html>error</html>'))), /version verificada/);
});
test('rechaza un HTTP de error aunque su cuerpo coincida', async () => {
  await assert.rejects(downloadLibrary(fixtureSpecs[0], async () => ({ ok: false, status: 503 })), /HTTP 503/);
});
test('rechaza contenido vacio', async () => {
  await assert.rejects(downloadLibrary(fixtureSpecs[0], async () => response(Buffer.alloc(0))), /Tamano/);
});
test('solo sustituye los scripts PDF; mantiene Excel y el HTML restante', () => {
  const output = renderIndex(html, localTag);
  assert.equal(output, html.replace(coreTag, localTag).replace(tableTag, ''));
  assert.ok(!output.includes('cdnjs.cloudflare.com/ajax/libs/jspdf'));
  assert.ok(!localTag.includes('async') && !localTag.includes('defer'));
});
test('una segunda construccion no duplica la carga PDF', () => {
  const first = renderIndex(html, localTag);
  assert.equal(renderIndex(first, localTag), first);
});
test('rechaza un script PDF ausente, duplicado o en orden inverso', () => {
  assert.throws(() => renderIndex(html.replace(tableTag, ''), localTag), /Carga PDF inesperada/);
  assert.throws(() => renderIndex(coreTag + html, localTag), /Carga PDF inesperada/);
  assert.throws(() => renderIndex(tableTag + coreTag, localTag), /Carga PDF inesperada/);
});
test('la prueba exige constructor, AutoTable y un documento PDF', () => {
  assert.doesNotThrow(() => smokeTest(core, table));
  assert.throws(() => smokeTest(core, Buffer.from('/* plugin ausente */')), /no estan listos/);
  assert.throws(() => smokeTest(Buffer.from('self.jspdf = {};'), table));
});
test('un error de sintaxis impide publicar', () => {
  assert.throws(() => smokeTest(Buffer.from('function {'), table));
});
test('construye un runtime local con integridad y sin tocar app.js', async t => {
  const root = await project(t);
  const appBefore = await fs.readFile(path.join(root, 'app.js'));
  const result = await build({ root, libraries: fixtureSpecs, fetcher: fetchFixture });
  const index = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const runtime = await fs.readFile(path.join(root, result.filename), 'utf8');
  assert.match(result.filename, /^pdf-runtime-[a-f0-9]{16}\.js$/);
  assert.ok(index.includes(`src="./${result.filename}"`));
  assert.ok(index.includes(`integrity="sha384-${result.integrity}"`));
  assert.ok(runtime.indexOf(core.toString()) < runtime.indexOf(table.toString()));
  assert.deepEqual(await fs.readFile(path.join(root, 'app.js')), appBefore);
  const again = await build({ root, libraries: fixtureSpecs, fetcher: fetchFixture });
  assert.equal(again.filename, result.filename);
  assert.equal(await fs.readFile(path.join(root, 'index.html'), 'utf8'), index);
});
test('fallo de red: conserva index.html y no escribe un runtime incompleto', async t => {
  const root = await project(t);
  await assert.rejects(build({ root, libraries: fixtureSpecs, fetcher: async () => { throw new Error('Sin red'); } }), /se cancela la publicacion/);
  assert.equal(await fs.readFile(path.join(root, 'index.html'), 'utf8'), html);
  assert.deepEqual((await fs.readdir(root)).sort(), ['app.js', 'index.html']);
});
test('plugin invalido: conserva la pagina anterior antes de escribir', async t => {
  const root = await project(t);
  const badTable = Buffer.from('/* no instala AutoTable */');
  const specs = [fixtureSpecs[0], { ...fixtureSpecs[1], sha: gitBlobSha(badTable) }];
  await assert.rejects(build({ root, libraries: specs, fetcher: async url => response(url.includes('jspdf-autotable') ? badTable : core) }), /no estan listos/);
  assert.equal(await fs.readFile(path.join(root, 'index.html'), 'utf8'), html);
  assert.deepEqual((await fs.readdir(root)).sort(), ['app.js', 'index.html']);
});
