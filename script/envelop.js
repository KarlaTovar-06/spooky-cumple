import { z } from "https://cdn.jsdelivr.net/npm/zod@3/+esm";

// ---- Config ----
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw0tBV_u3i6-WnpNsBKM1iIDZrlDqiT74ON2PzQf31Mzr3SJaFqHZJIsTNfxjFZ88Gw/exec";
const WHATSAPP_NUMBER = "525633794668";
const MAPS_LINK = "https://maps.app.goo.gl/9EGbhjSng3CxiDMVA?g_st=ic";
const SPOTIFY_LINK =
  "https://open.spotify.com/playlist/5sKXw25zT3VBtTCU7kKZim?si=QsY2cypeQPuPIwGpdTw7Sg&utm_source=copy-link&pt=8aca3b0021ab4b3639575d43dcce8c7e&pi=IB1mbT55QbOeG";

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
const MAX_ACOMPANANTES = 3;

const choiceButtons = document.querySelectorAll(
  "#asistencia-group .choice-btn"
);
const choiceGroup = document.getElementById("asistencia-group");
const acompField = document.getElementById("acompanantes-field");
const enviarBtn = document.getElementById("enviar-btn");
const nombreInput = document.getElementById("nombre");
const countSpan = document.getElementById("acompanantes-count");
const statusMsg = document.getElementById("status-msg");
const stepperHint = document.getElementById("stepper-hint");

// ---- Validation schema (Zod) ----
const rsvpSchema = z.object({
  nombre: z.string().trim().min(1, "¿Y tu nombre? Sin nombre no hay pastel."),
  asistencia: z.enum(["Sí voy", "Tal vez", "No voy"], {
    errorMap: () => ({ message: "Elige si vienes o no, no seas misteriosx." }),
  }),
  acompanantes: z.number().int().min(0).max(MAX_ACOMPANANTES),
});

function paintErrors(issues) {
  clearErrors();
  issues.forEach((issue) => {
    if (issue.path[0] === "nombre") nombreInput.classList.add("error");
    if (issue.path[0] === "asistencia") choiceGroup.classList.add("error");
  });
  statusMsg.textContent = issues[0].message;
}

function clearErrors() {
  nombreInput.classList.remove("error");
  choiceGroup.classList.remove("error");
}

choiceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    choiceButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    asistencia = btn.dataset.value;
    acompField.style.display = asistencia === "No voy" ? "none" : "block";
    choiceGroup.classList.remove("error");
  });
});

document.getElementById("mas").addEventListener("click", () => {
  if (acompanantes < MAX_ACOMPANANTES) {
    acompanantes++;
  } else {
    stepperHint.classList.add("show");
  }
  countSpan.textContent = acompanantes;
});
document.getElementById("menos").addEventListener("click", () => {
  if (acompanantes > 0) acompanantes--;
  countSpan.textContent = acompanantes;
  stepperHint.classList.remove("show");
});

nombreInput.addEventListener("input", () =>
  nombreInput.classList.remove("error")
);

enviarBtn.addEventListener("click", async () => {
  // 0. Validar con Zod — si falla, casillas en rojo y no seguimos
  const result = rsvpSchema.safeParse({
    nombre: nombreInput.value,
    asistencia,
    acompanantes,
  });

  if (!result.success) {
    paintErrors(result.error.issues);
    return;
  }
  clearErrors();

  const nombre = result.data.nombre;
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
    // Navegación directa (no popup): en móvil wa.me abre la app,
    // window.open después del await perdía el gesto del usuario.
    window.location.href = waUrl;
  }, 600);
});

// ---- Fill in real links ----
document.querySelector(".maps-btn").href = MAPS_LINK;
document.querySelector(".spotify-btn").href = SPOTIFY_LINK;
