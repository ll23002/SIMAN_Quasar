<template>
  <q-page padding>
    <h1 class="text-h5 q-mb-md">Balance General</h1>
    <q-btn 
      label="Exportar PDF" 
      color="primary" 
      icon="picture_as_pdf" 
      class="q-mb-md"
      @click="exportPDF" 
    />

    <p class="text-grey-7">Basado en datos reales del libro mayor (el que lea esto es gay)</p>

    <!-- ============================
         ACTIVOS
    ============================ -->
    <q-expansion-item 
      label="Activos" 
      icon="account_balance" 
      expand-separator
      default-opened
    >

      <!-- Activos Corrientes -->
      <q-expansion-item label="Activos Corrientes" icon="folder" dense>
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
              <td class="text-right">{{ formatCurrency(getSaldo(c)) }}</td>
            </tr>
            <tr>
              <td colspan="2" class="text-right"><b>Total Activos Corrientes</b></td>
              <td class="text-right"><b>{{ formatCurrency(total(activosCorriente)) }}</b></td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-expansion-item>

      <!-- Activos No Corrientes -->
      <q-expansion-item label="Activos No Corrientes" icon="folder_open" dense>
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
              <td class="text-right">{{ formatCurrency(getSaldo(c)) }}</td>
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

    <!-- ============================
         PASIVOS
    ============================ -->
    <q-expansion-item label="Pasivos" icon="money_off" expand-separator class="q-mt-md">

      <q-expansion-item label="Pasivos Corrientes" icon="folder" dense>
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
              <td class="text-right">{{ formatCurrency(getSaldo(c)) }}</td>
            </tr>
            <tr>
              <td colspan="2" class="text-right"><b>Total Pasivos Corrientes</b></td>
              <td class="text-right"><b>{{ formatCurrency(total(pasivosCorriente)) }}</b></td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-expansion-item>

      <q-expansion-item label="Pasivos No Corrientes" icon="folder_open" dense>
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
              <td class="text-right">{{ formatCurrency(getSaldo(c)) }}</td>
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


    <!-- ============================
         PATRIMONIO
    ============================ -->
    <q-expansion-item label="Patrimonio" icon="account_circle" expand-separator class="q-mt-md">
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
            <td class="text-right">{{ formatCurrency(getSaldo(c)) }}</td>
          </tr>
          <tr>
            <td colspan="2" class="text-right"><b>Total Patrimonio</b></td>
            <td class="text-right"><b>{{ formatCurrency(totalPatrimonio) }}</b></td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-expansion-item>


    <!-- ============================
         VALIDACIÓN DEL BALANCE
    ============================ -->
    <div class="q-pa-lg text-h6 text-center text-bold">
      TOTAL ACTIVOS: {{ formatCurrency(totalActivos) }}<br>
      TOTAL PASIVO + PATRIMONIO: {{ formatCurrency(totalPasivos + totalPatrimonio) }}
    </div>
  </q-page>
</template>



<script setup>
// ========================================================
// IMPORTS
// ========================================================
import { ref, onMounted, computed } from "vue"
import axios from "axios"
// ========================================================
// EXPORTAR A PDF
// ========================================================
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function exportPDF() {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text("Balance General", 14, 15)

  const secciones = [
    { titulo: "Activos Corrientes", data: activosCorriente.value },
    { titulo: "Activos No Corrientes", data: activosNoCorriente.value },
    { titulo: "Pasivos Corrientes", data: pasivosCorriente.value },
    { titulo: "Pasivos No Corrientes", data: pasivosNoCorriente.value },
    { titulo: "Patrimonio", data: patrimonio.value }
  ]

  let y = 25

  secciones.forEach(sec => {
    doc.setFontSize(13)
    doc.text(sec.titulo, 14, y)
    y += 3

    autoTable(doc, {
      startY: y,
      head: [["Código", "Cuenta", "Saldo"]],
      body: sec.data.map(c => [
        c.codigo,
        c.nombre,
        formatCurrency(getSaldo(c))
      ]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [33, 150, 243] }
    })

    y = doc.lastAutoTable.finalY + 10
  })

  // Totales finales
  doc.setFontSize(14)
  doc.text(`Total Activos: ${formatCurrency(totalActivos.value)}`, 14, y)
  y += 7
  doc.text(
    `Total Pasivos + Patrimonio: ${formatCurrency(totalPasivos.value + totalPatrimonio.value)}`,
    14,
    y
  )

  doc.save("Balance_General.pdf")
}


// ========================================================
// DATA
// ========================================================
const cuentas = ref([])


// ========================================================
// API CALL — MISMO ENDPOINT QUE LA BALANZA
// ========================================================
async function cargarCuentas() {
  try {
    const res = await axios.get("http://localhost:8000/api/contabilidad/libro_mayor/")
    cuentas.value = res.data
  } catch (e) {
    console.error("Error cargando datos:", e)
  }
}

onMounted(() => cargarCuentas())


// ========================================================
// UTILIDADES
// ========================================================
function formatCurrency(value) {
  if (!value) return "$0.00"
  const num = Number(value)
  return num.toLocaleString("en-US", { style: "currency", currency: "USD" })
}

/*  
   Usa naturaleza igual que en la balanza:
   - D → saldo va al DEBE (positivo para activos/gastos)
   - C → saldo va al HABER (positivo para pasivos/patrimonio)
*/
function getSaldo(cuenta) {
  return Number(cuenta.saldo)
}


// ========================================================
// CLASIFICACIÓN AUTOMÁTICA POR CÓDIGO
// ========================================================
const activosCorriente = computed(() =>
  cuentas.value.filter(c => c.codigo >= 1100 && c.codigo < 1200)
)

const activosNoCorriente = computed(() =>
  cuentas.value.filter(c => c.codigo >= 1200 && c.codigo < 2000)
)

const pasivosCorriente = computed(() =>
  cuentas.value.filter(c => c.codigo >= 2100 && c.codigo < 2200)
)

const pasivosNoCorriente = computed(() =>
  cuentas.value.filter(c => c.codigo >= 2200 && c.codigo < 3000)
)

const patrimonio = computed(() =>
  cuentas.value.filter(c => c.codigo >= 3100 && c.codigo < 4000)
)


// ========================================================
// TOTALIZADORES
// ========================================================
function total(lista) {
  return lista.reduce((s, c) => s + getSaldo(c), 0)
}

const totalActivos = computed(() => total(activosCorriente.value) + total(activosNoCorriente.value))
const totalPasivos = computed(() => total(pasivosCorriente.value) + total(pasivosNoCorriente.value))
const totalPatrimonio = computed(() => total(patrimonio.value))
</script>
