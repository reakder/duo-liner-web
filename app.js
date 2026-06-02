// ==========================================
// CONTROL DEL MENÚ DE NAVEGACIÓN
// ==========================================
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

if (menuBtn && menu) {
  menuBtn.addEventListener("click", () => menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach(a => 
    a.addEventListener("click", () => menu.classList.remove("open"))
  );
}

// ==========================================
// ENGINE DE ANIMACIONES POR SCROLL (IntersectionObserver)
// ==========================================
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: .12 });

reveals.forEach(item => observer.observe(item));

// ==========================================
// INTEGRACIÓN DEL FORMULARIO CON WHATSAPP
// ==========================================
const quoteForm = document.getElementById("quoteForm");
if (quoteForm) {
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("qName").value.trim();
    const company = document.getElementById("qCompany").value.trim();
    const phone = document.getElementById("qPhone").value.trim();
    const product = document.getElementById("qProduct").value;
    const message = document.getElementById("qMessage").value.trim();
    
    const text = `Hola DUO-LINER, deseo solicitar una cotización.%0A%0A` +
                 `Nombre: ${encodeURIComponent(name)}%0A` +
                 `Empresa: ${encodeURIComponent(company)}%0A` +
                 `Teléfono: ${encodeURIComponent(phone)}%0A` +
                 `Producto: ${encodeURIComponent(product)}%0A` +
                 `Detalle: ${encodeURIComponent(message)}`;
                 
    window.open(`https://wa.me/50258544448?text=${text}`, "_blank");
  });
}

// ==========================================
// LOGIN DEMO SYSTEM
// ==========================================
function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;
  const error = document.getElementById("error");
  
  if (user === "admin" && pass === "1234") {
    window.location.href = "dashboard.html";
  } else {
    if (error) error.innerText = "Usuario o contraseña incorrectos.";
  }
}

// ==========================================
// MICRO-INTERACCIONES: EFECTO PARALLAX INTERACTIVO EN TARJETAS
// ==========================================
const cards = document.querySelectorAll('.product, .service, .quote-form, .two-cards div');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Configuración física de rotación 3D fluida
    const force = 5; 
    const rotateX = ((y / rect.height) - 0.5) * -force;
    const rotateY = ((x / rect.width) - 0.5) * force;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    // Restaura la tarjeta elegantemente con amortiguación
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
  });
});