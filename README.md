COORESUNTOL E.S.P. — Portal GitHub Pages + PQRS por Gmail
Esta versión elimina n8n para la primera etapa. La web se aloja en GitHub Pages y el formulario PQRS usa Google Apps Script como backend, con:
·	Gmail: cooresuntol2803@gmail.com
·	Etiqueta Gmail: PQRS
·	Google Sheets: registro de PQRS
·	Google Drive: adjuntos
·	Consecutivo automático: COO-PQRS-2026-000001
·	Correo de confirmación al ciudadano
1. Estructura
index.html
css/styles.css
js/script.js
img/logo.png
documentos/*.pdf
apps-script/Code.gs

2. GitHub Pages
Si tu usuario de GitHub es cooresuntol, crea un repositorio llamado exactamente cooresuntol.github.io para obtener la URL raíz de GitHub Pages. Sube el contenido de esta carpeta a la rama main.
En GitHub: Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save.
3. Google Sheet
Crea una hoja de cálculo llamada, por ejemplo, COORESUNTOL - PQRS. Copia el ID que aparece entre /d/ y /edit en la URL.
Ejemplo:

https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
En apps-script/Code.gs, reemplaza:

PEGAR_ID_DEL_GOOGLE_SHEET
La pestaña debe llamarse PQRS; setup() crea los encabezados.
4. Google Drive
Crea una carpeta, por ejemplo COORESUNTOL - PQRS - Adjuntos. Copia su ID y reemplaza PEGAR_ID_DE_CARPETA_DRIVE.
5. Apps Script
Abre script.google.com, crea un proyecto, pega Code.gs y guarda.
Ejecuta manualmente setup() una vez y concede permisos para Sheets, Gmail y Drive.
Luego: Deploy → New deployment → Web app.
·	Execute as: Me
·	Who has access: Anyone
Copia la URL /exec.
6. Conectar la página
Abre js/script.js y reemplaza:

PEGAR_AQUI_URL_WEB_APP_APPS_SCRIPT

por la URL /exec de Apps Script.
Sube el cambio a GitHub.
7. Importante sobre adjuntos
El backend acepta un archivo de hasta 8 MB y lo guarda en la carpeta de Drive configurada. Si quieres limitar tipos/tamaños de forma más estricta, cambia accept en el HTML y MAX_FILE_BYTES en Apps Script.
8. Consecutivo
El consecutivo se guarda en Script Properties y se protege con LockService para evitar duplicados cuando llegan dos solicitudes simultáneamente.
Formato:

COO-PQRS-AÑO-000001
El contador reinicia por año.
9. Seguridad y protección de datos
Antes de producción, configura la política de tratamiento de datos y el aviso de privacidad de COORESUNTOL E.S.P. No publiques datos personales en Google Sheets si la hoja queda compartida públicamente. Usa acceso restringido a la cuenta institucional.
10. Prueba
Haz primero una PQRS de prueba con un correo controlado. Verifica:
1.	Consecutivo.
2.	Registro en Sheets.
3.	Correo en cooresuntol2803@gmail.com.
4.	Etiqueta PQRS.
5.	Correo de confirmación al ciudadano.
6.	Archivo en Drive si se adjuntó.
