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
    const res = await axios.post('http://localhost:8000/api/contabilidad/asientos/generar-ajuste-iva/')
    if (res.data.mensaje) {
      Notify.create({ type: 'info', message: res.data.mensaje })
    }

    await obtenerAsientosContables()
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
    const res = await axios.post('http://localhost:8000/api/contabilidad/asientos/generar-cierre/')
    Notify.create({ type: 'positive', message: res.data.mensaje })
    await obtenerAsientosContables()
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error en el cierre contable.', error })
  } finally {
    loadingCierre.value = false
  }
}


async function obtenerAsientosContables () {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/contabilidad/asientos/obtener/'
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
    await axios.post('http://localhost:8000/api/contabilidad/balance_inicial/')
    Notify.create('Balance inicial generado correctamente')
  } catch (error) {
    console.error('Error generando balance inicial:', error)
    Notify.create('Error al generar el balance inicial')
  }
}

async function obtenerPartidasCierreAjuste () {
  try {
    const response = await axios.get(
      'http://localhost:8000/api/contabilidad/asientos/ajuste-cierre/'
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
  <q-page padding>
    <div class="q-pa-md">
      <q-btn
        color="secondary"
        icon="auto_fix_high"
        label="Generar Balance Inicial"
        @click="generarBalanceInicial"
      >
        <q-tooltip>Calcula la partida de apertura automáticamente</q-tooltip>
      </q-btn>
      <div class="q-pa-md">
        <h1>Libro Diario</h1>
      </div>

      <q-table
        flat
        bordered
        title="Libro Diario - Todas las partidas"
        :rows="rows"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="expand" :props="props">
              <q-btn
                size="sm"
                round
                dense
                :icon="isExpanded(props.row.id) ? 'remove' : 'add'"
                @click="toggleExpand(props.row.id)"
              />
            </q-td>
            <q-td key="id" :props="props">
              {{ props.row.id }}
            </q-td>
            <q-td key="fecha" :props="props">
              {{ props.row.fecha }}
            </q-td>
            <q-td key="descripcion" :props="props">
              {{ props.row.descripcion }}
            </q-td>
            <q-td key="tipo_partida" :props="props">
              {{ props.row.tipo_partida }}
            </q-td>
            <q-td key="total" :props="props" class="text-right">
              {{
                props.cols
                  .find(col => col.name === 'total')
                  .format(props.row.total, props.row)
              }}
            </q-td>
          </q-tr>

          <q-tr v-show="isExpanded(props.row.id)" :props="props">
            <q-td colspan="100%">
              <div class="q-pa-md">
                <div class="text-subtitle1">
                  Movimientos de la Partida: {{ props.row.id }}
                </div>
                <q-markup-table flat bordered dense class="q-mt-sm">
                  <thead>
                    <tr>
                      <th class="text-left">Codigo</th>
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
                    >
                      <td class="text-left">{{ mov.codigo }}</td>
                      <td class="text-left">{{ mov.cuenta }}</td>
                      <td class="text-left">{{ mov.concepto }}</td>
                      <td class="text-right">
                        ${{ mov.debe.toFixed(2) }}
                      </td>
                      <td class="text-right">
                        ${{ mov.haber.toFixed(2) }}
                      </td>
                    </tr>
                    <tr>
                      <td colspan="3" class="text-right">
                        <strong>TOTALES</strong>
                      </td>
                      <td class="text-right">
                        <strong>
                          ${{
                            props.row.movimientos
                              .reduce((acc, mov) => acc + mov.debe, 0)
                              .toFixed(2)
                          }}
                        </strong>
                      </td>
                      <td class="text-right">
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

      <!-- PARTIDAS DE AJUSTE Y CIERRE -->

      <div class="q-pa-md q-mt-xl">
        <h2>Partidas de Ajuste y Cierre</h2>
      </div>
      <div class="row q-gutter-sm q-mb-md">
        <q-btn
          color="orange"
          icon="build"
          label="Generar Ajuste IVA (Mensual)"
          @click="generarAjuste"
          :loading="loadingAjuste"
        />
        <q-btn
          color="negative"
          icon="lock"
          label="Realizar Cierre Contable (Anual)"
          @click="generarCierre"
          :loading="loadingCierre"
        />
      </div>


      <q-table
        flat
        bordered
        title="Partidas de Ajuste y Cierre"
        :rows="rowsCierreAjuste"
        :columns="columns"
        row-key="id"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="expand" :props="props">
              <q-btn
                size="sm"
                round
                dense
                :icon="isExpanded(props.row.id) ? 'remove' : 'add'"
                @click="toggleExpand(props.row.id)"
              />
            </q-td>
            <q-td key="id" :props="props">
              {{ props.row.id }}
            </q-td>
            <q-td key="fecha" :props="props">
              {{ props.row.fecha }}
            </q-td>
            <q-td key="descripcion" :props="props">
              {{ props.row.descripcion }}
            </q-td>
            <q-td key="tipo_partida" :props="props">
              {{ props.row.tipo_partida }}
            </q-td>
            <q-td key="total" :props="props" class="text-right">
              {{
                props.cols
                  .find(col => col.name === 'total')
                  .format(props.row.total, props.row)
              }}
            </q-td>
          </q-tr>

          <q-tr v-show="isExpanded(props.row.id)" :props="props">
            <q-td colspan="100%">
              <div class="q-pa-md">
                <div class="text-subtitle1">
                  Movimientos de la Partida: {{ props.row.id }}
                </div>
                <q-markup-table flat bordered dense class="q-mt-sm">
                  <thead>
                    <tr>
                      <th class="text-left">Codigo</th>
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
                    >
                      <td class="text-left">{{ mov.codigo }}</td>
                      <td class="text-left">{{ mov.cuenta }}</td>
                      <td class="text-left">{{ mov.concepto }}</td>
                      <td class="text-right">
                        ${{ mov.debe.toFixed(2) }}
                      </td>
                      <td class="text-right">
                        ${{ mov.haber.toFixed(2) }}
                      </td>
                    </tr>
                    <tr>
                      <td colspan="3" class="text-right">
                        <strong>TOTALES</strong>
                      </td>
                      <td class="text-right">
                        <strong>
                          ${{
                            props.row.movimientos
                              .reduce((acc, mov) => acc + mov.debe, 0)
                              .toFixed(2)
                          }}
                        </strong>
                      </td>
                      <td class="text-right">
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
    </div>
  </q-page>
</template>

<style scoped lang="sass">
</style>
