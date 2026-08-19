/* ====================================================================
   09-ticket.js
   Arma el HTML del ticket con el formato de la comanda impresa y dispara
   la impresiÃ³n del navegador. Lo usan tanto Nuevo pedido como Comandas.
   ==================================================================== */

/* ======================= IMPRESION DE TICKET ======================= */
function ticketHTML(p){
  const itemsHtml = p.items.map(it=>`
    <div class="t-item"><span>${it.cantidad}.00</span><span><strong>${escapeHtml(it.descripcion)}</strong></span></div>
    <br>
  `).join('');
  return `
  <div class="ticket-card">
    <div class="t-box">
      <div class="t-shop">${escapeHtml(config.nombre||'La Tablita')}</div>
      <div class="t-tel">${config.telefono ? 'Tel: '+escapeHtml(config.telefono) : ''}</div>
    </div>
    <div class="t-box">
      <div class="t-cliente">${escapeHtml(p.clienteNombre.toUpperCase())}</div>
      <div class="t-direccion">${escapeHtml(p.direccion)}</div>
      <div class="t-hora">Hora: ${p.horaEntrega}</div>
      ${p.notas ? `<div style="margin-top:4px; font-style:italic;">Nota: ${escapeHtml(p.notas)}</div>` : ''}
    </div>
    <div class="t-items-head"><span>Cant.</span><span>Artículo</span></div>
    ${itemsHtml}
    <div class="t-box">
      <div class="t-total"><span>Total:</span><span>${money(p.total)}</span></div>
    </div>
  </div>
  <div class="cut-page" aria-hidden="true"></div>`;
}
function imprimirTicket(p){
  document.getElementById('printArea').innerHTML = ticketHTML(p);
  window.print();
}


