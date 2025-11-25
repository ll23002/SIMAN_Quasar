<template>
  <q-page padding>

    <div class="row items-center q-mb-md justify-between">
      <div>
        <div class="text-h4 text-primary text-weight-bold">Ventas Diarias</div>
        <div class="text-caption">Resumen de operaciones del día: {{ fecha }}</div>
      </div>
      <div>
        <q-input filled v-model="fecha" mask="date" :rules="['date']" label="Cambiar Fecha">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="fecha" @update:model-value="cargarReporte">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="bg-gradient-primary text-white shadow-3">
          <q-card-section>
            <div class="text-subtitle2">Venta Total</div>
            <div class="text-h3 text-weight-bolder">{{ formatearDinero(totales.total_dinero) }}</div>
          </q-card-section>
          <q-card-section class="row items-center no-wrap">
            <q-icon name="payments" size="sm" />
            <div class="q-ml-sm">Ingreso Bruto</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-gradient-primary text-white shadow-3">
          <q-card-section>
            <div class="text-subtitle2">Impuestos (IVA)</div>
            <div class="text-h3 text-weight-bold">{{ formatearDinero(totales.total_impuesto) }}</div>
          </q-card-section>
          <q-card-section class="row items-center no-wrap">
            <q-icon name="account_balance" size="sm" />
            <div class="q-ml-sm">A pagar al fisco</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-gradient-primary text-white shadow-3">
          <q-card-section>
            <div class="text-subtitle2">Facturas Emitidas</div>
            <div class="text-h3 text-weight-bold">{{ totales.cantidad_facturas }}</div>
          </q-card-section>
          <q-card-section class="row items-center no-wrap">
            <q-icon name="receipt_long" size="sm" />
            <div class="q-ml-sm">Transacciones</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="shadow-2">
      <q-table
        title="Detalle de Facturas"
        :rows="filas"
        :columns="columnas"
        row-key="numero_factura"
        :loading="loading"
        flat
      >
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="props.value === 'PAGADA' ? 'green' : 'orange'">
              {{ props.value }}
            </q-badge>
          </q-td>
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
  { name: 'factura', label: '# Factura', field: 'numero_factura', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente__nombre', align: 'left' },
  { name: 'total', label: 'Total', field: 'total', format: val => formatearDinero(val), align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
]

const cargarReporte = async () => {
  loading.value = true
  try {
    // Ajusta la URL a tu backend
    // NOTA: Quasar usa / en fechas, Django usa -. Reemplazamos.
    const fechaBackend = fecha.value.replace(/\//g, '-')
    const res = await axios.get(`http://localhost:8000/api/contabilidad/ventas_diarias/?fecha=${fechaBackend}`)

    totales.value = res.data.meta
    filas.value = res.data.detalle
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatearDinero = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

onMounted(() => {
  cargarReporte()
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(87deg, #5e72e4 0, #825ee4 100%) !important;
}
.border-left-red {
  border-left: 5px solid #f5365c;
}
.border-left-green {
  border-left: 5px solid #2dce89;
}
</style>
