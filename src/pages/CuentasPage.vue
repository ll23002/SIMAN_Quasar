<template>
  <q-page padding>
    <div class="q-pa-md row q-gutter-md border-rounded shadow-2">
      <div class="col-12 col-md-5">
        <q-input
          type="text"
          v-model="Nombre"
          placeholder="Nombre"
          class="full-width q-mb-md"
          outlined
        />
        <q-input
          type="text"
          v-model="Codigo"
          placeholder="Codigo"
          class="full-width q-mb-md"
          outlined
        />
        <q-select
          v-model="Tipo"
          :options="['ACTIVO', 'PASIVO', 'INGRESO', 'PATRIMONIO', 'COSTO']"
          placeholder="Tipo"
          class="full-width q-mb-md"
          outlined
        />
        <q-select
          v-model="Naturaleza"
          :options="['DEUDORA', 'ACREEDORA']"
          placeholder="Naturaleza"
          class="full-width q-mb-md"
          outlined
        />
      </div>
      <q-space />
      <div class="col-12 col-md-6">
        <q-select
          v-model="Movimientos"
          :options="['SI', 'NO']"
          placeholder="Movimientos"
          class="full-width q-mb-md"
          outlined
        />
        <q-select
          v-model="CuentaPadre"
          placeholder="CuentaPadre"
          :options="Data"
          option-label="nombre"
          class="full-width q-mb-md"
          outlined
        />
        <q-input
          type="textarea"
          v-model="Descripcion"
          placeholder="Descripcion"
          class="full-width q-mb-md"
          outlined
        />
      </div>
    </div>
    <div class="q-pt-lg">
      <q-btn label="Enviar datos" @click="enviarDatos" color="primary" />
    </div>

  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'

const Data = ref([])
const Nombre = ref()
const Codigo = ref()
const Tipo = ref('ACTIVO')
const Naturaleza = ref('DEUDORA')
const Movimientos = ref('SI')
const Descripcion = ref()

const sinCuentaPadre = { id: null, nombre: 'SIN CUENTA PADRE', codigo: '' }
const CuentaPadre = ref(sinCuentaPadre)
const codigoPrefijo = ref('')

watch(CuentaPadre, (newVal) => {
  if (newVal && newVal.codigo) {
    codigoPrefijo.value = newVal.codigo
    Codigo.value = newVal.codigo
  } else {
    codigoPrefijo.value = ''
    Codigo.value = ''
  }
})

watch(Codigo, (newValue, oldValue) => {
  const prefijo = codigoPrefijo.value
  const val = newValue || ''

  if (prefijo === '') {
    if (!/^\d*$/.test(val)) {
      Codigo.value = oldValue
      return
    }

    if (val.length > 2) {
      Codigo.value = oldValue
      return
    }

    const codeExists = Data.value.some(
      (cuenta) => cuenta.codigo === val && cuenta.codigo !== '',
    )

    if (codeExists) {
      console.warn(`El código "${val}" ya existe.`)
      Codigo.value = ''
      return
    }
  }
  else {
    if (!val.startsWith(prefijo)) {
      Codigo.value = prefijo
      return
    }

    const suffijo = val.substring(prefijo.length)


    if (!/^\d*$/.test(suffijo)) {
      Codigo.value = oldValue
      return
    }

    if (suffijo.length > 2) {
      Codigo.value = oldValue
      return
    }

    if (suffijo.length > 0) {
      const fullCode = prefijo + suffijo
      const codeExists = Data.value.some((cuenta) => cuenta.codigo === fullCode)
      if (codeExists) {
        console.warn(`El código "${fullCode}" ya existe.`)
        Codigo.value = oldValue
        return
      }
    }
  }
})





const enviarDatos = async () => {
  try {
    const cuentas =[{
      nombre: Nombre.value,
      codigo: Codigo.value,
      tipo_cuenta: Tipo.value,
      naturaleza: Naturaleza.value === 'DEUDORA' ? 'D' : 'C',
      descripcion: Descripcion.value,
      permite_movimientos: Movimientos.value === 'SI',
      cuenta_padre_codigo: CuentaPadre.value.codigo },
    ]


    const response = await axios.post(
      'http://localhost:8000/api/contabilidad/cuentas/crear/',
      cuentas,
    )

    console.log('¡Cuentas agregadas con éxito!', response.data)
    alert('¡Éxito! Revisa la BD y la consola.')
  } catch (error) {
    console.error('Error al agregar cuentas:', error.response.data)
    alert('Error. Revisa la consola para ver los detalles.')
  }
}

const obtenerCuentasPadre = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/contabilidad/obtener/cuentas_padre/')
    const mappedData = response.data.map(item => {
      const c = item.cuenta ?? item
      return {
        id: c.id,
        nombre: c.nombre,
        codigo: c.codigo
      }
    })
    Data.value = [sinCuentaPadre, ...mappedData]
  } catch (error) {
    console.error('Error obteniendo cuentas padre:', error)
    Data.value = [sinCuentaPadre]
  }
}


onMounted(() => {
  obtenerCuentasPadre()
})
</script>

<style lang="sass">
.my-sticky-header-column-table
  /* height or max-height is important */
  height: 600px

  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  max-width: 1000px

  td:first-child
    /* bg color is important for td; just specify one */
    background-color: #00b4ff

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #00b4ff

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px

.desc-cell
  max-width: 300px
  white-space: normal
  overflow-wrap: anywhere
  word-break: break-word
</style>
