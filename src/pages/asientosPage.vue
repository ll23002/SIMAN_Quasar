<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { Notify } from 'quasar'

const columns = [
  {
    name: 'expand',
    label: '',
    align: 'center',
    field: 'expand'
  },
  {
    name: 'id',
    label: 'N° PARTIDA',
    align: 'left',
    field: 'id',
    sortable: true
  },
  {
    name: 'fecha',
    label: 'FECHA',
    align: 'left',
    field: 'fecha',
    sortable: true
  },
  {
    name: 'descripcion',
    label: 'DESCRIPCIÓN',
    align: 'left',
    field: 'descripcion',
    style: 'white-space: normal; min-width: 300px;'
  },
  {
    name: 'tipo_partida',
    label: 'TIPO',
    align: 'left',
    field: 'tipo_partida',
    sortable: true
  },
  {
    name: 'total',
    label: 'TOTAL',
    align: 'right',
    field: 'total',
    sortable: true,
    format: (val, row) => {
      const totalDebe = row.movimientos.reduce((acc, mov) => acc + mov.debe, 0)
      return `$${totalDebe.toFixed(2)}`
    }
  }
]

const rows = ref([])

const rowsCierreAjuste = ref([])

const expandedRows = ref({})

const loadingAjuste = ref(false)
const loadingCierre = ref(false)

const generarAjuste = async () => {
  loadingAjuste.value = true
  try {
    const res = await axios.post('http://178.128.79.42:8000/api/contabilidad/asientos/generar-ajuste-iva/')
    if (res.data.mensaje) {
      Notify.create({ type: 'info', message: res.data.mensaje })
    }

    await obtenerAsientosContables()
    await obtenerPartidasCierreAjuste()
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error generando ajuste.', error })
  } finally {
    loadingAjuste.value = false
  }
}

const generarCierre = async () => {
  if (!confirm("¿Estás seguro? Esto dejará en cero todas las cuentas de ingresos y gastos.")) return;

  loadingCierre.value = true
  try {
    const res = await axios.post('http://178.128.79.42:8000/api/contabilidad/asientos/generar-cierre/')
    Notify.create({ type: 'positive', message: res.data.mensaje })
    await obtenerAsientosContables()
    await obtenerPartidasCierreAjuste()
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error en el cierre contable.', error })
  } finally {
    loadingCierre.value = false
  }
}


async function obtenerAsientosContables () {
  try {
    const response = await axios.get(
      'http://178.128.79.42:8000/api/contabilidad/asientos/obtener/'
    )
    rows.value = response.data
  } catch (error) {
    console.error('Error obteniendo asientos:', error)
    rows.value = []
  }
}

async function generarBalanceInicial () {
  if (!rows.value || rows.value.length === 0) {
    Notify.create({ type: 'warning', message: 'Aún no han habido ventas' })
    return
  }
  try {
    await axios.post('http://178.128.79.42:8000/api/contabilidad/balance_inicial/')
    Notify.create('Balance inicial generado correctamente')
  } catch (error) {
    console.error('Error generando balance inicial:', error)
    Notify.create('Error al generar el balance inicial')
  }
}

async function obtenerPartidasCierreAjuste () {
  try {
    const response = await axios.get(
      'http://178.128.79.42:8000/api/contabilidad/asientos/ajuste-cierre/'
    )
    rowsCierreAjuste.value = response.data
  } catch (error) {
    console.error('Error obteniendo partidas de cierre y ajuste:', error)
    rowsCierreAjuste.value = []
  }
}

function toggleExpand (rowId) {
  expandedRows.value[rowId] = !expandedRows.value[rowId]
}

function isExpanded (rowId) {
  return expandedRows.value[rowId] === true
}

onMounted(() => {
  obtenerAsientosContables()
  obtenerPartidasCierreAjuste()
})
</script>

<template>
  <q-page class="q-pa-md bg-dark-page">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Libro Diario</div>
      <q-btn
        outline
        color="cyan-4"
        icon="auto_fix_high"
        label="Generar Balance Inicial"
        @click="generarBalanceInicial"
        class="no-shadow"
      >
        <q-tooltip>Calcula la partida de apertura automáticamente</q-tooltip>
      </q-btn>
    </div>

    <div class="q-mb-xl">
      <q-card class="bg-dark-card text-white no-shadow" bordered>
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-h6">Todas las Partidas</div>
        </q-card-section>

        <q-table
          flat
          :rows="rows"
          :columns="columns"
          row-key="id"
          class="bg-transparent text-grey-4 modern-table"
          :pagination="{ rowsPerPage: 10 }"
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
              <q-td key="expand" :props="props">
                <q-btn
                  size="sm"
                  round
                  dense
                  flat
                  color="cyan-4"
                  :icon="isExpanded(props.row.id) ? 'expand_less' : 'expand_more'"
                  @click="toggleExpand(props.row.id)"
                />
              </q-td>
              <q-td key="id" :props="props">
                <span class="text-weight-bold text-cyan-4">#{{ props.row.id }}</span>
              </q-td>
              <q-td key="fecha" :props="props">
                <q-icon name="event" size="xs" class="q-mr-xs text-grey-5" />
                {{ props.row.fecha }}
              </q-td>
              <q-td key="descripcion" :props="props" style="white-space: normal; min-width: 300px;">
                {{ props.row.descripcion }}
              </q-td>
              <q-td key="tipo_partida" :props="props">
                <q-chip
                  dense
                  :color="props.row.tipo_partida === 'Apertura' ? 'blue-9' :
                          props.row.tipo_partida === 'Cierre' ? 'red-9' :
                          props.row.tipo_partida === 'Ajuste' ? 'orange-9' : 'purple-9'"
                  :text-color="props.row.tipo_partida === 'Apertura' ? 'blue-2' :
                               props.row.tipo_partida === 'Cierre' ? 'red-2' :
                               props.row.tipo_partida === 'Ajuste' ? 'orange-2' : 'purple-2'"
                  class="text-weight-bold q-px-sm"
                >
                  {{ props.row.tipo_partida }}
                </q-chip>
              </q-td>
              <q-td key="total" :props="props" class="text-right">
                <span class="text-weight-bold text-cyan-3">
                  {{
                    props.cols
                      .find(col => col.name === 'total')
                      .format(props.row.total, props.row)
                  }}
                </span>
              </q-td>
            </q-tr>

            <q-tr v-show="isExpanded(props.row.id)" :props="props" class="bg-dark-page">
              <q-td colspan="100%">
                <div class="q-pa-md">
                  <div class="text-subtitle1 text-cyan-4 q-mb-md">
                    <q-icon name="receipt_long" class="q-mr-sm" />
                    Movimientos de la Partida #{{ props.row.id }}
                  </div>
                  <q-markup-table flat bordered dense class="detail-table">
                    <thead>
                      <tr class="bg-dark-card text-grey-5">
                        <th class="text-left">Código</th>
                        <th class="text-left">Cuenta</th>
                        <th class="text-left">Concepto</th>
                        <th class="text-right">Debe</th>
                        <th class="text-right">Haber</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="mov in props.row.movimientos"
                        :key="mov.codigo + mov.concepto"
                        class="text-grey-4"
                      >
                        <td class="text-left">
                          <span class="text-cyan-4 text-weight-bold">{{ mov.codigo }}</span>
                        </td>
                        <td class="text-left">{{ mov.cuenta }}</td>
                        <td class="text-left">{{ mov.concepto }}</td>
                        <td class="text-right text-green-4">
                          ${{ mov.debe.toFixed(2) }}
                        </td>
                        <td class="text-right text-orange-4">
                          ${{ mov.haber.toFixed(2) }}
                        </td>
                      </tr>
                      <tr class="bg-dark-card text-white">
                        <td colspan="3" class="text-right">
                          <strong>TOTALES</strong>
                        </td>
                        <td class="text-right text-green-4">
                          <strong>
                            ${{
                              props.row.movimientos
                                .reduce((acc, mov) => acc + mov.debe, 0)
                                .toFixed(2)
                            }}
                          </strong>
                        </td>
                        <td class="text-right text-orange-4">
                          <strong>
                            ${{
                              props.row.movimientos
                                .reduce((acc, mov) => acc + mov.haber, 0)
                                .toFixed(2)
                            }}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </div>

    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Partidas de Ajuste y Cierre</div>
      <div class="row q-gutter-sm">
        <q-btn
          outline
          color="orange-5"
          icon="build"
          label="Generar Ajuste IVA"
          @click="generarAjuste"
          :loading="loadingAjuste"
          class="no-shadow"
        >
          <q-tooltip>Genera la partida de ajuste IVA mensual</q-tooltip>
        </q-btn>
        <q-btn
          outline
          color="red-5"
          icon="lock"
          label="Cierre Contable"
          @click="generarCierre"
          :loading="loadingCierre"
          class="no-shadow"
        >
          <q-tooltip>Realiza el cierre contable anual</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div>
      <q-card class="bg-dark-card text-white no-shadow" bordered>
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-h6">Partidas Especiales</div>
        </q-card-section>

        <q-table
          flat
          :rows="rowsCierreAjuste"
          :columns="columns"
          row-key="id"
          class="bg-transparent text-grey-4 modern-table"
          :pagination="{ rowsPerPage: 10 }"
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
              <q-td key="expand" :props="props">
                <q-btn
                  size="sm"
                  round
                  dense
                  flat
                  color="cyan-4"
                  :icon="isExpanded(props.row.id) ? 'expand_less' : 'expand_more'"
                  @click="toggleExpand(props.row.id)"
                />
              </q-td>
              <q-td key="id" :props="props">
                <span class="text-weight-bold text-cyan-4">#{{ props.row.id }}</span>
              </q-td>
              <q-td key="fecha" :props="props">
                <q-icon name="event" size="xs" class="q-mr-xs text-grey-5" />
                {{ props.row.fecha }}
              </q-td>
              <q-td key="descripcion" :props="props" style="white-space: normal; min-width: 300px;">
                {{ props.row.descripcion }}
              </q-td>
              <q-td key="tipo_partida" :props="props">
                <q-chip
                  dense
                  :color="props.row.tipo_partida === 'Cierre' ? 'red-9' : 'orange-9'"
                  :text-color="props.row.tipo_partida === 'Cierre' ? 'red-2' : 'orange-2'"
                  class="text-weight-bold q-px-sm"
                >
                  {{ props.row.tipo_partida }}
                </q-chip>
              </q-td>
              <q-td key="total" :props="props" class="text-right">
                <span class="text-weight-bold text-cyan-3">
                  {{
                    props.cols
                      .find(col => col.name === 'total')
                      .format(props.row.total, props.row)
                  }}
                </span>
              </q-td>
            </q-tr>

            <q-tr v-show="isExpanded(props.row.id)" :props="props" class="bg-dark-page">
              <q-td colspan="100%">
                <div class="q-pa-md">
                  <div class="text-subtitle1 text-cyan-4 q-mb-md">
                    <q-icon name="receipt_long" class="q-mr-sm" />
                    Movimientos de la Partida #{{ props.row.id }}
                  </div>
                  <q-markup-table flat bordered dense class="detail-table">
                    <thead>
                      <tr class="bg-dark-card text-grey-5">
                        <th class="text-left">Código</th>
                        <th class="text-left">Cuenta</th>
                        <th class="text-left">Concepto</th>
                        <th class="text-right">Debe</th>
                        <th class="text-right">Haber</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="mov in props.row.movimientos"
                        :key="mov.codigo + mov.concepto"
                        class="text-grey-4"
                      >
                        <td class="text-left">
                          <span class="text-cyan-4 text-weight-bold">{{ mov.codigo }}</span>
                        </td>
                        <td class="text-left">{{ mov.cuenta }}</td>
                        <td class="text-left">{{ mov.concepto }}</td>
                        <td class="text-right text-green-4">
                          ${{ mov.debe.toFixed(2) }}
                        </td>
                        <td class="text-right text-orange-4">
                          ${{ mov.haber.toFixed(2) }}
                        </td>
                      </tr>
                      <tr class="bg-dark-card text-white">
                        <td colspan="3" class="text-right">
                          <strong>TOTALES</strong>
                        </td>
                        <td class="text-right text-green-4">
                          <strong>
                            ${{
                              props.row.movimientos
                                .reduce((acc, mov) => acc + mov.debe, 0)
                                .toFixed(2)
                            }}
                          </strong>
                        </td>
                        <td class="text-right text-orange-4">
                          <strong>
                            ${{
                              props.row.movimientos
                                .reduce((acc, mov) => acc + mov.haber, 0)
                                .toFixed(2)
                            }}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </div>
              </q-td>
            </q-tr>
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

.detail-table {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);

  thead tr {
    background-color: #1e293b;
  }

  tbody tr {
    background-color: rgba(11, 17, 32, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }
  }

  td, th {
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    padding: 12px;
  }
}

.q-chip {
  font-size: 0.7rem;
  padding: 4px 8px;
}
</style>
