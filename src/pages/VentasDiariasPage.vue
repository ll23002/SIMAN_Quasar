<template>
  <q-page padding class="ventas-diarias-page bg-dark-page">
    <div class="page-header q-mb-xl">
      <div class="row items-center justify-between">
        <div class="col-12 col-md-6 q-mb-md">
          <div class="text-h3 text-weight-bold q-mb-xs text-white">
            <q-icon name="trending_up" size="md" color="cyan-4" class="q-mr-sm" />
            Ventas Diarias
          </div>
          <div class="text-subtitle1 text-grey-5">
            <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
            Resumen de operaciones del día: <span class="text-weight-medium text-cyan-4">{{ formatearFecha(fecha) }}</span>
          </div>
        </div>
        <div class="col-12 col-md-auto">
          <q-input
            dark
            outlined
            v-model="fecha"
            mask="date"
            :rules="['date']"
            label="Seleccionar Fecha"
            class="date-picker-input"
            dense
          >
            <template v-slot:prepend>
              <q-icon name="event" color="cyan-4" />
            </template>
            <template v-slot:append>
              <q-icon name="arrow_drop_down" class="cursor-pointer" color="cyan-4">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    dark
                    v-model="fecha"
                    @update:model-value="cargarReporte"
                    mask="YYYY/MM/DD"
                    today-btn
                    color="cyan-4"
                  >
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn label="Hoy" color="cyan-4" flat @click="irHoy" />
                      <q-btn v-close-popup label="Cerrar" color="cyan-4" />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <transition-group name="fade-slide" class="row q-col-gutter-lg q-mb-xl" tag="div">
      <div class="col-12 col-sm-6 col-md-4" key="card-1">
        <q-card class="metric-card metric-card-success bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="q-pb-none">
            <div class="row items-center justify-between">
              <div class="col">
                <div class="text-grey-5 text-caption text-uppercase">Venta Total</div>
                <div class="text-h4 text-weight-bold text-green-4 q-mt-sm">
                  {{ formatearDinero(totales.total_dinero) }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  <q-icon name="trending_up" size="xs" />
                  Ingreso Bruto del Día
                </div>
              </div>
              <div class="col-auto">
                <q-avatar size="64px" color="green-9" text-color="green-2" class="metric-icon" style="background: rgba(16, 185, 129, 0.15) !important">
                  <q-icon name="payments" size="32px" />
                </q-avatar>
              </div>
            </div>
          </q-card-section>
          <q-linear-progress :value="1" color="green-4" class="q-mt-md" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4" key="card-2">
        <q-card class="metric-card metric-card-warning bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="q-pb-none">
            <div class="row items-center justify-between">
              <div class="col">
                <div class="text-grey-5 text-caption text-uppercase">Impuestos (IVA)</div>
                <div class="text-h4 text-weight-bold text-orange-4 q-mt-sm">
                  {{ formatearDinero(totales.total_impuesto) }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  <q-icon name="info" size="xs" />
                  A pagar al fisco
                </div>
              </div>
              <div class="col-auto">
                <q-avatar size="64px" color="orange-9" text-color="orange-2" class="metric-icon" style="background: rgba(245, 158, 11, 0.15) !important">
                  <q-icon name="account_balance" size="32px" />
                </q-avatar>
              </div>
            </div>
          </q-card-section>
          <q-linear-progress :value="1" color="orange-4" class="q-mt-md" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4" key="card-3">
        <q-card class="metric-card metric-card-info bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="q-pb-none">
            <div class="row items-center justify-between">
              <div class="col">
                <div class="text-grey-5 text-caption text-uppercase">Facturas Emitidas</div>
                <div class="text-h4 text-weight-bold text-cyan-4 q-mt-sm">
                  {{ totales.cantidad_facturas }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  <q-icon name="description" size="xs" />
                  Transacciones registradas
                </div>
              </div>
              <div class="col-auto">
                <q-avatar size="64px" color="cyan-9" text-color="cyan-2" class="metric-icon" style="background: rgba(34, 211, 238, 0.15) !important">
                  <q-icon name="receipt_long" size="32px" />
                </q-avatar>
              </div>
            </div>
          </q-card-section>
          <q-linear-progress :value="1" color="cyan-4" class="q-mt-md" />
        </q-card>
      </div>
    </transition-group>

    <q-card class="table-card bg-dark-card text-white no-shadow" bordered>
      <q-card-section class="q-pb-none">
        <div class="row items-center justify-between">
          <div class="text-h6 text-weight-medium">
            <q-icon name="list_alt" color="cyan-4" class="q-mr-sm" />
            Detalle de Facturas
          </div>
          <q-btn
            icon="refresh"
            label="Actualizar"
            color="cyan-4"
            outline
            dense
            @click="cargarReporte"
            :loading="loading"
          >
            <q-tooltip>Recargar datos</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-separator class="q-my-md" color="grey-8" />

      <q-table
        flat
        :rows="filas"
        :columns="columnas"
        row-key="numero_factura"
        :loading="loading"
        :rows-per-page-options="[10, 25, 50]"
        :pagination="{ rowsPerPage: 10 }"
        class="modern-table bg-transparent text-grey-4"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-dark-page text-grey-5">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="cyan-4">
            <q-spinner-gears size="50px" color="cyan-4" />
            <div class="text-subtitle2 q-mt-md text-grey-4">Cargando datos...</div>
          </q-inner-loading>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg">
            <q-icon name="info" size="2em" color="grey-5" />
            <span class="text-subtitle1 text-grey-5">
              No hay facturas para la fecha seleccionada
            </span>
          </div>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props" class="hoverable-row">
            <q-td key="numero_factura" :props="props">
              <div class="text-weight-bold text-cyan-4">
                {{ props.row.numero_factura }}
              </div>
            </q-td>

            <q-td key="cliente__nombre" :props="props">
              <div class="row items-center no-wrap">
                <q-avatar size="32px" color="grey-8" text-color="grey-4" class="q-mr-sm">
                  <q-icon name="person" />
                </q-avatar>
                <div class="text-weight-medium">{{ props.row.cliente__nombre }}</div>
              </div>
            </q-td>

            <q-td key="total" :props="props" class="text-right">
              <div class="text-weight-bold text-green-4">
                {{ formatearDinero(props.row.total) }}
              </div>
            </q-td>

            <q-td key="estado" :props="props" class="text-center">
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
          </q-tr>
        </template>
      </q-table>
    </q-card>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { date } from 'quasar'

const fecha = ref(date.formatDate(Date.now(), 'YYYY/MM/DD'))
const loading = ref(false)
const filas = ref([])
const totales = ref({ total_dinero: 0, total_impuesto: 0, cantidad_facturas: 0 })

const columnas = [
  {
    name: 'numero_factura',
    label: '# Factura',
    field: 'numero_factura',
    align: 'left',
    sortable: true
  },
  {
    name: 'cliente__nombre',
    label: 'Cliente',
    field: 'cliente__nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'total',
    label: 'Total',
    field: 'total',
    align: 'right',
    sortable: true
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
    sortable: true
  },
]

const cargarReporte = async () => {
  loading.value = true
  try {
    const fechaBackend = fecha.value.replace(/\//g, '-')
    const res = await axios.get(`http://167.172.219.5:8000/api/contabilidad/ventas_diarias/?fecha=${fechaBackend}`)

    totales.value = res.data.meta
    filas.value = res.data.detalle
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatearDinero = (val) => {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(val || 0)
}

const formatearFecha = (fechaStr) => {
  const fechaObj = new Date(fechaStr.replace(/\//g, '-'))
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(fechaObj)
}

const irHoy = () => {
  fecha.value = date.formatDate(Date.now(), 'YYYY/MM/DD')
  cargarReporte()
}

onMounted(() => {
  cargarReporte()
})
</script>

<style scoped lang="scss">
.ventas-diarias-page {
  min-height: 100vh;
}

.bg-dark-page {
  background-color: #0b1120;
}

.bg-dark-card {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.page-header {
  padding: 1rem;
  border-radius: 12px;
}

.date-picker-input {
  min-width: 250px;

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

.metric-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-width: 1px;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
}

.metric-card-success {
  border-color: rgba(16, 185, 129, 0.2) !important;
}

.metric-card-warning {
  border-color: rgba(245, 158, 11, 0.2) !important;
}

.metric-card-info {
  border-color: rgba(34, 211, 238, 0.2) !important;
}

.metric-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.table-card {
  border-radius: 16px;
  overflow: hidden;
  border-width: 1px;
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

.fade-slide-enter-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 600px) {
  .page-header {
    text-align: center;
  }

  .date-picker-input {
    min-width: 100%;
  }

  .metric-card {
    margin-bottom: 1rem;
  }
}

.q-chip {
  font-size: 0.7rem;
  padding: 4px 8px;
}
</style>
