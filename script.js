// Sistema POS - JavaScript
const DATE_KEY = "pos-fecha"; // Clave para almacenar la fecha de las ventas

let productos = [
  { id: 1, nombre: "Pollo Economico", precio: 16.0, categoria: "pollo" },
  { id: 2, nombre: "Pollo 1/4", precio: 25.0, categoria: "pollo" },
  { id: 3, nombre: "Coca Cola", precio: 8.0, categoria: "bebidas" },
  { id: 4, nombre: "Papas Fritas", precio: 12.0, categoria: "acompanantes" },
]

let carrito = []
let ventas = []
let contadorOrden = 1
let editandoProducto = null

function getTodayISO() { return new Date().toISOString().split("T")[0]; }

function cargarDatos() {
  const productosGuardados = localStorage.getItem("pos-productos")
  const ventasGuardadas = localStorage.getItem("pos-ventas")
  const contadorGuardado = localStorage.getItem("pos-contador")
  const fechaGuardada = localStorage.getItem(DATE_KEY)
  const hoy = getTodayISO()

  // Restaurar productos si existen
  if (productosGuardados) {
    productos = JSON.parse(productosGuardados)
  }

  // Si la fecha coincide con la de hoy, restaurar ventas y contador.
  if (fechaGuardada === hoy) {
    if (ventasGuardadas) ventas = JSON.parse(ventasGuardadas)
    if (contadorGuardado) contadorOrden = Number.parseInt(contadorGuardado)
  } else {
    // Reiniciar ventas y contador para un nuevo día.
    ventas = []
    contadorOrden = 1
    // Persistir el reinicio inmediatamente para evitar inconsistencias.
    guardarDatos()
  }
}

function guardarDatos() {
  localStorage.setItem("pos-productos", JSON.stringify(productos))
  localStorage.setItem("pos-ventas", JSON.stringify(ventas))
  localStorage.setItem("pos-contador", contadorOrden.toString())
  localStorage.setItem(DATE_KEY, getTodayISO())
}

// Mostrar sección
function showSection(section) {
  // Ocultar todas las secciones
  document.getElementById("main-menu").classList.add("hidden")
  document.getElementById("ventas-section").classList.add("hidden")
  document.getElementById("productos-section").classList.add("hidden")
  document.getElementById("reportes-section").classList.add("hidden")

  // Mostrar la sección seleccionada
  if (section === "main") {
    document.getElementById("main-menu").classList.remove("hidden")
  } else {
    document.getElementById(section + "-section").classList.remove("hidden")

    // Cargar contenido específico de cada sección
    if (section === "ventas") {
      cargarProductosVenta()
    } else if (section === "productos") {
      cargarListaProductos()
    } else if (section === "reportes") {
      cargarReportes()
    }
  }
}

// SECCIÓN VENTAS
function cargarProductosVenta() {
  const container = document.getElementById("productos-venta")
  container.innerHTML = ""

  productos.forEach((producto) => {
    const div = document.createElement("div")
    div.className = "bg-gray-50 rounded-lg p-4 flex justify-between items-center hover:bg-gray-100 cursor-pointer"
    div.innerHTML = `
            <div>
                <h4 class="font-semibold">${producto.nombre}</h4>
                <p class="text-gray-600">Bs. ${producto.precio.toFixed(2)}</p>
            </div>
            <button onclick="agregarAlCarrito(${producto.id})" class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg">
                Agregar
            </button>
        `
    container.appendChild(div)
  })
}

function agregarAlCarrito(productoId) {
  const producto = productos.find((p) => p.id === productoId)
  const itemExistente = carrito.find((item) => item.id === productoId)

  if (itemExistente) {
    itemExistente.cantidad++
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
    })
  }

  actualizarCarrito()
}

function actualizarCarrito() {
  const container = document.getElementById("carrito-items")
  const totalElement = document.getElementById("total-venta")

  if (carrito.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center">Carrito vacío</p>'
    totalElement.textContent = "Bs. 0.00"
    return
  }

  container.innerHTML = ""
  let total = 0

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad
    total += subtotal

    const div = document.createElement("div")
    div.className = "flex justify-between items-center bg-white p-2 rounded"
    div.innerHTML = `
            <div class="flex-1">
                <span class="font-medium">${item.nombre}</span>
                <div class="text-sm text-gray-600">Bs. ${item.precio.toFixed(2)} x ${item.cantidad}</div>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="cambiarCantidad(${index}, -1)" class="bg-red-500 text-white w-6 h-6 rounded text-sm">-</button>
                <span class="w-8 text-center">${item.cantidad}</span>
                <button onclick="cambiarCantidad(${index}, 1)" class="bg-green-500 text-white w-6 h-6 rounded text-sm">+</button>
                <button onclick="eliminarDelCarrito(${index})" class="bg-red-600 text-white px-2 py-1 rounded text-sm ml-2">×</button>
            </div>
        `
    container.appendChild(div)
  })

  totalElement.textContent = `Bs. ${total.toFixed(2)}`
}

function cambiarCantidad(index, cambio) {
  carrito[index].cantidad += cambio
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1)
  }
  actualizarCarrito()
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1)
  actualizarCarrito()
}

function limpiarCarrito() {
  carrito = []
  actualizarCarrito()
}

function completarVenta() {
  if (carrito.length === 0) {
    alert("El carrito está vacío")
    return
  }

  const tipoPedido = document.getElementById("tipo-pedido").value
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  const venta = {
    id: contadorOrden,
    fecha: new Date().toLocaleString("es-ES"),
    items: [...carrito],
    total: total,
    tipo: tipoPedido === "llevar" ? "Para Llevar" : "Consumo en Sala",
  }

  ventas.push(venta)
  console.log("[v0] Venta registrada:", venta)
  console.log("[v0] Total ventas:", ventas.length)

  // Imprimir 2 tickets
  imprimirTicket(venta)
  setTimeout(() => imprimirTicket(venta), 1000) // Segundo ticket con delay

  contadorOrden++
  limpiarCarrito()
  guardarDatos()

  alert(`¡Venta completada! Orden #${venta.id}\nSe imprimirán 2 tickets.`)
}

function imprimirTicket(venta) {
  const ticketContent = `
        <div style="width: 80mm; margin: 0 auto; font-family: monospace; font-size: 12px; line-height: 1.4;">
            <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
                <h2 style="margin: 0; font-size: 18px; font-weight: bold;">🍗 NEGOCIO DE POLLO</h2>
                <p style="margin: 5px 0;">Sistema POS</p>
            </div>
            
            <div style="text-align: center; font-size: 24px; font-weight: bold; margin: 15px 0; border: 2px solid #000; padding: 10px;">
                ORDEN: ${venta.id}
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Fecha:</strong> ${venta.fecha}<br>
                <strong>Tipo:</strong> ${venta.tipo}
            </div>
            
            <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>PRODUCTO</span>
                    <span>CANT</span>
                    <span>PRECIO</span>
                    <span>TOTAL</span>
                </div>
            </div>
            
            ${venta.items
              .map(
                (item) => `
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span style="flex: 2;">${item.nombre}</span>
                    <span style="width: 30px; text-align: center;">${item.cantidad}</span>
                    <span style="width: 50px; text-align: right;">${item.precio.toFixed(2)}</span>
                    <span style="width: 50px; text-align: right;">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
            `,
              )
              .join("")}
            
            <div style="border-top: 2px solid #000; margin-top: 10px; padding-top: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold;">
                    <span>TOTAL:</span>
                    <span>Bs. ${venta.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 10px;">
                <p>¡Gracias por su compra!</p>
                <p>Orden #${venta.id} - ${venta.tipo}</p>
            </div>
        </div>
    `

  const ticketWindow = window.open("", "_blank")
  ticketWindow.document.write(`
        <html>
            <head>
                <title>Ticket - Orden ${venta.id}</title>
                <style>
                    @page { size: 80mm auto; margin: 0; }
                    body { margin: 0; padding: 0; }
                    body, html { width: 80mm; }
                </style>
            </head>
            <body>
                ${ticketContent}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 1000);
                    }
                </script>
            </body>
        </html>
    `)
  ticketWindow.document.close()
}

// SECCIÓN PRODUCTOS
function cargarListaProductos() {
  const container = document.getElementById("lista-productos")
  container.innerHTML = ""

  productos.forEach((producto) => {
    const div = document.createElement("div")
    div.className = "bg-gray-50 rounded-lg p-4"
    div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-semibold text-lg">${producto.nombre}</h4>
                <div class="space-x-1">
                    <button onclick="editarProducto(${producto.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm">✏️</button>
                    <button onclick="eliminarProducto(${producto.id})" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm">🗑️</button>
                </div>
            </div>
            <p class="text-gray-600">Precio: Bs. ${producto.precio.toFixed(2)}</p>
            <p class="text-gray-500 text-sm capitalize">Categoria: ${producto.categoria}</p>
        `
    container.appendChild(div)
  })
}

function mostrarFormProducto() {
  document.getElementById("form-producto").classList.remove("hidden")
  document.getElementById("form-titulo").textContent = "Agregar Nuevo Producto"
  document.getElementById("producto-nombre").value = ""
  document.getElementById("producto-precio").value = ""
  document.getElementById("producto-categoria").value = "pollo"
  editandoProducto = null
}

function editarProducto(id) {
  const producto = productos.find((p) => p.id === id)
  document.getElementById("form-producto").classList.remove("hidden")
  document.getElementById("form-titulo").textContent = "Editar Producto"
  document.getElementById("producto-nombre").value = producto.nombre
  document.getElementById("producto-precio").value = producto.precio
  document.getElementById("producto-categoria").value = producto.categoria
  editandoProducto = id
}

function guardarProducto() {
  const nombre = document.getElementById("producto-nombre").value.trim()
  const precio = Number.parseFloat(document.getElementById("producto-precio").value)
  const categoria = document.getElementById("producto-categoria").value

  if (!nombre || !precio || precio <= 0) {
    alert("Por favor complete todos los campos correctamente")
    return
  }

  if (editandoProducto) {
    // Editar producto existente
    const producto = productos.find((p) => p.id === editandoProducto)
    producto.nombre = nombre
    producto.precio = precio
    producto.categoria = categoria
  } else {
    // Agregar nuevo producto
    const nuevoId = Math.max(...productos.map((p) => p.id)) + 1
    productos.push({
      id: nuevoId,
      nombre: nombre,
      precio: precio,
      categoria: categoria,
    })
  }

  guardarDatos()
  cancelarFormProducto()
  cargarListaProductos()
}

function cancelarFormProducto() {
  document.getElementById("form-producto").classList.add("hidden")
  editandoProducto = null
}

function eliminarProducto(id) {
  if (confirm("¿Está seguro de eliminar este producto?")) {
    productos = productos.filter((p) => p.id !== id)
    guardarDatos()
    cargarListaProductos()
  }
}

// SECCIÓN REPORTES
function cargarReportes() {
  const ventasHoy = ventas // Mostrar todas las ventas de la sesión

  const totalVentas = ventasHoy.reduce((sum, venta) => sum + venta.total, 0)
  const totalOrdenes = ventasHoy.length
  const promedioVenta = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0

  console.log("[v0] Cargando reportes - Total ventas:", ventasHoy.length)

  document.getElementById("total-ventas-dia").textContent = `Bs. ${totalVentas.toFixed(2)}`
  document.getElementById("total-ordenes").textContent = totalOrdenes
  document.getElementById("promedio-venta").textContent = `Bs. ${promedioVenta.toFixed(2)}`

  const container = document.getElementById("lista-ventas")
  container.innerHTML = ""

  if (ventasHoy.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center">No hay ventas registradas en esta sesión</p>'
    return
  }

  ventasHoy.reverse().forEach((venta) => {
    const div = document.createElement("div")
    div.className = "bg-gray-50 rounded-lg p-4"
    div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-semibold">Orden #${venta.id}</h4>
                    <p class="text-sm text-gray-600">${venta.fecha} - ${venta.tipo}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold text-lg">Bs. ${venta.total.toFixed(2)}</p>
                    <button onclick="reimprimirTicket(${venta.id})" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm mt-1">
                        🖨️ Reimprimir
                    </button>
                </div>
            </div>
            <div class="text-sm text-gray-700">
                ${venta.items.map((item) => `${item.nombre} x${item.cantidad}`).join(", ")}
            </div>
        `
    container.appendChild(div)
  })
}

function reimprimirTicket(ventaId) {
  const venta = ventas.find((v) => v.id === ventaId)
  if (venta) {
    imprimirTicket(venta)
    imprimirTicket(venta) // Segundo ticket
  }
}

function exportarExcel() {
  const ventasHoy = ventas

  if (ventasHoy.length === 0) {
    alert("No hay ventas para exportar")
    return
  }

  let htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #d97706; margin: 0; font-size: 24px; }
          .header p { color: #666; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #f59e0b; color: white; padding: 12px 8px; text-align: center; font-weight: bold; border: 1px solid #d97706; }
          td { padding: 10px 8px; border: 1px solid #ddd; text-align: center; }
          tr:nth-child(even) { background-color: #fef3c7; }
          tr:nth-child(odd) { background-color: white; }
          .categoria-pollo { background-color: #fecaca !important; }
          .categoria-bebidas { background-color: #bfdbfe !important; }
          .categoria-acompañantes { background-color: #bbf7d0 !important; }
          .total-row { background-color: #f59e0b !important; color: white; font-weight: bold; }
          .resumen { margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 8px; }
          .resumen h3 { color: #d97706; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE VENTAS</h1>
          <p>Fecha: ${new Date().toLocaleDateString("es-ES")}</p>
          <p>Generado: ${new Date().toLocaleString("es-ES")}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ORDEN #</th>
              <th>FECHA Y HORA</th>
              <th>TIPO PEDIDO</th>
              <th>PRODUCTO</th>
              <th>CATEGORÍA</th>
              <th>CANTIDAD</th>
              <th>PRECIO UNIT.</th>
              <th>SUBTOTAL</th>
              <th>TOTAL ORDEN</th>
            </tr>
          </thead>
          <tbody>
  `

  ventasHoy.forEach((venta) => {
    venta.items.forEach((item, index) => {
      const producto = productos.find((p) => p.nombre === item.nombre) || { categoria: "otros" }
      const categoriaClass = `categoria-${producto.categoria}`

      htmlContent += `
        <tr class="${categoriaClass}">
          <td>#${venta.id}</td>
          <td>${venta.fecha}</td>
          <td>${venta.tipo}</td>
          <td>${item.nombre}</td>
          <td style="text-transform: capitalize;">${producto.categoria}</td>
          <td>${item.cantidad}</td>
          <td>Bs. ${item.precio.toFixed(2)}</td>
          <td>Bs. ${(item.precio * item.cantidad).toFixed(2)}</td>
          <td>${index === 0 ? `Bs. ${venta.total.toFixed(2)}` : ""}</td>
        </tr>
      `
    })
  })

  // Agregar fila de totales
  const totalGeneral = ventasHoy.reduce((sum, venta) => sum + venta.total, 0)
  const totalItems = ventasHoy.reduce(
    (sum, venta) => sum + venta.items.reduce((itemSum, item) => itemSum + item.cantidad, 0),
    0,
  )

  htmlContent += `
          <tr class="total-row">
            <td colspan="5"><strong>TOTALES:</strong></td>
            <td><strong>${totalItems}</strong></td>
            <td colspan="2"></td>
            <td><strong>Bs. ${totalGeneral.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <div class="resumen">
        <h3>RESUMEN DEL DIA</h3>
        <p><strong>Total de Ordenes:</strong> ${ventasHoy.length}</p>
        <p><strong>Total de Items Vendidos:</strong> ${totalItems}</p>
        <p><strong>Venta Total:</strong> Bs. ${totalGeneral.toFixed(2)}</p>
        <p><strong>Promedio por Orden:</strong> Bs. ${(totalGeneral / ventasHoy.length).toFixed(2)}</p>
      </div>
      
      </body>
    </html>
  `

  const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `Reporte_Ventas_${new Date().toISOString().split("T")[0]}.xls`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  cargarDatos()
  showSection("main")

  // Advertir al usuario antes de cerrar o recargar la pestaña
  window.addEventListener("beforeunload", (e) => {
    // Si hay ventas en curso o un carrito con items, pedir confirmación.
    if (ventas.length > 0 || carrito.length > 0) {
      e.preventDefault()
      e.returnValue = "¿Seguro que deseas salir? Los datos no guardados podrían perderse."
    }
  })
})
