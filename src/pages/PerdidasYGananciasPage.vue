<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

// =====================================
// Helpers
// =====================================
const formatCurrency = (value) => {
  if (!value) return '$0.00'
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}

// =====================================
// Data
// =====================================
const mayor = ref([])

// Clasificados
const ingresos = ref([])
const costos = ref([])
const gastos = ref([])

async function obtenerLibroMayor() {
  const response = await axios.get('http://178.128.79.42:8000/api/contabilidad/libro_mayor/')
  mayor.value = response.data
  clasificarCuentas()
}

function clasificarCuentas() {
  ingresos.value = []
  costos.value = []
  gastos.value = []

  for (const row of mayor.value) {
    const code = String(row.codigo)

    // INGRESOS (4-XXX)
    if (code.startsWith('4')) {
      ingresos.value.push({
        ...row,
        valor: row.naturaleza === 'C' ? row.saldo : -row.saldo
      })
    }

    // COSTOS (5-XXX)
    else if (code.startsWith('5')) {
      costos.value.push({
        ...row,
        valor: row.naturaleza === 'D' ? row.saldo : -row.saldo
      })
    }

    // GASTOS (6-XXX)
    else if (code.startsWith('6')) {
      gastos.value.push({
        ...row,
        valor: row.naturaleza === 'D' ? row.saldo : -row.saldo
      })
    }
  }
}

// =====================================
// Totals (computed)
// =====================================
const totalIngresos = computed(() =>
  ingresos.value.reduce((acc, x) => acc + Number(x.valor), 0)
)

const totalCostos = computed(() =>
  costos.value.reduce((acc, x) => acc + Number(x.valor), 0)
)

const totalGastos = computed(() =>
  gastos.value.reduce((acc, x) => acc + Number(x.valor), 0)
)

const utilidadBruta = computed(() => totalIngresos.value - totalCostos.value)

const utilidadNeta = computed(() => utilidadBruta.value - totalGastos.value)

// Columns for q-table
const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Cuenta', field: 'nombre', align: 'left' },
  { name: 'valor', label: 'Valor', align: 'right', field: 'valor', format: val => formatCurrency(val) }
]

onMounted(() => {
  obtenerLibroMayor()
})
</script>

<template>
  <q-page padding>
    <div class="q-pa-md">

      <div class="text-h5 q-mb-md">Estado de Pérdidas y Ganancias</div>

      <!-- ====== INGRESOS ====== -->
      <q-table
        title="Ingresos"
        :columns="columns"
        :rows="ingresos"
        row-key="codigo"
        dense flat bordered
        hide-bottom
      >
        <template v-slot:bottom-row>
          <q-tr class="text-bold">
            <q-td colspan="2">Total Ingresos</q-td>
            <q-td align="right">{{ formatCurrency(totalIngresos) }}</q-td>
          </q-tr>
        </template>
      </q-table>

      <q-separator class="q-my-md" />

      <!-- ====== COSTOS ====== -->
      <q-table
        title="Costos"
        :columns="columns"
        :rows="costos"
        row-key="codigo"
        dense flat bordered
        hide-bottom
      >
        <template v-slot:bottom-row>
          <q-tr class="text-bold">
            <q-td colspan="2">Total Costos</q-td>
            <q-td align="right">{{ formatCurrency(totalCostos) }}</q-td>
          </q-tr>
        </template>
      </q-table>

      <q-separator class="q-my-md" />

      <!-- ====== GASTOS ====== -->
      <q-table
        title="Gastos"
        :columns="columns"
        :rows="gastos"
        row-key="codigo"
        dense flat bordered
        hide-bottom
      >
        <template v-slot:bottom-row>
          <q-tr class="text-bold">
            <q-td colspan="2">Total Gastos</q-td>
            <q-td align="right">{{ formatCurrency(totalGastos) }}</q-td>
          </q-tr>
        </template>
      </q-table>

      <q-separator class="q-my-xl" />

      <!-- ====== UTILIDADES ====== -->
      <div class="text-h6 q-mt-md">Resumen</div>
      <div class="q-mt-sm">
        <div><b>Utilidad Bruta:</b> {{ formatCurrency(utilidadBruta) }}</div>
        <div><b>Utilidad Neta:</b> {{ formatCurrency(utilidadNeta) }}</div>
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
