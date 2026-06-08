const BACKEND_URL = "https://duo-liner-backend.onrender.com";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const cursor = document.getElementById("inkCursor");
const stamp = document.getElementById("stampObject");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

if (cursor) {
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
}

if (stamp) {
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * -10;
    stamp.style.rotate = `${y}deg ${x}deg`;
  });
}

let mongoDB = {
  clientes: [],
  pedidos: [],
  pagos: [],
  cotizaciones: [],
  usuarios: []
};

function getDB() {
  return mongoDB;
}

function money(n) {
  return "Q" + Number(n || 0).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateStr, days) {
  const d = new Date((dateStr || todayISO()).slice(0, 10) + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysSince(dateStr) {
  if (!dateStr) return 0;
  const start = new Date(String(dateStr).slice(0, 10) + "T00:00:00");
  return Math.max(0, Math.floor((new Date() - start) / 86400000));
}

function pedidoDescripcion(p) {
  return p.descripcion || p.producto || "-";
}

function pedidoTotal(p) {
  return Number(p.total_factura ?? p.total ?? 0);
}

function pedidoPrecio(p) {
  return Number(p.precio ?? 0);
}

function hideLoading() {
  const el = document.getElementById("loadingOverlay");
  if (el) el.style.display = "none";
}

function showLoading() {
  const el = document.getElementById("loadingOverlay");
  if (el) el.style.display = "flex";
}

async function apiGet(path) {
  const r = await fetch(`${BACKEND_URL}${path}`);
  if (!r.ok) throw new Error(path);
  return r.json();
}

async function apiPost(path, data) {
  const r = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error(path);
  return r.json();
}

async function apiPut(path, data) {
  const r = await fetch(`${BACKEND_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error(path);
  return r.json();
}

async function apiDelete(path) {
  const r = await fetch(`${BACKEND_URL}${path}`, { method: "DELETE" });
  if (!r.ok) throw new Error(path);
  return r.json();
}


function getToken(){
  return localStorage.getItem("duoliner_token") || "";
}

function getCurrentUser(){
  try{
    return JSON.parse(localStorage.getItem("duoliner_user") || "{}");
  }catch(e){
    return {};
  }
}

function authHeaders(){
  const token = getToken();
  return token ? {"Authorization": "Bearer " + token} : {};
}

async function secureApiGet(path){
  const r = await fetch(`${BACKEND_URL}${path}`, {headers: authHeaders()});
  if(!r.ok) throw new Error(path + " " + r.status);
  return r.json();
}

async function secureApiPost(path, data){
  const r = await fetch(`${BACKEND_URL}${path}`, {
    method:"POST",
    headers: {"Content-Type":"application/json", ...authHeaders()},
    body: JSON.stringify(data)
  });
  if(!r.ok){
    let msg = "Error " + r.status;
    try{ const e = await r.json(); msg = e.detail || msg; }catch(_){}
    throw new Error(msg);
  }
  return r.json();
}

async function secureApiPut(path, data){
  const r = await fetch(`${BACKEND_URL}${path}`, {
    method:"PUT",
    headers: {"Content-Type":"application/json", ...authHeaders()},
    body: JSON.stringify(data)
  });
  if(!r.ok){
    let msg = "Error " + r.status;
    try{ const e = await r.json(); msg = e.detail || msg; }catch(_){}
    throw new Error(msg);
  }
  return r.json();
}

async function secureApiDelete(path){
  const r = await fetch(`${BACKEND_URL}${path}`, {
    method:"DELETE",
    headers: authHeaders()
  });
  if(!r.ok){
    let msg = "Error " + r.status;
    try{ const e = await r.json(); msg = e.detail || msg; }catch(_){}
    throw new Error(msg);
  }
  return r.json();
}

/* LANDING FORM */
const quoteForm = document.getElementById("quoteForm");

if (quoteForm) {
  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("qName")?.value.trim() || "";
    const company = document.getElementById("qCompany")?.value.trim() || "";
    const phone = document.getElementById("qPhone")?.value.trim() || "";
    const product = document.getElementById("qProduct")?.value || "";
    const message = document.getElementById("qMessage")?.value.trim() || "";

    if (!name || !phone) {
      alert("Por favor ingresa nombre y teléfono.");
      return;
    }

    try {
      await apiPost("/cotizaciones", {
        cliente: name,
        empresa: company,
        telefono: phone,
        descripcion: product,
        mensaje: message,
        origen: "web-duo-liner",
        fecha: todayISO(),
        estado: "Pendiente"
      });

      alert("Cotización enviada correctamente.");

      const text =
        `Hola DUO-LINER, deseo solicitar una cotización.%0A%0A` +
        `Nombre: ${encodeURIComponent(name)}%0A` +
        `Empresa: ${encodeURIComponent(company)}%0A` +
        `Teléfono: ${encodeURIComponent(phone)}%0A` +
        `Producto: ${encodeURIComponent(product)}%0A` +
        `Detalle: ${encodeURIComponent(message)}`;

      window.open(`https://wa.me/50258544448?text=${text}`, "_blank");
      quoteForm.reset();
    } catch (error) {
      console.error(error);
      alert("No fue posible enviar la cotización.");
    }
  });
}

/* LOAD DATA */
async function cargarMongoDB() {
  showLoading();

  try {
    const [clientes, pedidos, pagos, cotizaciones] = await Promise.all([
      apiGet("/clientes"),
      apiGet("/pedidos"),
      apiGet("/pagos"),
      apiGet("/cotizaciones")
    ]);

    let usuarios = [];
    if (getToken()) {
      try { usuarios = await secureApiGet("/usuarios"); } catch (e) { usuarios = []; }
    }

    mongoDB = {
      clientes,
      pedidos,
      pagos,
      cotizaciones,
      usuarios
    };

    renderAll();
  } catch (error) {
    console.error("Error cargando MongoDB:", error);
    alert("No fue posible cargar la información. Render puede estar despertando; intenta de nuevo en unos segundos.");
  } finally {
    hideLoading();
  }
}

/* AUTH */
async function login() {
  const user = document.getElementById("user")?.value.trim();
  const pass = document.getElementById("pass")?.value.trim();

  try {
    const r = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({usuario: user, password: pass})
    });

    if (!r.ok) {
      const error = document.getElementById("error");
      if (error) error.textContent = "Usuario o contraseña incorrectos.";
      return;
    }

    const data = await r.json();
    localStorage.setItem("duoliner_session", "ok");
    localStorage.setItem("duoliner_token", data.access_token || "");
    localStorage.setItem("duoliner_user", JSON.stringify({
      usuario: data.usuario,
      nombre: data.nombre,
      rol: data.rol
    }));

    location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
    const errorEl = document.getElementById("error");
    if (errorEl) errorEl.textContent = "No se pudo conectar con el servidor.";
  }
}

function checkAuth() {
  if (location.pathname.includes("dashboard") && !getToken()) {
    location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("duoliner_session");
  localStorage.removeItem("duoliner_token");
  localStorage.removeItem("duoliner_user");
  location.href = "login.html";
}

function showView(name, button) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
  const view = document.getElementById("view-" + name);
  if (view) view.classList.remove("hidden");

  document.querySelectorAll(".side-link").forEach((b) => b.classList.remove("active"));
  if (button) button.classList.add("active");

  renderAll();
}

/* COMMON HELPERS */
function clienteName(id) {
  const db = getDB();
  return (db.clientes.find((c) => c.id === id) || {}).nombre || "Sin cliente";
}

function clienteDireccion(id) {
  const db = getDB();
  return (db.clientes.find((c) => c.id === id) || {}).direccion || "-";
}

function pedidoName(id) {
  const db = getDB();
  const p = db.pedidos.find((x) => x.id === id);
  return p ? `${pedidoDescripcion(p)} - ${money(pedidoTotal(p))}` : "Sin pedido";
}

function pagosDePedido(pedidoId) {
  const db = getDB();
  return db.pagos
    .filter((p) => p.pedido_id === pedidoId)
    .reduce((a, p) => a + Number(p.monto || 0), 0);
}

function saldoPedido(p) {
  return pedidoTotal(p) - pagosDePedido(p.id);
}

function saldoCliente(clienteId) {
  const db = getDB();
  return db.pedidos
    .filter((p) => p.cliente_id === clienteId && p.estado !== "Cancelado")
    .reduce((a, p) => a + saldoPedido(p), 0);
}

/* CLIENTES */
async function addCliente() {
  const nombre = document.getElementById("clienteNombre").value.trim();
  if (!nombre) return alert("Ingresa el nombre del cliente.");

  const nit = document.getElementById("clienteNit").value.trim();
  const existe = getDB().clientes.some(
    (c) => (nit && c.nit === nit) || (c.nombre || "").toLowerCase() === nombre.toLowerCase()
  );

  if (existe) return alert("Este cliente ya existe en la base de datos.");

  try {
    await apiPost("/clientes", {
      nombre,
      nit,
      telefono: document.getElementById("clienteTelefono").value.trim(),
      correo: document.getElementById("clienteCorreo").value.trim(),
      direccion: document.getElementById("clienteDireccion").value.trim(),
      fecha: todayISO()
    });

    ["clienteNombre", "clienteNit", "clienteTelefono", "clienteCorreo", "clienteDireccion"].forEach((id) => {
      document.getElementById(id).value = "";
    });

    await cargarMongoDB();
    alert("Cliente guardado en MongoDB.");
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el cliente.");
  }
}

async function deleteCliente(id) {
  if (!confirm("¿Eliminar cliente? También se eliminarán sus pedidos y pagos.")) return;

  try {
    await apiDelete(`/clientes/${id}`);
    await cargarMongoDB();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el cliente.");
  }
}

/* PEDIDOS */
async function addPedido() {
  const cliente_id = document.getElementById("pedidoCliente").value;
  if (!cliente_id) return alert("Primero crea un cliente.");

  const descripcion = document.getElementById("pedidoDescripcion").value.trim();
  if (!descripcion) return alert("Ingresa la descripción.");

  const cantidad = Number(document.getElementById("pedidoCantidad").value || 0);
  const precio = Number(document.getElementById("pedidoPrecio").value || 0);
  let total_factura = Number(document.getElementById("pedidoTotalFactura").value || 0);

  if (!total_factura && cantidad && precio) total_factura = cantidad * precio;

  try {
    await apiPost("/pedidos", {
      cliente_id,
      fecha: document.getElementById("pedidoFecha").value || todayISO(),
      cantidad,
      descripcion,
      producto: descripcion,
      precio,
      total_factura,
      total: total_factura,
      estado: document.getElementById("pedidoEstado").value
    });

    ["pedidoFecha", "pedidoCantidad", "pedidoDescripcion", "pedidoPrecio", "pedidoTotalFactura"].forEach((id) => {
      document.getElementById(id).value = "";
    });

    await cargarMongoDB();
    alert("Pedido guardado en MongoDB.");
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el pedido.");
  }
}

async function updateEstado(id, estado) {
  try {
    await apiPut(`/pedidos/${id}`, { estado });
    await cargarMongoDB();
  } catch (error) {
    console.error(error);
    alert("No se pudo actualizar el estado.");
  }
}

async function deletePedido(id) {
  if (!confirm("¿Eliminar pedido?")) return;

  try {
    await apiDelete(`/pedidos/${id}`);
    await cargarMongoDB();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el pedido.");
  }
}

/* PAGOS */
async function addPago() {
  const cliente_id = document.getElementById("pagoCliente").value;
  const pedido_id = document.getElementById("pagoPedido").value;
  const monto = Number(document.getElementById("pagoMonto").value || 0);

  if (!cliente_id || !pedido_id || monto <= 0) {
    return alert("Selecciona cliente, pedido y monto.");
  }

  try {
    await apiPost("/pagos", {
      cliente_id,
      pedido_id,
      fecha: todayISO(),
      monto,
      metodo: document.getElementById("pagoMetodo").value.trim(),
      referencia: document.getElementById("pagoReferencia").value.trim()
    });

    ["pagoMonto", "pagoMetodo", "pagoReferencia"].forEach((id) => {
      document.getElementById(id).value = "";
    });

    await cargarMongoDB();
    alert("Pago guardado en MongoDB.");
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el pago.");
  }
}

async function deletePago(id) {
  if (!confirm("¿Eliminar pago?")) return;

  try {
    await apiDelete(`/pagos/${id}`);
    await cargarMongoDB();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el pago.");
  }
}

/* COTIZACIONES */
function cotClienteValue(c) {
  return c.cliente || c.nombre || c.empresa || "-";
}

function cotDireccionValue(c) {
  return c.direccion || "-";
}

function cotDescripcionValue(c) {
  return c.descripcion || c.producto || c.mensaje || "-";
}

function cotTotalValue(c) {
  return Number(c.total || 0);
}

function cotIvaTexto(c) {
  if (c.leyenda_iva) return c.leyenda_iva;
  return c.iva_incluido === false ? "Precio no incluye IVA" : "Precio incluye IVA";
}

function calcularTotalCotizacion() {
  const cantidad = Number(document.getElementById("cotCantidad")?.value || 0);
  const precio = Number(document.getElementById("cotPrecio")?.value || 0);
  const total = cantidad * precio;
  const el = document.getElementById("cotTotal");
  if (el) el.value = total.toFixed(2);
}

async function addCotizacion() {
  const cliente = document.getElementById("cotCliente").value.trim();
  const direccion = document.getElementById("cotDireccion").value.trim();
  const cantidad = Number(document.getElementById("cotCantidad").value || 0);
  const descripcion = document.getElementById("cotDescripcion").value.trim();
  const precio = Number(document.getElementById("cotPrecio").value || 0);
  const iva = document.getElementById("cotIva").value === "si";
  const estado = document.getElementById("cotEstado").value;
  const observaciones = document.getElementById("cotObservaciones").value.trim();

  if (!cliente || !descripcion || cantidad <= 0 || precio <= 0) {
    return alert("Completa cliente, cantidad, descripción y precio.");
  }

  const total = cantidad * precio;

  try {
    await apiPost("/cotizaciones", {
      fecha: todayISO(),
      vigencia_dias: 15,
      cliente,
      direccion,
      cantidad,
      descripcion,
      precio,
      total,
      iva_incluido: iva,
      leyenda_iva: iva ? "Precio incluye IVA" : "Precio no incluye IVA",
      observaciones,
      estado,
      origen: "portal"
    });

    ["cotCliente", "cotDireccion", "cotCantidad", "cotDescripcion", "cotPrecio", "cotTotal", "cotObservaciones"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    document.getElementById("cotIva").value = "si";
    document.getElementById("cotEstado").value = "Pendiente";

    await cargarMongoDB();
    alert("Cotización guardada.");
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar la cotización.");
  }
}

async function updateCotEstado(id, estado) {
  try {
    await apiPut(`/cotizaciones/${id}`, { estado });
    await cargarMongoDB();
  } catch (error) {
    console.error(error);
    alert("No se pudo actualizar la cotización.");
  }
}

async function deleteCotizacion(id) {
  if (!confirm("¿Eliminar cotización?")) return;

  try {
    await apiDelete(`/cotizaciones/${id}`);
    await cargarMongoDB();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar la cotización.");
  }
}

async function convertirCotizacionAPedido(id) {
  const cot = getDB().cotizaciones.find((c) => c.id === id);
  if (!cot) return alert("Cotización no encontrada.");

  let cliente = getDB().clientes.find(
    (c) => (c.nombre || "").toLowerCase() === String(cotClienteValue(cot)).toLowerCase()
  );

  try {
    if (!cliente) {
      const nuevo = await apiPost("/clientes", {
        nombre: cotClienteValue(cot),
        direccion: cotDireccionValue(cot),
        fecha: todayISO()
      });

      cliente = {
        id: nuevo.id,
        nombre: cotClienteValue(cot),
        direccion: cotDireccionValue(cot)
      };
    }

    await apiPost("/pedidos", {
      cliente_id: cliente.id,
      fecha: todayISO(),
      cantidad: Number(cot.cantidad || 0),
      descripcion: cotDescripcionValue(cot),
      producto: cotDescripcionValue(cot),
      precio: Number(cot.precio || 0),
      total_factura: cotTotalValue(cot),
      total: cotTotalValue(cot),
      estado: "Nuevo",
      origen: "cotizacion",
      cotizacion_id: id
    });

    await apiPut(`/cotizaciones/${id}`, { estado: "Convertida a pedido" });
    await cargarMongoDB();
    alert("Cotización convertida a pedido.");
  } catch (error) {
    console.error(error);
    alert("No se pudo convertir a pedido.");
  }
}

function obtenerCotizacionesFiltradas() {
  const db = getDB();
  const fCliente = (document.getElementById("filtroCotCliente")?.value || "").toLowerCase().trim();
  const fIni = document.getElementById("filtroCotFechaInicio")?.value || "";
  const fFin = document.getElementById("filtroCotFechaFin")?.value || "";
  const fEstado = document.getElementById("filtroCotEstado")?.value || "";

  return db.cotizaciones.filter((c) => {
    const cliente = cotClienteValue(c).toLowerCase();
    const fecha = String(c.fecha || c.fecha_creacion || "").slice(0, 10);
    const estado = c.estado || "";
    return (!fCliente || cliente.includes(fCliente)) &&
      (!fIni || fecha >= fIni) &&
      (!fFin || fecha <= fFin) &&
      (!fEstado || estado === fEstado);
  });
}

function limpiarFiltrosCotizaciones() {
  ["filtroCotCliente", "filtroCotFechaInicio", "filtroCotFechaFin", "filtroCotEstado"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  renderAll();
}

function printCotizacion(id) {
  const cot = getDB().cotizaciones.find((c) => c.id === id);
  if (!cot) return;

  const fecha = String(cot.fecha || cot.fecha_creacion || todayISO()).slice(0, 10);
  const vigencia = cot.vigencia_hasta || addDaysISO(fecha, 15);
  const numero = cot.numero || "COT-" + String(cot.id || "").slice(-6).toUpperCase();

  const html = `<!DOCTYPE html>
<html>
<head>
<title>${numero}</title>
<style>
body{font-family:Arial,sans-serif;color:#05070a;margin:0;padding:38px;background:#fff}
.page{max-width:850px;margin:auto}
.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #22539b;padding-bottom:18px}
.logo{width:260px}
.title{text-align:right}
.title h1{margin:0;font-size:34px;letter-spacing:.08em}
.title strong{color:#22539b}
.box{border:1px solid #d8dce3;padding:14px;margin-top:22px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.label{font-size:12px;text-transform:uppercase;color:#5f6673;font-weight:bold}
table{width:100%;border-collapse:collapse;margin-top:22px}
th{background:#05070a;color:#fff;text-align:left;padding:12px;font-size:12px;text-transform:uppercase}
td{border-bottom:1px solid #ddd;padding:12px}
.total{text-align:right;font-size:24px;font-weight:bold;margin-top:18px}
.note{margin-top:20px;padding:12px;border-left:5px solid #22539b;background:#f3f6fb}
.footer{margin-top:40px;font-size:12px;color:#5f6673;border-top:1px solid #ddd;padding-top:12px}
@media print{button{display:none}}
</style>
</head>
<body>
<div class="page">
  <div class="head">
    <img class="logo" src="assets/logo-duo-liner.png">
    <div class="title">
      <h1>COTIZACIÓN</h1>
      <strong>${numero}</strong><br>
      Fecha: ${fecha}<br>
      Vigencia: ${vigencia}
    </div>
  </div>

  <div class="box grid">
    <div><div class="label">Cliente</div><b>${cotClienteValue(cot)}</b></div>
    <div><div class="label">Dirección</div>${cotDireccionValue(cot)}</div>
  </div>

  <table>
    <tr><th>Cantidad</th><th>Descripción</th><th>Precio unitario</th><th>Total</th></tr>
    <tr>
      <td>${cot.cantidad || 0}</td>
      <td>${cotDescripcionValue(cot)}</td>
      <td>${money(cot.precio || 0)}</td>
      <td><b>${money(cotTotalValue(cot))}</b></td>
    </tr>
  </table>

  <div class="total">TOTAL: ${money(cotTotalValue(cot))}</div>

  <div class="note">
    <b>${cotIvaTexto(cot)}</b><br>
    Vigencia de oferta: 15 días. ${cot.observaciones || ""}
  </div>

  <div class="footer">
    DUO-LINER · +502 5854 4448 · gerencia@duo-liner.com · CA-9 Ruta al Atlántico 26-09 zona 18 Int. 5 Bodega 4. Guatemala, C.A.
  </div>
</div>
<script>window.onload=function(){window.print()}</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

/* FILTERS */
function obtenerPedidosFiltrados() {
  const db = getDB();
  const filtroCliente = (document.getElementById("filtroClientePedido")?.value || "").toLowerCase().trim();
  const filtroInicio = document.getElementById("filtroFechaInicio")?.value || "";
  const filtroFin = document.getElementById("filtroFechaFin")?.value || "";
  const filtroEstado = document.getElementById("filtroEstadoPedido")?.value || "";

  return db.pedidos.filter((p) => {
    const nombreCliente = clienteName(p.cliente_id).toLowerCase();
    const fechaPedido = String(p.fecha || "").slice(0, 10);
    const estadoPedido = p.estado || "";
    return (!filtroCliente || nombreCliente.includes(filtroCliente)) &&
      (!filtroInicio || fechaPedido >= filtroInicio) &&
      (!filtroFin || fechaPedido <= filtroFin) &&
      (!filtroEstado || estadoPedido === filtroEstado);
  });
}

function limpiarFiltrosPedidos() {
  ["filtroClientePedido", "filtroFechaInicio", "filtroFechaFin", "filtroEstadoPedido"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  renderAll();
}

function obtenerPagosFiltrados() {
  const db = getDB();
  const filtroCliente = (document.getElementById("filtroClientePago")?.value || "").toLowerCase().trim();
  const filtroInicio = document.getElementById("filtroPagoFechaInicio")?.value || "";
  const filtroFin = document.getElementById("filtroPagoFechaFin")?.value || "";
  const filtroMetodo = (document.getElementById("filtroMetodoPago")?.value || "").toLowerCase().trim();
  const filtroReferencia = (document.getElementById("filtroReferenciaPago")?.value || "").toLowerCase().trim();

  return db.pagos.filter((p) => {
    const nombreCliente = clienteName(p.cliente_id).toLowerCase();
    const fechaPago = String(p.fecha || "").slice(0, 10);
    const metodoPago = String(p.metodo || "").toLowerCase();
    const referenciaPago = String(p.referencia || "").toLowerCase();

    return (!filtroCliente || nombreCliente.includes(filtroCliente)) &&
      (!filtroInicio || fechaPago >= filtroInicio) &&
      (!filtroFin || fechaPago <= filtroFin) &&
      (!filtroMetodo || metodoPago === filtroMetodo) &&
      (!filtroReferencia || referenciaPago.includes(filtroReferencia));
  });
}

function limpiarFiltrosPagos() {
  ["filtroClientePago", "filtroPagoFechaInicio", "filtroPagoFechaFin", "filtroMetodoPago", "filtroReferenciaPago"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  renderAll();
}

function ultimoPagoCliente(clienteId) {
  const pagos = getDB().pagos.filter((p) => p.cliente_id === clienteId);
  if (!pagos.length) return "-";
  return pagos.sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")))[0].fecha || "-";
}

function toggleCuentaCliente(clienteId) {
  const fila = document.getElementById("detalle-cuenta-" + clienteId);
  if (fila) fila.classList.toggle("hidden");
}


/* USUARIOS */
async function addUsuario(){
  const nombre = document.getElementById("usuarioNombre")?.value.trim() || "";
  const usuario = document.getElementById("usuarioUsuario")?.value.trim().toLowerCase() || "";
  const password = document.getElementById("usuarioPassword")?.value || "";
  const rol = document.getElementById("usuarioRol")?.value || "usuario";
  const activo = (document.getElementById("usuarioActivo")?.value || "true") === "true";

  if(!usuario || !password){
    return alert("Ingresa usuario y contraseña.");
  }

  if(password.length < 8){
    return alert("La contraseña debe tener mínimo 8 caracteres.");
  }

  try{
    await secureApiPost("/usuarios", {nombre, usuario, password, rol, activo});
    ["usuarioNombre","usuarioUsuario","usuarioPassword"].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.value = "";
    });
    await cargarMongoDB();
    alert("Usuario creado correctamente.");
  }catch(error){
    console.error(error);
    alert(error.message || "No se pudo crear el usuario.");
  }
}

async function updateUsuario(id, field, value){
  try{
    const data = {};
    if(field === "rol") data.rol = value;
    if(field === "activo") data.activo = value === "true";
    await secureApiPut(`/usuarios/${id}`, data);
    await cargarMongoDB();
  }catch(error){
    console.error(error);
    alert(error.message || "No se pudo actualizar el usuario.");
  }
}

async function resetUsuarioPassword(id){
  const nueva = prompt("Nueva contraseña para este usuario (mínimo 8 caracteres):");
  if(!nueva) return;
  if(nueva.length < 8) return alert("La contraseña debe tener mínimo 8 caracteres.");

  try{
    await secureApiPut(`/usuarios/${id}`, {password: nueva});
    alert("Contraseña actualizada.");
  }catch(error){
    console.error(error);
    alert(error.message || "No se pudo actualizar la contraseña.");
  }
}

async function deleteUsuario(id){
  if(!confirm("¿Desactivar este usuario?")) return;
  try{
    await secureApiDelete(`/usuarios/${id}`);
    await cargarMongoDB();
  }catch(error){
    console.error(error);
    alert(error.message || "No se pudo desactivar el usuario.");
  }
}

async function activarUsuario(id){
  try{
    await secureApiPut(`/usuarios/${id}/activar`, {});
    await cargarMongoDB();
  }catch(error){
    console.error(error);
    alert(error.message || "No se pudo activar el usuario.");
  }
}

async function cambiarMiPassword(){
  const actual = document.getElementById("miPasswordActual")?.value || "";
  const nueva = document.getElementById("miPasswordNueva")?.value || "";

  if(!actual || !nueva) return alert("Ingresa contraseña actual y nueva.");
  if(nueva.length < 8) return alert("La nueva contraseña debe tener mínimo 8 caracteres.");

  try{
    await secureApiPut("/auth/cambiar-password", {actual, nueva});
    document.getElementById("miPasswordActual").value = "";
    document.getElementById("miPasswordNueva").value = "";
    alert("Contraseña actualizada.");
  }catch(error){
    console.error(error);
    alert(error.message || "No se pudo cambiar la contraseña.");
  }
}

/* RENDER */
function renderSelects() {
  const db = getDB();
  const clienteOptions = db.clientes.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("");

  ["pedidoCliente", "pagoCliente"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      const old = el.value;
      el.innerHTML = clienteOptions || '<option value="">Sin clientes</option>';
      if (old) el.value = old;
    }
  });

  const pagoCliente = document.getElementById("pagoCliente");
  const clienteId = pagoCliente ? pagoCliente.value : "";
  const pedidos = db.pedidos.filter((p) => !clienteId || p.cliente_id === clienteId);

  const pedidoOptions = pedidos
    .map((p) => `<option value="${p.id}">${pedidoDescripcion(p)} - saldo ${money(saldoPedido(p))}</option>`)
    .join("");

  const pagoPedido = document.getElementById("pagoPedido");
  if (pagoPedido) {
    const old = pagoPedido.value;
    pagoPedido.innerHTML = pedidoOptions || '<option value="">Sin pedidos</option>';
    if (old) pagoPedido.value = old;
  }

  if (pagoCliente && !pagoCliente.dataset.bound) {
    pagoCliente.dataset.bound = "1";
    pagoCliente.addEventListener("change", renderSelects);
  }
}

function renderTables() {
  const db = getDB();

  const tablaClientes = document.getElementById("tablaClientes");
  if (tablaClientes) {
    tablaClientes.innerHTML =
      `<tr><th>Cliente</th><th>NIT</th><th>Teléfono</th><th>Correo</th><th>Dirección</th><th>Saldo</th><th></th></tr>` +
      db.clientes.map((c) => `
        <tr>
          <td>${c.nombre}</td>
          <td>${c.nit || "-"}</td>
          <td>${c.telefono || "-"}</td>
          <td>${c.correo || "-"}</td>
          <td>${c.direccion || "-"}</td>
          <td>${money(saldoCliente(c.id))}</td>
          <td><button class="small-btn danger-btn" onclick="deleteCliente('${c.id}')">Eliminar</button></td>
        </tr>
      `).join("");
  }

  const cotFiltradas = obtenerCotizacionesFiltradas();
  const contadorCot = document.getElementById("contadorCotizaciones");
  if (contadorCot) {
    contadorCot.textContent = `Mostrando ${cotFiltradas.length} de ${db.cotizaciones.length} cotizaciones`;
  }

  const tablaCot = document.getElementById("tablaCotizaciones");
  if (tablaCot) {
    tablaCot.innerHTML =
      `<tr><th>Número</th><th>Fecha</th><th>Vigencia</th><th>Cliente</th><th>Total</th><th>IVA</th><th>Estado</th><th>Acciones</th></tr>` +
      cotFiltradas.map((c) => `
        <tr>
          <td><b>${c.numero || ("COT-" + String(c.id || "").slice(-6).toUpperCase())}</b></td>
          <td>${String(c.fecha || c.fecha_creacion || "").slice(0, 10)}</td>
          <td>${c.vigencia_hasta || addDaysISO(String(c.fecha || todayISO()).slice(0, 10), 15)}</td>
          <td>${cotClienteValue(c)}</td>
          <td>${money(cotTotalValue(c))}</td>
          <td>${cotIvaTexto(c)}</td>
          <td>
            <select onchange="updateCotEstado('${c.id}', this.value)">
              ${["Pendiente", "Enviada", "Aprobada", "Rechazada", "Convertida a pedido"].map((e) => `<option ${c.estado === e ? "selected" : ""}>${e}</option>`).join("")}
            </select>
          </td>
          <td>
            <button class="small-btn" onclick="printCotizacion('${c.id}')">PDF</button>
            <button class="small-btn" onclick="convertirCotizacionAPedido('${c.id}')">Pedido</button>
            <button class="small-btn danger-btn" onclick="deleteCotizacion('${c.id}')">Eliminar</button>
          </td>
        </tr>
      `).join("");
  }

  const pedidosFiltrados = obtenerPedidosFiltrados();
  const contadorPedidos = document.getElementById("contadorPedidos");
  if (contadorPedidos) {
    contadorPedidos.textContent = `Mostrando ${pedidosFiltrados.length} de ${db.pedidos.length} pedidos`;
  }

  const tablaPedidos = document.getElementById("tablaPedidos");
  if (tablaPedidos) {
    tablaPedidos.innerHTML =
      `<tr><th>Fecha</th><th>Días</th><th>Cantidad</th><th>Descripción</th><th>Precio</th><th>Total factura</th><th>Cliente</th><th>Dirección</th><th>Saldo</th><th>Estado</th><th></th></tr>` +
      pedidosFiltrados.map((p) => `
        <tr>
          <td>${String(p.fecha || "").slice(0, 10)}</td>
          <td>${daysSince(p.fecha)} días</td>
          <td>${p.cantidad || 0}</td>
          <td>${pedidoDescripcion(p)}</td>
          <td>${money(pedidoPrecio(p))}</td>
          <td>${money(pedidoTotal(p))}</td>
          <td>${clienteName(p.cliente_id)}</td>
          <td>${clienteDireccion(p.cliente_id)}</td>
          <td>${money(saldoPedido(p))}</td>
          <td>
            <select onchange="updateEstado('${p.id}', this.value)">
              ${["Nuevo", "En proceso", "Pendiente de pago", "Entregado", "Cancelado"].map((e) => `<option ${p.estado === e ? "selected" : ""}>${e}</option>`).join("")}
            </select>
          </td>
          <td><button class="small-btn danger-btn" onclick="deletePedido('${p.id}')">Eliminar</button></td>
        </tr>
      `).join("");
  }

  const tablaRecientes = document.getElementById("tablaRecientes");
  if (tablaRecientes) {
    tablaRecientes.innerHTML =
      `<tr><th>Fecha</th><th>Días</th><th>Cantidad</th><th>Descripción</th><th>Total factura</th><th>Cliente</th><th>Estado</th></tr>` +
      db.pedidos.slice(0, 8).map((p) => `
        <tr>
          <td>${String(p.fecha || "").slice(0, 10)}</td>
          <td>${daysSince(p.fecha)} días</td>
          <td>${p.cantidad || 0}</td>
          <td>${pedidoDescripcion(p)}</td>
          <td>${money(pedidoTotal(p))}</td>
          <td>${clienteName(p.cliente_id)}</td>
          <td><span class="badge-state">${p.estado}</span></td>
        </tr>
      `).join("");
  }

  const pagosFiltrados = typeof obtenerPagosFiltrados === "function" ? obtenerPagosFiltrados() : db.pagos;
  const contadorPagos = document.getElementById("contadorPagos");
  if (contadorPagos) {
    contadorPagos.textContent = `Mostrando ${pagosFiltrados.length} de ${db.pagos.length} pagos`;
  }

  const tablaPagos = document.getElementById("tablaPagos");
  if (tablaPagos) {
    tablaPagos.innerHTML =
      `<tr><th>Fecha</th><th>Días</th><th>Cliente</th><th>Pedido</th><th>Monto</th><th>Método</th><th>Referencia</th><th></th></tr>` +
      pagosFiltrados.map((p) => `
        <tr>
          <td>${String(p.fecha || "").slice(0, 10)}</td>
          <td>${daysSince(p.fecha)} días</td>
          <td>${clienteName(p.cliente_id)}</td>
          <td>${pedidoName(p.pedido_id)}</td>
          <td>${money(p.monto)}</td>
          <td>${p.metodo || "-"}</td>
          <td>${p.referencia || "-"}</td>
          <td><button class="small-btn danger-btn" onclick="deletePago('${p.id}')">Eliminar</button></td>
        </tr>
      `).join("");
  }

  const tablaCuenta = document.getElementById("tablaCuenta");
  if (tablaCuenta) {
    let rows = `<tr><th>Cliente</th><th>Dirección</th><th>Pedidos</th><th>Total facturado</th><th>Pagado</th><th>Saldo</th><th>Último pago</th></tr>`;

    db.clientes.forEach((c) => {
      const pedidos = db.pedidos.filter((p) => p.cliente_id === c.id && p.estado !== "Cancelado");
      const total = pedidos.reduce((a, p) => a + pedidoTotal(p), 0);
      const pagosCliente = db.pagos.filter((p) => p.cliente_id === c.id);
      const pagado = pagosCliente.reduce((a, p) => a + Number(p.monto || 0), 0);
      const saldo = total - pagado;
      const pendientes = pedidos.filter((p) => saldoPedido(p) > 0.01);

      rows += `
        <tr style="cursor:pointer" onclick="toggleCuentaCliente('${c.id}')">
          <td><b>${c.nombre}</b></td>
          <td>${c.direccion || "-"}</td>
          <td>${pedidos.length}</td>
          <td>${money(total)}</td>
          <td>${money(pagado)}</td>
          <td><b>${money(saldo)}</b></td>
          <td>${String(ultimoPagoCliente(c.id)).slice(0, 10)}</td>
        </tr>
      `;

      rows += `
        <tr id="detalle-cuenta-${c.id}" class="hidden">
          <td colspan="7">
            <div style="padding:14px;background:#fafafa;border:1px solid #ddd">
              <b>Resumen de ${c.nombre}</b>
              <div style="margin:8px 0 12px">
                Total facturado: <b>${money(total)}</b> |
                Total pagado: <b>${money(pagado)}</b> |
                Saldo: <b>${money(saldo)}</b> |
                Último pago: <b>${String(ultimoPagoCliente(c.id)).slice(0, 10)}</b>
              </div>
              <b>Facturas pendientes</b>
              <div class="table-wrap" style="margin-top:10px">
                <table>
                  <tr><th>Fecha</th><th>Días</th><th>Descripción</th><th>Total</th><th>Pagado</th><th>Saldo</th><th>Estado</th></tr>
                  ${
                    pendientes.length
                      ? pendientes.map((p) => `
                          <tr>
                            <td>${String(p.fecha || "").slice(0, 10)}</td>
                            <td>${daysSince(p.fecha)} días</td>
                            <td>${pedidoDescripcion(p)}</td>
                            <td>${money(pedidoTotal(p))}</td>
                            <td>${money(pagosDePedido(p.id))}</td>
                            <td><b>${money(saldoPedido(p))}</b></td>
                            <td>${p.estado || "-"}</td>
                          </tr>
                        `).join("")
                      : `<tr><td colspan="7">No hay facturas pendientes.</td></tr>`
                  }
                </table>
              </div>
            </div>
          </td>
        </tr>
      `;
    });

    tablaCuenta.innerHTML = rows;
  }

  const tablaUsuarios = document.getElementById("tablaUsuarios");
  if (tablaUsuarios) {
    const current = getCurrentUser();
    const isAdmin = current.rol === "admin";

    if (!getToken()) {
      tablaUsuarios.innerHTML = `<tr><td>Inicia sesión para ver usuarios.</td></tr>`;
    } else if (!isAdmin) {
      tablaUsuarios.innerHTML = `<tr><td>Solo administradores pueden administrar usuarios.</td></tr>`;
    } else {
      tablaUsuarios.innerHTML =
        `<tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>` +
        (db.usuarios || []).map((u) => `
          <tr>
            <td><b>${u.usuario || "-"}</b></td>
            <td>${u.nombre || "-"}</td>
            <td>
              <select onchange="updateUsuario('${u.id}', 'rol', this.value)">
                <option value="usuario" ${u.rol === "usuario" ? "selected" : ""}>Usuario</option>
                <option value="admin" ${u.rol === "admin" ? "selected" : ""}>Administrador</option>
              </select>
            </td>
            <td>
              <select onchange="updateUsuario('${u.id}', 'activo', this.value)">
                <option value="true" ${u.activo !== false ? "selected" : ""}>Activo</option>
                <option value="false" ${u.activo === false ? "selected" : ""}>Inactivo</option>
              </select>
            </td>
            <td>
              <button class="small-btn" onclick="resetUsuarioPassword('${u.id}')">Cambiar clave</button>
              ${u.activo === false
                ? `<button class="small-btn" onclick="activarUsuario('${u.id}')">Activar</button>`
                : `<button class="small-btn danger-btn" onclick="deleteUsuario('${u.id}')">Desactivar</button>`}
            </td>
          </tr>
        `).join("");
    }
  }

}

function renderKPIs() {
  const db = getDB();
  const kpiClientes = document.getElementById("kpiClientes");
  if (!kpiClientes) return;

  const abiertos = db.pedidos.filter((p) => !["Entregado", "Cancelado"].includes(p.estado)).length;
  const saldo = db.pedidos
    .filter((p) => p.estado !== "Cancelado")
    .reduce((a, p) => a + saldoPedido(p), 0);
  const pagos = db.pagos.reduce((a, p) => a + Number(p.monto || 0), 0);

  kpiClientes.textContent = db.clientes.length;
  document.getElementById("kpiPedidos").textContent = abiertos;
  document.getElementById("kpiSaldo").textContent = money(saldo);
  document.getElementById("kpiPagos").textContent = money(pagos);
}

function renderAll() {
  renderSelects();
  renderTables();
  renderKPIs();
}

async function seedDemo() {
  alert("Demo desactivada para evitar duplicados. Usa datos reales.");
}

checkAuth();

document.addEventListener("DOMContentLoaded", () => {
  [
    "filtroClientePedido",
    "filtroFechaInicio",
    "filtroFechaFin",
    "filtroEstadoPedido",
    "filtroClientePago",
    "filtroPagoFechaInicio",
    "filtroPagoFechaFin",
    "filtroMetodoPago",
    "filtroReferenciaPago",
    "filtroCotCliente",
    "filtroCotFechaInicio",
    "filtroCotFechaFin",
    "filtroCotEstado"
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", renderAll);
      el.addEventListener("change", renderAll);
    }
  });

  ["cotCantidad", "cotPrecio"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", calcularTotalCotizacion);
      el.addEventListener("change", calcularTotalCotizacion);
    }
  });

  if (location.pathname.includes("dashboard")) {
    cargarMongoDB();
  } else {
    renderAll();
    hideLoading();
  }
});
