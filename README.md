# Vianda · Gestión diaria

Aplicación web para gestionar el día a día de un emprendimiento de viandas:
menú de platos con guarniciones intercambiables, clientes fijos y ocasionales,
armado de pedidos con impresión de comanda, seguimiento de las comandas del
día, apertura y cierre de caja.

No necesita instalación, servidor ni conexión a internet para funcionar
(salvo la primera vez, para bajar las tipografías). Todos los datos se
guardan en el navegador de la computadora donde se usa.

## Cómo abrirla

Simplemente abrí `index.html` con doble clic, o arrastralo a una pestaña
del navegador. Recomendado: Chrome o Edge.

Para que se sienta como una aplicación de escritorio (sin barra de
direcciones), en Chrome: abrí el archivo, tocá los tres puntitos → *Más
herramientas* → *Crear acceso directo* → tildá *Abrir como ventana*.

## Estructura del proyecto

```
vianda-app/
├── index.html              → esqueleto de la página y los formularios
├── css/
│   └── styles.css          → toda la hoja de estilos
├── js/
│   ├── 01-state.js         → qué se guarda (localStorage) y cómo
│   ├── 02-utils.js         → fechas, formato de dinero, texto seguro, normalización
│   ├── 03-feedback.js      → aviso flotante (toast) y modal de confirmación
│   ├── 04-app-shell.js     → pestañas, datos del negocio, backup / restaurar
│   ├── 05-combobox.js      → buscador genérico con desplegable
│   ├── 06-menu.js          → CRUD de platos del menú
│   ├── 07-clientes.js      → CRUD de clientes fijos
│   ├── 08-pedido.js        → formulario de "Nuevo pedido"
│   ├── 09-ticket.js        → arma e imprime el ticket/comanda
│   ├── 10-comandas.js      → listado de comandas del día
│   ├── 11-caja.js          → apertura/cierre de caja e historial
│   └── 12-init.js          → arranque de la app (se ejecuta al final)
└── README.md
```

Cada archivo de `js/` tiene un comentario arriba explicando su
responsabilidad. Son scripts comunes (no ES Modules), por eso **el orden
en que están listados en `index.html` importa**: cada uno puede usar
funciones y datos definidos en los anteriores. Si agregás un archivo
nuevo, sumalo al final de la lista de `<script>` en `index.html`, o antes
si otros archivos van a depender de él.

## Funcionalidad

- **Menú**: alta, edición y baja de platos, con guarniciones
  intercambiables y precio. No permite nombres repetidos.
- **Clientes**: alta, edición y baja de clientes fijos (nombre,
  dirección, teléfono). No permite nombre y apellido repetidos, ni
  teléfonos repetidos (comparando solo los números, sin importar el
  formato). Buscador para encontrar rápido entre muchos clientes.
- **Nuevo pedido**: elegís un cliente fijo (buscador) o cargás uno
  ocasional al momento, agregás platos con guarnición y cantidad —si
  agregás el mismo plato dos veces, suma la cantidad en vez de duplicar
  la línea—, y generás el ticket con numeración correlativa.
- **Comandas del día**: todos los pedidos de hoy, con botones para
  reimprimir, marcar como entregado o eliminar.
- **Caja (apertura y cierre)**: abrís caja con un botón, ves ventas y
  pedidos del día, y podés volver a abrir/cerrar si hubo un cierre por
  error, dejando registro en el historial de cierres.
- **Backup / Restaurar**: exporta todos los datos a un archivo `.json`
  y permite volver a cargarlos (útil antes de cambiar de computadora o
  por las dudas).

## Dónde viven los datos

Todo se guarda con `localStorage`, es decir, **en el navegador de esa
computadora**. Si abrís la app desde otro dispositivo vas a ver todo
vacío: no es un problema de la app, es que los datos no "viajan" solos.

Por eso:
- Para uso en una sola PC no hace falta subir esto a ningún hosting.
- Hacé un backup de vez en cuando (botón "Backup" arriba a la derecha)
  como respaldo ante un borrado de caché del navegador.

## Cómo modificar o agregar cosas

- **Cambiar colores o tipografías** → `css/styles.css`, variables al
  principio del archivo (`:root { --teal-deep: ...; }`).
- **Agregar un campo a los pedidos** → tocás el formulario en
  `index.html` (sección `Nuevo pedido`) y la lógica en `js/08-pedido.js`.
- **Cambiar el formato del ticket impreso** → `js/09-ticket.js`, función
  `ticketHTML`.
- **Agregar una pestaña nueva** → agregás el botón en `<nav class="tabs">`
  y la sección `<section class="view" id="view-...">` en `index.html`,
  y un archivo `js/13-tu-seccion.js` que la controle (sumalo al final de
  los `<script>` en `index.html`).

## Versionar con Git (opcional)

Si en algún momento querés llevar un historial de cambios:

```bash
cd vianda-app
git init
git add .
git commit -m "Primera versión del proyecto dividido"
```

A partir de ahí, cada cambio importante lo podés guardar con
`git add . && git commit -m "descripción del cambio"`. No hace falta
ningún build ni dependencia: es HTML/CSS/JS plano.
