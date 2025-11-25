<script setup>
// ============================================================
// IMPORTS
// ============================================================
import { ref, onMounted, computed } from "vue"
import axios from "axios"

// ============================================================
// DATOS REALES DEL BACKEND
// ============================================================
const cuentas = ref([])   // aquí guardamos TODAS las cuentas reales


// ============================================================
// CARGAR DATOS DESDE EL BACKEND
// Reutilizamos el endpoint de tu compañero (libro mayor)
// ============================================================
async function cargarCuentas() {
  try {
    const res = await axios.get("http://localhost:8000/api/contabilidad/libro_mayor/")
    cuentas.value = res.data
  } catch (error) {
    console.error("Error cargando datos del balance general:", error)
  }
}

onMounted(() => {
  cargarCuentas()
})


// ============================================================
// FUNCIÓN UTILITARIA (reutilizada del código de tu compa)
// ============================================================
function formatCurrency(value) {
  if (!value) return "$0.00"
  const numValue = Number(value)
  return numValue.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}


// ============================================================
// AGRUPAR AUTOMÁTICAMENTE SEGÚN EL CÓDIGO
// ============================================================

// -> Activo Corriente: 1100-1199
const activosCorriente = computed(() =>
  cuentas.value.filter(c =>
    Number(c.codigo) >= 1100 && Number(c.codigo) < 1200
  )
)

// -> Activo No Corriente: 1200+
const activosNoCorriente = computed(() =>
  cuentas.value.filter(c =>
    Number(c.codigo) >= 1200 && Number(c.codigo) < 2000
  )
)

// -> Pasivo Corriente: 2100-2199
const pasivosCorriente = computed(() =>
  cuentas.value.filter(c =>
    Number(c.codigo) >= 2100 && Number(c.codigo) < 2200
  )
)

// -> Pasivo No Corriente: 2200-2999
const pasivosNoCorriente = computed(() =>
  cuentas.value.filter(c =>
    Number(c.codigo) >= 2200 && Number(c.codigo) < 3000
  )
)

// -> Patrimonio: 3100+
const patrimonio = computed(() =>
  cuentas.value.filter(c =>
    Number(c.codigo) >= 3100 && Number(c.codigo) < 4000
  )
)


// ============================================================
// CALCULAR TOTALES
// ============================================================
function total(lista) {
  return lista.reduce((acc, item) => acc + Number(item.saldo), 0)
}

const totalActivos = computed(() =>
  total(activosCorriente.value) + total(activosNoCorriente.value)
)

const totalPasivos = computed(() =>
  total(pasivosCorriente.value) + total(pasivosNoCorriente.value)
)

const totalPatrimonio = computed(() =>
  total(patrimonio.value)
)

</script>

<template>
  <q-page padding>
    <h1>Balance General</h1>
    <p class="text-grey-7">Datos reales desde el backend (Primera prueba)</p>


    <!-- ============================================================
         SECCIÓN ACTIVOS
    ============================================================ -->
    <q-expansion-item icon="account_balance" label="Activos" expand-separator default-opened>

      <!-- Activo corriente -->
      <q-expansion-item icon="folder" label="Activos Corrientes" dense>
        <q-markup-table flat bordered>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cuenta</th>
              <th class="text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in activosCorriente" :key="c.codigo">
              <td>{{ c.codigo }}</td>
              <td>{{ c.nombre }}</td>
              <td class="text-right">{{ formatCurrency(c.saldo) }}</td>
            </tr>
            <tr>
              <td colspan="2" class="text-right"><b>Total Activos Corrientes</b></td>
              <td class="text-right"><b>{{ formatCurrency(total(activosCorriente)) }}</b></td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-expansion-item>

      <!-- Activo no corriente -->
      <q-expansion-item icon="folder_open" label="Activos No Corrientes" dense>
        <q-markup-table flat bordered>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cuenta</th>
              <th class="text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in activosNoCorriente" :key="c.codigo">
              <td>{{ c.codigo }}</td>
              <td>{{ c.nombre }}</td>
              <td class="text-right">{{ formatCurrency(c.saldo) }}</td>
            </tr>
            <tr>
              <td colspan="2" class="text-right"><b>Total Activos No Corrientes</b></td>
              <td class="text-right"><b>{{ formatCurrency(total(activosNoCorriente)) }}</b></td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-expansion-item>

      <div class="q-pa-sm text-right text-primary text-bold">
        TOTAL ACTIVOS: {{ formatCurrency(totalActivos) }}
      </div>
    </q-expansion-item>


    <!-- ============================================================
         SECCIÓN PASIVOS
    ============================================================ -->
    <q-expansion-item icon="money_off" label="Pasivos" expand-separator class="q-mt-md">

      <!-- Pasivo corriente -->
      <q-expansion-item icon="folder" label="Pasivos Corrientes" dense>
        <q-markup-table flat bordered>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cuenta</th>
              <th class="text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in pasivosCorriente" :key="c.codigo">
              <td>{{ c.codigo }}</td>
              <td>{{ c.nombre }}</td>
              <td class="text-right">{{ formatCurrency(c.saldo) }}</td>
            </tr>
            <tr>
              <td colspan="2" class="text-right"><b>Total Pasivos Corrientes</b></td>
              <td class="text-right"><b>{{ formatCurrency(total(pasivosCorriente)) }}</b></td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-expansion-item>

      <!-- Pasivo no corriente -->
      <q-expansion-item icon="folder_open" label="Pasivos No Corrientes" dense>
        <q-markup-table flat bordered>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cuenta</th>
              <th class="text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in pasivosNoCorriente" :key="c.codigo">
              <td>{{ c.codigo }}</td>
              <td>{{ c.nombre }}</td>
              <td class="text-right">{{ formatCurrency(c.saldo) }}</td>
            </tr>
            <tr>
              <td colspan="2" class="text-right"><b>Total Pasivos No Corrientes</b></td>
              <td class="text-right"><b>{{ formatCurrency(total(pasivosNoCorriente)) }}</b></td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-expansion-item>

      <div class="q-pa-sm text-right text-primary text-bold">
        TOTAL PASIVOS: {{ formatCurrency(totalPasivos) }}
      </div>
    </q-expansion-item>


    <!-- ============================================================
         SECCIÓN PATRIMONIO
    ============================================================ -->
    <q-expansion-item icon="account_circle" label="Patrimonio" expand-separator class="q-mt-md">
      <q-markup-table flat bordered>
        <thead>
          <tr>
            <th>Código</th>
            <th>Cuenta</th>
            <th class="text-right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in patrimonio" :key="c.codigo">
            <td>{{ c.codigo }}</td>
            <td>{{ c.nombre }}</td>
            <td class="text-right">{{ formatCurrency(c.saldo) }}</td>
          </tr>
          <tr>
            <td colspan="2" class="text-right"><b>Total Patrimonio</b></td>
            <td class="text-right"><b>{{ formatCurrency(totalPatrimonio) }}</b></td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-expansion-item>


    <!-- ============================================================
         VALIDACIÓN: ACTIVO = PASIVO + PATRIMONIO
    ============================================================ -->
    <div class="q-pa-lg text-h6 text-center text-bold">
      TOTAL ACTIVOS: {{ formatCurrency(totalActivos) }}<br />
      TOTAL PASIVO + PATRIMONIO:
      {{ formatCurrency(totalPasivos + totalPatrimonio) }}
    </div>

  </q-page>
</template>
