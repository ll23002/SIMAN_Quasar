<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-table
        title="Balanza de Comprobación"
        :rows="rows"
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
            <q-td class="text-uppercase">
              Sumas Iguales
            </q-td>

            <q-td align="right">
              {{ formatCurrency(totals.totalMovDebe) }}
            </q-td>

            <q-td align="right">
              {{ formatCurrency(totals.totalMovHaber) }}
            </q-td>

            <q-td align="right">
              {{ formatCurrency(totals.totalSaldoDebe) }}
            </q-td>

            <q-td align="right">
              {{ formatCurrency(totals.totalSaldoHaber) }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const rows = ref([])

const formatCurrency = (value) => {
  if (!value) return '$0.00'
  const numValue = Number(value)
  return numValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

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
    name: 'mov_debe',
    label: 'Movimientos - Debe',
    field: 'total_debe',
    align: 'right',
    sortable: true,
    format: (val) => formatCurrency(val)
  },
  {
    name: 'mov_haber',
    label: 'Movimientos - Haber',
    field: 'total_haber',
    align: 'right',
    sortable: true,
    format: (val) => formatCurrency(val)
  },
  {
    name: 'saldo_debe',
    label: 'Saldo - Debe',
    align: 'right',
    sortable: true,
    field: (row) => (row.naturaleza === 'D' ? row.saldo : 0),
    format: (val) => formatCurrency(val)
  },
  {
    name: 'saldo_haber',
    label: 'Saldo - Haber',
    align: 'right',
    sortable: true,
    field: (row) => (row.naturaleza === 'C' ? row.saldo : 0),
    format: (val) => formatCurrency(val)
  },
]

const totals = computed(() => {
  const result = {
    totalMovDebe: 0,
    totalMovHaber: 0,
    totalSaldoDebe: 0,
    totalSaldoHaber: 0,
  }

  for (const row of rows.value) {
    const movDebe = Number(row.total_debe)
    const movHaber = Number(row.total_haber)
    const saldo = Number(row.saldo)

    result.totalMovDebe += movDebe
    result.totalMovHaber += movHaber

    if (row.naturaleza === 'D') {
      result.totalSaldoDebe += saldo
    } else {
      result.totalSaldoHaber += saldo
    }
  }

  return result
})

const Balanza = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/contabilidad/libro_mayor/')
    rows.value = response.data
  } catch (error) {
    console.error('Error al cargar la balanza de comprobación:', error)
  }
}

onMounted(() => {
  Balanza()
})
</script>
