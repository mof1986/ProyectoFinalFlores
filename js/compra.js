// ⭐️ Variables Globales
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const productos = JSON.parse(localStorage.getItem("productos")) || [];
let paises = [];
let provincias = [];
let localidades = [];

// 🛠️ Cargar datos desde JSON
async function cargarDatosUbicacion() {
    try {
        const response = await fetch("../db/localidades.json");
        if (!response.ok) throw new Error("Error al cargar datos de ubicación");
        const data = await response.json();

        paises = Array.isArray(data.paises) ? data.paises : [];
        provincias = Array.isArray(data.provincias) ? data.provincias : [];
        localidades = Array.isArray(data.localidades) ? data.localidades : [];

        cargarPaises();
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// 🔄 Renderizar Resumen de Compra antes de confirmar
function renderizarResumenCompra() {
    const resumenContainer = document.getElementById("resumen-compra");
    if (!resumenContainer) return;

    resumenContainer.innerHTML = `<h3>Resumen de Compra</h3>`;

    let totalCompra = 0;
    carrito.forEach(item => {
        const subtotal = item.cantidad * item.precio;
        totalCompra += subtotal;

        const producto = productos.find(p => p.id === item.id);
        const imagenURL = producto && producto.imagen ? producto.imagen : "../images/default.png";

        resumenContainer.innerHTML += `
            <div class="d-flex align-items-center border-bottom pb-2">
                <img src="${imagenURL}" alt="${item.nombre}" class="img-thumbnail me-3" style="width: 80px; height: 80px; object-fit: cover;">
                <div class="flex-grow-1">
                    <h5>${item.nombre}</h5>
                    <p>${item.cantidad} x $${item.precio} = $${subtotal}</p>
                </div>
            </div>
        `;
    });

    resumenContainer.innerHTML += `<h4>Total: $${totalCompra}</h4>`;
}

// ✅ Confirmar Compra - Mostrar Resumen antes de la Confirmación
function confirmarCompra(event) {
    event.preventDefault(); // Evita que la página recargue

    renderizarResumenCompra(); // Mostrar resumen antes de confirmar

    Swal.fire({
        title: "Confirmar Compra",
        html: document.getElementById("resumen-compra").innerHTML,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            const numeroPedido = generarNumeroPedido();
            mostrarCompraExitosa(numeroPedido);
        }
    });
}

// ⭐️ Generar número de pedido solo al confirmar compra (Formato: X-YYYY)
function generarNumeroPedido() {
    let ultimoNumeroPedido = parseInt(localStorage.getItem("ultimoNumeroPedido")) || 0;
    let ultimaLetraPedido = localStorage.getItem("ultimaLetraPedido") || "A";

    if (ultimoNumeroPedido >= 9999) {
        ultimaLetraPedido = String.fromCharCode(ultimaLetraPedido.charCodeAt(0) + 1);
        ultimoNumeroPedido = 1;
    } else {
        ultimoNumeroPedido++;
    }

    localStorage.setItem("ultimoNumeroPedido", ultimoNumeroPedido);
    localStorage.setItem("ultimaLetraPedido", ultimaLetraPedido);

    return `${ultimaLetraPedido}-${String(ultimoNumeroPedido).padStart(4, "0")}`;
}

// ✅ Mostrar mensaje de compra exitosa con opción de descargar PDF
function mostrarCompraExitosa(numeroPedido) {
    const mainContainer = document.querySelector("main");
    mainContainer.innerHTML = `
        <div class="text-center">
            <h1>¡Compra Exitosa!</h1>
            <p>Tu pedido ha sido registrado con el ID: <strong>${numeroPedido}</strong>.</p>
            <button class="btn btn-primary" onclick="generarPDF('${numeroPedido}')">Descargar PDF</button>
            <a href="../index.html" class="btn btn-success">Volver al Inicio</a>
        </div>
    `;

    // Vaciar carrito después de la compra
    localStorage.removeItem("carrito");
}

// 📄 Generar y Descargar PDF con resumen de compra
function generarPDF(numeroPedido) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Comprobante de Compra", 20, 20);
    doc.setFontSize(14);
    doc.text(`Número de Pedido: ${numeroPedido}`, 20, 30);
    doc.text("Resumen de Compra:", 20, 40);

    let y = 50;
    carrito.forEach(item => {
        doc.text(`- ${item.cantidad} x ${item.nombre} - $${item.precio}`, 20, y);
        y += 10;
    });

    doc.text("Gracias por tu compra.", 20, y + 20);
    doc.save(`Pedido_${numeroPedido}.pdf`);
}

// ✅ Cargar los países en el select
function cargarPaises() {
    const paisSelect = document.getElementById("pais");
    if (!paisSelect) return;

    paisSelect.innerHTML = `<option value="">Seleccionar País</option>` +
        paises.map(pais => `<option value="${pais}">${pais}</option>`).join("");
}

// ✅ Habilitar provincias al seleccionar un país
function actualizarProvincias() {
    const paisSeleccionado = document.getElementById("pais").value;
    const provinciaSelect = document.getElementById("provincia");

    provinciaSelect.innerHTML = `<option value="">Seleccionar Provincia</option>`;
    if (!paisSeleccionado) {
        provinciaSelect.disabled = true;
        return;
    }

    const provinciasFiltradas = provincias.filter(prov => prov.pais === paisSeleccionado);
    provinciaSelect.innerHTML += provinciasFiltradas.map(prov => `<option value="${prov.nombre}">${prov.nombre}</option>`).join("");
    provinciaSelect.disabled = false;

    actualizarLocalidades(); // Reiniciar localidades
}

// ✅ Cargar localidades al seleccionar provincia
function actualizarLocalidades() {
    const provinciaSeleccionada = document.getElementById("provincia").value;
    const localidadSelect = document.getElementById("localidad");

    localidadSelect.innerHTML = `<option value="">Seleccionar Localidad</option>`;
    if (!provinciaSeleccionada) {
        localidadSelect.disabled = true;
        return;
    }

    const localidadesFiltradas = localidades.filter(loc => loc.provincia === provinciaSeleccionada);
    localidadSelect.innerHTML += localidadesFiltradas.map(loc => `<option value="${loc.nombre}">${loc.nombre}</option>`).join("");
    localidadSelect.disabled = false;
}

// 📌 Inicializar carga de datos
document.getElementById("form-envio").addEventListener("submit", confirmarCompra);
cargarDatosUbicacion();
