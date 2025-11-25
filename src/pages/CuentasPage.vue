<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card class="shadow-10 border-rounded q-pa-md">
          <q-card-section>
            <div class="text-h5 text-primary text-weight-bold">Crear Nueva Cuenta</div>
            <div class="text-caption text-grey">Agrega una nueva rama al árbol contable</div>
          </q-card-section>

          <q-separator class="q-mb-md" />

          <div class="row q-col-gutter-md">

            <div class="col-12 col-md-6">

              <div class="q-mb-md">
                <q-input
                  outlined
                  v-model="parentNameDisplay"
                  readonly
                  label="Cuenta Padre"
                  placeholder="Seleccione una cuenta padre..."
                  @click="showTreeDialog = true"
                  class="cursor-pointer"
                >
                  <template v-slot:append>
                    <q-icon name="account_tree" class="cursor-pointer" @click="showTreeDialog = true" />
                  </template>
                </q-input>
                <div class="text-xs text-negative" v-if="!CuentaPadre">Debes seleccionar una rama base</div>
              </div>

              <div class="q-mb-md">
                <q-input
                  type="text"
                  v-model="CodigoSufijo"
                  :prefix="codigoPrefijo"
                  placeholder="01"
                  outlined
                  label="Código Contable"
                  :disable="!CuentaPadre"
                  hint="Ingresa solo los últimos dígitos"
                />
              </div>

              <div class="q-mb-md">
                <q-input
                  type="text"
                  v-model="Nombre"
                  placeholder="Ej: Banco Agrícola"
                  label="Nombre de la Cuenta"
                  outlined
                  :rules="[val => !!val || 'El nombre es requerido']"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">

              <div class="q-mb-md">
                <q-input outlined v-model="Tipo" readonly hint="Heredado" label="Tipo de Cuenta" />
              </div>

              <div class="q-mb-md">
                <q-input outlined v-model="NaturalezaDisplay" readonly hint="Heredado" label="Naturaleza" />
              </div>

              <div class="q-mb-md">
                <q-select
                  v-model="Movimientos"
                  :options="opcionesMovimiento"
                  option-value="val"
                  option-label="label"
                  emit-value
                  label="¿Acepta Movimientos?"
                  map-options
                  outlined
                />
              </div>

              <div class="q-mb-md">
                <q-input
                  type="textarea"
                  v-model="Descripcion"
                  rows="3"
                  placeholder="Detalles adicionales..."
                  outlined
                />
              </div>
            </div>
          </div>

          <q-card-actions align="right" class="q-mt-md">
            <q-btn flat label="Limpiar" color="grey" @click="limpiarFormulario" />
            <q-btn label="Guardar Cuenta" @click="enviarDatos" color="primary" icon="save" :disable="!esFormularioValido" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showTreeDialog">
      <q-card style="min-width: 350px; height: 80vh" class="column">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">Seleccionar Rama Base</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="col overflow-auto">
          <q-input dense v-model="filterTree" placeholder="Buscar..." class="q-mb-md" outlined>
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-tree
            :nodes="treeData"
            node-key="id"
            label-key="label"
            :filter="filterTree"
            default-expand-all
            v-model:selected="selectedNodeKey"
            selected-color="primary"
            @update:selected="onNodeSelected"
            no-connectors
          >
            <template v-slot:default-header="prop">
              <div class="row items-center">
                <q-icon :name="prop.node.icon" class="q-mr-sm" :color="prop.node.iconColor" />
                <div class="text-weight-bold">{{ prop.node.codigo }}</div>
                <div class="q-ml-sm">{{ prop.node.label }}</div>
              </div>
            </template>
          </q-tree>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import { useQuasar, Notify } from 'quasar'

const $q = useQuasar()

const rawData = ref([])
const treeData = ref([])
const showTreeDialog = ref(false)
const filterTree = ref('')
const selectedNodeKey = ref(null)

const CuentaPadre = ref(null)
const Nombre = ref('')
const CodigoSufijo = ref('')
const Tipo = ref('')
const Naturaleza = ref('')
const Movimientos = ref(true)
const Descripcion = ref('')

const opcionesMovimiento = [
  { label: 'SÍ (Cuenta Transaccional)', val: true },
  { label: 'NO (Carpeta/Contenedor)', val: false }
]

const parentNameDisplay = computed(() => {
  return CuentaPadre.value ? `${CuentaPadre.value.codigo} - ${CuentaPadre.value.nombre}` : ''
})

const codigoPrefijo = computed(() => {
  return CuentaPadre.value ? CuentaPadre.value.codigo : ''
})

const CodigoFinal = computed(() => {
  return `${codigoPrefijo.value}${CodigoSufijo.value}`.trim()
})

const NaturalezaDisplay = computed(() => {
  if (!Naturaleza.value) return ''
  return Naturaleza.value === 'D' ? 'DEUDORA' : 'ACREEDORA'
})

const esFormularioValido = computed(() => {
  return CuentaPadre.value && Nombre.value && CodigoSufijo.value
})


const obtenerCuentas = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/contabilidad/obtener/cuentas_padre/')

    let data = response.data.map(c => c.cuenta ?? c)
    rawData.value = data

    const contenedores = data.filter(c => c.movimientos === false)

    treeData.value = buildTree(contenedores)

  } catch (error) {
    console.error("💥 Error obteniendo cuentas:", error)
    $q.notify({ type: 'negative', message: 'Error cargando datos' })
  }
}

const buildTree = (items, parentId = null) => {
  return items
    .filter(item => {
      if (parentId === null) {
        return item.cuenta_padre_id == null
      }

      return item.cuenta_padre_id == parentId
    })
    .map(item => ({
      id: item.id,
      label: item.nombre,
      codigo: item.codigo,
      tipo_cuenta: item.tipo,
      naturaleza: item.naturaleza,
      icon: item.cuenta_padre_id ? 'folder_open' : 'account_balance',
      iconColor: 'primary',
      children: buildTree(items, item.id)
    }))
}

const onNodeSelected = (key) => {
  if (!key) return

  const node = rawData.value.find(x => x.id === key)
  if (node) {
    CuentaPadre.value = node
    Tipo.value = node.tipo
    Naturaleza.value = node.naturaleza

    CodigoSufijo.value = ''

    showTreeDialog.value = false
  }
}

const enviarDatos = async () => {
  try {
    const existe = rawData.value.some(c => c.codigo === CodigoFinal.value)
    if (existe) {
      Notify.create({ type: 'warning', message: '¡Ese código ya existe en el sistema!' })
      return
    }

    const payload = [{
      nombre: Nombre.value,
      codigo: CodigoFinal.value,
      tipo_cuenta: Tipo.value,
      naturaleza: Naturaleza.value,
      descripcion: Descripcion.value,
      permite_movimientos: Movimientos.value,
      cuenta_padre_codigo: CuentaPadre.value.codigo,
    }]

    await axios.post('http://localhost:8000/api/contabilidad/cuentas/crear/', payload)

    Notify.create({ type: 'positive', message: 'Cuenta creada exitosamente' })
    limpiarFormulario()
    obtenerCuentas()
  } catch (error) {
    console.error(error)
    Notify.create({ type: 'negative', message: 'Error al guardar. Revisa la consola.' })
  }
}

const limpiarFormulario = () => {
  CuentaPadre.value = null
  Nombre.value = ''
  CodigoSufijo.value = ''
  Tipo.value = ''
  Naturaleza.value = ''
  Descripcion.value = ''
  Movimientos.value = true
  selectedNodeKey.value = null
}

onMounted(() => {
  obtenerCuentas()
})
</script>
