<template>
  <q-page class="q-pa-md bg-dark-page">
    <div class="row items-center q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Resumen Financiero</div>
      <q-space />
      <q-btn flat icon="refresh" color="grey" rounded />
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="my-card bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Ventas Hoy</div>
              <div class="text-h4 text-weight-bolder q-mt-sm">$45,200</div>
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
              <div class="text-h4 text-weight-bolder q-mt-sm">$12,150</div>
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
              <div class="text-h4 text-weight-bolder q-mt-sm">$8,500</div>
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
            <q-btn-dropdown
              outline
              dense
              color="grey-5"
              label="Ultimos 6 meses"
              class="no-shadow"
              size="sm"
            />
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
            :rows="facturas"
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
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
const apexchart = VueApexCharts

const columns = [
  { name: 'nombre', align: 'left', label: 'Factura Nombre', field: 'nombre', sortable: true },
  { name: 'monto', align: 'left', label: 'Monto', field: 'monto', sortable: true },
  { name: 'fecha', align: 'left', label: 'Fecha Emisión', field: 'fecha', sortable: true },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado' },
  { name: 'acciones', align: 'center', label: '', field: 'acciones' },
]

//Debo cambiar esto
const facturas = ref([
  {
    id: 1,
    nombre: 'Facturación Digital 2023001',
    monto: '$12,560.00',
    fecha: '23/03/2023, 12:17:00',
    estado: 'Completado',
  },
  {
    id: 2,
    nombre: 'Facturación Digital 2023002',
    monto: '$9,900.00',
    fecha: '22/03/2023, 13:17:00',
    estado: 'Pendiente',
  },
  {
    id: 3,
    nombre: 'Facturación Digital 2023003',
    monto: '$4,200.00',
    fecha: '21/03/2023, 09:30:00',
    estado: 'Completado',
  },
])

//Debo cambiar esto
const series = ref([
  {
    name: 'Ingresos',
    data: [31, 40, 28, 51, 42, 109, 100],
  },
  {
    name: 'Gastos',
    data: [11, 32, 45, 32, 34, 52, 41],
  },
])

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
    width: 4
  },

  xaxis: {
    categories: ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
    labels: {
      style: { colors: '#ccc' }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },

  yaxis: {
    labels: {
      style: { colors: '#ccc' }
    },
  },

  grid: {
    borderColor: '#535A6C',
    xaxis: {
      lines: { show: true }
    }
  },

  theme: { mode: 'dark' },

  fill: {
    type: "solid",
    opacity: 0.3
  },

  markers: {
    size: 0,
    hover: {
      size: 5
    }
  },

  legend: {
    position: 'top',
    horizontalAlign: 'right',
    offsetY: -20
  }
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
