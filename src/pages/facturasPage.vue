<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

const rows = ref([])
const expandedRows = ref(new Set())
const loading = ref(false)
const filter = ref('')

function formatearDinero(val) {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD'
  }).format(val || 0)
}

function formatearFecha(fecha) {
  if (!fecha) return ''

  try {
    let date = fecha instanceof Date ? fecha : new Date(fecha)

    if (isNaN(date.getTime())) {
      const parts = fecha.split('-')
      if (parts.length === 3) {
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
      }
    }

    if (isNaN(date.getTime())) {
      return fecha
    }

    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    console.error('Error formateando fecha:', fecha, error)
    return fecha
  }
}

const columns = [
  {
    name: 'expand',
    label: '',
    align: 'center',
    field: 'expand',
    style: 'width: 50px'
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
    label: 'N° FACTURA',
    align: 'left',
    field: 'numero_factura',
    sortable: true,
  },
  {
    name: 'cliente',
    label: 'CLIENTE',
    align: 'left',
    field: 'cliente_nombre',
    sortable: true,
  },
  {
    name: 'subtotal',
    label: 'SUBTOTAL',
    align: 'right',
    field: 'subtotal',
    sortable: true
  },
  {
    name: 'impuesto',
    label: 'IVA',
    align: 'right',
    field: 'impuesto',
    sortable: true
  },
  {
    name: 'total',
    label: 'TOTAL',
    align: 'right',
    field: 'total',
    sortable: true
  },
  {
    name: 'estado',
    label: 'ESTADO',
    align: 'center',
    field: 'estado',
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'ACCIONES',
    align: 'center',
    style: 'width: 100px'
  }
]

const estadisticas = computed(() => {
  const total = rows.value.reduce((sum, row) => sum + parseFloat(row.total || 0), 0)
  const totalImpuestos = rows.value.reduce((sum, row) => sum + parseFloat(row.impuesto || 0), 0)
  const cantidad = rows.value.length
  const pagadas = rows.value.filter(r => r.estado === 'PAGADA').length

  return { total, totalImpuestos, cantidad, pagadas }
})

async function obtenerFacturas() {
  loading.value = true
  try {
    const response = await axios.get('http://167.172.219.5:8000/api/contabilidad/facturas/obtener/')
    rows.value = response.data
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
    rows.value = []
  } finally {
    loading.value = false
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
  <q-page class="q-pa-md bg-dark-page">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-white text-weight-bold">
          <q-icon name="receipt_long" size="md" color="cyan-4" class="q-mr-sm" />
          Historial de Facturas
        </div>
        <div class="text-subtitle2 text-grey-5 q-mt-xs">
          Gestión y consulta de facturas emitidas
        </div>
      </div>
      <q-btn
        outline
        color="cyan-4"
        icon="refresh"
        label="Actualizar"
        @click="obtenerFacturas"
        :loading="loading"
        class="no-shadow"
      >
        <q-tooltip>Recargar facturas</q-tooltip>
      </q-btn>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center q-pb-none">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Total Facturado</div>
              <div class="text-h5 text-weight-bold text-green-4 q-mt-sm">
                {{ formatearDinero(estadisticas.total) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="56px"
                color="green-9"
                text-color="green-2"
                style="background: rgba(16, 185, 129, 0.15) !important"
              >
                <q-icon name="payments" size="28px" />
              </q-avatar>
            </div>
          </q-card-section>
          <q-linear-progress :value="1" color="green-4" class="q-mt-md" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center q-pb-none">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Impuestos (IVA)</div>
              <div class="text-h5 text-weight-bold text-orange-4 q-mt-sm">
                {{ formatearDinero(estadisticas.totalImpuestos) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="56px"
                color="orange-9"
                text-color="orange-2"
                style="background: rgba(245, 158, 11, 0.15) !important"
              >
                <q-icon name="account_balance" size="28px" />
              </q-avatar>
            </div>
          </q-card-section>
          <q-linear-progress :value="1" color="orange-4" class="q-mt-md" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center q-pb-none">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Total Facturas</div>
              <div class="text-h5 text-weight-bold text-cyan-4 q-mt-sm">
                {{ estadisticas.cantidad }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="56px"
                color="cyan-9"
                text-color="cyan-2"
                style="background: rgba(34, 211, 238, 0.15) !important"
              >
                <q-icon name="description" size="28px" />
              </q-avatar>
            </div>
          </q-card-section>
          <q-linear-progress :value="1" color="cyan-4" class="q-mt-md" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center q-pb-none">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Pagadas</div>
              <div class="text-h5 text-weight-bold text-blue-4 q-mt-sm">
                {{ estadisticas.pagadas }}/{{ estadisticas.cantidad }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="56px"
                color="blue-9"
                text-color="blue-2"
                style="background: rgba(59, 130, 246, 0.15) !important"
              >
                <q-icon name="check_circle" size="28px" />
              </q-avatar>
            </div>
          </q-card-section>
          <q-linear-progress :value="1" color="blue-4" class="q-mt-md" />
        </q-card>
      </div>
    </div>

    <q-card class="bg-dark-card text-white no-shadow" bordered>
      <q-card-section class="row items-center q-pb-sm">
        <div class="text-h6">
          <q-icon name="list_alt" color="cyan-4" class="q-mr-sm" />
          Lista de Facturas
        </div>
        <q-space />
        <q-input
          v-model="filter"
          dark
          dense
          outlined
          placeholder="Buscar factura o cliente..."
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-5" />
          </template>
          <template v-slot:append v-if="filter">
            <q-icon name="close" @click="filter = ''" class="cursor-pointer" color="grey-5" />
          </template>
        </q-input>
      </q-card-section>

      <q-table
        flat
        :rows="rows"
        :columns="columns"
        row-key="id"
        class="bg-transparent text-grey-4 modern-table"
        :pagination="{ rowsPerPage: 10 }"
        :loading="loading"
        :filter="filter"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-dark-page text-grey-5">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" class="hoverable-row">
            <q-td key="expand" :props="props">
              <q-btn
                size="sm"
                :color="isExpanded(props.row.id) ? 'cyan-4' : 'grey-6'"
                round
                dense
                flat
                @click="toggleExpand(props.row.id)"
                :icon="isExpanded(props.row.id) ? 'expand_less' : 'expand_more'"
              >
                <q-tooltip>{{ isExpanded(props.row.id) ? 'Ocultar' : 'Ver' }} detalles</q-tooltip>
              </q-btn>
            </q-td>

            <q-td key="fecha" :props="props">
              <div class="text-weight-medium">
                <q-icon name="event" size="xs" class="q-mr-xs" color="grey-5" />
                {{ formatearFecha(props.row.fecha) }}
              </div>
            </q-td>

            <q-td key="numero_factura" :props="props">
              <div class="text-weight-bold text-cyan-4">
                {{ props.row.numero_factura }}
              </div>
            </q-td>

            <q-td key="cliente" :props="props">
              <div class="row items-center no-wrap">
                <q-avatar size="32px" color="grey-8" text-color="grey-4" class="q-mr-sm">
                  <q-icon name="person" />
                </q-avatar>
                <div class="text-weight-medium">{{ props.row.cliente_nombre }}</div>
              </div>
            </q-td>

            <q-td key="subtotal" :props="props" class="text-right">
              <span class="text-weight-medium text-grey-4">
                {{ formatearDinero(props.row.subtotal) }}
              </span>
            </q-td>

            <q-td key="impuesto" :props="props" class="text-right">
              <span class="text-weight-medium text-orange-4">
                {{ formatearDinero(props.row.impuesto) }}
              </span>
            </q-td>

            <q-td key="total" :props="props" class="text-right">
              <span class="text-weight-bold text-green-4">
                {{ formatearDinero(props.row.total) }}
              </span>
            </q-td>

            <q-td key="estado" :props="props">
              <q-chip
                dense
                :color="props.row.estado === 'PAGADA' ? 'green-9' : 'orange-9'"
                :text-color="props.row.estado === 'PAGADA' ? 'green-2' : 'orange-2'"
                class="text-weight-bold q-px-sm"
              >
                <q-icon
                  :name="props.row.estado === 'PAGADA' ? 'check_circle' : 'schedule'"
                  size="xs"
                  class="q-mr-xs"
                />
                {{ props.row.estado }}
              </q-chip>
            </q-td>

            <q-td key="acciones" :props="props">
              <q-btn
                icon="picture_as_pdf"
                color="red-4"
                flat
                round
                dense
                :href="`http://167.172.219.5:8000/api/contabilidad/factura/${props.row.id}/pdf/`"
                target="_blank"
              >
                <q-tooltip>Descargar PDF</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>

          <q-tr v-if="isExpanded(props.row.id)" :props="props">
            <q-td colspan="100%" class="bg-dark-page">
              <div class="q-pa-md">
                <div class="row items-center q-mb-md">
                  <q-icon name="inventory_2" color="cyan-4" size="sm" class="q-mr-sm" />
                  <span class="text-h6 text-white">
                    Productos de la Factura {{ props.row.numero_factura }}
                  </span>
                </div>

                <q-markup-table flat dark class="details-table bg-dark-card">
                  <thead>
                    <tr>
                      <th class="text-left text-grey-4">PRODUCTO</th>
                      <th class="text-right text-grey-4">CANTIDAD</th>
                      <th class="text-right text-grey-4">PRECIO/UNIT.</th>
                      <th class="text-right text-grey-4">SUBTOTAL</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="(detalle, index) in props.row.detalles"
                      :key="index"
                      class="detail-row"
                    >
                      <td class="text-left">
                        <div class="row items-center">
                          <q-icon name="shopping_bag" size="xs" color="cyan-4" class="q-mr-sm" />
                          <span class="text-weight-medium text-white">{{ detalle.producto }}</span>
                        </div>
                      </td>

                      <td class="text-right text-cyan-3">
                        <q-chip dense color="cyan-9" text-color="cyan-2" size="sm">
                          {{ detalle.cantidad }}
                        </q-chip>
                      </td>

                      <td class="text-right text-grey-4">
                        {{ formatearDinero(detalle.precio_unitario) }}
                      </td>

                      <td class="text-right text-weight-bold text-green-4">
                        {{ formatearDinero(detalle.subtotal_linea) }}
                      </td>
                    </tr>
                  </tbody>

                  <tfoot v-if="props.row.detalles && props.row.detalles.length">
                    <tr>
                      <td colspan="3" class="text-right text-grey-4 text-weight-bold">
                        TOTAL:
                      </td>
                      <td class="text-right text-weight-bold text-green-3">
                        {{ formatearDinero(props.row.total) }}
                      </td>
                    </tr>
                  </tfoot>
                </q-markup-table>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="cyan-4">
            <q-spinner-gears size="50px" color="cyan-4" />
            <div class="text-subtitle2 q-mt-md text-grey-4">Cargando facturas...</div>
          </q-inner-loading>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon name="info" size="2em" color="grey-5" />
            <span class="text-subtitle1 text-grey-5">
              No hay facturas registradas
            </span>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<style scoped lang="scss">
.bg-dark-page {
  background-color: #0b1120;
}

.bg-dark-card {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  }
}

.modern-table {
  .q-table__container {
    background-color: transparent !important;
  }

  thead tr {
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }

  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.hoverable-row {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
}

.search-input {
  max-width: 350px;

  :deep(.q-field__control) {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
  }

  :deep(.q-field__native) {
    color: #fff;
  }
}

.details-table {
  border-radius: 8px;
  overflow: hidden;

  thead tr {
    background-color: #334155;
  }

  .detail-row {
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.02);
    }
  }

  td, th {
    padding: 12px 16px;
  }
}

.q-chip {
  font-size: 0.7rem;
  padding: 4px 8px;
}

@media (max-width: 600px) {
  .search-input {
    max-width: 100%;
  }
}
</style>
