<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

const columns = [
  {
    name: 'expand',
    label: '',
    align: 'center',
    field: 'expand'
  },
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
  {
    name: 'cliente',
    label: 'CLIENTE',
    align: 'left',
    field: 'cliente_nombre',
    sortable: true,
  }
]

const rows = ref([])
const expandedRows = ref(new Set())

async function obtenerFacturas() {
  try {
    const response = await axios.get('http://localhost:8000/api/contabilidad/facturas/obtener/')
    rows.value = response.data
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
    rows.value = []
  }
}

function toggleExpand(rowId) {
  if (expandedRows.value.has(rowId)) {
    expandedRows.value.delete(rowId)
  } else {
    expandedRows.value.add(rowId)
  }
}

function isExpanded(rowId) {
  return expandedRows.value.has(rowId)
}

onMounted(() => {
  obtenerFacturas()
})
</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-table
        flat bordered
        title="Historial de Facturas"
        :rows="rows"
        :columns="columns"
        row-key="id"
      >

        <template v-slot:body-cell-expand="props">
          <q-td :props="props">
            <q-btn
              size="sm"
              color="primary"
              round
              dense
              @click="toggleExpand(props.row.id)"
              :icon="isExpanded(props.row.id) ? 'remove' : 'add'"
            />
          </q-td>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'expand'">
                <q-btn
                  size="sm"
                  color="primary"
                  round
                  dense
                  @click="toggleExpand(props.row.id)"
                  :icon="isExpanded(props.row.id) ? 'remove' : 'add'"
                />
              </template>
              <template v-else>
                {{ col.value }}
              </template>
            </q-td>
          </q-tr>

          <q-tr v-if="isExpanded(props.row.id)">
            <q-td colspan="100%">
              <div class="text-left q-pa-md">
                <div class="text-h6">Detalles de la Factura: {{ props.row.numero_factura }}</div>

                <q-list bordered separator class="q-mt-sm">
                  <q-item dense class="bg-grey-3">
                    <q-item-section><strong>Producto</strong></q-item-section>
                    <q-item-section side><strong>Cantidad</strong></q-item-section>
                    <q-item-section side><strong>Precio Unit.</strong></q-item-section>
                    <q-item-section side><strong>Subtotal</strong></q-item-section>
                  </q-item>

                  <q-item v-for="detalle in props.row.detalles" :key="detalle.producto">
                    <q-item-section>
                      <q-item-label>{{ detalle.producto }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label>{{ detalle.cantidad }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label>${{ parseFloat(detalle.precio_unitario).toFixed(2) }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label>${{ parseFloat(detalle.subtotal_linea).toFixed(2) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

              </div>
            </q-td>
          </q-tr>
        </template>

      </q-table>
    </div>
  </q-page>
</template>
