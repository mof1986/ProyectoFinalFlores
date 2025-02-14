const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const productos = JSON.parse(localStorage.getItem("productos")) || [];
let paises = [], provincias = [], localidades = [];

// Cargar datos de ubicación desde JSON
async function cargarDatosUbicacion() {
    try {
        const response = await fetch("../db/localidades.json");
        if (!response.ok) throw new Error("Error al cargar datos de ubicación");
        const data = await response.json();

        paises = data.paises || [];
        provincias = data.provincias || [];
        localidades = data.localidades || [];

        cargarPaises();
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Renderizar resumen de compra
function renderizarResumenCompra() {
    const resumenContainer = document.getElementById("resumen-compra");
    if (!resumenContainer) return;

    resumenContainer.innerHTML = `<h3>Resumen de Compra</h3>`;
    let totalCompra = 0;

    carrito.forEach(item => {
        const subtotal = item.cantidad * item.precio;
        totalCompra += subtotal;

        const producto = productos.find(p => p.id === item.id);
        const imagenURL = producto?.imagen || "../images/default.png";

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

// Confirmar compra con SweetAlert
function confirmarCompra(event) {
    event.preventDefault();
    renderizarResumenCompra();

    // Guardamos los datos del formulario
    const datosEnvio = {
        nombre: document.getElementById("nombre").value,
        dni: document.getElementById("dni").value,
        pais: document.getElementById("pais").value,
        provincia: document.getElementById("provincia").value,
        localidad: document.getElementById("localidad").value,
        calle: document.getElementById("calle").value,
        numero: document.getElementById("numero").value,
        piso: document.getElementById("piso").value || "-",
        departamento: document.getElementById("departamento").value || "-",
        notas: document.getElementById("notas").value || "Sin observaciones."
    };

    localStorage.setItem("datosEnvio", JSON.stringify(datosEnvio));

    Swal.fire({
        title: "¿Desea confirmar la compra?",
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

// Generar número de pedido con prefijo de letra
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

// Mostrar mensaje de compra exitosa y actualizar stock gral del producto
function mostrarCompraExitosa(numeroPedido) {
    //Restamos cantidad comprada del stock gral.
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            producto.stock -= item.cantidad; 
        }
    });

    document.querySelector("main").innerHTML = `
        <div class="text-center">
            <h1>¡Compra Exitosa!</h1>
            <p>Tu pedido ha sido registrado con el ID: <strong>${numeroPedido}</strong>.</p>
            <button class="btn btn-primary" onclick="generarPDF('${numeroPedido}')">Descargar PDF</button>
            <a href="../index.html" class="btn btn-success">Volver al Inicio</a>
        </div>
    `;
    localStorage.setItem("productos", JSON.stringify(productos)); //guardamos nuevo stock
    localStorage.removeItem("carrito"); // Vaciamos carrito
}

//Generar y descargar un PDF con detalles de la compra y envío
function generarPDF(numeroPedido) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error("jsPDF no está cargado correctamente.");
        alert("Error al generar PDF. Asegúrate de que jsPDF se haya cargado.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Recuperamos los datos del comprador y envío
    const datosEnvio = JSON.parse(localStorage.getItem("datosEnvio")) || {};

    // Encabezado de la tienda
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Mi Tienda Online", 20, 20);

    // Fecha de la compra
    const fechaCompra = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    doc.setFontSize(12);
    doc.text(`Fecha de Compra: ${fechaCompra}`, 150, 20);

    doc.setFontSize(12);
    doc.text(`Número de Pedido: ${numeroPedido}`, 20, 30);
    doc.line(20, 35, 190, 35);

    // Datos del comprador y envío
    doc.setFontSize(14);
    doc.text("Datos del Envío", 20, 45);
    doc.setFont("helvetica", "normal");

    let y = 55;
    doc.text(`• Nombre: ${datosEnvio.nombre || "No especificado"}`, 20, y);
    doc.text(`• DNI: ${datosEnvio.dni || "No especificado"}`, 20, y + 10);
    doc.text(`• Dirección: ${datosEnvio.calle || "No especificado"} ${datosEnvio.numero || "-"}`, 20, y + 20);
    doc.text(`• Piso: ${datosEnvio.piso || "-"}`, 20, y + 30);
    doc.text(`• Depto: ${datosEnvio.departamento || "-"}`, 20, y + 40);
    doc.text(`• Localidad: ${datosEnvio.localidad || "No especificado"}`, 20, y + 50);
    doc.text(`• Provincia: ${datosEnvio.provincia || "No especificado"}`, 20, y + 60);
    doc.text(`• País: ${datosEnvio.pais || "No especificado"}`, 20, y + 70);
    doc.text(`• Notas: ${datosEnvio.notas || "Sin observaciones."}`, 20, y + 80);

    y += 90;
    doc.line(20, y, 190, y);

    // Resumen de Compra
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Resumen de Compra", 20, y);
    doc.setFont("helvetica", "normal");

    y += 10;
    let totalCompra = 0;

    carrito.forEach(item => {
        const subtotal = item.cantidad * item.precio;
        totalCompra += subtotal;

        doc.text(`• ${item.cantidad} x ${item.nombre} - $${item.precio} c/u`, 20, y);
        doc.text(`Subtotal: $${subtotal}`, 150, y);
        y += 10;
    });

    doc.line(20, y, 190, y);
    y += 10;

    // Total de la compra
    doc.setFont("helvetica", "bold");
    doc.text(`Total de la compra: $${totalCompra}`, 20, y);
    y += 15;

    doc.setFont("helvetica", "normal");
    doc.text("Gracias por tu compra. ¡Esperamos tu visita nuevamente!", 20, y);

    // Guardamos PDF con nombre dinámico
    doc.save(`Pedido_${numeroPedido}.pdf`);
}

// Cargar países en el select
function cargarPaises() {
    const paisSelect = document.getElementById("pais");
    if (!paisSelect) return;

    paisSelect.innerHTML = `<option value="">Seleccionar País</option>` +
        paises.map(pais => `<option value="${pais}">${pais}</option>`).join("");
}

// Mostramos provincias según país seleccionado
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
    actualizarLocalidades();
}

// Mostramos localidades según provincia seleccionada
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

// Inicializar eventos y datos
document.getElementById("form-envio").addEventListener("submit", confirmarCompra);
cargarDatosUbicacion();
