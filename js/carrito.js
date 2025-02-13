// Función para carga de datos desde LocalStorage
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
const productos = JSON.parse(localStorage.getItem("productos")) || [];

// Función para guardado de datos en LocalStorage
function guardarDatos() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("productos", JSON.stringify(productos));
}

// Función para renderizar productos del carrito con imágenes
function renderizarCarrito() {
  const carritoList = document.getElementById("carrito-list");
  const carritoTotales = document.getElementById("carrito-totales");

  // Limpiamos contenedores y totales
  carritoList.innerHTML = "";
  carritoTotales.innerHTML = "";

  // Mostramos texto de carrito vacío previa comprobación
  if (carrito.length === 0) {
    carritoList.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
    return;
  }

  let totalCompra = 0;

  // Calculo total del carrito (suma de totales de cada producto)
  carrito.forEach((item) => {
    const subtotal = item.cantidad * item.precio;
    totalCompra += subtotal;

    // Buscamos el producto en la lista original para obtener su imagen
    const producto = productos.find((p) => p.id === item.id);
    const imagenURL =
      producto && producto.imagen ? producto.imagen : "../images/default.png"; // Imagen por defecto si no hay

    // Mostramos productos del carrito con imagen y botones para modificar cantidad
    carritoList.innerHTML += `
            <div class="col-md-12 mb-3">
                <div class="d-flex align-items-center border-bottom pb-2">
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
    <button class="btn btn-danger" onclick="confirmarLimpiarCarrito()">Limpiar Carrito</button>
`;
}

// Función para actualizar cantidad en el carrito
function actualizarCantidadCarrito(id, cambio) {
  const item = carrito.find((p) => p.id === id);
  if (!item) return;

  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  let nuevaCantidad = item.cantidad + cambio;

  // Validar stock y cantidad mínima
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

// Función para confirmar eliminación de un producto
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

// Función para eliminar un producto del carrito
function eliminarDelCarrito(id) {
  carrito.forEach((item, index) => {
    if (item.id === id) {
      const producto = productos.find((p) => p.id === id);
      if (producto) {
        producto.stock += item.cantidad; // Devolvemos stock al inventario
      }
      carrito.splice(index, 1);
    }
  });

  guardarDatos();
  renderizarCarrito();
}

// Función para confirmar limpieza del carrito
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

// Función para limpiar el carrito
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

// Simular pago
function pagar() {
  Swal.fire({
    title: "Funcionalidad no disponible",
    text: "La funcionalidad de pago aún no está implementada.",
    icon: "info",
    confirmButtonColor: "#3085d6",
    confirmButtonText: "Entendido",
  });
}

// Inicializar renderizado del carrito
renderizarCarrito();
