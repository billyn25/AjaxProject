CÓMO EDITAR EL EXPLORADOR
==========================

Edita solo este archivo:

  explorar_config.js

Para añadir una categoría:

{
  id: 'wifi',
  titulo: 'WiFi / Comunicación',
  icono: '📶',
  subcategorias: [
    { titulo: 'Hubs WiFi', icono: '📶', incluye: ['hub2plus', 'hub plus', 'wifi'] },
    { titulo: '4G / LTE', icono: '📡', incluye: ['4g', 'lte'] }
  ]
}

Para ocultar una categoría o subcategoría:

  visible: false

Para evitar productos no deseados usa excluye:

  { titulo: 'Hubs', incluye: ['hub'], excluye: ['hubkit', 'bracket', 'battery'] }

Campos disponibles:

  titulo    = texto visible
  icono     = emoji
  incluye   = palabras que debe contener la referencia
  excluye   = palabras que no debe contener
  empieza   = la referencia empieza por ese texto
  regex     = avanzado, patrones tipo '^HD\\d+TB'
  visible   = false para ocultar

Importante:
- No edites app.js para cambiar categorías.
- Carga correcta en index.html:

  <script src="explorar_config.js?v=1"></script>
  <script src="app.js?v=18.3"></script>
