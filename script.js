const pantallaInicio = document.getElementById("pantallaInicio");
const pantallaJuego = document.getElementById("pantallaJuego");
const tablero = document.getElementById("tablero");
const mensaje = document.getElementById("mensaje");
const progreso = document.getElementById("progreso");

const btnAgregar = document.getElementById("btnAgregar");
const btnHecho = document.getElementById("btnHecho");
const btnIniciar = document.getElementById("btnIniciar");

const selectorColores = document.getElementById("selectorColores");
const botonesColores = document.getElementById("botonesColores");

const overlay = document.getElementById("overlay");
const cajaGrande = document.getElementById("cajaGrande");
const gatoGrande = document.getElementById("gatoGrande");
const resultadoTexto = document.getElementById("resultadoTexto");
const sonidosGato = [
document.getElementById("sonidoGato1"),
document.getElementById("sonidoGato2"),
document.getElementById("sonidoGato3"),
document.getElementById("sonidoGato4")
];

const sonidosConfeti = [
document.getElementById("sonidoConfeti1"),
document.getElementById("sonidoConfeti2")
];

const btnInspeccion = document.getElementById("btnInspeccion");
const btnConfirmarInspeccion = document.getElementById("btnConfirmarInspeccion");
const btnCancelarInspeccion = document.getElementById("btnCancelarInspeccion");

const btnFila = document.getElementById("btnFila");
const btnConfirmarFila = document.getElementById("btnConfirmarFila");
const btnCancelarFila = document.getElementById("btnCancelarFila");

let columnas = 0;
let filas = 0;
let totalCajas = 0;

let modo = "inicio"; 
let colorActual = null;
let seleccionActual = [];
let gatosRegistrados = [];
let gatosFinales = [];
let coloresUsados = [];
let animacionActiva = false;

let modoAnterior = null;
let areaInspeccionActual = [];

let filaActual = [];
let abriendoFila = false;

const colores = [
{ nombre: "azul", valor: "#3b82f6" },
{ nombre: "rojo", valor: "#ef4444" },
{ nombre: "verde", valor: "#22c55e" },
{ nombre: "naranja", valor: "#f97316" },
{ nombre: "morado", valor: "#a855f7" },
{ nombre: "rosa", valor: "#ec4899" }
];

function elegirTablero(cols, rows) {
columnas = cols;
filas = rows;
totalCajas = columnas * filas;

pantallaInicio.classList.add("oculto");
pantallaJuego.classList.remove("oculto");

generarTablero();
actualizarProgreso();

modo = "preparacion";
mensaje.textContent = "Presiona “Añadir gatos” para que un jugador esconda sus 3 gatos.";
}

function generarTablero() {
tablero.innerHTML = "";
tablero.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;

for (let i = 1; i <= totalCajas; i++) {
const caja = document.createElement("div");
caja.classList.add("caja");
caja.dataset.numero = i;
caja.addEventListener("click", () => manejarClickCaja(i, caja));
tablero.appendChild(caja);
}
}

function abrirSelectorColores() {
if (modo === "juego") return;

selectorColores.classList.remove("oculto");
botonesColores.innerHTML = "";
seleccionActual = [];
colorActual = null;
limpiarSeleccionVisual();

mensaje.textContent = "Elige un color disponible para este jugador.";

colores.forEach(color => {
const boton = document.createElement("button");
boton.classList.add("color-btn");
boton.style.background = color.valor;
boton.title = color.nombre;

if (coloresUsados.includes(color.nombre)) {
    boton.classList.add("usado");
}

boton.addEventListener("click", () => seleccionarColor(color.nombre));

botonesColores.appendChild(boton);
});
}

function seleccionarColor(color) {
colorActual = color;
modo = "seleccion";
seleccionActual = [];

selectorColores.classList.add("oculto");
btnHecho.classList.remove("oculto");

mensaje.textContent = `Color elegido: ${color}. Selecciona 3 cajas para esconder tus gatos.`;
}

function manejarClickCaja(numero, elemento) {
if (animacionActiva || abriendoFila) return;

if (modo === "seleccion") {
seleccionarCajaPreparacion(numero, elemento);
return;
}

if (modo === "inspeccion") {
seleccionarAreaInspeccion(numero);
return;
}

if (modo === "fila") {
seleccionarFila(numero);
return;
}

if (modo === "juego") {
revelarCaja(numero, elemento);
}
}


function seleccionarCajaPreparacion(numero, elemento) {
if (!colorActual) {
mensaje.textContent = "Primero elige un color.";
return;
}

const yaSeleccionada = seleccionActual.includes(numero);

if (yaSeleccionada) {
seleccionActual = seleccionActual.filter(n => n !== numero);
elemento.classList.remove("seleccionada");
mensaje.textContent = `Selecciona ${3 - seleccionActual.length} caja(s) más.`;
return;
}

if (seleccionActual.length >= 3) {
mensaje.textContent = "Solo puedes seleccionar 3 cajas.";
return;
}

seleccionActual.push(numero);
elemento.classList.add("seleccionada");

const faltan = 3 - seleccionActual.length;

if (faltan === 0) {
mensaje.textContent = "Listo. Presiona “Hecho” para ocultar tus gatos.";
} else {
mensaje.textContent = `Selecciona ${faltan} caja(s) más.`;
}
}

function guardarGatos() {
if (modo !== "seleccion") return;

if (seleccionActual.length !== 3) {
mensaje.textContent = "Debes seleccionar exactamente 3 cajas.";
return;
}

seleccionActual.forEach(posicion => {
gatosRegistrados.push({
    posicion,
    color: colorActual,
    sistema: false
});
});

coloresUsados.push(colorActual);

seleccionActual = [];
colorActual = null;
modo = "preparacion";

limpiarSeleccionVisual();
btnHecho.classList.add("oculto");
selectorColores.classList.add("oculto");

mensaje.textContent = "Gatos ocultos. Pasa el dispositivo al siguiente jugador.";
actualizarProgreso();

if (coloresUsados.length >= colores.length) {
btnAgregar.disabled = true;
mensaje.textContent = "Todos los colores fueron usados. Ya puedes iniciar el juego.";
}
}

function limpiarSeleccionVisual() {
document.querySelectorAll(".caja").forEach(caja => {
caja.classList.remove("seleccionada");
});
}

function actualizarProgreso() {
progreso.textContent = `Jugadores listos: ${coloresUsados.length} / mínimo 2`;
}

function iniciarJuego() {
if (coloresUsados.length < 2) {
mensaje.textContent = "Se necesitan al menos 2 jugadores para comenzar 🐾";
return;
}

resolverRepetidos();

modo = "juego";
btnAgregar.classList.add("oculto");
btnHecho.classList.add("oculto");
btnIniciar.classList.add("oculto");
btnInspeccion.classList.remove("oculto");
btnFila.classList.remove("oculto");
selectorColores.classList.add("oculto");

limpiarSeleccionVisual();

mensaje.textContent = "Juego iniciado. Toca una caja para probar tu suerte.";
}

function resolverRepetidos() {
gatosFinales = [];
const posicionesOcupadas = new Set();

gatosRegistrados.forEach(gato => {
if (!posicionesOcupadas.has(gato.posicion)) {
    gatosFinales.push(gato);
    posicionesOcupadas.add(gato.posicion);
} else {
    const nuevaPosicion = obtenerPosicionLibre(posicionesOcupadas);

    if (nuevaPosicion !== null) {
    gatosFinales.push({
        posicion: nuevaPosicion,
        color: "normal",
        sistema: true
    });

    posicionesOcupadas.add(nuevaPosicion);
    }
}
});
}

function obtenerPosicionLibre(posicionesOcupadas) {
const libres = [];

for (let i = 1; i <= totalCajas; i++) {
if (!posicionesOcupadas.has(i)) {
    libres.push(i);
}
}

if (libres.length === 0) return null;

const indiceRandom = Math.floor(Math.random() * libres.length);
return libres[indiceRandom];
}

function revelarCaja(numero, elemento) {
if (elemento.classList.contains("hueco")) return;

animacionActiva = true;

const gatoEncontrado = gatosFinales.find(gato => gato.posicion === numero);
if (gatoEncontrado) {
gatosFinales = gatosFinales.filter(gato => gato.posicion !== numero);
}

overlay.classList.remove("oculto");
cajaGrande.classList.remove("oculto", "pop");
gatoGrande.classList.add("oculto");
gatoGrande.src = "";
resultadoTexto.textContent = "";

setTimeout(() => {
cajaGrande.classList.add("pop");
}, 1400);

setTimeout(() => {
cajaGrande.classList.add("oculto");

if (gatoEncontrado) {
    mostrarResultadoGato(gatoEncontrado);
} else {
    mostrarResultadoSeguro();
}
}, 1850);

setTimeout(() => {
overlay.classList.add("oculto");
elemento.classList.add("hueco");
animacionActiva = false;
mensaje.textContent = "Elige otra caja cuando sea tu turno.";
}, 3600);
}

function mostrarResultadoSeguro() {
resultadoTexto.textContent = "¡Estás a salvo! 🐾";
lanzarConfeti();
reproducirSonidoConfeti();
}

function mostrarResultadoGato(gato) {
const nombreArchivo = gato.sistema ? "normal" : gato.color;

gatoGrande.src = `img/gato-${nombreArchivo}.png`;
gatoGrande.classList.remove("oculto");

if (gato.sistema) {
resultadoTexto.textContent = "¡Gato misterioso! Pierdes una vida 💔";
} else {
resultadoTexto.textContent = `¡Gato ${gato.color}! Pierdes una vida 💔`;
}

reproducirSonidoGato();
}

function lanzarConfeti() {
if (typeof confetti !== "function") return;

confetti({
particleCount: 90,
spread: 70,
origin: { y: 0.65 },
colors: ["#f7c6ff", "#a855f7", "#3b82f6", "#f97316", "#ffffff"]
});
}

let ultimoConfeti = -1;

function reproducirSonidoConfeti() {
let indice;

do {
indice = Math.floor(Math.random() * sonidosConfeti.length);
} while (indice === ultimoConfeti && sonidosConfeti.length > 1);

ultimoConfeti = indice;

const sonido = sonidosConfeti[indice];
sonido.currentTime = 0;
sonido.play().catch(() => {});
}



let ultimoSonido = -1;

function reproducirSonidoGato() {
let indice;

do {
indice = Math.floor(Math.random() * sonidosGato.length);
} while (indice === ultimoSonido);

ultimoSonido = indice;

const sonido = sonidosGato[indice];

sonido.currentTime = 0;
sonido.play().catch(() => {});
}

function activarInspeccion() {
if (modo !== "juego" || animacionActiva) return;

modoAnterior = modo;
modo = "inspeccion";
areaInspeccionActual = [];

limpiarMarcasInspeccion();

btnInspeccion.classList.add("oculto");
btnConfirmarInspeccion.classList.remove("oculto");
btnCancelarInspeccion.classList.remove("oculto");

mensaje.textContent = "Elige una caja para revisar una zona 3x3 🐾";
}

function seleccionarAreaInspeccion(numero) {
limpiarMarcasInspeccion();

let area = obtenerArea3x3(numero);

// Si no cabe, intenta mover automáticamente hacia arriba/izquierda
if (!area) {
const indice = numero - 1;
let fila = Math.floor(indice / columnas);
let col = indice % columnas;

fila = Math.min(fila, filas - 3);
col = Math.min(col, columnas - 3);

const nuevoNumero = fila * columnas + col + 1;
area = obtenerArea3x3(nuevoNumero);
}

areaInspeccionActual = area;

areaInspeccionActual.forEach(numero => {
const caja = document.querySelector(`.caja[data-numero="${numero}"]`);

if (caja && !caja.classList.contains("hueco")) {
    caja.classList.add("inspeccion-preview");
}
});

mensaje.textContent = "Zona 3x3 seleccionada. Presiona “Hecho” para revisar.";
}

function confirmarInspeccion() {
if (modo !== "inspeccion") return;

if (areaInspeccionActual.length === 0) {
mensaje.textContent = "Primero selecciona una zona 3x3.";
return;
}

limpiarMarcasInspeccion();

const gatosEnArea = gatosFinales.filter(gato => {
const caja = document.querySelector(`.caja[data-numero="${gato.posicion}"]`);

return (
    areaInspeccionActual.includes(gato.posicion) &&
    caja &&
    !caja.classList.contains("hueco")
);
});

const claseResultado = gatosEnArea.length > 0
? "inspeccion-peligro"
: "inspeccion-segura";

areaInspeccionActual.forEach(numero => {
const caja = document.querySelector(`.caja[data-numero="${numero}"]`);

if (caja && !caja.classList.contains("hueco")) {
    caja.classList.add(claseResultado);
}
});

if (gatosEnArea.length > 0) {
mensaje.textContent = `Hay ${gatosEnArea.length} gato(s) oculto(s) en esta zona 🐈‍⬛`;
} else {
mensaje.textContent = "Aquí están a salvo 🐾";
}

btnConfirmarInspeccion.classList.add("oculto");
btnCancelarInspeccion.classList.add("oculto");
btnInspeccion.classList.remove("oculto");

modo = "juego";

setTimeout(() => {
limpiarMarcasInspeccion();
mensaje.textContent = "Elige una caja cuando sea tu turno.";
}, 4000);
}

function cancelarInspeccion() {
limpiarMarcasInspeccion();

areaInspeccionActual = [];
modo = "juego";

btnConfirmarInspeccion.classList.add("oculto");
btnCancelarInspeccion.classList.add("oculto");
btnInspeccion.classList.remove("oculto");

mensaje.textContent = "Inspección cancelada. Elige una caja cuando sea tu turno.";
}

function limpiarMarcasInspeccion() {
document.querySelectorAll(".caja").forEach(caja => {
caja.classList.remove(
    "inspeccion-preview",
    "inspeccion-segura",
    "inspeccion-peligro"
);
});
}

function obtenerArea3x3(numeroInicio) {
const indice = numeroInicio - 1;
const filaInicio = Math.floor(indice / columnas);
const columnaInicio = indice % columnas;

// Si desde esa caja no cabe un 3x3 completo, no permite seleccionar
if (filaInicio + 2 >= filas || columnaInicio + 2 >= columnas) {
return null;
}

const area = [];

for (let fila = filaInicio; fila < filaInicio + 3; fila++) {
for (let columna = columnaInicio; columna < columnaInicio + 3; columna++) {
    const numero = fila * columnas + columna + 1;
    area.push(numero);
}
}

return area;
}
function activarFila() {
if (modo !== "juego" || animacionActiva || abriendoFila) return;

modo = "fila";
filaActual = [];

limpiarMarcasFila();

btnFila.classList.add("oculto");
btnInspeccion.classList.add("oculto");

btnConfirmarFila.classList.remove("oculto");
btnCancelarFila.classList.remove("oculto");

mensaje.textContent = "Elige una fila completa para abrirla";
}

function seleccionarFila(numero) {
limpiarMarcasFila();

const indice = numero - 1;
const fila = Math.floor(indice / columnas);

filaActual = [];

for (let col = 0; col < columnas; col++) {
const numeroCaja = fila * columnas + col + 1;
filaActual.push(numeroCaja);

const caja = document.querySelector(`.caja[data-numero="${numeroCaja}"]`);

if (caja && !caja.classList.contains("hueco")) {
    caja.classList.add("fila-preview");
}
}

mensaje.textContent = "Fila seleccionada. Presiona “Hecho” para abrirla.";
}

async function confirmarFila() {
if (modo !== "fila") return;

if (filaActual.length === 0) {
mensaje.textContent = "Primero selecciona una fila.";
return;
}

abriendoFila = true;
modo = "animandoFila";

btnConfirmarFila.classList.add("oculto");
btnCancelarFila.classList.add("oculto");

limpiarMarcasFila();

mensaje.textContent = "La fila se está abriendo...";

for (const numero of filaActual) {
const caja = document.querySelector(`.caja[data-numero="${numero}"]`);

if (caja && !caja.classList.contains("hueco")) {
    await revelarCajaEnFila(numero, caja);
}
}

filaActual = [];
abriendoFila = false;
modo = "juego";

btnFila.classList.remove("oculto");
btnInspeccion.classList.remove("oculto");

mensaje.textContent = "La fila terminó de abrirse. Continúa el juego.";
}

function cancelarFila() {
limpiarMarcasFila();

filaActual = [];
modo = "juego";

btnConfirmarFila.classList.add("oculto");
btnCancelarFila.classList.add("oculto");

btnFila.classList.remove("oculto");
btnInspeccion.classList.remove("oculto");

mensaje.textContent = "Cancelada. Elige una caja cuando sea tu turno.";
}

function limpiarMarcasFila() {
document.querySelectorAll(".caja").forEach(caja => {
caja.classList.remove("fila-preview");
});
}

function revelarCajaEnFila(numero, elemento) {
return new Promise(resolve => {
const gatoEncontrado = gatosFinales.find(gato => gato.posicion === numero);

if (gatoEncontrado) {
    gatosFinales = gatosFinales.filter(gato => gato.posicion !== numero);
}

overlay.classList.remove("oculto");
cajaGrande.classList.remove("oculto", "pop");
gatoGrande.classList.add("oculto");
gatoGrande.src = "";
resultadoTexto.textContent = "";

setTimeout(() => {
    cajaGrande.classList.add("pop");
}, 800);

setTimeout(() => {
    cajaGrande.classList.add("oculto");

    if (gatoEncontrado) {
    mostrarResultadoGato(gatoEncontrado);
    } else {
    mostrarResultadoSeguro();
    }
}, 1150);

setTimeout(() => {
    overlay.classList.add("oculto");
    elemento.classList.add("hueco");
    resolve();
}, 2300);
});
}