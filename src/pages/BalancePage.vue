<template>
  <q-page padding>
    <div class="q-pa-md">

      <h4 class="text-h5 q-mb-md">Balance General</h4>

      <!-- ===== ACTIVOS ===== -->
      <q-expansion-item 
        icon="inventory_2"
        label="Activos"
        expand-separator
        default-opened
      >
        <q-table
          :rows="balance.activos"
          :columns="columns"
          row-key="codigo"
          dense flat bordered
          :rows-per-page-options="[0]"
          hide-bottom
        />

        <div class="text-right text-bold q-mt-sm">
          Total Activos: {{ formatCurrency(balance.totales.total_activos) }}
        </div>
      </q-expansion-item>

      <!-- ===== PASIVOS ===== -->
      <q-expansion-item 
        icon="account_balance"
        label="Pasivos"
        expand-separator
      >
        <q-table
          :rows="balance.pasivos"
          :columns="columns"
          row-key="codigo"
          dense flat bordered
          :rows-per-page-options="[0]"
          hide-bottom
        />

        <div class="text-right text-bold q-mt-sm">
          Total Pasivos: {{ formatCurrency(balance.totales.total_pasivos) }}
        </div>
      </q-expansion-item>

      <!-- ===== PATRIMONIO ===== -->
      <q-expansion-item 
        icon="account_balance_wallet"
        label="Patrimonio"
        expand-separator
      >
        <q-table
          :rows="balance.patrimonio"
          :columns="columns"
          row-key="codigo"
          dense flat bordered
          :rows-per-page-options="[0]"
          hide-bottom
        />

        <div class="text-right text-bold q-mt-sm">
          Total Patrimonio: {{ formatCurrency(balance.totales.total_patrimonio) }}
        </div>
      </q-expansion-item>

      <!-- ===== TOTALES GENERALES ===== -->
      <div class="q-mt-xl text-right text-h6">
        <div><b>Total Activos:</b> {{ formatCurrency(balance.totales.total_activos) }}</div>
        <div><b>Total Pasivos + Patrimonio:</b> 
          {{ formatCurrency(balance.totales.total_pasivos + balance.totales.total_patrimonio) }}
        </div>
      </div>

    </div>
  </q-page>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const balance = ref({
  activos: [],
  pasivos: [],
  patrimonio: [],
  totales: {
    total_activos: 0,
    total_pasivos: 0,
    total_patrimonio: 0
  }
})

const formatCurrency = (value) => {
  if (!value) return '$0.00'
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}

const columns = [
  {
    name: 'codigo',
    label: 'Código',
    field: 'codigo',
    align: 'left',
    sortable: true,
    style: 'width: 90px'
  },
  {
    name: 'nombre',
    label: 'Cuenta',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'saldo',
    label: 'Saldo',
    field: 'saldo',
    align: 'right',
    sortable: true,
    format: (v) => formatCurrency(v)
  }
]

const cargarBalance = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/contabilidad/balance_general/')
    balance.value = response.data
  } catch (error) {
    console.error("Error al obtener el balance general:", error)
  }
}

onMounted(() => {
  cargarBalance()
})
</script>
