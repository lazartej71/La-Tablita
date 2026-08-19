/* ====================================================================
   01-state.js
   Estado de la aplicación: qué se guarda en localStorage (menú, clientes,
   pedidos, contador de tickets, configuración, aperturas y cierres de caja)
   y las funciones para leerlo/escribirlo. Es lo primero que debe cargarse.
   ==================================================================== */

/* ======================= UTILIDADES DE ALMACENAMIENTO ======================= */
const DB = {
  get(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
};

const KEYS = {
  menu:'vianda_menu', clientes:'vianda_clientes', pedidos:'vianda_pedidos',
  contador:'vianda_ticket_counter', config:'vianda_config', cierres:'vianda_cierres',
  codigoCliente:'vianda_codigo_cliente', aperturas:'vianda_aperturas', guarniciones:'vianda_guarniciones'
};

let menu = DB.get(KEYS.menu, null);
if(!menu){
  menu = [
    {id:cryptoId(), nombre:'Suprema', guarniciones:['Papas','Puré','Ensalada'], precio:8000},

  ];
  DB.set(KEYS.menu, menu);
}
let guarniciones = DB.get(KEYS.guarniciones, []);
if(!Array.isArray(guarniciones) || guarniciones.length===0){
  const derivadas = menu.flatMap(p => Array.isArray(p.guarniciones) ? p.guarniciones : []);
  guarniciones = [...new Set(derivadas.length ? derivadas : ['Papas','Puré','Ensalada'])];
  DB.set(KEYS.guarniciones, guarniciones);
}
let clientes = DB.get(KEYS.clientes, []);
let pedidos = DB.get(KEYS.pedidos, []);
let contador = DB.get(KEYS.contador, 0);
let codigoCliente = DB.get(KEYS.codigoCliente, 1000048);
let aperturas = DB.get(KEYS.aperturas, []);
let cierres = DB.get(KEYS.cierres, []);
let config = DB.get(KEYS.config, {nombre:'La Tablita', telefono:''});

function cryptoId(){ return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
function guardarTodo(){
  DB.set(KEYS.menu, menu); DB.set(KEYS.clientes, clientes); DB.set(KEYS.pedidos, pedidos);
  DB.set(KEYS.contador, contador); DB.set(KEYS.codigoCliente, codigoCliente);
  DB.set(KEYS.aperturas, aperturas); DB.set(KEYS.cierres, cierres); DB.set(KEYS.guarniciones, guarniciones); DB.set(KEYS.config, config);
}
