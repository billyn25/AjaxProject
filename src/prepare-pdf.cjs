'use strict';

// Reutiliza las versiones existentes: no instala paquetes ni cambia pdf().
// Netlify descarga/verifica las librerias al construir, no el movil al exportar.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const LIBRARIES = [
  {
    name: 'jsPDF 2.5.1',
    cdnPath: 'jspdf/2.5.1/jspdf.umd.min.js',
    // Git blob del archivo original de cdnjs/cdnjs, incluidos sus avisos de licencia.
    sha: 'a9781f1dc03f77453adf11c8be05105330fefadc'
  },
  {
    name: 'AutoTable 3.8.4',
    cdnPath: 'jspdf-autotable/3.8.4/jspdf.plugin.autotable.min.js',
    sha: '384d49194999240dee14e6b9ea5d7bac0837f575'
  }
];
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/';
const MIRROR = 'https://raw.githubusercontent.com/cdnjs/cdnjs/master/ajax/libs/';

function gitBlobSha(bytes) {
  return crypto.createHash('sha1')
    .update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

async function downloadLibrary(spec, fetcher = fetch) {
  const errors = [];
  for (const base of [CDN, MIRROR]) {
    try {
      const response = await fetcher(base + spec.cdnPath, {
        signal: AbortSignal.timeout(20000),
        redirect: 'follow'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length || bytes.length > 2 * 1024 * 1024) {
        throw new Error('Tamano de libreria no valido');
      }
      if (gitBlobSha(bytes) !== spec.sha) {
        throw new Error('El contenido no coincide con la version verificada');
      }
      return bytes;
    } catch (error) {
      errors.push(`${base}: ${error.message}`);
    }
  }
  throw new Error(`${spec.name} no disponible; se cancela la publicacion. ${errors.join(' | ')}`);
}

function smokeTest(core, table) {
  // La UMD se carga sin CommonJS. self proporciona atob/btoa a jsPDF.
  // window se expone despues para que AutoTable aplique su plugin de navegador.
  // No se llama a save(): la prueba no abre ventanas ni escribe presupuestos.
  const scope = {
    console,
    atob: value => Buffer.from(value, 'base64').toString('binary'),
    btoa: value => Buffer.from(value, 'binary').toString('base64')
  };
  scope.self = scope;
  const context = vm.createContext(scope);
  vm.runInContext(core.toString('utf8'), context, { timeout: 10000 });
  context.window = context;
  vm.runInContext(table.toString('utf8'), context, { timeout: 10000 });
  vm.runInContext(`
    if (!self.jspdf || typeof self.jspdf.jsPDF !== 'function' ||
        typeof self.jspdf.jsPDF.API.autoTable !== 'function') {
      throw new Error('jsPDF y AutoTable no estan listos');
    }
    var testDoc = new self.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
    testDoc.text('PDF build check', 14, 15);
    testDoc.autoTable({ head: [['Producto', 'Total']], body: [['TEST', '216.75 EUR']] });
    var testOutput = testDoc.output();
    if (typeof testOutput !== 'string' || !testOutput.startsWith('%PDF-') ||
        !testOutput.includes('%%EOF') || !testDoc.lastAutoTable) {
      throw new Error('La prueba de generacion PDF ha fallado');
    }
  `, context, { timeout: 10000 });
}

function renderIndex(html, scriptTag) {
  const installed = /<script\b[^>]*\bid="hx-pdf-runtime"[^>]*>\s*<\/script>/g;
  const installedCount = [...html.matchAll(installed)].length;
  const tags = LIBRARIES.map(spec => `<script src="${CDN}${spec.cdnPath}"></script>`);
  const counts = tags.map(tag => html.split(tag).length - 1);
  if (installedCount === 1 && counts.every(count => count === 0)) {
    return html.replace(installed, () => scriptTag);
  }
  if (installedCount !== 0 || counts.some(count => count !== 1) ||
      html.indexOf(tags[0]) > html.indexOf(tags[1])) {
    throw new Error('Carga PDF inesperada en index.html; no se modifica la pagina');
  }
  // Solo cambia los dos scripts PDF. Excel, app.js, CSS y todo el HTML se conservan.
  return html.replace(tags[0], () => scriptTag).replace(tags[1], '');
}

async function build(options = {}) {
  const root = options.root || __dirname;
  const libraries = options.libraries || LIBRARIES;
  const fetcher = options.fetcher || fetch;
  const indexPath = path.join(root, 'index.html');
  const html = await fs.readFile(indexPath, 'utf8');
  // Rechaza un HTML inesperado antes de descargar o escribir nada.
  renderIndex(html, '<script id="hx-pdf-runtime"></script>');
  const buffers = [];
  for (const spec of libraries) buffers.push(await downloadLibrary(spec, fetcher));
  smokeTest(buffers[0], buffers[1]);
  // Mantiene las licencias y el orden jsPDF -> AutoTable en un unico script local.
  const runtime = Buffer.concat([
    Buffer.from('/* AjaxCalc: jsPDF 2.5.1 + AutoTable 3.8.4; generado en build. */\n'),
    buffers[0], Buffer.from('\n;\n'), buffers[1], Buffer.from('\n;\n')
  ]);
  new vm.Script(runtime.toString('utf8'));
  const digest = crypto.createHash('sha256').update(runtime).digest('hex').slice(0, 16);
  const filename = `pdf-runtime-${digest}.js`;
  const integrity = crypto.createHash('sha384').update(runtime).digest('base64');
  // Sin async/defer: ambas API estan disponibles antes de ejecutar app.js.
  const tag = `<script id="hx-pdf-runtime" src="./${filename}" integrity="sha384-${integrity}"></script>`;
  const updatedHtml = renderIndex(html, tag);
  await fs.writeFile(path.join(root, filename), runtime);
  // El HTML solo se cambia cuando las DOS librerias y la prueba PDF son correctas.
  await fs.writeFile(indexPath, updatedHtml);
  console.log(`[PDF] OK: ${filename}; jsPDF + AutoTable verificados; PDF de prueba correcto.`);
  return { filename, integrity };
}

module.exports = { LIBRARIES, gitBlobSha, downloadLibrary, smokeTest, renderIndex, build };
if (require.main === module) {
  build().catch(error => {
    console.error(`[PDF] ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}
