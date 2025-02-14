// Cargamos productos desde JSON
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Cargamos productos de JSON y almacenarlos en LocalStorage
async function cargarProductos() {
    try {
        const response = await fetch("../db/productos.json");
        if (!response.ok) throw new Error("Error al cargar los productos.");
        
        productos = await response.json();
        localStorage.setItem("productos", JSON.stringify(productos));
        renderizarProductos();
    } catch (error) {
        console.error("Error:", error.message);
        Swal.fire("Error", "No se pudieron cargar los productos. Inténtalo nuevamente.", "error");
        productos = [];
    }
}

// Inicializamos productos desde LocalStorage o JSON
function inicializarProductos() {
    const productosGuardados = localStorage.getItem("productos");

    if (productosGuardados) {
        productos = JSON.parse(productosGuardados);
        renderizarProductos();
    } else {
        cargarProductos();
    }
}

// Renderizamos productos en la pantalla
function renderizarProductos() {
    const productosList = document.getElementById("productos-list");
    productosList.innerHTML = "";

    productos.filter(producto => producto.stock > 0).forEach(producto => {
        const itemEnCarrito = carrito.find(item => item.id === producto.id);
        const cantidad = itemEnCarrito ? itemEnCarrito.cantidad : 0;

        productosList.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">${producto.descripcion}</p>
                        <p class="card-text">Categoría: ${producto.categoria}</p>
                        <p class="card-text">Precio: $${producto.precio}</p>
                        <div id="acciones-${producto.id}">
                            ${itemEnCarrito ? generarControlesCantidad(producto.id, cantidad) : 
                            `<button class="btn btn-primary" onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>`}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// Generamos controles de cantidad para productos en la lista
function generarControlesCantidad(id, cantidad) {
    return `
        <p class="card-text">Cantidad: <span id="cantidad-${id}">${cantidad}</span></p>
        <button class="btn btn-danger" onclick="actualizarCantidad(${id}, -1)">-</button>
        <button class="btn btn-success" onclick="actualizarCantidad(${id}, 1)">+</button>
    `;
}

// Agregamos producto al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto || producto.stock <= 0) return;

    const itemEnCarrito = carrito.find(p => p.id === id);
    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad < producto.stock) {
            itemEnCarrito.cantidad++;
        } else {
            Toastify({
                text: "No hay más stock disponible",
                duration: 2000,
                gravity: "bottom",
                position: "right",
                style: { background: "red" }
            }).showToast();
            return;
        }
    } else {
        carrito.push({ id: producto.id, nombre: producto.nombre, cantidad: 1, precio: producto.precio });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    document.getElementById(`acciones-${id}`).innerHTML = generarControlesCantidad(id, 1);

    Toastify({
        text: "Producto agregado al carrito",
        duration: 2000,
        gravity: "bottom",
        position: "right",
        style: { background: "green" }
    }).showToast();
}

// Actualizamos cantidad de un producto en el carrito
function actualizarCantidad(id, cambio) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const itemEnCarrito = carrito.find(item => item.id === id);
    let nuevaCantidad = (itemEnCarrito ? itemEnCarrito.cantidad : 0) + cambio;

    // Validación de stock y cantidad mínima
    if (nuevaCantidad > producto.stock) {
        Swal.fire("Stock Insuficiente", "No puedes agregar más unidades de este producto.", "warning");
        return;
    }

    if (nuevaCantidad < 1) {
        Swal.fire({
            title: "¿Eliminar producto?",
            text: "¿Deseas eliminar este producto del carrito?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarDelCarrito(id);
            }
        });
        return;
    }

    // Actualizar cantidad en la interfaz
    document.getElementById(`cantidad-${id}`).textContent = nuevaCantidad;

    // Agregar o actualizar en el carrito
    if (itemEnCarrito) {
        itemEnCarrito.cantidad = nuevaCantidad;
    } else {
        carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: nuevaCantidad });
    }
    
    guardarDatos();

    Toastify({
        text: `🛒 ${nuevaCantidad} x ${producto.nombre} agregado al carrito.`,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        close: true,
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
    }).showToast();
}

// Funcion para guardar datos en LocalStorage
function guardarDatos() {
    localStorage.setItem("productos", JSON.stringify(productos));
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Funcion para eliminar producto del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarDatos();
    renderizarProductos();
}

// Inicializamos la carga de productos al cargar la página
inicializarProductos();
