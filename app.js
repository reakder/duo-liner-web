const BACKEND_URL="https://duo-liner-backend.onrender.com";

const menuToggle=document.getElementById("menuToggle");
const navLinks=document.getElementById("navLinks");
if(menuToggle&&navLinks){
  menuToggle.addEventListener("click",()=>navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>navLinks.classList.remove("open")));
}

const reveals=document.querySelectorAll(".reveal");
if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");entry.target.classList.add("show");}});
  },{threshold:.12});
  reveals.forEach(item=>observer.observe(item));
}else{reveals.forEach(item=>{item.classList.add("visible");item.classList.add("show");});}

const productLinks=document.querySelectorAll(".product-quote");
productLinks.forEach(link=>{
  link.addEventListener("click",()=>{
    const product=link.dataset.product||"Otro";
    setTimeout(()=>{
      const select=document.getElementById("qProduct");
      const message=document.getElementById("qMessage");
      if(select){
        const option=[...select.options].find(o=>o.textContent.trim()===product);
        if(option) select.value=product; else select.value="Otro";
      }
      if(message&&!message.value){message.value=`Estoy interesado en cotizar: ${product}.`}
    },120);
  });
});

const quoteForm=document.getElementById("quoteForm");
if(quoteForm){
  quoteForm.addEventListener("submit",async e=>{
    e.preventDefault();
    const name=document.getElementById("qName")?.value.trim()||"";
    const company=document.getElementById("qCompany")?.value.trim()||"";
    const phone=document.getElementById("qPhone")?.value.trim()||"";
    const product=document.getElementById("qProduct")?.value||"";
    const message=document.getElementById("qMessage")?.value.trim()||"";
    if(!name||!phone){alert("Por favor ingresa nombre y telefono.");return;}
    const data={cliente:name,empresa:company,telefono:phone,descripcion:product,mensaje:message,origen:"web-duo-liner",fecha:new Date().toISOString().slice(0,10),estado:"Pendiente"};
    try{
      const response=await fetch(`${BACKEND_URL}/cotizaciones`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      if(!response.ok) throw new Error("No se pudo guardar la cotizacion");
      alert("Cotizacion enviada correctamente.");
      const text=`Hola DUO-LINER, deseo solicitar una cotizacion.%0A%0ANombre: ${encodeURIComponent(name)}%0AEmpresa: ${encodeURIComponent(company)}%0ATelefono: ${encodeURIComponent(phone)}%0AProducto: ${encodeURIComponent(product)}%0ADetalle: ${encodeURIComponent(message)}`;
      window.open(`https://wa.me/50258544448?text=${text}`,"_blank");
      quoteForm.reset();
    }catch(error){
      console.error(error);
      alert("No fue posible enviar la cotizacion. Intente nuevamente.");
    }
  });
}


document.addEventListener("DOMContentLoaded",()=>{
 const lightbox=document.getElementById("imageLightbox");
 const lightboxImg=document.getElementById("imageLightboxImg");
 const closeBtn=document.getElementById("imageLightboxClose");
 if(!lightbox||!lightboxImg||!closeBtn) return;

 document.querySelectorAll("img").forEach(img=>{
   if(img.closest(".brand")) return;
   img.classList.add("zoomable-image");
   img.addEventListener("click",()=>{
      lightboxImg.src=img.src;
      lightboxImg.alt=img.alt||"Imagen DUO-LINER";
      lightbox.classList.add("open");
   });
 });

 closeBtn.addEventListener("click",()=>lightbox.classList.remove("open"));
 lightbox.addEventListener("click",(e)=>{if(e.target===lightbox) lightbox.classList.remove("open");});
 document.addEventListener("keydown",(e)=>{if(e.key==="Escape") lightbox.classList.remove("open");});
});



// =====================================================
// INTRO ANIMADO DUO-LINER CON LINERS REALES
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("duoIntro");
  if (!intro) return;

  const alreadySeen = sessionStorage.getItem("duoIntroSeen") === "true";

  if (alreadySeen) {
    intro.classList.add("hide");
    document.body.classList.remove("intro-active");
    setTimeout(() => intro.remove(), 350);
    return;
  }

  document.body.classList.add("intro-active");

  setTimeout(() => {
    intro.classList.add("hide");
    document.body.classList.remove("intro-active");
    sessionStorage.setItem("duoIntroSeen", "true");
    setTimeout(() => intro.remove(), 900);
  }, 3900);
});
