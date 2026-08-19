/* ====================================================================
   06-menu.js
   Pantalla 'Menú': alta, edición, baja y búsqueda de platos. Valida que
   no se repita el nombre de un plato.
   ==================================================================== */

/* ======================= MENU: CRUD ======================= */
function renderGuarniciones(){
  const list = document.getElementById('listaGuarniciones');
  if(!list) return;
  list.innerHTML = '';
  if(guarniciones.length===0){
    list.innerHTML = '<span class="muted" style="font-size:0.8rem;">Sin guarniciones cargadas todavía.</span>';
    return;
  }
  guarniciones.forEach(g=>{
    const chip = document.createElement('span');
    chip.style.display = 'inline-flex'; chip.style.alignItems = 'center'; chip.style.gap = '6px';
    chip.style.padding = '6px 10px'; chip.style.borderRadius = '999px'; chip.style.background = '#e9f0ee';
    chip.style.color = '#1f3a3d'; chip.style.fontSize = '0.8rem'; chip.style.fontWeight = '600';
    chip.innerHTML = `${escapeHtml(g)} <button type="button" class="btn btn-danger btn-small" data-garnish="${escapeHtml(g)}" style="padding:2px 6px; font-size:0.7rem; border-radius:999px;">×</button>`;
    chip.querySelector('button').addEventListener('click', ()=>{
      const nombre = g.trim();
      guarniciones = guarniciones.filter(x=>x!==nombre);
      guardarTodo(); renderGuarniciones(); renderMenuSelect(); toast('Guarnición eliminada');
    });
    list.appendChild(chip);
  });
}

function renderMenu(){
  const tbody = document.getElementById('tablaMenu');
  const q = (document.getElementById('buscarPlatoTabla')?.value || '').trim().toLowerCase();
  const lista = q ? menu.filter(p=>p.nombre.toLowerCase().includes(q)) : menu;
  tbody.innerHTML = '';
  if(menu.length===0){ tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Todavía no cargaste platos.</td></tr>'; return; }
  if(lista.length===0){ tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Ningún plato coincide con la búsqueda.</td></tr>'; return; }
  lista.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(p.nombre)}</strong></td>
      <td class="muted">${(p.guarniciones && p.guarniciones.length) ? escapeHtml(p.guarniciones.join(', ')) : '—'}</td>
      <td>${money(p.precio)}</td>
      <td style="white-space:nowrap;">
        <button class="btn btn-outline btn-small" data-action="editar">Editar</button>
        <button class="btn btn-danger btn-small" data-action="eliminar" style="margin-left:6px;">Eliminar</button>
      </td>`;
    tr.querySelector('[data-action=editar]').addEventListener('click', ()=>iniciarEdicionPlato(p));
    tr.querySelector('[data-action=eliminar]').addEventListener('click', ()=>{
      confirmar('Eliminar plato', `¿Eliminar "${p.nombre}" del menú?`, ()=>{
        menu = menu.filter(x=>x.id!==p.id); guardarTodo(); renderMenu(); renderMenuSelect();
        if(editingPlatoId===p.id) cancelarEdicionPlato();
        toast('Plato eliminado');
      });
    });
    tbody.appendChild(tr);
  });
}
document.getElementById('buscarPlatoTabla').addEventListener('input', renderMenu);
renderGuarniciones();

let editingPlatoId = null;
function platoNombreDuplicado(nombre, excluirId){
  const n = normalizarTexto(nombre);
  return menu.some(p=>p.id!==excluirId && normalizarTexto(p.nombre)===n);
}
function iniciarEdicionPlato(p){
  editingPlatoId = p.id;
  document.getElementById('platoNombre').value = p.nombre;
  document.getElementById('platoPrecio').value = p.precio;
  document.getElementById('btnAgregarPlato').textContent = 'Guardar cambios';
  document.getElementById('btnCancelarEdicionPlato').style.display = 'inline-block';
  const banner = document.getElementById('platoEditBanner');
  banner.style.display = 'block';
  banner.textContent = `Editando "${p.nombre}"`;
  document.getElementById('platoNombre').scrollIntoView({behavior:'smooth', block:'center'});
  document.getElementById('platoNombre').focus();
}
function cancelarEdicionPlato(){
  editingPlatoId = null;
  document.getElementById('platoNombre').value = '';
  document.getElementById('platoPrecio').value = 7000;
  document.getElementById('btnAgregarPlato').textContent = '+ Agregar plato';
  document.getElementById('btnCancelarEdicionPlato').style.display = 'none';
  document.getElementById('platoEditBanner').style.display = 'none';
}
document.getElementById('btnCancelarEdicionPlato').addEventListener('click', cancelarEdicionPlato);
document.getElementById('btnAgregarGuarnicion').addEventListener('click', ()=>{
  const nombre = document.getElementById('garnishNombre').value.trim();
  if(!nombre){ toast('Poné un nombre de guarnición'); return; }
  if(guarniciones.some(g => normalizarTexto(g) === normalizarTexto(nombre))){ toast('Esa guarnición ya está cargada'); return; }
  guarniciones.push(nombre);
  guardarTodo();
  document.getElementById('garnishNombre').value = '';
  renderGuarniciones(); renderMenuSelect();
  toast('Guarnición agregada');
});
document.getElementById('btnAgregarPlato').addEventListener('click', ()=>{
  const nombre = document.getElementById('platoNombre').value.trim();
  const precio = Number(document.getElementById('platoPrecio').value) || 0;
  if(!nombre){ toast('Poné un nombre de plato'); return; }
  if(platoNombreDuplicado(nombre, editingPlatoId)){ toast('Ya existe un plato con ese nombre en el menú'); return; }

  if(editingPlatoId){
    const p = menu.find(x=>x.id===editingPlatoId);
    p.nombre = nombre; p.precio = precio; p.guarniciones = Array.isArray(p.guarniciones) ? p.guarniciones : [];
    guardarTodo();
    cancelarEdicionPlato();
    renderMenu(); renderMenuSelect();
    toast('Plato actualizado');
  }else{
    menu.push({id:cryptoId(), nombre, guarniciones: [...guarniciones], precio});
    guardarTodo();
    document.getElementById('platoNombre').value='';
    document.getElementById('platoPrecio').value = 7000;
    renderMenu(); renderMenuSelect();
    toast('Plato agregado al menú');
  }
});

