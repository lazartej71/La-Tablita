/* ====================================================================
   05-combobox.js
   Buscador genérico con desplegable (usado para elegir cliente y plato en
   Nuevo pedido). No sabe nada de clientes ni platos: recibe funciones para
   buscar y mostrar resultados, así se puede reutilizar en otros lados.
   ==================================================================== */

/* ======================= BUSCADOR GENERICO (COMBOBOX) ======================= */
// Crea un buscador con dropdown de resultados. options:
// inputId, hiddenId, dropdownId, clearId (opcional), getMatches(query)->array, renderItem(item)->{title, sub},
// onSelect(item), onClear() (opcional), maxResults
function crearBuscador(opts){
  const input = document.getElementById(opts.inputId);
  const hidden = document.getElementById(opts.hiddenId);
  const dropdown = document.getElementById(opts.dropdownId);
  const clearBtn = opts.clearId ? document.getElementById(opts.clearId) : null;
  const field = input.closest('.combo-field');
  let highlighted = -1;
  let currentMatches = [];
  let blurTimeout = null;

  function mostrarResultados(query){
    currentMatches = opts.getMatches(query).slice(0, opts.maxResults || 40);
    highlighted = -1;
    if(currentMatches.length === 0){
      dropdown.innerHTML = `<div class="combo-empty">${query ? 'Sin resultados para "'+escapeHtml(query)+'"' : 'No hay elementos cargados todavía'}</div>`;
    }else{
      dropdown.innerHTML = currentMatches.map((item, idx)=>{
        const r = opts.renderItem(item);
        return `<div class="combo-item" data-idx="${idx}">
          <div>${r.title}</div>
          ${r.sub ? `<div class="combo-sub">${r.sub}</div>` : ''}
        </div>`;
      }).join('');
      dropdown.querySelectorAll('.combo-item').forEach(el=>{
        el.addEventListener('mousedown', (e)=>{
          e.preventDefault();
          seleccionar(currentMatches[Number(el.dataset.idx)]);
        });
      });
    }
    dropdown.classList.add('active');
  }
  function seleccionar(item){
    const r = opts.renderItem(item);
    input.value = r.title.replace(/<[^>]+>/g,'');
    hidden.value = item.id;
    field?.classList.add('has-value');
    dropdown.classList.remove('active');
    opts.onSelect(item);
  }
  function limpiar(){
    input.value = '';
    hidden.value = '';
    field?.classList.remove('has-value');
    if(opts.onClear) opts.onClear();
  }
  input.addEventListener('focus', ()=>{ clearTimeout(blurTimeout); mostrarResultados(input.value.trim()); });
  input.addEventListener('input', ()=>{
    clearTimeout(blurTimeout);
    hidden.value = '';
    field?.classList.remove('has-value');
    mostrarResultados(input.value.trim());
  });
  input.addEventListener('blur', ()=>{ blurTimeout = setTimeout(()=>dropdown.classList.remove('active'), 120); });
  input.addEventListener('keydown', (e)=>{
    if(!dropdown.classList.contains('active')) return;
    const items = dropdown.querySelectorAll('.combo-item');
    if(e.key === 'ArrowDown'){ e.preventDefault(); highlighted = Math.min(highlighted+1, items.length-1); actualizarResaltado(items); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); highlighted = Math.max(highlighted-1, 0); actualizarResaltado(items); }
    else if(e.key === 'Enter'){ e.preventDefault(); if(highlighted>=0 && currentMatches[highlighted]) seleccionar(currentMatches[highlighted]); }
    else if(e.key === 'Escape'){ dropdown.classList.remove('active'); }
  });
  function actualizarResaltado(items){
    items.forEach((el,i)=>el.classList.toggle('highlighted', i===highlighted));
    if(items[highlighted]) items[highlighted].scrollIntoView({block:'nearest'});
  }
  if(clearBtn) clearBtn.addEventListener('click', limpiar);
  return {refresh: ()=>mostrarResultados(input.value.trim()), limpiar};
}

