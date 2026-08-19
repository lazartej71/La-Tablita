/* ====================================================================
   08-pedido.js
   Pantalla 'Nuevo pedido': elegir cliente (fijo u ocasional), agregar
   platos con guarnición y cantidad (fusiona líneas repetidas), y guardar
   el pedido, que le asigna número de ticket.
   ==================================================================== */

/* ======================= PEDIDO: FORM DINAMICO ======================= */
let buscadorCliente, buscadorPlato;

function renderClienteSelect(){
  if(buscadorCliente){ buscadorCliente.refresh(); return; }
  buscadorCliente = crearBuscador({
    inputId:'clienteBuscador', hiddenId:'clienteFijoId', dropdownId:'clienteDropdown', clearId:'clienteClear',
    maxResults:40,
    getMatches:(q)=>{
      if(!q) return clientes;
      const ql = q.toLowerCase();
      return clientes.filter(c=>c.nombre.toLowerCase().includes(ql) || (c.direccion||'').toLowerCase().includes(ql) || c.codigo.includes(q));
    },
    renderItem:(c)=>({title:`<strong>${escapeHtml(c.nombre)}</strong>`, sub:`${c.codigo} · ${escapeHtml(c.direccion||'sin dirección')}`}),
    onSelect:(c)=>{ document.getElementById('pedidoDireccion').value = c.direccion || ''; },
    onClear:()=>{}
  });
}
function renderMenuSelect(){
  if(buscadorPlato){ buscadorPlato.refresh(); return; }
  buscadorPlato = crearBuscador({
    inputId:'itemPlatoBuscador', hiddenId:'itemPlatoId', dropdownId:'platoDropdown',
    maxResults:40,
    getMatches:(q)=>{
      if(!q) return menu;
      const ql = q.toLowerCase();
      return menu.filter(p=>p.nombre.toLowerCase().includes(ql));
    },
    renderItem:(p)=>({title:`<strong>${escapeHtml(p.nombre)}</strong>`}),
    onSelect:(p)=>actualizarGuarnicionesYPrecio(p.id)
  });
}
function actualizarGuarnicionesYPrecio(platoId){
  platoId = platoId !== undefined ? platoId : document.getElementById('itemPlatoId').value;
  const plato = menu.find(p=>p.id===platoId);
  const selG = document.getElementById('itemGuarnicion');
  selG.innerHTML = '<option value="">Sin guarnición</option>';
  if(guarniciones.length){
    guarniciones.forEach(g=>{
      const op = document.createElement('option'); op.value=g; op.textContent=g; selG.appendChild(op);
    });
  }
  selG.disabled = false;
  document.getElementById('itemPrecio').value = plato ? money(plato.precio) : '';
}

document.querySelectorAll('input[name=tipoCliente]').forEach(r=>{
  r.addEventListener('change', ()=>{
    const esFijo = document.querySelector('input[name=tipoCliente]:checked').value === 'fijo';
    document.getElementById('bloqueFijo').style.display = esFijo ? 'block' : 'none';
    document.getElementById('bloqueOcasional').style.display = esFijo ? 'none' : 'grid';
  });
});

let itemsPedido = [];
function renderItemsPedido(){
  const cont = document.getElementById('itemsAgregados');
  if(itemsPedido.length===0){
    cont.innerHTML = '<p class="muted" style="font-size:0.85rem;">Todavía no agregaste platos a este pedido.</p>';
  }else{
    cont.innerHTML = '';
    itemsPedido.forEach((it, idx)=>{
      const row = document.createElement('div');
      row.className = 'added-item-line';
      row.innerHTML = `<span>${it.cantidad} × ${escapeHtml(it.descripcion)}</span>
        <span style="display:flex; align-items:center; gap:10px;">${money(it.cantidad*it.precio)}
        <button class="btn btn-danger btn-small" data-idx="${idx}">Quitar</button></span>`;
      row.querySelector('button').addEventListener('click', ()=>{
        itemsPedido.splice(idx,1); renderItemsPedido();
      });
      cont.appendChild(row);
    });
  }
  const total = itemsPedido.reduce((s,it)=>s+it.cantidad*it.precio,0);
  document.getElementById('totalPedidoDisplay').textContent = money(total);
}
document.getElementById('btnAgregarItem').addEventListener('click', ()=>{
  const platoId = document.getElementById('itemPlatoId').value;
  const plato = menu.find(p=>p.id===platoId);
  if(!plato){ toast('Buscá y elegí un plato de la lista'); return; }
  const guarnicion = (document.getElementById('itemGuarnicion').value || '').trim();
  const cantidad = Math.max(1, Number(document.getElementById('itemCantidad').value) || 1);
  const descripcion = guarnicion ? `${plato.nombre} con ${guarnicion}` : plato.nombre;
  // Deduplicar por platoId + guarnición (vacía = sin guarnición)
  const existente = itemsPedido.find(it=> it.platoId === plato.id && normalizarTexto(it.guarnicion || '') === normalizarTexto(guarnicion));
  if(existente){
    existente.cantidad += cantidad;
    toast(`Ya tenías "${descripcion}" en el pedido, se sumó la cantidad (ahora ${existente.cantidad})`);
  }else{
    itemsPedido.push({platoId: plato.id, descripcion, guarnicion, cantidad, precio: plato.precio});
  }
  renderItemsPedido();
  document.getElementById('itemCantidad').value = 1;
});

function limpiarFormularioPedido(){
  itemsPedido = [];
  renderItemsPedido();
  document.getElementById('pedidoDireccion').value = '';
  document.getElementById('pedidoNotas').value = '';
  document.getElementById('pedidoHoraEntrega').value = '';
  document.getElementById('ocasionalNombre').value = '';
  document.getElementById('ocasionalTel').value = '';
  buscadorCliente?.limpiar();
  buscadorPlato?.limpiar();
  document.getElementById('itemGuarnicion').innerHTML = '<option value="">Sin guarnición</option>';
  document.getElementById('itemPrecio').value = '';
  document.querySelector('input[name=tipoCliente][value=fijo]').checked = true;
  document.getElementById('bloqueFijo').style.display = 'block';
  document.getElementById('bloqueOcasional').style.display = 'none';
}
document.getElementById('btnLimpiarPedido').addEventListener('click', ()=>{
  confirmar('Cancelar pedido', 'Se va a borrar todo lo cargado en este formulario.', limpiarFormularioPedido);
});

function armarPedidoDesdeForm(){
  const esFijo = document.querySelector('input[name=tipoCliente]:checked').value === 'fijo';
  let clienteNombre, clienteCodigo, clienteId=null;
  if(esFijo){
    const id = document.getElementById('clienteFijoId').value;
    const c = clientes.find(x=>x.id===id);
    if(!c){ toast('Buscá y elegí un cliente de la lista'); return null; }
    clienteNombre = c.nombre; clienteCodigo = c.codigo; clienteId = c.id;
  }else{
    clienteNombre = document.getElementById('ocasionalNombre').value.trim();
    if(!clienteNombre){ toast('Ingresá el nombre del cliente ocasional'); return null; }
    clienteCodigo = '—';
  }
  const direccion = document.getElementById('pedidoDireccion').value.trim();
  if(!direccion){ toast('Ingresá la dirección de entrega'); return null; }
  const horaEntrega = document.getElementById('pedidoHoraEntrega').value;
  const horariosEntregaValidos = ['11:00','11:30','12:00','12:30','13:00','13:30'];
  if(!horariosEntregaValidos.includes(horaEntrega)){ toast('Seleccioná un horario de entrega válido'); return null; }
  if(itemsPedido.length===0){ toast('Agregá al menos un plato al pedido'); return null; }
  const notas = document.getElementById('pedidoNotas').value.trim();
  const total = itemsPedido.reduce((s,it)=>s+it.cantidad*it.precio,0);

  contador++;
  const pedido = {
    id:cryptoId(), ticketNro:String(contador).padStart(8,'0'),
    fecha:hoyISO(), horaCreacion:horaAhora(),
    clienteId, clienteNombre, clienteCodigo, direccion, horaEntrega, notas,
    items: itemsPedido.map(it=>({...it})), total, estado:'pendiente', metodoPago:'efectivo'
  };
  pedidos.push(pedido);
  guardarTodo();
  return pedido;
}

document.getElementById('btnGuardarSolo').addEventListener('click', ()=>{
  const pedido = armarPedidoDesdeForm();
  if(!pedido) return;
  toast(`Pedido #${pedido.ticketNro} guardado`);
  limpiarFormularioPedido();
});
document.getElementById('btnGuardarImprimir').addEventListener('click', ()=>{
  const pedido = armarPedidoDesdeForm();
  if(!pedido) return;
  imprimirTicket(pedido);
  toast(`Pedido #${pedido.ticketNro} guardado e impreso`);
  limpiarFormularioPedido();
});




