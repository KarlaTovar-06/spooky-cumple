// ---- Config ----
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw0tBV_u3i6-WnpNsBKM1iIDZrlDqiT74ON2PzQf31Mzr3SJaFqHZJIsTNfxjFZ88Gw/exec";
const WHATSAPP_NUMBER = "525633794668";
const MAPS_LINK = "https://maps.app.goo.gl/9EGbhjSng3CxiDMVA?g_st=ic";
const SPOTIFY_LINK =
  "https://open.spotify.com/playlist/5sKXw25zT3VBtTCU7kKZim?si=8c2wdtjwQz-inn5M2lWMQQ&utm_source=copy-link&pi=IV4Gd88nSPqcB&nd=1&dlsi=c009c60482304d4e";

// ---- Envelope open ----
const envelopeScreen = document.getElementById("envelope-screen");
const envelope = document.getElementById("envelope");
const invitation = document.getElementById("invitation");

envelopeScreen.addEventListener("click", () => {
  envelope.classList.add("open");
  setTimeout(() => {
    envelopeScreen.classList.add("hidden");
    invitation.style.display = "block";
    requestAnimationFrame(() => invitation.classList.add("show"));
  }, 900);
});

// ---- RSVP logic ----
let asistencia = null;
let acompanantes = 0;

const choiceButtons = document.querySelectorAll(
  "#asistencia-group .choice-btn"
);
const acompField = document.getElementById("acompanantes-field");
const enviarBtn = document.getElementById("enviar-btn");
const nombreInput = document.getElementById("nombre");
const countSpan = document.getElementById("acompanantes-count");
const statusMsg = document.getElementById("status-msg");

choiceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    choiceButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    asistencia = btn.dataset.value;
    acompField.style.display = asistencia === "No voy" ? "none" : "block";
    checkReady();
  });
});

const MAX_ACOMPANANTES = 3;

document.getElementById("mas").addEventListener("click", () => {
  if (acompanantes < MAX_ACOMPANANTES) acompanantes++;
  countSpan.textContent = acompanantes;
});
document.getElementById("menos").addEventListener("click", () => {
  if (acompanantes > 0) acompanantes--;
  countSpan.textContent = acompanantes;
});

nombreInput.addEventListener("input", checkReady);

function checkReady() {
  enviarBtn.disabled = !(nombreInput.value.trim().length > 0 && asistencia);
}

enviarBtn.addEventListener("click", async () => {
  const nombre = nombreInput.value.trim();
  statusMsg.textContent = "Enviando...";
  enviarBtn.disabled = true;

  // 1. Guardar en Google Sheets (si ya configuraste SCRIPT_URL)
  if (SCRIPT_URL && SCRIPT_URL.indexOf("PON_AQUI") === -1) {
    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ nombre, asistencia, acompanantes }),
      });
    } catch (err) {
      console.error("No se pudo guardar en Sheets:", err);
    }
  }

  // 2. Armar mensaje de WhatsApp y abrirlo
  let mensaje = "";
  if (asistencia === "Sí voy") {
    mensaje = `¡Hola! Soy ${nombre}. Confirmo que SÍ voy a tu Spooky Cumple con ${acompanantes} acompañante(s).`;
  } else if (asistencia === "Tal vez") {
    mensaje = `¡Hola! Soy ${nombre}. Todavía no estoy segurx pero TAL VEZ voy, con posiblemente ${acompanantes} acompañante(s)`;
  } else {
    mensaje = `¡Hola! Soy ${nombre}. No voy a poder ir a tu Spooky Cumple :(( ¡que la pases increíble!`;
  }
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    mensaje
  )}`;

  statusMsg.textContent = "¡Listo! Te llevamos a WhatsApp para confirmar...";
  setTimeout(() => {
    window.open(waUrl, "_blank");
    enviarBtn.disabled = false;
  }, 600);
});

// ---- Fill in real links ----
document.querySelector(".maps-btn").href = MAPS_LINK;
document.querySelector(".spotify-btn").href = SPOTIFY_LINK;
