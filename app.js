const BACKEND_URL = "https://duo-liner-backend.onrender.com";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const cursor = document.getElementById("inkCursor");
const stamp = document.getElementById("stampObject");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
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
      const response = await fetch(`${BACKEND_URL}/cotizaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar la cotización");
      }

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
      alert("No fue posible enviar la cotización. Intente nuevamente.");
    }
  });
}
