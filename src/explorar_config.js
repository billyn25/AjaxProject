/* =====================================================
   EXPLORAR_CONFIG.JS
   Edita SOLO este archivo para cambiar el explorador.

   MUY FÁCIL:
   - titulo: lo que ves en pantalla.
   - icono: emoji.
   - incluye: palabras que debe contener la referencia.
   - excluye: palabras que NO debe contener.
   - empieza: referencia que empieza por ese texto.
   - regex: patrones avanzados.

   IMPORTANTE:
   En esta versión incluye / empieza / regex / exactos funcionan como O.
   Ejemplo:
   incluye: ['storage'], regex: ['^HD\\d+TB']
   mete productos con storage O referencias tipo HD1TB, HD2TB, HD4TB...
   ===================================================== */

window.EXPLORAR_CATEGORIAS = [
  {
    id: 'intrusion',
    titulo: 'Intrusión',
    icono: '🏠',
    subcategorias: [
      { titulo: 'Hubs', icono: '🏠', incluye: ['aj-hub', 'hub2plus', 'hubbp'], excluye: ['hubkit', 'starterkit', 'bracket', 'battery', 'hubbatt', 'psu', 'dummy', 'repairkit', 'minihub'] },
      { titulo: 'Kits', icono: '📦', incluye: ['hubkit', 'hub2kit', 'starterkit'], excluye: ['repairkit'] },
      { titulo: 'MotionProtect', icono: '🚶', incluye: ['motionprotect', 'outdoorprotect','hood'], excluye: ['dummy', 'lens', 'curtain', 'bracket'] },
      { titulo: 'MotionCam', icono: '📷', incluye: ['motioncam'], excluye: ['dummy', 'lens', 'hood', 'bracket'] },
      { titulo: 'DoorProtect', icono: '🚪', incluye: ['doorprotect'], excluye: ['dummy', 'bracket', 'magnet','lens'] },
      { titulo: 'GlassProtect', icono: '🪟', incluye: ['glassprotect'], excluye: ['dummy', 'bracket'] },
      { titulo: 'Curtain', icono: '🟢', incluye: ['curtainprotect', 'curtainoutdoor', 'dualcurtain', 'curtaincam'], excluye: ['dummy', 'bracket'] },
      { titulo: 'Repetidores', icono: '📡', incluye: ['rex'], excluye: ['psu', 'bracket', 'battery'] },
      { titulo: 'Teclados', icono: '⌨️', incluye: ['keypad'], excluye: ['dummy', 'bracket'] },
      { titulo: 'Sirenas', icono: '📢', incluye: ['homesiren', 'streetsiren'], excluye: ['dummy', 'bracket', 'speakerss'] },
      { titulo: 'Mandos / Botones', icono: '🎛️', incluye: ['spacecontrol', 'button', 'doublebutton','dinholder'], excluye: ['centerbutton', 'sidebutton', 'solobutton', 'dummy']},
      { titulo: 'Enchufes inteligentes', icono: '⚡', incluye: ['socket'], excluye: ['sim', 'cover', 'button'] },
      { titulo: 'Transmisores', icono: '🧠', incluye: ['transmitter', 'uartbridge', 'ocbridge', 'vhfbridge'], excluye: ['dummy', 'bracket', 'case'] },
      { titulo: 'Relés', icono: '⚙️', incluye: ['relay', 'wallswitch', 'multirelay'], excluye: ['dinholder'] },
    ]
  },

  {
    id: 'video',
    titulo: 'Videovigilancia',
    icono: '📷',
    subcategorias: [
      { titulo: 'Bullet', icono: '📷', incluye: ['bulletcam'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'Domo', icono: '📷', incluye: ['domecam'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'Turret', icono: '📷', incluye: ['turretcam'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'IndoorCam', icono: '🏠', incluye: ['indoorcam'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'DoorBell', icono: '🚪', incluye: ['doorbell'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame', 'storage', 'psu', 'pcb'] },
      { titulo: 'NVR', icono: '🎥', incluye: ['nvr'], excluye: ['nvrkit', 'psu', 'storage'] },
      { titulo: 'Kits NVR', icono: '📦', incluye: ['nvrkit'] },
      { titulo: 'Discos HDD / SD', icono: '💽', incluye: ['hd1tb', 'hd2tb', 'hd4tb', 'hd6tb', 'hd8tb', 'hs-tf'], regex: ['^HD\\d+TB', '^HS[-_ ]?TF'] },
      { titulo: 'Soporte Cámaras', icono: '🧰', incluye: ['junctionbox'] },
    ]
  },

  {
    id: 'domotica',
    titulo: 'Domótica',
    icono: '💡',
    subcategorias: [
      { titulo: 'Enchufes inteligentes', icono: '⚡', incluye: ['socket'], excluye: ['sim', 'cover', 'button'] },
      { titulo: 'Interruptores de luz', icono: '💡', incluye: ['lightcore', 'lightswitch'], excluye: ['centerbutton', 'sidebutton', 'solobutton', 'frame', 'cover'] },
      { titulo: 'Botones LightSwitch', icono: '🎛️', incluye: ['centerbutton', 'sidebutton', 'solobutton'] },
      { titulo: 'Bases de enchufe', icono: '🔌', incluye: ['outletcore', 'outletbasic', 'outletlan', 'outlet'], excluye: ['cover', 'socket'] },
      { titulo: 'Tapas enchufe', icono: '🧩', incluye: ['centercover', 'sidecover', 'solocover', 'coverplate', 'bypass-dimmer', 'bypassdimmer'] },
      { titulo: 'Marcos', icono: '🖼️', incluye: ['frame'], excluye: ['case'] },
      { titulo: 'Caja de superficie', icono: '📦', incluye: ['surfacebox'] },
      { titulo: 'Relés', icono: '⚙️', incluye: ['relay', 'wallswitch', 'multirelay'], excluye: ['dinholder'] }
    ]
  },

  {
    id: 'incendio_seguridad',
    titulo: 'Incendio / seguridad',
    icono: '🔥',
    subcategorias: [
      { titulo: 'Detectores', icono: '🔥', incluye: ['fireprotect'], excluye: ['dummy', 'bracket'] },
      { titulo: 'Botón incendio', icono: '🚨', incluye: ['manualcallpoint', 'keymcp'] },
      { titulo: 'Inundación', icono: '💧', incluye: ['leaksprotect', 'inundacion'] },
      { titulo: 'Electroválvula', icono: '🚰', incluye: ['waterstop'] },
      { titulo: 'LifeQuality', icono: '🌡️', incluye: ['lifequality'] }
    ]
  },
  {
  id: 'accesorios',
  titulo: 'Accesorios',
  icono: '🧰',
     subcategorias: [
        {
  titulo: 'Soportes y Brackets',
  icono: '🧰',
  incluye: [
    'bracket',
    'junctionbox',
    'mountcam',
    'hood',
    'holder',
    'magnet',
    'lens',
    'reedswitch'
  ], excluye: ['lens'] },
      { titulo: 'Carcasas / Dummy', icono: '📦', incluye: ['dummy']},
      { titulo: 'Tapas / Covers / Frame', icono: '🧩', incluye: ['cover', 'coverplate', 'frame', 'surfacebox'], excluye: ['coverholder'] },
      { titulo: 'Fuentes / Baterías', icono: '🔋', incluye: ['psu', 'battery', 'hubbatt', 'ac220', 'dc12', 'dc6', 'dc1224', 'internalbattery'], regex: ['^CR123A', '^ER14505', '^CR2032', '^AA$', '^AAA$'], excluye: ['bracket'] },
      { titulo: 'SAI / UPS', icono: '🔌', incluye: ['sai', 'ups'], regex: ['^SAI', '^UPS'] },
      { titulo: 'Tarjetas / Llaveros', icono: '🔐', incluye: ['pass', 'tag', 'keymcp'] },
      { titulo: 'SIM / Antenas', icono: '📶', incluye: ['simslot', 'sim', 'm2m', 'externalantenna'], excluye: ['homesiren', 'streetsiren', 'bracket', 'dummy'] },
      { titulo: 'Recambios', icono: '🧲', incluye: ['magnet', 'reedswitch', 'lens', 'repairkit'], excluye: ['bracket', 'storage'] },
      { titulo: 'Storage / Memorias', icono: '💾', incluye: ['storage', 'hstd', 'hdd', 'microsd', 'micro-sd'], regex: ['^HS[-_ ]?TF', '^HD\\d+TB'], excluye: ['bracket', 'mountcam', 'junctionbox', 'hood', 'cover', 'frame'] },
      { titulo: 'Marketing / Demos', icono: '👕', incluye: ['polo', 'tshirt', 'baseball', 'brandplate', 'cup','totem', 'democase','case','suitcase'] }
    ]
  }
];
