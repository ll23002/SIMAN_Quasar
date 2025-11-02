<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

const columns = [
  {
    name: 'fecha',
    label: 'FECHA',
    align: 'left',
    field: 'fecha',
    sortable: true
  },
  {
    name: 'numero_factura',
    label: 'NÚMERO DE FACTURA',
    align: 'left',
    field: 'numero_factura',
    sortable: true,
  },
  {
    name: 'subtotal',
    label: 'SUBTOTAL',
    align: 'left',
    field: 'subtotal',
    sortable: true,
  },
  {
    name: 'impuesto',
    label: 'IVA',
    align: 'left',
    field: 'impuesto',
    sortable: true
  },
  {
    name: 'total',
    label: 'TOTAL',
    align: 'left',
    field: 'total',
    sortable: true
  },
  {
    name: 'estado',
    label: 'ESTADO',
    align: 'left',
    field: 'estado',
    sortable: true,
  },
]

const rows = ref([])
const pagination = ref({
  page: 1,
  rowsPerPage: rows.value.length,
})

async function obtenerFacturas() {
  try {
    const response = await axios.get('http://localhost:8000/api/contabilidad/facturas/obtener/')
    rows.value = response.data
    pagination.value.page = 1
    pagination.value.rowsPerPage = rows.value.length
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
    rows.value = []
  }
}

onMounted(() => {
  obtenerFacturas()
})
</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-table
        class="my-sticky-header-column-table"
        flat
        bordered
        title="Treats"
        dense
        :rows="rows"
        :columns="columns"
        row-key="numero_factura"
        hide-bottom
        v-model:pagination="pagination"
      >
      </q-table>
    </div>
  </q-page>
</template>

<style scoped lang="sass">

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
</style>
