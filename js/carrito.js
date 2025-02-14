// Cargamos los datos almacenados en LocalStorage
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const productos = JSON.parse(localStorage.getItem("productos")) || [];

// Guardamos los datos en LocalStorage
function guardarDatos() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    localStorage.setItem("productos", JSON.stringify(productos));
}

// Renderizamos los productos agregados al carrito
function renderizarCarrito() {
    const carritoList = document.getElementById("carrito-list");
    const carritoTotales = document.getElementById("carrito-totales");

    carritoList.innerHTML = "";
    carritoTotales.innerHTML = "";

    if (carrito.length === 0) {
        carritoList.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
        return;
    }

    let totalCompra = 0;

    carrito.forEach((item) => {
        const subtotal = item.cantidad * item.precio;
        totalCompra += subtotal;

        const producto = productos.find((p) => p.id === item.id);
        const imagenURL = producto?.imagen || "../images/default.png";

        carritoList.innerHTML += `
            <div class="col-md-12 mb-3">
                <div class="d-flex align-items-center border-bottom pb-2 border-secondary">
                    <img src="${imagenURL}" alt="${item.nombre}" class="img-thumbnail me-3" style="width: 80px; height: 80px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h5>${item.nombre}</h5>
                        <p>${item.cantidad} x $${item.precio} = $${subtotal}</p>
                        <div>
                            <button class="btn btn-danger btn-sm" onclick="actualizarCantidadCarrito(${item.id}, -1)">-</button>
                            <span id="cantidad-carrito-${item.id}" class="mx-2">${item.cantidad}</span>
                            <button class="btn btn-success btn-sm" onclick="actualizarCantidadCarrito(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="btn btn-danger btn-sm ms-3" onclick="confirmarEliminarProducto(${item.id})">Eliminar</button>
                </div>
            </div>
        `;
    });

    carritoTotales.innerHTML = `
        <h4>Total: $${totalCompra}</h4>
        <button class="btn btn-success me-2" onclick="window.location.href='./compra.html'">Pagar</button>
        <button class="btn btn-danger" onclick="confirmarLimpiarCarrito()">Vaciar Carrito</button>
    `;
}

// Actualizamos la cantidad de productos en el carrito
function actualizarCantidadCarrito(id, cambio) {
    const item = carrito.find((p) => p.id === id);
    if (!item) return;

    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    let nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad > producto.stock) return;
    if (nuevaCantidad < 1) {
        Swal.fire({
            title: "¿Eliminar producto?",
            text: "¿Deseas eliminar este producto del carrito?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarDelCarrito(id);
            }
        });
        return;
    }

    item.cantidad = nuevaCantidad;
    document.getElementById(`cantidad-carrito-${id}`).textContent = nuevaCantidad;
    guardarDatos();
    renderizarCarrito();
}

// Confirmamos la eliminación de un producto del carrito
function confirmarEliminarProducto(id) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Este producto será eliminado del carrito.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarDelCarrito(id);
        }
    });
}

// Eliminamos un producto del carrito y devolvemos el stock
function eliminarDelCarrito(id) {
    carrito.forEach((item, index) => {
        if (item.id === id) {
            const producto = productos.find((p) => p.id === id);
            if (producto) {
                producto.stock += item.cantidad;
            }
            carrito.splice(index, 1);
        }
    });

    guardarDatos();
    renderizarCarrito();
}

// Confirmamos la acción de vaciar todo el carrito
function confirmarLimpiarCarrito() {
    Swal.fire({
        title: "¿Vaciar carrito?",
        text: "Esta acción eliminará todos los productos del carrito.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, vaciar",
        cancelButtonText: "Cancelar",
    }).then((result) => {
        if (result.isConfirmed) {
            limpiarCarrito();
        }
    });
}

// Vaciamos el carrito y devolvemos el stock a los productos
function limpiarCarrito() {
    carrito.forEach((item) => {
        const producto = productos.find((p) => p.id === item.id);
        if (producto) {
            producto.stock += item.cantidad;
        }
    });
    carrito.length = 0;
    guardarDatos();
    renderizarCarrito();
}

// Simulamos un mensaje para la función de pago no implementada
function pagar() {
    Swal.fire({
        title: "Funcionalidad no disponible",
        text: "La funcionalidad de pago aún no está implementada.",
        icon: "info",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido",
    });
}

// Renderizamos el carrito al cargar la página
renderizarCarrito();
