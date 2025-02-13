// Productos (PENDIENTE: Pensar lógica que cargue productos sin necesidad de ingresar 1ro a una sección específica, en este caso productos.html)
let productos = JSON.parse(localStorage.getItem("productos")) || [];

// Guardar datos de PRODUCTOS en localStorage
function guardarDatos() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

// Función que genera Id Único para cada producto 
function generarIdUnico() {
    return productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
}

// Renderizar lista de productos
function renderizarProductos() {
    const productList = document.querySelector("#product-list ul");
    productList.innerHTML = "";

    if (productos.length === 0) {
        productList.innerHTML = "<p class='text-center'>No hay productos cargados disponibles.</p>";
        return;
    }

    productos.forEach((producto) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <div>
                <strong>${producto.nombre}</strong> - ${producto.descripcion} 
                (Categoría: ${producto.categoria}, Precio: $${producto.precio}, Stock: ${producto.stock})
                <br>
                <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 80px; height: auto; margin-top: 5px;">
            </div>
            <div>
                <button class="btn btn-sm btn-warning me-2" onclick="editarProducto(${producto.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </div>
        `;
        productList.appendChild(li);
    });
}

// Previsualizar imagen antes de guardar
document.querySelector("#product-image").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("image-preview").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Agregar/editar producto existente con confirmación previa en SweetAlert2
document.querySelector("#product-form").addEventListener("submit", (event) => {
    event.preventDefault(); // Evita que la página se recargue al enviar el formulario

    const nombre = document.querySelector("#product-name").value;
    const descripcion = document.querySelector("#product-description").value;
    const precio = document.querySelector("#product-price").value;
    const stock = document.querySelector("#product-stock").value;
    const categoria = document.querySelector("#product-category").value;
    const imagenInput = document.querySelector("#product-image"); // Obtener la imagen
    let imagenURL = "../images/default.png"; // Imagen por defecto si no se selecciona una nueva

    const editId = document.querySelector("#product-form").dataset.edit;
    let mensajeConfirmacion = editId ? "¿Deseas confirmar los cambios en este producto?" : "¿Deseas agregar este nuevo producto?";

    // Mostrar confirmación antes de guardar
    Swal.fire({
        title: "¿Estás seguro?git",
        text: mensajeConfirmacion,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            let mensajeFinal = "";

            if (editId) {
                // Editar producto existente
                const producto = productos.find(p => p.id === parseInt(editId));
                if (producto) {
                    producto.nombre = nombre;
                    producto.descripcion = descripcion;
                    producto.precio = parseFloat(precio);
                    producto.stock = parseInt(stock);
                    producto.categoria = categoria;

                    // Si se selecciona una nueva imagen, la actualizamos. De lo contrario, mantenemos la anterior.
                    if (imagenInput.files.length > 0) {
                        const file = imagenInput.files[0];
                        producto.imagen = `../images/${file.name}`;
                    }

                    mensajeFinal = `El producto "${producto.nombre}" ha sido actualizado correctamente.`;
                }
                document.querySelector("#product-form").removeAttribute("data-edit");
            } else {
                // Si es un producto nuevo, le asignamos una imagen si el usuario subió una
                if (imagenInput.files.length > 0) {
                    const file = imagenInput.files[0];
                    imagenURL = `../images/${file.name}`;
                }

                // Agregar nuevo producto con ID único
                const nuevoProducto = {
                    id: generarIdUnico(),
                    nombre,
                    descripcion,
                    precio: parseFloat(precio),
                    stock: parseInt(stock),
                    categoria,
                    imagen: imagenURL // Se guarda la imagen asociada o la default
                };

                productos.push(nuevoProducto);
                mensajeFinal = `El producto "${nuevoProducto.nombre}" ha sido agregado correctamente.`;
            }

            // Guardar, renderizar y limpiar formulario
            guardarDatos();
            renderizarProductos();
            document.querySelector("#product-form").reset();
            document.getElementById("image-preview").src = "../images/default.png"; // Restaurar imagen predeterminada

            // Mostrar mensaje de éxito
            Swal.fire({
                title: "Producto guardado",
                text: mensajeFinal,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
});

// Función para eliminar producto con confirmación de SweetAlert2
function eliminarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    Swal.fire({
        title: "¿Estás seguro?",
        text: `Vas a eliminar "${producto.nombre}". Esta acción no se puede deshacer.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            productos = productos.filter(p => p.id !== id);
            guardarDatos();
            renderizarProductos();

            Swal.fire({
                title: "Eliminado",
                text: "El producto ha sido eliminado correctamente.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}

// Editar producto
function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    document.querySelector("#product-name").value = producto.nombre;
    document.querySelector("#product-description").value = producto.descripcion;
    document.querySelector("#product-price").value = producto.precio;
    document.querySelector("#product-stock").value = producto.stock;
    document.querySelector("#product-category").value = producto.categoria;
    document.getElementById("image-preview").src = producto.imagen; // Mostrar imagen actual
    document.querySelector("#product-form").dataset.edit = id;
}

// Botón para limpiar el formulario con confirmación de SweetAlert2
document.getElementById("clear-form").addEventListener("click", () => {
    Swal.fire({
        title: "¿Limpiar formulario?",
        text: "Se perderán los cambios no guardados.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, limpiar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            document.querySelector("#product-form").reset();
            document.getElementById("image-preview").src = "../images/default.png"; // Restaurar imagen predeterminada

            Swal.fire({
                title: "Formulario limpio",
                text: "El formulario ha sido limpiado.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
});

// Inicializar con render
renderizarProductos();
