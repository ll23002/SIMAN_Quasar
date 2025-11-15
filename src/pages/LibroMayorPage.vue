<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'


const columns = ref([
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Cuenta', field: 'nombre', align: 'left' },
  { name: 'naturaleza', label: 'Naturaleza', field: 'naturaleza', align: 'left' },
  { name: 'total_debe', label: 'Debe', field: row => row.total_debe, align: 'right', format: val => val == null ? '' : `$${Number(val).toLocaleString()}` },
  { name: 'total_haber', label: 'Haber', field: row => row.total_haber, align: 'right', format: val => val == null ? '' : `$${Number(val).toLocaleString()}` },
  { name: 'saldo', label: 'Saldo', field: row => row.saldo, align: 'right', format: val => val == null ? '' : `$${Number(val).toLocaleString()}` },
])

const rows = ref([])
async function obtenerDatosLibroMayor() {
  const response = await axios.get('http://localhost:8000/api/contabilidad/libro_mayor/')
  rows.value = response.data

  console.log(rows.value)
}

onMounted(() => {
  obtenerDatosLibroMayor()
})

</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-table
        :columns="columns"
        :rows="rows"
        row-key="codigo"
        title="Libro Mayor"
        flat
        bordered
        dense
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:top>
          <div class="text-h6">Libro Mayor</div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<style scoped lang="sass"></style>
