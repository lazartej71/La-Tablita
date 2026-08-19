/* ====================================================================
   03-feedback.js
   Feedback visual: el aviso flotante (toast) y el modal de confirmación
   que se usan en toda la app antes de guardar o borrar algo.
   ==================================================================== */

/* ======================= TOAST ======================= */
let toastTimer;
function toast(msg){
  const t = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2600);
}

/* ======================= MODAL CONFIRM ======================= */
function confirmar(title, text, onOk){
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalText').textContent = text;
  const bg = document.getElementById('modalConfirm');
  bg.classList.add('active');
  const ok = document.getElementById('modalOk');
  const cancel = document.getElementById('modalCancel');
  function cleanup(){ bg.classList.remove('active'); ok.removeEventListener('click', okHandler); cancel.removeEventListener('click', cancelHandler); }
  function okHandler(){ cleanup(); onOk(); }
  function cancelHandler(){ cleanup(); }
  ok.addEventListener('click', okHandler);
  cancel.addEventListener('click', cancelHandler);
}

