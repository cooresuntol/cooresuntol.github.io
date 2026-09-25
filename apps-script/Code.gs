/**
 * COORESUNTOL E.S.P. - Sistema PQRS
 * Backend para GitHub Pages usando Google Apps Script + Gmail + Google Sheets + Drive.
 *
 * 1) Crea un Google Sheet y copia su ID en SPREADSHEET_ID.
 * 2) Crea una carpeta de Drive y copia su ID en DRIVE_FOLDER_ID.
 * 3) Ejecuta setup() una vez y autoriza permisos.
 * 4) Implementa como Web App: Ejecutar como tú / acceso: cualquiera.
 */
const CONFIG = {
  DESTINO: 'cooresuntol2803@gmail.com',
  SPREADSHEET_ID: 'PEGAR_ID_DEL_GOOGLE_SHEET',
  DRIVE_FOLDER_ID: 'PEGAR_ID_DE_CARPETA_DRIVE',
  NOMBRE_HOJA: 'PQRS',
  ETIQUETA_GMAIL: 'PQRS',
  PREFIJO: 'COO-PQRS',
  MAX_FILE_BYTES: 8 * 1024 * 1024
};

function setup() {
  if (CONFIG.SPREADSHEET_ID.includes('PEGAR_')) throw new Error('Configura SPREADSHEET_ID primero.');
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sh = ss.getSheetByName(CONFIG.NOMBRE_HOJA) || ss.insertSheet(CONFIG.NOMBRE_HOJA);
  if (sh.getLastRow() === 0) sh.appendRow(['Radicado','Fecha recepción','Tipo','Nombre','Documento','Correo','Celular','Dirección','Barrio','Asunto','Descripción','Estado','Archivo','Autorización']);
  getOrCreateLabel_();
  return 'Configuración inicial completada.';
}

function doGet() {
  return json_({ok:true, service:'COORESUNTOL PQRS', version:'1.0'});
}

function doPost(e) {
  try {
    if (!e || !e.parameter) throw new Error('Solicitud vacía.');
    const p = e.parameter;
    const tipo = clean_(p.tipo), nombre = clean_(p.nombre), correo = clean_(p.correo), asunto = clean_(p.asunto), descripcion = clean_(p.descripcion);
    if (!tipo || !nombre || !correo || !asunto || !descripcion || p.autorizacion !== 'SI') throw new Error('Faltan campos obligatorios o autorización.');
    if (!isEmail_(correo)) throw new Error('Correo electrónico inválido.');

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    let radicado;
    try { radicado = nextRadicado_(); } finally { lock.releaseLock(); }

    const fecha = new Date();
    const fileInfo = saveAttachment_(e, radicado);
    const sh = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.NOMBRE_HOJA);
    sh.appendRow([radicado, fecha, tipo, nombre, clean_(p.documento), correo, clean_(p.celular), clean_(p.direccion), clean_(p.barrio), asunto, descripcion, 'RECIBIDA', fileInfo.url || '', 'SI']);

    const subject = `[PQRS] ${radicado} — ${tipo} — ${asunto}`;
    const body = buildInternalEmail_(radicado, fecha, p, fileInfo);
    GmailApp.sendEmail(CONFIG.DESTINO, subject, body, {name:'COORESUNTOL E.S.P. - PQRS'});
    const sent = GmailApp.search(`to:${CONFIG.DESTINO} subject:"${radicado}"`, 0, 1);
    if (sent.length) sent[0].addLabel(getOrCreateLabel_());

    const userSubject = `COORESUNTOL E.S.P. — Confirmación de PQRS ${radicado}`;
    GmailApp.sendEmail(correo, userSubject, buildUserEmail_(radicado, fecha, p), {name:'COORESUNTOL E.S.P.'});
    return json_({ok:true, radicado:radicado});
  } catch(err) {
    return json_({ok:false, message:err.message || 'Error interno'});
  }
}

function nextRadicado_() {
  const props = PropertiesService.getScriptProperties();
  const year = new Date().getFullYear();
  const key = 'CONSECUTIVO_' + year;
  const n = Number(props.getProperty(key) || 0) + 1;
  props.setProperty(key, String(n));
  return CONFIG.PREFIJO + '-' + year + '-' + String(n).padStart(6,'0');
}
function getOrCreateLabel_(){return GmailApp.getUserLabelByName(CONFIG.ETIQUETA_GMAIL)||GmailApp.createLabel(CONFIG.ETIQUETA_GMAIL);}
function saveAttachment_(e, radicado){
  if(!e.files) return {url:''};
  const keys=Object.keys(e.files); if(!keys.length) return {url:''};
  const blob=e.files[keys[0]]; if(!blob || !blob.getBytes) return {url:''};
  if(blob.getBytes().length>CONFIG.MAX_FILE_BYTES) throw new Error('El archivo supera 8 MB.');
  if(CONFIG.DRIVE_FOLDER_ID.includes('PEGAR_')) return {url:''};
  const folder=DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const file=folder.createFile(blob).setName(radicado+' - '+blob.getName());
  return {url:file.getUrl()};
}
function buildInternalEmail_(radicado, fecha, p, f){return `COORESUNTOL E.S.P.\n\nNUEVA PQRS\n\nRadicado: ${radicado}\nFecha: ${fecha}\nTipo: ${p.tipo}\nNombre: ${p.nombre}\nDocumento: ${p.documento||''}\nCorreo: ${p.correo}\nCelular: ${p.celular||''}\nDirección: ${p.direccion||''}\nBarrio: ${p.barrio||''}\nAsunto: ${p.asunto}\n\nDescripción:\n${p.descripcion}\n\nEstado inicial: RECIBIDA\nAdjunto: ${f.url||'No adjunto'}`;}
function buildUserEmail_(radicado, fecha, p){return `Estimado(a) usuario:\n\nCOORESUNTOL E.S.P. ha recibido correctamente su solicitud.\n\nNúmero de radicado: ${radicado}\nTipo: ${p.tipo}\nAsunto: ${p.asunto}\nFecha de recepción: ${fecha}\nEstado inicial: RECIBIDA\n\nConserve este número para futuras consultas.\n\nCOORESUNTOL E.S.P.\nCra. 5A No. 22-41, Barrio El Carmen, Ibagué, Tolima\n300 262 6977 / 320 209 5031\ncooresuntol2803@gmail.com`;}
function clean_(v){return String(v||'').trim();}
function isEmail_(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
