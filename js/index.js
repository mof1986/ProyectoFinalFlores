// Seleccionamos el botón de información y agregamos el evento
document.getElementById("info-btn").addEventListener("click", mostrarInformacion);

// Mostramos una ventana emergente con las características principales del simulador de tienda. 
function mostrarInformacion() {
    Swal.fire({
        title: "Información Importante",
        text: "Esto es un simulador, parte de un trabajo final del curso de JS de Coderhouse. Algunas ft:",
        html: `
            <ul style="text-align: left;">
                <li>Productos con stock actualizado en tiempo real.</li>
                <li>Carrito de compras con opciones de modificación rápida.</li>
                <li>Gestión de envíos con selección de país, provincia y localidad.</li>
                <li>No hay autenticación de usr pero se muestra el "Modo administrador" para mostrar funcionalidades (ABM de productos).</li>
                <li>Notificaciones visuales con SweetAlert y Toastify.</li>
                <li>Formulario de compra precargado para agilizar pruebas.</li>
                <li>Generación de comprobantes de compra en PDF.</li>
                <li>Soporte para datos almacenados en Local Storage y JSON.</li>
            </ul>
        `,
        footer: "Esto es un simulador, parte del entregable final del curso de JS Coderhouse -65350-",
        icon: "info",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#007bff"
    });
}
