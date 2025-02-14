// Cargamos productos desde localStorage o inicializamos vacío
let productos = JSON.parse(localStorage.getItem("productos")) || [];

// Guardamos productos en localStorage
function guardarDatos() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

// Generamos un ID único para nuevos productos
function generarIdUnico() {
    return productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
}

// Renderizamos la lista de productos en el administrador
function renderizarProductos() {
    const productList = document.querySelector("#product-list ul");
    productList.innerHTML = productos.length === 0 
        ? "<p class='text-center'>No hay productos disponibles.</p>"
        : "";

    productos.forEach(producto => {
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

// Previsualizamos la imagen antes de guardar
document.querySelector("#product-image").addEventListener("change", event => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => document.getElementById("image-preview").src = e.target.result;
        reader.readAsDataURL(file);
    }
});

// Agregar o editar un producto con confirmación
document.querySelector("#product-form").addEventListener("submit", event => {
    event.preventDefault();

    const nombre = document.querySelector("#product-name").value;
    const descripcion = document.querySelector("#product-description").value;
    const precio = parseFloat(document.querySelector("#product-price").value);
    const stock = parseInt(document.querySelector("#product-stock").value);
    const categoria = document.querySelector("#product-category").value;
    const imagenInput = document.querySelector("#product-image");
    let imagenURL = "../images/default.png"; 

    const editId = document.querySelector("#product-form").dataset.edit;
    const mensajeConfirmacion = editId 
        ? "¿Deseas confirmar los cambios en este producto?" 
        : "¿Deseas agregar este nuevo producto?";

    Swal.fire({
        title: "¿Estás seguro?",
        text: mensajeConfirmacion,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
    }).then(result => {
        if (result.isConfirmed) {
            let mensajeFinal;

            if (editId) {
                // Editar producto existente
                const producto = productos.find(p => p.id === parseInt(editId));
                if (producto) {
                    producto.nombre = nombre;
                    producto.descripcion = descripcion;
                    producto.precio = precio;
                    producto.stock = stock;
                    producto.categoria = categoria;
                    if (imagenInput.files.length > 0) {
                        producto.imagen = `../images/${imagenInput.files[0].name}`;
                    }
                    mensajeFinal = `El producto "${producto.nombre}" ha sido actualizado.`;
                }
                document.querySelector("#product-form").removeAttribute("data-edit");
            } else {
                // Nuevo producto
                if (imagenInput.files.length > 0) {
                    imagenURL = `../images/${imagenInput.files[0].name}`;
                }

                productos.push({
                    id: generarIdUnico(),
                    nombre, descripcion, precio, stock, categoria, imagen: imagenURL
                });

                mensajeFinal = `El producto "${nombre}" ha sido agregado.`;
            }

            // Guardamos, renderizamos y limpiamos el formulario
            guardarDatos();
            renderizarProductos();
            document.querySelector("#product-form").reset();
            document.getElementById("image-preview").src = "../images/default.png";

            Swal.fire({ title: "Producto guardado", text: mensajeFinal, icon: "success", timer: 2000, showConfirmButton: false });
        }
    });
});

// Eliminamos un producto con confirmación
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
    }).then(result => {
        if (result.isConfirmed) {
            productos = productos.filter(p => p.id !== id);
            guardarDatos();
            renderizarProductos();

            Swal.fire({ title: "Eliminado", text: "El producto ha sido eliminado.", icon: "success", timer: 2000, showConfirmButton: false });
        }
    });
}

// Editar producto y desplazamos la vista al formulario
function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    document.querySelector("#product-name").value = producto.nombre;
    document.querySelector("#product-description").value = producto.descripcion;
    document.querySelector("#product-price").value = producto.precio;
    document.querySelector("#product-stock").value = producto.stock;
    document.querySelector("#product-category").value = producto.categoria;
    document.getElementById("image-preview").src = producto.imagen; 
    document.querySelector("#product-form").dataset.edit = id;

    document.getElementById("product-form").scrollIntoView({ behavior: "smooth" });
}

// Limpiar formulario con confirmación
document.getElementById("clear-form").addEventListener("click", () => {
    Swal.fire({
        title: "¿Limpiar formulario?",
        text: "Se perderán los cambios no guardados.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, limpiar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
    }).then(result => {
        if (result.isConfirmed) {
            document.querySelector("#product-form").reset();
            document.getElementById("image-preview").src = "../images/default.png";

            Swal.fire({ title: "Formulario limpio", text: "El formulario ha sido limpiado.", icon: "success", timer: 1500, showConfirmButton: false });
        }
    });
});

// Inicializamos
renderizarProductos();
