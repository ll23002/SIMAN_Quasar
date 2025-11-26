<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'


const formatCurrency = (value) => {
  if (!value) return '$0.00'
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
}


const asientos = ref([])
const loading = ref(false)

// Clasificados por cuenta
const cuentasIngresos = ref(new Map())
const cuentasCostos = ref(new Map())
const cuentasGastos = ref(new Map())

async function obtenerAsientosContables() {
  loading.value = true
  try {
    const response = await axios.get('http://167.172.219.5:8000/api/contabilidad/asientos/obtener/')
    // EXCLUIR partidas de tipo "Cierre" y "Ajuste"
    asientos.value = response.data.filter(
      asiento => asiento.tipo_partida !== 'Cierre' && asiento.tipo_partida !== 'Ajuste'
    )
    clasificarMovimientos()
  } catch (error) {
    console.error('Error obteniendo asientos:', error)
    asientos.value = []
  } finally {
    loading.value = false
  }
}

function clasificarMovimientos() {
  cuentasIngresos.value = new Map()
  cuentasCostos.value = new Map()
  cuentasGastos.value = new Map()

  for (const asiento of asientos.value) {
    for (const mov of asiento.movimientos) {
      const codigo = String(mov.codigo)

      // INGRESOS (4-XXX) - Naturaleza Acreedora
      if (codigo.startsWith('4')) {
        if (!cuentasIngresos.value.has(codigo)) {
          cuentasIngresos.value.set(codigo, {
            codigo: codigo,
            nombre: mov.cuenta,
            debe: 0,
            haber: 0
          })
        }
        const cuenta = cuentasIngresos.value.get(codigo)
        cuenta.debe += mov.debe
        cuenta.haber += mov.haber
      }

      // COSTOS (5-XXX) - Naturaleza Deudora
      else if (codigo.startsWith('5')) {
        if (!cuentasCostos.value.has(codigo)) {
          cuentasCostos.value.set(codigo, {
            codigo: codigo,
            nombre: mov.cuenta,
            debe: 0,
            haber: 0
          })
        }
        const cuenta = cuentasCostos.value.get(codigo)
        cuenta.debe += mov.debe
        cuenta.haber += mov.haber
      }

      // GASTOS (6-XXX) - Naturaleza Deudora
      else if (codigo.startsWith('6')) {
        if (!cuentasGastos.value.has(codigo)) {
          cuentasGastos.value.set(codigo, {
            codigo: codigo,
            nombre: mov.cuenta,
            debe: 0,
            haber: 0
          })
        }
        const cuenta = cuentasGastos.value.get(codigo)
        cuenta.debe += mov.debe
        cuenta.haber += mov.haber
      }
    }
  }
}


const ingresos = computed(() => {
  return Array.from(cuentasIngresos.value.values()).map(cuenta => ({
    ...cuenta,
    // Para ingresos (acreedoras): Haber - Debe
    valor: cuenta.haber - cuenta.debe
  }))
})

const costos = computed(() => {
  return Array.from(cuentasCostos.value.values()).map(cuenta => ({
    ...cuenta,
    // Para costos (deudoras): Debe - Haber
    valor: cuenta.debe - cuenta.haber
  }))
})

const gastos = computed(() => {
  return Array.from(cuentasGastos.value.values()).map(cuenta => ({
    ...cuenta,
    // Para gastos (deudoras): Debe - Haber
    valor: cuenta.debe - cuenta.haber
  }))
})

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

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Cuenta', field: 'nombre', align: 'left', sortable: true },
  { name: 'valor', label: 'Valor', align: 'right', field: 'valor', format: val => formatCurrency(val), sortable: true }
]

onMounted(() => {
  obtenerAsientosContables()
})
</script>

<template>
  <q-page class="q-pa-md bg-dark-page">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Estado de Pérdidas y Ganancias</div>
      <q-btn
        outline
        color="cyan-4"
        icon="refresh"
        label="Actualizar"
        @click="obtenerAsientosContables"
        :loading="loading"
        class="no-shadow"
      >
        <q-tooltip>Recargar datos del estado de resultados</q-tooltip>
      </q-btn>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Utilidad Bruta</div>
              <div class="text-h5 text-weight-bolder q-mt-sm" :class="utilidadBruta >= 0 ? 'text-green-4' : 'text-red-4'">
                {{ formatCurrency(utilidadBruta) }}
              </div>
              <div class="text-caption text-grey-5 q-mt-xs">Ingresos - Costos</div>
            </div>
            <div class="col-auto">
              <q-avatar
                :color="utilidadBruta >= 0 ? 'green-9' : 'red-9'"
                :text-color="utilidadBruta >= 0 ? 'green-2' : 'red-2'"
                :icon="utilidadBruta >= 0 ? 'trending_up' : 'trending_down'"
                size="md"
                font-size="24px"
                :style="`background: ${utilidadBruta >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'} !important`"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Utilidad Neta</div>
              <div class="text-h5 text-weight-bolder q-mt-sm" :class="utilidadNeta >= 0 ? 'text-cyan-4' : 'text-red-4'">
                {{ formatCurrency(utilidadNeta) }}
              </div>
              <div class="text-caption text-grey-5 q-mt-xs">Utilidad Bruta - Gastos</div>
            </div>
            <div class="col-auto">
              <q-avatar
                :color="utilidadNeta >= 0 ? 'cyan-9' : 'red-9'"
                :text-color="utilidadNeta >= 0 ? 'cyan-2' : 'red-2'"
                :icon="utilidadNeta >= 0 ? 'check_circle' : 'cancel'"
                size="md"
                font-size="24px"
                :style="`background: ${utilidadNeta >= 0 ? 'rgba(34, 211, 238, 0.15)' : 'rgba(239, 68, 68, 0.15)'} !important`"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-dark-card text-white no-shadow" bordered>
          <q-card-section class="row items-center">
            <div class="col">
              <div class="text-grey-5 text-caption text-uppercase">Margen Neto</div>
              <div class="text-h5 text-weight-bolder q-mt-sm text-purple-4">
                {{ totalIngresos > 0 ? ((utilidadNeta / totalIngresos) * 100).toFixed(2) : '0.00' }}%
              </div>
              <div class="text-caption text-grey-5 q-mt-xs">Utilidad / Ingresos</div>
            </div>
            <div class="col-auto">
              <q-avatar
                color="purple-9"
                text-color="purple-2"
                icon="percent"
                size="md"
                font-size="24px"
                style="background: rgba(168, 85, 247, 0.15) !important"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="q-mb-md">
      <q-card class="bg-dark-card text-white no-shadow" bordered>
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="attach_money" size="sm" class="q-mr-sm text-green-4" />
          <div class="text-h6">Ingresos</div>
        </q-card-section>

        <q-table
          flat
          :columns="columns"
          :rows="ingresos"
          row-key="codigo"
          class="bg-transparent text-grey-4 modern-table"
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
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
              <q-td key="codigo" :props="props">
                <span class="text-weight-bold text-cyan-4">{{ props.row.codigo }}</span>
              </q-td>
              <q-td key="nombre" :props="props">
                <span class="text-weight-medium">{{ props.row.nombre }}</span>
              </q-td>
              <q-td key="valor" :props="props" class="text-right">
                <span class="text-weight-bold text-green-4">
                  {{ formatCurrency(props.row.valor) }}
                </span>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:bottom-row>
            <q-tr class="bg-dark-card">
              <q-td colspan="2" class="text-right text-weight-bold text-white">
                Total Ingresos
              </q-td>
              <q-td class="text-right text-weight-bold text-green-4">
                {{ formatCurrency(totalIngresos) }}
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-5 q-gutter-sm q-pa-lg">
              <q-icon size="2em" name="info" />
              <span>No hay datos de ingresos</span>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <div class="q-mb-md">
      <q-card class="bg-dark-card text-white no-shadow" bordered>
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="shopping_cart" size="sm" class="q-mr-sm text-orange-4" />
          <div class="text-h6">Costos de Venta</div>
        </q-card-section>

        <q-table
          flat
          :columns="columns"
          :rows="costos"
          row-key="codigo"
          class="bg-transparent text-grey-4 modern-table"
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
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
              <q-td key="codigo" :props="props">
                <span class="text-weight-bold text-cyan-4">{{ props.row.codigo }}</span>
              </q-td>
              <q-td key="nombre" :props="props">
                <span class="text-weight-medium">{{ props.row.nombre }}</span>
              </q-td>
              <q-td key="valor" :props="props" class="text-right">
                <span class="text-weight-bold text-orange-4">
                  {{ formatCurrency(props.row.valor) }}
                </span>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:bottom-row>
            <q-tr class="bg-dark-card">
              <q-td colspan="2" class="text-right text-weight-bold text-white">
                Total Costos
              </q-td>
              <q-td class="text-right text-weight-bold text-orange-4">
                {{ formatCurrency(totalCostos) }}
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-5 q-gutter-sm q-pa-lg">
              <q-icon size="2em" name="info" />
              <span>No hay datos de costos</span>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>


    <div class="q-mb-md">
      <q-card class="bg-dark-card text-white no-shadow" bordered>
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Utilidad Bruta</div>
          <div class="text-h5 text-weight-bold" :class="utilidadBruta >= 0 ? 'text-green-4' : 'text-red-4'">
            {{ formatCurrency(utilidadBruta) }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="q-mb-md">
      <q-card class="bg-dark-card text-white no-shadow" bordered>
        <q-card-section class="row items-center q-pb-sm">
          <q-icon name="receipt" size="sm" class="q-mr-sm text-red-4" />
          <div class="text-h6">Gastos Operativos</div>
        </q-card-section>

        <q-table
          flat
          :columns="columns"
          :rows="gastos"
          row-key="codigo"
          class="bg-transparent text-grey-4 modern-table"
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
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
              <q-td key="codigo" :props="props">
                <span class="text-weight-bold text-cyan-4">{{ props.row.codigo }}</span>
              </q-td>
              <q-td key="nombre" :props="props">
                <span class="text-weight-medium">{{ props.row.nombre }}</span>
              </q-td>
              <q-td key="valor" :props="props" class="text-right">
                <span class="text-weight-bold text-red-4">
                  {{ formatCurrency(props.row.valor) }}
                </span>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:bottom-row>
            <q-tr class="bg-dark-card">
              <q-td colspan="2" class="text-right text-weight-bold text-white">
                Total Gastos
              </q-td>
              <q-td class="text-right text-weight-bold text-red-4">
                {{ formatCurrency(totalGastos) }}
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-5 q-gutter-sm q-pa-lg">
              <q-icon size="2em" name="info" />
              <span>No hay datos de gastos</span>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <div>
      <q-card class="bg-gradient-card text-white no-shadow" bordered>
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-overline text-grey-4">Resultado del Ejercicio</div>
            <div class="text-h5 text-weight-bold">Utilidad Neta</div>
          </div>
          <div class="text-h4 text-weight-bold" :class="utilidadNeta >= 0 ? 'text-cyan-4' : 'text-red-4'">
            {{ formatCurrency(utilidadNeta) }}
          </div>
        </q-card-section>
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

.bg-gradient-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(34, 211, 238, 0.3);
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
</style>
