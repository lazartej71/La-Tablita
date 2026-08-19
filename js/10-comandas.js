/* ====================================================================
   10-comandas.js
   Pantalla 'Comandas del día': lista los pedidos de hoy con acciones para
   reimprimir, marcar entregado o eliminar.
   ==================================================================== */

/* ======================= COMANDAS DEL DIA ======================= */
function renderComandas(){
  document.getElementById('fechaHoyLabel').textContent = 'Hoy, ' + fechaDisplay(hoyISO());
  const tbody = document.getElementById('tablaComandas');
  tbody.innerHTML = '';
  const deHoy = pedidos.filter(p=>p.fecha===hoyISO()).sort((a,b)=>b.ticketNro.localeCompare(a.ticketNro));
  if(deHoy.length===0){ tbody.innerHTML = '<tr class="empty-row"><td colspan="8">Todavía no hay pedidos hoy.</td></tr>'; return; }
  deHoy.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mono">${p.ticketNro}</td>
      <td>${p.horaCreacion}</td>
      <td><strong>${escapeHtml(p.clienteNombre)}</strong></td>
      <td class="muted">${escapeHtml(p.direccion)}</td>
      <td>${p.horaEntrega}</td>
      <td>${money(p.total)}</td>
      <td><span class="pill pill-${p.estado}">${p.estado==='pendiente'?'Pendiente':'Entregado'}</span></td>
      <td style="white-space:nowrap;">
        <button class="btn btn-outline btn-small" data-action="reprint">Reimprimir</button>
        <button class="btn btn-sage btn-small" data-action="toggle" style="margin-left:6px;">${p.estado==='pendiente'?'Marcar entregado':'Marcar pendiente'}</button>
      </td>`;
    tr.querySelector('[data-action=reprint]').addEventListener('click', ()=>imprimirTicket(p));
    tr.querySelector('[data-action=toggle]').addEventListener('click', ()=>{
      p.estado = p.estado==='pendiente' ? 'entregado' : 'pendiente';
      guardarTodo(); renderComandas();
    });
    tbody.appendChild(tr);
  });
}
document.getElementById('btnRefrescarComandas').addEventListener('click', renderComandas);

