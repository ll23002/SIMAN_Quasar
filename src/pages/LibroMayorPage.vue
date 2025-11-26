<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const columns = ref([
  { name: 'codigo', label: 'CÓDIGO', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'CUENTA', field: 'nombre', align: 'left', sortable: true },
  { name: 'naturaleza', label: 'NATURALEZA', field: 'naturaleza', align: 'left', sortable: true },
  { name: 'total_debe', label: 'DEBE', field: row => row.total_debe, align: 'right', format: val => val == null ? '$0.00' : `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sortable: true },
  { name: 'total_haber', label: 'HABER', field: row => row.total_haber, align: 'right', format: val => val == null ? '$0.00' : `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sortable: true },
  { name: 'saldo', label: 'SALDO', field: row => row.saldo, align: 'right', format: val => val == null ? '$0.00' : `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, sortable: true },
])

const rows = ref([])
const loading = ref(false)
const filter = ref('')

const totales = computed(() => {
  const total_debe = rows.value.reduce((acc, row) => acc + (row.total_debe || 0), 0)
  const total_haber = rows.value.reduce((acc, row) => acc + (row.total_haber || 0), 0)
  const total_saldo = rows.value.reduce((acc, row) => acc + (row.saldo || 0), 0)

  return { total_debe, total_haber, total_saldo }
})

async function obtenerDatosLibroMayor() {
  loading.value = true
  try {
    const response = await axios.get('http://167.172.219.5:8000/api/contabilidad/libro_mayor/')
    rows.value = response.data
  } catch (error) {
    console.error('Error obteniendo datos del libro mayor:', error)
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  obtenerDatosLibroMayor()
})
</script>

<template>
  <q-page class="q-pa-md bg-dark-page">
    <!-- Header con título y botón de actualizar -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Libro Mayor</div>
      <q-btn
        outline
        color="cyan-4"
        icon="refresh"
        label="Actualizar"
        @click="obtenerDatosLibroMayor"
        :loading="loading"
        class="no-shadow"
      >
        <q-tooltip>Recargar datos del libro mayor</q-tooltip>
      </q-btn>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Total Debe</div>
              <div class="text-h5 text-weight-bolder q-mt-sm text-green-4">
                ${{ totales.total_debe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
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

      <div class="col-12 col-md-4">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Total Haber</div>
              <div class="text-h5 text-weight-bolder q-mt-sm text-orange-4">
                ${{ totales.total_haber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
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

      <div class="col-12 col-md-4">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Saldo Total</div>
              <div class="text-h5 text-weight-bolder q-mt-sm text-cyan-4">
                ${{ totales.total_saldo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                color="cyan-9"
                text-color="cyan-2"
                icon="account_balance"
                size="md"
                font-size="24px"
                style="background: rgba(34, 211, 238, 0.15) !important"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla principal -->
    <div>
      <q-card class="bg-dark-card text-white no-shadow" bordered>
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-h6">Detalle de Cuentas</div>
          <q-space />
          <q-input
            v-model="filter"
            dark
            dense
            outlined
            placeholder="Buscar cuenta..."
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
          row-key="codigo"
          class="bg-transparent text-grey-4 modern-table"
          :pagination="{ rowsPerPage: 15 }"
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
              <q-td key="codigo" :props="props">
                <span class="text-weight-bold text-cyan-4">{{ props.row.codigo }}</span>
              </q-td>
              <q-td key="nombre" :props="props">
                <span class="text-weight-medium">{{ props.row.nombre }}</span>
              </q-td>
              <q-td key="naturaleza" :props="props">
                <q-chip
                  dense
                  :color="props.row.naturaleza === 'Deudora' ? 'blue-9' : 'purple-9'"
                  :text-color="props.row.naturaleza === 'Deudora' ? 'blue-2' : 'purple-2'"
                  class="text-weight-bold q-px-sm"
                >
                  {{ props.row.naturaleza }}
                </q-chip>
              </q-td>
              <q-td key="total_debe" :props="props" class="text-right">
                <span class="text-weight-bold text-green-4">
                  {{ props.cols.find(col => col.name === 'total_debe').format(props.row.total_debe) }}
                </span>
              </q-td>
              <q-td key="total_haber" :props="props" class="text-right">
                <span class="text-weight-bold text-orange-4">
                  {{ props.cols.find(col => col.name === 'total_haber').format(props.row.total_haber) }}
                </span>
              </q-td>
              <q-td key="saldo" :props="props" class="text-right">
                <span class="text-weight-bold text-cyan-3">
                  {{ props.cols.find(col => col.name === 'saldo').format(props.row.saldo) }}
                </span>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="cyan-4" />
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-5 q-gutter-sm q-pa-lg">
              <q-icon size="2em" name="info" />
              <span>No hay datos disponibles en el libro mayor</span>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>
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
  max-width: 300px;

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

.q-chip {
  font-size: 0.7rem;
  padding: 4px 8px;
}
</style>
