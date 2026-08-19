/* ====================================================================
   04-app-shell.js
   El 'marco' de la aplicación: navegación entre pestañas, modal de datos
   del negocio (nombre/telefono que salen en el ticket) y backup/restauración
   de toda la información en un archivo .json.
   ==================================================================== */

/* ======================= NAVEGACION DE TABS ======================= */
document.querySelectorAll('nav.tabs button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('view-'+btn.dataset.view).classList.add('active');
    if(btn.dataset.view==='comandas') renderComandas();
    if(btn.dataset.view==='caja') renderCaja();
    if(btn.dataset.view==='clientes') renderClientes();
    if(btn.dataset.view==='menu') renderMenu();
  });
});

/* ======================= CONFIG NEGOCIO ======================= */
function aplicarConfigUI(){
  document.getElementById('negocioNombreDisplay').textContent = config.nombre || 'La Tablita';
}
document.getElementById('btnConfig').addEventListener('click', ()=>{
  document.getElementById('cfgNombre').value = config.nombre || '';
  document.getElementById('cfgTelefono').value = config.telefono || '';
  document.getElementById('modalConfig').classList.add('active');
});
document.getElementById('cfgCancel').addEventListener('click', ()=>document.getElementById('modalConfig').classList.remove('active'));
document.getElementById('cfgGuardar').addEventListener('click', ()=>{
  config.nombre = document.getElementById('cfgNombre').value.trim() || 'La Tablita';
  config.telefono = document.getElementById('cfgTelefono').value.trim();
  guardarTodo(); aplicarConfigUI();
  document.getElementById('modalConfig').classList.remove('active');
  toast('Datos del negocio actualizados');
});

/* ======================= BACKUP / RESTORE ======================= */
document.getElementById('btnExport').addEventListener('click', ()=>{
  const data = {menu, clientes, pedidos, contador, codigoCliente, aperturas, cierres, guarniciones, config, exportadoEl: new Date().toISOString()};
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `vianda-backup-${hoyISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup descargado');
});
document.getElementById('btnImport').addEventListener('click', ()=>document.getElementById('fileImport').click());
document.getElementById('fileImport').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const data = JSON.parse(reader.result);
      confirmar('Restaurar backup', 'Esto reemplaza todos los datos actuales por los del archivo. ¿Continuar?', ()=>{
        menu = data.menu || menu; clientes = data.clientes || clientes; pedidos = data.pedidos || pedidos;
        contador = data.contador || contador; codigoCliente = data.codigoCliente || codigoCliente;
        aperturas = Array.isArray(data.aperturas) ? data.aperturas : [];
        cierres = data.cierres || cierres; guarniciones = Array.isArray(data.guarniciones) ? data.guarniciones : [...new Set((menu.flatMap(p => Array.isArray(p.guarniciones) ? p.guarniciones : [])).concat(['Papas','Puré','Ensalada']))];
        config = data.config || config;
        guardarTodo(); aplicarConfigUI();
        renderClienteSelect(); renderMenuSelect(); renderMenu(); renderClientes(); renderComandas(); renderCaja();
        toast('Backup restaurado');
      });
    }catch(err){ toast('El archivo no es un backup válido'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});
