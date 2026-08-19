/* ====================================================================
   11-caja.js
   Pantalla de caja: abrir/cerrar caja, totales de ventas del día y
   el historial de cierres anteriores.
   ==================================================================== */

/* ======================= APERTURA Y CIERRE DE CAJA ======================= */
function ultimaAperturaCaja(){
  return aperturas.length ? aperturas[aperturas.length-1] : null;
}
function ultimoCierreCaja(){
  return cierres.length ? cierres[cierres.length-1] : null;
}
function cajaAbierta(){
  const apertura = ultimaAperturaCaja();
  if(!apertura) return false;
  const cierre = ultimoCierreCaja();
  if(!cierre) return true;

  const aperturaMarca = Number(apertura.marcaTiempo || 0);
  const cierreMarca = Number(cierre.marcaTiempo || 0);
  if(aperturaMarca !== 0 || cierreMarca !== 0) return aperturaMarca > cierreMarca;
  return aperturas.length > cierres.length;
}

function renderCaja(){
  document.getElementById('fechaCajaLabel').textContent = 'Resumen de hoy, ' + fechaDisplay(hoyISO());
  const deHoy = pedidos.filter(p=>p.fecha===hoyISO());
  document.getElementById('cajaCantPedidos').textContent = deHoy.length;
  const totalFacturado = deHoy.reduce((s,p)=>s+p.total,0);
  const estado = document.getElementById('cajaAperturaEstado');
  document.getElementById('cajaTotalFacturado').textContent = money(totalFacturado);

  const apertura = ultimaAperturaCaja();
  const cierre = ultimoCierreCaja();
  if(cajaAbierta() && apertura){
    estado.textContent = `Caja abierta desde ${fechaDisplay(apertura.fecha)} a las ${apertura.horaApertura}.`;
    estado.classList.add('caja-open'); estado.classList.remove('caja-closed');
  }else if(cierre){
    estado.textContent = `Caja cerrada. Último cierre: ${fechaDisplay(cierre.fecha)} a las ${cierre.horaCierre}.`;
    estado.classList.add('caja-closed'); estado.classList.remove('caja-open');
  }else{
    estado.textContent = 'Caja cerrada. Abrila cuando empieces el turno.';
    estado.classList.add('caja-closed'); estado.classList.remove('caja-open');
  }

  const porPlato = {};
  deHoy.forEach(p=>p.items.forEach(it=>{
    if(!porPlato[it.descripcion]) porPlato[it.descripcion] = {cant:0, subtotal:0};
    porPlato[it.descripcion].cant += it.cantidad;
    porPlato[it.descripcion].subtotal += it.cantidad*it.precio;
  }));
  const tbody = document.getElementById('tablaPlatosVendidos');
  tbody.innerHTML = '';
  const claves = Object.keys(porPlato);
  if(claves.length===0){ tbody.innerHTML = '<tr class="empty-row"><td colspan="3">Sin ventas registradas todavía.</td></tr>'; }
  else{
    claves.forEach(k=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(k)}</td><td>${porPlato[k].cant}</td><td>${money(porPlato[k].subtotal)}</td>`;
      tbody.appendChild(tr);
    });
  }

  const tHist = document.getElementById('tablaHistorialCierres');
  tHist.innerHTML = '';
  if(cierres.length===0){ tHist.innerHTML = '<tr class="empty-row"><td colspan="4">Todavía no cerraste ninguna caja.</td></tr>'; }
  else{
    [...cierres].reverse().forEach(c=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${fechaDisplay(c.fecha)}</td><td>${c.cantPedidos}</td><td>${money(c.totalFacturado)}</td><td>${c.horaCierre}</td>`;
      tHist.appendChild(tr);
    });
  }
}
document.getElementById('btnAbrirCaja').addEventListener('click', ()=>{
  confirmar('Abrir caja', 'Se va a registrar una nueva apertura de caja.', ()=>{
    aperturas.push({fecha:hoyISO(), horaApertura:horaAhora(), marcaTiempo:Date.now()});
    guardarTodo();
    renderCaja();
    toast('Apertura de caja registrada');
  });
});
document.getElementById('btnCerrarCaja').addEventListener('click', ()=>{
  if(!cajaAbierta()){ toast('Primero abrí la caja'); return; }

  const deHoy = pedidos.filter(p=>p.fecha===hoyISO());
  const totalFacturado = deHoy.reduce((s,p)=>s+p.total,0);
  confirmar('Cerrar caja', `Vas a registrar el cierre con ${deHoy.length} pedidos y ventas del día por ${money(totalFacturado)}.`, ()=>{
    cierres.push({
      fecha:hoyISO(),
      cantPedidos:deHoy.length,
      totalFacturado,
      horaCierre:horaAhora(),
      marcaTiempo:Date.now()
    });
    guardarTodo();
    renderCaja();
    toast('Caja cerrada correctamente');
  });
});
