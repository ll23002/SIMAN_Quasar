<template>
  <q-page padding class="page-container">

    <div class="q-pa-md row q-gutter-md custom-card shadow-10 rounded-borders">
      <div class="col-12 col-md-5 input-column">
        <q-input type="text" outlined class="full-width q-mb-md input-field" label="SKU" v-model="sku"/>
        <q-input type="text" label="Nombre" outlined class="full-width q-mb-md input-field" v-model="nombre"/>
        <q-input type="number" label="Precio Venta" outlined class="full-width q-mb-md input-field" v-model="precioVenta" prefix="$"/>
        <q-input type="number" label="Precio Costo" outlined class="full-width q-mb-md input-field" v-model="precioCosto" prefix="$"/>
        
        <q-select
          outlined
          class="full-width q-mb-md input-field"
          label="Tipo de Producto"
          :options="['Gravado', 'Exento']"
          v-model="tipoProducto"
          hint="Gravado (con impuestos/IVA) o Exento (sin impuestos)"
        />
        
      </div>
      <q-space />
      <div class="col-12 col-md-6 input-column">
        <q-input type="textarea" label="Descripcion" outlined class="full-width q-mb-md input-field text-area" v-model="descripcion"/>
      </div>

    </div>
    <div class="q-mt-lg button-container">
      <q-btn
        class="submit-button"
        label="Enviar datos"
        @click="enviarDatos"
        color="primary"
        size="lg"
        rounded
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

<style lang="sass">
// ===== Tema Oscuro Profesional (Contabilidad) =====

// Colores principales
$primary-color: #4aa3ff;        // Azul profesional (más suave en dark)
$secondary-color: #6c7bff;      // Azul-violeta sobrio para complementos
$accent-color: #ffc85a;         // Dorado tenue para resaltar sin desentonar

// Fondos
$background-light: #1b1f27;     // Fondo general oscuro
$surface-color: #252a34;        // Superficie de tarjetas, inputs, paneles

// Texto
$text-dark: #e9e9e9;            // Texto principal claro
$text-light: #b5b5b5;           // Texto secundario

// Bordes y sombras
$border-light: #3a3f47;         // Bordes sutiles en dark mode
$shadow-light: rgba(0, 0, 0, 0.25);
$shadow-strong: rgba(0, 0, 0, 0.45);


// Estilo general de la página
.page-container
  background-color: $background-light
  min-height: 100vh
  display: flex
  flex-direction: column
  align-items: center
  padding: 40px // Más padding para centrar mejor
  font-family: 'Roboto', sans-serif // Una fuente moderna y legible

// Contenedor principal del formulario (la "tarjeta")
.custom-card
  background-color: $surface-color
  border-radius: 20px // Bordes más redondeados
  padding: 30px
  max-width: 1200px
  width: 100%
  box-shadow: 0 10px 30px $shadow-light // Sombra más pronunciada pero suave
  transition: transform 0.3s ease-in-out // Animación al pasar el ratón
  
  &:hover
    transform: translateY(-5px) // Efecto sutil al pasar el ratón

// Columnas de input
.input-column
  display: flex
  flex-direction: column
  justify-content: space-between // Espacio equitativo
  gap: 15px // Espacio entre inputs

// Estilo para todos los q-input y q-select
.input-field
  .q-field__control
    border-radius: 12px // Bordes redondeados para los inputs
    background-color: $background-light // Fondo ligero para los inputs
    transition: all 0.3s ease // Transición para focus

  &.q-field--outlined .q-field__control
    border-color: $border-light // Color de borde por defecto

  &:hover .q-field__control
    border-color: $secondary-color // Borde más visible al hover

  &.q-field--focused .q-field__control
    border-color: $primary-color !important // Borde primario al enfocar
    box-shadow: 0 0 0 3px rgba($primary-color, 0.2) // Sombra de enfoque sutil
    background-color: $surface-color // Fondo blanco al enfocar

  .q-field__label
    color: $text-light
    font-weight: 500

  .q-field__native, .q-field__input
    color: $text-dark
    font-size: 16px

// Estilo específico para el textarea
.text-area
  height: 100% // Ocupa el espacio disponible
  .q-field__control
    min-height: 120px // Altura mínima para el textarea

// Contenedor del botón para centrarlo
.button-container
  width: 100%
  max-width: 1200px
  display: flex
  justify-content: center
  margin-top: 30px // Más espacio superior para el botón

// Estilo del botón de enviar
.submit-button
  background: linear-gradient(45deg, $primary-color, $secondary-color) // Degradado
  color: white
  font-weight: bold
  letter-spacing: 0.5px
  padding: 15px 40px
  font-size: 1.1em
  border-radius: 50px // Botón "píldora"
  box-shadow: 0 8px 20px rgba($primary-color, 0.4) // Sombra más prominente
  transition: all 0.3s ease
  
  &:hover
    transform: translateY(-3px) scale(1.02) // Efecto al pasar el ratón
    box-shadow: 0 12px 25px rgba($primary-color, 0.6) // Sombra más fuerte
    // Línea 110 original


// Los estilos de tabla que ya tenías (manteniéndolos, aunque no se usan en este formulario)
.my-sticky-header-column-table
  height: 400px
  max-width: 1300px
  
  td:first-child
    background-color: $primary-color // Usando la variable
    color: white

  tr th
    position: sticky
    z-index: 2
    background: $primary-color // Usando la variable
    color: white

  thead tr:last-child th
    top: 48px
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0

  tbody
    scroll-margin-top: 48px

.desc-cell
  max-width: 400px
  white-space: normal
  overflow-wrap: anywhere
  word-break: break-word
</style>