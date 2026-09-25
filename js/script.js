/* CONFIGURACIÓN: reemplaza esta URL por la URL de tu Web App de Google Apps Script. */
const APPS_SCRIPT_URL = 'PEGAR_AQUI_URL_WEB_APP_APPS_SCRIPT';
const form = document.getElementById('pqrsForm');
const status = document.getElementById('formStatus');
const successBox = document.getElementById('successBox');
const btn = document.getElementById('submitBtn');

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('mainNav').classList.toggle('open'));

document.getElementById('mainNav').addEventListener('click',()=>document.getElementById('mainNav').classList.remove('open'));
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  status.textContent=''; successBox.hidden=true;
  if(APPS_SCRIPT_URL.includes('PEGAR_AQUI')){
    status.textContent='El sistema todavía no está conectado. Debes pegar la URL de Google Apps Script en js/script.js.';
    return;
  }
  btn.disabled=true; btn.textContent='Enviando...';
  try{
    const fd=new FormData(form);
    const res=await fetch(APPS_SCRIPT_URL,{method:'POST',body:fd});
    const data=await res.json();
    if(!data.ok) throw new Error(data.message||'No fue posible registrar la PQRS.');
    form.reset();
    successBox.innerHTML=`<strong>PQRS recibida correctamente.</strong><br><br>Su número de radicado es:<br><strong class="radicado">${escapeHtml(data.radicado)}</strong><br><br>Se envió una confirmación al correo indicado. Conserve este número para seguimiento.`;
    successBox.hidden=false; successBox.scrollIntoView({behavior:'smooth',block:'center'});
  }catch(err){status.textContent='No se pudo enviar la solicitud: '+err.message+' Si el problema continúa, comuníquese al 300 262 6977.';}
  finally{btn.disabled=false;btn.textContent='Enviar PQRS';}
});
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
