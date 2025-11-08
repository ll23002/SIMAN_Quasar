<template>
  <q-page padding>

    <div class="q-pa-md">
      <h1>Aún falta</h1>
    </div>
    <q-btn
      label="Enviar datos"
      @click="enviarDatos"
      color="primary"
    />
    <div class="q-pa-md">
      <q-table
        class="my-sticky-header-column-table"
        flat bordered
        title="Treats"
        dense
        :rows="rows"
        :columns="columns"
        row-key="codigo"
        hide-bottom
        v-model:pagination="pagination"
      >
        <template v-slot:body-cell-Descripcion="props">
          <q-td :props="props">
            <div class="desc-cell">{{ props.row.Descripcion }}</div>
          </q-td>
        </template>
      </q-table>
    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
const columns = [
  { name: 'Nombre', required: true, label: 'NOMBRE', align: 'left', field: 'Nombre', sortable: true },
  { name: 'SKU', align: 'center', label: 'SKU', field: 'SKU', sortable: true },
  { name: 'PrecioVenta', label: 'PRECIO VENTA', field: 'PrecioVenta', sortable: true },
  { name: 'PrecioCosto', label: 'PRECIO COSTO', field: 'PrecioCosto', sortable: true},
  { name: 'CuentaInventario', label: 'CUENTA INVENTARIO', field: 'CuentaInventario', sortable: true },
  { name: 'CuentaImpuesto', label: 'CUENTA IMPUESTO', field: 'CuentaImpuesto', sortable: true },
  { name: 'CuentaIngreso', label: 'CUENTA INGRESO', field: 'CuentaIngreso', sortable: true },
  { name: 'CuentaCosto', label: 'CUENTA COSTO', field: 'CuentaCosto', sortable: true },
  { name: 'Descripcion', label: 'DESCRIPCIÓN', field: 'Descripcion', align: 'left', sortable: true}
]

const rows = ref([
  { Nombre: 'Laptop Dell XPS 15', SKU: 'LAP-DEL-XPS15', PrecioVenta: 1500.00, PrecioCosto: 1000, CuentaInventario: 6, CuentaImpuesto: 11, CuentaIngreso: 15, CuentaCosto: 18,
    Descripcion: 'Laptop Dell XPS 15 con procesador Intel Core i7-1165G7, 16GB de RAM, 512GB de SSD y 15.6" de pantalla. Con sistema operativo Windows 11' },

  { Nombre: 'Smartphone Samsung Galaxy S21', SKU: 'SMA-GAL-S21', PrecioVenta: 799.99, PrecioCosto: 500, CuentaInventario: 6, CuentaImpuesto: 11, CuentaIngreso: 15, CuentaCosto: 18,
    Descripcion: 'Smartphone Samsung Galaxy S21 con pantalla de 6.2",'},

  { Nombre: 'Cargador de 10000 mAh', SKU: 'CAR-10000', PrecioVenta: 100.00, PrecioCosto:50, CuentaInventario: 6, CuentaImpuesto: 11, CuentaIngreso: 15, CuentaCosto: 18,
  Descripcion: 'Cargador de 10000 mAh para smartphone Samsung Galaxy S21' },

  {Nombre: 'Billetera de cuero', SKU: 'BIL-CUER', PrecioVenta: 100.00, PrecioCosto:50, CuentaInventario: 6, CuentaImpuesto: 11, CuentaIngreso: 15, CuentaCosto: 18,
  Descripcion: 'Billetera de cuero de 100 euros' },

  {Nombre: 'Camiseta de manga corta', SKU: 'CAM-COR', PrecioVenta: 15.00, PrecioCosto:10, CuentaInventario: 6, CuentaImpuesto: 11, CuentaIngreso: 15, CuentaCosto: 18,
  Descripcion: 'Camiseta de manga corta de 100 euros' },

  {Nombre: 'Camiseta de manga larga', SKU: 'CAM-LAR', PrecioVenta: 20.00, PrecioCosto:10, CuentaInventario: 6, CuentaImpuesto: 11, CuentaIngreso: 15, CuentaCosto: 18,
  Descripcion: 'Camiseta de manga larga de 100 euros' },

])

const pagination = ref({
  page: 1,
  rowsPerPage: rows.value.length
})

const enviarDatos = async () => {
  try {
    const productos = rows.value.map(r => ({
      nombre: r.Nombre,
      sku: r.SKU,
      precio_venta: r.PrecioVenta,
      precio_costo: r.PrecioCosto,
      cuenta_inventario: r.CuentaInventario,
      cuenta_impuesto: r.CuentaImpuesto,
      cuenta_ingreso: r.CuentaIngreso,
      cuenta_costo: r.CuentaCosto,
      descripcion: r.Descripcion,
    }));

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

