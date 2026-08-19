/* ====================================================================
   07-clientes.js
   Pantalla 'Clientes': alta, edición, baja y búsqueda de clientes fijos.
   Valida que no se repita el nombre y apellido, ni el teléfono.
   ==================================================================== */

/* ======================= CLIENTES: CRUD ======================= */
function renderClientes(){
  const tbody = document.getElementById('tablaClientes');
  const q = (document.getElementById('buscarClienteTabla')?.value || '').trim().toLowerCase();
  const lista = q ? clientes.filter(c=>
    c.nombre.toLowerCase().includes(q) ||
    (c.direccion||'').toLowerCase().includes(q) ||
    c.codigo.includes(q)
  ) : clientes;
  const contadorEl = document.getElementById('contadorClientes');
  if(contadorEl) contadorEl.textContent = `${lista.length} de ${clientes.length} cliente${clientes.length===1?'':'s'}`;
  tbody.innerHTML = '';
  if(clientes.length===0){ tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Todavía no cargaste clientes fijos.</td></tr>'; return; }
  if(lista.length===0){ tbody.innerHTML = '<tr class="empty-row"><td colspan="5">Ningún cliente coincide con la búsqueda.</td></tr>'; return; }
  lista.forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mono muted">${c.codigo}</td>
      <td><strong>${escapeHtml(c.nombre)}</strong></td>
      <td class="muted">${escapeHtml(c.direccion||'—')}</td>
      <td class="muted">${escapeHtml(c.telefono||'—')}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-outline btn-small" data-action="editar">Editar</button>
        <button class="btn btn-danger btn-small" data-action="eliminar" style="margin-left:6px;">Eliminar</button>
      </td>`;
    tr.querySelector('[data-action=editar]').addEventListener('click', ()=>iniciarEdicionCliente(c));
    tr.querySelector('[data-action=eliminar]').addEventListener('click', ()=>{
      confirmar('Eliminar cliente', `¿Eliminar a "${c.nombre}" de clientes fijos?`, ()=>{
        clientes = clientes.filter(x=>x.id!==c.id); guardarTodo(); renderClientes(); renderClienteSelect();
        if(editingClienteId===c.id) cancelarEdicionCliente();
        toast('Cliente eliminado');
      });
    });
    tbody.appendChild(tr);
  });
}
document.getElementById('buscarClienteTabla').addEventListener('input', renderClientes);

let editingClienteId = null;
function clienteNombreDuplicado(nombre, excluirId){
  const n = normalizarTexto(nombre);
  return clientes.some(c=>c.id!==excluirId && normalizarTexto(c.nombre)===n);
}
function clienteTelefonoDuplicado(telefono, excluirId){
  const t = normalizarTelefono(telefono);
  if(!t) return false;
  return clientes.some(c=>c.id!==excluirId && normalizarTelefono(c.telefono)===t);
}
function iniciarEdicionCliente(c){
  editingClienteId = c.id;
  document.getElementById('clienteNombre').value = c.nombre;
  document.getElementById('clienteDireccion').value = c.direccion || '';
  document.getElementById('clienteTelefono').value = c.telefono || '';
  document.getElementById('btnAgregarCliente').textContent = 'Guardar cambios';
  document.getElementById('btnCancelarEdicionCliente').style.display = 'inline-block';
  const banner = document.getElementById('clienteEditBanner');
  banner.style.display = 'block';
  banner.textContent = `Editando a "${c.nombre}" (código ${c.codigo})`;
  document.getElementById('clienteNombre').scrollIntoView({behavior:'smooth', block:'center'});
  document.getElementById('clienteNombre').focus();
}
function cancelarEdicionCliente(){
  editingClienteId = null;
  document.getElementById('clienteNombre').value = '';
  document.getElementById('clienteDireccion').value = '';
  document.getElementById('clienteTelefono').value = '';
  document.getElementById('btnAgregarCliente').textContent = '+ Agregar cliente';
  document.getElementById('btnCancelarEdicionCliente').style.display = 'none';
  document.getElementById('clienteEditBanner').style.display = 'none';
}
document.getElementById('btnCancelarEdicionCliente').addEventListener('click', cancelarEdicionCliente);
document.getElementById('btnAgregarCliente').addEventListener('click', ()=>{
  const nombre = document.getElementById('clienteNombre').value.trim();
  const direccion = document.getElementById('clienteDireccion').value.trim();
  const telefono = document.getElementById('clienteTelefono').value.trim();
  if(!nombre){ toast('Poné el nombre del cliente'); return; }
  if(clienteNombreDuplicado(nombre, editingClienteId)){ toast('Ya existe un cliente cargado con ese nombre y apellido'); return; }
  if(clienteTelefonoDuplicado(telefono, editingClienteId)){ toast('Ese teléfono ya está cargado en otro cliente'); return; }

  if(editingClienteId){
    const c = clientes.find(x=>x.id===editingClienteId);
    c.nombre = nombre; c.direccion = direccion; c.telefono = telefono;
    guardarTodo();
    cancelarEdicionCliente();
    renderClientes(); renderClienteSelect();
    toast('Cliente actualizado');
  }else{
    codigoCliente++;
    clientes.push({id:cryptoId(), codigo:String(codigoCliente).padStart(8,'0'), nombre, direccion, telefono});
    guardarTodo();
    document.getElementById('clienteNombre').value=''; document.getElementById('clienteDireccion').value=''; document.getElementById('clienteTelefono').value='';
    renderClientes(); renderClienteSelect();
    toast('Cliente agregado');
  }
});

