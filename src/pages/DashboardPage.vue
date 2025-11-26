<template>
  <q-page class="q-pa-md bg-dark-page">
    <div class="row items-center q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Resumen Financiero</div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="my-card bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Ventas Hoy</div>
              <div class="text-h4 text-weight-bolder q-mt-sm">${{ ventas_hoy }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                color="green-9"
                text-color="green-2"
                icon="trending_up"
                size="md"
                font-size="24px"
                style="background: rgba(16, 185, 129, 0.15) !important"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="my-card bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Por Cobrar</div>
              <div class="text-h4 text-weight-bolder q-mt-sm">${{ por_cobrar }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                color="orange-9"
                text-color="orange-2"
                icon="warning"
                size="md"
                font-size="24px"
                style="background: rgba(245, 158, 11, 0.15) !important"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="my-card bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Pasivo Circulante</div>
              <div class="text-h4 text-weight-bolder q-mt-sm">${{pasivo_circulante}}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                color="purple-9"
                text-color="purple-2"
                icon="account_balance_wallet"
                size="md"
                font-size="24px"
                style="background: rgba(123, 97, 255, 0.15) !important"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-mb-lg">
      <div class="col-12">
        <q-card class="bg-dark-card text-white no-shadow" bordered style="min-height: 350px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Tendencia de Ingresos vs Gastos</div>
            <q-space />
          </q-card-section>

          <q-card-section>
            <apexchart
              type="line"
              height="300"
              :options="chartOptions"
              :series="series"
            ></apexchart>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section>
            <div class="text-h6">Facturación Reciente</div>
          </q-card-section>

          <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            flat
            bordered
            class="bg-transparent text-grey-4 no-border"
            :pagination="{ rowsPerPage: 5 }"
            hide-bottom
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-dark-page text-grey-5">
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body-cell-estado="props">
              <q-td :props="props">
                <q-chip
                  dense
                  :color="props.row.estado === 'Completado' ? 'green-9' : 'orange-9'"
                  :text-color="props.row.estado === 'Completado' ? 'green-2' : 'orange-2'"
                  class="text-weight-bold q-px-sm"
                  style="background-opacity: 0.2"
                >
                  {{ props.row.estado }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-acciones="props">
              <q-td :props="props">
                <q-btn flat round dense color="grey" icon="more_horiz" />
              </q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import axios from 'axios'
const apexchart = VueApexCharts

const por_cobrar = ref(0)
const ventas_hoy = ref(0)
const pasivo_circulante = ref(0)

const columns = [
  {
    name: 'fecha',
    label: 'FECHA',
    align: 'left',
    field: 'fecha',
    sortable: true,
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
    sortable: true,
  },
  {
    name: 'total',
    label: 'TOTAL',
    align: 'left',
    field: 'total',
    sortable: true,
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
  },
]

const rows = ref([])
async function obtenerFacturas() {
  try {
    const response = await axios.get('http://178.128.79.42:8000/api/contabilidad/facturas/obtener/')
    rows.value = response.data
  } catch (error) {
    console.error('Error obteniendo facturas:', error)
    rows.value = []
  }
}

async function obtener_por_cobrar() {
  try {
    const response = await axios.get('http://178.128.79.42:8000/api/contabilidad/por_cobrar/')
    por_cobrar.value = response.data.total_por_cobrar
  } catch (error) {
    console.error('Error obteniendo valor:', error)
  }
}

async function obtener_ventas_hoy() {
  try {
    const response = await axios.get('http://178.128.79.42:8000/api/contabilidad/ventas_hoy/')
    ventas_hoy.value = response.data.total_ventas
  } catch (error) {
    console.error('Error obteniendo valor:', error)
  }
}

async function obtener_pasivo_circulante() {
  try {
    const response = await axios.get('http://178.128.79.42:8000/api/contabilidad/pasivo_circulante')
    pasivo_circulante.value = response.data.total_saldo_actual
  } catch (error) {
    console.error('Error obteniendo valor:', error)
  }
}

const cargarGrafico = async () => {
  try {
    const { data } = await axios.get('http://178.128.79.42:8000/api/contabilidad/datos_grafica/')

    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: data.categories
      }
    }
    series.value = data.series
  } catch (error) {
    console.error("Error cargando gráfico, seguramente no tienes datos", error)
  }
}

onMounted(() => {
  obtenerFacturas()
  obtener_por_cobrar()
  obtener_ventas_hoy()
  obtener_pasivo_circulante()
  cargarGrafico()
})

//Debo cambiar esto
const series = ref([])

//Debo cambiar esto
const chartOptions = ref({
  chart: {
    height: 350,
    type: 'area',
    background: 'transparent',
    zoom: { enabled: false },
    toolbar: { show: false },
  },

  colors: ['#00e5ff', '#a78bfa'],

  dataLabels: { enabled: false },

  stroke: {
    curve: 'smooth',
    width: 4,
  },

  xaxis: {
    categories: [],
    labels: {
      style: { colors: '#ccc' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },

  yaxis: {
    labels: {
      style: { colors: '#ccc' },
    },
  },

  grid: {
    borderColor: '#535A6C',
    xaxis: {
      lines: { show: true },
    },
  },

  theme: { mode: 'dark' },

  fill: {
    type: 'solid',
    opacity: 0.3,
  },

  markers: {
    size: 0,
    hover: {
      size: 5,
    },
  },

  legend: {
    position: 'top',
    horizontalAlign: 'right',
    offsetY: -20,
  },
})
</script>

<style lang="scss" scoped>
.bg-dark-page {
  background-color: #0b1120;
}
.bg-dark-card {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.q-table__container {
  background-color: transparent !important;
}
</style>
