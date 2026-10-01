const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

const form = document.getElementById('pqrsForm');
const statusBox = document.getElementById('formStatus');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusBox.className = 'form-status';
  statusBox.textContent = 'Enviando su PQRS…';

  const key = form.querySelector('[name="access_key"]')?.value?.trim();
  if (!key || key === 'TU_ACCESS_KEY_AQUI') {
    statusBox.className = 'form-status error';
    statusBox.textContent = 'El formulario todavía no está conectado. Primero coloque la Access Key de Web3Forms en index.html.';
    return;
  }

  const data = new FormData(form);
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    });
    const result = await response.json();
    if (response.ok && result.success) {
      form.reset();
      statusBox.className = 'form-status success';
      statusBox.textContent = '✓ Su PQRS fue enviada correctamente. Gracias por comunicarse con COORESUNTOL E.S.P.';
      window.scrollTo({ top: form.closest('.form-card').offsetTop - 90, behavior: 'smooth' });
    } else {
      throw new Error(result.message || 'No fue posible enviar el formulario.');
    }
  } catch (error) {
    statusBox.className = 'form-status error';
    statusBox.textContent = 'No fue posible enviar la PQRS. Verifique la Access Key y vuelva a intentarlo.';
    console.error(error);
  }
});
