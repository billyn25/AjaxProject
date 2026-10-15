# Recientes: comprobación de publicación (15/10/2026)

## Estado: NO publicar esta rama sobre la web sin confirmar el origen del despliegue

Se detectó que la versión publicada y el repositorio proporcionado son diferentes.
`main` permanece en `2b66b242c2eeffce24166d410722600c80320ccf`; no se ha reemplazado producción.

Lectura de los archivos públicos, 15/10/2026 14:39 UTC:

- HTML: HTTP 200.
- JavaScript referenciado: `app.js?v=4.2.38`.
- JavaScript: HTTP 200.
- Predicado `function pmIsRecent(`: ausente.
- Regla `if(pmView.type==='recent')list=list.slice(0,20);`: presente.

La comprobación no consultó ni modificó presupuestos, localStorage del usuario ni MongoDB.
Ejecución: https://github.com/billyn25/AjaxProject/actions/runs/38753328380

Una segunda lectura descargó únicamente HTML y JavaScript públicos y los comparó
con el código original de GitHub. La versión publicada tiene cambios adicionales
en PDF, protección del presupuesto abierto, vista previa y catálogo. No es seguro
publicar el proyecto antiguo entero sobre ella.
Auditoría: https://github.com/billyn25/AjaxProject/actions/runs/38753651569
SHA-256 del JS publicado descargado:
`6929d53271bc05a9b45b2487c6218d7f609a01dfa773457c08e850b427e9147f`.

## Corrección preparada

El filtro directo de esta rama, aplicado al código del repositorio, pasó 8 pruebas
del gestor real en UTC, Europe/Madrid y America/Los_Angeles.
Además se preparó y probó por separado un parche sobre la versión publicada 4.2.38:
8 pruebas por cada una de esas tres zonas; fuera del gestor, el JS conserva exactamente
el contenido publicado. El HTML solo cambia el nombre de la carpeta y la versión de app.js.
Las pruebas usan datos ficticios y un DOM simulado, no un dispositivo físico.

La regla considera hoy y los 29 días anteriores. A 15/10/2026 incluye 16/09/2026–15/10/2026.
Todos conserva el histórico completo. No se cambia ningún documento por su antigüedad.

## Pendiente

Confirmar repositorio, rama y commit del último despliegue de `ajaxcalc` en Netlify,
o la fuente actual si se publica mediante ZIP. Aplicar el parche al proyecto completo
correcto y comprobar el sitio publicado. No subir un ZIP parcial como despliegue completo.
El workflow temporal de diagnóstico se ha retirado de la rama.
