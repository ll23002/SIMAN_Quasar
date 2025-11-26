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
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// --- 1. Referencias del Formulario ---
const sku = ref('')
const nombre = ref('')
const precioVenta = ref(0)
const precioCosto = ref(0)
const descripcion = ref('')
const tipoProducto = ref('Gravado')

// --- Validación reactiva ---
const errorPrecio = ref(false)

watch([precioVenta, precioCosto], () => {
  errorPrecio.value = precioVenta.value < precioCosto.value
})

// --- 2. Cuentas ---
const cuentas = ref([])

const cuentas_clasificadas = ref({
  impuestos: [],
  inventario: [],
  ingreso: [],
  costo: []
})

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


// --- 3. Obtener cuentas ---
const obtenerCuentas = async () => {
  try {
    const response = await axios.get('http://178.128.79.42:8000/api/contabilidad/obtener/cuentas_padre/')

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

    cuentas_clasificadas.value.impuestos = cuentas.value.filter(c => String(c.codigo).startsWith('2101') && c.movimientos)
    cuentas_clasificadas.value.inventario = cuentas.value.filter(c => String(c.codigo).startsWith('1102') && c.movimientos)
    cuentas_clasificadas.value.ingreso = cuentas.value.filter(c => c.tipo === 'INGRESO' && c.movimientos)
    cuentas_clasificadas.value.costo = cuentas.value.filter(c => c.tipo === 'COSTO' && c.movimientos)

    // CUENTAS GRAVADO
    CUENTAS_GRAVADO_ID.cuenta_inventario = cuentas_clasificadas.value.inventario[0]?.id || null
    CUENTAS_GRAVADO_ID.cuenta_impuesto =
      cuentas_clasificadas.value.impuestos.find(c => c.nombre.toLowerCase().includes('iva'))?.id ||
      cuentas_clasificadas.value.impuestos[0]?.id ||
      null
    CUENTAS_GRAVADO_ID.cuenta_ingreso = cuentas_clasificadas.value.ingreso[0]?.id || null
    CUENTAS_GRAVADO_ID.cuenta_costo = cuentas_clasificadas.value.costo[0]?.id || null

    // CUENTAS EXENTO
    CUENTAS_EXENTO_ID.cuenta_inventario = CUENTAS_GRAVADO_ID.cuenta_inventario
    CUENTAS_EXENTO_ID.cuenta_impuesto =
      cuentas_clasificadas.value.impuestos.find(c => c.nombre.toLowerCase().includes('exento'))?.id ||
      CUENTAS_GRAVADO_ID.cuenta_impuesto ||
      null
    CUENTAS_EXENTO_ID.cuenta_ingreso = CUENTAS_GRAVADO_ID.cuenta_ingreso
    CUENTAS_EXENTO_ID.cuenta_costo = CUENTAS_GRAVADO_ID.cuenta_costo

  } catch (error) {
    console.error('Error obteniendo cuentas padre:', error)
  }
}


const enviarDatos = async () => {

  const precioVentaNum = Number(precioVenta.value)
  const precioCostoNum = Number(precioCosto.value)

  if (precioVentaNum < precioCostoNum) {
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: `El precio venta no puede ser menor que el precio costo`,
      position: 'top',
      timeout: 8000
    })
    return
  }

  const cuentasSeleccionadas = tipoProducto.value === 'Gravado'
    ? CUENTAS_GRAVADO_ID
    : CUENTAS_EXENTO_ID

  if (!cuentasSeleccionadas.cuenta_inventario || !cuentasSeleccionadas.cuenta_ingreso) {
    alert('Error: No se encontraron las cuentas contables por defecto.')
    return
  }

  // REGLA IVA
  let precioFinal = precioVentaNum
  if (tipoProducto.value === 'Gravado') {
    const iva = precioVentaNum * 0.13
    precioFinal = precioVentaNum - iva
    // Redondear a 2 decimales para evitar errores de validación
    precioFinal = Math.round(precioFinal * 100) / 100
  }

  // VALIDACIÓN 2: precio final nunca abajo del costo
  if (precioFinal < precioCostoNum) {
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: `Después de aplicar IVA el precio final (${precioFinal.toFixed(2)}) queda abajo del costo (${precioCostoNum}).`,
      position: 'top',
      timeout: 8000
    })
    return
  }

  // ENVIAR
  try {
    const productos = [{
      sku: sku.value,
      nombre: nombre.value,
      precio_venta: precioFinal,
      precio_costo: precioCostoNum,
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
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `¡Éxito! Producto "${nombre.value}" agregado como ${tipoProducto.value}.`,
      position: 'top',
      timeout: 3000
    })

  } catch (error) {
    console.error('Error al agregar producto:', error.response?.data || error)
    alert('Error al agregar producto.')
  }
}


// Cargar cuentas al montar
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
