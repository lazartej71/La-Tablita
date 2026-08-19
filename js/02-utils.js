/* ====================================================================
   utils.js
   Funciones puras de ayuda: fechas, formato de dinero, texto seguro
   para HTML y normalización de texto/teléfono para comparar duplicados.
   No dependen de datos guardados ni tocan el DOM.
   ==================================================================== */

/* ======================= HELPERS DE FECHA/HORA ======================= */
function hoyISO(){
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function fechaDisplay(iso){
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function horaAhora(){
  const d = new Date();
  return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function money(n){ return '$' + Number(n).toLocaleString('es-AR'); }


/* ======================= HELPERS ======================= */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}


function normalizarTexto(s){ return (s||'').trim().toLowerCase().replace(/\s+/g,' '); }
function normalizarTelefono(s){ return (s||'').replace(/\D/g,''); }
