<template>
  <q-page padding class="bg-dark-page productos-page">

    <!-- 🔹 HEADER DEL MÓDULO -->
    <div class="page-header flex items-center q-mb-xl">
      <q-icon name="inventory_2" size="40px" color="cyan-4" class="q-mr-md" />

      <div>
        <h1 class="page-title">Gestión de Productos</h1>

        <!-- Subtitle + icon inside a flex row -->
        <div class="subtitle-row flex items-center">
          <q-icon name="shopping_cart" size="18px" color="cyan-4" class="q-mr-sm" />
          <p class="page-subtitle q-mb-none">Registro y clasificación contable automática</p>
        </div>
      </div>
    </div>


    <!-- 🔹 FORMULARIO PRINCIPAL -->
    <div class="form-card q-pa-lg row q-gutter-md">

      <div class="col-12 col-md-5">
        <q-input type="text" outlined class="styled-input q-mb-md"
                 label="SKU"
                 v-model="sku">
          <template #append>
            <q-tooltip anchor="top middle" self="bottom middle">Código único del producto</q-tooltip>
          </template>
        </q-input>

        <q-input type="text" outlined class="styled-input q-mb-md"
                 label="Nombre"
                 v-model="nombre" />

        <q-input type="number" outlined class="styled-input q-mb-md"
                 label="Precio Venta" prefix="$"
                 v-model="precioVenta" />

        <q-input type="number" outlined class="styled-input q-mb-md"
                 label="Precio Costo" prefix="$"
                 v-model="precioCosto" />

        <q-select outlined class="styled-input q-mb-md"
                  label="Tipo de Producto"
                  :options="['Gravado', 'Exento']"
                  v-model="tipoProducto"
                  hint="Define si aplica IVA o está exento">
          <template #append>
            <q-tooltip>Define el comportamiento contable automático</q-tooltip>
          </template>
        </q-select>
      </div>

      <q-space />

      <div class="col-12 col-md-6">
        <q-input type="textarea" outlined class="styled-input q-mb-md"
                 label="Descripción" v-model="descripcion"/>
      </div>

    </div>

    <!-- 🔹 BOTÓN ENVIAR -->
    <div class="row justify-end q-mt-lg">
      <q-btn
        class="btn-submit"
        label="Enviar datos"
        @click="enviarDatos"
        color="cyan-4"
        unelevated
        no-caps
      />
    </div>

  </q-page>
</template>


<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

// --- 1. Referencias de Formulario ---
const sku = ref('')
const nombre = ref('')
const precioVenta = ref(0)
const precioCosto = ref(0)
const descripcion = ref('')
// Nueva referencia para la selección simplificada
const tipoProducto = ref('Gravado') // Valor por defecto

// --- 2. Referencias de Cuentas y Clasificación ---
const cuentas = ref([])

// Nuevo objeto para almacenar las cuentas clasificadas
const cuentas_clasificadas = ref({
  impuestos: [],
  inventario: [],
  ingreso: [],
  costo: []
})

// Constantes para almacenar los IDs de las cuentas por defecto
// Estos valores se llenarán en la función 'obtenerCuentas'
const CUENTAS_GRAVADO_ID = {
  cuenta_inventario: null,
  cuenta_impuesto: null,
  cuenta_ingreso: null,
  cuenta_costo: null,
}

const CUENTAS_EXENTO_ID = {
  cuenta_inventario: null,
  cuenta_impuesto: null,
  cuenta_ingreso: null,
  cuenta_costo: null,
}


// --- 3. Funciones de Lógica ---

const obtenerCuentas = async () => {
  try {
    const response = await axios.get('http://178.128.79.42:8000/api/contabilidad/obtener/cuentas_padre/')
    
    // Mapear los datos de respuesta
    cuentas.value = response.data.map(item => {
      const c = item.cuenta ?? item
      return {
        id: c.id,
        nombre: c.nombre,
        codigo: c.codigo,
        tipo: c.tipo,
        movimientos: c.movimientos
      }
    })

    // CLASIFICAR LAS CUENTAS POR TIPO
    cuentas_clasificadas.value.impuestos = cuentas.value.filter(c => String(c.codigo).startsWith('2101') && c.movimientos === true)
    cuentas_clasificadas.value.inventario = cuentas.value.filter(c => String(c.codigo).startsWith('1102') && c.movimientos === true)
    cuentas_clasificadas.value.ingreso = cuentas.value.filter(c => c.tipo ==='INGRESO' && c.movimientos === true)
    cuentas_clasificadas.value.costo = cuentas.value.filter(c => c.tipo ==='COSTO' && c.movimientos === true)

    // ASIGNAR LAS CUENTAS POR DEFECTO A LAS CONSTANTES
    
    // --- 1. CUENTAS GRAVADO (IVA) ---
    CUENTAS_GRAVADO_ID.cuenta_inventario = cuentas_clasificadas.value.inventario[0]?.id || null
    // Intenta encontrar una cuenta de IVA estándar (ej. 13% o 16%), o usa la primera
    CUENTAS_GRAVADO_ID.cuenta_impuesto = cuentas_clasificadas.value.impuestos.find(c => c.nombre.toLowerCase().includes('iva'))?.id || cuentas_clasificadas.value.impuestos[0]?.id || null
    CUENTAS_GRAVADO_ID.cuenta_ingreso = cuentas_clasificadas.value.ingreso[0]?.id || null
    CUENTAS_GRAVADO_ID.cuenta_costo = cuentas_clasificadas.value.costo[0]?.id || null

    // --- 2. CUENTAS EXENTO (SIN IMPUESTOS) ---
    CUENTAS_EXENTO_ID.cuenta_inventario = cuentas_clasificadas.value.inventario[0]?.id || null
    // Intenta encontrar una cuenta de Impuesto Exento (0%), o dejar null si el backend lo permite
    CUENTAS_EXENTO_ID.cuenta_impuesto = cuentas_clasificadas.value.impuestos.find(c => c.nombre.toLowerCase().includes('exento'))?.id || null 
    CUENTAS_EXENTO_ID.cuenta_ingreso = cuentas_clasificadas.value.ingreso[0]?.id || null
    CUENTAS_EXENTO_ID.cuenta_costo = cuentas_clasificadas.value.costo[0]?.id || null

    // Mensajes de advertencia si no se encuentra algo
    if (!CUENTAS_GRAVADO_ID.cuenta_inventario) {
        console.warn('Advertencia: No se pudo asignar una cuenta de Inventario por defecto. Revisa los códigos (1102).')
    }

  } catch (error) {
    console.error('Error obteniendo cuentas padre:', error)
  }
}


const enviarDatos = async () => {
  // Lógica para determinar qué IDs de cuenta usar
  const cuentasSeleccionadas = tipoProducto.value === 'Gravado'
    ? CUENTAS_GRAVADO_ID
    : CUENTAS_EXENTO_ID

  // Validación básica para cuentas esenciales
  if (!cuentasSeleccionadas.cuenta_inventario || !cuentasSeleccionadas.cuenta_ingreso) {
      alert('Error: No se encontraron las cuentas contables por defecto. Las cuentas deben cargarse antes de enviar. Revisa la consola.')
      return 
  }

  try {
    const productos = [{
      sku: sku.value,
      nombre: nombre.value,
      precio_venta: precioVenta.value,
      precio_costo: precioCosto.value,
      
      // Asignación automática de los IDs
      cuenta_inventario: cuentasSeleccionadas.cuenta_inventario,
      cuenta_impuesto: cuentasSeleccionadas.cuenta_impuesto,
      cuenta_ingreso: cuentasSeleccionadas.cuenta_ingreso,
      cuenta_costo: cuentasSeleccionadas.cuenta_costo,
      
      descripcion: descripcion.value
    }]

    const response = await axios.post(
      'http://178.128.79.42:8000/api/contabilidad/productos/agregar/',
      productos
    )

    console.log('¡Producto agregado con éxito!', response.data)
    alert(`¡Éxito! Producto agregado y clasificado como ${tipoProducto.value}. Revisa la BD y la consola.`)
  } catch (error) {
    console.error('Error al agregar producto:', error.response?.data || error)
    alert('Error. Revisa la consola para ver los detalles del error.')
  }
}

// Cargar las cuentas al montar el componente
onMounted(() => obtenerCuentas())

</script>

<style scoped lang="scss">
/* --------------------------
   🎨 Fondo general
--------------------------- */
.bg-dark-page {
  background-color: #0b1120;
  min-height: 100vh;
}

/* --------------------------
   🔹 Header del módulo
--------------------------- */
.page-header {
  animation: fadeInDown 0.5s ease;
}

.page-title {
  color: #e2e8f0;
  font-size: 3.0rem;
  font-weight: 700;
  margin: 0;
}

.page-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #8ca3c3;
}

.subtitle-row {
  margin-top: 2px;
}

.page-subtitle {
  margin: 0;
  padding: 0;
}

/* --------------------------
   🎨 Contenedor principal
--------------------------- */
.form-card {
  background: rgba(30, 41, 59, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 4px 18px rgba(0,0,0,0.4);
  transition: all 0.3s ease;
}

.form-card:hover {
  transform: translateY(-4px);
}


/* --------------------------
   🎨 Inputs consistentes
--------------------------- */
.styled-input {
  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  :deep(.q-field__native) {
    color: #fff !important;
  }

  :deep(.q-field__label) {
    color: #94a3b8;
  }
}

/* --------------------------
   🎨 Botón de enviar
--------------------------- */
.btn-submit {
  border-radius: 12px;
  padding: 10px 28px;
  font-size: 1.05rem;
  font-weight: 600;
  box-shadow: 0 0 0 transparent;
  transition: 0.25s ease-in-out;
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(34, 211, 238, 0.3);
}

/* --------------------------
   ✨ Animación del header
--------------------------- */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --------------------------
   📌 Responsivo
--------------------------- */
@media (max-width: 600px) {
  .form-card {
    padding: 1rem !important;
  }
}


</style>
