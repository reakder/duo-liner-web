// =====================================================
// DUO-LINER app.js
// Web publica + Portal administrativo conectado a MongoDB
// Backend Render: https://duo-liner-backend.onrender.com
// =====================================================

const BACKEND_URL = "https://duo-liner-backend.onrender.com";

// =====================================================
// MENU / NAVEGACION - compatible con las versiones usadas
// =====================================================

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

if (menuBtn && menu) {
  menuBtn.addEventListener("click", () => menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => menu.classList.remove("open"))
  );
}

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navLinks.classList.remove("open"))
  );
}

const menuButton = document.getElementById("menuButton");
const navMenu = document.getElementById("navMenu");

if (menuButton && navMenu) {
  menuButton.addEventListener("click", () => navMenu.classList.toggle("open"));
  navMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => navMenu.classList.remove("open"))
  );
}

const topbar = document.getElementById("topbar");

window.addEventListener("scroll", () => {
  if (topbar) {
    topbar.classList.toggle("scrolled", window.scrollY > 80);
  }
});

// =====================================================
// EFECTOS VISUALES
// =====================================================

const cursorGlow = document.getElementById("cursorGlow");
const inkCursor = document.getElementById("inkCursor");
const cursor = cursorGlow || inkCursor;

if (cursor) {
  document.addEventListener("mousemove", (event) => {
    cursor.style.left = event.clientX + "px";
    cursor.style.top = event.clientY + "px";
  });
}

const stampObject = document.getElementById("stampObject");

if (stampObject) {
  document.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * -10;
    stampObject.style.rotate = `${y}deg ${x}deg`;
  });
}

// =====================================================
// ANIMACIONES AL SCROLL
// =====================================================

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((item) => observer.observe(item));
} else {
  reveals.forEach((item) => {
    item.classList.add("visible");
    item.classList.add("show");
  });
}

// =====================================================
// HELPERS API
// =====================================================

async function apiGet(path) {
  const response = await fetch(`${BACKEND_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Error GET ${path}`);
  }
  return response.json();
}

async function apiPost(path, data) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Error POST ${path}`);
  }

  return response.json();
}

async function apiPut(path, data) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`Error PUT ${path}`);
  }

  return response.json();
}

async function apiDelete(path) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(`Error DELETE ${path}`);
  }

  return response.json();
}

// =====================================================
// FORMULARIO PUBLICO DE COTIZACION
// Guarda en MongoDB y abre WhatsApp
// =====================================================

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
      alert("Por favor ingresa nombre y telefono.");
      return;
    }

    const data = {
      nombre: name,
      empresa: company,
      telefono: phone,
      producto: product,
      mensaje: message,
      origen: "web-duo-liner",
      fecha_web: new Date().toISOString()
    };

    try {
      await apiPost("/cotizaciones", data);

      alert("Cotizacion enviada correctamente. Nos pondremos en contacto pronto.");

      const text =
        `Hola DUO-LINER, deseo solicitar una cotizacion.%0A%0A` +
        `Nombre: ${encodeURIComponent(name)}%0A` +
        `Empresa: ${encodeURIComponent(company)}%0A` +
        `Telefono: ${encodeURIComponent(phone)}%0A` +
        `Producto: ${encodeURIComponent(product)}%0A` +
        `Detalle: ${encodeURIComponent(message)}`;

      window.open(`https://wa.me/50258544448?text=${text}`, "_blank");

      quoteForm.reset();
    } catch (error) {
      console.error("Error enviando cotizacion:", error);
      alert("No fue posible enviar la cotizacion. Intente nuevamente.");
    }
  });
}

// =====================================================
// ESTADO DEL DASHBOARD EN MEMORIA
// Datos vienen de MongoDB
// =====================================================

let DB = {
  clientes: [],
  pedidos: [],
  pagos: []
};

function getDB() {
  return DB;
}

function setDB(data) {
  DB = {
    clientes: data.clientes || [],
    pedidos: data.pedidos || [],
    pagos: data.pagos || []
  };
}

function money(n) {
  return (
    "Q" +
    Number(n || 0).toLocaleString("es-GT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(dateStr) {
  if (!dateStr) return 0;
  const clean = String(dateStr).slice(0, 10);
  const start = new Date(clean + "T00:00:00");
  return Math.max(0, Math.floor((new Date() - start) / 86400000));
}

// =====================================================
// LOGIN DEMO
// =====================================================

function login() {
  const user = document.getElementById("user")?.value.trim();
  const pass = document.getElementById("pass")?.value.trim();

  if (user === "admin" && pass === "1234") {
    localStorage.setItem("duoliner_session", "ok");
    location.href = "dashboard.html";
  } else {
    const error = document.getElementById("error");
    if (error) {
      error.textContent = "Usuario o contrasena incorrectos.";
    }
  }
}

function checkAuth() {
  if (
    location.pathname.includes("dashboard") &&
    localStorage.getItem("duoliner_session") !== "ok"
  ) {
    location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("duoliner_session");
  location.href = "login.html";
}

// =====================================================
// CARGA DE DATOS DESDE MONGODB
// =====================================================

async function loadData() {
  try {
    const [clientes, pedidos, pagos] = await Promise.all([
      apiGet("/clientes"),
      apiGet("/pedidos"),
      apiGet("/pagos")
    ]);

    setDB({ clientes, pedidos, pagos });
    renderAll();
  } catch (error) {
    console.error("Error cargando datos desde MongoDB:", error);
    const table = document.getElementById("tablaRecientes");
    if (table) {
      table.innerHTML =
        '<tr><td>No fue posible cargar datos desde MongoDB.</td></tr>';
    }
  }
}

// =====================================================
// VISTAS DEL DASHBOARD
// =====================================================

function showView(name, button) {
  document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));

  const view = document.getElementById("view-" + name);
  if (view) {
    view.classList.remove("hidden");
  }

  document.querySelectorAll(".side-link").forEach((b) => b.classList.remove("active"));
  if (button) {
    button.classList.add("active");
  }

  renderAll();
}

// =====================================================
// CALCULOS
// =====================================================

function clienteName(id) {
  const db = getDB();
  return (db.clientes.find((c) => c.id === id) || {}).nombre || "Sin cliente";
}

function pedidoName(id) {
  const db = getDB();
  const p = db.pedidos.find((x) => x.id === id);
  return p ? `${p.producto} - ${money(p.total)}` : "Sin pedido";
}

function pagosDePedido(pedidoId) {
  const db = getDB();
  return db.pagos
    .filter((p) => p.pedido_id === pedidoId)
    .reduce((a, p) => a + Number(p.monto || 0), 0);
}

function saldoPedido(p) {
  return Number(p.total || 0) - pagosDePedido(p.id);
}

function saldoCliente(clienteId) {
  const db = getDB();
  return db.pedidos
    .filter((p) => p.cliente_id === clienteId && p.estado !== "Cancelado")
    .reduce((a, p) => a + saldoPedido(p), 0);
}

// =====================================================
// CLIENTES - MONGODB
// =====================================================

async function addCliente() {
  const nombre = document.getElementById("clienteNombre")?.value.trim();

  if (!nombre) {
    alert("Ingresa el nombre del cliente.");
    return;
  }

  const data = {
    nombre,
    nit: document.getElementById("clienteNit")?.value.trim() || "",
    telefono: document.getElementById("clienteTelefono")?.value.trim() || "",
    correo: document.getElementById("clienteCorreo")?.value.trim() || "",
    direccion: document.getElementById("clienteDireccion")?.value.trim() || "",
    fecha: todayISO()
  };

  try {
    await apiPost("/clientes", data);

    [
      "clienteNombre",
      "clienteNit",
      "clienteTelefono",
      "clienteCorreo",
      "clienteDireccion"
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    await loadData();
    alert("Cliente guardado en MongoDB.");
  } catch (error) {
    console.error(error);
    alert("No fue posible guardar el cliente.");
  }
}

async function deleteCliente(id) {
  if (!confirm("Eliminar cliente? Tambien se eliminaran sus pedidos y pagos.")) {
    return;
  }

  try {
    await apiDelete(`/clientes/${id}`);
    await loadData();
  } catch (error) {
    console.error(error);
    alert("No fue posible eliminar el cliente.");
  }
}

// =====================================================
// PEDIDOS - MONGODB
// =====================================================

async function addPedido() {
  const cliente_id = document.getElementById("pedidoCliente")?.value;

  if (!cliente_id) {
    alert("Primero crea un cliente.");
    return;
  }

  const producto = document.getElementById("pedidoProducto")?.value.trim();

  if (!producto) {
    alert("Ingresa producto o descripcion.");
    return;
  }

  const data = {
    cliente_id,
    fecha: todayISO(),
    producto,
    cantidad: Number(document.getElementById("pedidoCantidad")?.value || 0),
    total: Number(document.getElementById("pedidoTotal")?.value || 0),
    estado: document.getElementById("pedidoEstado")?.value || "Nuevo"
  };

  try {
    await apiPost("/pedidos", data);

    ["pedidoProducto", "pedidoCantidad", "pedidoTotal"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    await loadData();
    alert("Pedido guardado en MongoDB.");
  } catch (error) {
    console.error(error);
    alert("No fue posible guardar el pedido.");
  }
}

async function updateEstado(id, estado) {
  try {
    await apiPut(`/pedidos/${id}`, { estado });
    await loadData();
  } catch (error) {
    console.error(error);
    alert("No fue posible actualizar el estado.");
  }
}

async function deletePedido(id) {
  if (!confirm("Eliminar pedido?")) {
    return;
  }

  try {
    await apiDelete(`/pedidos/${id}`);
    await loadData();
  } catch (error) {
    console.error(error);
    alert("No fue posible eliminar el pedido.");
  }
}

// =====================================================
// PAGOS - MONGODB
// =====================================================

async function addPago() {
  const cliente_id = document.getElementById("pagoCliente")?.value;
  const pedido_id = document.getElementById("pagoPedido")?.value;
  const monto = Number(document.getElementById("pagoMonto")?.value || 0);

  if (!cliente_id || !pedido_id || monto <= 0) {
    alert("Selecciona cliente, pedido y monto.");
    return;
  }

  const data = {
    cliente_id,
    pedido_id,
    fecha: todayISO(),
    monto,
    metodo: document.getElementById("pagoMetodo")?.value.trim() || "",
    referencia: document.getElementById("pagoReferencia")?.value.trim() || ""
  };

  try {
    await apiPost("/pagos", data);

    ["pagoMonto", "pagoMetodo", "pagoReferencia"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    await loadData();
    alert("Pago guardado en MongoDB.");
  } catch (error) {
    console.error(error);
    alert("No fue posible guardar el pago.");
  }
}

async function deletePago(id) {
  if (!confirm("Eliminar pago?")) {
    return;
  }

  try {
    await apiDelete(`/pagos/${id}`);
    await loadData();
  } catch (error) {
    console.error(error);
    alert("No fue posible eliminar el pago.");
  }
}

// =====================================================
// RENDER SELECTS
// =====================================================

function renderSelects() {
  const db = getDB();

  const clienteOptions = db.clientes
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");

  ["pedidoCliente", "pagoCliente"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      const current = el.value;
      el.innerHTML = clienteOptions || '<option value="">Sin clientes</option>';
      if (current) el.value = current;
    }
  });

  const pagoCliente = document.getElementById("pagoCliente");
  const clienteId = pagoCliente ? pagoCliente.value : "";

  const pedidos = db.pedidos.filter((p) => !clienteId || p.cliente_id === clienteId);

  const pedidoOptions = pedidos
    .map(
      (p) =>
        `<option value="${p.id}">${p.producto} - saldo ${money(saldoPedido(p))}</option>`
    )
    .join("");

  const pagoPedido = document.getElementById("pagoPedido");
  if (pagoPedido) {
    const currentPedido = pagoPedido.value;
    pagoPedido.innerHTML = pedidoOptions || '<option value="">Sin pedidos</option>';
    if (currentPedido) pagoPedido.value = currentPedido;
  }

  if (pagoCliente && !pagoCliente.dataset.bound) {
    pagoCliente.dataset.bound = "1";
    pagoCliente.addEventListener("change", renderSelects);
  }
}

// =====================================================
// RENDER TABLAS
// =====================================================

function renderTables() {
  const db = getDB();

  const tablaClientes = document.getElementById("tablaClientes");
  if (tablaClientes) {
    tablaClientes.innerHTML = `
      <tr>
        <th>Cliente</th>
        <th>NIT</th>
        <th>Telefono</th>
        <th>Correo</th>
        <th>Saldo</th>
        <th></th>
      </tr>
      ${db.clientes
        .map(
          (c) => `
          <tr>
            <td>${c.nombre}</td>
            <td>${c.nit || "-"}</td>
            <td>${c.telefono || "-"}</td>
            <td>${c.correo || "-"}</td>
            <td>${money(saldoCliente(c.id))}</td>
            <td><button class="small-btn danger-btn" onclick="deleteCliente('${c.id}')">Eliminar</button></td>
          </tr>
        `
        )
        .join("")}
    `;
  }

  const pedidosRows = db.pedidos
    .map(
      (p) => `
      <tr>
        <td>${clienteName(p.cliente_id)}</td>
        <td>${p.producto}</td>
        <td>${p.cantidad || 0}</td>
        <td>${String(p.fecha || "").slice(0, 10)}</td>
        <td>${daysSince(p.fecha)} dias</td>
        <td>${money(p.total)}</td>
        <td>${money(saldoPedido(p))}</td>
        <td>
          <select onchange="updateEstado('${p.id}', this.value)">
            ${["Nuevo", "En proceso", "Pendiente de pago", "Entregado", "Cancelado"]
              .map((e) => `<option ${p.estado === e ? "selected" : ""}>${e}</option>`)
              .join("")}
          </select>
        </td>
        <td><button class="small-btn danger-btn" onclick="deletePedido('${p.id}')">Eliminar</button></td>
      </tr>
    `
    )
    .join("");

  const tablaPedidos = document.getElementById("tablaPedidos");
  if (tablaPedidos) {
    tablaPedidos.innerHTML = `
      <tr>
        <th>Cliente</th>
        <th>Pedido</th>
        <th>Cantidad</th>
        <th>Fecha</th>
        <th>Dias</th>
        <th>Total</th>
        <th>Saldo</th>
        <th>Estado</th>
        <th></th>
      </tr>
      ${pedidosRows}
    `;
  }

  const tablaRecientes = document.getElementById("tablaRecientes");
  if (tablaRecientes) {
    tablaRecientes.innerHTML = `
      <tr>
        <th>Cliente</th>
        <th>Pedido</th>
        <th>Fecha</th>
        <th>Dias</th>
        <th>Saldo</th>
        <th>Estado</th>
      </tr>
      ${db.pedidos
        .slice(0, 8)
        .map(
          (p) => `
          <tr>
            <td>${clienteName(p.cliente_id)}</td>
            <td>${p.producto}</td>
            <td>${String(p.fecha || "").slice(0, 10)}</td>
            <td>${daysSince(p.fecha)} dias</td>
            <td>${money(saldoPedido(p))}</td>
            <td><span class="badge-state">${p.estado}</span></td>
          </tr>
        `
        )
        .join("")}
    `;
  }

  const tablaPagos = document.getElementById("tablaPagos");
  if (tablaPagos) {
    tablaPagos.innerHTML = `
      <tr>
        <th>Fecha</th>
        <th>Cliente</th>
        <th>Pedido</th>
        <th>Monto</th>
        <th>Metodo</th>
        <th>Referencia</th>
        <th></th>
      </tr>
      ${db.pagos
        .map(
          (p) => `
          <tr>
            <td>${String(p.fecha || "").slice(0, 10)}</td>
            <td>${clienteName(p.cliente_id)}</td>
            <td>${pedidoName(p.pedido_id)}</td>
            <td>${money(p.monto)}</td>
            <td>${p.metodo || "-"}</td>
            <td>${p.referencia || "-"}</td>
            <td><button class="small-btn danger-btn" onclick="deletePago('${p.id}')">Eliminar</button></td>
          </tr>
        `
        )
        .join("")}
    `;
  }

  const tablaCuenta = document.getElementById("tablaCuenta");
  if (tablaCuenta) {
    tablaCuenta.innerHTML = `
      <tr>
        <th>Cliente</th>
        <th>Pedidos</th>
        <th>Total facturado</th>
        <th>Pagado</th>
        <th>Saldo</th>
      </tr>
      ${db.clientes
        .map((c) => {
          const pedidos = db.pedidos.filter(
            (p) => p.cliente_id === c.id && p.estado !== "Cancelado"
          );

          const total = pedidos.reduce((a, p) => a + Number(p.total || 0), 0);
          const pagado = db.pagos
            .filter((p) => p.cliente_id === c.id)
            .reduce((a, p) => a + Number(p.monto || 0), 0);

          return `
            <tr>
              <td>${c.nombre}</td>
              <td>${pedidos.length}</td>
              <td>${money(total)}</td>
              <td>${money(pagado)}</td>
              <td><b>${money(total - pagado)}</b></td>
            </tr>
          `;
        })
        .join("")}
    `;
  }
}

// =====================================================
// KPIS
// =====================================================

function renderKPIs() {
  const db = getDB();
  const kpiClientes = document.getElementById("kpiClientes");

  if (!kpiClientes) {
    return;
  }

  const abiertos = db.pedidos.filter(
    (p) => !["Entregado", "Cancelado"].includes(p.estado)
  ).length;

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

// =====================================================
// DATOS DEMO EN MONGODB
// =====================================================

async function seedDemo() {
  if (!confirm("Esto agregara datos demo en MongoDB. Continuar?")) {
    return;
  }

  try {
    const c1 = await apiPost("/clientes", {
      nombre: "Cliente Industrial ABC",
      nit: "1234567-8",
      telefono: "5555-1111",
      correo: "compras@abc.com",
      direccion: "Guatemala",
      fecha: todayISO()
    });

    const c2 = await apiPost("/clientes", {
      nombre: "Distribuidora Central",
      nit: "7654321-0",
      telefono: "5555-2222",
      correo: "ventas@central.com",
      direccion: "Mixco",
      fecha: todayISO()
    });

    const p1 = await apiPost("/pedidos", {
      cliente_id: c1.id,
      fecha: todayISO(),
      producto: "Sello 45mm",
      cantidad: 1000,
      total: 2500,
      estado: "En proceso"
    });

    await apiPost("/pedidos", {
      cliente_id: c2.id,
      fecha: todayISO(),
      producto: "Sello personalizado 63mm",
      cantidad: 500,
      total: 1850,
      estado: "Pendiente de pago"
    });

    await apiPost("/pagos", {
      cliente_id: c1.id,
      pedido_id: p1.id,
      fecha: todayISO(),
      monto: 1000,
      metodo: "Transferencia",
      referencia: "TRX-001"
    });

    await loadData();
    alert("Datos demo guardados en MongoDB.");
  } catch (error) {
    console.error(error);
    alert("No fue posible cargar datos demo.");
  }
}

// =====================================================
// INICIO
// =====================================================

checkAuth();

document.addEventListener("DOMContentLoaded", () => {
  if (location.pathname.includes("dashboard")) {
    loadData();
  } else {
    renderAll();
  }
});


// =====================================================
// LIGHTBOX DE IMAGENES - DUO-LINER
// Permite hacer click en imagenes para agrandarlas
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImg = document.getElementById("imageLightboxImg");
  const lightboxCaption = document.getElementById("imageLightboxCaption");
  const closeBtn = document.getElementById("imageLightboxClose");

  if (!lightbox || !lightboxImg || !closeBtn) return;

  const openLightbox = (img) => {
    const src = img.getAttribute("src");
    if (!src) return;

    lightboxImg.src = src;
    lightboxImg.alt = img.getAttribute("alt") || "Imagen DUO-LINER";
    lightboxCaption.textContent = img.getAttribute("alt") || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-active");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-active");
    setTimeout(() => {
      if (!lightbox.classList.contains("open")) lightboxImg.src = "";
    }, 180);
  };

  document.querySelectorAll("main img, .hero img, .product-media img, .real-gallery-card img, .hero-product-collage img, .application-card img, .product-card img, .catalog-card img").forEach((img) => {
    if (img.closest(".brand")) return;
    img.classList.add("zoomable-image");
    img.setAttribute("title", "Click para ampliar");
    img.addEventListener("click", () => openLightbox(img));
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) {
      closeLightbox();
    }
  });
});

