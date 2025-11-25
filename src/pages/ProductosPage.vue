<template>
  <q-page padding>

    <div class="q-pa-md row q-gutter-md border-rounded shadow-2">
      <div class="col-12 col-md-5">
        <q-input type="text" outlined class="full-width q-mb-md" label="SKU" v-model="sku"/>
        <q-input type="text" label="Nombre" outlined class="full-width q-mb-md" v-model="nombre"/>
        <q-input type="number" label="Precio Venta" outlined class="full-width q-mb-md" v-model="precioVenta" prefix="$"/>
        <q-input type="number" label="Precio Costo" outlined class="full-width q-mb-md" v-model="precioCosto" prefix="$"/>
        <q-select outlined class="full-width q-mb-md" label="Cuenta Inventario" :options="cuentas_inventario" option-label="nombre" v-model="cuentaInventario"/>
      </div>
      <q-space />
      <div class="col-12 col-md-6">
        <q-select outlined class="full-width q-mb-md" label="Cuenta Impuesto" :options="cuentas_impuestos" option-label="nombre" v-model="cuentaImpuesto"/>
        <q-select outlined class="full-width q-mb-md" label="Cuenta Ingreso" :options="cuentas_ingreso" option-label="nombre" v-model="cuentaIngreso"/>
        <q-select outlined class="full-width q-mb-md" label="Cuenta Costo" :options="cuentas_costo" option-label="nombre" v-model="cuentaCosto"/>
        <q-input type="textarea" label="Descripcion" outlined class="full-width q-mb-md" v-model="descripcion"/>
      </div>

    </div>
    <q-btn
      class="q-mt-md"
      label="Enviar datos"
      @click="enviarDatos"
      color="primary"
    />

  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

const cuentas = ref([])

const sku = ref('')
const nombre = ref('')
const precioVenta = ref(0)
const precioCosto = ref(0)
const cuentaInventario = ref(null)
const cuentaImpuesto = ref(null)
const cuentaIngreso = ref(null)
const cuentaCosto = ref(null)
const descripcion = ref('')


const cuentas_impuestos = ref([])
const cuentas_inventario = ref([])
const cuentas_ingreso = ref([])
const cuentas_costo = ref([])



const obtenerCuentas = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/contabilidad/obtener/cuentas_padre/')
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

    cuentas_impuestos.value = cuentas.value.filter(c => String(c.codigo).startsWith('2101') && c.movimientos === true)
    cuentas_inventario.value = cuentas.value.filter(c => String(c.codigo).startsWith('1102') && c.movimientos === true)
    cuentas_ingreso.value = cuentas.value.filter(c => c.tipo ==='INGRESO' && c.movimientos === true)
    cuentas_costo.value = cuentas.value.filter(c => c.tipo ==='COSTO' && c.movimientos === true)
  } catch (error) {
    console.error('Error obteniendo cuentas padre:', error)
  }
}


const enviarDatos = async () => {
  try {
    const productos = [{
      sku: sku.value,
      nombre: nombre.value,
      precio_venta: precioVenta.value,
      precio_costo: precioCosto.value,
      cuenta_inventario: cuentaInventario.value ? cuentaInventario.value.id : null,
      cuenta_impuesto: cuentaImpuesto.value ? cuentaImpuesto.value.id : null,
      cuenta_ingreso: cuentaIngreso.value ? cuentaIngreso.value.id : null,
      cuenta_costo: cuentaCosto.value ? cuentaCosto.value.id : null,
      descripcion: descripcion.value
    }
    ]

    const response = await axios.post(
      'http://localhost:8000/api/contabilidad/productos/agregar/',
      productos
    )

    console.log('¡Cuentas agregadas con éxito!', response.data)
    alert('¡Éxito! Revisa la BD y la consola.')
  } catch (error) {
    console.error('Error al agregar cuentas:', error.response.data)
    alert('Error. Revisa la consola para ver los detalles.')
  }
}

onMounted(() => obtenerCuentas())

</script>

<style lang="sass">
.my-sticky-header-column-table
  /* height or max-height is important */
  height: 400px

  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  max-width: 1300px

  td:first-child
    /* bg color is important for td; just specify one */
    background-color: #00b4ff

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #00b4ff

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px

.desc-cell
  max-width: 400px
  white-space: normal
  overflow-wrap: anywhere
  word-break: break-word
</style>
