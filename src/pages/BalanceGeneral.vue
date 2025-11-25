<template>
  <q-page padding>
    <div class="q-pa-md">
      <h5 class="text-bold q-mb-md">Balance General</h5>

      <q-table
        title="Activos"
        :rows="activos"
        :columns="columns"
        row-key="codigo"
        dense
        flat
        bordered
        :rows-per-page-options="[0]"
        hide-bottom
      >
        <template v-slot:bottom-row>
          <q-tr class="text-bold text-body1">
            <q-td class="text-uppercase">Total Activos</q-td>
            <q-td align="right">{{ formatCurrency(totales.total_activos) }}</q-td>
          </q-tr>
        </template>
      </q-table>

      <q-table
        title="Pasivos"
        :rows="pasivos"
        :columns="columns"
        row-key="codigo"
        dense
        flat
        bordered
        :rows-per-page-options="[0]"
        hide-bottom
      >
        <template v-slot:bottom-row>
          <q-tr class="text-bold text-body1">
            <q-td class="text-uppercase">Total Pasivos</q-td>
            <q-td align="right">{{ formatCurrency(totales.total_pasivo) }}</q-td>
          </q-tr>
        </template>
      </q-table>

      <q-table
        title="Patrimonio"
        :rows="patrimonio"
        :columns="columns"
        row-key="codigo"
        dense
        flat
        bordered
        :rows-per-page-options="[0]"
        hide-bottom
      >
        <template v-slot:bottom-row>
          <q-tr class="text-bold text-body1">
            <q-td class="text-uppercase">Total Patrimonio</q-td>
            <q-td align="right">{{ formatCurrency(totales.total_patrimonio) }}</q-td>
          </q-tr>
        </template>
      </q-table>

      <div class="q-mt-md text-right text-bold">
        Total Pasivo + Patrimonio: {{ formatCurrency(totales.total_pasivo_patrimonio) }}
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const activos = ref([])
const pasivos = ref([])
const patrimonio = ref([])
const totales = ref({})

const columns = [
  {
    name: 'nombre',
    label: 'Cuenta',
    field: 'nombre',
    align: 'left',
    sortable: true,
    style: 'width: 350px'
  },
  {
    name: 'saldo',
    label: 'Saldo',
    field: 'saldo',
    align: 'right',
    sortable: true,
    format: val => formatCurrency(val)
  }
]

const formatCurrency = (value) => {
  if (!value) return '$0.00'
  const numValue = Number(value)
  return numValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}

const cargarBalanceGeneral = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/contabilidad/balance_general/')
    activos.value = response.data.activos
    pasivos.value = response.data.pasivos
    patrimonio.value = response.data.patrimonio
    totales.value = response.data.totales
  } catch (error) {
    console.error('Error al cargar el Balance General:', error)
  }
}

onMounted(() => {
  cargarBalanceGeneral()
})
</script>
