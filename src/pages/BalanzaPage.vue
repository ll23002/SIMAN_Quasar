<template>
  <q-page class="q-pa-md bg-dark-page">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Balanza de Comprobación</div>
      <q-btn
        outline
        color="cyan-4"
        icon="refresh"
        label="Actualizar"
        @click="Balanza"
        :loading="loading"
        class="no-shadow"
      >
        <q-tooltip>Recargar balanza de comprobación</q-tooltip>
      </q-btn>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Movimientos Debe</div>
              <div class="text-h6 text-weight-bolder q-mt-sm text-green-4">
                {{ formatCurrency(totals.totalMovDebe) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                color="green-9"
                text-color="green-2"
                icon="add_circle"
                size="md"
                font-size="24px"
                style="background: rgba(16, 185, 129, 0.15) !important"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Movimientos Haber</div>
              <div class="text-h6 text-weight-bolder q-mt-sm text-orange-4">
                {{ formatCurrency(totals.totalMovHaber) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                color="orange-9"
                text-color="orange-2"
                icon="remove_circle"
                size="md"
                font-size="24px"
                style="background: rgba(245, 158, 11, 0.15) !important"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Saldo Debe</div>
              <div class="text-h6 text-weight-bolder q-mt-sm text-blue-4">
                {{ formatCurrency(totals.totalSaldoDebe) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                color="blue-9"
                text-color="blue-2"
                icon="trending_up"
                size="md"
                font-size="24px"
                style="background: rgba(59, 130, 246, 0.15) !important"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Saldo Haber</div>
              <div class="text-h6 text-weight-bolder q-mt-sm text-purple-4">
                {{ formatCurrency(totals.totalSaldoHaber) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                color="purple-9"
                text-color="purple-2"
                icon="trending_down"
                size="md"
                font-size="24px"
                style="background: rgba(168, 85, 247, 0.15) !important"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div>
      <q-card class="bg-dark-card text-white no-shadow" bordered>
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-h6">Detalle de Cuentas</div>
          <q-space />
          <q-chip
            outline
            color="cyan-4"
            text-color="cyan-2"
            icon="check_circle"
            class="text-weight-bold"
          >
            Balanza Cuadrada
          </q-chip>
        </q-card-section>

        <q-table
          :rows="rows"
          :columns="columns"
          row-key="codigo"
          flat
          class="bg-transparent text-grey-4 modern-table"
          :rows-per-page-options="[0]"
          hide-bottom
          :loading="loading"
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
              <q-td key="nombre" :props="props" class="text-left" style="min-width: 300px;">
                <span class="text-weight-medium">{{ props.row.nombre }}</span>
              </q-td>
              <q-td key="mov_debe" :props="props" class="text-right">
                <span class="text-weight-bold text-green-4">
                  {{ props.cols.find(col => col.name === 'mov_debe').format(props.row.total_debe) }}
                </span>
              </q-td>
              <q-td key="mov_haber" :props="props" class="text-right">
                <span class="text-weight-bold text-orange-4">
                  {{ props.cols.find(col => col.name === 'mov_haber').format(props.row.total_haber) }}
                </span>
              </q-td>
              <q-td key="saldo_debe" :props="props" class="text-right">
                <span class="text-weight-bold text-blue-4">
                  {{ props.cols.find(col => col.name === 'saldo_debe').format(props.cols.find(col => col.name === 'saldo_debe').field(props.row)) }}
                </span>
              </q-td>
              <q-td key="saldo_haber" :props="props" class="text-right">
                <span class="text-weight-bold text-purple-4">
                  {{ props.cols.find(col => col.name === 'saldo_haber').format(props.cols.find(col => col.name === 'saldo_haber').field(props.row)) }}
                </span>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:bottom-row>
            <q-tr class="bg-cyan-9 text-white totals-row">
              <q-td class="text-uppercase text-weight-bold text-left">
                <q-icon name="functions" class="q-mr-sm" />
                Sumas Iguales
              </q-td>
              <q-td align="right" class="text-weight-bold">
                {{ formatCurrency(totals.totalMovDebe) }}
              </q-td>
              <q-td align="right" class="text-weight-bold">
                {{ formatCurrency(totals.totalMovHaber) }}
              </q-td>
              <q-td align="right" class="text-weight-bold">
                {{ formatCurrency(totals.totalSaldoDebe) }}
              </q-td>
              <q-td align="right" class="text-weight-bold">
                {{ formatCurrency(totals.totalSaldoHaber) }}
              </q-td>
            </q-tr>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="cyan-4" />
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-5 q-gutter-sm q-pa-lg">
              <q-icon size="2em" name="info" />
              <span>No hay datos disponibles en la balanza</span>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const rows = ref([])
const loading = ref(false)

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
    label: 'CUENTA',
    field: 'nombre',
    align: 'left',
    sortable: true,
    style: 'width: 350px'
  },
  {
    name: 'mov_debe',
    label: 'MOVIMIENTOS - DEBE',
    field: 'total_debe',
    align: 'right',
    sortable: true,
    format: (val) => formatCurrency(val)
  },
  {
    name: 'mov_haber',
    label: 'MOVIMIENTOS - HABER',
    field: 'total_haber',
    align: 'right',
    sortable: true,
    format: (val) => formatCurrency(val)
  },
  {
    name: 'saldo_debe',
    label: 'SALDO - DEBE',
    align: 'right',
    sortable: true,
    field: (row) => (row.naturaleza === 'D' ? row.saldo : 0),
    format: (val) => formatCurrency(val)
  },
  {
    name: 'saldo_haber',
    label: 'SALDO - HABER',
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
  loading.value = true
  try {
    const response = await axios.get('http://167.172.219.5:8000/api/contabilidad/libro_mayor/')
    rows.value = response.data
  } catch (error) {
    console.error('Error al cargar la balanza de comprobación:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  Balanza()
})
</script>

<style scoped lang="scss">
.bg-dark-page {
  background-color: #0b1120;
}

.bg-dark-card {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
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

.totals-row {
  background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%) !important;
  font-size: 1rem;

  td {
    padding: 16px 12px !important;
    border-top: 2px solid rgba(6, 182, 212, 0.5) !important;
  }
}
</style>
